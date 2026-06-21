import React from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { getCompanyForUser } from "@/lib/clerk";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { Employee } from "@/models/Employee";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

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

  // 1. Custom Employee Portal Layout
  if (role === "employee" || employee) {
    // If Clerk metadata role is not synced yet, sync it in the background
    if (role !== "employee" && userId) {
      try {
        const client = await clerkClient();
        await client.users.updateUserMetadata(userId, {
          publicMetadata: {
            role: "employee",
          },
        });
      } catch (err) {
        console.error("Failed to sync Clerk publicMetadata for employee in layout:", err);
      }
    }

    // Force employees to only access /my
    const isEmployeePath = pathname === "/my" || pathname.startsWith("/my/");
    if (!isEmployeePath) {
      redirect("/my");
    }
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-background font-sans">
        <aside className="w-64 border-r border-border bg-card flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-border">
            <span className="text-xl font-bold text-primary tracking-tight">
              Billy Portal
            </span>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <Link
              href="/my"
              className="flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-primary/10 text-primary transition-colors"
            >
              My Payroll
            </Link>
          </nav>
          <div className="p-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-mono">v1.0.0</span>
            <UserButton />
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 border-b border-border bg-card flex items-center justify-between px-8">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Employee Portal</h2>
            <div className="flex items-center gap-4">
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8 bg-background">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    );
  }

  // 2. Custom Platform Admin Layout
  if (role === "platform_admin") {
    const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
    if (!isAdminPath) {
      redirect("/admin");
    }
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-background font-sans">
        <aside className="w-64 border-r border-border bg-card flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-border">
            <span className="text-xl font-bold text-primary tracking-tight">
              Billy Admin
            </span>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <Link
              href="/admin"
              className="flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-primary/10 text-primary transition-colors"
            >
              Platform Overview
            </Link>
          </nav>
          <div className="p-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-mono">v1.0.0</span>
            <UserButton />
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 border-b border-border bg-card flex items-center justify-between px-8">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Admin Console</h2>
            <div className="flex items-center gap-4">
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8 bg-background">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    );
  }

  // 3. Standard Company Layout
  await getCompanyForUser();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background font-sans">
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/dashboard" className="text-xl font-bold text-primary tracking-tight">
            Billy
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-foreground hover:bg-muted transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/invoices"
            className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-foreground hover:bg-muted transition-colors"
          >
            Invoices
          </Link>
          <Link
            href="/clients"
            className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-foreground hover:bg-muted transition-colors"
          >
            Clients
          </Link>
          <Link
            href="/employees"
            className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-foreground hover:bg-muted transition-colors"
          >
            Employees
          </Link>
          <Link
            href="/payroll"
            className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-foreground hover:bg-muted transition-colors"
          >
            Payroll
          </Link>
          <Link
            href="/templates"
            className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-foreground hover:bg-muted transition-colors"
          >
            Templates
          </Link>
          <Link
            href="/settings"
            className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-foreground hover:bg-muted transition-colors"
          >
            Settings
          </Link>
        </nav>
        <div className="p-4 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-mono">v1.0.0</span>
          <UserButton />
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Workspace</h2>
          <div className="flex items-center gap-4">
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-background">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

