-- Create contact_messages table for customer care system
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('general', 'order', 'shipping', 'returns', 'technical', 'billing')),
  status VARCHAR(50) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  priority VARCHAR(50) NOT NULL DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  admin_notes TEXT,
  assigned_to VARCHAR(255),
  response TEXT,
  response_sent_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_category ON contact_messages(category);
CREATE INDEX IF NOT EXISTS idx_contact_messages_priority ON contact_messages(priority);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_contact_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_messages_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Allow authenticated users to read all messages (admin access)
CREATE POLICY "Allow authenticated users to read contact messages" ON contact_messages
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert new messages (contact form)
CREATE POLICY "Allow authenticated users to insert contact messages" ON contact_messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update messages (admin management)
CREATE POLICY "Allow authenticated users to update contact messages" ON contact_messages
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete messages (admin management)
CREATE POLICY "Allow authenticated users to delete contact messages" ON contact_messages
  FOR DELETE USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT ALL ON contact_messages TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Insert some sample data for testing
INSERT INTO contact_messages (name, email, subject, message, category, status, priority) VALUES
('John Doe', 'john@example.com', 'Order Issue', 'I have not received my order yet. It was supposed to arrive yesterday.', 'order', 'new', 'high'),
('Jane Smith', 'jane@example.com', 'Technical Support', 'I cannot download my purchased artwork. The download link is not working.', 'technical', 'new', 'urgent'),
('Mike Johnson', 'mike@example.com', 'General Question', 'What is your return policy for digital products?', 'general', 'new', 'low'),
('Sarah Wilson', 'sarah@example.com', 'Billing Inquiry', 'I was charged twice for the same order. Can you please help me with a refund?', 'billing', 'in_progress', 'high'),
('David Brown', 'david@example.com', 'Shipping Question', 'How long does shipping take for international orders?', 'shipping', 'resolved', 'medium');

-- Create a view for message statistics
CREATE OR REPLACE VIEW contact_message_stats AS
SELECT 
  COUNT(*) as total_messages,
  COUNT(CASE WHEN status = 'new' THEN 1 END) as new_messages,
  COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_messages,
  COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_messages,
  COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_messages,
  COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_messages,
  COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_messages,
  COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority_messages,
  COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority_messages,
  COUNT(CASE WHEN category = 'general' THEN 1 END) as general_messages,
  COUNT(CASE WHEN category = 'order' THEN 1 END) as order_messages,
  COUNT(CASE WHEN category = 'shipping' THEN 1 END) as shipping_messages,
  COUNT(CASE WHEN category = 'returns' THEN 1 END) as returns_messages,
  COUNT(CASE WHEN category = 'technical' THEN 1 END) as technical_messages,
  COUNT(CASE WHEN category = 'billing' THEN 1 END) as billing_messages,
  COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as today_messages,
  COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as this_week_messages
FROM contact_messages;

-- Grant access to the view
GRANT SELECT ON contact_message_stats TO authenticated;
