"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, Palette, Layout, Check, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToast } from "@/features/invoices/lib/invoiceUtils";

interface InvoiceTemplate {
  _id: string;
  companyId?: string;
  name: string;
  primaryColor: string;
  layoutType: "default" | "modern" | "minimal";
  createdAt: string;
}

const PRESET_COLORS = [
  "#7C3AED", // Violet
  "#0D9488", // Teal
  "#2563EB", // Blue
  "#DB2777", // Pink
  "#D97706", // Amber
  "#059669", // Emerald
  "#27272A", // Zinc
];

export default function TemplatesPage() {
  const queryClient = queryClientHook();
  const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplate | null>(null);

  // Editor states
  const [name, setName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#7C3AED");
  const [layoutType, setLayoutType] = useState<"default" | "modern" | "minimal">("default");
  const [isEditing, setIsEditing] = useState(false);

  // Query: Get all templates
  const { data: templates = [], isLoading, isError } = useQuery<InvoiceTemplate[]>({
    queryKey: ["templates"],
    queryFn: async () => {
      const res = await fetch("/api/templates");
      if (!res.ok) throw new Error("Failed to fetch templates");
      return res.json();
    },
  });

  // Mutation: Create template
  const createMutation = useMutation({
    mutationFn: async (payload: { name: string; primaryColor: string; layoutType: string }) => {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create template");
      }
      return res.json();
    },
    onSuccess: (newTpl) => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      setSelectedTemplate(newTpl);
      setIsEditing(false);
      showToast("Invoice template created successfully!");
    },
    onError: (err: any) => {
      showToast(err.message);
    },
  });

  // Mutation: Update template
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: { name?: string; primaryColor?: string; layoutType?: string } }) => {
      const res = await fetch(`/api/templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update template");
      }
      return res.json();
    },
    onSuccess: (updatedTpl) => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      setSelectedTemplate(updatedTpl);
      setIsEditing(false);
      showToast("Invoice template updated successfully!");
    },
    onError: (err: any) => {
      showToast(err.message);
    },
  });

  // Mutation: Delete template
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete template");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      setSelectedTemplate(null);
      setName("");
      setPrimaryColor("#7C3AED");
      setLayoutType("default");
      setIsEditing(false);
      showToast("Invoice template deleted successfully.");
    },
    onError: (err: any) => {
      showToast(err.message);
    },
  });

  // Dynamically queryClient helper
  function queryClientHook() {
    return useQueryClient();
  }

  // Load initial template when templates first load
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0]);
    }
  }, [templates]);

  // Handle template selection
  useEffect(() => {
    if (selectedTemplate) {
      setName(selectedTemplate.name);
      setPrimaryColor(selectedTemplate.primaryColor);
      setLayoutType(selectedTemplate.layoutType);
      setIsEditing(false);
    }
  }, [selectedTemplate]);

  const handleCreateNewClick = () => {
    setSelectedTemplate(null);
    setName("My Custom Design");
    setPrimaryColor("#7C3AED");
    setLayoutType("default");
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      showToast("Template name is required");
      return;
    }

    const payload = {
      name: name.trim(),
      primaryColor,
      layoutType,
    };

    if (selectedTemplate && selectedTemplate._id) {
      updateMutation.mutate({ id: selectedTemplate._id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = () => {
    if (!selectedTemplate || !selectedTemplate._id) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this custom template? Invoices referencing it will revert to the default template style."
    );
    if (confirmed) {
      deleteMutation.mutate(selectedTemplate._id);
    }
  };

  const isSystemDefault = !!(selectedTemplate && !selectedTemplate.companyId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Custom Invoice Designer</h1>
          <p className="text-muted-foreground text-sm">
            Customize layouts and colors to style your public and downloaded PDF invoice profiles.
          </p>
        </div>
        <Button
          onClick={handleCreateNewClick}
          className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-lg shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" /> Create Custom Template
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading brand templates...</p>
        </div>
      ) : isError ? (
        <div className="p-8 border border-destructive/20 bg-destructive/10 rounded-lg text-center">
          <p className="text-destructive font-semibold">Error Loading Invoice Templates</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: List and Forms Editor */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Sidebar List Selector */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Your Designs</h2>
              <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
                {templates.map((tpl) => {
                  const isSelected = selectedTemplate?._id === tpl._id;
                  const isDefault = !tpl.companyId;

                  return (
                    <button
                      key={tpl._id}
                      onClick={() => setSelectedTemplate(tpl)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all border ${
                        isSelected
                          ? "bg-primary/10 border-primary text-primary"
                          : "border-transparent bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="h-3 w-3 rounded-full border border-black/10"
                          style={{ backgroundColor: tpl.primaryColor }}
                        />
                        <span className="truncate max-w-[150px]">{tpl.name}</span>
                      </div>
                      {isDefault && (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                          System Default
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Template Editor Form */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  {selectedTemplate ? "Template Settings" : "New Custom Template"}
                </h2>
                {selectedTemplate && (
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {isSystemDefault ? "View-Only" : "Custom Design"}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {/* Name field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Design Name</label>
                  <Input
                    type="text"
                    disabled={isSystemDefault && !isEditing}
                    placeholder="e.g. Acme Corporate Purple"
                    value={name}
                    onChange={(e) => {
                      setIsEditing(true);
                      setName(e.target.value);
                    }}
                    className="h-9 text-xs"
                  />
                </div>

                {/* Layout field */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground block">Select Layout Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["default", "modern", "minimal"] as const).map((type) => {
                      const isSelected = layoutType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          disabled={isSystemDefault && !isEditing}
                          onClick={() => {
                            setIsEditing(true);
                            setLayoutType(type);
                          }}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5 text-primary shadow-sm"
                              : "border-border hover:border-foreground/20 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Layout className="h-4 w-4 mb-1" />
                          <span className="text-[10px] font-bold uppercase tracking-wider capitalize">{type}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground block">Accent Brand Color</label>
                  <div className="flex flex-wrap items-center gap-2">
                    {PRESET_COLORS.map((c) => {
                      const isSelected = primaryColor.toLowerCase() === c.toLowerCase();
                      return (
                        <button
                          key={c}
                          type="button"
                          disabled={isSystemDefault && !isEditing}
                          onClick={() => {
                            setIsEditing(true);
                            setPrimaryColor(c);
                          }}
                          className="h-7 w-7 rounded-full transition-all border border-black/10 flex items-center justify-center focus:ring-1 focus:ring-primary shadow-sm"
                          style={{ backgroundColor: c }}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white drop-shadow-md" />}
                        </button>
                      );
                    })}
                    {/* Custom Color Input */}
                    <div className="relative h-7 w-7 rounded-full border border-border overflow-hidden cursor-pointer shadow-sm">
                      <input
                        type="color"
                        disabled={isSystemDefault && !isEditing}
                        value={primaryColor}
                        onChange={(e) => {
                          setIsEditing(true);
                          setPrimaryColor(e.target.value);
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
                      />
                      <div
                        className="h-full w-full flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                        style={{ backgroundColor: PRESET_COLORS.includes(primaryColor) ? undefined : primaryColor }}
                      >
                        {!PRESET_COLORS.includes(primaryColor) && (
                          <Check className="h-3 w-3 text-white drop-shadow-md" />
                        )}
                        {PRESET_COLORS.includes(primaryColor) && (
                          <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              {(!isSystemDefault || isEditing) && (
                <div className="pt-2 border-t border-border flex items-center justify-between gap-3">
                  {!isEditing && selectedTemplate && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="border-destructive/20 text-destructive/90 hover:text-destructive hover:bg-destructive/10 h-8 font-semibold text-xs"
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                    </Button>
                  )}
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (selectedTemplate) {
                          setName(selectedTemplate.name);
                          setPrimaryColor(selectedTemplate.primaryColor);
                          setLayoutType(selectedTemplate.layoutType);
                        } else if (templates.length > 0) {
                          setSelectedTemplate(templates[0]);
                        }
                        setIsEditing(false);
                      }}
                      className="h-8 font-medium text-xs text-muted-foreground"
                    >
                      Reset
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="bg-primary hover:bg-primary/95 text-primary-foreground h-8 font-semibold text-xs ml-auto"
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saving...
                      </>
                    ) : (
                      "Save Design"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Mockup Preview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Live Invoice Preview</h2>
              <span className="text-[10px] text-muted-foreground flex items-center">
                <FileText className="h-3.5 w-3.5 mr-1" /> Approximation Mockup
              </span>
            </div>

            <div className="border border-border rounded-xl bg-card shadow-lg p-8 space-y-6 text-foreground text-xs leading-relaxed max-w-lg mx-auto w-full aspect-[1/1.41] relative overflow-hidden transition-all duration-300">
              {/* Layout Header Container */}
              <div
                className={`flex flex-row justify-between items-center pb-6 border-b ${
                  layoutType === "minimal" ? "border-transparent" : "border-border"
                } ${
                  layoutType === "modern" ? "bg-muted/50 p-4 -mx-8 -mt-8 rounded-t-xl mb-4 border-b-2" : ""
                }`}
                style={{
                  borderBottomColor: layoutType === "modern" ? primaryColor : undefined,
                }}
              >
                <div>
                  <div
                    className="font-bold text-sm block"
                    style={{ color: layoutType === "minimal" ? undefined : primaryColor }}
                  >
                    ACME CORPORATION
                  </div>
                  <span className="text-[10px] text-muted-foreground">123 Business Rd, Suite 100</span>
                </div>
                <div className="text-right">
                  <span
                    className="font-bold text-lg block"
                    style={{ color: layoutType === "minimal" ? undefined : primaryColor }}
                  >
                    INVOICE
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">INV-0042</span>
                </div>
              </div>

              {/* Client and Date details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground block uppercase mb-1">Bill To:</span>
                  <span className="font-bold block">Wayne Enterprises</span>
                  <span className="text-muted-foreground block">bruce@wayne.com</span>
                </div>
                <div className="text-right space-y-1">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground block uppercase">Issue Date:</span>
                    <span>June 21, 2026</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground block uppercase">Due Date:</span>
                    <span>July 21, 2026</span>
                  </div>
                </div>
              </div>

              {/* Table of items mockup */}
              <div
                className={`border rounded-lg overflow-hidden ${
                  layoutType === "minimal" ? "border-transparent border-b" : "border-border"
                }`}
              >
                <table className="w-full text-[10px] text-left">
                  <thead
                    className={`font-bold ${layoutType === "modern" ? "text-white" : "text-muted-foreground"}`}
                    style={{
                      backgroundColor: layoutType === "modern" ? primaryColor : undefined,
                    }}
                  >
                    <tr className={layoutType === "minimal" ? "border-b border-border" : ""}>
                      <th className="p-2 w-1/2">Description</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-right">Price</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="p-2 font-medium">Software Development Services</td>
                      <td className="p-2 text-center font-mono">1</td>
                      <td className="p-2 text-right font-mono">$5,000.00</td>
                      <td className="p-2 text-right font-mono">$5,000.00</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Cloud Infrastructure Setup</td>
                      <td className="p-2 text-center font-mono">1</td>
                      <td className="p-2 text-right font-mono">$1,500.00</td>
                      <td className="p-2 text-right font-mono">$1,500.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Summary Block */}
              <div className="flex justify-end pt-4">
                <div className="w-1/2 space-y-2">
                  <div className="flex justify-between font-mono">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>$6,500.00</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-muted-foreground">Tax (10%):</span>
                    <span>$650.00</span>
                  </div>
                  <div
                    className="flex justify-between font-bold border-t pt-2"
                    style={{ borderColor: primaryColor }}
                  >
                    <span style={{ color: layoutType === "minimal" ? undefined : primaryColor }}>Total Due:</span>
                    <span style={{ color: layoutType === "minimal" ? undefined : primaryColor }}>$7,150.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
