import { NextRequest, NextResponse } from "next/server";
import { getCompanyForUser } from "@/lib/clerk";
import { getEmployees, createEmployee } from "@/services/employee.service";
import { z } from "zod";

const employeeCreateSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  position: z.string().optional(),
  department: z.string().optional(),
  salary: z.number().positive("Salary must be a positive number"),
  bankAccount: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export async function GET(req: NextRequest) {
  try {
    const company = await getCompanyForUser();
    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department") || undefined;
    
    const employees = await getEmployees(company._id as string, department);
    return NextResponse.json(employees);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/employees error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const company = await getCompanyForUser();
    const body = await req.json();

    const parseResult = employeeCreateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const employee = await createEmployee(company._id as string, parseResult.data);
    return NextResponse.json(employee, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/employees error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
