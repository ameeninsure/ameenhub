-- Customer Portal Schema
-- Migration for customer authentication and portal access
-- Country: Oman (+968)

-- Add new columns to customers table for portal access
DO $$ 
BEGIN
    -- Add mobile column (required for login) - Oman format: +968 9999 9999
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'mobile') THEN
        ALTER TABLE customers ADD COLUMN mobile VARCHAR(20);
    END IF;
    
    -- Add password_hash column for authentication
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'password_hash') THEN
        ALTER TABLE customers ADD COLUMN password_hash VARCHAR(255);
    END IF;
    
    -- Add full_name column (separate from business name)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'full_name') THEN
        ALTER TABLE customers ADD COLUMN full_name VARCHAR(255);
    END IF;
    
    -- Add customer_type: 'person' or 'company'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'customer_type') THEN
        ALTER TABLE customers ADD COLUMN customer_type VARCHAR(20) DEFAULT 'person';
    END IF;
    
    -- Add company_name: for persons who belong to a company (optional)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'company_name') THEN
        ALTER TABLE customers ADD COLUMN company_name VARCHAR(255);
    END IF;
    
    -- Add created_by column (which user created this customer)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'created_by') THEN
        ALTER TABLE customers ADD COLUMN created_by INTEGER REFERENCES users(id);
    END IF;
    
    -- Add avatar_url column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'avatar_url') THEN
        ALTER TABLE customers ADD COLUMN avatar_url VARCHAR(500);
    END IF;
    
    -- Add last_login_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'last_login_at') THEN
        ALTER TABLE customers ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add preferred_language column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'preferred_language') THEN
        ALTER TABLE customers ADD COLUMN preferred_language VARCHAR(5) DEFAULT 'en';
    END IF;
END $$;

-- Create unique index on mobile for login
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_mobile ON customers(mobile) WHERE mobile IS NOT NULL;

-- Create index on created_by for filtering by user
CREATE INDEX IF NOT EXISTS idx_customers_created_by ON customers(created_by);

-- Create index on customer_type
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(customer_type);

-- Update existing customers to have full_name from name if not set
UPDATE customers SET full_name = name WHERE full_name IS NULL AND name IS NOT NULL;

-- Set default customer_type to 'person' for existing records
UPDATE customers SET customer_type = 'person' WHERE customer_type IS NULL;
