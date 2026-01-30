# Notification System - User Guide

## Initial Setup

### 1. Generate VAPID Keys

To use push notifications, first generate VAPID keys:

```bash
npx web-push generate-vapid-keys
```

Add the output to your `.env.local` file:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
```

### 2. Run Database Migration

The SQL file for notification tables is located at:
- `db/init/004_notifications.sql`

If using Docker, this migration runs automatically. Otherwise:

```bash
psql -U postgres -d ameenhub -f db/init/004_notifications.sql
```

### 3. Setup Service Worker

The service worker file is located at `/public/sw.js` and is automatically registered by the system.

## System Architecture

### API Endpoints

#### 1. Notification Management (`/api/notifications`)

**GET**: Retrieve user's notifications list
```typescript
// Query params:
// - page: number (default: 1)
// - limit: number (default: 20)
// - unread_only: boolean

fetch('/api/notifications?page=1&limit=20')
```

**POST**: Send new notification
```typescript
fetch('/api/notifications', {
  method: 'POST',
  body: JSON.stringify({
    title: 'Title',
    message: 'Message text',
    type: 'info', // info | success | warning | error
    link: '/panel/orders',
    recipients: [
      { type: 'user', id: 1 },
      { type: 'customer', id: 2 }
    ]
  })
})
```

**PATCH**: Mark as read
```typescript
// Mark specific notifications
fetch('/api/notifications', {
  method: 'PATCH',
  body: JSON.stringify({
    notification_ids: [1, 2, 3]
  })
})

// Mark all as read
fetch('/api/notifications', {
  method: 'PATCH',
  body: JSON.stringify({
    mark_all: true
  })
})
```

#### 2. Push Subscription Management (`/api/notifications/subscribe`)

**GET**: Check subscription status
```typescript
fetch('/api/notifications/subscribe')
```

**POST**: Register push notification subscription
```typescript
const subscription = await registration.pushManager.subscribe({...});
fetch('/api/notifications/subscribe', {
  method: 'POST',
  body: JSON.stringify({ subscription })
})
```

**DELETE**: Unsubscribe
```typescript
fetch('/api/notifications/subscribe', {
  method: 'DELETE',
  body: JSON.stringify({ endpoint: '...' })
})
```

#### 3. Subscribers List (`/api/notifications/subscribers`)

**GET**: Get list of users/customers with active subscriptions
```typescript
// All
fetch('/api/notifications/subscribers')

// Users only
fetch('/api/notifications/subscribers?type=user')

// Customers only
fetch('/api/notifications/subscribers?type=customer')
```

## Usage in Components

### Using Context

```typescript
import { useNotifications } from '@/lib/notifications';

function MyComponent() {
  const {
    notifications,
    unreadCount,
    loading,
    hasPermission,
    isPushEnabled,
    requestPermission,
    subscribeToPush,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Request permission
  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      await subscribeToPush();
    }
  };

  return (
    <div>
      <p>Unread messages: {unreadCount}</p>
      {!isPushEnabled && (
        <button onClick={handleEnableNotifications}>
          Enable Notifications
        </button>
      )}
    </div>
  );
}
```

### Ready-to-Use Components

#### NotificationBell
Display bell icon with unread message count

```typescript
import NotificationBell from '@/components/panel/NotificationBell';

<NotificationBell />
```

#### NotificationPermissionPrompt
Automatic permission request from user (placed in layout)

```typescript
import NotificationPermissionPrompt from '@/components/NotificationPermissionPrompt';

<NotificationPermissionPrompt />
```

## Pages

### 1. Inbox (`/panel/notifications`)
Display all received notifications

### 2. Send Notification (`/panel/notifications/send`)
Admin page to send notifications to users/customers (requires permission: `notifications.manage`)

## Sending Notifications from Server

```typescript
import { sendPushNotification } from '@/app/api/notifications/subscribe/route';

// Send push notification
await sendPushNotification(
  'user', // or 'customer'
  userId,
  {
    title: 'Title',
    body: 'Message text',
    icon: '/icon.png',
    data: {
      url: '/panel/orders/123'
    }
  }
);
```

## Database Tables

### notifications
- `id`: Unique identifier
- `title`: Notification title
- `message`: Message text
- `type`: Type (info, success, warning, error)
- `recipient_type`: Recipient type (user, customer)
- `recipient_id`: Recipient identifier
- `is_read`: Read status
- `created_at`: Creation time

### notification_subscriptions
- `id`: Unique identifier
- `user_type`: User type (user, customer)
- `user_id`: User identifier
- `endpoint`: Push endpoint URL
- `keys`: Encryption keys (p256dh, auth)
- `is_active`: Active status

## Important Notes

1. **VAPID Keys**: Always generate and configure VAPID keys before using push notifications
2. **HTTPS**: Push notifications only work over HTTPS (works on localhost in development)
3. **Service Worker**: Ensure `/public/sw.js` file is accessible
4. **Permissions**: To send notifications from admin page, must have `notifications.manage` permission
5. **Browser Support**: Not all browsers support push notifications (iOS Safari has limitations)

## Complete Example

```typescript
// In a page or component
"use client";

import { useNotifications } from '@/lib/notifications';
import { useEffect } from 'react';

export default function MyPage() {
  const {
    notifications,
    unreadCount,
    isPushEnabled,
    subscribeToPush,
    markAsRead,
  } = useNotifications();

  useEffect(() => {
    // Auto-enable push (optional)
    if (!isPushEnabled) {
      subscribeToPush();
    }
  }, [isPushEnabled]);

  return (
    <div>
      <h1>My Messages ({unreadCount} unread)</h1>
      
      {notifications.map(notif => (
        <div
          key={notif.id}
          onClick={() => !notif.is_read && markAsRead([notif.id])}
          style={{
            opacity: notif.is_read ? 0.6 : 1,
            cursor: 'pointer'
          }}
        >
          <h3>{notif.title}</h3>
          <p>{notif.message}</p>
          <small>{new Date(notif.created_at).toLocaleString('en-US')}</small>
        </div>
      ))}
    </div>
  );
}
```
