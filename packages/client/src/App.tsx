import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import SearchPage from './pages/SearchPage.jsx';
import SavedPage from './pages/SavedPage.jsx';

const qc = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <header className="flex items-center gap-4 bg-gray-800 px-6 py-3 text-white">
          <h1 className="text-xl font-semibold">B2B Prospecting Tool</h1>
          <nav className="ml-auto flex gap-6 text-sm">
            <Link to="/search" className="hover:underline">
              Search
            </Link>
            <Link to="/saved" className="hover:underline">
              Saved
            </Link>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<Navigate to="/search" replace />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="*" element={<p className="p-6">404 — not found</p>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
