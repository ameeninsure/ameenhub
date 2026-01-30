-- Add complete permissions for all modules
-- HR Module Permissions
SELECT register_permission(
    'hr',
    'navigation',
    'menu.hr',
    'HR Menu',
    'قائمة الموارد البشرية',
    'Access to HR management section',
    'الوصول إلى قسم إدارة الموارد البشرية',
    true
);

SELECT register_permission(
    'hr',
    'employees',
    'hr.employees.view',
    'View Employees',
    'عرض الموظفين',
    'View employee list and details',
    'عرض قائمة الموظفين والتفاصيل',
    true
);

SELECT register_permission(
    'hr',
    'employees',
    'hr.employees.create',
    'Create Employees',
    'إضافة موظفين',
    'Create new employee records',
    'إنشاء سجلات موظفين جديدة',
    true
);

SELECT register_permission(
    'hr',
    'employees',
    'hr.employees.edit',
    'Edit Employees',
    'تعديل الموظفين',
    'Edit employee information',
    'تعديل معلومات الموظفين',
    true
);

SELECT register_permission(
    'hr',
    'employees',
    'hr.employees.delete',
    'Delete Employees',
    'حذف الموظفين',
    'Delete employee records',
    'حذف سجلات الموظفين',
    true
);

SELECT register_permission(
    'hr',
    'employees',
    'hr.employees.export',
    'Export Employees',
    'تصدير الموظفين',
    'Export employee data',
    'تصدير بيانات الموظفين',
    true
);

SELECT register_permission(
    'hr',
    'salary',
    'hr.salary.view',
    'View Salaries',
    'عرض الرواتب',
    'View employee salary information',
    'عرض معلومات رواتب الموظفين',
    true
);

SELECT register_permission(
    'hr',
    'salary',
    'hr.salary.edit',
    'Edit Salaries',
    'تعديل الرواتب',
    'Edit employee salaries',
    'تعديل رواتب الموظفين',
    true
);

SELECT register_permission(
    'hr',
    'attendance',
    'hr.attendance.view',
    'View Attendance',
    'عرض الحضور',
    'View attendance records',
    'عرض سجلات الحضور',
    true
);

SELECT register_permission(
    'hr',
    'attendance',
    'hr.attendance.manage',
    'Manage Attendance',
    'إدارة الحضور',
    'Manage employee attendance',
    'إدارة حضور الموظفين',
    true
);

SELECT register_permission(
    'hr',
    'leaves',
    'hr.leaves.view',
    'View Leaves',
    'عرض الإجازات',
    'View leave requests',
    'عرض طلبات الإجازات',
    true
);

SELECT register_permission(
    'hr',
    'leaves',
    'hr.leaves.approve',
    'Approve Leaves',
    'الموافقة على الإجازات',
    'Approve or reject leave requests',
    'الموافقة أو رفض طلبات الإجازات',
    true
);

SELECT register_permission(
    'hr',
    'performance',
    'hr.performance.view',
    'View Performance',
    'عرض الأداء',
    'View performance reviews',
    'عرض تقييمات الأداء',
    true
);

SELECT register_permission(
    'hr',
    'performance',
    'hr.performance.manage',
    'Manage Performance',
    'إدارة الأداء',
    'Create and edit performance reviews',
    'إنشاء وتعديل تقييمات الأداء',
    true
);

SELECT register_permission(
    'hr',
    'commissions',
    'hr.commissions.view',
    'View Commissions',
    'عرض العمولات',
    'View employee commissions',
    'عرض عمولات الموظفين',
    true
);

SELECT register_permission(
    'hr',
    'commissions',
    'hr.commissions.manage',
    'Manage Commissions',
    'إدارة العمولات',
    'Manage commission calculations',
    'إدارة حسابات العمولات',
    true
);

SELECT register_permission(
    'hr',
    'documents',
    'hr.documents.view',
    'View HR Documents',
    'عرض مستندات الموارد البشرية',
    'View employee documents',
    'عرض مستندات الموظفين',
    true
);

