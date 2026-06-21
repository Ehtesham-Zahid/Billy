import { connectDB } from "@/lib/db";
import { Payroll, IPayroll } from "@/models/Payroll";
import { Employee } from "@/models/Employee";
import mongoose from "mongoose";

export async function getPayrollRuns(companyId: string) {
  await connectDB();
  const companyObjectId = new mongoose.Types.ObjectId(companyId);
  return Payroll.aggregate([
    { $match: { companyId: companyObjectId } },
    {
      $group: {
        _id: {
          payPeriodStart: "$payPeriodStart",
          payPeriodEnd: "$payPeriodEnd",
        },
        totalBaseSalary: { $sum: "$baseSalary" },
        totalAllowances: { $sum: "$allowances" },
        totalDeductions: { $sum: "$deductions" },
        totalNetSalary: { $sum: "$netSalary" },
        employeeCount: { $sum: 1 },
        draftCount: {
          $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] }
        },
        paidCount: {
          $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] }
        }
      }
    },
    { $sort: { "_id.payPeriodStart": -1 } }
  ]);
}

export async function getPayrollDetails(
  companyId: string,
  payPeriodStart: Date,
  payPeriodEnd: Date
): Promise<IPayroll[]> {
  await connectDB();
  return Payroll.find({
    companyId,
    payPeriodStart,
    payPeriodEnd,
  }).populate({
    path: "employeeId",
    select: "firstName lastName email position department status",
  });
}

export async function getEmployeePayrollHistory(
  companyId: string,
  employeeId: string
): Promise<IPayroll[]> {
  await connectDB();
  return Payroll.find({ companyId, employeeId }).sort({ payPeriodStart: -1 });
}

export async function createPayrollRun(
  companyId: string,
  payPeriodStart: Date,
  payPeriodEnd: Date,
  employeeIds: string[],
  adjustments: Record<string, { allowances: number; deductions: number }>
): Promise<{ createdCount: number; errors: Record<string, string[]> }> {
  await connectDB();

  // Get only the specified active employees for this company
  const employees = await Employee.find({
    _id: { $in: employeeIds },
    companyId,
    status: "active",
  });
  if (employees.length === 0) {
    return {
      createdCount: 0,
      errors: { global: ["No active employees found to generate payroll."] },
    };
  }

  // Get existing payroll records for these employees in this period
  const existingPayrolls = await Payroll.find({
    companyId,
    employeeId: { $in: employeeIds },
    payPeriodStart,
    payPeriodEnd,
  });
  const existingEmployeeIds = new Set(existingPayrolls.map((p) => p.employeeId.toString()));

  const errors: Record<string, string[]> = {};
  const payrollsToInsert: any[] = [];

  for (const employee of employees) {
    const empId = employee._id.toString();

    // Check if employee already has a record for this period
    if (existingEmployeeIds.has(empId)) {
      errors[empId] = ["Excluded: Already has a payroll record for this period."];
      continue;
    }

    const adj = adjustments[empId] || { allowances: 0, deductions: 0 };
    const baseSalary = employee.salary;
    const allowances = adj.allowances || 0;
    const deductions = adj.deductions || 0;

    const employeeErrors: string[] = [];

    // 1. Exclude employees with 0 or missing salary configurations
    if (!baseSalary || baseSalary <= 0) {
      employeeErrors.push("Excluded: Employee has no base salary configured. Set a salary in their profile.");
    }

    // 2. Validate allowances & deductions are non-negative
    if (allowances < 0) {
      employeeErrors.push("Excluded: Negative allowance value.");
    }
    if (deductions < 0) {
      employeeErrors.push("Excluded: Negative deduction value.");
    }

    // 3. Compute net salary and prevent negative values
    const computedNet = baseSalary + allowances - deductions;
    if (computedNet < 0) {
      employeeErrors.push("Excluded: Deductions exceed base salary plus allowances (Net Salary cannot be negative).");
    }

    // If there are validation errors, exclude this employee and capture errors
    if (employeeErrors.length > 0) {
      errors[empId] = employeeErrors;
      continue;
    }

    // Round values to 2 decimal places using Math.round(val * 100) / 100
    const roundedBase = Math.round(baseSalary * 100) / 100;
    const roundedAllowances = Math.round(allowances * 100) / 100;
    const roundedDeductions = Math.round(deductions * 100) / 100;
    const roundedNet = Math.round(computedNet * 100) / 100;

    payrollsToInsert.push({
      companyId,
      employeeId: employee._id,
      payPeriodStart,
      payPeriodEnd,
      baseSalary: roundedBase,
      allowances: roundedAllowances,
      deductions: roundedDeductions,
      netSalary: roundedNet,
      departmentSnapshot: employee.department || undefined,
      status: "draft",
    });
  }

  if (payrollsToInsert.length === 0) {
    return {
      createdCount: 0,
      errors,
    };
  }

  let createdCount = 0;
  try {
    const results = await Payroll.insertMany(payrollsToInsert, { ordered: false });
    createdCount = results.length;
  } catch (err: any) {
    // Handle Mongoose duplicate key index issues ({ companyId, employeeId, payPeriodStart, payPeriodEnd })
    if (err.code === 11000) {
      createdCount = err.result?.nInserted || 0;
      const writeErrors = err.writeErrors || [];
      writeErrors.forEach((we: any) => {
        const doc = payrollsToInsert[we.index];
        if (doc) {
          const empId = doc.employeeId.toString();
          if (!errors[empId]) errors[empId] = [];
          errors[empId].push("Excluded: Payroll has already been run for this employee in this pay period.");
        }
      });
    } else {
      throw err;
    }
  }

  return {
    createdCount,
    errors,
  };
}

