import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/db';
import { verifyToken } from '@/lib/auth';
import { userHasPermission } from '@/lib/permissions/queries';

// GET: Get notifications for current user
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const userId = payload.userId;
    const userType = payload.role === 'customer' ? 'customer' : 'user';

    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20');
    const unreadOnly = request.nextUrl.searchParams.get('unread_only') === 'true';
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE recipient_type = $1 AND recipient_id = $2';
    let params: any[] = [userType, userId];
    
    if (unreadOnly) {
      whereClause += ' AND is_read = FALSE';
    }

    // Get notifications
    const notifications = await query(
      `SELECT n.*, u.full_name as sender_name
       FROM notifications n
       LEFT JOIN users u ON n.sender_id = u.id
       ${whereClause}
       ORDER BY n.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM notifications ${whereClause}`,
      params
    );

    // Get unread count
    const unreadResult = await query(
      `SELECT COUNT(*) as unread 
       FROM notifications 
       WHERE recipient_type = $1 AND recipient_id = $2 AND is_read = FALSE`,
      [userType, userId]
    );

    return NextResponse.json({
      success: true,
      data: {
        notifications: notifications.rows,
        pagination: {
          page,
          limit,
          total: parseInt(countResult.rows[0].total),
          totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit),
        },
        unreadCount: parseInt(unreadResult.rows[0].unread),
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST: Create/send a notification
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const senderId = payload.userId;

    const body = await request.json();
    const { title, message, type = 'info', icon, link, recipients } = body;

    if (!title || !message || !recipients || !Array.isArray(recipients)) {
      return NextResponse.json(
        { error: 'Title, message, and recipients are required' },
        { status: 400 }
      );
    }

    // Check permissions based on recipient types
    const hasUsers = recipients.some((r: any) => r.type === 'user');
    const hasCustomers = recipients.some((r: any) => r.type === 'customer');
    const isBroadcast = recipients.length > 1;

    // Check broadcast permission if sending to multiple recipients
    if (isBroadcast) {
      const hasBroadcastPermission = await userHasPermission(senderId, 'messages.send_broadcast');
      if (!hasBroadcastPermission) {
        return NextResponse.json(
          { error: 'Permission denied: broadcast messages require messages.send_broadcast permission' },
          { status: 403 }
        );
      }
    }

    // Check user-specific permission
    if (hasUsers) {
      const hasUserPermission = await userHasPermission(senderId, 'messages.send_to_users');
      if (!hasUserPermission) {
        return NextResponse.json(
          { error: 'Permission denied: sending to users requires messages.send_to_users permission' },
          { status: 403 }
        );
      }
    }

    // Check customer-specific permission
    if (hasCustomers) {
      const hasCustomerPermission = await userHasPermission(senderId, 'messages.send_to_customers');
      if (!hasCustomerPermission) {
        return NextResponse.json(
          { error: 'Permission denied: sending to customers requires messages.send_to_customers permission' },
          { status: 403 }
        );
      }
    }

    // General send permission check
    const hasSendPermission = await userHasPermission(senderId, 'messages.send');
    if (!hasSendPermission) {
      return NextResponse.json(
        { error: 'Permission denied: messages.send permission required' },
        { status: 403 }
      );
    }

    // Insert notifications for all recipients
    const values = recipients.map((recipient: any) => 
      `('${title.replace(/'/g, "''")}', '${message.replace(/'/g, "''")}', '${type}', ${icon ? `'${icon}'` : 'NULL'}, ${link ? `'${link}'` : 'NULL'}, ${senderId}, '${recipient.type}', ${recipient.id})`
    ).join(',');

    const result = await query(
      `INSERT INTO notifications (title, message, type, icon, link, sender_id, recipient_type, recipient_id)
       VALUES ${values}
       RETURNING id`
    );

    // Send push notifications to subscribed users
    try {
      const { sendPushNotification } = await import('@/lib/notifications/service');
      
      for (const recipient of recipients) {
        await sendPushNotification(
          recipient.type,
          recipient.id,
          title,
          message,
          {
            tag: `notification-${result.rows[0]?.id}`,
            data: { link, type }
          }
        );
      }
    } catch (pushError) {
      console.error('Error sending push notifications:', pushError);
      // Don't fail the entire request if push fails
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications sent successfully',
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// PATCH: Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const userId = payload.userId;
    const userType = payload.role === 'customer' ? 'customer' : 'user';

    const body = await request.json();
    const { notification_ids, mark_all } = body;

    if (mark_all) {
      // Mark all as read
      await query(
        `UPDATE notifications 
         SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
         WHERE recipient_type = $1 AND recipient_id = $2 AND is_read = FALSE`,
        [userType, userId]
      );
    } else if (notification_ids && Array.isArray(notification_ids)) {
      // Mark specific notifications as read
      await query(
        `UPDATE notifications 
         SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
         WHERE id = ANY($1) AND recipient_type = $2 AND recipient_id = $3`,
        [notification_ids, userType, userId]
      );
    } else {
      return NextResponse.json(
        { error: 'notification_ids or mark_all is required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications marked as read',
    });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}
