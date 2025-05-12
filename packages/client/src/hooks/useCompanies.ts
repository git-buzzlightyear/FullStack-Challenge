// client/src/hooks/useCompanies.ts
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchCompanies, fetchCompaniesByBasicAISearch, fetchCompaniesByAdvancedAISearch, type Page, type Company } from '@/api/companies';

export function useCompanies(params: URLSearchParams) {
  return useQuery<Page<Company>, Error>({
    queryKey: ['companies', params.toString()],
    queryFn: () => {
      const obj = Object.fromEntries(params) as Record<string, string>;
      const clean: Record<string, string | number> = {};
      for (const [k, v] of Object.entries(obj)) {
        if (v !== '') clean[k] = v;
      }

      console.log('clean', clean);

      return fetchCompanies(clean);
    },
    staleTime: 60_000,
  });
}

export function useCompaniesByBasicAISearch(opts: {
  query: string;
  page: number;
  pageSize: number;
}) {
  const { query, page, pageSize } = opts;
  return useQuery<Page<Company>, Error>({
    queryKey: ['ai-basic-companies', query, page, pageSize],
    queryFn: () => fetchCompaniesByBasicAISearch({ query, page, pageSize }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useCompaniesByAdvancedAISearch(opts: {
  query: string;
  page: number;
  pageSize: number;
}) {
  const { query, page, pageSize } = opts;
  return useQuery<Page<Company>, Error>({
    queryKey: ['ai-advanced-companies', query, page, pageSize],
    queryFn: () => fetchCompaniesByAdvancedAISearch({ query, page, pageSize }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}
