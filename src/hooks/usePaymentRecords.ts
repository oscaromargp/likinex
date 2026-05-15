import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface PaymentRecordDB {
  id: string;
  transaction_id: string;
  amount: number;
  method: string;
  paid_by: string | null;
  paid_at: string;
  notes: string | null;
  created_at: string;
}

export function usePaymentRecords(transactionId: string | undefined) {
  return useQuery({
    queryKey: ['payment_records', transactionId],
    queryFn: async () => {
      if (!transactionId) return [];
      const { data, error } = await supabase
        .from('payment_records')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('paid_at', { ascending: false });

      if (error) throw error;
      return data as PaymentRecordDB[];
    },
    enabled: !!transactionId,
  });
}

export function useCreatePaymentRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: Omit<PaymentRecordDB, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('payment_records')
        .insert([record])
        .select()
        .single();

      if (error) throw error;
      return data as PaymentRecordDB;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payment_records', variables.transaction_id] });
    },
  });
}

export function useDeletePaymentRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, transactionId }: { id: string; transactionId: string }) => {
      const { error } = await supabase
        .from('payment_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payment_records', variables.transactionId] });
    },
  });
}
