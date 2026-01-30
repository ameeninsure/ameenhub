/**
 * Permission Registry System
 * 
 * This system allows automatic registration of permissions when new features are added.
 * Permissions can be registered for pages, API endpoints, buttons, menu items, etc.
 * 
 * Usage:
 * 1. Import the registry
 * 2. Register your permission using registerPermission()
 * 3. The permission will be automatically available in the admin panel
 */

import { query } from "@/db";

// Permission categories
export type PermissionCategory = 'page' | 'api' | 'button' | 'menu' | 'feature';

// Permission definition
export interface PermissionDefinition {
  code: string;
  module: string;
  category: PermissionCategory;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  isSystem?: boolean;
}

// In-memory registry for permissions (used for auto-registration)
const permissionRegistry: Map<string, PermissionDefinition> = new Map();

/**
 * Register a permission in the local registry
 * This will be synced to the database on server startup
 */
export function definePermission(permission: PermissionDefinition): string {
  permissionRegistry.set(permission.code, permission);
  return permission.code;
}

/**
 * Get all registered permissions
 */
export function getRegisteredPermissions(): PermissionDefinition[] {
  return Array.from(permissionRegistry.values());
}

/**
 * Sync all registered permissions to the database
 * This should be called on server startup
 */
export async function syncPermissionsToDatabase(): Promise<void> {
  const permissions = getRegisteredPermissions();
  
  for (const permission of permissions) {
    await query(
      `SELECT register_permission($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        permission.code,
        permission.module,
        permission.category,
        permission.nameEn,
        permission.nameAr,
        permission.descriptionEn || null,
        permission.descriptionAr || null,
        permission.isSystem || false,
      ]
    );
  }
  
  console.log(`Synced ${permissions.length} permissions to database`);
}

/**
 * Register a permission directly to the database
 * Use this for dynamic permission registration
 */
export async function registerPermissionToDatabase(
  permission: PermissionDefinition
): Promise<number> {
  const result = await query<{ register_permission: number }>(
    `SELECT register_permission($1, $2, $3, $4, $5, $6, $7, $8) as id`,
    [
      permission.code,
      permission.module,
      permission.category,
      permission.nameEn,
      permission.nameAr,
      permission.descriptionEn || null,
      permission.descriptionAr || null,
      permission.isSystem || false,
    ]
  );
  
  return result.rows[0].register_permission;
}

// ============================================================================
// Pre-defined System Permissions
// These are automatically registered
// ============================================================================

// User Management Permissions
definePermission({
  code: 'users.view',
  module: 'users',
  category: 'page',
  nameEn: 'View Users',
  nameAr: 'عرض المستخدمين',
  descriptionEn: 'Can view users list',
  descriptionAr: 'يمكن عرض قائمة المستخدمين',
  isSystem: true,
});

definePermission({
  code: 'users.create',
  module: 'users',
  category: 'api',
  nameEn: 'Create Users',
  nameAr: 'إنشاء مستخدمين',
  descriptionEn: 'Can create new users',
  descriptionAr: 'يمكن إنشاء مستخدمين جدد',
  isSystem: true,
});

definePermission({
  code: 'users.edit',
  module: 'users',
  category: 'api',
  nameEn: 'Edit Users',
  nameAr: 'تعديل المستخدمين',
  descriptionEn: 'Can edit existing users',
  descriptionAr: 'يمكن تعديل المستخدمين',
  isSystem: true,
});

definePermission({
  code: 'users.delete',
  module: 'users',
  category: 'api',
  nameEn: 'Delete Users',
  nameAr: 'حذف المستخدمين',
  descriptionEn: 'Can delete users',
  descriptionAr: 'يمكن حذف المستخدمين',
  isSystem: true,
});

definePermission({
  code: 'users.manage_roles',
  module: 'users',
  category: 'api',
  nameEn: 'Manage User Roles',
  nameAr: 'إدارة أدوار المستخدمين',
  descriptionEn: 'Can assign/remove roles from users',
  descriptionAr: 'يمكن تعيين/إزالة الأدوار من المستخدمين',
  isSystem: true,
});

definePermission({
  code: 'users.manage_permissions',
  module: 'users',
  category: 'api',
  nameEn: 'Manage User Permissions',
  nameAr: 'إدارة صلاحيات المستخدمين',
  descriptionEn: 'Can assign direct permissions to users',
  descriptionAr: 'يمكن تعيين صلاحيات مباشرة للمستخدمين',
  isSystem: true,
});

// Role Management Permissions
definePermission({
  code: 'roles.view',
  module: 'roles',
  category: 'page',
  nameEn: 'View Roles',
  nameAr: 'عرض الأدوار',
  descriptionEn: 'Can view roles list',
  descriptionAr: 'يمكن عرض قائمة الأدوار',
  isSystem: true,
});

definePermission({
  code: 'roles.create',
  module: 'roles',
  category: 'api',
  nameEn: 'Create Roles',
  nameAr: 'إنشاء أدوار',
  descriptionEn: 'Can create new roles',
  descriptionAr: 'يمكن إنشاء أدوار جديدة',
  isSystem: true,
});

definePermission({
  code: 'roles.edit',
  module: 'roles',
  category: 'api',
  nameEn: 'Edit Roles',
  nameAr: 'تعديل الأدوار',
  descriptionEn: 'Can edit existing roles',
  descriptionAr: 'يمكن تعديل الأدوار',
  isSystem: true,
});

definePermission({
  code: 'roles.delete',
  module: 'roles',
  category: 'api',
  nameEn: 'Delete Roles',
  nameAr: 'حذف الأدوار',
  descriptionEn: 'Can delete roles',
  descriptionAr: 'يمكن حذف الأدوار',
  isSystem: true,
});

definePermission({
  code: 'roles.manage_permissions',
  module: 'roles',
  category: 'api',
  nameEn: 'Manage Role Permissions',
  nameAr: 'إدارة صلاحيات الأدوار',
  descriptionEn: 'Can assign/remove permissions from roles',
  descriptionAr: 'يمكن تعيين/إزالة الصلاحيات من الأدوار',
  isSystem: true,
});

// Permission Management Permissions
definePermission({
  code: 'permissions.view',
  module: 'permissions',
  category: 'page',
  nameEn: 'View Permissions',
  nameAr: 'عرض الصلاحيات',
  descriptionEn: 'Can view permissions list',
  descriptionAr: 'يمكن عرض قائمة الصلاحيات',
  isSystem: true,
});

definePermission({
  code: 'permissions.create',
  module: 'permissions',
  category: 'api',
  nameEn: 'Create Permissions',
  nameAr: 'إنشاء صلاحيات',
  descriptionEn: 'Can create new permissions',
  descriptionAr: 'يمكن إنشاء صلاحيات جديدة',
  isSystem: true,
});

definePermission({
  code: 'permissions.edit',
  module: 'permissions',
  category: 'api',
  nameEn: 'Edit Permissions',
  nameAr: 'تعديل الصلاحيات',
  descriptionEn: 'Can edit permissions',
  descriptionAr: 'يمكن تعديل الصلاحيات',
  isSystem: true,
});

definePermission({
  code: 'permissions.delete',
  module: 'permissions',
  category: 'api',
  nameEn: 'Delete Permissions',
  nameAr: 'حذف الصلاحيات',
  descriptionEn: 'Can delete permissions',
  descriptionAr: 'يمكن حذف الصلاحيات',
  isSystem: true,
});

// Customer Management Permissions
definePermission({
  code: 'customers.view',
  module: 'customers',
  category: 'page',
  nameEn: 'View Customers',
  nameAr: 'عرض العملاء',
  descriptionEn: 'Can view customers list',
  descriptionAr: 'يمكن عرض قائمة العملاء',
  isSystem: true,
});

definePermission({
  code: 'customers.create',
  module: 'customers',
  category: 'api',
  nameEn: 'Create Customers',
  nameAr: 'إنشاء عملاء',
  descriptionEn: 'Can create new customers',
  descriptionAr: 'يمكن إنشاء عملاء جدد',
  isSystem: true,
});

definePermission({
  code: 'customers.edit',
  module: 'customers',
  category: 'api',
  nameEn: 'Edit Customers',
  nameAr: 'تعديل العملاء',
  descriptionEn: 'Can edit existing customers',
  descriptionAr: 'يمكن تعديل العملاء',
  isSystem: true,
});

definePermission({
  code: 'customers.delete',
  module: 'customers',
  category: 'api',
  nameEn: 'Delete Customers',
  nameAr: 'حذف العملاء',
  descriptionEn: 'Can delete customers',
  descriptionAr: 'يمكن حذف العملاء',
  isSystem: true,
});

definePermission({
  code: 'customers.export',
  module: 'customers',
  category: 'button',
  nameEn: 'Export Customers',
  nameAr: 'تصدير العملاء',
  descriptionEn: 'Can export customers data',
  descriptionAr: 'يمكن تصدير بيانات العملاء',
  isSystem: true,
});

definePermission({
  code: 'customers.import',
  module: 'customers',
  category: 'button',
  nameEn: 'Import Customers',
  nameAr: 'استيراد العملاء',
  descriptionEn: 'Can import customers data',
  descriptionAr: 'يمكن استيراد بيانات العملاء',
  isSystem: true,
});

// Messages/Communication Permissions
definePermission({
  code: 'messages.view',
  module: 'messages',
  category: 'page',
  nameEn: 'View Messages',
  nameAr: 'عرض الرسائل',
  descriptionEn: 'Can view messages page and history',
  descriptionAr: 'يمكن عرض صفحة الرسائل والسجل',
  isSystem: true,
});

definePermission({
  code: 'messages.send',
  module: 'messages',
  category: 'api',
  nameEn: 'Send Messages',
  nameAr: 'إرسال الرسائل',
  descriptionEn: 'Can send direct messages to users and customers',
  descriptionAr: 'يمكن إرسال رسائل مباشرة للمستخدمين والعملاء',
  isSystem: true,
});

definePermission({
  code: 'messages.send_to_users',
  module: 'messages',
  category: 'api',
  nameEn: 'Send Messages to Users',
  nameAr: 'إرسال رسائل للمستخدمين',
  descriptionEn: 'Can send messages to system users',
  descriptionAr: 'يمكن إرسال رسائل لمستخدمي النظام',
  isSystem: true,
});

definePermission({
  code: 'messages.send_to_customers',
  module: 'messages',
  category: 'api',
  nameEn: 'Send Messages to Customers',
  nameAr: 'إرسال رسائل للعملاء',
  descriptionEn: 'Can send messages to customers',
  descriptionAr: 'يمكن إرسال رسائل للعملاء',
  isSystem: true,
});

definePermission({
  code: 'messages.send_broadcast',
  module: 'messages',
  category: 'api',
  nameEn: 'Send Broadcast Messages',
  nameAr: 'إرسال رسائل جماعية',
  descriptionEn: 'Can send broadcast messages to multiple recipients',
  descriptionAr: 'يمكن إرسال رسائل جماعية لمستقبلين متعددين',
  isSystem: true,
});

definePermission({
  code: 'messages.view_history',
  module: 'messages',
  category: 'api',
  nameEn: 'View Messages History',
  nameAr: 'عرض سجل الرسائل',
  descriptionEn: 'Can view sent messages history',
  descriptionAr: 'يمكن عرض سجل الرسائل المرسلة',
  isSystem: true,
});

definePermission({
  code: 'messages.delete',
  module: 'messages',
  category: 'api',
  nameEn: 'Delete Messages',
  nameAr: 'حذف الرسائل',
  descriptionEn: 'Can delete sent messages',
  descriptionAr: 'يمكن حذف الرسائل المرسلة',
  isSystem: true,
});

// Navigation/Menu Permissions
definePermission({
  code: 'menu.dashboard',
  module: 'navigation',
  category: 'menu',
  nameEn: 'Dashboard Menu',
  nameAr: 'قائمة لوحة التحكم',
  descriptionEn: 'Can see dashboard in navigation',
  descriptionAr: 'يمكن رؤية لوحة التحكم في القائمة',
  isSystem: true,
});

definePermission({
  code: 'menu.customers',
  module: 'navigation',
  category: 'menu',
  nameEn: 'Customers Menu',
  nameAr: 'قائمة العملاء',
  descriptionEn: 'Can see customers in navigation',
  descriptionAr: 'يمكن رؤية العملاء في القائمة',
  isSystem: true,
});

definePermission({
  code: 'menu.orders',
  module: 'navigation',
  category: 'menu',
  nameEn: 'Orders Menu',
  nameAr: 'قائمة الطلبات',
  descriptionEn: 'Can see orders in navigation',
  descriptionAr: 'يمكن رؤية الطلبات في القائمة',
  isSystem: true,
});

definePermission({
  code: 'menu.reports',
  module: 'navigation',
  category: 'menu',
  nameEn: 'Reports Menu',
  nameAr: 'قائمة التقارير',
  descriptionEn: 'Can see reports in navigation',
  descriptionAr: 'يمكن رؤية التقارير في القائمة',
  isSystem: true,
});

definePermission({
  code: 'menu.settings',
  module: 'navigation',
  category: 'menu',
  nameEn: 'Settings Menu',
  nameAr: 'قائمة الإعدادات',
  descriptionEn: 'Can see settings in navigation',
  descriptionAr: 'يمكن رؤية الإعدادات في القائمة',
  isSystem: true,
});

definePermission({
  code: 'menu.users',
  module: 'navigation',
  category: 'menu',
  nameEn: 'Users Menu',
  nameAr: 'قائمة المستخدمين',
  descriptionEn: 'Can see users management in navigation',
  descriptionAr: 'يمكن رؤية إدارة المستخدمين في القائمة',
  isSystem: true,
});

definePermission({
  code: 'menu.roles',
  module: 'navigation',
  category: 'menu',
  nameEn: 'Roles Menu',
  nameAr: 'قائمة الأدوار',
  descriptionEn: 'Can see roles management in navigation',
  descriptionAr: 'يمكن رؤية إدارة الأدوار في القائمة',
  isSystem: true,
});

definePermission({
  code: 'menu.messages',
  module: 'navigation',
  category: 'menu',
  nameEn: 'Messages Menu',
  nameAr: 'قائمة الرسائل',
  descriptionEn: 'Can see messages in navigation',
  descriptionAr: 'يمكن رؤية الرسائل في القائمة',
  isSystem: true,
});

// Dashboard Permissions
definePermission({
  code: 'dashboard.view',
  module: 'dashboard',
  category: 'page',
  nameEn: 'View Dashboard',
  nameAr: 'عرض لوحة التحكم',
  descriptionEn: 'Can view dashboard',
  descriptionAr: 'يمكن عرض لوحة التحكم',
  isSystem: true,
});

definePermission({
  code: 'dashboard.widgets.sales',
  module: 'dashboard',
  category: 'feature',
  nameEn: 'Sales Widget',
  nameAr: 'ودجت المبيعات',
  descriptionEn: 'Can view sales widget on dashboard',
  descriptionAr: 'يمكن عرض ودجت المبيعات',
  isSystem: true,
});

definePermission({
  code: 'dashboard.widgets.orders',
  module: 'dashboard',
  category: 'feature',
  nameEn: 'Orders Widget',
  nameAr: 'ودجت الطلبات',
  descriptionEn: 'Can view orders widget on dashboard',
  descriptionAr: 'يمكن عرض ودجت الطلبات',
  isSystem: true,
});

definePermission({
  code: 'dashboard.widgets.customers',
  module: 'dashboard',
  category: 'feature',
  nameEn: 'Customers Widget',
  nameAr: 'ودجت العملاء',
  descriptionEn: 'Can view customers widget on dashboard',
  descriptionAr: 'يمكن عرض ودجت العملاء',
  isSystem: true,
});
