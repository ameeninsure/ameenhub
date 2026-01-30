/**
 * Notification Service
 * Central service for sending notifications to users and customers
 */

import { query } from '@/db';
import webpush from 'web-push';

// Configure web-push
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:admin@ameenhub.com',
    vapidPublicKey,
    vapidPrivateKey
  );
}

export interface NotificationRecipient {
  type: 'user' | 'customer';
  id: number;
}

export interface NotificationData {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  icon?: string;
  link?: string;
  senderId?: number;
}

/**
 * Send notification to one or multiple recipients
 */
export async function sendNotification(
  recipients: NotificationRecipient | NotificationRecipient[],
  data: NotificationData
): Promise<{ success: boolean; error?: string }> {
  try {
    const recipientList = Array.isArray(recipients) ? recipients : [recipients];
    
    if (recipientList.length === 0) {
      return { success: false, error: 'No recipients provided' };
    }

    const { title, message, type = 'info', icon, link, senderId } = data;

    // Insert notifications to database
    const values = recipientList.map((recipient) => {
      const escapedTitle = title.replace(/'/g, "''");
      const escapedMessage = message.replace(/'/g, "''");
      const escapedIcon = icon ? `'${icon.replace(/'/g, "''")}'` : 'NULL';
      const escapedLink = link ? `'${link.replace(/'/g, "''")}'` : 'NULL';
      const senderIdValue = senderId ? senderId : 'NULL';

      return `('${escapedTitle}', '${escapedMessage}', '${type}', ${escapedIcon}, ${escapedLink}, ${senderIdValue}, '${recipient.type}', ${recipient.id})`;
    }).join(',');

    await query(
      `INSERT INTO notifications (title, message, type, icon, link, sender_id, recipient_type, recipient_id)
       VALUES ${values}
       RETURNING id`
    );

    // Send push notifications for each recipient
    await Promise.all(
      recipientList.map((recipient) =>
        sendPushToRecipient(recipient.type, recipient.id, {
          title,
          body: message,
          icon,
          data: { url: link || '/panel' },
        })
      )
    );

    return { success: true };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, error: 'Failed to send notification' };
  }
}

/**
 * Send notification to all users
 */
export async function sendNotificationToAllUsers(
  data: NotificationData
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const result = await query('SELECT id FROM users WHERE is_active = TRUE');
    const recipients: NotificationRecipient[] = result.rows.map((row) => ({
      type: 'user',
      id: row.id,
    }));

    const sendResult = await sendNotification(recipients, data);
    return {
      success: sendResult.success,
      count: recipients.length,
      error: sendResult.error,
    };
  } catch (error) {
    console.error('Error sending notification to all users:', error);
    return { success: false, count: 0, error: 'Failed to send notifications' };
  }
}

/**
 * Send notification to all customers
 */
export async function sendNotificationToAllCustomers(
  data: NotificationData
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const result = await query('SELECT id FROM customers');
    const recipients: NotificationRecipient[] = result.rows.map((row) => ({
      type: 'customer',
      id: row.id,
    }));

    const sendResult = await sendNotification(recipients, data);
    return {
      success: sendResult.success,
      count: recipients.length,
      error: sendResult.error,
    };
  } catch (error) {
    console.error('Error sending notification to all customers:', error);
    return { success: false, count: 0, error: 'Failed to send notifications' };
  }
}

/**
 * Send push notification to specific recipient
 */
async function sendPushToRecipient(
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

    if (result.rows.length === 0) {
      return; // No active subscriptions
    }

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
    console.error('Error in sendPushToRecipient:', error);
  }
}

/**
 * Helper function to send notification to a single user
 */
export async function notifyUser(
  userId: number,
  data: NotificationData
): Promise<{ success: boolean; error?: string }> {
  return sendNotification({ type: 'user', id: userId }, data);
}

/**
 * Helper function to send notification to a single customer
 */
export async function notifyCustomer(
  customerId: number,
  data: NotificationData
): Promise<{ success: boolean; error?: string }> {
  return sendNotification({ type: 'customer', id: customerId }, data);
}

/**
 * Send push notification to specific recipient
 * This is a public wrapper for sendPushToRecipient
 */
export async function sendPushNotification(
  userType: 'user' | 'customer',
  userId: number,
  title: string,
  body: string,
  options?: {
    icon?: string;
    badge?: string;
    tag?: string;
    data?: any;
  }
): Promise<void> {
  await sendPushToRecipient(userType, userId, {
    title,
    body,
    icon: options?.icon || '/logo.png',
    badge: options?.badge || '/logo.png',
    ...options,
  });
}
