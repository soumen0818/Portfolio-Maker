-- Create domain_mappings table for mapping domains to portfolios
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