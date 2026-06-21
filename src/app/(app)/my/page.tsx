import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Employee } from "@/models/Employee";
import { Payroll } from "@/models/Payroll";
import { Company } from "@/models/Company";
import { Briefcase, Mail, Landmark, DollarSign, Calendar, FileText, ArrowDownToLine } from "lucide-react";
import Link from "next/link";
import RoleSyncer from "./RoleSyncer";

export default async function EmployeePortalPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  await connectDB();

  // Find the employee profile linked to this Clerk account
  const employee = await Employee.findOne({ clerkUserId: userId });
  if (!employee) {
    // If the logged-in user is actually a company admin, redirect them to /dashboard
    const isCompany = await Company.findOne({ clerkId: userId });
    if (isCompany) {
      redirect("/dashboard");
    }

    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <Briefcase className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Employee Profile Not Found</h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          We could not locate an employee profile linked to your user account. Please contact your company administrator to link your account.
        </p>
      </div>
    );
  }

  // Find the company name
  const company = await Company.findById(employee.companyId);
  const companyName = company ? company.name : "Your Company";

  // Fetch salary payroll history
  const payrolls = await Payroll.find({ employeeId: employee._id }).sort({ payPeriodEnd: -1 });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Silently sync Clerk employee role metadata via API route on mount */}
      <RoleSyncer />
      {/* Premium Profile Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-primary/10 via-background to-card p-8 shadow-sm">
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-primary/5 blur-3xl -mr-16 -mt-16" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
              Employee Dashboard
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Welcome, {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-muted-foreground text-sm flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" /> {employee.position || "Staff"} &bull; {employee.department || "General"}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" /> {employee.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Landmark className="h-4 w-4" /> {companyName}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-card border border-border p-4 rounded-xl shadow-inner text-right">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Base Salary</span>
              <span className="text-xl font-bold font-mono text-foreground">{formatCurrency(employee.salary)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Salary & Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-border bg-card rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">Payroll Status</span>
            <span className="text-lg font-bold text-foreground capitalize">{employee.status}</span>
          </div>
        </div>

        <div className="border border-border bg-card rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shadow-inner">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">Pay Schedule</span>
            <span className="text-lg font-bold text-foreground">Monthly</span>
          </div>
        </div>

        <div className="border border-border bg-card rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 flex items-center justify-center shadow-inner">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">Total Payslips</span>
            <span className="text-lg font-bold text-foreground">{payrolls.length} payslips</span>
          </div>
        </div>
      </div>

      {/* Payslip History List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Salary History</h2>
          <span className="text-xs text-muted-foreground">List of all payroll summaries and downloadable payslip files.</span>
        </div>

        {payrolls.length === 0 ? (
          <div className="border border-border border-dashed rounded-xl bg-card p-12 text-center flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-md font-semibold text-foreground">No Payroll Records</h3>
            <p className="text-muted-foreground text-sm mt-1 max-w-xs">
              There are no payroll records generated for you yet. They will appear here once processed by your administrator.
            </p>
          </div>
        ) : (
          <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase border-b border-border">
                    <th className="px-6 py-4 font-semibold">Pay Period</th>
                    <th className="px-6 py-4 text-right font-semibold">Base Salary</th>
                    <th className="px-6 py-4 text-right font-semibold">Allowances</th>
                    <th className="px-6 py-4 text-right font-semibold">Deductions</th>
                    <th className="px-6 py-4 text-right font-semibold">Net Salary</th>
                    <th className="px-6 py-4 text-center font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {payrolls.map((payroll) => (
                    <tr key={payroll._id.toString()} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        {formatDate(payroll.payPeriodStart)} &ndash; {formatDate(payroll.payPeriodEnd)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono tabular-nums text-muted-foreground">
                        {formatCurrency(payroll.baseSalary)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(payroll.allowances)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono tabular-nums text-destructive">
                        -{formatCurrency(payroll.deductions)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold tabular-nums text-foreground">
                        {formatCurrency(payroll.netSalary)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide shadow-sm text-white ${
                            payroll.status === "paid" ? "bg-emerald-600" : "bg-zinc-500"
                          }`}
                        >
                          {payroll.status}
                        </span>
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
