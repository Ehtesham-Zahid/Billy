import { notFound } from "next/navigation";
import React from "react";
import Link from "next/link";
import { FileDown, Calendar, User, Mail } from "lucide-react";

import { getInvoiceByTokenForPdf } from "@/services/invoice.service";
import { getComputedInvoiceStatus, isInvoicePublicViewable } from "@/features/invoices/lib/invoiceUtils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function PublicInvoicePage({ params }: PageProps) {
  const { token } = await params;

  const invoice = await getInvoiceByTokenForPdf(token);

  // Return standard generic 404 if invoice doesn't exist, or status does not allow public viewing
  if (!invoice || !isInvoicePublicViewable(invoice.status)) {
    notFound();
  }

  const displayStatus = getComputedInvoiceStatus(invoice.status, invoice.dueDate);

  const getStatusBadgeClass = (status: string) => {
    const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide shadow-sm text-white";
    switch (status) {
      case "sent":
        return `${base} bg-status-sent`;
      case "paid":
        return `${base} bg-status-paid`;
      case "overdue":
        return `${base} bg-status-overdue`;
      default:
        return `${base} bg-zinc-500`;
    }
  };

  const primaryColor = invoice.templateId?.primaryColor || "#4F46E5";

  return (
    <div 
      className="min-h-screen bg-muted/20 py-12 px-4 sm:px-6 lg:px-8 font-sans"
      style={{
        "--primary": primaryColor,
        "--ring": primaryColor,
      } as React.CSSProperties}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Floating Top Bar (Public Print & PDF Shortcut) */}
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Invoice Reference:</span>
            <span className="text-sm font-semibold font-mono text-foreground">{invoice.invoiceNumber}</span>
          </div>
          <Link href={`/api/public/invoices/${invoice.token}/pdf`} passHref legacyBehavior>
            <a target="_blank" rel="noreferrer">
              <Button className="bg-primary hover:bg-primary/95 text-primary-foreground font-medium rounded-lg h-9 text-xs sm:text-sm">
                <FileDown className="mr-1.5 h-4 w-4" /> Download PDF
              </Button>
            </a>
          </Link>
        </div>

        {/* Core Invoice Billing Card */}
        <div className="bg-card border border-border rounded-lg shadow-sm p-6 sm:p-10 space-y-8">
          
          {/* Header row */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-border pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {invoice.companyId?.logoUrl && (
                <img
                  src={invoice.companyId.logoUrl}
                  alt={`${invoice.companyId.name} logo`}
                  className="h-16 w-16 rounded-md object-contain border border-border bg-muted/10 p-1"
                />
              )}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">
                  {invoice.companyId?.name || "BILLY PLATFORM"}
                </h2>
                <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                  {invoice.companyId?.address && <p>{invoice.companyId.address}</p>}
                  <p>
                    {invoice.companyId?.email && <span>Email: {invoice.companyId.email}</span>}
                    {invoice.companyId?.phone && <span> | Phone: {invoice.companyId.phone}</span>}
                  </p>
                  {invoice.companyId?.taxId && <p>Tax ID: {invoice.companyId.taxId}</p>}
                </div>
              </div>
            </div>
            <div className="sm:text-right space-y-2">
              <span className="text-xs uppercase text-muted-foreground block tracking-wider font-semibold">Invoice Status</span>
              <span className={getStatusBadgeClass(displayStatus)}>{displayStatus}</span>
            </div>
          </div>

          {/* Details row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm">
            <div className="space-y-3">
              <h3 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider border-b border-border pb-1">Billed To</h3>
              <div className="space-y-1.5">
                <p className="font-bold text-foreground text-base flex items-center gap-1.5">
                  <User className="h-4 w-4 text-muted-foreground" /> {invoice.clientSnapshot.name}
                </p>
                <p className="text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-muted-foreground" /> {invoice.clientSnapshot.email}
                </p>
                {invoice.clientSnapshot.phone && (
                  <p className="text-muted-foreground">Phone: {invoice.clientSnapshot.phone}</p>
                )}
                {invoice.clientSnapshot.address && (
                  <p className="text-muted-foreground mt-1.5 block max-w-xs">{invoice.clientSnapshot.address}</p>
                )}
                {invoice.clientSnapshot.taxId && (
                  <p className="text-xs text-muted-foreground mt-1 font-mono">Tax ID: {invoice.clientSnapshot.taxId}</p>
                )}
              </div>
            </div>

            <div className="space-y-3 sm:text-right sm:items-end flex flex-col">
              <h3 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider border-b border-border pb-1 w-full sm:w-48">Timelines</h3>
              <div className="space-y-3 mt-1.5 w-full sm:w-48">
                <div className="flex justify-between sm:justify-end sm:gap-4">
                  <span className="text-muted-foreground">Issue Date:</span>
                  <span className="font-semibold text-foreground">
                    {new Date(invoice.issueDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between sm:justify-end sm:gap-4">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span className="font-semibold text-foreground">
                    {new Date(invoice.dueDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Line items Table (Desktop) */}
          <div className="hidden sm:block border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="font-semibold text-center w-24">Qty</TableHead>
                  <TableHead className="font-semibold text-right w-36">Price</TableHead>
                  <TableHead className="font-semibold text-right w-36">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-foreground">{item.description}</TableCell>
                    <TableCell className="text-center font-mono tabular-nums">{item.quantity}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">${item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono text-foreground font-bold tabular-nums">${item.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Line items list (Mobile Card Fallback) */}
          <div className="sm:hidden space-y-4">
            <h3 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider border-b border-border pb-1">Line Items</h3>
            {invoice.items.map((item: any, index: number) => (
              <div key={index} className="border border-border rounded-lg p-4 space-y-2 bg-muted/5">
                <p className="font-semibold text-foreground">{item.description}</p>
                <div className="grid grid-cols-3 text-xs pt-1 border-t border-border/60">
                  <div>
                    <span className="text-muted-foreground block">Qty</span>
                    <span className="font-mono tabular-nums mt-0.5 block">{item.quantity}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Price</span>
                    <span className="font-mono tabular-nums mt-0.5 block">${item.price.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground block">Amount</span>
                    <span className="font-bold font-mono text-foreground mt-0.5 block">${item.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end pt-4 border-t border-border">
            <div className="w-full sm:w-64 space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">${invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax Rate</span>
                <span className="font-mono">{invoice.taxRate}%</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax Amount</span>
                <span className="font-mono tabular-nums">${invoice.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-foreground font-bold text-lg pt-2 border-t border-border">
                <span>Total Due</span>
                <span className="font-mono text-primary text-xl tabular-nums">${invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes section */}
          {invoice.notes && (
            <div className="pt-6 border-t border-border text-sm space-y-2">
              <h3 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Additional Terms</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
