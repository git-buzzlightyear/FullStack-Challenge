// client/src/components/companies/CompanyRow.tsx
import { useState, useEffect } from 'react';
import type { Company } from '@/api/companies';
import { useProspects } from '@/hooks/useProspects';
import { useCompanySummary } from '@/hooks/useCompanySummary';
import { clsx } from 'clsx';

interface Props { c: Company; }

export function CompanyRow({ c }: Props) {
  const { savedIds, loading, toggle, saving } = useProspects();
  const isSaved = savedIds.includes(c.id);

  // show/hide summary panel
  const [show, setShow] = useState(false);
  const { company, isFetching, ensureLoading } = useCompanySummary(c.id, show);

  const summary = show ? company?.summary : undefined;
  const busy = ensureLoading || (show && !summary && isFetching);

  // clean up polling on unmount
  useEffect(() => () => {}, []);

  return (
    <div className={clsx(
      'flex items-start justify-between gap-4 p-4 border rounded-lg',
      isSaved ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
    )}>
      <div className="flex-1 space-y-2">
        <h3 className="font-semibold text-lg">{c.name}</h3>
        <p className="text-sm text-gray-600">
          {c.industry ?? '—'} · {c.country?.toUpperCase() ?? '—'}
        </p>

        {/* details grid (founded, size, location, LinkedIn) */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-700">
          {c.founded != null && <>
            <dt className="font-medium">Founded</dt>
            <dd>{c.founded}</dd>
          </>}
          {c.size && <>
            <dt className="font-medium">Employees</dt>
            <dd>{c.size}</dd>
          </>}
          {(c.locality||c.region) && <>
            <dt className="font-medium">Location</dt>
            <dd>[{[c.locality,c.region,c.country].filter(Boolean).join(', ')}]</dd>
          </>}
          {c.linkedin_url && <>
            <dt className="font-medium">LinkedIn</dt>
            <dd>
              <a
                href={c.linkedin_url.startsWith('http')
                  ? c.linkedin_url
                  : `https://${c.linkedin_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Profile ↗
              </a>
            </dd>
          </>}
        </dl>

        {/* summary panel */}
        {show ? (
          <div className="mt-2 space-y-1">
            {busy && <p className="text-sm text-gray-500">Loading summary…</p>}
            {!busy && summary && (
              <p className="text-sm text-gray-700">{summary}</p>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShow(true)}
            disabled={busy}
            className="mt-2 text-sm text-blue-600 hover:underline disabled:opacity-50"
          >
            Show summary…
          </button>
        )}
      </div>

      <button
        onClick={() => saving ? undefined : toggle(c.id)}
        disabled={loading || saving}
        className={clsx(
          'text-2xl transition',
          isSaved ? 'text-yellow-400 hover:text-yellow-300'
                  : 'text-gray-400 hover:text-gray-600'
        )}
        title={isSaved ? 'Unsave' : 'Save'}
      >
        {isSaved ? '★' : '☆'}
      </button>
    </div>
  );
}
