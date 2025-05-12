import { Schema, Document, model } from 'mongoose';

export interface Company {
  id: string;
  name: string;
  industry?: string;
  locality?: string;
  region?: string;
  website?: string;
  linkedin_url?: string;
  founded?: number;
  size?: number;
  country?: string;
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CompanyDocument = Company & Document;

export const CompanySchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    industry: { type: String },
    locality: { type: String },
    region: { type: String },
    website: { type: String },
    linkedin_url: { type: String },
    founded: { type: Number, index: true },
    size: { type: Number, index: true },
    country: { type: String, index: true },
    summary: { type: String },  // enriched by worker
  },
  { timestamps: true },
);

CompanySchema.index({
  name: 'text',
  industry: 'text',
  locality: 'text',
  region: 'text',
  website: 'text',
});

// Compound Index
CompanySchema.index({ country: 1, industry: 1 });

export const CompanyModel = model<CompanyDocument>(
  'Company',
  CompanySchema,
  'companies',
);
