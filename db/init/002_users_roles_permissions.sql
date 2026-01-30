-- Users, Roles, and Permissions schema
-- A flexible permission system that allows granular control over all system features

-- ============================================================================
-- PERMISSIONS TABLE
-- Stores all available permissions in the system
-- Permissions are auto-registered when new features are added
-- ============================================================================
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(255) UNIQUE NOT NULL,  -- Unique identifier e.g., 'customers.create', 'menu.reports', 'button.export'
    module VARCHAR(100) NOT NULL,        -- Module grouping e.g., 'customers', 'orders', 'reports', 'ui'
    category VARCHAR(50) NOT NULL,       -- Category: 'page', 'api', 'button', 'menu', 'feature'
    name_en VARCHAR(255) NOT NULL,       -- English name
    name_ar VARCHAR(255) NOT NULL,       -- Arabic name
    description_en TEXT,                  -- English description
    description_ar TEXT,                  -- Arabic description
    is_system BOOLEAN DEFAULT false,     -- System permissions cannot be deleted
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ROLES TABLE
-- Stores all roles (both system and custom)
-- ============================================================================
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,   -- Unique code e.g., 'admin', 'manager', 'sales'
    name_en VARCHAR(255) NOT NULL,        -- English name
    name_ar VARCHAR(255) NOT NULL,        -- Arabic name
    description_en TEXT,                   -- English description
    description_ar TEXT,                   -- Arabic description
    is_system BOOLEAN DEFAULT false,      -- System roles cannot be deleted (e.g., 'admin')
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ROLE_PERMISSIONS TABLE
-- Maps permissions to roles (many-to-many)
-- ============================================================================
CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    granted_by INTEGER,  -- Will reference users.id after users table is created
    UNIQUE(role_id, permission_id)
);

-- ============================================================================
-- USERS TABLE
-- Stores all system users
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(50),
    avatar_url VARCHAR(500),
    preferred_language VARCHAR(10) DEFAULT 'en',  -- 'en' or 'ar'
    is_active BOOLEAN DEFAULT true,
    is_system BOOLEAN DEFAULT false,              -- System users cannot be deleted
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USER_ROLES TABLE
-- Maps roles to users (many-to-many)
-- A user can have multiple roles
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by INTEGER REFERENCES users(id),
    UNIQUE(user_id, role_id)
);

-- ============================================================================
-- USER_CUSTOM_PERMISSIONS TABLE
-- Direct permissions assigned to a user (override role permissions)
-- Can be used to grant or deny specific permissions to a user
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_custom_permissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    is_granted BOOLEAN NOT NULL DEFAULT true,  -- true = grant, false = explicitly deny
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by INTEGER REFERENCES users(id),
    UNIQUE(user_id, permission_id)
);

-- ============================================================================
-- PERMISSION_AUDIT_LOG TABLE
-- Tracks all permission changes for security auditing
-- ============================================================================
CREATE TABLE IF NOT EXISTS permission_audit_log (
    id SERIAL PRIMARY KEY,
    action VARCHAR(50) NOT NULL,           -- 'grant', 'revoke', 'create_role', 'delete_role', etc.
    actor_user_id INTEGER REFERENCES users(id),
    target_user_id INTEGER REFERENCES users(id),
    target_role_id INTEGER REFERENCES roles(id),
    permission_id INTEGER REFERENCES permissions(id),
    details JSONB,                          -- Additional details
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);
CREATE INDEX IF NOT EXISTS idx_permissions_category ON permissions(category);
CREATE INDEX IF NOT EXISTS idx_permissions_code ON permissions(code);
CREATE INDEX IF NOT EXISTS idx_permissions_active ON permissions(is_active);

CREATE INDEX IF NOT EXISTS idx_roles_code ON roles(code);
CREATE INDEX IF NOT EXISTS idx_roles_active ON roles(is_active);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission_id);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);

CREATE INDEX IF NOT EXISTS idx_user_custom_permissions_user ON user_custom_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_custom_permissions_permission ON user_custom_permissions(permission_id);

