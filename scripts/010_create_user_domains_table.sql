-- Create user_domains table for purchased domains
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

-- Create index for faster domain lookups
CREATE INDEX IF NOT EXISTS idx_user_domains_domain_name ON user_domains(domain_name);
CREATE INDEX IF NOT EXISTS idx_user_domains_user_id ON user_domains(user_id);