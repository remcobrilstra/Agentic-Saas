-- Create support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for user_id to optimize queries
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);

-- Create index for status to optimize queries
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);

-- Create FAQ entries table
CREATE TABLE IF NOT EXISTS faq_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for category to optimize queries
CREATE INDEX IF NOT EXISTS idx_faq_entries_category ON faq_entries(category);

-- Create index for order to support sorting
CREATE INDEX IF NOT EXISTS idx_faq_entries_order ON faq_entries(order_index);

-- Add triggers to update updated_at timestamp
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faq_entries_updated_at
  BEFORE UPDATE ON faq_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security) for support_tickets
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own tickets
CREATE POLICY "Users can view their own support tickets"
  ON support_tickets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own tickets
CREATE POLICY "Users can create support tickets"
  ON support_tickets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own open tickets (before response)
CREATE POLICY "Users can update their own open tickets"
  ON support_tickets
  FOR UPDATE
  USING (auth.uid() = user_id AND response IS NULL);

-- Enable RLS for faq_entries
ALTER TABLE faq_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read FAQ entries
CREATE POLICY "Anyone can read FAQ entries"
  ON faq_entries
  FOR SELECT
  USING (true);

-- Note: Admin policies for support_tickets and faq_entries management
-- will be handled through service role key in admin operations
