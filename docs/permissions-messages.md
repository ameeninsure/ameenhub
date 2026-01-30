# Messages Permissions Update

## Overview

This document describes the new permissions added for the Messages module and how to activate them.

## New Permissions Added

### Core Permissions

- ✅ **messages.view** - Access to messages page and history
- ✅ **messages.send** - General permission to send messages
- ✅ **messages.send_to_users** - Send messages to system users
- ✅ **messages.send_to_customers** - Send messages to customers
- ✅ **messages.send_broadcast** - Send messages to multiple recipients
- ✅ **messages.view_history** - View sent messages history
- ✅ **messages.delete** - Delete sent messages

### Menu Permission

- ✅ **menu.messages** - Display messages menu in Sidebar (already existed)

## Modified Files

### `src/lib/permissions/registry.ts`
- Expanded messages permissions from 2 to 7 comprehensive permissions
- Added `messages.view` for page access
- Added `messages.send` for general sending capability

### `src/app/panel/messages/page.tsx`
- Changed permission check from `messages.send` to `messages.view` for page access

### `src/app/api/notifications/route.ts`
- Added comprehensive permission checks in API endpoint
- Automatic validation based on recipient types (users/customers)
- Broadcast permission check for multi-recipient messages
- Fixed TypeScript issues with null checking

### `src/app/panel/permissions/page.tsx`
- Added "Sync Permissions" button directly in the permissions page
- One-click sync functionality with success/error feedback

### `db/init/002_users_roles_permissions.sql`
- Fixed `register_permission()` function to avoid ambiguous column reference

## How to Activate

### Step 1: Sync New Permissions

Go to the **Permissions** page (`/panel/permissions`) and click the **"Sync Permissions"** button at the top right.

The system will:
- Register all 7 new message permissions in the database
- Automatically grant them to the `super_admin` role
- Display a success message when complete

### Step 2: Assign Permissions to Roles

After syncing, assign the new permissions to roles:

1. Go to the **Roles** page
2. Edit the desired role
3. Select the message permissions you want to grant:
   - `messages.view` - For page access
   - `messages.send` - For sending capability
   - `messages.send_to_users` - For sending to users
   - `messages.send_to_customers` - For sending to customers
   - `messages.send_broadcast` - For group messaging
   - etc.
4. Save the changes

### Step 3: Test

1. Login with a user who has the appropriate role
2. Navigate to Messages page (should appear in menu)
3. Try sending a message
4. Verify that permission restrictions work correctly

## Access Structure

### Common Scenarios

#### 1. Support Team - Customer Messages Only
```
✅ messages.view
✅ messages.send
✅ messages.send_to_customers
❌ messages.send_to_users
❌ messages.send_broadcast
```

#### 2. Team Manager - Internal Communication
```
✅ messages.view
✅ messages.send
✅ messages.send_to_users
✅ messages.send_broadcast
❌ messages.send_to_customers
```

#### 3. Senior Admin - Full Access
```
✅ messages.view
✅ messages.send
✅ messages.send_to_users
✅ messages.send_to_customers
✅ messages.send_broadcast
✅ messages.view_history
✅ messages.delete
```

## Important Notes

1. **Combined Permissions**: To send messages, users need both `messages.send` AND a target-specific permission (`send_to_users` or `send_to_customers`).

2. **Broadcast**: Sending to more than one recipient requires the `messages.send_broadcast` permission.

3. **API Validation**: The API automatically checks recipient types and validates the appropriate permissions.

4. **Menu Visibility**: The `menu.messages` permission controls whether the Messages menu appears in the Sidebar (this permission already existed).

## Troubleshooting

### Issue: New permissions don't appear in the list
**Solution**: Make sure you've clicked the "Sync Permissions" button on the Permissions page.

### Issue: 403 error when sending messages
**Solution**: Verify the user has all required permissions (both `messages.send` AND the target-specific permission).

### Issue: Messages menu doesn't appear
**Solution**: Add the `menu.messages` permission to the user's role.

## Useful Queries

### Check User Permissions
```sql
SELECT p.code, p.name_en, p.name_ar 
FROM permissions p
JOIN user_permissions up ON p.id = up.permission_id
WHERE up.user_id = YOUR_USER_ID AND p.code LIKE 'messages.%';
```

### Check Role Permissions
```sql
SELECT p.code, p.name_en, p.name_ar 
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
WHERE rp.role_id = YOUR_ROLE_ID AND p.code LIKE 'messages.%';
```

## Technical Details

### Database Function Fix

The `register_permission()` function was updated to fix an ambiguous column reference error:

**Before:**
```sql
DECLARE
    permission_id INTEGER;
```

**After:**
```sql
DECLARE
    v_permission_id INTEGER;
```

This prevents conflicts with the `permission_id` column in the `role_permissions` table.

---

**Last Updated**: 2026-01-30  
**Version**: 1.0.0
