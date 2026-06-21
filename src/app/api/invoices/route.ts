import { NextRequest, NextResponse } from "next/server";
import { getCompanyForUser } from "@/lib/clerk";
import { getInvoices, createInvoice } from "@/services/invoice.service";
import { z } from "zod";

const itemSchema = z.object({
  description: z.string().min(1, "Item description is required"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  price: z.number().nonnegative("Price cannot be negative"),
});

const invoiceCreateSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  items: z.array(itemSchema).min(1, "At least one item is required"),
  taxRate: z.number().nonnegative("Tax rate cannot be negative").default(0),
  notes: z.string().optional(),
}).refine(
  (data) => {
    const issue = new Date(data.issueDate);
    const due = new Date(data.dueDate);
    return due >= issue;
  },
  {
    message: "Due date cannot be before the issue date.",
    path: ["dueDate"],
  }
);

export async function GET(req: NextRequest) {
  try {
    const company = await getCompanyForUser();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    
    const invoices = await getInvoices(company._id as string, status);
    return NextResponse.json(invoices);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/invoices error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const company = await getCompanyForUser();
    const body = await req.json();

    const parseResult = invoiceCreateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const invoice = await createInvoice(company._id as string, parseResult.data);
    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "ClientNotFound") {
      return NextResponse.json({ error: "Client not found or belongs to another company" }, { status: 400 });
    }
    console.error("POST /api/invoices error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
