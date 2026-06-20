import mongoose, { Schema, Document } from "mongoose";

export interface IInvoiceTemplate extends Document {
  companyId?: mongoose.Types.ObjectId; // System-wide templates have this undefined
  name: string;
  primaryColor: string;
  layoutType: "default" | "modern" | "minimal";
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceTemplateSchema: Schema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", index: true },
    name: { type: String, required: true },
    primaryColor: { type: String, required: true, default: "#4F46E5" },
    layoutType: { type: String, enum: ["default", "modern", "minimal"], default: "default", required: true },
  },
  { timestamps: true }
);

export const InvoiceTemplate = mongoose.models.InvoiceTemplate || mongoose.model<IInvoiceTemplate>("InvoiceTemplate", InvoiceTemplateSchema);
