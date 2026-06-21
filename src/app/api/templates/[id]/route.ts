import { NextRequest, NextResponse } from "next/server";
import { getCompanyForUser } from "@/lib/clerk";
import { updateTemplate, deleteTemplate } from "@/services/template.service";
import { z } from "zod";

const templateUpdateSchema = z.object({
  name: z.string().min(1, "Template name is required").optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color code").optional(),
  layoutType: z.enum(["default", "modern", "minimal"]).optional(),
});

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const company = await getCompanyForUser();
    const body = await req.json();

    const parseResult = templateUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const result = await updateTemplate(company._id as string, id, parseResult.data);
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "TemplateNotFound") {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    if (error.message.includes("TemplateReadOnly")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("PATCH /api/templates/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const company = await getCompanyForUser();

    await deleteTemplate(company._id as string, id);
    return NextResponse.json({ message: "Template deleted successfully" });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "TemplateNotFound") {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    if (error.message.includes("TemplateReadOnly") || error.message.includes("TemplateInUse")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("DELETE /api/templates/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
