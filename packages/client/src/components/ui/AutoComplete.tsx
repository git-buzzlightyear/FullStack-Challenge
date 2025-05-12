// client/src/components/ui/Autocomplete.tsx
import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

interface AutocompleteProps {
  label?: string;
  options: string[];
  value: string;
  onChange(value: string): void;
  placeholder?: string;
}

export function Autocomplete({
  label,
  options,
  value,
  onChange,
  placeholder,
}: AutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep inputValue in sync if parent value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Filter options by substring match
  const filtered = options
    .filter(opt => opt.toLowerCase().includes(inputValue.toLowerCase()))
    .slice(0, 10);

  function selectOption(opt: string) {
    setInputValue(opt);
    onChange(opt);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}

      <input
        type="text"
        className={clsx(
          'w-full rounded-md border border-gray-300 bg-white p-2 shadow-sm ',
          'focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ',
          'dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600'
        )}
        placeholder={placeholder}
        value={inputValue}
        onChange={e => {
          setInputValue(e.target.value);
          onChange(e.target.value);
          setHighlightIndex(0);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={e => {
          if (!isOpen) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightIndex(i => (i + 1) % filtered.length);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightIndex(i => (i + filtered.length - 1) % filtered.length);
          } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filtered[highlightIndex]) {
              selectOption(filtered[highlightIndex]);
            }
          } else if (e.key === 'Escape') {
            setIsOpen(false);
          }
        }}
      />

      {isOpen && filtered.length > 0 && (
        <ul
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base
            shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none
            dark:bg-gray-800 dark:text-gray-100"
        >
          {filtered.map((opt, idx) => (
            <li
              key={opt}
              className={clsx(
                'cursor-pointer px-3 py-2 text-sm',
                idx === highlightIndex
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-900 dark:text-gray-100'
              )}
              onMouseEnter={() => setHighlightIndex(idx)}
              onMouseDown={e => {
                e.preventDefault();
                selectOption(opt);
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
