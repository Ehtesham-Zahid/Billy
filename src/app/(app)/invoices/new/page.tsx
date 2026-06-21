"use client";

import React, { useEffect, Suspense } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, Calendar, FileText, ArrowLeft, Loader2, Info, Check } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Type definitions
interface ClientOption {
  _id: string;
  name: string;
  email: string;
}

interface InvoiceDetail {
  _id: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  taxRate: number;
  notes?: string;
  status: "draft" | "sent" | "paid" | "overdue";
  items: {
    description: string;
    quantity: number;
    price: number;
    amount: number;
  }[];
  templateId?: string | { _id: string; name: string; primaryColor: string; layoutType: string };
}

// Zod validation schemas
const itemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().positive("Must be greater than 0"),
  price: z.number().nonnegative("Cannot be negative"),
});

const formSchema = z.object({
  clientId: z.string().min(1, "Please select a client"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  items: z.array(itemSchema).min(1, "At least one line item is required"),
  taxRate: z.number().nonnegative("Tax rate cannot be negative"),
  notes: z.string().optional(),
  templateId: z.string().optional(),
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

type FormValues = z.infer<typeof formSchema>;

function InvoiceFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const editId = searchParams.get("id");

  // Fetch client options list
  const { data: clients = [], isLoading: isLoadingClients } = useQuery<ClientOption[]>({
    queryKey: ["clients-options"],
    queryFn: async () => {
      const res = await fetch("/api/clients");
      if (!res.ok) throw new Error("Failed to fetch clients");
      return res.json();
    },
  });

  // Fetch templates list
  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery<any[]>({
    queryKey: ["templates"],
    queryFn: async () => {
      const res = await fetch("/api/templates");
      if (!res.ok) throw new Error("Failed to fetch templates");
      return res.json();
    },
  });

  // Fetch invoice details if editing
  const { data: invoice, isLoading: isLoadingInvoice } = useQuery<InvoiceDetail>({
    queryKey: ["invoice-edit", editId],
    queryFn: async () => {
      const res = await fetch(`/api/invoices/${editId}`);
      if (!res.ok) throw new Error("Failed to fetch invoice details");
      return res.json();
    },
    enabled: !!editId,
  });

  // React Hook Form initialization
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: "",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      taxRate: 0,
      notes: "",
      items: [{ description: "", quantity: 1, price: 0 }],
      templateId: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (invoice && editId) {
      // Format dates to YYYY-MM-DD
      const formattedIssueDate = new Date(invoice.issueDate).toISOString().split("T")[0];
      const formattedDueDate = new Date(invoice.dueDate).toISOString().split("T")[0];
      
      const resolvedTemplateId = invoice.templateId && typeof invoice.templateId === "object"
        ? (invoice.templateId as any)._id
        : invoice.templateId || "";

      form.reset({
        clientId: invoice.clientId,
        issueDate: formattedIssueDate,
        dueDate: formattedDueDate,
        taxRate: invoice.taxRate,
        notes: invoice.notes || "",
        items: invoice.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          price: item.price,
        })),
        templateId: resolvedTemplateId,
      });
    }
  }, [invoice, editId, form]);

  // Default the templateId for new invoices
  useEffect(() => {
    if (!editId && templates.length > 0) {
      const customTemplates = templates.filter((t: any) => t.companyId);
      const systemTemplates = templates.filter((t: any) => !t.companyId);
      
      let targetId = "";
      if (customTemplates.length > 0) {
        const sortedCustom = [...customTemplates].sort((a, b) => 
          new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
        );
        targetId = sortedCustom[0]._id;
      } else {
        const classicViolet = systemTemplates.find((t: any) => t.name === "Classic Violet") || systemTemplates[0];
        targetId = classicViolet?._id || "";
      }
      
      if (targetId) {
        form.setValue("templateId", targetId);
      }
    }
  }, [editId, templates, form]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create invoice");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      router.push("/invoices");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await fetch(`/api/invoices/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update invoice");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice-detail", editId] });
      router.push(`/invoices/${editId}`);
    },
  });

  const onSubmit = (values: FormValues) => {
    if (editId) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  // Watch fields for live preview calculation
  const itemsWatch = useWatch({ control: form.control, name: "items" });
  const taxRateWatch = useWatch({ control: form.control, name: "taxRate" }) || 0;

  // Live total calculations
  const calculatePreview = () => {
    let subtotal = 0;
    if (itemsWatch && Array.isArray(itemsWatch)) {
      itemsWatch.forEach((item) => {
        if (item) {
          const qty = Number(item.quantity) || 0;
          const prc = Number(item.price) || 0;
          subtotal += Math.round(qty * prc * 100) / 100;
        }
      });
    }
    const subtotalFormatted = Math.round(subtotal * 100) / 100;
    const taxAmount = Math.round(subtotalFormatted * (taxRateWatch / 100) * 100) / 100;
    const total = Math.round((subtotalFormatted + taxAmount) * 100) / 100;

    return {
      subtotal: subtotalFormatted,
      taxAmount,
      total,
    };
  };

  const preview = calculatePreview();

  // Loading state
  const isFormLoading = isLoadingClients || isLoadingTemplates || (editId && isLoadingInvoice);
  if (isFormLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading editor configuration...</p>
      </div>
    );
  }

  // Zero Client blocking state
  if (clients.length === 0) {
    return (
      <div className="border border-border rounded-lg bg-card p-16 text-center max-w-xl mx-auto mt-8 flex flex-col items-center shadow-sm">
        <div className="h-12 w-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
          <Info className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Zero Clients Registered</h3>
        <p className="text-muted-foreground text-sm mt-2 max-w-sm mb-6">
          You must create at least one client profile directory before drafting an invoice.
        </p>
        <Link href="/clients" passHref legacyBehavior>
          <Button className="bg-primary hover:bg-primary/95 text-primary-foreground">
            Register New Client
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-lg"
          onClick={() => (editId ? router.push(`/invoices/${editId}`) : router.push("/invoices"))}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {editId ? "Edit Invoice" : "Create Invoice"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {editId ? `Modify values for invoice. (Invoice status: ${invoice?.status})` : "Draft a new invoice billing record."}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Form Left Side */}
            <div className="md:col-span-2 space-y-6 bg-card border border-border rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-foreground text-sm border-b border-border pb-2">Billing Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Client select */}
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-1">
                      <FormLabel>Client *</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="">Select a client...</option>
                          {clients.map((client) => (
                            <option key={client._id} value={client._id}>
                              {client.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Issue date */}
                <FormField
                  control={form.control}
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Due date */}
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Dynamic Line items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="font-semibold text-foreground text-sm">Line Items *</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg"
                    onClick={() => append({ description: "", quantity: 1, price: 0 })}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add Item
                  </Button>
                </div>

                {form.formState.errors.items?.message && (
                  <p className="text-xs font-semibold text-destructive">{form.formState.errors.items.message}</p>
                )}

                {/* Desktop Line Items Table Header */}
                <div className="hidden sm:grid grid-cols-12 gap-4 text-xs font-semibold text-muted-foreground px-2">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-3">Unit Price</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Item Fields List */}
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 sm:p-0 border border-border sm:border-0 rounded-lg bg-muted/20 sm:bg-transparent"
                    >
                      {/* Description */}
                      <div className="sm:col-span-6">
                        <Label className="sm:hidden text-xs text-muted-foreground mb-1 block">Description *</Label>
                        <FormField
                          control={form.control}
                          name={`items.${index}.description` as const}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="e.g. Consulting Hours" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Quantity */}
                      <div className="sm:col-span-2">
                        <Label className="sm:hidden text-xs text-muted-foreground mb-1 block">Quantity *</Label>
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity` as const}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  placeholder="1"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Price */}
                      <div className="sm:col-span-3">
                        <Label className="sm:hidden text-xs text-muted-foreground mb-1 block">Price *</Label>
                        <FormField
                          control={form.control}
                          name={`items.${index}.price` as const}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="0.00"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Remove item button */}
                      <div className="flex sm:col-span-1 items-end sm:items-center justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-destructive hover:bg-destructive/10"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side Summary Panel */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-6">
                <h3 className="font-semibold text-foreground text-sm border-b border-border pb-2">Financial Breakdown</h3>

                {/* Tax Rate field */}
                <FormField
                  control={form.control}
                  name="taxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          placeholder="0.0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Money Totals Preview */}
                <div className="space-y-3 pt-4 border-t border-border text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-mono tabular-nums">${preview.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax Amount ({taxRateWatch}%)</span>
                    <span className="font-mono tabular-nums">${preview.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-foreground font-bold text-base pt-2 border-t border-border">
                    <span>Total Amount</span>
                    <span className="font-mono tabular-nums text-primary">${preview.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Design Template block */}
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-4">
                <h3 className="font-semibold text-foreground text-sm border-b border-border pb-2">Design Template</h3>
                <FormField
                  control={form.control}
                  name="templateId"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormControl>
                        <div className="grid grid-cols-1 gap-2">
                          {templates.map((tpl: any) => {
                            const isSelected = field.value === tpl._id;
                            const isDefault = !tpl.companyId;
                            return (
                              <button
                                key={tpl._id}
                                type="button"
                                onClick={() => field.onChange(tpl._id)}
                                className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                                  isSelected
                                    ? "border-primary bg-primary/5 text-primary shadow-sm ring-1 ring-primary"
                                    : "border-border hover:border-foreground/20 text-muted-foreground hover:text-foreground bg-background"
                                }`}
                              >
                                <div className="flex items-center space-x-3 min-w-0">
                                  <div
                                    className="h-3.5 w-3.5 rounded-full border border-black/10 flex-shrink-0"
                                    style={{ backgroundColor: tpl.primaryColor }}
                                  />
                                  <div className="truncate">
                                    <div className="text-xs font-bold truncate text-foreground">{tpl.name}</div>
                                    <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                      <span className="capitalize">{tpl.layoutType} layout</span>
                                      {isDefault && (
                                        <>
                                          <span>•</span>
                                          <span className="text-[8px] font-bold uppercase px-1 py-0.2 rounded bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                            Default
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {isSelected && (
                                  <div className="h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                                    <Check className="h-3 w-3" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notes block */}
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-4">
                <h3 className="font-semibold text-foreground text-sm border-b border-border pb-2">Invoice Notes</h3>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <textarea
                          placeholder="Provide terms, bank info, or specific details..."
                          rows={4}
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submission controls */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-lg"
                  onClick={() => (editId ? router.push(`/invoices/${editId}`) : router.push("/invoices"))}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/95 text-primary-foreground font-medium rounded-lg"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : editId ? (
                    "Save Invoice"
                  ) : (
                    "Draft Invoice"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading workspace configurations...</p>
        </div>
      }
    >
      <InvoiceFormContent />
    </Suspense>
  );
}
