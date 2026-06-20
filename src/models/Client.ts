import mongoose, { Schema, Document } from "mongoose";

export interface IClient extends Document {
  companyId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema: Schema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    taxId: { type: String },
  },
  { timestamps: true }
);

export const Client = mongoose.models.Client || mongoose.model<IClient>("Client", ClientSchema);
