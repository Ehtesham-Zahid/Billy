import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { Invoice, IInvoice } from "@/models/Invoice";
import { Client } from "@/models/Client";

// Helper function to format invoice sequential numbers
function formatInvoiceNumber(seq: number): string {
  return `INV-${seq.toString().padStart(4, "0")}`;
}

export async function getInvoices(
  companyId: string,
  status?: string
): Promise<IInvoice[]> {
  await connectDB();
  const query: any = { companyId };
  if (status && status !== "all") {
    query.status = status;
  }
  return Invoice.find(query).sort({ createdAt: -1 });
}

export async function getInvoiceById(
  companyId: string,
  id: string
): Promise<IInvoice | null> {
  await connectDB();
  return Invoice.findOne({ _id: id, companyId });
}

export async function createInvoice(
  companyId: string,
  data: {
    clientId: string;
    issueDate: Date | string;
    dueDate: Date | string;
    items: { description: string; quantity: number; price: number }[];
    taxRate?: number;
    notes?: string;
  }
): Promise<IInvoice> {
  await connectDB();

  // 1. Fetch target client for static demographic copy
  const client = await Client.findOne({ _id: data.clientId, companyId });
  if (!client) {
    throw new Error("ClientNotFound");
  }

  const clientSnapshot = {
    name: client.name,
    email: client.email,
    phone: client.phone || undefined,
    address: client.address || undefined,
    taxId: client.taxId || undefined,
  };

  // 2. Perform monetary calculations
  const taxRate = data.taxRate ?? 0;
  let subtotal = 0;
  
  const items = data.items.map((item) => {
    const quantity = item.quantity;
    const price = item.price;
    const amount = Math.round(quantity * price * 100) / 100;
    subtotal += amount;
    
    return {
      description: item.description.trim(),
      quantity,
      price,
      amount,
    };
  });

  subtotal = Math.round(subtotal * 100) / 100;
  const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
  const total = Math.round((subtotal + taxAmount) * 100) / 100;

  // 3. Cryptographically random sharing token
  const token = crypto.randomBytes(32).toString("hex");

  // 4. Retry loop to generate unique human-readable invoiceNumber
  let retries = 3;
  let invoice: IInvoice | null = null;

  while (retries > 0) {
    try {
      // Find highest invoice number for this company
      const latestInvoice = await Invoice.findOne({ companyId })
        .sort({ invoiceNumber: -1 })
        .select("invoiceNumber");

      let nextSeq = 1;
      if (latestInvoice && latestInvoice.invoiceNumber) {
        const parts = latestInvoice.invoiceNumber.split("-");
        const lastNum = parseInt(parts[1], 10);
        if (!isNaN(lastNum)) {
          nextSeq = lastNum + 1;
        }
      }

      const invoiceNumber = formatInvoiceNumber(nextSeq);

      const newInvoice = new Invoice({
        companyId,
        clientId: data.clientId,
        invoiceNumber,
        issueDate: new Date(data.issueDate),
        dueDate: new Date(data.dueDate),
        items,
        subtotal,
        taxRate,
        taxAmount,
        total,
        status: "draft",
        token,
        clientSnapshot,
        notes: data.notes?.trim() || undefined,
      });

      await newInvoice.save();
      invoice = newInvoice;
      break; // Save succeeded, break retry loop
    } catch (error: any) {
      // Check for Mongoose/MongoDB duplicate key error on index { companyId, invoiceNumber }
      const isDuplicateKey = error.code === 11000 || error.message?.includes("E11000");
      if (isDuplicateKey) {
        retries--;
        if (retries === 0) {
          throw new Error("InvoiceConflict: Failed to allocate unique sequence number after retries.");
        }
        // Small wait before retry
        await new Promise((resolve) => setTimeout(resolve, 50));
      } else {
        throw error; // Propagate non-duplicate errors immediately
      }
    }
  }

  if (!invoice) {
    throw new Error("InternalServerError");
  }

  return invoice;
}

export async function updateInvoice(
  companyId: string,
  id: string,
  data: {
    clientId?: string;
    issueDate?: Date | string;
    dueDate?: Date | string;
    items?: { description: string; quantity: number; price: number }[];
    taxRate?: number;
    status?: "draft" | "sent" | "paid" | "overdue";
    notes?: string;
  }
): Promise<IInvoice | null> {
  await connectDB();

  // Fetch current record to perform validity checks
  const currentInvoice = await Invoice.findOne({ _id: id, companyId });
  if (!currentInvoice) {
    return null;
  }

  // Prevent modifications of paid invoices
  if (currentInvoice.status === "paid") {
    throw new Error("InvoiceLocked: Paid invoices cannot be edited.");
  }

  const updateFields: any = {};

  // Status updates
  if (data.status) {
    updateFields.status = data.status;
  }

  // Notes updates
  if (data.notes !== undefined) {
    updateFields.notes = data.notes.trim() || undefined;
  }

  // Dates updates
  if (data.issueDate) {
    updateFields.issueDate = new Date(data.issueDate);
  }
  if (data.dueDate) {
    updateFields.dueDate = new Date(data.dueDate);
  }

  // Client updates (recopy snapshot if client changes)
  if (data.clientId && data.clientId !== currentInvoice.clientId.toString()) {
    const client = await Client.findOne({ _id: data.clientId, companyId });
    if (!client) {
      throw new Error("ClientNotFound");
    }
    updateFields.clientId = data.clientId;
    updateFields.clientSnapshot = {
      name: client.name,
      email: client.email,
      phone: client.phone || undefined,
      address: client.address || undefined,
      taxId: client.taxId || undefined,
    };
  }

  // Items and pricing updates
  if (data.items || data.taxRate !== undefined) {
    const taxRate = data.taxRate ?? currentInvoice.taxRate;
    const itemsSource = data.items ?? currentInvoice.items;
    
    let subtotal = 0;
    const items = itemsSource.map((item: any) => {
      const quantity = item.quantity;
      const price = item.price;
      const amount = Math.round(quantity * price * 100) / 100;
      subtotal += amount;
      
      return {
        description: item.description.trim(),
        quantity,
        price,
        amount,
      };
    });

    subtotal = Math.round(subtotal * 100) / 100;
    const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
    const total = Math.round((subtotal + taxAmount) * 100) / 100;

    updateFields.items = items;
    updateFields.subtotal = subtotal;
    updateFields.taxRate = taxRate;
    updateFields.taxAmount = taxAmount;
    updateFields.total = total;
  }

  return Invoice.findOneAndUpdate(
    { _id: id, companyId },
    { $set: updateFields },
    { new: true, runValidators: true }
  );
}

export async function deleteInvoice(
  companyId: string,
  id: string
): Promise<IInvoice | null> {
  await connectDB();

  const currentInvoice = await Invoice.findOne({ _id: id, companyId });
  if (!currentInvoice) {
    return null;
  }

  // Lock deletion of paid invoices
  if (currentInvoice.status === "paid") {
    throw new Error("InvoiceLocked: Paid invoices cannot be deleted.");
  }

  return Invoice.findOneAndDelete({ _id: id, companyId });
}
