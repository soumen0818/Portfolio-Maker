-- Add INR pricing columns to domains table
ALTER TABLE domains 
ADD COLUMN IF NOT EXISTS price_inr DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS renewal_price_inr DECIMAL(10,2);

-- Update all domains with INR pricing (99 INR for all domains)
UPDATE domains 
SET 
    price_inr = 99,
    renewal_price_inr = 99;

-- Show updated table structure
SELECT tld, price_usd, price_inr, renewal_price_usd, renewal_price_inr, is_available 
FROM domains 
ORDER BY tld;