SELECT register_permission(
    'hr',
    'documents',
    'hr.documents.manage',
    'Manage HR Documents',
    'إدارة مستندات الموارد البشرية',
    'Upload and manage employee documents',
    'رفع وإدارة مستندات الموظفين',
    true
);

-- Insurance Module Permissions
SELECT register_permission(
    'insurance',
    'navigation',
    'menu.insurance',
    'Insurance Menu',
    'قائمة التأمين',
    'Access to insurance management section',
    'الوصول إلى قسم إدارة التأمين',
    true
);

SELECT register_permission(
    'insurance',
    'companies',
    'insurance.companies.view',
    'View Insurance Companies',
    'عرض شركات التأمين',
    'View insurance companies',
    'عرض شركات التأمين',
    true
);

SELECT register_permission(
    'insurance',
    'companies',
    'insurance.companies.create',
    'Create Insurance Companies',
    'إضافة شركات التأمين',
    'Create new insurance companies',
    'إنشاء شركات تأمين جديدة',
    true
);

SELECT register_permission(
    'insurance',
    'companies',
    'insurance.companies.edit',
    'Edit Insurance Companies',
    'تعديل شركات التأمين',
    'Edit insurance company details',
    'تعديل تفاصيل شركات التأمين',
    true
);

SELECT register_permission(
    'insurance',
    'companies',
    'insurance.companies.delete',
    'Delete Insurance Companies',
    'حذف شركات التأمين',
    'Delete insurance companies',
    'حذف شركات التأمين',
    true
);

SELECT register_permission(
    'insurance',
    'products',
    'insurance.products.view',
    'View Insurance Products',
    'عرض منتجات التأمين',
    'View insurance products',
    'عرض منتجات التأمين',
    true
);

SELECT register_permission(
    'insurance',
    'products',
    'insurance.products.create',
    'Create Insurance Products',
    'إضافة منتجات التأمين',
    'Create new insurance products',
    'إنشاء منتجات تأمين جديدة',
    true
);

SELECT register_permission(
    'insurance',
    'products',
    'insurance.products.edit',
    'Edit Insurance Products',
    'تعديل منتجات التأمين',
    'Edit insurance product details',
    'تعديل تفاصيل منتجات التأمين',
    true
);

SELECT register_permission(
    'insurance',
    'products',
    'insurance.products.delete',
    'Delete Insurance Products',
    'حذف منتجات التأمين',
    'Delete insurance products',
    'حذف منتجات التأمين',
    true
);

SELECT register_permission(
    'insurance',
    'policies',
    'insurance.policies.view',
    'View Insurance Policies',
    'عرض وثائق التأمين',
    'View insurance policies',
    'عرض وثائق التأمين',
    true
);

SELECT register_permission(
    'insurance',
    'policies',
    'insurance.policies.create',
    'Create Insurance Policies',
    'إصدار وثائق التأمين',
    'Issue new insurance policies',
    'إصدار وثائق تأمين جديدة',
    true
);

SELECT register_permission(
    'insurance',
    'policies',
    'insurance.policies.edit',
    'Edit Insurance Policies',
    'تعديل وثائق التأمين',
    'Edit insurance policies',
    'تعديل وثائق التأمين',
    true
);

SELECT register_permission(
    'insurance',
    'policies',
    'insurance.policies.cancel',
    'Cancel Insurance Policies',
    'إلغاء وثائق التأمين',
    'Cancel insurance policies',
    'إلغاء وثائق التأمين',
    true
);

SELECT register_permission(
    'insurance',
    'claims',
    'insurance.claims.view',
    'View Insurance Claims',
    'عرض مطالبات التأمين',
    'View insurance claims',
    'عرض مطالبات التأمين',
    true
);

SELECT register_permission(
    'insurance',
    'claims',
    'insurance.claims.manage',
    'Manage Insurance Claims',
    'إدارة مطالبات التأمين',
    'Process insurance claims',
    'معالجة مطالبات التأمين',
    true
);

