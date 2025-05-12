import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchSavedProspects,
  toggleProspect,
} from '@/api/prospects';
import { USER_ID } from '@/constants';

export function useProspects() {
  const qc = useQueryClient();

  const { data: savedCompanies, isLoading: loading } = useQuery({
    queryKey: ['prospects', USER_ID],
    queryFn: () => fetchSavedProspects(USER_ID),
  });

  const toggleM = useMutation({
    mutationFn: (companyId: string) => toggleProspect(USER_ID, companyId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prospects', USER_ID] }),
  });

  const savedIds = savedCompanies?.map(c => c.id) ?? [];

  return {
    savedCompanies,
    savedIds,
    loading,
    toggle: toggleM.mutate,
    saving: toggleM.status === 'pending',
  };
}

