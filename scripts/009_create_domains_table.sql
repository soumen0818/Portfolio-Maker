-- Create domains table for available domain TLDs and pricing
CREATE TABLE IF NOT EXISTS domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tld VARCHAR(20) NOT NULL UNIQUE, -- .com, .me, .tech, .io, .dev
  price_usd DECIMAL(10,2) NOT NULL,
  renewal_price_usd DECIMAL(10,2) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default domain pricing
INSERT INTO domains (tld, price_usd, renewal_price_usd) VALUES
('.com', 12.99, 14.99),
('.me', 19.99, 24.99),
('.tech', 29.99, 34.99),
('.io', 39.99, 44.99),
('.dev', 24.99, 29.99)
ON CONFLICT (tld) DO NOTHING;