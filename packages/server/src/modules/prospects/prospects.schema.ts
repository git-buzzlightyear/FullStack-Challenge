import { Schema } from 'mongoose';

export interface ProspectDocument extends Document {
  userId: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ProspectSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    companyId: { type: String, required: true, index: true },
  },
  { timestamps: true },
);
