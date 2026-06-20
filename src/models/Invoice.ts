import mongoose, { Schema, Document } from "mongoose";

export interface IInvoiceItem {
  description: string;
  quantity: number;
  price: number;
  amount: number;
}

export interface IInvoice extends Document {
  companyId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  items: IInvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue";
  templateId?: mongoose.Types.ObjectId;
  token: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema = new Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true, min: 0 },
});

const InvoiceSchema: Schema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    invoiceNumber: { type: String, required: true, index: true },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    items: [InvoiceItemSchema],
    subtotal: { type: Number, required: true, default: 0 },
    taxRate: { type: Number, required: true, default: 0 },
    taxAmount: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["draft", "sent", "paid", "overdue"],
      default: "draft",
      required: true,
      index: true
    },
    templateId: { type: Schema.Types.ObjectId, ref: "InvoiceTemplate" },
    token: { type: String, required: true, unique: true, index: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Invoice = mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", InvoiceSchema);
