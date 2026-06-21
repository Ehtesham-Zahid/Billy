"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, Building2, Users, FileText, Briefcase, Calendar, Mail, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CompanyMetrics {
  clients: number;
  invoices: number;
  employees: number;
}

interface CompanyData {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  accountType: string;
  metrics: CompanyMetrics;
}

export default function AdminConsolePage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: companies = [], isLoading, isError, error } = useQuery<CompanyData[]>({
    queryKey: ["admin", "companies"],
    queryFn: async () => {
      const res = await fetch("/api/admin/companies");
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Access Denied: You do not have permission to view this console.");
        }
        throw new Error("Failed to load platform registry data.");
      }
      return res.json();
    },
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter companies by search query
  const filteredCompanies = companies.filter((c) => {
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  // Calculate aggregates
  const totalCompanies = companies.length;
  const totalClients = companies.reduce((sum, c) => sum + (c.metrics?.clients || 0), 0);
  const totalInvoices = companies.reduce((sum, c) => sum + (c.metrics?.invoices || 0), 0);
  const totalEmployees = companies.reduce((sum, c) => sum + (c.metrics?.employees || 0), 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading system console registry...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border border-destructive/20 bg-destructive/10 rounded-2xl p-10 text-center max-w-xl mx-auto mt-8 space-y-4">
        <div className="mx-auto w-12 h-12 bg-destructive/15 text-destructive rounded-full flex items-center justify-center">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-destructive">Platform Access Restrained</h3>
          <p className="text-sm text-muted-foreground">
            {(error as Error).message || "An unexpected system authorization challenge occurred."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Platform Console</h1>
        <p className="text-muted-foreground text-sm">
          System administration, metrics tracking, and aggregates overview of all active tenant company profiles.
        </p>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="border border-border bg-card rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shadow-inner">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">Total Companies</span>
            <span className="text-2xl font-bold text-foreground font-mono">{totalCompanies}</span>
          </div>
        </div>

        <div className="border border-border bg-card rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shadow-inner">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">Total Clients</span>
            <span className="text-2xl font-bold text-foreground font-mono">{totalClients}</span>
          </div>
        </div>

        <div className="border border-border bg-card rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">Total Invoices</span>
            <span className="text-2xl font-bold text-foreground font-mono">{totalInvoices}</span>
          </div>
        </div>

        <div className="border border-border bg-card rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center shadow-inner">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">Total Employees</span>
            <span className="text-2xl font-bold text-foreground font-mono">{totalEmployees}</span>
          </div>
        </div>
      </div>

      {/* Control Actions & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-muted/30 p-4 border border-border rounded-xl">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card border-border rounded-lg"
          />
        </div>
      </div>

      {/* Companies Registry List */}
      <div className="space-y-4">
        {filteredCompanies.length === 0 ? (
          <div className="border border-border border-dashed rounded-xl bg-card p-16 text-center max-w-xl mx-auto flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No companies matched</h3>
            <p className="text-muted-foreground text-sm mt-1 max-w-xs">
              No registered profiles matched your search term "{searchQuery}". Try editing the keyword.
            </p>
          </div>
        ) : (
          <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase border-b border-border">
                    <th className="px-6 py-4 font-semibold">Company Profile</th>
                    <th className="px-6 py-4 font-semibold">Account Tier</th>
                    <th className="px-6 py-4 font-semibold">Registered Date</th>
                    <th className="px-6 py-4 text-center font-semibold">Clients</th>
                    <th className="px-6 py-4 text-center font-semibold">Invoices</th>
                    <th className="px-6 py-4 text-center font-semibold">Employees</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {filteredCompanies.map((company) => (
                    <tr key={company._id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 space-y-1">
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          {company.name}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {company.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
                            company.accountType === "platform_admin"
                              ? "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-900"
                              : "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900"
                          }`}
                        >
                          {company.accountType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground flex items-center gap-1.5 py-5">
                        <Calendar className="h-4 w-4" /> {formatDate(company.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-center font-mono font-semibold tabular-nums text-foreground">
                        {company.metrics?.clients ?? 0}
                      </td>
                      <td className="px-6 py-4 text-center font-mono font-semibold tabular-nums text-foreground">
                        {company.metrics?.invoices ?? 0}
                      </td>
                      <td className="px-6 py-4 text-center font-mono font-semibold tabular-nums text-foreground">
                        {company.metrics?.employees ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
