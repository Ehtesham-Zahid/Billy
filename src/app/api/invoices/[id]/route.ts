import { NextResponse } from "next/server";
import { getCompanyForUser } from "@/lib/clerk";
import { getInvoiceById, updateInvoice, deleteInvoice } from "@/services/invoice.service";
import { z } from "zod";

const itemSchema = z.object({
  description: z.string().min(1, "Item description is required"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  price: z.number().nonnegative("Price cannot be negative"),
});

const invoiceUpdateSchema = z.object({
  clientId: z.string().min(1, "Client is required").optional(),
  issueDate: z.string().min(1, "Issue date is required").optional(),
  dueDate: z.string().min(1, "Due date is required").optional(),
  items: z.array(itemSchema).min(1, "At least one item is required").optional(),
  taxRate: z.number().nonnegative("Tax rate cannot be negative").optional(),
  status: z.enum(["draft", "sent", "paid", "overdue"]).optional(),
  notes: z.string().optional(),
  templateId: z.string().optional(),
}).refine(
  (data) => {
    if (data.issueDate && data.dueDate) {
      const issue = new Date(data.issueDate);
      const due = new Date(data.dueDate);
      return due >= issue;
    }
    return true;
  },
  {
    message: "Due date cannot be before the issue date.",
    path: ["dueDate"],
  }
);

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const company = await getCompanyForUser();
    const invoice = await getInvoiceById(company._id as string, id);

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/invoices/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const company = await getCompanyForUser();
    const body = await req.json();

    const parseResult = invoiceUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const invoice = await updateInvoice(company._id as string, id, parseResult.data);
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "ClientNotFound") {
      return NextResponse.json({ error: "Client not found or belongs to another company" }, { status: 400 });
    }
    if (error.message?.includes("InvoiceLocked")) {
      return NextResponse.json({ error: "Paid invoices are locked and cannot be edited" }, { status: 400 });
    }
    if (error.message?.includes("DateValidationError")) {
      return NextResponse.json({ error: { dueDate: ["Due date cannot be before the issue date."] } }, { status: 400 });
    }
    console.error("PATCH /api/invoices/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const company = await getCompanyForUser();
    const invoice = await deleteInvoice(company._id as string, id);

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Invoice deleted successfully" });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message?.includes("InvoiceLocked")) {
      return NextResponse.json({ error: "Paid invoices are locked and cannot be deleted" }, { status: 400 });
    }
    console.error("DELETE /api/invoices/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
