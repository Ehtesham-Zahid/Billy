import React from "react";
import { UserButton } from "@clerk/nextjs";
import ThemeToggle from "@/components/ThemeToggle";
import { getCompanyForUser } from "@/lib/clerk";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { Employee } from "@/models/Employee";
import { Company } from "@/models/Company";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import SidebarClient from "./SidebarClient";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.publicMetadata as any)?.role;

  await connectDB();
  const employee = userId ? await Employee.findOne({ clerkUserId: userId }) : null;

  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  // 1. Role-based Route Guard checking
  if (role === "employee" || employee) {
    // Force employees to redirect to /my if trying to access company or admin dashboard routes
    const isForbiddenPathForEmployee =
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/clients") ||
      pathname.startsWith("/invoices") ||
      pathname.startsWith("/employees") ||
      pathname.startsWith("/payroll") ||
      pathname.startsWith("/templates") ||
      pathname.startsWith("/settings") ||
      pathname.startsWith("/admin");

    if (isForbiddenPathForEmployee) {
      redirect("/my");
    }

    let companyName = "Employee Portal";
    if (employee) {
      const empCompany = await Company.findById(employee.companyId);
      if (empCompany) {
        companyName = empCompany.name;
      }
    }

    return (
      <SidebarClient
        role="employee"
        companyName={companyName}
        userButton={<UserButton />}
        themeToggle={<ThemeToggle />}
      >
        {children}
      </SidebarClient>
    );
  }

  if (role === "platform_admin") {
    const isForbiddenPathForAdmin =
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/clients") ||
      pathname.startsWith("/invoices") ||
      pathname.startsWith("/employees") ||
      pathname.startsWith("/payroll") ||
      pathname.startsWith("/templates") ||
      pathname.startsWith("/settings") ||
      pathname.startsWith("/my");

    if (isForbiddenPathForAdmin) {
      redirect("/admin");
    }

    return (
      <SidebarClient
        role="platform_admin"
        companyName="Platform Admin"
        userButton={<UserButton />}
        themeToggle={<ThemeToggle />}
      >
        {children}
      </SidebarClient>
    );
  }

  // 3. Standard Company Layout
  const company = await getCompanyForUser();

  return (
    <SidebarClient
      role="company"
      companyName={company?.name || "Workspace"}
      userButton={<UserButton />}
      themeToggle={<ThemeToggle />}
    >
      {children}
    </SidebarClient>
  );
}
