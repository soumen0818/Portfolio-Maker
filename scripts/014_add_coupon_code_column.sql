-- Add coupon_code column to user_domains table
-- This fixes the PGRST204 error when creating domain records with coupon codes

ALTER TABLE user_domains 
ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50);

-- Add comment for documentation
COMMENT ON COLUMN user_domains.coupon_code IS 'Stores the coupon code used during domain purchase (e.g., DEV100, FIRST50, etc.)';

-- Show updated table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_domains' 
ORDER BY ordinal_position;