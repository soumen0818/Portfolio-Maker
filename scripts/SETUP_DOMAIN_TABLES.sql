-- =====================================================
-- DOMAIN SYSTEM SETUP - Copy and paste this entire script into Supabase SQL Editor
-- =====================================================

-- 1. Create domains table for available domain TLDs and pricing
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

-- 2. Create user_domains table for purchased domains
CREATE TABLE IF NOT EXISTS user_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_name VARCHAR(255) NOT NULL UNIQUE, -- full domain like soumendas.me
  tld VARCHAR(20) NOT NULL,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE SET NULL,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  payment_id VARCHAR(255), -- Stripe payment intent ID
  amount_paid DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster domain lookups
CREATE INDEX IF NOT EXISTS idx_user_domains_domain_name ON user_domains(domain_name);
CREATE INDEX IF NOT EXISTS idx_user_domains_user_id ON user_domains(user_id);

-- 3. Create domain_mappings table for mapping domains to portfolios
CREATE TABLE IF NOT EXISTS domain_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_domain_id UUID REFERENCES user_domains(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  ssl_status VARCHAR(50) DEFAULT 'pending', -- pending, active, failed
  dns_configured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_domain_id, portfolio_id)
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_domain_mappings_user_domain ON domain_mappings(user_domain_id);
CREATE INDEX IF NOT EXISTS idx_domain_mappings_portfolio ON domain_mappings(portfolio_id);

-- =====================================================
-- SETUP COMPLETE! 
-- Your domain system tables are now ready.
-- =====================================================