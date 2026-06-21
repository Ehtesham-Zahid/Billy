import { NextRequest, NextResponse } from "next/server";
import { getCompanyForUser } from "@/lib/clerk";
import {
  getPayrollRuns,
  getPayrollDetails,
  createPayrollRun,
  markPeriodAsPaid,
  deletePeriodDrafts,
  getPayrollReport,
  getEmployeePayrollHistory,
} from "@/services/payroll.service";
import { z } from "zod";

const payrollCreateSchema = z.object({
  payPeriodStart: z.string().transform((str) => new Date(str)),
  payPeriodEnd: z.string().transform((str) => new Date(str)),
  adjustments: z.record(
    z.string(),
    z.object({
      allowances: z.number().nonnegative("Allowances must be non-negative").default(0),
      deductions: z.number().nonnegative("Deductions must be non-negative").default(0),
    })
  ).default({}),
});

export async function GET(req: NextRequest) {
  try {
    const company = await getCompanyForUser();
    const { searchParams } = new URL(req.url);

    const employeeId = searchParams.get("employeeId");
    if (employeeId) {
      const history = await getEmployeePayrollHistory(company._id as string, employeeId);
      return NextResponse.json(history);
    }

    const payPeriodStart = searchParams.get("payPeriodStart");
    const payPeriodEnd = searchParams.get("payPeriodEnd");
    const mode = searchParams.get("mode"); // e.g. "report" or empty

    if (payPeriodStart && payPeriodEnd) {
      const start = new Date(payPeriodStart);
      const end = new Date(payPeriodEnd);
      
      if (mode === "report") {
        const report = await getPayrollReport(company._id as string, start, end);
        return NextResponse.json(report);
      }
      
      const details = await getPayrollDetails(company._id as string, start, end);
      return NextResponse.json(details);
    }

    const runs = await getPayrollRuns(company._id as string);
    return NextResponse.json(runs);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/payroll error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const company = await getCompanyForUser();
    const body = await req.json();

    const parseResult = payrollCreateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const { payPeriodStart, payPeriodEnd, adjustments } = parseResult.data;

    const result = await createPayrollRun(
      company._id as string,
      payPeriodStart,
      payPeriodEnd,
      adjustments
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/payroll error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Bulk operations (transition status or delete drafts in bulk)
const bulkOperationSchema = z.object({
  payPeriodStart: z.string().transform((str) => new Date(str)),
  payPeriodEnd: z.string().transform((str) => new Date(str)),
  action: z.enum(["pay", "delete"]),
});

export async function PATCH(req: NextRequest) {
  try {
    const company = await getCompanyForUser();
    const body = await req.json();

    const parseResult = bulkOperationSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const { payPeriodStart, payPeriodEnd, action } = parseResult.data;

    if (action === "pay") {
      const result = await markPeriodAsPaid(company._id as string, payPeriodStart, payPeriodEnd);
      return NextResponse.json({
        message: `${result.modifiedCount} of ${result.totalCount} employee payslip records marked paid (${result.alreadyPaidCount} were already paid).`,
        ...result
      });
    } else if (action === "delete") {
      const result = await deletePeriodDrafts(company._id as string, payPeriodStart, payPeriodEnd);
      return NextResponse.json({
        message: `Successfully deleted ${result.deletedCount} draft records (${result.remainingPaidCount} paid records were preserved).`,
        ...result
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("PATCH /api/payroll bulk error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
