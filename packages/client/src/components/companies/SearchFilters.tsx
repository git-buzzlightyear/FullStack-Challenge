// client/src/components/companies/SearchFilters.tsx
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { useDebounce } from '@/hooks/useDebounce';
import { Autocomplete } from '@/components/ui/AutoComplete';
import { COUNTRIES, INDUSTRIES } from '@/constants';

export function SearchFilters() {
  const [params, setParams] = useSearchParams();

  // 1) Local state seeded from URL params
  const [country, setCountry ] = useState(params.get('country') ?? '');
  const [industry, setIndustry] = useState(params.get('industry') ?? '');
  const [size, setSize]= useState(params.get('size') ?? '');
  const [founded, setFounded] = useState(params.get('founded') ?? '');

  // 2) Debounce each input
  const debCountry = useDebounce(country, 300);
  const debIndustry = useDebounce(industry, 300);
  const debSize = useDebounce(size, 300);
  const debFounded = useDebounce(founded, 300);

  // 3) Push debounced values into the URL
  useEffect(() => {
    const newParams = new URLSearchParams(params);

    const setOrDel = (key: string, val: string) => {
      if (val) newParams.set(key, val);
      else newParams.delete(key);
    };

    setOrDel('country', debCountry);
    setOrDel('industry', debIndustry);
    setOrDel('size', debSize);
    setOrDel('founded', debFounded);

    setParams(newParams, { replace: true });
  }, [
    debCountry,
    debIndustry,
    debSize,
    debFounded,
    params,
    setParams,
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {/* AutoComplete for Country */}
      <Autocomplete
        label="Country"
        options={COUNTRIES}
        value={country}
        onChange={setCountry}
        placeholder="us, ca, uk…"
      />

      {/* AutoComplete for Industry */}
      <Autocomplete
        label="Industry"
        options={INDUSTRIES}
        value={industry}
        onChange={setIndustry}
        placeholder="software, finance…"
      />

      {/* Numeric filters stay as Inputs */}
      <Input
        label="Min employees"
        type="number"
        min={1}
        value={size}
        onChange={e => setSize(e.target.value)}
      />
      <Input
        label="Founded ≥ year"
        type="number"
        min={1800}
        value={founded}
        onChange={e => setFounded(e.target.value)}
      />
    </div>
  );
}
