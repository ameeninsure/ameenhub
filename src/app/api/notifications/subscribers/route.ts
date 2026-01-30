import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/db';
import { verifyToken } from '@/lib/auth';

// GET: Get list of users/customers with notification subscriptions
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await verifyToken(token);
    // TODO: Add permission check for 'notifications.manage'

    const type = request.nextUrl.searchParams.get('type'); // 'user' or 'customer'

    if (type === 'user') {
      // Get users with subscriptions
      const result = await query(
        `SELECT DISTINCT u.id, u.code, u.full_name, u.email, u.position,
                COUNT(DISTINCT ns.id) as subscription_count,
                MAX(ns.updated_at) as last_subscription
         FROM users u
         INNER JOIN notification_subscriptions ns ON ns.user_type = 'user' AND ns.user_id = u.id
         WHERE ns.is_active = TRUE
         GROUP BY u.id, u.code, u.full_name, u.email, u.position
         ORDER BY u.full_name`
      );

      return NextResponse.json({
        success: true,
        data: result.rows,
      });
    } else if (type === 'customer') {
      // Get customers with subscriptions
      const result = await query(
        `SELECT DISTINCT c.id, c.code, c.first_name, c.last_name, 
                c.first_name || ' ' || c.last_name as full_name,
                c.email, c.phone,
                COUNT(DISTINCT ns.id) as subscription_count,
                MAX(ns.updated_at) as last_subscription
         FROM customers c
         INNER JOIN notification_subscriptions ns ON ns.user_type = 'customer' AND ns.user_id = c.id
         WHERE ns.is_active = TRUE
         GROUP BY c.id, c.code, c.first_name, c.last_name, c.email, c.phone
         ORDER BY c.first_name, c.last_name`
      );

      return NextResponse.json({
        success: true,
        data: result.rows,
      });
    } else {
      // Get all (both users and customers)
      const users = await query(
        `SELECT 'user' as type, u.id, u.code, u.full_name, u.email,
                COUNT(DISTINCT ns.id) as subscription_count
         FROM users u
         INNER JOIN notification_subscriptions ns ON ns.user_type = 'user' AND ns.user_id = u.id
         WHERE ns.is_active = TRUE
         GROUP BY u.id, u.code, u.full_name, u.email`
      );

      const customers = await query(
        `SELECT 'customer' as type, c.id, c.code,
                c.first_name || ' ' || c.last_name as full_name,
                c.email,
                COUNT(DISTINCT ns.id) as subscription_count
         FROM customers c
         INNER JOIN notification_subscriptions ns ON ns.user_type = 'customer' AND ns.user_id = c.id
         WHERE ns.is_active = TRUE
         GROUP BY c.id, c.code, c.first_name, c.last_name, c.email`
      );

      return NextResponse.json({
        success: true,
        data: {
          users: users.rows,
          customers: customers.rows,
        },
      });
    }
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}
