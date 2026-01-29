-- Migration: Add manager_id to users table for organizational hierarchy
-- This enables:
-- 1. Organizational chart structure
-- 2. Managers can access data created by their subordinates
-- 3. Hierarchical permission inheritance

-- Add manager_id column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_manager_id ON users(manager_id);

-- Create a function to get all subordinates (direct and indirect) of a user
CREATE OR REPLACE FUNCTION get_all_subordinates(user_id INTEGER)
RETURNS TABLE(subordinate_id INTEGER, level INTEGER) AS $$
WITH RECURSIVE subordinates AS (
    -- Base case: direct reports
    SELECT id AS subordinate_id, 1 AS level
    FROM users
    WHERE manager_id = user_id AND is_active = true
    
    UNION ALL
    
    -- Recursive case: subordinates of subordinates
    SELECT u.id, s.level + 1
    FROM users u
    INNER JOIN subordinates s ON u.manager_id = s.subordinate_id
    WHERE u.is_active = true AND s.level < 10  -- Prevent infinite loops, max 10 levels
)
SELECT * FROM subordinates;
$$ LANGUAGE SQL STABLE;

-- Create a function to check if a user is manager of another user (directly or indirectly)
CREATE OR REPLACE FUNCTION is_manager_of(manager_user_id INTEGER, subordinate_user_id INTEGER)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM get_all_subordinates(manager_user_id)
        WHERE subordinate_id = subordinate_user_id
    );
$$ LANGUAGE SQL STABLE;

-- Create a function to get the management chain (all managers up to CEO)
CREATE OR REPLACE FUNCTION get_management_chain(user_id INTEGER)
RETURNS TABLE(manager_id INTEGER, level INTEGER) AS $$
WITH RECURSIVE chain AS (
    -- Base case: direct manager
    SELECT manager_id, 1 AS level
    FROM users
    WHERE id = user_id AND manager_id IS NOT NULL
    
    UNION ALL
    
    -- Recursive case: manager's manager
    SELECT u.manager_id, c.level + 1
    FROM users u
    INNER JOIN chain c ON u.id = c.manager_id
    WHERE u.manager_id IS NOT NULL AND c.level < 10  -- Prevent infinite loops
)
SELECT * FROM chain;
$$ LANGUAGE SQL STABLE;

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'manager_id';
