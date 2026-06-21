"use client";

import React, { useState, use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Mail,
  User,
  Edit2,
  Trash2,
  CheckCircle2,
  Send,
  Loader2,
  FileDown,
  Copy,
} from "lucide-react";

import { getComputedInvoiceStatus, showToast } from "@/features/invoices/lib/invoiceUtils";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  amount: number;
}

interface InvoiceDetail {
  _id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue";
  token: string;
  notes?: string;
  clientSnapshot: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    taxId?: string;
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InvoiceDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Query: Get invoice detail metrics
  const { data: invoice, isLoading, isError, error } = useQuery<InvoiceDetail>({
    queryKey: ["invoice-detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/invoices/${id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch invoice details");
      }
      return res.json();
    },
  });

  // Mutation: Update status (e.g. mark as sent, mark as paid)
  const statusMutation = useMutation({
    mutationFn: async (status: "sent" | "paid") => {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update status");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  // Mutation: Delete invoice
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete invoice");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      router.push("/invoices");
    },
  });

  // Status badge styling helper
  const getStatusBadgeClass = (status: string) => {
    const base = "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold font-sans tracking-wide shadow-sm text-white";
    switch (status) {
      case "draft":
        return `${base} bg-status-draft`;
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading invoice details...</p>
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="p-8 border border-destructive/20 bg-destructive/10 rounded-lg text-center max-w-xl mx-auto mt-8">
        <p className="text-destructive font-semibold">Error Loading Invoice</p>
        <p className="text-sm text-muted-foreground mt-1">
          {error ? (error as Error).message : "The requested invoice profile was not found."}
        </p>
        <Link href="/invoices" passHref legacyBehavior>
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices
          </Button>
        </Link>
      </div>
    );
  }

  const displayStatus = getComputedInvoiceStatus(invoice.status, invoice.dueDate);

  return (
    <div className="space-y-6">
      {/* Header controls bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <Link href="/invoices" passHref legacyBehavior>
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono tracking-tight text-foreground">
                {invoice.invoiceNumber}
              </h1>
              <span className={getStatusBadgeClass(displayStatus)}>{displayStatus}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              Share Token: {invoice.token}
            </p>
          </div>
        </div>

        {/* Action button bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Action: Edit */}
          {invoice.status !== "paid" && (
            <Link href={`/invoices/new?id=${invoice._id}`} passHref legacyBehavior>
              <Button variant="outline" size="sm" className="h-9">
                <Edit2 className="mr-2 h-4 w-4 text-muted-foreground" /> Edit
              </Button>
            </Link>
          )}

          {/* Action: Delete */}
          {invoice.status !== "paid" && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-destructive/20 hover:bg-destructive/10 text-destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          )}

          {/* Action: Download PDF */}
          <Link href={`/api/invoices/${invoice._id}/pdf`} passHref legacyBehavior>
            <a target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="h-9">
                <FileDown className="mr-2 h-4 w-4 text-muted-foreground" /> PDF Download
              </Button>
            </a>
          </Link>

          {/* Action: Copy Link */}
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            title={invoice.status === "draft" ? "Copy draft link (not viewable until sent)" : "Copy shareable link"}
            onClick={() => {
              const shareUrl = `${window.location.origin}/invoice/${invoice.token}`;
              navigator.clipboard.writeText(shareUrl).then(() => {
                showToast(invoice.status === "draft" ? "Draft link copied to clipboard!" : "Public invoice link copied!");
              });
            }}
          >
            <Copy className="mr-2 h-4 w-4 text-muted-foreground" /> Copy Link
          </Button>

          {/* Action: Mark Sent */}
          {invoice.status === "draft" && (
            <Button
              size="sm"
              className="h-9 bg-primary hover:bg-primary/95 text-primary-foreground"
              disabled={statusMutation.isPending}
              onClick={() => statusMutation.mutate("sent")}
            >
              <Send className="mr-2 h-4 w-4" /> Mark as Sent
            </Button>
          )}

          {/* Action: Mark Paid */}
          {invoice.status === "sent" && (
            <Button
              size="sm"
              className="h-9 bg-emerald-600 hover:bg-emerald-600/95 text-white"
              disabled={statusMutation.isPending}
              onClick={() => statusMutation.mutate("paid")}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Paid
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left main information column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Client Billing Details */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-foreground text-sm border-b border-border pb-2">Billing To</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1.5">
                <span className="text-muted-foreground text-xs block uppercase tracking-wider">Client Name</span>
                <span className="font-semibold text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" /> {invoice.clientSnapshot.name}
                </span>
              </div>
              <div className="space-y-1.5">
                <span className="text-muted-foreground text-xs block uppercase tracking-wider">Billing Email</span>
                <span className="text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" /> {invoice.clientSnapshot.email}
                </span>
              </div>
              {invoice.clientSnapshot.phone && (
                <div className="space-y-1.5">
                  <span className="text-muted-foreground text-xs block uppercase tracking-wider">Phone Number</span>
                  <span className="text-foreground">{invoice.clientSnapshot.phone}</span>
                </div>
              )}
              {invoice.clientSnapshot.taxId && (
                <div className="space-y-1.5">
                  <span className="text-muted-foreground text-xs block uppercase tracking-wider">Tax Registration Code</span>
                  <span className="text-foreground">{invoice.clientSnapshot.taxId}</span>
                </div>
              )}
              {invoice.clientSnapshot.address && (
                <div className="sm:col-span-2 space-y-1.5">
                  <span className="text-muted-foreground text-xs block uppercase tracking-wider">Billing Address</span>
                  <span className="text-foreground">{invoice.clientSnapshot.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card: Items Table */}
          <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-semibold text-foreground text-sm">Line Items</h3>
            </div>
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="font-semibold text-center w-24">Qty</TableHead>
                  <TableHead className="font-semibold text-right w-36">Unit Price</TableHead>
                  <TableHead className="font-semibold text-right w-36">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item, index) => (
                  <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium text-foreground">{item.description}</TableCell>
                    <TableCell className="text-center font-mono tabular-nums">{item.quantity}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-mono text-foreground font-semibold tabular-nums">
                      ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Right side summary column */}
        <div className="space-y-6">
          {/* Card: Invoice timeline details */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-foreground text-sm border-b border-border pb-2">Timeline</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issue Date</span>
                <span className="font-semibold text-foreground">
                  {new Date(invoice.issueDate).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date</span>
                <span className="font-semibold text-foreground">
                  {new Date(invoice.dueDate).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Card: Calculations Summary */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-foreground text-sm border-b border-border pb-2">Calculations Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">${invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax Rate</span>
                <span className="font-mono tabular-nums">{invoice.taxRate}%</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax Amount</span>
                <span className="font-mono tabular-nums">${invoice.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-foreground font-bold text-lg pt-2 border-t border-border">
                <span>Total Due</span>
                <span className="font-mono text-primary tabular-nums">
                  ${invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Card: Invoice Notes */}
          {invoice.notes && (
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-2 text-sm">
              <h3 className="font-semibold text-foreground text-sm border-b border-border pb-2">Additional Terms</h3>
              <p className="text-muted-foreground whitespace-pre-wrap pt-1">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Invoice Alert confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-lg border border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-foreground">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              This action cannot be undone. This will permanently delete the invoice{" "}
              <strong className="text-foreground">{invoice.invoiceNumber}</strong> and remove all related data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/95 text-destructive-foreground font-medium"
              onClick={(e) => {
                e.preventDefault();
                deleteMutation.mutate();
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete Invoice"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
