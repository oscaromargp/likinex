export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      entities: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string;
          color: string;
          type: 'personal' | 'business' | 'service' | 'credit_card';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon?: string;
          color?: string;
          type?: 'personal' | 'business' | 'service' | 'credit_card';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          icon?: string;
          color?: string;
          type?: 'personal' | 'business' | 'service' | 'credit_card';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string;
          color: string;
          type: 'income' | 'expense';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon?: string;
          color?: string;
          type?: 'income' | 'expense';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          icon?: string;
          color?: string;
          type?: 'income' | 'expense';
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          template_id: string | null;
          credit_card_id: string | null;
          contact_id: string | null;
          entity: string;
          entity_id: string | null;
          description: string;
          amount: number;
          currency: 'MXN' | 'USD' | 'BTC' | 'ETH' | 'USDT';
          due_date: string;
          paid_date: string | null;
          status: 'pending' | 'partial' | 'settled' | 'cancelled';
          recurrence: 'none' | 'weekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'triennial' | 'yearly';
          recurrence_day: number | null;
          payment_method: 'transfer' | 'cash' | 'card' | 'check' | 'other' | null;
          category: string | null;
          category_id: string | null;
          notes: string | null;
          follow_up: string | null;
          attachment_url: string | null;
          price_change: number | null;
          type: 'income' | 'expense' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          template_id?: string | null;
          credit_card_id?: string | null;
          contact_id?: string | null;
          entity: string;
          entity_id?: string | null;
          description: string;
          amount: number;
          currency?: 'MXN' | 'USD' | 'BTC' | 'ETH' | 'USDT';
          due_date: string;
          paid_date?: string | null;
          status?: 'pending' | 'partial' | 'settled' | 'cancelled';
          recurrence?: 'none' | 'weekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'triennial' | 'yearly';
          recurrence_day?: number | null;
          payment_method?: 'transfer' | 'cash' | 'card' | 'check' | 'other' | null;
          category?: string | null;
          category_id?: string | null;
          notes?: string | null;
          follow_up?: string | null;
          attachment_url?: string | null;
          price_change?: number | null;
          type?: 'income' | 'expense' | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          template_id?: string | null;
          credit_card_id?: string | null;
          contact_id?: string | null;
          entity?: string;
          entity_id?: string | null;
          description?: string;
          amount?: number;
          currency?: 'MXN' | 'USD' | 'BTC' | 'ETH' | 'USDT';
          due_date?: string;
          paid_date?: string | null;
          status?: 'pending' | 'partial' | 'settled' | 'cancelled';
          recurrence?: 'none' | 'weekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'triennial' | 'yearly';
          recurrence_day?: number | null;
          payment_method?: 'transfer' | 'cash' | 'card' | 'check' | 'other' | null;
          category?: string | null;
          category_id?: string | null;
          notes?: string | null;
          follow_up?: string | null;
          attachment_url?: string | null;
          price_change?: number | null;
          type?: 'income' | 'expense' | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      credit_cards: {
        Row: {
          id: string;
          user_id: string;
          entity: string;
          name: string;
          last4: string;
          statement_day: number;
          due_day: number;
          current_balance: number;
          minimum_payment: number;
          has_msi: boolean;
          msi_total: number;
          interest_rate: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entity: string;
          name: string;
          last4: string;
          statement_day: number;
          due_day: number;
          current_balance?: number;
          minimum_payment?: number;
          has_msi?: boolean;
          msi_total?: number;
          interest_rate?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          entity?: string;
          name?: string;
          last4?: string;
          statement_day?: number;
          due_day?: number;
          current_balance?: number;
          minimum_payment?: number;
          has_msi?: boolean;
          msi_total?: number;
          interest_rate?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      payment_records: {
        Row: {
          id: string;
          transaction_id: string;
          amount: number;
          method: 'transfer' | 'cash' | 'card' | 'check' | 'other';
          paid_by: string | null;
          paid_at: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          amount: number;
          method: 'transfer' | 'cash' | 'card' | 'check' | 'other';
          paid_by?: string | null;
          paid_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          amount?: number;
          method?: 'transfer' | 'cash' | 'card' | 'check' | 'other';
          paid_by?: string | null;
          paid_at?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      transaction_templates: {
        Row: {
          id: string;
          user_id: string;
          entity_id: string | null;
          description: string;
          amount: number;
          currency: 'MXN' | 'USD' | 'BTC' | 'ETH' | 'USDT';
          recurrence: 'none' | 'weekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'triennial' | 'yearly';
          recurrence_day: number | null;
          payment_method: 'transfer' | 'cash' | 'card' | 'check' | 'other' | null;
          category_id: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entity_id?: string | null;
          description: string;
          amount: number;
          currency?: 'MXN' | 'USD' | 'BTC' | 'ETH' | 'USDT';
          recurrence?: 'none' | 'weekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'triennial' | 'yearly';
          recurrence_day?: number | null;
          payment_method?: 'transfer' | 'cash' | 'card' | 'check' | 'other' | null;
          category_id?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          entity_id?: string | null;
          description?: string;
          amount?: number;
          currency?: 'MXN' | 'USD' | 'BTC' | 'ETH' | 'USDT';
          recurrence?: 'none' | 'weekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'triennial' | 'yearly';
          recurrence_day?: number | null;
          payment_method?: 'transfer' | 'cash' | 'card' | 'check' | 'other' | null;
          category_id?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      service_tolerances: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          service_name: string;
          tolerance_days: number;
          criticality: 'critical' | 'non_critical';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id?: string | null;
          service_name: string;
          tolerance_days?: number;
          criticality?: 'critical' | 'non_critical';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string | null;
          service_name?: string;
          tolerance_days?: number;
          criticality?: 'critical' | 'non_critical';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone: string | null;
          email: string | null;
          address: string | null;
          bank_name: string | null;
          bank_account: string | null;
          bank_clabe: string | null;
          payment_method_preferred: 'transfer' | 'cash' | 'card' | 'check' | 'other' | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          bank_name?: string | null;
          bank_account?: string | null;
          bank_clabe?: string | null;
          payment_method_preferred?: 'transfer' | 'cash' | 'card' | 'check' | 'other' | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          bank_name?: string | null;
          bank_account?: string | null;
          bank_clabe?: string | null;
          payment_method_preferred?: 'transfer' | 'cash' | 'card' | 'check' | 'other' | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      punctuality_history: {
        Row: {
          id: string;
          user_id: string;
          entity_id: string | null;
          transaction_id: string | null;
          due_date: string;
          paid_date: string | null;
          days_late: number;
          score: number;
          level: string;
          period_month: number;
          period_year: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entity_id?: string | null;
          transaction_id?: string | null;
          due_date: string;
          paid_date?: string | null;
          days_late?: number;
          score?: number;
          level?: string;
          period_month: number;
          period_year: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          entity_id?: string | null;
          transaction_id?: string | null;
          due_date?: string;
          paid_date?: string | null;
          days_late?: number;
          score?: number;
          level?: string;
          period_month?: number;
          period_year?: number;
          created_at?: string;
        };
      };
      banks: {
        Row: {
          id: string;
          name: string;
          short_name: string;
          clabe_prefix: string;
          logo_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          short_name?: string;
          clabe_prefix?: string;
          logo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          short_name?: string;
          clabe_prefix?: string;
          logo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          entity_id: string | null;
          amount: number;
          period_type: string;
          alert_threshold: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id?: string | null;
          entity_id?: string | null;
          amount: number;
          period_type?: string;
          alert_threshold?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string | null;
          entity_id?: string | null;
          amount?: number;
          period_type?: string;
          alert_threshold?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      attachments: {
        Row: {
          id: string;
          transaction_id: string;
          file_name: string;
          file_path: string;
          file_type: string;
          file_size: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          file_name: string;
          file_path: string;
          file_type: string;
          file_size: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          file_name?: string;
          file_path?: string;
          file_type?: string;
          file_size?: number;
          created_at?: string;
        };
      };
      notifications_log: {
        Row: {
          id: string;
          type: string;
          title: string;
          message: string;
          priority: string;
          phone: string | null;
          user_id: string | null;
          transaction_id: string | null;
          status: string;
          sent_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          title: string;
          message: string;
          priority?: string;
          phone?: string | null;
          user_id?: string | null;
          transaction_id?: string | null;
          status?: string;
          sent_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          title?: string;
          message?: string;
          priority?: string;
          phone?: string | null;
          user_id?: string | null;
          transaction_id?: string | null;
          status?: string;
          sent_at?: string;
          created_at?: string;
        };
      };
    };
  };
}
