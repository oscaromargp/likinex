import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface TransactionDB {
  id: string;
  user_id: string;
  template_id: string | null;
  entity: string;
  description: string;
  amount: number;
  currency: string;
  due_date: string;
  paid_date: string | null;
  status: string;
  recurrence: string;
  recurrence_day: number | null;
  payment_method: string | null;
  category: string | null;
  notes: string | null;
  follow_up: string | null;
  attachment_url: string | null;
  price_change: number | null;
  created_at: string;
  updated_at: string;
}

export function useTransactions(userId: string | undefined) {
  return useQuery({
    queryKey: ['transactions', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data as TransactionDB[];
    },
    enabled: !!userId,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: Omit<TransactionDB, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transaction])
        .select()
        .single();

      if (error) throw error;
      return data as TransactionDB;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions', variables.user_id] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TransactionDB> & { id: string }) => {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as TransactionDB;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions', (variables as any).user_id] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions', variables.userId] });
    },
  });
}
