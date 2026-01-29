-- Add Arabic position field to users table
-- Positions are stored as text, not as IDs referencing a separate table

ALTER TABLE users ADD COLUMN IF NOT EXISTS position_ar VARCHAR(200);

COMMENT ON COLUMN users.position IS 'Position/Job title in English';
COMMENT ON COLUMN users.position_ar IS 'Position/Job title in Arabic';
