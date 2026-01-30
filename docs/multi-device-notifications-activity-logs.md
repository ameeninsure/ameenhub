# Multi-Device Push Notifications & Activity Logging System

## Overview
Complete professional system for managing user devices, push notifications across multiple devices, comprehensive activity logging, and security monitoring.

---

## 1. Database Schema

### Tables Created

#### `user_devices`
Stores all registered devices for each user with full device fingerprinting.

**Columns:**
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER, FK to users)
- `device_token` (TEXT) - Push notification token
- `device_type` (VARCHAR(50)) - desktop, mobile, tablet
- `device_name` (VARCHAR(200)) - User-friendly device name
- `browser` (VARCHAR(100))
- `browser_version` (VARCHAR(50))
- `os` (VARCHAR(100))
- `os_version` (VARCHAR(50))
- `device_model` (VARCHAR(200))
- `app_version` (VARCHAR(50))
- `ip_address` (VARCHAR(45)) - IPv4 or IPv6
- `country` (VARCHAR(100))
- `city` (VARCHAR(100))
- `is_active` (BOOLEAN)
- `last_used_at` (TIMESTAMP)
- `created_at`, `updated_at` (TIMESTAMP)

**Indexes:**
- user_id
- device_type
- is_active
- last_used_at
- Unique constraint on (user_id, device_name, browser, os)

#### `user_sessions`
Tracks active sessions for each device.

**Columns:**
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER, FK to users)
- `device_id` (INTEGER, FK to user_devices)
- `session_token` (TEXT UNIQUE)
- `ip_address` (VARCHAR(45))
- `user_agent` (TEXT)
- `browser` (VARCHAR(100))
- `os` (VARCHAR(100))
- `country` (VARCHAR(100))
- `city` (VARCHAR(100))
- `is_active` (BOOLEAN)
- `last_activity_at` (TIMESTAMP)
- `expires_at` (TIMESTAMP)
- `created_at`, `updated_at` (TIMESTAMP)

**Indexes:**
- user_id
- device_id
- session_token
- is_active
- last_activity_at

#### `user_activity_logs`
Comprehensive audit trail for all user actions.

**Columns:**
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER, FK to users)
- `action` (VARCHAR(100)) - login, create, update, delete, etc.
- `module` (VARCHAR(100)) - users, customers, orders, hr, insurance, etc.
- `entity_type` (VARCHAR(100)) - customer, order, employee, etc.
- `entity_id` (INTEGER) - ID of affected entity
- `method` (VARCHAR(10)) - GET, POST, PUT, DELETE
- `endpoint` (TEXT) - API endpoint called
- `status_code` (INTEGER) - HTTP status code
- `description` (TEXT) - English description
- `description_ar` (TEXT) - Arabic description
- `old_values` (JSONB) - Previous state
- `new_values` (JSONB) - New state
- `changes` (JSONB) - Calculated differences
- `metadata` (JSONB) - Additional data
- `ip_address` (VARCHAR(45))
- `user_agent` (TEXT)
- `browser` (VARCHAR(100))
- `os` (VARCHAR(100))
- `device_type` (VARCHAR(50))
- `country` (VARCHAR(100))
- `city` (VARCHAR(100))
- `referrer` (TEXT)
- `duration_ms` (INTEGER) - Request duration
- `is_suspicious` (BOOLEAN)
- `risk_level` (VARCHAR(20)) - low, medium, high, critical
- `created_at` (TIMESTAMP)

**Indexes:**
- user_id
- action
- module
- entity_type, entity_id (composite)
- created_at
- ip_address
- is_suspicious
- risk_level
- created_at with action
- user_id with created_at

#### `notification_subscriptions`
Stores push notification subscriptions linked to devices.

**Columns:**
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER, FK to users)
- `device_id` (INTEGER, FK to user_devices)
- `endpoint` (TEXT) - Push notification endpoint
- `p256dh` (TEXT) - Public key for encryption
- `auth` (TEXT) - Authentication secret
- `is_active` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)

**Indexes:**
- user_id
- device_id
- is_active
- Unique constraint on (user_id, endpoint)

---

## 2. Helper Functions

### `get_user_active_devices(p_user_id INTEGER)`
Returns all active devices for a user with full details.

**Returns:**
```sql
TABLE (
  device_id INT,
  device_name VARCHAR,
  device_type VARCHAR,
  browser VARCHAR,
  os VARCHAR,
  ip_address VARCHAR,
  country VARCHAR,
  city VARCHAR,
  last_used_at TIMESTAMP
)
```

