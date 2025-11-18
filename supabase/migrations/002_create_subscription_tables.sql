-- Create subscription_types table
CREATE TABLE IF NOT EXISTS subscription_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  marketing_points TEXT[], -- Array of bullet points
  feature_flags JSONB NOT NULL DEFAULT '{}', -- JSON object of feature flags
  quota_limits JSONB NOT NULL DEFAULT '{}', -- JSON object of quota limits {feature_name: limit}
  price_monthly DECIMAL(10, 2),
  price_annual DECIMAL(10, 2),
  stripe_monthly_id VARCHAR(255),
  stripe_annual_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_type_id UUID NOT NULL REFERENCES subscription_types(id) ON DELETE RESTRICT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create subscription_consumption table
CREATE TABLE IF NOT EXISTS subscription_consumption (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  feature VARCHAR(100) NOT NULL,
  usage INTEGER NOT NULL DEFAULT 0 CHECK (usage >= 0),
  month DATE NOT NULL, -- First day of the month
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure one consumption record per subscription per feature per month
  UNIQUE(subscription_id, feature, month)
);

-- Create subscription_users table
CREATE TABLE IF NOT EXISTS subscription_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'subscription_owner' CHECK (role IN ('subscription_owner')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure one role per user per subscription
  UNIQUE(subscription_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscription_type_id ON subscriptions(subscription_type_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscription_consumption_subscription_id ON subscription_consumption(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_consumption_month ON subscription_consumption(month);
CREATE INDEX IF NOT EXISTS idx_subscription_users_subscription_id ON subscription_users(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_users_user_id ON subscription_users(user_id);

-- Create triggers to update updated_at timestamp
CREATE TRIGGER update_subscription_types_updated_at
  BEFORE UPDATE ON subscription_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_consumption_updated_at
  BEFORE UPDATE ON subscription_consumption
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_users_updated_at
  BEFORE UPDATE ON subscription_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample subscription types (Basic and Pro for demo)
INSERT INTO subscription_types (name, description, marketing_points, feature_flags, quota_limits, price_monthly, price_annual, stripe_monthly_id, stripe_annual_id)
VALUES 
  (
    'Basic',
    'Perfect for individuals and small projects',
    ARRAY[
      'Access to basic dashboard',
      'Email notifications',
      '1,000 API calls per month',
      '10 GB storage',
      'Community support'
    ],
    '{"dashboard_basic": true, "email_notifications": true, "advanced_analytics": false, "priority_support": false}'::jsonb,
    '{"api_calls": 1000, "storage_gb": 10}'::jsonb,
    0.00,
    0.00,
    'price_basic_monthly',
    'price_basic_annual'
  ),
  (
    'Pro',
    'For professionals and growing teams',
    ARRAY[
      'Everything in Basic',
      'Advanced analytics dashboard',
      '10,000 API calls per month',
      '100 GB storage',
      'Priority support',
      'Custom integrations',
      'Team collaboration features'
    ],
    '{"dashboard_basic": true, "email_notifications": true, "advanced_analytics": true, "priority_support": true, "custom_integrations": true}'::jsonb,
    '{"api_calls": 10000, "storage_gb": 100}'::jsonb,
    29.00,
    290.00,
    'price_pro_monthly',
    'price_pro_annual'
  )
ON CONFLICT (name) DO NOTHING;
