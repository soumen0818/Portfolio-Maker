-- Complete migration to add missing columns for coupon functionality
-- Run this script in your Supabase SQL editor

BEGIN;

-- Add coupon_code column to user_domains table
ALTER TABLE user_domains 
ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50);

-- Add comment for documentation
COMMENT ON COLUMN user_domains.coupon_code IS 'Stores the coupon code used during domain purchase (e.g., DEV100, FIRST50, etc.)';

-- Verify the column was added
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_domains' 
        AND column_name = 'coupon_code'
    ) THEN
        RAISE NOTICE 'coupon_code column added successfully to user_domains table';
    ELSE
        RAISE EXCEPTION 'Failed to add coupon_code column to user_domains table';
    END IF;
END $$;

COMMIT;

-- Show current table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'user_domains' 
ORDER BY ordinal_position;