### `get_user_activity_summary(p_user_id INTEGER, p_days INTEGER DEFAULT 30)`
Returns activity statistics for the last N days.

**Returns:**
```sql
TABLE (
  total_actions BIGINT,
  suspicious_actions BIGINT,
  high_risk_actions BIGINT,
  modules_used TEXT[],
  most_common_action VARCHAR
)
```

### `get_suspicious_activities(p_user_id INTEGER DEFAULT NULL, p_limit INTEGER DEFAULT 100)`
Returns suspicious activities for all users or a specific user.

**Returns:**
```sql
TABLE (
  user_id INT,
  action VARCHAR,
  module VARCHAR,
  description TEXT,
  risk_level VARCHAR,
  ip_address VARCHAR,
  created_at TIMESTAMP
)
```

### `cleanup_old_activity_logs(p_days INTEGER DEFAULT 365)`
Removes activity logs older than N days (default 365 days).

---

## 3. API Endpoints

### Device Management

#### `GET /api/users/[id]/devices`
Get all devices registered for a user.

**Response:**
```json
{
  "success": true,
  "devices": [
    {
      "id": 1,
      "device_type": "mobile",
      "device_name": "iPhone 14",
      "browser": "Safari",
      "browser_version": "16.0",
      "os": "iOS",
      "os_version": "16.0",
      "ip_address": "192.168.1.100",
      "country": "Oman",
      "city": "Muscat",
      "is_active": true,
      "last_used_at": "2026-01-29T10:30:00Z"
    }
  ]
}
```

#### `DELETE /api/users/[id]/devices?deviceId={deviceId}`
Remove a device registration.

**Response:**
```json
{
  "success": true,
  "message": "Device removed successfully"
}
```

### Activity Logs

#### `GET /api/users/[id]/activity`
Get activity logs for a user with filtering.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50)
- `action` - Filter by action type
- `module` - Filter by module
- `startDate` - Filter from date
- `endDate` - Filter to date

**Response:**
```json
{
  "success": true,
  "activities": [
    {
      "id": 1,
      "action": "update",
      "module": "customers",
      "entity_type": "customer",
      "entity_id": 123,
      "description": "Updated customer information",
      "description_ar": "تحديث معلومات العميل",
      "ip_address": "192.168.1.100",
      "browser": "Chrome",
      "os": "Windows",
      "device_type": "desktop",
      "country": "Oman",
      "city": "Muscat",
      "duration_ms": 120,
      "is_suspicious": false,
      "risk_level": "low",
      "created_at": "2026-01-29T10:30:00Z"
    }
  ],
  "summary": {
    "total_actions": 150,
    "suspicious_actions": 2,
    "high_risk_actions": 0
  },
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

### Session Management

#### `GET /api/users/[id]/sessions`
Get all active sessions for a user.

**Response:**
```json
{
  "success": true,
  "sessions": [
    {
      "id": 1,
      "session_token": "...",
      "device_id": 5,
      "device_name": "iPhone 14",
      "device_type": "mobile",
      "ip_address": "192.168.1.100",
      "browser": "Safari",
      "os": "iOS",
      "country": "Oman",
      "city": "Muscat",
      "is_active": true,
      "last_activity_at": "2026-01-29T10:30:00Z",
      "expires_at": "2026-02-05T10:30:00Z"
    }
  ]
}
```

#### `DELETE /api/users/[id]/sessions?sessionId={sessionId}`
Terminate a specific session.

**Response:**
```json
{
  "success": true,
  "message": "Session terminated successfully"
}
```

### Push Notification Subscription

#### `POST /api/notifications/subscribe`
Register device for push notifications.

**Request Body:**
```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  },
  "deviceInfo": {
    "deviceType": "mobile",
    "deviceName": "iPhone 14",
    "browser": "Safari",
    "browserVersion": "16.0",
    "os": "iOS",
    "osVersion": "16.0",
    "deviceModel": "iPhone 14"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully subscribed to push notifications"
}
```

---

## 4. Activity Logger Utility

### Usage

```typescript
import { logRequestActivity, calculateChanges, detectSuspiciousActivity } from '@/lib/activity';

