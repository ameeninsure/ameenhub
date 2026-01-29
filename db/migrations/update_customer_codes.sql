-- Migration: Update customer code prefixes
-- CUS- → CU- for persons
-- COM- → CO- for companies
-- Run this once to update existing data

-- Update person customers: CUS-XXXXXX → CU-XXXXXX
UPDATE customers 
SET code = 'CU-' || SUBSTRING(code FROM 5)
WHERE code LIKE 'CUS-%' AND customer_type = 'person';

-- Update company customers: COM-XXXXXX → CO-XXXXXX  
UPDATE customers 
SET code = 'CO-' || SUBSTRING(code FROM 5)
WHERE code LIKE 'COM-%' AND customer_type = 'company';

-- Verify the changes
SELECT 
  customer_type,
  code,
  full_name
FROM customers
ORDER BY customer_type, code;
