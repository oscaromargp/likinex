import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface EntityDB {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useEntities(userId: string | undefined) {
  return useQuery({
    queryKey: ['entities', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('entities')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) throw error;
      return data as EntityDB[];
    },
    enabled: !!userId,
  });
}

export function useCreateEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entity: Omit<EntityDB, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('entities')
        .insert([entity])
        .select()
        .single();

      if (error) throw error;
      return data as EntityDB;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['entities', variables.user_id] });
    },
  });
}

export function useUpdateEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EntityDB> & { id: string }) => {
      const { data, error } = await supabase
        .from('entities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as EntityDB;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['entities', (variables as any).user_id] });
    },
  });
}

export function useDeleteEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const { error } = await supabase
        .from('entities')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['entities', variables.userId] });
    },
  });
}
