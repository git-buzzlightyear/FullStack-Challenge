// client/src/components/companies/FreeTextSearch.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { useDebounce } from '@/hooks/useDebounce';

export function FreeTextSearch() {
  const [params, setParams] = useSearchParams();
  const initialQ = params.get('q')     ?? '';
  const initialText = params.get('query') ?? '';

  // 1) Keep the raw input around
  const [text, setText] = useState(initialText || initialQ);

  // 2) Debounce for 500ms
  const debounced = useDebounce(text, 500);

  // 3) If the user is *not* in AI mode (no mode param), update `q`
  useEffect(() => {
    if (!params.get('mode')) {
      const p = new URLSearchParams(params);
      if (debounced) {
        p.set('q', debounced);
      } else {
        p.delete('q');
      }
      // clear any leftover AI-search params
      p.delete('query');
      p.delete('mode');
      p.set('page', '1');
      setParams(p, { replace: true });
    }
  }, [debounced, params, setParams]);

  // 4) Handlers for the two AI buttons
  const handleBasic = () => {
    if (!text) return;
    const p = new URLSearchParams(params);
    p.set('query', text);
    p.set('mode', 'basic');
    p.delete('q');
    p.set('page', '1');
    setParams(p, { replace: true });
  };

  const handleAdvanced = () => {
    if (!text) return;
    const p = new URLSearchParams(params);
    p.set('query', text);
    p.set('mode', 'advanced');
    p.delete('q');
    p.set('page', '1');
    setParams(p, { replace: true });
  };

  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="flex-1">
        <Input
          label="Free‑text search"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="e.g. fastest-growing AR companies in Silicon Valley"
          className="flex-1"
        />
      </div>
      <button
        onClick={handleBasic}
        className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
      >
        Basic AI Search
      </button>
      <button
        onClick={handleAdvanced}
        className="rounded bg-green-600 px-3 py-2 text-white hover:bg-green-700"
      >
        Advanced AI Search
      </button>
    </div>
  );
}
