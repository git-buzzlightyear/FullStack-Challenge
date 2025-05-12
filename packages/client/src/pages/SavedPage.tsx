import { useProspects } from '@/hooks/useProspects';
import { CompanyRow } from '@/components/companies/CompanyRow';
import { Spinner } from '@/components/ui/Spinner';

export default function SavedPage() {
  const { savedCompanies: saved, loading } = useProspects();

  return (
    <section className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Saved Prospects <span className="text-blue-600">({saved?.length ?? 0})</span>
        </h1>
      </div>

      {loading && <Spinner />}

      {!loading && saved?.length === 0 && <p>No saved companies yet.</p>}

      {!loading && saved && saved?.length > 0 && (
        <div className="space-y-2">
          {saved.map(c => (
            <CompanyRow key={c.id} c={c} />
          ))}
        </div>
      )}
    </section>
  );
}
