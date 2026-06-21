"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Edit2, Trash2, Mail, Briefcase, DollarSign, Loader2, Landmark } from "lucide-react";

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { showToast } from "@/features/invoices/lib/invoiceUtils";

interface EmployeeData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  position?: string;
  department?: string;
  salary: number;
  bankAccount?: string;
  status: "active" | "inactive";
  createdAt: string;
}

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  position: z.string().optional().or(z.literal("")),
  department: z.string().optional().or(z.literal("")),
  salary: z.string().min(1, "Salary is required").refine(
    (val) => {
      const num = Number(val);
      return !isNaN(num) && num > 0;
    },
    { message: "Salary must be a positive number" }
  ),
  bankAccount: z.string().optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]),
});

type FormValues = z.infer<typeof formSchema>;

interface SubmitValues {
  firstName: string;
  lastName: string;
  email: string;
  position?: string;
  department?: string;
  salary: number;
  bankAccount?: string;
  status: "active" | "inactive";
}

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeData | null>(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<EmployeeData | null>(null);

  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"profile" | "history">("profile");

  const { data: salaryHistory = [], isLoading: isHistoryLoading } = useQuery<any[]>({
    queryKey: ["employees", editingEmployee?._id, "payroll"],
    queryFn: async () => {
      if (!editingEmployee) return [];
      const res = await fetch(`/api/payroll?employeeId=${editingEmployee._id}`);
      if (!res.ok) throw new Error("Failed to fetch payroll history");
      return res.json();
    },
    enabled: !!editingEmployee && activeTab === "history",
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      position: "",
      department: "",
      salary: "",
      bankAccount: "",
      status: "active",
    },
  });

  useEffect(() => {
    setActiveTab("profile");
    if (editingEmployee) {
      form.reset({
        firstName: editingEmployee.firstName,
        lastName: editingEmployee.lastName,
        email: editingEmployee.email,
        position: editingEmployee.position || "",
        department: editingEmployee.department || "",
        salary: String(editingEmployee.salary),
        bankAccount: editingEmployee.bankAccount || "",
        status: editingEmployee.status,
      });
    } else {
      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        position: "",
        department: "",
        salary: "",
        bankAccount: "",
        status: "active",
      });
    }
  }, [editingEmployee, isDialogOpen, form]);

  // Query: Get employee list
  const { data: rawEmployees = [], isLoading, isError, error } = useQuery<EmployeeData[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      const res = await fetch("/api/employees");
      if (!res.ok) {
        throw new Error("Failed to fetch employees");
      }
      return res.json();
    },
  });

  // Unique departments for filter select
  const uniqueDepartments = Array.from(
    new Set(
      rawEmployees
        .map((emp) => emp.department?.trim())
        .filter((dept): dept is string => !!dept)
    )
  ).sort();

  // Filter on client side
  const employees = rawEmployees.filter((emp) => {
    if (departmentFilter === "all") return true;
    return emp.department?.trim().toLowerCase() === departmentFilter.trim().toLowerCase();
  });

  // Mutation: Create employee
  const createMutation = useMutation({
    mutationFn: async (data: SubmitValues) => {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create employee");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setIsDialogOpen(false);
      showToast("Employee created successfully!");
    },
  });

  // Mutation: Update employee
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SubmitValues }) => {
      const res = await fetch(`/api/employees/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update employee");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setIsDialogOpen(false);
      setEditingEmployee(null);
      showToast("Employee updated successfully!");
    },
  });

  // Mutation: Delete employee
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete employee");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setIsDeleteDialogOpen(false);
      setDeletingEmployee(null);
      showToast("Employee deleted successfully!");
    },
  });

  const onSubmit = (values: FormValues) => {
    const cleanedValues: SubmitValues = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      position: values.position?.trim() || undefined,
      department: values.department?.trim() || undefined,
      salary: Number(values.salary),
      bankAccount: values.bankAccount?.trim() || undefined,
      status: values.status,
    };

    if (editingEmployee) {
      updateMutation.mutate({ id: editingEmployee._id, data: cleanedValues });
    } else {
      createMutation.mutate(cleanedValues);
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingEmployee) {
      deleteMutation.mutate(deletingEmployee._id);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide shadow-sm text-white";
    if (status === "active") {
      return `${base} bg-emerald-600`;
    }
    return `${base} bg-zinc-500`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Employees</h1>
          <p className="text-muted-foreground text-sm">
            Manage your employee database, department positions, salaries, and active status.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingEmployee(null);
            setIsDialogOpen(true);
          }}
          className="bg-primary hover:bg-primary/95 text-primary-foreground font-medium rounded-lg"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </div>

      {/* Filter and stats controls */}
      <div className="flex flex-wrap items-center gap-4 bg-muted/40 p-4 border border-border rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filter Department:</span>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-card border border-border text-foreground text-sm font-medium rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm capitalize"
          >
            <option value="all">All Departments</option>
            {uniqueDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading employee files...</p>
        </div>
      ) : isError ? (
        <div className="p-8 border border-destructive/20 bg-destructive/10 rounded-lg text-center">
          <p className="text-destructive font-semibold">Error Loading Employees</p>
          <p className="text-sm text-muted-foreground mt-1">{(error as Error).message}</p>
        </div>
      ) : employees.length === 0 ? (
        <div className="border border-border border-dashed rounded-lg bg-card p-16 text-center max-w-xl mx-auto mt-8 flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Briefcase className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No employees found</h3>
          <p className="text-muted-foreground text-sm mt-2 max-w-sm mb-6">
            {departmentFilter === "all"
              ? "Get started by adding your first employee database record."
              : `There are currently no employees matching the "${departmentFilter}" department.`}
          </p>
          {departmentFilter === "all" && (
            <Button
              onClick={() => {
                setEditingEmployee(null);
                setIsDialogOpen(true);
              }}
              className="bg-primary hover:bg-primary/95 text-primary-foreground"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Your First Employee
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block border border-border rounded-lg bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Department</TableHead>
                  <TableHead className="font-semibold">Position</TableHead>
                  <TableHead className="font-semibold text-right">Salary</TableHead>
                  <TableHead className="font-semibold text-center">Status</TableHead>
                  <TableHead className="font-semibold text-center w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp._id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-semibold text-foreground">
                      {emp.firstName} {emp.lastName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{emp.email}</TableCell>
                    <TableCell className="text-muted-foreground capitalize">{emp.department || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{emp.position || "—"}</TableCell>
                    <TableCell className="text-right font-mono text-foreground font-semibold tabular-nums">
                      ${emp.salary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={getStatusBadgeClass(emp.status)}>{emp.status}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-muted"
                          onClick={() => {
                            setEditingEmployee(emp);
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
                            setDeletingEmployee(emp);
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
            {employees.map((emp) => (
              <div
                key={emp._id}
                className="border border-border rounded-lg bg-card p-5 space-y-4 shadow-sm flex flex-col"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground">
                        {emp.firstName} {emp.lastName}
                      </h3>
                      <span className={getStatusBadgeClass(emp.status)}>{emp.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                      <Mail className="h-3 w-3" /> {emp.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditingEmployee(emp);
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
                        setDeletingEmployee(emp);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="pt-2 border-t border-border grid grid-cols-2 text-xs gap-y-2">
                  <div>
                    <span className="text-muted-foreground block">Department / Role</span>
                    <span className="font-medium text-foreground block mt-0.5 capitalize">
                      {emp.department || "—"} {emp.position ? `(${emp.position})` : ""}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground block">Salary</span>
                    <span className="font-bold text-foreground block mt-0.5 font-mono text-sm tabular-nums">
                      ${emp.salary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={`rounded-lg border border-border bg-card transition-all duration-200 ${
          activeTab === "history" && editingEmployee ? "max-w-2xl" : "max-w-lg"
        }`}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              {editingEmployee ? "Edit Employee Records" : "Add New Employee"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Enter the credentials, department, and salary profiles for the employee file.
            </DialogDescription>
          </DialogHeader>

          {editingEmployee && (
            <div className="flex border-b border-border mb-4">
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all -mb-px ${
                  activeTab === "profile"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Profile Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all -mb-px ${
                  activeTab === "history"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Salary History
              </button>
            </div>
          )}

          {(!editingEmployee || activeTab === "profile") ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g. john.doe@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Sales" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position / Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Senior Associate" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Base Salary ($) *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input type="number" step="0.01" className="pl-9" placeholder="0.00" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bankAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Account Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Landmark className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" placeholder="e.g. Route/Account" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Active Status *</FormLabel>
                    <FormControl>
                      <select
                        value={field.value}
                        onChange={field.onChange}
                        className="w-full bg-card border border-border text-foreground text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="active">Active (Include in Payrolls)</option>
                        <option value="inactive">Inactive</option>
                      </select>
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
                  ) : editingEmployee ? (
                    "Save Changes"
                  ) : (
                    "Add Employee"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
          ) : (
            <div className="space-y-4 py-2">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Salary Run Logs</h3>
              {isHistoryLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : salaryHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No payroll records found for this employee yet.
                </p>
              ) : (
                <div className="border border-border rounded-md overflow-hidden bg-muted/20">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead className="font-medium text-xs">Period</TableHead>
                        <TableHead className="font-medium text-xs text-right">Base</TableHead>
                        <TableHead className="font-medium text-xs text-right">Allow.</TableHead>
                        <TableHead className="font-medium text-xs text-right">Deduct.</TableHead>
                        <TableHead className="font-medium text-xs text-right">Net Salary</TableHead>
                        <TableHead className="font-medium text-xs text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salaryHistory.map((run: any) => {
                        const start = new Date(run.payPeriodStart);
                        const periodLabel = start.toLocaleDateString(undefined, {
                          month: "short",
                          year: "numeric",
                          timeZone: "UTC",
                        });
                        return (
                          <TableRow key={run._id} className="text-xs hover:bg-muted/20">
                            <TableCell className="font-semibold text-foreground">
                              {periodLabel}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              ${run.baseSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-right font-mono text-emerald-600">
                              +${run.allowances.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-right font-mono text-rose-600">
                              -${run.deductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-right font-mono font-semibold text-foreground">
                              ${run.netSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-center capitalize">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold text-white ${
                                run.status === "paid" ? "bg-emerald-600" : "bg-zinc-500"
                              }`}>
                                {run.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
              <div className="flex justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Employee Confirmation Alert */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-lg border border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-foreground">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              This action cannot be undone. This will permanently delete the employee file for{" "}
              <strong className="text-foreground">{deletingEmployee?.firstName} {deletingEmployee?.lastName}</strong> and clear their registry records.
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
                "Delete Employee"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
