"use client";

import React, { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import {
  Building,
  Mail,
  Phone,
  MapPin,
  Hash,
  Loader2,
  Save,
  AlertTriangle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";

interface CompanyData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
}

const settingsSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  taxId: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const queryClient = useQueryClient();

  // 1. Fetch Company details
  const { data: company, isLoading, isError, error } = useQuery<CompanyData>({
    queryKey: ["company"],
    queryFn: async () => {
      const res = await fetch("/api/company");
      if (!res.ok) {
        throw new Error("Failed to fetch company settings");
      }
      return res.json();
    },
  });

  // 2. Initialize Form
  const form = useForm<FormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      taxId: "",
    },
  });

  // 3. Populate form when company data loads
  useEffect(() => {
    if (company) {
      form.reset({
        name: company.name || "",
        phone: company.phone || "",
        address: company.address || "",
        taxId: company.taxId || "",
      });
    }
  }, [company, form]);

  // 4. Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await fetch("/api/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update company settings");
      }
      return res.json();
    },
    onSuccess: (updatedData) => {
      // Invalidate queries to refresh layouts/sidebar displaying company name
      queryClient.invalidateQueries({ queryKey: ["company"] });
      toast.success("Settings updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "An error occurred while updating settings.");
    },
  });

  const onSubmit = (values: FormValues) => {
    updateMutation.mutate({
      name: values.name.trim(),
      phone: values.phone?.trim() || "",
      address: values.address?.trim() || "",
      taxId: values.taxId?.trim() || "",
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading company configurations...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 border border-destructive/20 bg-destructive/10 rounded-lg text-center max-w-xl mx-auto">
        <div className="mx-auto w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="text-destructive font-semibold">Error Loading Settings</p>
        <p className="text-sm text-muted-foreground mt-1">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Update your company details, business identification, address, and billing information.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Card: Company Identity */}
            <div className="border border-border rounded-xl bg-card p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                <Building className="h-4.5 w-4.5 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Company Identity</h3>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground">Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Acme Corporation" {...field} className="text-sm" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel className="text-xs font-semibold text-muted-foreground">Contact Email</FormLabel>
                <div className="relative">
                  <Input
                    type="email"
                    value={company?.email || ""}
                    disabled
                    className="bg-muted text-muted-foreground cursor-not-allowed pl-9 text-sm"
                  />
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Credentials and login email addresses are managed securely through Clerk.
                </p>
              </div>
            </div>

            {/* Right Card: Business Metadata */}
            <div className="border border-border rounded-xl bg-card p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                <Hash className="h-4.5 w-4.5 text-accent" />
                <h3 className="text-sm font-bold text-foreground">Business Information</h3>
              </div>

              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground">Tax ID / VAT Registration Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. EIN-12345678" {...field} className="text-sm" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground">Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="e.g. +1 555-0199" {...field} className="pl-9 text-sm" />
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Bottom Card: Location details */}
          <div className="border border-border rounded-xl bg-card p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-border/40">
              <MapPin className="h-4.5 w-4.5 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Registered Office Location</h3>
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-muted-foreground">Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 120 Main Street, Suite 500, New York, NY" {...field} className="text-sm" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-2.5 rounded-lg shadow shadow-primary/10 transition-colors"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
