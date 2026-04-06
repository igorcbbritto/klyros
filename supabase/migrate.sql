-- ============================================
-- HelpDesk Pro - Migration para banco existente
-- Rodar APENAS se já tiver o schema antigo
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Novas colunas em companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE DEFAULT gen_random_uuid();
ALTER TABLE companies ADD COLUMN IF NOT EXISTS allow_public_chat BOOLEAN DEFAULT true;

-- 2. Nova tabela equipments (antes do FK)
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

-- 3. Novas colunas em tickets (agora que equipments existe)
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS equipment_id UUID;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS read_by_agent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'agent' CHECK (source IN ('agent', 'customer', 'public_form', 'email'));

-- 4. FK equipment_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'tickets_equipment_id_fkey'
  ) THEN
    ALTER TABLE tickets
      ADD CONSTRAINT tickets_equipment_id_fkey
      FOREIGN KEY (equipment_id) REFERENCES equipments(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 5. Check constraints atualizadas (role, category)
-- users role
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('super_admin', 'admin', 'agent', 'viewer', 'client'));

-- tickets category
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_category_check;
ALTER TABLE tickets ADD CONSTRAINT tickets_category_check CHECK (category IN ('technical', 'billing', 'sales', 'feedback', 'clinical', 'building', 'other'));

-- 6. Nova tabela notifications
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

-- 7. Índices novos
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_equipment_company ON equipments(company_id);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipments(status);
CREATE INDEX IF NOT EXISTS idx_tickets_equipment ON tickets(equipment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_company ON notifications(company_id);

-- 8. Trigger updated_at para equipments
DROP TRIGGER IF EXISTS update_equipments_updated_at ON equipments;
CREATE TRIGGER update_equipments_updated_at
  BEFORE UPDATE ON equipments FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 9. Trigger de notificação no novo ticket
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

DROP TRIGGER IF EXISTS on_new_ticket_created ON tickets;
CREATE TRIGGER on_new_ticket_created
  AFTER INSERT ON tickets FOR EACH ROW
  EXECUTE FUNCTION notify_new_ticket();

-- 10. Atualizar trigger de signup com trial
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

  UPDATE companies SET
    expires_at = NOW() + interval '14 days',
    is_active = true
  WHERE id = v_company_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. RLS para novas tabelas
ALTER TABLE equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company equipment" ON equipments
  FOR SELECT USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Agents can manage equipment" ON equipments
  FOR ALL USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid() AND (SELECT is_agent FROM users WHERE id = auth.uid())));

CREATE POLICY "Users can view own notifications" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- 12. RLS para tickets (INSERT público)
DROP POLICY IF EXISTS "Public can create tickets" ON tickets;
CREATE POLICY "Public can create tickets" ON tickets
  FOR INSERT WITH CHECK (true);

-- 13. RLS para companies (super admin)
DROP POLICY IF EXISTS "Super admin can view all companies" ON companies;
CREATE POLICY "Super admin can view all companies" ON companies
  FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'));

-- 14. Seed company com novas colunas
INSERT INTO companies (id, name, plan, expires_at, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Empresa Demo', 'pro', NOW() + interval '365 days', true)
ON CONFLICT (id) DO UPDATE SET expires_at = EXCLUDED.expires_at, is_active = EXCLUDED.is_active;
