import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface CreditCardDB {
  id: string;
  user_id: string;
  entity: string;
  name: string;
  last4: string;
  // Columnas originales (migration 001)
  statement_day: number;
  due_day: number;
  // Columnas nuevas (migration 003) — equivalentes con nombres mejorados
  cut_off_day?: number;
  payment_due_day?: number;
  bank_name?: string;
  brand?: string;
  credit_limit?: number;
  available_credit?: number;
  color?: string;
  is_active?: boolean;
  current_balance: number;
  minimum_payment: number;
  has_msi: boolean;
  msi_total: number;
  interest_rate: number;
  created_at: string;
  updated_at: string;
}

export function useCreditCards(userId: string | undefined) {
  return useQuery({
    queryKey: ['credit_cards', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) throw error;
      return data as CreditCardDB[];
    },
    enabled: !!userId,
  });
}

export function useCreateCreditCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (card: Omit<CreditCardDB, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('credit_cards')
        .insert([card])
        .select()
        .single();

      if (error) throw error;
      return data as CreditCardDB;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['credit_cards', variables.user_id] });
    },
  });
}

export function useUpdateCreditCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CreditCardDB> & { id: string }) => {
      const { data, error } = await supabase
        .from('credit_cards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as CreditCardDB;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['credit_cards', (variables as Record<string, unknown>).user_id] });
    },
  });
}

export function useDeleteCreditCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const { error } = await supabase
        .from('credit_cards')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['credit_cards', variables.userId] });
    },
  });
}
