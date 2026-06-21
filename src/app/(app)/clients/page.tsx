"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Edit2, Trash2, Mail, Phone, MapPin, Hash, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

// Define TypeScript interfaces for client model data
interface ClientData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
  createdAt: string;
}

// Zod validation schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  taxId: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientData | null>(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingClient, setDeletingClient] = useState<ClientData | null>(null);

  // Initialize React Hook Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      taxId: "",
    },
  });

  // Reset form when opening/closing or changing active edit client
  useEffect(() => {
    if (editingClient) {
      form.reset({
        name: editingClient.name,
        email: editingClient.email,
        phone: editingClient.phone || "",
        address: editingClient.address || "",
        taxId: editingClient.taxId || "",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        address: "",
        taxId: "",
      });
    }
  }, [editingClient, isDialogOpen, form]);

  // Query: Get client list
  const { data: clients = [], isLoading, isError, error } = useQuery<ClientData[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await fetch("/api/clients");
      if (!res.ok) {
        throw new Error("Failed to fetch clients");
      }
      return res.json();
    },
  });

  // Mutation: Create a new client
  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create client");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setIsDialogOpen(false);
    },
  });

  // Mutation: Update an existing client
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormValues }) => {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update client");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setIsDialogOpen(false);
      setEditingClient(null);
    },
  });

  // Mutation: Delete a client
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/clients/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete client");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setIsDeleteDialogOpen(false);
      setDeletingClient(null);
    },
  });

  // Form submit handler
  const onSubmit = (values: FormValues) => {
    // Sanitize optional fields to prevent sending empty string parameters to DB
    const cleanedValues: FormValues = {
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone?.trim() || undefined,
      address: values.address?.trim() || undefined,
      taxId: values.taxId?.trim() || undefined,
    };

    if (editingClient) {
      updateMutation.mutate({ id: editingClient._id, data: cleanedValues });
    } else {
      createMutation.mutate(cleanedValues);
    }
  };

  // Delete confirmation handler
  const handleDeleteConfirm = () => {
    if (deletingClient) {
      deleteMutation.mutate(deletingClient._id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Clients</h1>
          <p className="text-muted-foreground text-sm">
            Manage your client directory, contact information, and billing history.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingClient(null);
            setIsDialogOpen(true);
          }}
          className="bg-primary hover:bg-primary/95 text-primary-foreground font-medium rounded-lg"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>

      {isLoading ? (
        // Loading State
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading clients list...</p>
        </div>
      ) : isError ? (
        // Error State
        <div className="p-8 border border-destructive/20 bg-destructive/10 rounded-lg text-center">
          <p className="text-destructive font-semibold">Error Loading Clients</p>
          <p className="text-sm text-muted-foreground mt-1">{(error as Error).message}</p>
        </div>
      ) : clients.length === 0 ? (
        // Empty State
        <div className="border border-border border-dashed rounded-lg bg-card p-16 text-center max-w-xl mx-auto mt-8 flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Mail className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No clients yet</h3>
          <p className="text-muted-foreground text-sm mt-2 max-w-sm mb-6">
            Get started by adding your first client directory profile to issue invoices.
          </p>
          <Button
            onClick={() => {
              setEditingClient(null);
              setIsDialogOpen(true);
            }}
            className="bg-primary hover:bg-primary/95 text-primary-foreground"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Your First Client
          </Button>
        </div>
      ) : (
        // Client Directory Content Table
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block border border-border rounded-lg bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Phone</TableHead>
                  <TableHead className="font-semibold text-right">Total Invoiced</TableHead>
                  <TableHead className="font-semibold text-center w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client._id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium text-foreground">{client.name}</TableCell>
                    <TableCell className="text-muted-foreground">{client.email}</TableCell>
                    <TableCell className="text-muted-foreground">{client.phone || "—"}</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground tabular-nums">
                      —
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-muted"
                          onClick={() => {
                            setEditingClient(client);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-destructive/10 text-destructive/80 hover:text-destructive"
                          onClick={() => {
                            setDeletingClient(client);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile responsive Cards list view */}
          <div className="grid gap-4 md:hidden">
            {clients.map((client) => (
              <div
                key={client._id}
                className="border border-border rounded-lg bg-card p-5 space-y-4 shadow-sm flex flex-col"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-foreground">{client.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                      <Mail className="h-3 w-3" /> {client.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditingClient(client);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-destructive/20 hover:bg-destructive/10 text-destructive"
                      onClick={() => {
                        setDeletingClient(client);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="pt-2 border-t border-border grid grid-cols-2 text-xs gap-y-2">
                  <div>
                    <span className="text-muted-foreground block">Phone</span>
                    <span className="font-medium text-foreground flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3 text-muted-foreground" /> {client.phone || "—"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground block">Total Invoiced</span>
                    <span className="font-medium text-foreground block mt-0.5 font-mono">—</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Client Modal dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg rounded-lg border border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              {editingClient ? "Edit Client Details" : "Create New Client"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {editingClient
                ? "Update client demographic data, tax registration code, or address mappings."
                : "Fill in the fields below to create a client contact profile in your directory."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Acme Corporation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g. billing@acme.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. +1 555 0199" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax / VAT registration code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. US12345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 123 Main St, Suite 400, New York, NY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/95 text-primary-foreground font-medium"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : editingClient ? (
                    "Save Changes"
                  ) : (
                    "Create Client"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Client Alert confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-lg border border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-foreground">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              This action cannot be undone. This will permanently delete the client directory profile for{" "}
              <strong className="text-foreground">{deletingClient?.name}</strong> and remove all related data from our servers.
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
                "Delete Client"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