-- Notifications Module Permissions
SELECT register_permission(
    'notifications',
    'navigation',
    'menu.notifications',
    'Notifications Menu',
    'قائمة الإشعارات',
    'Access to notifications section',
    'الوصول إلى قسم الإشعارات',
    true
);

SELECT register_permission(
    'notifications',
    'general',
    'notifications.view',
    'View Notifications',
    'عرض الإشعارات',
    'View notifications',
    'عرض الإشعارات',
    true
);

SELECT register_permission(
    'notifications',
    'general',
    'notifications.send',
    'Send Notifications',
    'إرسال الإشعارات',
    'Send notifications to users',
    'إرسال إشعارات للمستخدمين',
    true
);

SELECT register_permission(
    'notifications',
    'general',
    'notifications.manage',
    'Manage Notifications',
    'إدارة الإشعارات',
    'Manage notification settings',
    'إدارة إعدادات الإشعارات',
    true
);

-- Messages Module Permissions
SELECT register_permission(
    'messages',
    'navigation',
    'menu.messages',
    'Messages Menu',
    'قائمة الرسائل',
    'Access to messages section',
    'الوصول إلى قسم الرسائل',
    true
);

SELECT register_permission(
    'messages',
    'general',
    'messages.view',
    'View Messages',
    'عرض الرسائل',
    'View messages',
    'عرض الرسائل',
    true
);

SELECT register_permission(
    'messages',
    'general',
    'messages.send',
    'Send Messages',
    'إرسال الرسائل',
    'Send messages to users',
    'إرسال رسائل للمستخدمين',
    true
);

SELECT register_permission(
    'messages',
    'general',
    'messages.delete',
    'Delete Messages',
    'حذف الرسائل',
    'Delete messages',
    'حذف الرسائل',
    true
);

-- Backup & Restore Permissions
SELECT register_permission(
    'system',
    'backup',
    'system.backup.create',
    'Create Backup',
    'إنشاء نسخة احتياطية',
    'Create system backups',
    'إنشاء نسخ احتياطية للنظام',
    true
);

SELECT register_permission(
    'system',
    'backup',
    'system.backup.restore',
    'Restore Backup',
    'استعادة النسخة الاحتياطية',
    'Restore system from backup',
    'استعادة النظام من نسخة احتياطية',
    true
);

SELECT register_permission(
    'system',
    'backup',
    'system.backup.download',
    'Download Backup',
    'تحميل النسخة الاحتياطية',
    'Download backup files',
    'تحميل ملفات النسخ الاحتياطية',
    true
);

SELECT register_permission(
    'system',
    'backup',
    'system.backup.delete',
    'Delete Backup',
    'حذف النسخة الاحتياطية',
    'Delete backup files',
    'حذف ملفات النسخ الاحتياطية',
    true
);

-- Organization Chart Permissions
SELECT register_permission(
    'organization',
    'navigation',
    'menu.org_chart',
    'Organization Chart Menu',
    'قائمة الهيكل التنظيمي',
    'Access to organization chart',
    'الوصول إلى الهيكل التنظيمي',
    true
);

SELECT register_permission(
    'organization',
    'chart',
    'org_chart.view',
    'View Organization Chart',
    'عرض الهيكل التنظيمي',
    'View organization structure',
    'عرض الهيكل التنظيمي',
    true
);

SELECT register_permission(
    'organization',
    'chart',
    'org_chart.edit',
    'Edit Organization Chart',
    'تعديل الهيكل التنظيمي',
    'Edit organization structure',
    'تعديل الهيكل التنظيمي',
    true
);

-- Profile & Personal Settings
SELECT register_permission(
    'profile',
    'general',
    'profile.view',
    'View Profile',
    'عرض الملف الشخصي',
    'View own profile',
    'عرض الملف الشخصي الخاص',
    true
);

