-- ============================================
-- LIKINEX - Initial Database Schema (idempotent)
-- Migration: 001_initial_schema
-- Date: 2026-05-15
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS (idempotent - safe to re-run)
-- ============================================

DO $$ BEGIN CREATE TYPE transaction_status AS ENUM ('pending', 'settled', 'cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE recurrence_type AS ENUM ('none', 'weekly', 'monthly', 'bimonthly', 'quarterly', 'triennial', 'yearly'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE payment_method AS ENUM ('transfer', 'cash', 'card', 'check', 'other'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE currency_type AS ENUM ('MXN', 'USD', 'BTC', 'ETH', 'USDT'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE entity_type AS ENUM ('personal', 'business', 'service', 'credit_card'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE category_type AS ENUM ('income', 'expense'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================
-- TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(10) NOT NULL DEFAULT '📁',
    color VARCHAR(50) NOT NULL DEFAULT 'emerald',
    type entity_type NOT NULL DEFAULT 'personal',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(10) NOT NULL DEFAULT '📁',
    color VARCHAR(50) NOT NULL DEFAULT 'emerald',
    type category_type NOT NULL DEFAULT 'expense',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID,
    entity VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency currency_type NOT NULL DEFAULT 'MXN',
    due_date DATE NOT NULL,
    paid_date DATE,
    status transaction_status NOT NULL DEFAULT 'pending',
    recurrence recurrence_type NOT NULL DEFAULT 'none',
    recurrence_day INTEGER,
    payment_method payment_method,
    category VARCHAR(100),
    notes TEXT,
    follow_up TEXT,
    attachment_url TEXT,
    price_change DECIMAL(10, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credit_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entity VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    last4 VARCHAR(4) NOT NULL,
    statement_day INTEGER NOT NULL,
    due_day INTEGER NOT NULL,
    current_balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    minimum_payment DECIMAL(15, 2) NOT NULL DEFAULT 0,
    has_msi BOOLEAN NOT NULL DEFAULT false,
    msi_total DECIMAL(15, 2) NOT NULL DEFAULT 0,
    interest_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    method payment_method NOT NULL,
    paid_by VARCHAR(255),
    paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    phone VARCHAR(20),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    transaction_id UUID,
    status VARCHAR(20) NOT NULL DEFAULT 'sent',
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES (idempotent)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_entities_user_id ON entities(user_id);
CREATE INDEX IF NOT EXISTS idx_entities_active ON entities(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_due_date ON transactions(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_transactions_entity ON transactions(user_id, entity);
CREATE INDEX IF NOT EXISTS idx_transactions_recurrence ON transactions(user_id, recurrence);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(user_id, category);
CREATE INDEX IF NOT EXISTS idx_transactions_template ON transactions(user_id, template_id);
CREATE INDEX IF NOT EXISTS idx_transactions_due_date_status ON transactions(user_id, due_date, status);
CREATE INDEX IF NOT EXISTS idx_credit_cards_user_id ON credit_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_transaction ON payment_records(transaction_id);
CREATE INDEX IF NOT EXISTS idx_attachments_transaction ON attachments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications_log(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications_log(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_log ENABLE ROW LEVEL SECURITY;

-- Entities policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'entities' AND policyname = 'Users can view own entities') THEN
    CREATE POLICY "Users can view own entities" ON entities FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'entities' AND policyname = 'Users can insert own entities') THEN
    CREATE POLICY "Users can insert own entities" ON entities FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'entities' AND policyname = 'Users can update own entities') THEN
    CREATE POLICY "Users can update own entities" ON entities FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'entities' AND policyname = 'Users can delete own entities') THEN
    CREATE POLICY "Users can delete own entities" ON entities FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Categories policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Users can view own categories') THEN
    CREATE POLICY "Users can view own categories" ON categories FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Users can insert own categories') THEN
    CREATE POLICY "Users can insert own categories" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Users can update own categories') THEN
    CREATE POLICY "Users can update own categories" ON categories FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Users can delete own categories') THEN
    CREATE POLICY "Users can delete own categories" ON categories FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Transactions policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can view own transactions') THEN
    CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can insert own transactions') THEN
    CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can update own transactions') THEN
    CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can delete own transactions') THEN
    CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Credit Cards policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'credit_cards' AND policyname = 'Users can view own credit cards') THEN
    CREATE POLICY "Users can view own credit cards" ON credit_cards FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'credit_cards' AND policyname = 'Users can insert own credit cards') THEN
    CREATE POLICY "Users can insert own credit cards" ON credit_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'credit_cards' AND policyname = 'Users can update own credit cards') THEN
    CREATE POLICY "Users can update own credit cards" ON credit_cards FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'credit_cards' AND policyname = 'Users can delete own credit cards') THEN
    CREATE POLICY "Users can delete own credit cards" ON credit_cards FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Payment Records policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_records' AND policyname = 'Users can view own payment records') THEN
    CREATE POLICY "Users can view own payment records" ON payment_records FOR SELECT USING (EXISTS (SELECT 1 FROM transactions t WHERE t.id = payment_records.transaction_id AND t.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_records' AND policyname = 'Users can insert own payment records') THEN
    CREATE POLICY "Users can insert own payment records" ON payment_records FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM transactions t WHERE t.id = payment_records.transaction_id AND t.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_records' AND policyname = 'Users can update own payment records') THEN
    CREATE POLICY "Users can update own payment records" ON payment_records FOR UPDATE USING (EXISTS (SELECT 1 FROM transactions t WHERE t.id = payment_records.transaction_id AND t.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_records' AND policyname = 'Users can delete own payment records') THEN
    CREATE POLICY "Users can delete own payment records" ON payment_records FOR DELETE USING (EXISTS (SELECT 1 FROM transactions t WHERE t.id = payment_records.transaction_id AND t.user_id = auth.uid()));
  END IF;
END $$;

-- Attachments policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'attachments' AND policyname = 'Users can view own attachments') THEN
    CREATE POLICY "Users can view own attachments" ON attachments FOR SELECT USING (EXISTS (SELECT 1 FROM transactions t WHERE t.id = attachments.transaction_id AND t.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'attachments' AND policyname = 'Users can insert own attachments') THEN
    CREATE POLICY "Users can insert own attachments" ON attachments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM transactions t WHERE t.id = attachments.transaction_id AND t.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'attachments' AND policyname = 'Users can delete own attachments') THEN
    CREATE POLICY "Users can delete own attachments" ON attachments FOR DELETE USING (EXISTS (SELECT 1 FROM transactions t WHERE t.id = attachments.transaction_id AND t.user_id = auth.uid()));
  END IF;
END $$;

-- Notifications policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications_log' AND policyname = 'Users can view own notifications') THEN
    CREATE POLICY "Users can view own notifications" ON notifications_log FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications_log' AND policyname = 'System can insert notifications') THEN
    CREATE POLICY "System can insert notifications" ON notifications_log FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- ============================================
-- TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_entities_updated_at') THEN
    CREATE TRIGGER update_entities_updated_at BEFORE UPDATE ON entities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_transactions_updated_at') THEN
    CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_credit_cards_updated_at') THEN
    CREATE TRIGGER update_credit_cards_updated_at BEFORE UPDATE ON credit_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
