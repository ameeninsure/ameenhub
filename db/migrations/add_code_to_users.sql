-- Migration: Add code field to users table
-- Each user gets a unique code starting with AU- (Agent User)
-- Used for identifying users in insurance policy sales

-- Add code column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS code VARCHAR(20) UNIQUE;

-- Create function to generate user code
CREATE OR REPLACE FUNCTION generate_user_code()
RETURNS VARCHAR(20) AS $$
DECLARE
    max_num INTEGER;
    new_code VARCHAR(20);
BEGIN
    -- Get the maximum number from existing codes
    SELECT COALESCE(MAX(SUBSTRING(code FROM 4)::INTEGER), 0)
    INTO max_num
    FROM users
    WHERE code LIKE 'AU-%' AND SUBSTRING(code FROM 4) ~ '^[0-9]+$';
    
    -- Generate new code
    new_code := 'AU-' || LPAD((max_num + 1)::TEXT, 6, '0');
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Update existing users with codes
DO $$
DECLARE
    user_record RECORD;
    counter INTEGER := 0;
BEGIN
    FOR user_record IN SELECT id FROM users WHERE code IS NULL ORDER BY id
    LOOP
        counter := counter + 1;
        UPDATE users SET code = 'AU-' || LPAD(counter::TEXT, 6, '0') WHERE id = user_record.id;
    END LOOP;
END $$;

-- Make code NOT NULL after populating existing records
ALTER TABLE users ALTER COLUMN code SET NOT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_code ON users(code);

-- Verify the changes
SELECT id, code, username, full_name FROM users ORDER BY id;
