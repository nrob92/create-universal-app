import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabaseClient';
import { useAuth } from './useAuth';

export function useProfile() {
  const user = useAuth((s) => s.user);
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No profile found
        }
        throw error;
      }
      return data;
    },
    enabled: !!user?.id,
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not logged in');
      
      // Since standard Supabase client can't delete auth.users directly, 
      // we invoke an RPC function `delete_user` we will create in Postgres.
      const { error } = await supabase.rpc('delete_user');
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      useAuth.getState().signOut();
      queryClient.clear();
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    deleteAccount: deleteAccountMutation.mutateAsync,
    isDeleting: deleteAccountMutation.isPending,
  };
}
