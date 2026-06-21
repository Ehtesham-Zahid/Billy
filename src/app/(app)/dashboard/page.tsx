"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  Users,
  Briefcase,
  AlertCircle,
  FileText,
  Loader2,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  ClipboardList
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";

import { Button } from "@/components/ui/button";
import { getComputedInvoiceStatus } from "@/features/invoices/lib/invoiceUtils";
import { DashboardMetrics } from "@/services/dashboard.service";

const INVOICE_STATUS_COLORS: Record<string, string> = {
  draft: "#71717a", // zinc-500
  sent: "#3b82f6", // blue-500
  paid: "#10b981", // emerald-500
  overdue: "#ef4444", // red-500
};

const CHART_COLORS = ["#6366f1", "#14b8a6", "#3b82f6", "#db2777", "#f59e0b"];

// Premium custom tooltip for trend charts
const TrendTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg shadow-xl text-xs font-sans space-y-1.5 text-white">
        <p className="font-semibold text-zinc-400">{label}</p>
        {payload.map((item: any) => (
          <div key={item.name} className="flex items-center justify-between gap-4 font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="capitalize text-zinc-400">{item.name}:</span>
            </div>
            <span className="font-bold text-zinc-100">
              ${item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Premium custom tooltip for pie charts
const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg shadow-xl text-xs font-sans text-white">
        <div className="flex items-center space-x-2 font-mono">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: data.payload.fill }} />
          <span className="capitalize text-zinc-400">{data.name}:</span>
          <span className="font-bold text-zinc-100">{data.value}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [period, setPeriod] = useState<"all" | "month" | "30days">("all");

  // Query: Get dashboard aggregated metrics
  const { data: metrics, isLoading, isError, error } = useQuery<DashboardMetrics>({
    queryKey: ["dashboard", period],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard?period=${period}`);
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      return res.json();
    },
  });

  // Numeric currency formatter
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Assembling business analytics...</p>
      </div>
    );
  }

  if (isError || !metrics) {
    return (
      <div className="p-8 border border-destructive/20 bg-destructive/10 rounded-lg text-center max-w-xl mx-auto mt-8">
        <p className="text-destructive font-semibold">Error Loading Dashboard</p>
        <p className="text-sm text-muted-foreground mt-1">
          {error ? (error as Error).message : "An unexpected error occurred while fetching metrics."}
        </p>
      </div>
    );
  }

  // Detect clean onboarding state for completely fresh accounts
  const isNewAccount =
    metrics.totalRevenueInvoiced === 0 &&
    metrics.totalPayrollExpense === 0 &&
    metrics.activeEmployeesCount === 0 &&
    metrics.totalClientsCount === 0;

  return (
    <div className="space-y-6">
      {/* Header and Toggle Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Monitor company revenue, outstanding invoices, and payroll distributions.
          </p>
        </div>
        <div className="flex p-1 bg-muted rounded-lg border border-border w-fit self-start md:self-auto shadow-inner">
          {(["all", "month", "30days"] as const).map((p) => {
            const label = p === "all" ? "All Time" : p === "month" ? "This Month" : "Last 30 Days";
            return (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  period === p
                    ? "bg-card text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {isNewAccount ? (
        /* Empty/Onboarding state card overlay */
        <div className="border border-border border-dashed rounded-xl bg-card p-10 text-center max-w-2xl mx-auto shadow-sm space-y-6 flex flex-col items-center py-16">
          <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <ClipboardList className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">Welcome to Billy!</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Your dashboard analytics are currently empty. Complete the onboarding steps below to populate your financial trends.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-md w-full pt-2">
            <Link href="/clients" className="group flex items-center justify-between p-3.5 border border-border bg-muted/20 hover:bg-muted/40 rounded-lg text-xs font-semibold transition-all">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Step 1</span>
                <span className="text-foreground font-bold">Register Client Profiles</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </Link>
            <Link href="/employees" className="group flex items-center justify-between p-3.5 border border-border bg-muted/20 hover:bg-muted/40 rounded-lg text-xs font-semibold transition-all">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Step 2</span>
                <span className="text-foreground font-bold">Add Active Employees</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </Link>
            <Link href="/invoices/new" className="group flex items-center justify-between p-3.5 border border-border bg-muted/20 hover:bg-muted/40 rounded-lg text-xs font-semibold transition-all">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Step 3</span>
                <span className="text-foreground font-bold">Draft Billing Invoices</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </Link>
            <Link href="/payroll" className="group flex items-center justify-between p-3.5 border border-border bg-muted/20 hover:bg-muted/40 rounded-lg text-xs font-semibold transition-all">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Step 4</span>
                <span className="text-foreground font-bold">Process Month Payroll</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Top KPI Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card: Revenue Collected */}
            <div className="p-6 bg-card border border-border rounded-xl shadow-sm space-y-2 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Revenue Collected</h3>
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-foreground tracking-tight tabular-nums">
                  {formatCurrency(metrics.totalRevenueCollected)}
                </p>
                <p className="text-[10px] text-muted-foreground font-semibold mt-1">
                  Total Invoiced: {formatCurrency(metrics.totalRevenueInvoiced)}
                </p>
              </div>
            </div>

            {/* Card: Total Outstanding */}
            <div className="p-6 bg-card border border-border rounded-xl shadow-sm space-y-2 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Outstanding</h3>
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <FileText className="h-4 w-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-foreground tracking-tight tabular-nums">
                  {formatCurrency(metrics.totalOutstanding)}
                </p>
                <p className="text-[10px] text-destructive/80 font-bold mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  Overdue: {formatCurrency(metrics.overdueAmount)}
                </p>
              </div>
            </div>

            {/* Card: Payroll Paid */}
            <div className="p-6 bg-card border border-border rounded-xl shadow-sm space-y-2 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Payroll Expense</h3>
                <div className="h-8 w-8 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-foreground tracking-tight tabular-nums">
                  {formatCurrency(metrics.totalPayrollExpense)}
                </p>
                <p className="text-[10px] text-muted-foreground font-semibold mt-1">
                  Active Employees: {metrics.activeEmployeesCount} (Clients: {metrics.totalClientsCount})
                </p>
              </div>
            </div>

            {/* Card: Net Position */}
            <div className="p-6 bg-card border border-border rounded-xl shadow-sm space-y-2 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Net Position</h3>
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div>
                <p className={`text-2xl font-bold font-mono tracking-tight tabular-nums ${metrics.netPosition >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                  {formatCurrency(metrics.netPosition)}
                </p>
                <p className="text-[10px] text-muted-foreground font-semibold mt-1">
                  Revenue Collected minus Payroll Paid
                </p>
              </div>
            </div>
          </div>

          {/* Chart Section Grid */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            {/* Chart: Revenue vs. Payroll Trend */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Revenue vs. Payroll Trend</h2>
                <span className="text-[10px] text-muted-foreground font-semibold">Last 6 Months</span>
              </div>
              <div className="h-[280px] w-full text-xs font-mono">
                {metrics.trends.every((t) => t.revenue === 0 && t.payroll === 0) ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-xs italic">
                    No billing activity recorded in this window.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics.trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorPay" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                      <XAxis dataKey="month" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip content={<TrendTooltip />} />
                      <Legend wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />
                      <Area
                        name="Revenue"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRev)"
                      />
                      <Area
                        name="Payroll"
                        type="monotone"
                        dataKey="payroll"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorPay)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Chart: Invoice Status Breakdown */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Invoice Breakdown</h2>
                <span className="text-[10px] text-muted-foreground font-semibold">By Status</span>
              </div>
              <div className="h-[280px] w-full flex flex-col justify-center items-center font-mono">
                {metrics.invoiceStatusBreakdown.every((s) => s.count === 0) ? (
                  <div className="text-muted-foreground text-xs italic">
                    No invoices created yet.
                  </div>
                ) : (
                  <>
                    <div className="h-[180px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={metrics.invoiceStatusBreakdown.filter((s) => s.count > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={3}
                            dataKey="count"
                            nameKey="status"
                          >
                            {metrics.invoiceStatusBreakdown
                              .filter((s) => s.count > 0)
                              .map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={INVOICE_STATUS_COLORS[entry.status] || "#a1a1aa"}
                                />
                              ))}
                          </Pie>
                          <Tooltip content={<PieTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Centered Legend */}
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[10px] font-sans font-semibold pt-2">
                      {metrics.invoiceStatusBreakdown.map((s) => (
                        <div key={s.status} className="flex items-center space-x-1.5">
                          <span
                            className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: INVOICE_STATUS_COLORS[s.status] }}
                          />
                          <span className="capitalize text-muted-foreground">
                            {s.status}: <span className="font-mono font-bold text-foreground">{s.count}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Table and Additional Stats Grid */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            {/* Outstanding Invoices Feed */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                  Action Required: Outstanding Invoices
                </h2>
                <Link href="/invoices" className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5">
                  View All <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                {metrics.outstandingInvoices.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-xs italic">
                    Great! All billing records are paid up.
                  </div>
                ) : (
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground font-semibold">
                        <th className="py-2.5">Invoice</th>
                        <th className="py-2.5">Client</th>
                        <th className="py-2.5">Due Date</th>
                        <th className="py-2.5 text-right">Amount</th>
                        <th className="py-2.5 text-center w-24">Status</th>
                        <th className="py-2.5 text-center w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {metrics.outstandingInvoices.map((inv) => (
                        <tr key={inv._id} className="hover:bg-muted/15 transition-colors group">
                          <td className="py-3 font-semibold font-mono text-foreground">{inv.invoiceNumber}</td>
                          <td className="py-3 font-medium text-foreground">{inv.clientName}</td>
                          <td className="py-3 text-muted-foreground">
                            {new Date(inv.dueDate).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-3 text-right font-mono font-bold text-foreground tabular-nums">
                            {formatCurrency(inv.total)}
                          </td>
                          <td className="py-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-white tracking-wide uppercase ${
                                inv.status === "overdue" ? "bg-status-overdue" : "bg-status-sent"
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <Link href={`/invoices/${inv._id}`} passHref legacyBehavior>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-md hover:bg-muted group-hover:opacity-100 opacity-60 transition-opacity"
                                title="View details"
                              >
                                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Chart: Payroll Expense by Department */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Payroll by Department</h2>
                <span className="text-[10px] text-muted-foreground font-semibold">Distribution</span>
              </div>
              <div className="h-[200px] w-full text-xs font-mono">
                {metrics.payrollExpenseByDepartment.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-xs italic">
                    No payroll disbursements recorded.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metrics.payrollExpenseByDepartment}
                      layout="vertical"
                      margin={{ top: 5, right: 10, left: 15, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#27272a" />
                      <XAxis type="number" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis
                        type="category"
                        dataKey="department"
                        stroke="#71717a"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        width={60}
                      />
                      <Tooltip content={<TrendTooltip />} />
                      <Bar name="Payroll" dataKey="amount" radius={[0, 4, 4, 0]}>
                        {metrics.payrollExpenseByDepartment.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
