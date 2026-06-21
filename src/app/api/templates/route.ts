import { NextRequest, NextResponse } from "next/server";
import { getCompanyForUser } from "@/lib/clerk";
import { getTemplates, createTemplate } from "@/services/template.service";
import { z } from "zod";

const templateCreateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color code"),
  layoutType: z.enum(["default", "modern", "minimal"]),
});

export async function GET(req: NextRequest) {
  try {
    const company = await getCompanyForUser();
    const list = await getTemplates(company._id as string);
    return NextResponse.json(list);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/templates error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const company = await getCompanyForUser();
    const body = await req.json();

    const parseResult = templateCreateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const result = await createTemplate(company._id as string, parseResult.data);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/templates error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
