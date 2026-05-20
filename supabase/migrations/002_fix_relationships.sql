-- ============================================
-- LIKINEX - Migration 002: Fix Relationships
-- Migration: 002_fix_relationships
-- Date: 2026-05-20
-- Description: Arregla relaciones entre tablas según
-- RELATIONSHIP_REPORT.md
-- ============================================

-- ============================================
-- 1. CREAR TABLA DE PLANTILLAS (Templates)
-- ============================================

CREATE TABLE IF NOT EXISTS transaction_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency currency_type NOT NULL DEFAULT 'MXN',
    recurrence recurrence_type NOT NULL DEFAULT 'none',
    recurrence_day INTEGER,
    payment_method payment_method,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_user_id ON transaction_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_entity ON transaction_templates(entity_id);
CREATE INDEX IF NOT EXISTS idx_templates_active ON transaction_templates(user_id, is_active);

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS credit_card_id UUID REFERENCES credit_cards(id) ON DELETE SET NULL;

ALTER TABLE transaction_templates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transaction_templates' AND policyname = 'Users can view own templates') THEN
    CREATE POLICY "Users can view own templates" ON transaction_templates FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transaction_templates' AND policyname = 'Users can insert own templates') THEN
    CREATE POLICY "Users can insert own templates" ON transaction_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transaction_templates' AND policyname = 'Users can update own templates') THEN
    CREATE POLICY "Users can update own templates" ON transaction_templates FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transaction_templates' AND policyname = 'Users can delete own templates') THEN
    CREATE POLICY "Users can delete own templates" ON transaction_templates FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- 2. CREAR TABLA DE TOLERANCIAS DE SERVICIO
-- ============================================

CREATE TABLE IF NOT EXISTS service_tolerances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    service_name VARCHAR(255) NOT NULL,
    tolerance_days INTEGER NOT NULL DEFAULT 2,
    criticality VARCHAR(20) NOT NULL DEFAULT 'critical',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_tolerances_user ON service_tolerances(user_id);
CREATE INDEX IF NOT EXISTS idx_service_tolerances_category ON service_tolerances(category_id);

ALTER TABLE service_tolerances ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_tolerances' AND policyname = 'Users can view own tolerances') THEN
    CREATE POLICY "Users can view own tolerances" ON service_tolerances FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_tolerances' AND policyname = 'Users can insert own tolerances') THEN
    CREATE POLICY "Users can insert own tolerances" ON service_tolerances FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_tolerances' AND policyname = 'Users can update own tolerances') THEN
    CREATE POLICY "Users can update own tolerances" ON service_tolerances FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_tolerances' AND policyname = 'Users can delete own tolerances') THEN
    CREATE POLICY "Users can delete own tolerances" ON service_tolerances FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- 3. CREAR TABLA DE CONTACTOS
-- ============================================

CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    bank_name VARCHAR(255),
    bank_account VARCHAR(255),
    bank_clabe VARCHAR(18),
    payment_method_preferred payment_method,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_active ON contacts(user_id, is_active);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Users can view own contacts') THEN
    CREATE POLICY "Users can view own contacts" ON contacts FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Users can insert own contacts') THEN
    CREATE POLICY "Users can insert own contacts" ON contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Users can update own contacts') THEN
    CREATE POLICY "Users can update own contacts" ON contacts FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Users can delete own contacts') THEN
    CREATE POLICY "Users can delete own contacts" ON contacts FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- 4. CREAR TABLA DE HISTORIAL DE PUNTUALIDAD
-- ============================================

CREATE TABLE IF NOT EXISTS punctuality_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    paid_date DATE,
    days_late INTEGER NOT NULL DEFAULT 0,
    score INTEGER NOT NULL DEFAULT 100,
    level VARCHAR(20) NOT NULL DEFAULT 'on-time',
    period_month INTEGER NOT NULL,
    period_year INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_punctuality_user ON punctuality_history(user_id);
CREATE INDEX IF NOT EXISTS idx_punctuality_entity ON punctuality_history(entity_id);
CREATE INDEX IF NOT EXISTS idx_punctuality_period ON punctuality_history(user_id, period_year, period_month);

