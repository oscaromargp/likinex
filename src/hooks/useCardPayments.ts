import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface CardPaymentDB {
  id: string;
  user_id: string;
  card_id: string;
  amount: number;
  payment_date: string;
  payment_type: 'minimum' | 'partial' | 'full';
  proof_url: string | null;
  proof_type: 'link' | 'image' | 'pdf' | null;
  reference: string | null;
  notes: string | null;
  created_at: string;
}

export function useCardPayments(userId: string | undefined) {
  return useQuery({
    queryKey: ['card_payments', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('card_payments')
        .select('*')
        .eq('user_id', userId)
        .order('payment_date', { ascending: false });
      if (error) throw error;
      return data as CardPaymentDB[];
    },
    enabled: !!userId,
  });
}

export function useCreateCardPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payment: Omit<CardPaymentDB, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('card_payments')
        .insert([payment])
        .select()
        .single();
      if (error) throw error;
      return data as CardPaymentDB;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['card_payments', variables.user_id] });
    },
  });
}

export function useDeleteCardPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const { error } = await supabase.from('card_payments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['card_payments', variables.userId] });
    },
  });
}
