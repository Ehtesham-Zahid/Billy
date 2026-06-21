import mongoose, { Schema, Document } from "mongoose";

export interface IEmployee extends Document {
  companyId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  position?: string;
  department?: string;
  salary: number;
  bankAccount?: string;
  status: "active" | "inactive";
  inviteToken?: string;
  clerkUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema: Schema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    position: { type: String },
    department: { type: String },
    salary: { type: Number, required: true, min: 0 },
    bankAccount: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active", required: true },
    inviteToken: { type: String, unique: true, sparse: true },
    clerkUserId: { type: String, unique: true, sparse: true, index: true },
  },
  { timestamps: true }
);

export const Employee = mongoose.models.Employee || mongoose.model<IEmployee>("Employee", EmployeeSchema);
