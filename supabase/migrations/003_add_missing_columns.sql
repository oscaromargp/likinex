-- ============================================
-- LIKINEX - Migration 003: Add Missing Columns
-- Migration: 003_add_missing_columns
-- Date: 2026-05-25
-- Description: Agrega columnas faltantes en transactions,
-- mejora credit_cards y crea tabla card_payments
-- ============================================

-- ============================================
-- 1. COLUMNAS FALTANTES EN TRANSACTIONS
-- ============================================

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS source_entity VARCHAR(255);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS destination_entity VARCHAR(255);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_destination VARCHAR(255);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS deadline_date DATE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS late_justification TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS operation_type VARCHAR(100);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recurrence_days_of_month INTEGER[];
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recurrence_end_date DATE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recurrence_count INTEGER;

-- Asegurar que status sea VARCHAR (por si migración 002 no se aplicó)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions'
    AND column_name = 'status'
    AND udt_name = 'transaction_status'
  ) THEN
    ALTER TABLE transactions ALTER COLUMN status TYPE VARCHAR(50) USING status::VARCHAR;
  END IF;
END $$;

-- Asegurar enum semi_monthly (por si migración 002 no se aplicó)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recurrence_type') THEN
    BEGIN
      ALTER TYPE recurrence_type ADD VALUE IF NOT EXISTS 'semi_monthly';
    EXCEPTION WHEN duplicate_object THEN null;
    END;
  END IF;
END $$;

-- ============================================
-- 2. MEJORAS A CREDIT_CARDS
-- ============================================

ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS brand VARCHAR(20) DEFAULT 'other';
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(15,2) DEFAULT 0;
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS available_credit DECIMAL(15,2) DEFAULT 0;
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS color VARCHAR(50) DEFAULT 'purple';
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255);
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS entity VARCHAR(255);

-- Renombrar columnas antiguas si existen con nombres distintos
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'credit_cards' AND column_name = 'statement_day'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'credit_cards' AND column_name = 'cut_off_day'
  ) THEN
    ALTER TABLE credit_cards RENAME COLUMN statement_day TO cut_off_day;
  END IF;
EXCEPTION WHEN others THEN null;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'credit_cards' AND column_name = 'due_day'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'credit_cards' AND column_name = 'payment_due_day'
  ) THEN
    ALTER TABLE credit_cards RENAME COLUMN due_day TO payment_due_day;
  END IF;
EXCEPTION WHEN others THEN null;
END $$;

-- Asegurar columnas con ambos nombres para compatibilidad
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS cut_off_day INTEGER DEFAULT 1;
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS payment_due_day INTEGER DEFAULT 20;

-- ============================================
-- 3. TABLA DE PAGOS DE TARJETAS
-- ============================================

CREATE TABLE IF NOT EXISTS card_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES credit_cards(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_type VARCHAR(20) NOT NULL DEFAULT 'minimum',
    proof_url TEXT,
    proof_type VARCHAR(20),
    reference VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_card_payments_user ON card_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_card_payments_card ON card_payments(card_id);
CREATE INDEX IF NOT EXISTS idx_card_payments_date ON card_payments(payment_date DESC);

ALTER TABLE card_payments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'card_payments' AND policyname = 'Users can view own card payments') THEN
    CREATE POLICY "Users can view own card payments" ON card_payments FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'card_payments' AND policyname = 'Users can insert own card payments') THEN
    CREATE POLICY "Users can insert own card payments" ON card_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'card_payments' AND policyname = 'Users can update own card payments') THEN
    CREATE POLICY "Users can update own card payments" ON card_payments FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'card_payments' AND policyname = 'Users can delete own card payments') THEN
    CREATE POLICY "Users can delete own card payments" ON card_payments FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
