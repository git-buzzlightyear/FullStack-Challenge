import { useState, useEffect } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { getCompanyById, ensureCompanySummary } from '@/api/companies';
import type { Company } from '@/api/companies';

export function useCompanySummary(companyId: string, active: boolean) {
  const qc = useQueryClient();

  // 1) A query that’s disabled by default; we'll call refetch() manually
  const {
    data: company,
    isFetching,
    refetch,
  } = useQuery<Company, Error>({
    queryKey: ['company', companyId],
    queryFn: () => getCompanyById(companyId),
    enabled: false,
    staleTime: Infinity,
  });

  // 2) Mutation to enqueue the summary job & get back whatever the API returns
  const mutation = useMutation<Company, Error, void>({
    mutationFn: () => ensureCompanySummary(companyId),
    onSuccess: newCompany => {
      qc.setQueryData(['company', companyId], newCompany);
    },
  });

  // 3) When `active` flips true, enqueue + immediately fetch
  const [didEnsure, setDidEnsure] = useState(false);
  useEffect(() => {
    if (active && !didEnsure) {
      mutation.mutate();  // enqueue and fetch current record
      refetch();          // in case summary already existed
      setDidEnsure(true);
    }
  }, [active, didEnsure, mutation, refetch]);

  // 4) Poll every 3s until we see a summary
  useEffect(() => {
    if (!active) return;
    if (company?.summary) return;

    const handle = setInterval(() => {
      refetch();
    }, 3000);
    return () => clearInterval(handle);
  }, [active, company?.summary, refetch]);

  return {
    company,
    isFetching, // are we currently fetching the record?
    ensureLoading: mutation.status === 'pending',
    ensure: () => mutation.mutate(),
  };
}
