-- ============================================
-- HelpDesk Pro - Supabase Database Schema
-- Include ALL new features: equipments, viewer role,
-- super admin, notifications, company expiry
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Companies (with expiry for SaaS)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users (with viewer role + super_admin)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('super_admin', 'admin', 'agent', 'viewer', 'client')),
  avatar_url TEXT,
  is_agent BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment (NOVEL - engenharia clínica/predial)
CREATE TABLE IF NOT EXISTS equipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  serial_number TEXT,
  brand TEXT,
  model TEXT,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('clinical', 'building', 'it', 'general')),
  location TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'decommissioned')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets (with equipment_id + public source)
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  equipment_id UUID REFERENCES equipments(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  subject TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('technical', 'billing', 'sales', 'feedback', 'clinical', 'building', 'other')),
  source TEXT NOT NULL DEFAULT 'agent' CHECK (source IN ('agent', 'customer', 'public_form', 'email')),
  ai_suggested_response TEXT,
  ai_classification TEXT,
  ai_priority_suggestion TEXT CHECK (ai_priority_suggestion IS NULL OR ai_priority_suggestion IN ('low', 'medium', 'high', 'urgent')),
  read_by_agent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Ticket Messages
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('agent', 'client', 'system')),
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_ticket', 'ticket_reply', 'ticket_resolved', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge Base
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Geral',
  is_published BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_customers_company ON customers(company_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_equipment_company ON equipments(company_id);
CREATE INDEX idx_equipment_status ON equipments(status);
CREATE INDEX idx_tickets_company ON tickets(company_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_assigned ON tickets(assigned_to);
CREATE INDEX idx_tickets_customer ON tickets(customer_id);
CREATE INDEX idx_tickets_equipment ON tickets(equipment_id);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX idx_ticket_messages_created ON ticket_messages(created_at DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_company ON notifications(company_id);
CREATE INDEX idx_knowledge_base_company ON knowledge_base(company_id);
CREATE INDEX idx_knowledge_base_published ON knowledge_base(is_published);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipments_updated_at BEFORE UPDATE ON equipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON knowledge_base
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create notification when ticket is created
CREATE OR REPLACE FUNCTION notify_new_ticket()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (company_id, user_id, type, title, message, ticket_id)
  SELECT
    NEW.company_id,
    u.id,
    'new_ticket',
    'Novo Chamado: ' || NEW.subject,
    'Um novo chamado foi criado.',
    NEW.id
  FROM users u
  WHERE u.company_id = NEW.company_id AND u.is_agent = true;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_ticket_created
  AFTER INSERT ON tickets
  FOR EACH ROW EXECUTE FUNCTION notify_new_ticket();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_company_id UUID;
BEGIN
  INSERT INTO companies (name)
    VALUES (COALESCE(NEW.raw_user_meta_data->>'company_name', 'Minha Empresa'))
    RETURNING id INTO v_company_id;

  INSERT INTO users (id, company_id, name, email, role, is_agent)
  VALUES (
    NEW.id,
    v_company_id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'admin',
    true
  );

  -- 14-day trial
  UPDATE companies SET
    expires_at = NOW() + interval '14 days',
    is_active = true
  WHERE id = v_company_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Companies
CREATE POLICY "Users can view own company" ON companies
  FOR SELECT USING (id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Super admin can view all companies" ON companies
  FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'));
CREATE POLICY "Admin can update company" ON companies
  FOR UPDATE USING (id IN (SELECT company_id FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Users
CREATE POLICY "Users can view same company users" ON users
  FOR SELECT USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Admin can manage users" ON users
  FOR ALL USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Customers
CREATE POLICY "Users can view own company customers" ON customers
  FOR SELECT USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Agents can manage customers" ON customers
  FOR ALL USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid() AND (SELECT is_agent FROM users WHERE id = auth.uid())));

-- Equipment
CREATE POLICY "Users can view own company equipment" ON equipments
  FOR SELECT USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Agents can manage equipment" ON equipments
  FOR ALL USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid() AND (SELECT is_agent FROM users WHERE id = auth.uid())));

-- Tickets
CREATE POLICY "Users can view own company tickets" ON tickets
  FOR SELECT USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Agents can manage tickets" ON tickets
  FOR ALL USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid() AND (SELECT is_agent FROM users WHERE id = auth.uid())));
-- Public form can insert tickets
CREATE POLICY "Public can create tickets" ON tickets
  FOR INSERT WITH CHECK (true);

-- Ticket messages
CREATE POLICY "Users can view ticket messages" ON ticket_messages
  FOR SELECT USING (ticket_id IN (SELECT id FROM tickets WHERE company_id IN (SELECT company_id FROM users WHERE id = auth.uid())));
CREATE POLICY "Agents can manage ticket messages" ON ticket_messages
  FOR ALL USING (ticket_id IN (SELECT id FROM tickets WHERE company_id IN (SELECT company_id FROM users WHERE id = auth.uid() AND (SELECT is_agent FROM users WHERE id = auth.uid()))));

-- Notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- Knowledge base
CREATE POLICY "Users can view KB articles" ON knowledge_base
  FOR SELECT USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Agents can manage KB" ON knowledge_base
  FOR ALL USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid() AND (SELECT is_agent FROM users WHERE id = auth.uid())));

-- ============================================
-- SEED DATA
-- ============================================

INSERT INTO companies (id, name, plan, expires_at, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Empresa Demo', 'pro', NOW() + interval '365 days', true)
ON CONFLICT (id) DO NOTHING;
