import { NextResponse } from "next/server";
import { getCompanyForUser } from "@/lib/clerk";
import { updateCompany } from "@/services/company.service";
import { z } from "zod";

const companyUpdateSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  taxId: z.string().optional().or(z.literal("")),
});

export async function GET() {
  try {
    const company = await getCompanyForUser();
    return NextResponse.json(company);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/company error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const company = await getCompanyForUser();
    const body = await req.json();

    const parseResult = companyUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Sanitize optional empty strings to undefined to clean DB values
    const updateData = {
      name: parseResult.data.name.trim(),
      phone: parseResult.data.phone?.trim() || undefined,
      address: parseResult.data.address?.trim() || undefined,
      taxId: parseResult.data.taxId?.trim() || undefined,
    };

    const updatedCompany = await updateCompany(company.clerkId, updateData);
    if (!updatedCompany) {
      return NextResponse.json({ error: "Company profile not found" }, { status: 404 });
    }

    return NextResponse.json(updatedCompany);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("PATCH /api/company error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
