import { NextRequest, NextResponse } from "next/server";
import { getCompanyForUser } from "@/lib/clerk";
import { updatePayrollRecord, deletePayrollDraft } from "@/services/payroll.service";
import { Payroll } from "@/models/Payroll";
import { z } from "zod";

const payrollUpdateSchema = z.object({
  allowances: z.number().nonnegative("Allowances must be non-negative").optional(),
  deductions: z.number().nonnegative("Deductions must be non-negative").optional(),
  status: z.enum(["draft", "paid"]).optional(),
});

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const company = await getCompanyForUser();
    const payroll = await Payroll.findOne({ _id: id, companyId: company._id as string }).populate({
      path: "employeeId",
      select: "firstName lastName email position department status",
    });

    if (!payroll) {
      return NextResponse.json({ error: "Payroll record not found" }, { status: 404 });
    }

    return NextResponse.json(payroll);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/payroll/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const company = await getCompanyForUser();
    const body = await req.json();

    const parseResult = payrollUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const payroll = await updatePayrollRecord(company._id as string, id, parseResult.data);
    return NextResponse.json(payroll);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message.includes("not found")) {
      return NextResponse.json({ error: "Payroll record not found" }, { status: 404 });
    }
    if (error.message.includes("locked") || error.message.includes("Deductions exceed")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("PATCH /api/payroll/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const company = await getCompanyForUser();

    await deletePayrollDraft(company._id as string, id);
    return NextResponse.json({ message: "Payroll record deleted successfully" });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message.includes("not found")) {
      return NextResponse.json({ error: "Payroll record not found" }, { status: 404 });
    }
    if (error.message.includes("locked")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("DELETE /api/payroll/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
