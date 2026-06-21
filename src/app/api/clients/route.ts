import { NextResponse } from "next/server";
import { getCompanyForUser } from "@/lib/clerk";
import { getClients, createClient } from "@/services/client.service";
import { z } from "zod";

const clientCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
});

export async function GET() {
  try {
    const company = await getCompanyForUser();
    const clients = await getClients(company._id as string);
    return NextResponse.json(clients);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/clients error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const company = await getCompanyForUser();
    const body = await req.json();
    
    const parseResult = clientCreateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const client = await createClient(company._id as string, parseResult.data);
    return NextResponse.json(client, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/clients error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
