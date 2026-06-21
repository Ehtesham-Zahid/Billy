import { connectDB } from "@/lib/db";
import { Invoice } from "@/models/Invoice";
import { Payroll } from "@/models/Payroll";
import { Employee } from "@/models/Employee";
import { Client } from "@/models/Client";
import { getComputedInvoiceStatus } from "@/features/invoices/lib/invoiceUtils";

export interface OutstandingInvoice {
  _id: string;
  invoiceNumber: string;
  clientName: string;
  total: number;
  dueDate: Date;
  status: "sent" | "overdue";
}

export interface DashboardMetrics {
  totalRevenueInvoiced: number;
  totalRevenueCollected: number;
  totalOutstanding: number;
  overdueAmount: number;
  totalPayrollExpense: number;
  netPosition: number;
  activeEmployeesCount: number;
  totalClientsCount: number;
  invoiceStatusBreakdown: {
    status: string;
    count: number;
  }[];
  payrollExpenseByDepartment: {
    department: string;
    amount: number;
  }[];
  outstandingInvoices: OutstandingInvoice[];
  trends: {
    month: string;
    revenue: number;
    payroll: number;
  }[];
}

export async function getDashboardData(
  companyId: string,
  period: "all" | "month" | "30days"
): Promise<DashboardMetrics> {
  await connectDB();

  // 1. Fetch raw data (scoped strictly to companyId)
  const invoices = await Invoice.find({ companyId });
  const payrolls = await Payroll.find({ companyId });
  
  const activeEmployeesCount = await Employee.countDocuments({ companyId, status: "active" });
  const totalClientsCount = await Client.countDocuments({ companyId });

  // 2. Filter raw data based on period toggle
  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const filteredInvoices = invoices.filter((inv) => {
    if (period === "month") {
      return new Date(inv.issueDate) >= startOfCurrentMonth;
    }
    if (period === "30days") {
      return new Date(inv.issueDate) >= thirtyDaysAgo;
    }
    return true;
  });

  const filteredPayrolls = payrolls.filter((pr) => {
    if (period === "month") {
      return new Date(pr.payPeriodStart) >= startOfCurrentMonth;
    }
    if (period === "30days") {
      return new Date(pr.payPeriodStart) >= thirtyDaysAgo;
    }
    return true;
  });

  // 3. Perform calculations
  let totalRevenueInvoiced = 0;
  let totalRevenueCollected = 0;
  let totalOutstanding = 0;
  let overdueAmount = 0;

  const statusCountMap: Record<string, number> = {
    draft: 0,
    sent: 0,
    paid: 0,
    overdue: 0,
  };

  const tempOutstandingInvoices: OutstandingInvoice[] = [];

  filteredInvoices.forEach((inv) => {
    const computedStatus = getComputedInvoiceStatus(inv.status, inv.dueDate);
    statusCountMap[computedStatus] = (statusCountMap[computedStatus] || 0) + 1;

    // Total invoiced: exclude drafts
    if (inv.status !== "draft") {
      totalRevenueInvoiced += inv.total;
    }

    // Collected: paid status only
    if (inv.status === "paid") {
      totalRevenueCollected += inv.total;
    }

    // Outstanding: sent or computed-overdue
    if (inv.status === "sent") {
      totalOutstanding += inv.total;
      
      if (computedStatus === "overdue") {
        overdueAmount += inv.total;
      }

      tempOutstandingInvoices.push({
        _id: inv._id.toString(),
        invoiceNumber: inv.invoiceNumber,
        clientName: inv.clientSnapshot.name,
        total: inv.total,
        dueDate: inv.dueDate,
        status: computedStatus as "sent" | "overdue",
      });
    }
  });

  // Sort outstanding invoices: overdue first, then by total descending
  const outstandingInvoices = tempOutstandingInvoices
    .sort((a, b) => {
      if (a.status === "overdue" && b.status !== "overdue") return -1;
      if (a.status !== "overdue" && b.status === "overdue") return 1;
      return b.total - a.total;
    })
    .slice(0, 5);

  // Total payroll expense: sum of netSalary for paid status only
  let totalPayrollExpense = 0;
  const deptExpenseMap: Record<string, number> = {};

  filteredPayrolls.forEach((pr) => {
    if (pr.status === "paid") {
      totalPayrollExpense += pr.netSalary;
      const dept = pr.departmentSnapshot || "General";
      deptExpenseMap[dept] = (deptExpenseMap[dept] || 0) + pr.netSalary;
    }
  });

  // Round currency to 2 decimal places to avoid floating point issues
  totalRevenueInvoiced = Math.round(totalRevenueInvoiced * 100) / 100;
  totalRevenueCollected = Math.round(totalRevenueCollected * 100) / 100;
  totalOutstanding = Math.round(totalOutstanding * 100) / 100;
  overdueAmount = Math.round(overdueAmount * 100) / 100;
  totalPayrollExpense = Math.round(totalPayrollExpense * 100) / 100;
  const netPosition = Math.round((totalRevenueCollected - totalPayrollExpense) * 100) / 100;

  // Formatting invoice status breakdown
  const invoiceStatusBreakdown = Object.entries(statusCountMap).map(([status, count]) => ({
    status,
    count,
  }));

  // Formatting payroll expense by department
  const payrollExpenseByDepartment = Object.entries(deptExpenseMap).map(([department, amount]) => ({
    department,
    amount: Math.round(amount * 100) / 100,
  }));

  // Trend logic: Group by month for the last 6 months (based on issueDate and payPeriodStart)
  const trendMonths: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    trendMonths.push({ key, label });
  }

  const trends = trendMonths.map(({ key, label }) => {
    let revenue = 0;
    let payroll = 0;

    invoices.forEach((inv) => {
      if (inv.status !== "draft") {
        const invDate = new Date(inv.issueDate);
        const invKey = `${invDate.getFullYear()}-${(invDate.getMonth() + 1).toString().padStart(2, "0")}`;
        if (invKey === key) {
          revenue += inv.total;
        }
      }
    });

    payrolls.forEach((pr) => {
      if (pr.status === "paid") {
        const prDate = new Date(pr.payPeriodStart);
        const prKey = `${prDate.getFullYear()}-${(prDate.getMonth() + 1).toString().padStart(2, "0")}`;
        if (prKey === key) {
          payroll += pr.netSalary;
        }
      }
    });

    return {
      month: label,
      revenue: Math.round(revenue * 100) / 100,
      payroll: Math.round(payroll * 100) / 100,
    };
  });

  return {
    totalRevenueInvoiced,
    totalRevenueCollected,
    totalOutstanding,
    overdueAmount,
    totalPayrollExpense,
    netPosition,
    activeEmployeesCount,
    totalClientsCount,
    invoiceStatusBreakdown,
    payrollExpenseByDepartment,
    outstandingInvoices,
    trends,
  };
}
