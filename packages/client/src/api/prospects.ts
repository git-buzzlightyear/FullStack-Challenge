import { api } from './axios.js';
import type { Company } from './companies.js';

// Fetch the full saved‐companies list
export function fetchSavedProspects(userId: string): Promise<Company[]> {
  return api
    .get<Company[]>('/prospects', {
      headers: { 'x-user-id': userId },
    })
    .then(res => res.data);
}

// Save one company
export function toggleProspect(userId: string, companyId: string): Promise<void> {
  return api
    .post<void>(`/prospects/${companyId}`, null, {
      headers: { 'x-user-id': userId },
    })
    .then(res => res.data);
}
