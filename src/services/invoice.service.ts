import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { Invoice, IInvoice } from "@/models/Invoice";
import { Client } from "@/models/Client";
import { Company } from "@/models/Company";
import { InvoiceTemplate } from "@/models/InvoiceTemplate";

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
  return Invoice.findOne({ _id: id, companyId }).populate("templateId");
}

export async function getInvoiceForPdf(
  companyId: string,
  id: string
): Promise<any | null> {
  await connectDB();
  return Invoice.findOne({ _id: id, companyId })
    .populate("companyId")
    .populate("templateId");
}

export async function getInvoiceByTokenForPdf(
  token: string
): Promise<any | null> {
  await connectDB();
  return Invoice.findOne({ token })
    .populate("companyId")
    .populate("templateId");
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
    templateId?: string;
  }
): Promise<IInvoice> {
  await connectDB();

  // Validate dates
  const issue = new Date(data.issueDate);
  const due = new Date(data.dueDate);
  if (due < issue) {
    throw new Error("DateValidationError: Due date cannot be before the issue date.");
  }

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
        issueDate: issue,
        dueDate: due,
        items,
        subtotal,
        taxRate,
        taxAmount,
        total,
        status: "draft",
        token,
        clientSnapshot,
        notes: data.notes?.trim() || undefined,
        templateId: data.templateId || undefined,
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
    templateId?: string;
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

  // Validate dates if updated
  const newIssue = data.issueDate ? new Date(data.issueDate) : currentInvoice.issueDate;
  const newDue = data.dueDate ? new Date(data.dueDate) : currentInvoice.dueDate;
  if (newDue < newIssue) {
    throw new Error("DateValidationError: Due date cannot be before the issue date.");
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

  // Template updates
  if (data.templateId !== undefined) {
    updateFields.templateId = data.templateId || undefined;
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

  const updatedInvoice = await Invoice.findOneAndUpdate(
    { _id: id, companyId },
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  // Send email to client if status is changed to "sent"
  if (updatedInvoice && data.status === "sent" && currentInvoice.status !== "sent") {
    (async () => {
      try {
        const gmailUser = process.env.GMAIL_USER;
        const gmailPass = process.env.GMAIL_APP_PASSWORD;

        if (!gmailUser || !gmailPass) {
          console.warn("GMAIL_USER or GMAIL_APP_PASSWORD is not defined. Skipping automatic invoice email.");
          return;
        }

        const company = await Company.findById(companyId);
        const companyName = company ? company.name : "Your Company";
        const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const invoiceUrl = `${appBaseUrl}/invoice/${updatedInvoice.token}`;
        const formattedDueDate = new Date(updatedInvoice.dueDate).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric"
        });

        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: gmailUser,
            pass: gmailPass,
          },
        });

        await transporter.sendMail({
          from: gmailUser,
          to: updatedInvoice.clientSnapshot.email,
          subject: `New Invoice ${updatedInvoice.invoiceNumber} from ${companyName}`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 12px;">
              <h2 style="color: #7c3aed; margin-bottom: 16px;">New Invoice from ${companyName}</h2>
              <p>Hello <strong>${updatedInvoice.clientSnapshot.name}</strong>,</p>
              <p><strong>${companyName}</strong> has sent you a new invoice <strong>${updatedInvoice.invoiceNumber}</strong>.</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
                <tr>
                  <td style="padding: 8px 0; color: #71717a;">Invoice Number:</td>
                  <td style="padding: 8px 0; font-weight: bold; text-align: right;">${updatedInvoice.invoiceNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #71717a;">Amount Due:</td>
                  <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #7c3aed;">$${updatedInvoice.total.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #71717a;">Due Date:</td>
                  <td style="padding: 8px 0; font-weight: bold; text-align: right;">${formattedDueDate}</td>
                </tr>
              </table>
              <p>Click the button below to view the invoice, download the PDF, or make a payment:</p>
              <div style="margin: 24px 0; text-align: center;">
                <a href="${invoiceUrl}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Invoice</a>
              </div>
              <p style="font-size: 12px; color: #71717a; margin-top: 24px;">
                If the button doesn't work, copy and paste this link in your browser:<br/>
                <a href="${invoiceUrl}" style="color: #7c3aed;">${invoiceUrl}</a>
              </p>
            </div>
          `,
        });
        console.log(`Successfully sent invoice email to ${updatedInvoice.clientSnapshot.email} via Gmail SMTP`);
      } catch (emailErr) {
        console.error("Failed to send invoice email to client:", emailErr);
      }
    })();
  }

  return updatedInvoice;
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