export async function updatePayrollRecord(
  companyId: string,
  id: string,
  data: { allowances?: number; deductions?: number; status?: "draft" | "paid"; paymentDate?: Date }
): Promise<IPayroll | null> {
  await connectDB();
  const payroll = await Payroll.findOne({ _id: id, companyId });
  if (!payroll) {
    throw new Error("Payroll record not found.");
  }

  if (payroll.status === "paid") {
    throw new Error("Paid payroll records are locked and cannot be modified.");
  }

  const updates: any = {};

  if (data.status) {
    updates.status = data.status;
    if (data.status === "paid") {
      updates.paymentDate = data.paymentDate || new Date();
    }
  }

  const baseSalary = payroll.baseSalary;
  const allowances = data.allowances !== undefined ? data.allowances : payroll.allowances;
  const deductions = data.deductions !== undefined ? data.deductions : payroll.deductions;

  if (data.allowances !== undefined || data.deductions !== undefined) {
    if (allowances < 0) throw new Error("Allowances cannot be negative.");
    if (deductions < 0) throw new Error("Deductions cannot be negative.");

    const netSalary = baseSalary + allowances - deductions;
    if (netSalary < 0) {
      throw new Error("Deductions exceed base salary plus allowances (Net Salary cannot be negative).");
    }

    updates.allowances = Math.round(allowances * 100) / 100;
    updates.deductions = Math.round(deductions * 100) / 100;
    updates.netSalary = Math.round(netSalary * 100) / 100;
  }

  return Payroll.findOneAndUpdate(
    { _id: id, companyId },
    { $set: updates },
    { new: true, runValidators: true }
  );
}

export async function markPeriodAsPaid(
  companyId: string,
  payPeriodStart: Date,
  payPeriodEnd: Date
) {
  await connectDB();
  const totalCount = await Payroll.countDocuments({ companyId, payPeriodStart, payPeriodEnd });
  const result = await Payroll.updateMany(
    { companyId, payPeriodStart, payPeriodEnd, status: "draft" },
    { $set: { status: "paid", paymentDate: new Date() } }
  );
  const modifiedCount = result.modifiedCount;
  const alreadyPaidCount = totalCount - modifiedCount;
  return {
    totalCount,
    modifiedCount,
    alreadyPaidCount,
  };
}

export async function deletePayrollDraft(
  companyId: string,
  id: string
): Promise<IPayroll | null> {
  await connectDB();
  const payroll = await Payroll.findOne({ _id: id, companyId });
  if (!payroll) {
    throw new Error("Payroll record not found.");
  }
  if (payroll.status === "paid") {
    throw new Error("Paid payroll records are locked and cannot be deleted.");
  }
  return Payroll.findOneAndDelete({ _id: id, companyId });
}

export async function deletePeriodDrafts(
  companyId: string,
  payPeriodStart: Date,
  payPeriodEnd: Date
) {
  await connectDB();
  const totalCount = await Payroll.countDocuments({ companyId, payPeriodStart, payPeriodEnd });
  const result = await Payroll.deleteMany({
    companyId,
    payPeriodStart,
    payPeriodEnd,
    status: "draft",
  });
  const deletedCount = result.deletedCount;
  const remainingPaidCount = totalCount - deletedCount;
  return {
    totalCount,
    deletedCount,
    remainingPaidCount,
  };
}

export async function getPayrollReport(
  companyId: string,
  payPeriodStart: Date,
  payPeriodEnd: Date
) {
  await connectDB();
  const companyObjectId = new mongoose.Types.ObjectId(companyId);
  const start = new Date(payPeriodStart);
  const end = new Date(payPeriodEnd);

  const aggregate = await Payroll.aggregate([
    {
      $match: {
        companyId: companyObjectId,
        payPeriodStart: start,
        payPeriodEnd: end,
      }
    },
    {
      $group: {
        _id: null,
        totalBaseSalary: { $sum: "$baseSalary" },
        totalAllowances: { $sum: "$allowances" },
        totalDeductions: { $sum: "$deductions" },
        totalNetSalary: { $sum: "$netSalary" },
        employeeCount: { $sum: 1 },
      }
    }
  ]);

  const deptAggregate = await Payroll.aggregate([
    {
      $match: {
        companyId: companyObjectId,
        payPeriodStart: start,
        payPeriodEnd: end,
      }
    },
    {
      $group: {
        _id: "$departmentSnapshot",
        totalBaseSalary: { $sum: "$baseSalary" },
        totalAllowances: { $sum: "$allowances" },
        totalDeductions: { $sum: "$deductions" },
        totalNetSalary: { $sum: "$netSalary" },
        employeeCount: { $sum: 1 },
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return {
    summary: aggregate[0] || {
      totalBaseSalary: 0,
      totalAllowances: 0,
      totalDeductions: 0,
      totalNetSalary: 0,
      employeeCount: 0,
    },
    departments: deptAggregate,
  };
}
