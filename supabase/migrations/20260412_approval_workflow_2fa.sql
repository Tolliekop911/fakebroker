-- Add approval fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approval_status VARCHAR DEFAULT 'pending';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approved_by UUID;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Wallet accounts table
CREATE TABLE IF NOT EXISTS wallet_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL NOT NULL DEFAULT 0,
  currency VARCHAR DEFAULT 'ZAR',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Deposits table
CREATE TABLE IF NOT EXISTS deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  currency VARCHAR DEFAULT 'ZAR',
  status VARCHAR DEFAULT 'pending',
  payment_method VARCHAR,
  reference_number VARCHAR UNIQUE,
  confirmed_by UUID,
  confirmed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- Transfers table
CREATE TABLE IF NOT EXISTS transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_account_id UUID,
  to_account_id UUID,
  amount DECIMAL NOT NULL,
  status VARCHAR DEFAULT 'pending_2fa',
  two_fa_verified BOOLEAN DEFAULT false,
  two_fa_verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- Withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_account_id UUID REFERENCES wallet_accounts(id),
  amount DECIMAL NOT NULL,
  bank_details TEXT,
  status VARCHAR DEFAULT 'pending_approval',
  two_fa_verified BOOLEAN DEFAULT false,
  two_fa_code_sent_at TIMESTAMP,
  approved_by UUID,
  approved_at TIMESTAMP,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- Approval audit log
CREATE TABLE IF NOT EXISTS approval_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_type VARCHAR NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- RLS Policies
ALTER TABLE wallet_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- Users can see only their own wallet
CREATE POLICY "wallet_user_access" ON wallet_accounts 
  FOR SELECT USING (auth.uid() = user_id OR EXISTS(
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Users can see only their deposits
CREATE POLICY "deposits_user_access" ON deposits 
  FOR SELECT USING (auth.uid() = user_id OR EXISTS(
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Helper functions
CREATE OR REPLACE FUNCTION add_funds_to_wallet(p_user_id UUID, p_amount DECIMAL)
RETURNS void AS $$
BEGIN
  INSERT INTO wallet_accounts (user_id, balance) 
  VALUES (p_user_id, p_amount)
  ON CONFLICT (user_id) DO UPDATE 
  SET balance = wallet_accounts.balance + p_amount,
      updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION deduct_from_wallet(p_wallet_id UUID, p_amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE wallet_accounts 
  SET balance = balance - p_amount,
      updated_at = now()
  WHERE id = p_wallet_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_deposits_user_status ON deposits(user_id, status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_status ON withdrawals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_wallet_user ON wallet_accounts(user_id);
