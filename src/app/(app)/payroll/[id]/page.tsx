"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  Calendar,
  ArrowLeft,
  DollarSign,
  Users,
  CheckCircle2,
  Lock,
  Edit2,
  Trash2,
  Coins,
  Calculator,
  PieChart,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { showToast } from "@/features/invoices/lib/invoiceUtils";

interface EmployeeRef {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  position?: string;
  department?: string;
}

interface PayrollRecord {
  _id: string;
  employeeId: EmployeeRef;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  departmentSnapshot?: string;
  status: "draft" | "paid";
  paymentDate?: string;
}

interface DepartmentSummary {
  _id: string | null;
  totalBaseSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  totalNetSalary: number;
  employeeCount: number;
}

interface PayrollReport {
  summary: {
    totalBaseSalary: number;
    totalAllowances: number;
    totalDeductions: number;
    totalNetSalary: number;
    employeeCount: number;
  };
  departments: DepartmentSummary[];
}

export default function PayrollDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string; // Format YYYY-MM

  // Edit record states
  const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null);
  const [editAllowances, setEditAllowances] = useState<string>("0");
  const [editDeductions, setEditDeductions] = useState<string>("0");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Deletion / Bulk updates alert states
  const [isDeleteRunOpen, setIsDeleteRunOpen] = useState(false);
  const [isPayRunOpen, setIsPayRunOpen] = useState(false);
  const [isDeleteRecordOpen, setIsDeleteRecordOpen] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);

  // Parse YYYY-MM into start and end dates
  const [yearStr, monthStr] = id.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const startDateObj = new Date(year, month, 1);
  const endDateObj = new Date(year, month + 1, 0);
  
  const startIso = startDateObj.toISOString().split("T")[0];
  const endIso = endDateObj.toISOString().split("T")[0];

  const displayPeriod = startDateObj.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  // Query: Get payroll list details
  const { data: records = [], isLoading, isError } = useQuery<PayrollRecord[]>({
    queryKey: ["payroll-details", id],
    queryFn: async () => {
      const res = await fetch(`/api/payroll?payPeriodStart=${startIso}&payPeriodEnd=${endIso}`);
      if (!res.ok) throw new Error("Failed to fetch payroll details");
      return res.json();
    },
  });

  // Query: Get payroll aggregated report
  const { data: report, isLoading: isReportLoading } = useQuery<PayrollReport>({
    queryKey: ["payroll-report", id],
    queryFn: async () => {
      const res = await fetch(`/api/payroll?payPeriodStart=${startIso}&payPeriodEnd=${endIso}&mode=report`);
      if (!res.ok) throw new Error("Failed to fetch payroll report");
      return res.json();
    },
  });

  // Check if current run is in draft status
  const isDraftRun = records.some((r) => r.status === "draft");

  // Mutation: Update single record adjustments
  const updateRecordMutation = useMutation({
    mutationFn: async (payload: { allowances: number; deductions: number }) => {
      if (!editingRecord) return;
      const res = await fetch(`/api/payroll/${editingRecord._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update record");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-details", id] });
      queryClient.invalidateQueries({ queryKey: ["payroll-report", id] });
      setIsEditDialogOpen(false);
      setEditingRecord(null);
      showToast("Adjustments updated successfully!");
    },
    onError: (err: any) => {
      showToast(err.message);
    }
  });

  // Mutation: Delete single payroll record
  const deleteRecordMutation = useMutation({
    mutationFn: async (recordId: string) => {
      const res = await fetch(`/api/payroll/${recordId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete record");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-details", id] });
      queryClient.invalidateQueries({ queryKey: ["payroll-report", id] });
      setIsDeleteRecordOpen(false);
      setDeletingRecordId(null);
      showToast("Payslip record deleted successfully.");
    },
    onError: (err: any) => {
      showToast(err.message);
    }
  });

  // Mutation: Bulk operations (transition to Paid, or delete all draft runs)
  const bulkMutation = useMutation({
    mutationFn: async (action: "pay" | "delete") => {
      const res = await fetch(`/api/payroll`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payPeriodStart: startIso,
          payPeriodEnd: endIso,
          action,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to perform action");
      }
      return res.json();
    },
    onSuccess: (data, action) => {
      queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-details", id] });
      queryClient.invalidateQueries({ queryKey: ["payroll-report", id] });
      setIsPayRunOpen(false);
      setIsDeleteRunOpen(false);
      
      if (action === "pay") {
        showToast(data?.message || "Payroll cycle completed and locked!");
      } else {
        showToast(data?.message || "Draft payroll cycle deleted successfully.");
        router.push("/payroll");
      }
    },
    onError: (err: any) => {
      showToast(err.message);
    }
  });

  const handleEditClick = (record: PayrollRecord) => {
    setEditingRecord(record);
    setEditAllowances(String(record.allowances));
    setEditDeductions(String(record.deductions));
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = () => {
    const allowanceVal = Number(editAllowances);
    const deductionVal = Number(editDeductions);

    if (isNaN(allowanceVal) || allowanceVal < 0) {
      showToast("Allowances must be a valid positive number");
      return;
    }
    if (isNaN(deductionVal) || deductionVal < 0) {
      showToast("Deductions must be a valid positive number");
      return;
    }

    if (editingRecord) {
      const netSalary = editingRecord.baseSalary + allowanceVal - deductionVal;
      if (netSalary < 0) {
        showToast("Deductions cannot exceed base salary and allowances (Net Salary cannot be negative)");
        return;
      }
    }

    updateRecordMutation.mutate({
      allowances: allowanceVal,
      deductions: deductionVal,
    });
  };

  const handleDeleteConfirm = () => {
    if (deletingRecordId) {
      deleteRecordMutation.mutate(deletingRecordId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/payroll")}
            className="h-9 w-9 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{displayPeriod} Payroll</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm text-white ${
                isDraftRun ? "bg-zinc-500" : "bg-emerald-600"
              }`}>
                {isDraftRun ? "Draft Run" : "Paid & Locked"}
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              Manage salary records and edit individual adjustments for this cycle.
            </p>
          </div>
        </div>

        {/* Action Controls for Draft */}
        {isDraftRun && (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteRunOpen(true)}
              className="border-destructive/20 text-destructive/90 hover:text-destructive hover:bg-destructive/10 font-semibold"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Cancel Draft Run
            </Button>
            <Button
              onClick={() => setIsPayRunOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-600/90 text-white font-semibold"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Finalize & Lock Payroll
            </Button>
          </div>
        )}
      </div>

      {/* Aggregate Report Summary Widgets */}
      {report && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
          <div className="border border-border rounded-lg bg-card p-5 flex items-center space-x-4 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-medium block">Total Base Salary</span>
              <span className="text-lg font-bold text-foreground">
                ${report.summary.totalBaseSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="border border-border rounded-lg bg-card p-5 flex items-center space-x-4 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-medium block">Total Allowances</span>
              <span className="text-lg font-bold text-emerald-600">
                +${report.summary.totalAllowances.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="border border-border rounded-lg bg-card p-5 flex items-center space-x-4 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-medium block">Total Deductions</span>
              <span className="text-lg font-bold text-rose-600">
                -${report.summary.totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="border border-border rounded-lg bg-card p-5 flex items-center space-x-4 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-primary/15 text-primary flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-medium block">Net Net Payroll Outflow</span>
              <span className="text-lg font-bold text-foreground">
                ${report.summary.totalNetSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Details Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        
        {/* Table of Payslip Records */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-foreground">Employee Pay Summaries</h2>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 border border-border bg-card rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground mt-2">Loading pay lines...</span>
            </div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center border border-border bg-card rounded-lg">
              <p className="text-sm text-muted-foreground font-medium">No pay entries associated with this run.</p>
            </div>
          ) : (
            <div className="border border-border bg-card rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-muted-foreground">
                  <thead className="text-xs text-foreground uppercase bg-muted/40 font-semibold border-b border-border">
                    <tr>
                      <th scope="col" className="px-5 py-3">Employee</th>
                      <th scope="col" className="px-5 py-3 text-right">Base</th>
                      <th scope="col" className="px-5 py-3 text-right">Allow.</th>
                      <th scope="col" className="px-5 py-3 text-right">Deduct.</th>
                      <th scope="col" className="px-5 py-3 text-right font-bold text-foreground">Net Pay</th>
                      {isDraftRun && <th scope="col" className="px-5 py-3 text-center w-20">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-foreground">
                    {records.map((run) => {
                      const empName = run.employeeId ? `${run.employeeId.firstName} ${run.employeeId.lastName}` : "Deleted Employee";
                      const dept = run.departmentSnapshot || run.employeeId?.department || "—";
                      
                      return (
                        <tr key={run._id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-5 py-3.5">
                            <span className="font-semibold text-foreground text-sm block">
                              {empName}
                            </span>
                            <span className="text-xs text-muted-foreground capitalize">
                              {dept} {run.employeeId?.position ? `• ${run.employeeId.position}` : ""}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right font-mono text-xs">
                            ${run.baseSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-5 py-3.5 text-right font-mono text-xs text-emerald-600">
                            +${run.allowances.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-5 py-3.5 text-right font-mono text-xs text-rose-600">
                            -${run.deductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-5 py-3.5 text-right font-mono text-sm font-bold text-foreground">
                            ${run.netSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          {isDraftRun && (
                            <td className="px-5 py-3.5 text-center">
                              <div className="flex items-center justify-center gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-muted"
                                  onClick={() => handleEditClick(run)}
                                >
                                  <Edit2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-destructive/10 text-destructive/80 hover:text-destructive"
                                  onClick={() => {
                                    setDeletingRecordId(run._id);
                                    setIsDeleteRecordOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel: Department Expenses Reports */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">Department Aggregates</h2>
          {isReportLoading ? (
            <div className="flex items-center justify-center py-12 border border-border bg-card rounded-lg">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : !report || report.departments.length === 0 ? (
            <div className="p-8 text-center border border-border bg-card rounded-lg">
              <p className="text-xs text-muted-foreground font-semibold">No department details compiled.</p>
            </div>
          ) : (
            <div className="border border-border bg-card rounded-lg p-5 space-y-4 shadow-sm">
              <div className="flex items-center space-x-2 text-primary">
                <PieChart className="h-5 w-5" />
                <span className="text-sm font-semibold tracking-wide uppercase">Department Breakdowns</span>
              </div>
              <div className="divide-y divide-border">
                {report.departments.map((dept) => (
                  <div key={dept._id || "none"} className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-foreground block capitalize">{dept._id || "Other / Unassigned"}</span>
                      <span className="text-muted-foreground font-medium block mt-0.5">{dept.employeeCount} active headcount</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-foreground block">${dept.totalNetSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">Net Payout</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog: Edit Adjustments */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md rounded-lg border border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              Adjust Payslip Metrics
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Update allowances or deductions for{" "}
              <strong className="text-foreground">
                {editingRecord?.employeeId ? `${editingRecord.employeeId.firstName} ${editingRecord.employeeId.lastName}` : "employee"}
              </strong>.
            </DialogDescription>
          </DialogHeader>

          {editingRecord && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-muted/40 rounded border border-border">
                  <span className="text-muted-foreground block mb-0.5">Base Salary</span>
                  <span className="text-sm font-bold font-mono text-foreground">${editingRecord.baseSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="p-3 bg-muted/40 rounded border border-border">
                  <span className="text-muted-foreground block mb-0.5">Computed Net</span>
                  <span className="text-sm font-bold font-mono text-primary">
                    ${(editingRecord.baseSalary + Number(editAllowances || 0) - Number(editDeductions || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Allowances ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">$</span>
                    <Input
                      type="text"
                      className="pl-6 font-mono text-xs"
                      value={editAllowances}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val !== "" && isNaN(Number(val)) && val !== "-") return;
                        setEditAllowances(val);
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Deductions ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">$</span>
                    <Input
                      type="text"
                      className="pl-6 font-mono text-xs"
                      value={editDeductions}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val !== "" && isNaN(Number(val)) && val !== "-") return;
                        setEditDeductions(val);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={updateRecordMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleEditSubmit}
              disabled={updateRecordMutation.isPending}
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold"
            >
              {updateRecordMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog: Finalize Payroll */}
      <AlertDialog open={isPayRunOpen} onOpenChange={setIsPayRunOpen}>
        <AlertDialogContent className="rounded-lg border border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-foreground flex items-center">
              <Lock className="h-5 w-5 text-emerald-500 mr-2" /> Finalize and Lock Payroll Cycle?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              This action cannot be undone. Marking this payroll run as completed will permanently freeze and lock all allowances, deductions, and payslip data for the month. You will not be able to edit or delete records for this cycle again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel disabled={bulkMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                bulkMutation.mutate("pay");
              }}
              disabled={bulkMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-600/90 text-white font-semibold"
            >
              {bulkMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finalizing...
                </>
              ) : (
                "Finalize and Lock Run"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog: Delete Draft Payroll Run */}
      <AlertDialog open={isDeleteRunOpen} onOpenChange={setIsDeleteRunOpen}>
        <AlertDialogContent className="rounded-lg border border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-foreground">
              Cancel Draft Payroll Run?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Are you sure you want to cancel and delete the draft payroll records for this month? This will clear all calculated slip entries. You can recreate this run cycle later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel disabled={bulkMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                bulkMutation.mutate("delete");
              }}
              disabled={bulkMutation.isPending}
              className="bg-destructive hover:bg-destructive/95 text-destructive-foreground font-semibold"
            >
              {bulkMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete Draft Run"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog: Delete Single Record */}
      <AlertDialog open={isDeleteRecordOpen} onOpenChange={setIsDeleteRecordOpen}>
        <AlertDialogContent className="rounded-lg border border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-foreground">
              Remove Employee Payslip?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Are you sure you want to exclude this specific employee's payslip record from the current draft run?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel disabled={deleteRecordMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              disabled={deleteRecordMutation.isPending}
              className="bg-destructive hover:bg-destructive/95 text-destructive-foreground font-semibold"
            >
              {deleteRecordMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete Record"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
