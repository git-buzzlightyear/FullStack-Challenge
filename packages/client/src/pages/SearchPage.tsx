// client/src/pages/SearchPage.tsx
import { useSearchParams } from 'react-router-dom';
import {
  useCompanies,
  useCompaniesByBasicAISearch,
  useCompaniesByAdvancedAISearch,
} from '@/hooks/useCompanies';
import { FreeTextSearch } from '@/components/companies/FreeTextSearch';
import { SearchFilters }  from '@/components/companies/SearchFilters';
import { CompanyRow }     from '@/components/companies/CompanyRow';
import { Pagination }     from '@/components/ui/Pagination';
import { Spinner }        from '@/components/ui/Spinner';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();

  const page  = Number(params.get('page') ?? '1');
  const pageSize = Number(params.get('pageSize') ?? '20');
  const query = params.get('query') ?? '';
  const mode  = params.get('mode'); // 'basic' | 'advanced' | undefined

  // pick the right hook
  const result = (() => {
    if (query && mode === 'advanced') {
      return useCompaniesByAdvancedAISearch({ query, page, pageSize });
    }
    if (query && mode === 'basic') {
      return useCompaniesByBasicAISearch({ query, page, pageSize });
    }
    return useCompanies(params);
  })();

  const { data, isLoading } = result;

  return (
    <section className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Company Search</h1>

      <FreeTextSearch />

      {!query && <SearchFilters />}

      {isLoading && <Spinner />}

      {data && (
        <>
          <div className="space-y-2">
            {data.data.map(c => (
              <CompanyRow key={c.id} c={c} />
            ))}
          </div>

          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={p => {
              const next = new URLSearchParams(params);
              next.set('page', String(p));
              next.set('pageSize', String(pageSize));
              setParams(next, { replace: true });
            }}
          />
        </>
      )}
    </section>
  );
}