ALTER TABLE punctuality_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'punctuality_history' AND policyname = 'Users can view own punctuality') THEN
    CREATE POLICY "Users can view own punctuality" ON punctuality_history FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'punctuality_history' AND policyname = 'Users can insert own punctuality') THEN
    CREATE POLICY "Users can insert own punctuality" ON punctuality_history FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- 5. CREAR TABLA DE PRESUPUESTOS
-- ============================================

CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL,
    period_type VARCHAR(20) NOT NULL DEFAULT 'monthly',
    alert_threshold DECIMAL(5, 2) NOT NULL DEFAULT 80.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budgets_user ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category_id);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'budgets' AND policyname = 'Users can view own budgets') THEN
    CREATE POLICY "Users can view own budgets" ON budgets FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'budgets' AND policyname = 'Users can insert own budgets') THEN
    CREATE POLICY "Users can insert own budgets" ON budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'budgets' AND policyname = 'Users can update own budgets') THEN
    CREATE POLICY "Users can update own budgets" ON budgets FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'budgets' AND policyname = 'Users can delete own budgets') THEN
    CREATE POLICY "Users can delete own budgets" ON budgets FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- 6. ACTUALIZAR STATUS Y RECURRENCE TYPES
-- ============================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
    CREATE TYPE transaction_status AS ENUM ('pending', 'partial', 'settled', 'cancelled');
  ELSE
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'partial') THEN
      ALTER TYPE transaction_status ADD VALUE IF NOT EXISTS 'partial';
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recurrence_type') THEN
    CREATE TYPE recurrence_type AS ENUM ('none', 'weekly', 'monthly', 'semi_monthly', 'bimonthly', 'quarterly', 'triennial', 'yearly');
  ELSE
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'semi_monthly') THEN
      ALTER TYPE recurrence_type ADD VALUE IF NOT EXISTS 'semi_monthly';
    END IF;
  END IF;
END $$;

-- ============================================
-- 7. AGREGAR CAMPOS A TRANSACTIONS
-- ============================================

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS entity_id UUID REFERENCES entities(id) ON DELETE SET NULL;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS credit_card_id UUID REFERENCES credit_cards(id) ON DELETE SET NULL;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recurrence_days INTEGER[];
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS tolerance_days INTEGER DEFAULT 2;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS type VARCHAR(20);
ALTER TABLE transactions ALTER COLUMN status TYPE VARCHAR(50) USING status::VARCHAR;

-- ============================================
-- 8. FUNCIONES Y TRIGGER PARA TOLERANCIAS
-- ============================================

CREATE OR REPLACE FUNCTION update_tolerances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_service_tolerances_updated_at') THEN
    CREATE TRIGGER update_service_tolerances_updated_at BEFORE UPDATE ON service_tolerances FOR EACH ROW EXECUTE FUNCTION update_tolerances_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_budgets_updated_at') THEN
    CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_tolerances_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_contacts_updated_at') THEN
    CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_tolerances_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_templates_updated_at') THEN
    CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON transaction_templates FOR EACH ROW EXECUTE FUNCTION update_tolerances_updated_at();
  END IF;
END $$;

-- ============================================
-- 9. FUNCIÓN PARA ACTUALIZAR STATUS AUTOMÁTICO
-- (basado en payment_records)
-- ============================================

CREATE OR REPLACE FUNCTION update_transaction_status_from_payments()
RETURNS TRIGGER AS $$
DECLARE
    tx_amount DECIMAL(15, 2);
    paid_total DECIMAL(15, 2);
    tx_id UUID;
BEGIN
    tx_id := NEW.transaction_id;
    
    SELECT amount INTO tx_amount FROM transactions WHERE id = tx_id;
    
    SELECT COALESCE(SUM(amount), 0) INTO paid_total FROM payment_records WHERE transaction_id = tx_id;
    
    IF paid_total >= tx_amount THEN
        UPDATE transactions SET status = 'settled' WHERE id = tx_id;
    ELSIF paid_total > 0 THEN
        UPDATE transactions SET status = 'partial' WHERE id = tx_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_status_on_payment') THEN
    CREATE TRIGGER update_status_on_payment AFTER INSERT OR UPDATE ON payment_records
    FOR EACH ROW EXECUTE FUNCTION update_transaction_status_from_payments();
  END IF;
END $$;