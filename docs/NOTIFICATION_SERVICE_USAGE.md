# Notification Service Usage

## Practical Examples

### 1. Send Notification to User

```typescript
import { notifyUser } from '@/lib/notifications';

// In API route or server action
async function createOrder(userId: number, orderData: any) {
  // Create order...
  
  // Send notification
  await notifyUser(userId, {
    title: 'New Order',
    message: 'Your order has been successfully placed',
    type: 'success',
    link: `/panel/orders/${orderId}`,
  });
}
```

### 2. Send Notification to Customer

```typescript
import { notifyCustomer } from '@/lib/notifications';

// When order status changes
async function updateOrderStatus(customerId: number, orderId: number, status: string) {
  // Update status...
  
  await notifyCustomer(customerId, {
    title: 'Order Update',
    message: `Your order status changed to "${status}"`,
    type: 'info',
    link: `/portal/orders/${orderId}`,
  });
}
```

### 3. Send to Multiple Recipients

```typescript
import { sendNotification } from '@/lib/notifications';

// Send to team
async function notifyTeam(message: string) {
  const teamMembers = [
    { type: 'user', id: 1 },
    { type: 'user', id: 2 },
    { type: 'user', id: 5 },
  ];

  await sendNotification(teamMembers, {
    title: 'Team Message',
    message: message,
    type: 'info',
  });
}
```

### 4. Send to All Users

```typescript
import { sendNotificationToAllUsers } from '@/lib/notifications';

// System announcement
async function sendSystemAnnouncement() {
  await sendNotificationToAllUsers({
    title: 'System Maintenance',
    message: 'System will be unavailable tomorrow from 2 AM to 4 AM',
    type: 'warning',
  });
}
```

### 5. Usage in API Route

```typescript
// src/app/api/orders/[id]/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { notifyCustomer } from '@/lib/notifications';
import { query } from '@/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id);
    
    // Approve order
    const result = await query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING customer_id',
      ['approved', orderId]
    );
    
    const customerId = result.rows[0].customer_id;
    
    // Send notification
    await notifyCustomer(customerId, {
      title: 'Order Approved',
      message: 'Your order has been reviewed and approved by our team',
      type: 'success',
      link: `/portal/orders/${orderId}`,
      senderId: 1, // Admin ID
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

### 6. Usage in Server Action

```typescript
'use server';

import { notifyUser, notifyCustomer } from '@/lib/notifications';

export async function assignTask(userId: number, taskId: number, taskName: string) {
  // Assign task...
  
  await notifyUser(userId, {
    title: 'New Task',
    message: `Task "${taskName}" has been assigned to you`,
    type: 'info',
    link: `/panel/tasks/${taskId}`,
  });
}

export async function completeTask(taskId: number, customerId: number) {
  // Complete task...
  
  await notifyCustomer(customerId, {
    title: 'Task Completed',
    message: 'Your request has been successfully completed',
    type: 'success',
  });
}
```

## Important Notes

1. **Performance**: Notification sending is async and shouldn't be awaited unnecessarily
2. **Error Handling**: Always check the result
3. **Push Notifications**: Automatically sent if user is subscribed
4. **Database**: Notifications are stored in database
5. **Types**: Use TypeScript for type safety

## Types

```typescript
interface NotificationRecipient {
  type: 'user' | 'customer';
  id: number;
}

interface NotificationData {
  title: string;          // Title (required)
  message: string;        // Message text (required)
  type?: 'info' | 'success' | 'warning' | 'error';  // Type (default: info)
  icon?: string;          // Icon URL (optional)
  link?: string;          // Link (optional)
  senderId?: number;      // Sender ID (optional)
}
```
