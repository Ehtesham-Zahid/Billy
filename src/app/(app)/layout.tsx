import React from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { getCompanyForUser } from "@/lib/clerk";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce lazy on-demand Company creation on entering the workspace
  await getCompanyForUser();
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background font-sans">
      {/* Sidebar Shell */}
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

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar Shell */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Workspace</h2>
          <div className="flex items-center gap-4">
            {/* Additional header items could go here */}
          </div>
        </header>

        {/* Content Pane */}
        <main className="flex-1 overflow-y-auto p-8 bg-background">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
