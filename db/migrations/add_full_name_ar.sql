-- Add Arabic full name field to users and customers tables
-- This allows storing names in both English and Arabic

-- Add full_name_ar column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name_ar VARCHAR(200);

-- Add full_name_ar column to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS full_name_ar VARCHAR(255);

-- Add comments
COMMENT ON COLUMN users.full_name_ar IS 'Full name in Arabic';
COMMENT ON COLUMN customers.full_name_ar IS 'Full name in Arabic';