SELECT register_permission(
    'profile',
    'general',
    'profile.edit',
    'Edit Profile',
    'تعديل الملف الشخصي',
    'Edit own profile information',
    'تعديل معلومات الملف الشخصي',
    true
);

-- Customer Portal Permissions
SELECT register_permission(
    'portal',
    'navigation',
    'menu.portal',
    'Customer Portal Menu',
    'قائمة بوابة العملاء',
    'Access to customer portal management',
    'الوصول إلى إدارة بوابة العملاء',
    true
);

SELECT register_permission(
    'portal',
    'customers',
    'portal.customers.view',
    'View Portal Customers',
    'عرض عملاء البوابة',
    'View customer portal users',
    'عرض مستخدمي بوابة العملاء',
    true
);

SELECT register_permission(
    'portal',
    'customers',
    'portal.customers.manage',
    'Manage Portal Customers',
    'إدارة عملاء البوابة',
    'Manage customer portal access',
    'إدارة الوصول لبوابة العملاء',
    true
);

-- Advanced Customer Permissions
SELECT register_permission(
    'customers',
    'advanced',
    'customers.view_sensitive',
    'View Sensitive Customer Data',
    'عرض البيانات الحساسة للعملاء',
    'View sensitive customer information',
    'عرض المعلومات الحساسة للعملاء',
    true
);

SELECT register_permission(
    'customers',
    'advanced',
    'customers.bulk_operations',
    'Customer Bulk Operations',
    'عمليات جماعية على العملاء',
    'Perform bulk operations on customers',
    'تنفيذ عمليات جماعية على العملاء',
    true
);

-- Advanced Reports Permissions
SELECT register_permission(
    'reports',
    'advanced',
    'reports.financial',
    'Financial Reports',
    'التقارير المالية',
    'View financial reports',
    'عرض التقارير المالية',
    true
);

SELECT register_permission(
    'reports',
    'advanced',
    'reports.hr',
    'HR Reports',
    'تقارير الموارد البشرية',
    'View HR reports',
    'عرض تقارير الموارد البشرية',
    true
);

SELECT register_permission(
    'reports',
    'advanced',
    'reports.insurance',
    'Insurance Reports',
    'تقارير التأمين',
    'View insurance reports',
    'عرض تقارير التأمين',
    true
);

SELECT register_permission(
    'reports',
    'advanced',
    'reports.analytics',
    'Analytics Reports',
    'تقارير التحليلات',
    'View analytics and insights',
    'عرض التحليلات والرؤى',
    true
);

-- System Settings Permissions
SELECT register_permission(
    'settings',
    'advanced',
    'settings.system',
    'System Settings',
    'إعدادات النظام',
    'Manage system-wide settings',
    'إدارة إعدادات النظام الشاملة',
    true
);

SELECT register_permission(
    'settings',
    'advanced',
    'settings.security',
    'Security Settings',
    'إعدادات الأمان',
    'Manage security settings',
    'إدارة إعدادات الأمان',
    true
);

SELECT register_permission(
    'settings',
    'advanced',
    'settings.notifications',
    'Notification Settings',
    'إعدادات الإشعارات',
    'Manage notification settings',
    'إدارة إعدادات الإشعارات',
    true
);

-- Audit & Logs Permissions
SELECT register_permission(
    'audit',
    'logs',
    'audit.view',
    'View Audit Logs',
    'عرض سجلات المراجعة',
    'View system audit logs',
    'عرض سجلات مراجعة النظام',
    true
);

SELECT register_permission(
    'audit',
    'logs',
    'audit.export',
    'Export Audit Logs',
    'تصدير سجلات المراجعة',
    'Export audit log data',
    'تصدير بيانات سجلات المراجعة',
    true
);

-- Show summary
SELECT 
    module,
    category,
    COUNT(*) as permission_count
FROM permissions
WHERE is_active = true
GROUP BY module, category
ORDER BY module, category;

SELECT COUNT(*) as total_permissions FROM permissions WHERE is_active = true;
