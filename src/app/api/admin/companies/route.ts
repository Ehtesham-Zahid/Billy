import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Company } from "@/models/Company";
import { Client } from "@/models/Client";
import { Invoice } from "@/models/Invoice";
import { Employee } from "@/models/Employee";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.publicMetadata as any)?.role;

    // Enforce that the user must be a platform_admin
    if (role !== "platform_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const companies = await Company.find().sort({ createdAt: -1 });

    const companiesWithMetrics = await Promise.all(
      companies.map(async (company) => {
        const companyId = company._id;
        const [clientsCount, invoicesCount, employeesCount] = await Promise.all([
          Client.countDocuments({ companyId }),
          Invoice.countDocuments({ companyId }),
          Employee.countDocuments({ companyId }),
        ]);

        return {
          _id: company._id.toString(),
          name: company.name,
          email: company.email,
          createdAt: company.createdAt,
          accountType: company.accountType,
          metrics: {
            clients: clientsCount,
            invoices: invoicesCount,
            employees: employeesCount,
          },
        };
      })
    );

    return NextResponse.json(companiesWithMetrics);
  } catch (error: any) {
    console.error("GET /api/admin/companies error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
