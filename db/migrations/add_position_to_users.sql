-- Add position field to users table
-- This field stores the organizational position/job title of the user

ALTER TABLE users ADD COLUMN IF NOT EXISTS position VARCHAR(100);

-- Add comment for documentation
COMMENT ON COLUMN users.position IS 'Organizational position/job title of the user';
