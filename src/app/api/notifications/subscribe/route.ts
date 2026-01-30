import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/db';
import { verifyToken } from '@/lib/auth';
import webpush from 'web-push';

// Configure web-push (VAPID keys should be generated and stored in env)
// Generate keys with: npx web-push generate-vapid-keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:admin@ameenhub.com',
    vapidPublicKey,
    vapidPrivateKey
  );
}

// GET: Get subscription status
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

    const result = await query(
      `SELECT id, endpoint, is_active, created_at 
       FROM notification_subscriptions
       WHERE user_type = $1 AND user_id = $2 AND is_active = TRUE`,
      [userType, userId]
    );

    return NextResponse.json({
      success: true,
      data: {
        subscribed: result.rows.length > 0,
        subscriptions: result.rows,
        vapidPublicKey: vapidPublicKey,
      },
    });
  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription' },
      { status: 500 }
    );
  }
}

// POST: Subscribe to push notifications
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
    const userId = payload.userId;
    const userType = payload.role === 'customer' ? 'customer' : 'user';

    const body = await request.json();
    const { subscription } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    const { endpoint, keys } = subscription;
    const userAgent = request.headers.get('user-agent') || '';

    // Insert or update subscription
    await query(
      `INSERT INTO notification_subscriptions (user_type, user_id, endpoint, keys, user_agent, is_active)
       VALUES ($1, $2, $3, $4, $5, TRUE)
       ON CONFLICT (endpoint) 
       DO UPDATE SET 
         user_type = EXCLUDED.user_type,
         user_id = EXCLUDED.user_id,
         keys = EXCLUDED.keys,
         user_agent = EXCLUDED.user_agent,
         is_active = TRUE,
         updated_at = CURRENT_TIMESTAMP`,
      [userType, userId, endpoint, JSON.stringify(keys), userAgent]
    );

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to notifications',
    });
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}

// DELETE: Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
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
    const { endpoint } = body;

    if (endpoint) {
      // Unsubscribe specific endpoint
      await query(
        `UPDATE notification_subscriptions 
         SET is_active = FALSE 
         WHERE endpoint = $1`,
        [endpoint]
      );
    } else {
      // Unsubscribe all user's subscriptions
      await query(
        `UPDATE notification_subscriptions 
         SET is_active = FALSE 
         WHERE user_type = $1 AND user_id = $2`,
        [userType, userId]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed',
    });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}

// Helper function to send push notification
export async function sendPushNotification(
  userType: string,
  userId: number,
  notification: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    data?: any;
  }
) {
  try {
    // Get active subscriptions for user
    const result = await query(
      `SELECT endpoint, keys 
       FROM notification_subscriptions
       WHERE user_type = $1 AND user_id = $2 AND is_active = TRUE`,
      [userType, userId]
    );

    const payload = JSON.stringify(notification);

    // Send to all subscriptions
    const promises = result.rows.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          payload
        );
      } catch (error: any) {
        // If subscription is no longer valid, deactivate it
        if (error.statusCode === 410 || error.statusCode === 404) {
          await query(
            `UPDATE notification_subscriptions 
             SET is_active = FALSE 
             WHERE endpoint = $1`,
            [sub.endpoint]
          );
        }
        console.error('Error sending push notification:', error);
      }
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('Error in sendPushNotification:', error);
  }
}
