import mongoose, { Schema, Document } from "mongoose";

export interface IPayroll extends Document {
  companyId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  payPeriodStart: Date;
  payPeriodEnd: Date;
  paymentDate?: Date;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  departmentSnapshot?: string;
  status: "draft" | "paid";
  createdAt: Date;
  updatedAt: Date;
}

const PayrollSchema: Schema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    payPeriodStart: { type: Date, required: true },
    payPeriodEnd: { type: Date, required: true },
    paymentDate: { type: Date },
    baseSalary: { type: Number, required: true, min: 0 },
    allowances: { type: Number, required: true, default: 0, min: 0 },
    deductions: { type: Number, required: true, default: 0, min: 0 },
    netSalary: { type: Number, required: true, default: 0, min: 0 },
    departmentSnapshot: { type: String },
    status: { type: String, enum: ["draft", "paid"], default: "draft", required: true, index: true },
  },
  { timestamps: true }
);

// Prevent running payroll multiple times for the same employee in the same pay period
PayrollSchema.index(
  { companyId: 1, employeeId: 1, payPeriodStart: 1, payPeriodEnd: 1 },
  { unique: true }
);

export const Payroll = mongoose.models.Payroll || mongoose.model<IPayroll>("Payroll", PayrollSchema);
