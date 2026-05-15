import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface CategoryDB {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
  created_at: string;
}

export function useCategories(userId: string | undefined) {
  return useQuery({
    queryKey: ['categories', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) throw error;
      return data as CategoryDB[];
    },
    enabled: !!userId,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: Omit<CategoryDB, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single();

      if (error) throw error;
      return data as CategoryDB;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.user_id] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.userId] });
    },
  });
}
