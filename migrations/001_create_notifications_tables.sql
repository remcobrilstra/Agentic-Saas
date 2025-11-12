-- Create notification_types table
CREATE TABLE IF NOT EXISTS notification_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  enabled_by_default BOOLEAN NOT NULL DEFAULT true,
  channel VARCHAR(50) NOT NULL DEFAULT 'email',
  category VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on category for faster filtering
CREATE INDEX IF NOT EXISTS idx_notification_types_category ON notification_types(category);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  notification_id UUID NOT NULL REFERENCES notification_types(id) ON DELETE CASCADE,
  preference BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure one preference per user per notification type
  UNIQUE(user_id, notification_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_notification_id ON notification_preferences(notification_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notification_types_updated_at
  BEFORE UPDATE ON notification_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample notification types
INSERT INTO notification_types (name, description, enabled_by_default, channel, category)
VALUES 
  ('Account Updates', 'Important updates about your account', true, 'email', 'Account'),
  ('Security Alerts', 'Notifications about security events and suspicious activity', true, 'email', 'Security'),
  ('Weekly Newsletter', 'Our weekly newsletter with product updates and news', false, 'email', 'Marketing'),
  ('New Features', 'Get notified when we launch new features', true, 'email', 'Product'),
  ('Password Changes', 'Notifications when your password is changed', true, 'email', 'Security'),
  ('Payment Receipts', 'Receive receipts for your payments', true, 'email', 'Billing'),
  ('Subscription Updates', 'Updates about your subscription status', true, 'email', 'Billing'),
  ('Special Offers', 'Exclusive deals and promotions', false, 'email', 'Marketing')
ON CONFLICT DO NOTHING;