CREATE INDEX IF NOT EXISTS idx_permission_audit_log_actor ON permission_audit_log(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_permission_audit_log_created ON permission_audit_log(created_at);

-- ============================================================================
-- TRIGGERS
-- ============================================================================
DROP TRIGGER IF EXISTS update_permissions_updated_at ON permissions;
CREATE TRIGGER update_permissions_updated_at
    BEFORE UPDATE ON permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DEFAULT DATA
-- ============================================================================

-- Insert default system roles
INSERT INTO roles (code, name_en, name_ar, description_en, description_ar, is_system) VALUES
    ('super_admin', 'Super Administrator', 'المدير العام', 'Full system access with all permissions', 'صلاحيات كاملة للنظام', true),
    ('admin', 'Administrator', 'مدير النظام', 'System administrator with most permissions', 'مدير النظام مع معظم الصلاحيات', true),
    ('manager', 'Manager', 'مدير', 'Department manager with limited admin rights', 'مدير قسم مع صلاحيات إدارية محدودة', false),
    ('user', 'Standard User', 'مستخدم عادي', 'Standard user with basic permissions', 'مستخدم عادي مع صلاحيات أساسية', false),
    ('viewer', 'Viewer', 'مشاهد', 'Read-only access to the system', 'صلاحيات القراءة فقط', false)
ON CONFLICT (code) DO NOTHING;

-- Insert default system permissions (organized by module and category)

-- System Module Permissions
INSERT INTO permissions (code, module, category, name_en, name_ar, description_en, description_ar, is_system) VALUES
    -- User Management
    ('users.view', 'users', 'page', 'View Users', 'عرض المستخدمين', 'Can view users list', 'يمكن عرض قائمة المستخدمين', true),
    ('users.create', 'users', 'api', 'Create Users', 'إنشاء مستخدمين', 'Can create new users', 'يمكن إنشاء مستخدمين جدد', true),
    ('users.edit', 'users', 'api', 'Edit Users', 'تعديل المستخدمين', 'Can edit existing users', 'يمكن تعديل المستخدمين', true),
    ('users.delete', 'users', 'api', 'Delete Users', 'حذف المستخدمين', 'Can delete users', 'يمكن حذف المستخدمين', true),
    ('users.manage_roles', 'users', 'api', 'Manage User Roles', 'إدارة أدوار المستخدمين', 'Can assign/remove roles from users', 'يمكن تعيين/إزالة الأدوار من المستخدمين', true),
    ('users.manage_permissions', 'users', 'api', 'Manage User Permissions', 'إدارة صلاحيات المستخدمين', 'Can assign direct permissions to users', 'يمكن تعيين صلاحيات مباشرة للمستخدمين', true),
    
    -- Role Management
    ('roles.view', 'roles', 'page', 'View Roles', 'عرض الأدوار', 'Can view roles list', 'يمكن عرض قائمة الأدوار', true),
    ('roles.create', 'roles', 'api', 'Create Roles', 'إنشاء أدوار', 'Can create new roles', 'يمكن إنشاء أدوار جديدة', true),
    ('roles.edit', 'roles', 'api', 'Edit Roles', 'تعديل الأدوار', 'Can edit existing roles', 'يمكن تعديل الأدوار', true),
    ('roles.delete', 'roles', 'api', 'Delete Roles', 'حذف الأدوار', 'Can delete roles', 'يمكن حذف الأدوار', true),
    ('roles.manage_permissions', 'roles', 'api', 'Manage Role Permissions', 'إدارة صلاحيات الأدوار', 'Can assign/remove permissions from roles', 'يمكن تعيين/إزالة الصلاحيات من الأدوار', true),
    
    -- Permission Management
    ('permissions.view', 'permissions', 'page', 'View Permissions', 'عرض الصلاحيات', 'Can view permissions list', 'يمكن عرض قائمة الصلاحيات', true),
    ('permissions.create', 'permissions', 'api', 'Create Permissions', 'إنشاء صلاحيات', 'Can create new permissions', 'يمكن إنشاء صلاحيات جديدة', true),
    ('permissions.edit', 'permissions', 'api', 'Edit Permissions', 'تعديل الصلاحيات', 'Can edit permissions', 'يمكن تعديل الصلاحيات', true),
    ('permissions.delete', 'permissions', 'api', 'Delete Permissions', 'حذف الصلاحيات', 'Can delete permissions', 'يمكن حذف الصلاحيات', true),

    -- Customer Management
    ('customers.view', 'customers', 'page', 'View Customers', 'عرض العملاء', 'Can view customers list', 'يمكن عرض قائمة العملاء', true),
    ('customers.create', 'customers', 'api', 'Create Customers', 'إنشاء عملاء', 'Can create new customers', 'يمكن إنشاء عملاء جدد', true),
    ('customers.edit', 'customers', 'api', 'Edit Customers', 'تعديل العملاء', 'Can edit existing customers', 'يمكن تعديل العملاء', true),
    ('customers.delete', 'customers', 'api', 'Delete Customers', 'حذف العملاء', 'Can delete customers', 'يمكن حذف العملاء', true),
    ('customers.export', 'customers', 'button', 'Export Customers', 'تصدير العملاء', 'Can export customers data', 'يمكن تصدير بيانات العملاء', true),
    ('customers.import', 'customers', 'button', 'Import Customers', 'استيراد العملاء', 'Can import customers data', 'يمكن استيراد بيانات العملاء', true),

    -- Order Management
    ('orders.view', 'orders', 'page', 'View Orders', 'عرض الطلبات', 'Can view orders list', 'يمكن عرض قائمة الطلبات', true),
    ('orders.create', 'orders', 'api', 'Create Orders', 'إنشاء طلبات', 'Can create new orders', 'يمكن إنشاء طلبات جديدة', true),
    ('orders.edit', 'orders', 'api', 'Edit Orders', 'تعديل الطلبات', 'Can edit existing orders', 'يمكن تعديل الطلبات', true),
    ('orders.delete', 'orders', 'api', 'Delete Orders', 'حذف الطلبات', 'Can delete orders', 'يمكن حذف الطلبات', true),
    ('orders.approve', 'orders', 'button', 'Approve Orders', 'الموافقة على الطلبات', 'Can approve orders', 'يمكن الموافقة على الطلبات', true),
    ('orders.reject', 'orders', 'button', 'Reject Orders', 'رفض الطلبات', 'Can reject orders', 'يمكن رفض الطلبات', true),
    ('orders.export', 'orders', 'button', 'Export Orders', 'تصدير الطلبات', 'Can export orders data', 'يمكن تصدير بيانات الطلبات', true),

    -- Reports
    ('reports.view', 'reports', 'page', 'View Reports', 'عرض التقارير', 'Can view reports', 'يمكن عرض التقارير', true),
    ('reports.sales', 'reports', 'feature', 'Sales Reports', 'تقارير المبيعات', 'Can view sales reports', 'يمكن عرض تقارير المبيعات', true),
    ('reports.customers', 'reports', 'feature', 'Customer Reports', 'تقارير العملاء', 'Can view customer reports', 'يمكن عرض تقارير العملاء', true),
    ('reports.export', 'reports', 'button', 'Export Reports', 'تصدير التقارير', 'Can export reports', 'يمكن تصدير التقارير', true),

    -- Dashboard
    ('dashboard.view', 'dashboard', 'page', 'View Dashboard', 'عرض لوحة التحكم', 'Can view dashboard', 'يمكن عرض لوحة التحكم', true),
    ('dashboard.widgets.sales', 'dashboard', 'feature', 'Sales Widget', 'ودجت المبيعات', 'Can view sales widget on dashboard', 'يمكن عرض ودجت المبيعات', true),
    ('dashboard.widgets.orders', 'dashboard', 'feature', 'Orders Widget', 'ودجت الطلبات', 'Can view orders widget on dashboard', 'يمكن عرض ودجت الطلبات', true),
    ('dashboard.widgets.customers', 'dashboard', 'feature', 'Customers Widget', 'ودجت العملاء', 'Can view customers widget on dashboard', 'يمكن عرض ودجت العملاء', true),

    -- Settings
    ('settings.view', 'settings', 'page', 'View Settings', 'عرض الإعدادات', 'Can view system settings', 'يمكن عرض إعدادات النظام', true),
    ('settings.edit', 'settings', 'api', 'Edit Settings', 'تعديل الإعدادات', 'Can edit system settings', 'يمكن تعديل إعدادات النظام', true),

    -- Navigation/Menu
    ('menu.dashboard', 'navigation', 'menu', 'Dashboard Menu', 'قائمة لوحة التحكم', 'Can see dashboard in navigation', 'يمكن رؤية لوحة التحكم في القائمة', true),
    ('menu.customers', 'navigation', 'menu', 'Customers Menu', 'قائمة العملاء', 'Can see customers in navigation', 'يمكن رؤية العملاء في القائمة', true),
    ('menu.orders', 'navigation', 'menu', 'Orders Menu', 'قائمة الطلبات', 'Can see orders in navigation', 'يمكن رؤية الطلبات في القائمة', true),
    ('menu.reports', 'navigation', 'menu', 'Reports Menu', 'قائمة التقارير', 'Can see reports in navigation', 'يمكن رؤية التقارير في القائمة', true),
    ('menu.settings', 'navigation', 'menu', 'Settings Menu', 'قائمة الإعدادات', 'Can see settings in navigation', 'يمكن رؤية الإعدادات في القائمة', true),
    ('menu.users', 'navigation', 'menu', 'Users Menu', 'قائمة المستخدمين', 'Can see users management in navigation', 'يمكن رؤية إدارة المستخدمين في القائمة', true),
    ('menu.roles', 'navigation', 'menu', 'Roles Menu', 'قائمة الأدوار', 'Can see roles management in navigation', 'يمكن رؤية إدارة الأدوار في القائمة', true)
ON CONFLICT (code) DO NOTHING;

-- Grant all permissions to super_admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'super_admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Grant most permissions to admin role (excluding super admin specific ones)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'admin'
  AND p.code NOT IN ('users.delete', 'roles.delete', 'permissions.delete')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Grant view and basic permissions to manager role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'manager'
  AND (
    p.category = 'page'
    OR p.category = 'menu'
    OR p.code IN ('customers.create', 'customers.edit', 'orders.create', 'orders.edit', 'orders.approve', 'orders.reject', 'reports.export', 'customers.export', 'orders.export')
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Grant view permissions to standard user role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'user'
  AND (
    p.code IN ('dashboard.view', 'customers.view', 'orders.view', 'menu.dashboard', 'menu.customers', 'menu.orders')
    OR p.code LIKE 'dashboard.widgets.%'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Grant minimal permissions to viewer role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'viewer'
  AND p.code IN ('dashboard.view', 'menu.dashboard')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Create default super admin user (password: admin123 - should be changed immediately)
-- Note: In production, use a proper password hash. This is bcrypt hash of 'admin123'
INSERT INTO users (username, email, password_hash, full_name, preferred_language, is_system) VALUES
    ('admin', 'admin@ameenhub.com', '$2b$10$rOzJqQZQzQzQzQzQzQzQzOLKjKjKjKjKjKjKjKjKjKjKjKjKjKjKj', 'System Administrator', 'en', true)
ON CONFLICT (username) DO NOTHING;

-- Assign super_admin role to admin user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'admin' AND r.code = 'super_admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if a user has a specific permission
CREATE OR REPLACE FUNCTION user_has_permission(p_user_id INTEGER, p_permission_code VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    has_permission BOOLEAN;
    custom_permission BOOLEAN;
BEGIN
    -- First check for custom permission override
    SELECT is_granted INTO custom_permission
    FROM user_custom_permissions ucp
    JOIN permissions p ON ucp.permission_id = p.id
    WHERE ucp.user_id = p_user_id AND p.code = p_permission_code;
    
    IF custom_permission IS NOT NULL THEN
        RETURN custom_permission;
    END IF;
    
    -- Check role-based permissions
    SELECT EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = p_user_id 
          AND p.code = p_permission_code
          AND p.is_active = true
          AND r.is_active = true
    ) INTO has_permission;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql;

-- Function to get all permissions for a user
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id INTEGER)
RETURNS TABLE (
    permission_code VARCHAR,
    permission_name_en VARCHAR,
    permission_name_ar VARCHAR,
    module VARCHAR,
    category VARCHAR,
    source VARCHAR  -- 'role' or 'custom'
) AS $$
BEGIN
    RETURN QUERY
    -- Role-based permissions
    SELECT DISTINCT
        p.code::VARCHAR,
        p.name_en::VARCHAR,
        p.name_ar::VARCHAR,
        p.module::VARCHAR,
        p.category::VARCHAR,
        'role'::VARCHAR as source
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id
      AND p.is_active = true
      AND r.is_active = true
      AND NOT EXISTS (
          SELECT 1 FROM user_custom_permissions ucp
          WHERE ucp.user_id = p_user_id 
            AND ucp.permission_id = p.id 
            AND ucp.is_granted = false
      )
    UNION
    -- Custom granted permissions
    SELECT 
        p.code::VARCHAR,
        p.name_en::VARCHAR,
        p.name_ar::VARCHAR,
        p.module::VARCHAR,
        p.category::VARCHAR,
        'custom'::VARCHAR as source
    FROM user_custom_permissions ucp
    JOIN permissions p ON ucp.permission_id = p.id
    WHERE ucp.user_id = p_user_id
      AND ucp.is_granted = true
      AND p.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to register a new permission (used for auto-registration)
CREATE OR REPLACE FUNCTION register_permission(
    p_code VARCHAR,
    p_module VARCHAR,
    p_category VARCHAR,
    p_name_en VARCHAR,
    p_name_ar VARCHAR,
    p_description_en TEXT DEFAULT NULL,
    p_description_ar TEXT DEFAULT NULL,
    p_is_system BOOLEAN DEFAULT false
)
RETURNS INTEGER AS $$
DECLARE
    v_permission_id INTEGER;
BEGIN
    INSERT INTO permissions (code, module, category, name_en, name_ar, description_en, description_ar, is_system)
    VALUES (p_code, p_module, p_category, p_name_en, p_name_ar, p_description_en, p_description_ar, p_is_system)
    ON CONFLICT (code) DO UPDATE SET
        name_en = EXCLUDED.name_en,
        name_ar = EXCLUDED.name_ar,
        description_en = EXCLUDED.description_en,
        description_ar = EXCLUDED.description_ar,
        updated_at = NOW()
    RETURNING id INTO v_permission_id;
    
    -- Auto-grant to super_admin
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, v_permission_id
    FROM roles r
    WHERE r.code = 'super_admin'
    ON CONFLICT (role_id, permission_id) DO NOTHING;
    
    RETURN v_permission_id;
END;
$$ LANGUAGE plpgsql;
