import { api } from './axios.js';

export interface Company {
  id: string;
  name: string;
  country?: string;
  industry?: string;
  website?: string;
  founded?: number;
  size?: number;
  locality?: string;
  region?: string;
  linkedin_url?: string;
  summary?: string;
  [k: string]: unknown;           // open schema
}

export interface Page<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function getCompanyById(id: string): Promise<Company> {
  return api.get(`/companies/${id}`).then(res => res.data);
}

export function ensureCompanySummary(id: string): Promise<Company> {
  return api.get(`/companies/${id}/ensureSummary`).then(res => res.data);
}

export function fetchCompanies(params: Record<string, string | number>) {
  return api.get<Page<Company>>('/companies', { params }).then((r) => r.data);
}

export function fetchCompaniesByBasicAISearch(params: Record<string, string | number>) {
  return api.get<Page<Company>>('/companies/basic-ai-search', { params }).then((r) => r.data);
}

export function fetchCompaniesByAdvancedAISearch(params: Record<string, string | number>) {
  return api.get<Page<Company>>('/companies/advanced-ai-search', { params }).then((r) => r.data);
}