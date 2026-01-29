-- Migration: Set created_by for existing customers
-- This assigns all customers without a creator to the first admin user

-- Update customers that don't have a created_by set
UPDATE customers 
SET created_by = (
    SELECT u.id 
    FROM users u 
    INNER JOIN user_roles ur ON u.id = ur.user_id
    INNER JOIN roles r ON ur.role_id = r.id
    WHERE r.code IN ('super_admin', 'admin')
    ORDER BY u.id ASC
    LIMIT 1
)
WHERE created_by IS NULL;

-- If no admin found, set to the first active user
UPDATE customers 
SET created_by = (
    SELECT id FROM users WHERE is_active = true ORDER BY id ASC LIMIT 1
)
WHERE created_by IS NULL;
