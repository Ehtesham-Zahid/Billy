"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, Calendar, FileSpreadsheet, Users, DollarSign, ChevronRight, CheckCircle2, AlertTriangle, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { showToast } from "@/features/invoices/lib/invoiceUtils";

interface PayrollSummary {
  _id: {
    payPeriodStart: string;
    payPeriodEnd: string;
  };
  totalBaseSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  totalNetSalary: number;
  employeeCount: number;
  draftCount: number;
  paidCount: number;
}

interface ActiveEmployee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  salary: number;
  department?: string;
  position?: string;
}

export default function PayrollPage() {
  const queryClient = useQueryClient();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  
  // Wizard States
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [adjustments, setAdjustments] = useState<Record<string, { allowances: string; deductions: string }>>({});
  const [includedEmployees, setIncludedEmployees] = useState<Record<string, boolean>>({});

  // Summary results from last submission
  const [runResult, setRunResult] = useState<{ createdCount: number; errors: Record<string, string[]> } | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);

  // Years for picker (current year and 3 years prior)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 4 }, (_, i) => currentYear - i);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Query: Get past payroll runs
  const { data: runs = [], isLoading: isRunsLoading, isError: isRunsError } = useQuery<PayrollSummary[]>({
    queryKey: ["payroll-runs"],
    queryFn: async () => {
      const res = await fetch("/api/payroll");
      if (!res.ok) throw new Error("Failed to fetch payroll runs");
      return res.json();
    },
  });

  // Query: Get active employees for processing
  const { data: activeEmployees = [], isLoading: isEmployeesLoading } = useQuery<ActiveEmployee[]>({
    queryKey: ["employees", "active"],
    queryFn: async () => {
      const res = await fetch("/api/employees");
      if (!res.ok) throw new Error("Failed to fetch active employees");
      const list = await res.json();
      return list.filter((e: any) => e.status === "active");
    },
    enabled: isWizardOpen,
  });

  // Setup initial adjustments when wizard opens or employees load
  React.useEffect(() => {
    if (activeEmployees.length > 0) {
      const initialAdjustments: Record<string, { allowances: string; deductions: string }> = {};
      const initialIncluded: Record<string, boolean> = {};
      activeEmployees.forEach((emp) => {
        initialAdjustments[emp._id] = { allowances: "0", deductions: "0" };
        // Exclude from default selection if employee has zero salary
        initialIncluded[emp._id] = emp.salary > 0;
      });
      setAdjustments(initialAdjustments);
      setIncludedEmployees(initialIncluded);
    }
  }, [activeEmployees]);

  // Mutation: Run payroll
  const runPayrollMutation = useMutation({
    mutationFn: async (payload: {
      payPeriodStart: string;
      payPeriodEnd: string;
      adjustments: Record<string, { allowances: number; deductions: number }>;
    }) => {
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to run payroll");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
      setRunResult(data);
      setIsWizardOpen(false);
      setIsResultOpen(true);
      showToast(`Payroll processed successfully!`);
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to run payroll");
    }
  });

  const handleAdjustmentChange = (empId: string, field: "allowances" | "deductions", value: string) => {
    // Basic number format filtering
    if (value !== "" && isNaN(Number(value)) && value !== "-") return;
    
    setAdjustments((prev) => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        [field]: value,
      },
    }));
  };

  const handleRunPayrollSubmit = () => {
    // Construct payPeriodDates
    const startDate = new Date(selectedYear, selectedMonth, 1);
    const endDate = new Date(selectedYear, selectedMonth + 1, 0);

    const payloadAdjustments: Record<string, { allowances: number; deductions: number }> = {};
    
    Object.keys(includedEmployees).forEach((empId) => {
      if (includedEmployees[empId]) {
        const allowances = Number(adjustments[empId]?.allowances || 0);
        const deductions = Number(adjustments[empId]?.deductions || 0);
        payloadAdjustments[empId] = { allowances, deductions };
      }
    });

    if (Object.keys(payloadAdjustments).length === 0) {
      showToast("Please include at least one employee in the payroll run");
      return;
    }

    runPayrollMutation.mutate({
      payPeriodStart: startDate.toISOString().split("T")[0],
      payPeriodEnd: endDate.toISOString().split("T")[0],
      adjustments: payloadAdjustments,
    });
  };

  const getRunId = (start: string) => {
    const d = new Date(start);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Payroll Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Process monthly cycles, track employee adjustments, and print historical records.
          </p>
        </div>
        <Button
          onClick={() => {
            setRunResult(null);
            setIsWizardOpen(true);
          }}
          className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-lg shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" /> Process Monthly Payroll
        </Button>
      </div>

      {/* Aggregate Stats Section */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <div className="border border-border rounded-lg bg-card p-5 flex items-center space-x-4 shadow-sm">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block">Total Net Payroll Expense</span>
            <span className="text-2xl font-bold text-foreground">
              ${runs.reduce((acc, curr) => acc + curr.totalNetSalary, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="border border-border rounded-lg bg-card p-5 flex items-center space-x-4 shadow-sm">
          <div className="h-10 w-10 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block">Average Employee Payroll Count</span>
            <span className="text-2xl font-bold text-foreground">
              {runs.length > 0 ? Math.round(runs.reduce((acc, curr) => acc + curr.employeeCount, 0) / runs.length) : 0} employees
            </span>
          </div>
        </div>

        <div className="border border-border rounded-lg bg-card p-5 flex items-center space-x-4 shadow-sm">
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block">Completed Payroll Cycles</span>
            <span className="text-2xl font-bold text-foreground">
              {runs.reduce((acc, curr) => acc + curr.paidCount, 0)} paid / {runs.length} runs
            </span>
          </div>
        </div>
      </div>

      {/* History Log Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Historical Payroll Runs</h2>
        {isRunsLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading historical payroll entries...</p>
          </div>
        ) : isRunsError ? (
          <div className="p-8 border border-destructive/20 bg-destructive/10 rounded-lg text-center">
            <p className="text-destructive font-semibold">Error Loading Payroll Records</p>
            <p className="text-sm text-muted-foreground mt-1">Failed to read payroll logs from server.</p>
          </div>
        ) : runs.length === 0 ? (
          <div className="border border-border border-dashed rounded-lg bg-card p-16 text-center max-w-xl mx-auto flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No payroll runs found</h3>
            <p className="text-muted-foreground text-sm mt-2 max-w-sm mb-6">
              Establish and record your first payroll run by clicking the "Process Monthly Payroll" button.
            </p>
          </div>
        ) : (
          <div className="border border-border rounded-lg bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-muted-foreground">
                <thead className="text-xs text-foreground uppercase bg-muted/40 font-semibold border-b border-border">
                  <tr>
                    <th scope="col" className="px-6 py-4">Pay Period</th>
                    <th scope="col" className="px-6 py-4 text-right">Base Salary</th>
                    <th scope="col" className="px-6 py-4 text-right">Allowances</th>
                    <th scope="col" className="px-6 py-4 text-right">Deductions</th>
                    <th scope="col" className="px-6 py-4 text-right font-bold text-foreground">Net Pay</th>
                    <th scope="col" className="px-6 py-4 text-center">Staff Count</th>
                    <th scope="col" className="px-6 py-4 text-center">Status</th>
                    <th scope="col" className="px-6 py-4 text-center w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {runs.map((run) => {
                    const start = new Date(run._id.payPeriodStart);
                    const periodLabel = start.toLocaleDateString(undefined, { month: "long", year: "numeric" });
                    const runId = getRunId(run._id.payPeriodStart);
                    const isDraft = run.draftCount > 0;
                    
                    return (
                      <tr key={runId} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-foreground flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          {periodLabel}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-xs">
                          ${run.totalBaseSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-xs text-emerald-600">
                          +${run.totalAllowances.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-xs text-rose-600">
                          -${run.totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-sm font-bold text-foreground">
                          ${run.totalNetSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-center font-medium">
                          {run.employeeCount} active
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm text-white ${
                            isDraft ? "bg-zinc-500" : "bg-emerald-600"
                          }`}>
                            {isDraft ? "Draft" : "Paid"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link href={`/payroll/${runId}`} passHref legacyBehavior>
                            <Button variant="ghost" size="sm" className="font-semibold text-primary hover:text-primary/90 text-xs">
                              View Details <ChevronRight className="ml-1 h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Wizard Dialog: Run Payroll */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col rounded-lg border border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">Process Payroll Sheet</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Select the billing month and adjust employee allowances or deductions for this cycle.
            </DialogDescription>
          </DialogHeader>

          {/* Period Selector Bar */}
          <div className="flex flex-wrap items-center gap-4 bg-muted/40 p-4 border border-border rounded-lg mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Payroll Month:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-card border border-border text-foreground text-sm font-medium rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {months.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-card border border-border text-foreground text-sm font-medium rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Employee Selection List */}
          <div className="flex-1 overflow-y-auto min-h-[300px] border border-border rounded-lg bg-card">
            {isEmployeesLoading ? (
              <div className="flex flex-col items-center justify-center h-full py-16 space-y-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Loading employee files...</span>
              </div>
            ) : activeEmployees.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <Users className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-foreground">No active employees found</p>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                  You must have active employees with set base salaries before processing monthly payrolls.
                </p>
              </div>
            ) : (
              <div>
                {/* Desktop Grid Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-bold uppercase text-muted-foreground bg-muted/40 p-4 border-b border-border">
                  <div className="col-span-1 text-center">Include</div>
                  <div className="col-span-3">Employee</div>
                  <div className="col-span-2 text-right">Base Salary</div>
                  <div className="col-span-2">Allowances ($)</div>
                  <div className="col-span-2">Deductions ($)</div>
                  <div className="col-span-2 text-right">Net Salary</div>
                </div>

                {/* Employees loop */}
                <div className="divide-y divide-border">
                  {activeEmployees.map((emp) => {
                    const isChecked = !!includedEmployees[emp._id];
                    const baseSalary = emp.salary;
                    const allow = Number(adjustments[emp._id]?.allowances || 0);
                    const deduct = Number(adjustments[emp._id]?.deductions || 0);
                    const netSalary = isChecked ? baseSalary + allow - deduct : 0;
                    const isNetNegative = netSalary < 0;

                    return (
                      <div key={emp._id} className="p-4 flex flex-col md:grid md:grid-cols-12 md:gap-4 items-stretch md:items-center hover:bg-muted/10 transition-colors">
                        
                        {/* Checkbox */}
                        <div className="col-span-1 flex items-center justify-between md:justify-center mb-2 md:mb-0">
                          <span className="text-xs font-bold text-muted-foreground md:hidden">Include in run?</span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => setIncludedEmployees(prev => ({ ...prev, [emp._id]: e.target.checked }))}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                          />
                        </div>

                        {/* Name and Dept */}
                        <div className="col-span-3 mb-2 md:mb-0">
                          <span className="font-semibold text-foreground text-sm block">
                            {emp.firstName} {emp.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground capitalize">
                            {emp.department || "No department"} {emp.position ? `(${emp.position})` : ""}
                          </span>
                        </div>

                        {/* Base Salary */}
                        <div className="col-span-2 flex justify-between md:justify-end md:text-right mb-2 md:mb-0">
                          <span className="text-xs font-bold text-muted-foreground md:hidden">Base Salary:</span>
                          <span className="font-mono text-sm text-foreground">
                            ${baseSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        {/* Allowances Input */}
                        <div className="col-span-2 flex items-center justify-between md:justify-start gap-2 mb-2 md:mb-0">
                          <span className="text-xs font-bold text-muted-foreground md:hidden">Allowances:</span>
                          <div className="relative w-32 md:w-full">
                            <span className="absolute left-2.5 top-1.5 text-xs text-muted-foreground">$</span>
                            <Input
                              type="text"
                              disabled={!isChecked}
                              value={adjustments[emp._id]?.allowances ?? "0"}
                              onChange={(e) => handleAdjustmentChange(emp._id, "allowances", e.target.value)}
                              className="pl-6 py-1 h-8 text-xs font-mono"
                            />
                          </div>
                        </div>

                        {/* Deductions Input */}
                        <div className="col-span-2 flex items-center justify-between md:justify-start gap-2 mb-2 md:mb-0">
                          <span className="text-xs font-bold text-muted-foreground md:hidden">Deductions:</span>
                          <div className="relative w-32 md:w-full">
                            <span className="absolute left-2.5 top-1.5 text-xs text-muted-foreground">$</span>
                            <Input
                              type="text"
                              disabled={!isChecked}
                              value={adjustments[emp._id]?.deductions ?? "0"}
                              onChange={(e) => handleAdjustmentChange(emp._id, "deductions", e.target.value)}
                              className="pl-6 py-1 h-8 text-xs font-mono"
                            />
                          </div>
                        </div>

                        {/* Live Net Salary */}
                        <div className="col-span-2 flex justify-between md:justify-end md:text-right">
                          <span className="text-xs font-bold text-muted-foreground md:hidden">Net Pay:</span>
                          <span className={`font-mono text-sm font-bold ${isNetNegative ? "text-rose-600 animate-pulse" : "text-foreground"}`}>
                            ${netSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsWizardOpen(false)}
              disabled={runPayrollMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRunPayrollSubmit}
              disabled={runPayrollMutation.isPending || activeEmployees.length === 0}
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold"
            >
              {runPayrollMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing Run...
                </>
              ) : (
                "Process Selected Payroll"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Run Result Report Details */}
      <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
        <DialogContent className="max-w-xl rounded-lg border border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-2" /> Payroll Run Completed
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Here is the summary output of the processed monthly payroll registry run.
            </DialogDescription>
          </DialogHeader>

          {runResult && (
            <div className="space-y-4 py-2">
              <div className="bg-emerald-600/10 border border-emerald-500/20 text-emerald-600 p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Coins className="h-5 w-5" />
                  <span className="font-semibold text-sm">Successfully Created Payslips:</span>
                </div>
                <span className="text-2xl font-bold font-mono">{runResult.createdCount}</span>
              </div>

              {Object.keys(runResult.errors).length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center text-amber-500 font-semibold text-sm">
                    <AlertTriangle className="h-4 w-4 mr-1.5" /> Earmarked Warnings / Excluded Employees:
                  </div>
                  <div className="border border-border rounded-lg bg-card overflow-hidden max-h-[220px] overflow-y-auto">
                    <div className="divide-y divide-border text-xs">
                      {Object.keys(runResult.errors).map((empKey) => {
                        // Find matching active employee details if it's an ID
                        const empObj = activeEmployees.find(e => e._id === empKey);
                        const label = empObj ? `${empObj.firstName} ${empObj.lastName}` : empKey;
                        const errorMsgs = runResult.errors[empKey];
                        
                        return (
                          <div key={empKey} className="p-3 bg-muted/20">
                            <span className="font-bold block text-foreground mb-1">{label}</span>
                            <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground font-medium">
                              {errorMsgs.map((m, idx) => (
                                <li key={idx}>{m}</li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button
              type="button"
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold"
              onClick={() => setIsResultOpen(false)}
            >
              Acknowledge & Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
