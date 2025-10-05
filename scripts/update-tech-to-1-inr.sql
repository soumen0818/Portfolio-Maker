-- Update .tech domain pricing to ₹1
-- Run this in Supabase SQL Editor

UPDATE domains 
SET 
    price_usd = 1,
    renewal_price_usd = 1
WHERE tld = '.tech';

-- Verify the update
SELECT 
    tld,
    price_usd as "Price (₹)",
    renewal_price_usd as "Renewal Price (₹)"
FROM domains 
ORDER BY tld;