// Log a user action
await logRequestActivity(
  request,
  'update',
  'customers',
  'Updated customer information',
  'تحديث معلومات العميل',
  {
    entityType: 'customer',
    entityId: 123,
    oldValues: { name: 'John Doe', phone: '12345' },
    newValues: { name: 'John Smith', phone: '12345' },
    changes: calculateChanges(oldValues, newValues),
    statusCode: 200,
    durationMs: 120,
  }
);
```

### Functions

#### `logActivity(data: ActivityLogData)`
Directly log an activity to the database.

#### `logRequestActivity(request, action, module, description, descriptionAr, options)`
Log activity from a Next.js request with automatic extraction of:
- User ID from auth token
- IP address from headers
- Browser/OS from user-agent
- Request method and endpoint

#### `calculateChanges(oldValues, newValues)`
Calculate the differences between old and new values.

**Returns:**
```javascript
{
  name: { old: 'John Doe', new: 'John Smith' },
  email: { old: 'old@email.com', new: 'new@email.com' }
}
```

#### `detectSuspiciousActivity(userId, action, ipAddress, metadata)`
Detect suspicious patterns and assign risk level.

**Returns:**
```javascript
{
  isSuspicious: true,
  riskLevel: 'high'
}
```

---

## 5. Multi-Device Push Notifications

### How It Works

1. **Device Registration:**
   - User enables push notifications in browser
   - Device information is captured and stored
   - Push subscription is linked to device

2. **Sending Notifications:**
   - System queries all active subscriptions for user
   - Notification is sent to ALL devices simultaneously
   - Invalid subscriptions are automatically deactivated

### Implementation in Notification Service

```typescript
// src/lib/notifications/service.ts
async function sendPushToRecipient(userType, userId, notification) {
  // Get ALL active subscriptions for user
  const result = await query(
    `SELECT ns.endpoint, ns.p256dh, ns.auth
     FROM notification_subscriptions ns
     WHERE ns.user_id = $1 AND ns.is_active = TRUE`,
    [userId]
  );

  // Send to all devices
  const promises = result.rows.map(async (sub) => {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth }
      },
      payload
    );
  });

  await Promise.all(promises);
}
```

---

## 6. User Detail Page

### Location
`/panel/users/[id]`

### Features

#### Tabs:
1. **Overview** - User information and statistics
2. **Devices** - All registered devices with remove capability
3. **Activity Logs** - Comprehensive action history with filtering
4. **Sessions** - Active sessions with terminate option

#### Device Display:
- Device icon (desktop/mobile/tablet)
- Device name
- Browser and version
- Operating system and version
- IP address
- Location (city, country)
- Last used timestamp
- Remove button

#### Activity Logs:
- **Filters:**
  - Search by action or description
  - Filter by action type (login, create, update, delete)
  - Filter by module (users, customers, orders, hr, insurance)
  - Date range filter
  - Export button

- **Display:**
  - Timestamp
  - Action badge
  - Module
  - Description (bilingual)
  - Location with IP
  - Risk level badge
  - Suspicious flag

#### Sessions:
- Session information
- Device details
- IP and location
- Last activity
- Expiration time
- Terminate button for active sessions

---

## 7. Security Features

### Suspicious Activity Detection

Automatic detection based on:
- **Multiple failed login attempts** → High/Critical risk
- **Data deletion operations** → Medium risk
- **Permission/role changes** → Medium risk
- **Unusual IP addresses** → Medium risk
- **Rapid successive actions** → Medium risk

### Risk Levels

- **Low** - Normal activity
- **Medium** - Sensitive operations
- **High** - Multiple failures or unusual patterns
- **Critical** - Severe security threats

### Monitoring

Use helper functions to monitor security:

```sql
-- Get all suspicious activities
SELECT * FROM get_suspicious_activities(NULL, 100);

-- Get user activity summary
SELECT * FROM get_user_activity_summary(user_id, 30);

-- Get active devices
SELECT * FROM get_user_active_devices(user_id);
```

---

## 8. Data Retention

### Automatic Cleanup

Run cleanup function periodically (e.g., weekly):

```sql
-- Remove logs older than 1 year
SELECT cleanup_old_activity_logs(365);

-- Remove logs older than 2 years
SELECT cleanup_old_activity_logs(730);
```

### Manual Cleanup

```sql
-- Delete old activity logs
DELETE FROM user_activity_logs 
WHERE created_at < NOW() - INTERVAL '1 year';

-- Delete inactive devices
DELETE FROM user_devices 
WHERE is_active = false 
AND last_used_at < NOW() - INTERVAL '6 months';
```

---

## 9. Integration Examples

### Example 1: Log Customer Update

```typescript
// In your API route
import { logRequestActivity, calculateChanges } from '@/lib/activity';

