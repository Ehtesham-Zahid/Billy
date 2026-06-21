import { NextResponse } from "next/server";
import { getCompanyForUser } from "@/lib/clerk";
import { getClientById, updateClient, deleteClient } from "@/services/client.service";
import { z } from "zod";

const clientUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
});

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const company = await getCompanyForUser();
    const client = await getClientById(company._id as string, id);
    
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    
    return NextResponse.json(client);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "CompanyNotFound") {
      return NextResponse.json({ error: "Company profile not found" }, { status: 404 });
    }
    console.error("GET /api/clients/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const company = await getCompanyForUser();
    const body = await req.json();
    
    const parseResult = clientUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const client = await updateClient(company._id as string, id, parseResult.data);
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    
    return NextResponse.json(client);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "CompanyNotFound") {
      return NextResponse.json({ error: "Company profile not found" }, { status: 404 });
    }
    console.error("PATCH /api/clients/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const company = await getCompanyForUser();
    const client = await deleteClient(company._id as string, id);
    
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Client deleted successfully" });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "CompanyNotFound") {
      return NextResponse.json({ error: "Company profile not found" }, { status: 404 });
    }
    console.error("DELETE /api/clients/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
