"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Plus, Eye, Edit2, Trash2, Calendar, FileText, Loader2, ArrowRight, Copy } from "lucide-react";
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
import { getComputedInvoiceStatus, showToast } from "@/features/invoices/lib/invoiceUtils";

interface InvoiceData {
  _id: string;
  invoiceNumber: string;
  dueDate: string;
  issueDate: string;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue";
  token: string;
  clientSnapshot: {
    name: string;
    email: string;
  };
  displayStatus?: "draft" | "sent" | "paid" | "overdue";
}

export default function InvoicesPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingInvoice, setDeletingInvoice] = useState<InvoiceData | null>(null);

  // Query: Get all invoices to perform computed display status filtering on client
  const { data: rawInvoices = [], isLoading, isError, error } = useQuery<InvoiceData[]>({
    queryKey: ["invoices"],
    queryFn: async () => {
      const res = await fetch("/api/invoices");
      if (!res.ok) {
        throw new Error("Failed to fetch invoices");
      }
      return res.json();
    },
  });

  // Compute status on-the-fly and filter on the client side
  const invoices = rawInvoices.map((invoice) => ({
    ...invoice,
    displayStatus: getComputedInvoiceStatus(invoice.status, invoice.dueDate),
  })).filter((invoice) => {
    if (statusFilter === "all") return true;
    return invoice.displayStatus === statusFilter;
  });

  // Mutation: Delete an invoice
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
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
      setIsDeleteDialogOpen(false);
      setDeletingInvoice(null);
    },
  });

  const handleDeleteConfirm = () => {
    if (deletingInvoice) {
      deleteMutation.mutate(deletingInvoice._id);
    }
  };

  // Helper for status badge styling
  const getStatusBadgeClass = (status: string) => {
    const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-sans tracking-wide shadow-sm text-white";
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Invoices</h1>
          <p className="text-muted-foreground text-sm">
            Create, track, and manage billing invoices for your clients.
          </p>
        </div>
        <Link href="/invoices/new" passHref legacyBehavior>
          <Button className="bg-primary hover:bg-primary/95 text-primary-foreground font-medium rounded-lg">
            <Plus className="mr-2 h-4 w-4" /> Create Invoice
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-muted rounded-lg w-fit border border-border">
        {["all", "draft", "sent", "paid", "overdue"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${
              statusFilter === status
                ? "bg-card text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {isLoading ? (
        // Loading skeleton
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading invoices...</p>
        </div>
      ) : isError ? (
        // Error state
        <div className="p-8 border border-destructive/20 bg-destructive/10 rounded-lg text-center">
          <p className="text-destructive font-semibold">Error Loading Invoices</p>
          <p className="text-sm text-muted-foreground mt-1">{(error as Error).message}</p>
        </div>
      ) : invoices.length === 0 ? (
        // Empty state
        <div className="border border-border border-dashed rounded-lg bg-card p-16 text-center max-w-xl mx-auto mt-8 flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No invoices found</h3>
          <p className="text-muted-foreground text-sm mt-2 max-w-sm mb-6">
            {statusFilter === "all"
              ? "Get started by generating your first invoice to bill a client."
              : `There are currently no invoices matching the status "${statusFilter}".`}
          </p>
          {statusFilter === "all" && (
            <Link href="/invoices/new" passHref legacyBehavior>
              <Button className="bg-primary hover:bg-primary/95 text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" /> Create Your First Invoice
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table */}
          <div className="hidden md:block border border-border rounded-lg bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-semibold">Invoice No.</TableHead>
                  <TableHead className="font-semibold">Client</TableHead>
                  <TableHead className="font-semibold">Due Date</TableHead>
                  <TableHead className="font-semibold text-right">Amount</TableHead>
                  <TableHead className="font-semibold text-center">Status</TableHead>
                  <TableHead className="font-semibold text-center w-36">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice._id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-semibold font-mono text-foreground">{invoice.invoiceNumber}</TableCell>
                    <TableCell className="font-medium text-foreground">{invoice.clientSnapshot.name}</TableCell>
                    <TableCell className="text-muted-foreground font-sans text-sm">
                      {new Date(invoice.dueDate).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right font-mono text-foreground font-semibold tabular-nums">
                      ${invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={getStatusBadgeClass(invoice.displayStatus)}>{invoice.displayStatus}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/invoices/${invoice._id}`} passHref legacyBehavior>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                            <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            <span className="sr-only">View</span>
                          </Button>
                        </Link>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-muted"
                          title={invoice.status === "draft" ? "Copy draft link (not viewable until sent)" : "Copy shareable link"}
                          onClick={() => {
                            const shareUrl = `${window.location.origin}/invoice/${invoice.token}`;
                            navigator.clipboard.writeText(shareUrl).then(() => {
                              showToast(invoice.status === "draft" ? "Draft link copied to clipboard!" : "Public invoice link copied!");
                            });
                          }}
                        >
                          <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          <span className="sr-only">Copy Link</span>
                        </Button>

                        {invoice.status !== "paid" && (
                          <>
                            <Link href={`/invoices/new?id=${invoice._id}`} passHref legacyBehavior>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                                <Edit2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-destructive/10 text-destructive/85 hover:text-destructive"
                              onClick={() => {
                                setDeletingInvoice(invoice);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile responsive Cards list view */}
          <div className="grid gap-4 md:hidden">
            {invoices.map((invoice) => (
              <div
                key={invoice._id}
                className="border border-border rounded-lg bg-card p-5 space-y-4 shadow-sm flex flex-col"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold font-mono text-foreground">{invoice.invoiceNumber}</span>
                      <span className={getStatusBadgeClass(invoice.displayStatus)}>{invoice.displayStatus}</span>
                    </div>
                    <h3 className="font-semibold text-foreground mt-2">{invoice.clientSnapshot.name}</h3>
                  </div>
                  <div className="flex gap-1">
                    <Link href={`/invoices/${invoice._id}`} passHref legacyBehavior>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      title={invoice.status === "draft" ? "Copy draft link (not viewable until sent)" : "Copy shareable link"}
                      onClick={() => {
                        const shareUrl = `${window.location.origin}/invoice/${invoice.token}`;
                        navigator.clipboard.writeText(shareUrl).then(() => {
                          showToast(invoice.status === "draft" ? "Draft link copied to clipboard!" : "Public invoice link copied!");
                        });
                      }}
                    >
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    {invoice.status !== "paid" && (
                      <>
                        <Link href={`/invoices/new?id=${invoice._id}`} passHref legacyBehavior>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-destructive/20 hover:bg-destructive/10 text-destructive"
                          onClick={() => {
                            setDeletingInvoice(invoice);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-border grid grid-cols-2 text-xs gap-y-2">
                  <div>
                    <span className="text-muted-foreground block">Due Date</span>
                    <span className="font-medium text-foreground flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {new Date(invoice.dueDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground block">Amount</span>
                    <span className="font-bold text-foreground block mt-0.5 font-mono text-sm tabular-nums">
                      ${invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Invoice Alert confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-lg border border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-foreground">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              This action cannot be undone. This will permanently delete the invoice{" "}
              <strong className="text-foreground">{deletingInvoice?.invoiceNumber}</strong> for{" "}
              <strong>{deletingInvoice?.clientSnapshot.name}</strong> and remove it from your records.
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
                handleDeleteConfirm();
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

