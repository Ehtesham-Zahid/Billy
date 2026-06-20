import mongoose, { Schema, Document } from "mongoose";

export interface ICompany extends Document {
  clerkId: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  taxId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema: Schema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    logoUrl: { type: String },
    taxId: { type: String },
  },
  { timestamps: true }
);

export const Company = mongoose.models.Company || mongoose.model<ICompany>("Company", CompanySchema);