export async function PUT(request: NextRequest) {
  const startTime = Date.now();
  
  // Get old values
  const oldCustomer = await getCustomer(id);
  
  // Update customer
  const newCustomer = await updateCustomer(id, data);
  
  // Calculate duration
  const durationMs = Date.now() - startTime;
  
  // Log the activity
  await logRequestActivity(
    request,
    'update',
    'customers',
    `Updated customer ${newCustomer.name}`,
    `تحديث العميل ${newCustomer.name}`,
    {
      entityType: 'customer',
      entityId: id,
      oldValues: oldCustomer,
      newValues: newCustomer,
      changes: calculateChanges(oldCustomer, newCustomer),
      statusCode: 200,
      durationMs,
    }
  );
  
  return NextResponse.json({ success: true });
}
```

### Example 2: Log Failed Login

```typescript
import { logRequestActivity, detectSuspiciousActivity } from '@/lib/activity';

// After failed login
const { isSuspicious, riskLevel } = detectSuspiciousActivity(
  userId,
  'login_failed',
  ipAddress,
  { failedAttempts: attempts }
);

await logRequestActivity(
  request,
  'login_failed',
  'auth',
  `Failed login attempt for ${email}`,
  `محاولة تسجيل دخول فاشلة لـ ${email}`,
  {
    statusCode: 401,
    isSuspicious,
    riskLevel,
    metadata: { email, failedAttempts: attempts },
  }
);
```

### Example 3: Send Notification to All Devices

```typescript
import { notifyUser } from '@/lib/notifications';

// Send notification to all user's devices
await notifyUser(userId, {
  title: 'New Message',
  message: 'You have a new message',
  type: 'info',
  link: '/panel/messages',
});
```

---

## 10. Best Practices

### Activity Logging
- ✅ Log all sensitive operations (create, update, delete)
- ✅ Log authentication events (login, logout, failed attempts)
- ✅ Log permission changes
- ✅ Include old and new values for updates
- ✅ Calculate and store changes for easy auditing
- ✅ Include request duration for performance monitoring
- ❌ Don't log sensitive data (passwords, tokens) in plain text
- ❌ Don't log every GET request (unless needed for audit)

### Device Management
- ✅ Require user confirmation before removing devices
- ✅ Auto-deactivate devices not used for 90+ days
- ✅ Allow users to name their devices
- ✅ Show last used timestamp
- ❌ Don't allow users to remove all devices (keep at least one)

### Push Notifications
- ✅ Send to all active devices simultaneously
- ✅ Auto-deactivate invalid subscriptions (410, 404 errors)
- ✅ Include relevant data in notification payload
- ✅ Test notifications before bulk sending
- ❌ Don't spam users with too many notifications
- ❌ Don't send sensitive data in notification body

### Security
- ✅ Monitor suspicious activities daily
- ✅ Alert administrators on critical risk activities
- ✅ Implement rate limiting for sensitive operations
- ✅ Review high-risk actions weekly
- ✅ Investigate unusual IP address patterns
- ❌ Don't ignore suspicious activity flags

---

## 11. Troubleshooting

### Issue: Devices not appearing
**Solution:** Check that device registration is called when subscribing to push notifications.

### Issue: Notifications not received
**Solution:** 
1. Verify VAPID keys are configured
2. Check subscription is active
3. Test notification manually
4. Check browser console for errors

### Issue: Activity logs missing
**Solution:** 
1. Ensure `logRequestActivity` is called in API routes
2. Check database connection
3. Verify user is authenticated

### Issue: Suspicious activities not detected
**Solution:** Update detection rules in `detectSuspiciousActivity` function.

---

## 12. Future Enhancements

- [ ] Real-time activity dashboard
- [ ] Email alerts for suspicious activities
- [ ] Advanced ML-based anomaly detection
- [ ] Geolocation-based access control
- [ ] Two-factor authentication for suspicious IPs
- [ ] User activity reports (PDF/Excel export)
- [ ] Device trust levels (trusted/untrusted)
- [ ] Automatic session termination on suspicious activity
- [ ] Activity replay for debugging
- [ ] Integration with external SIEM systems

---

## Summary

This system provides:
- ✅ **Multi-device support** - Users can receive notifications on all devices
- ✅ **Comprehensive logging** - Every action tracked with full details
- ✅ **Security monitoring** - Automatic detection of suspicious activities
- ✅ **Professional UI** - Beautiful user detail page with tabs
- ✅ **Flexible querying** - Helper functions for common queries
- ✅ **Performance tracking** - Request duration monitoring
- ✅ **Bilingual support** - English and Arabic descriptions
- ✅ **JSONB storage** - Flexible data storage for audit trail
- ✅ **Automatic cleanup** - Data retention management
