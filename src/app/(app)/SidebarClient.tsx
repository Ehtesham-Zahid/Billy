"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Users,
  Contact,
  DollarSign,
  Palette,
  Settings,
  User,
  ShieldCheck,
  Building,
} from "lucide-react";

interface SidebarClientProps {
  role: "employee" | "platform_admin" | "company";
  companyName: string;
  userButton: React.ReactNode;
  themeToggle: React.ReactNode;
  children: React.ReactNode;
}

export default function SidebarClient({
  role,
  companyName,
  userButton,
  themeToggle,
  children,
}: SidebarClientProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isActive = (path: string) => {
    if (path === "/dashboard" || path === "/admin" || path === "/my") {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const linkClass = (path: string) => {
    const active = isActive(path);
    return `flex items-center gap-3 px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
      active
        ? "bg-primary/15 text-primary border-l-4 border-primary pl-3 shadow-sm shadow-primary/5"
        : "text-muted-foreground hover:bg-muted/45 hover:text-foreground border-l-4 border-transparent"
    }`;
  };

  // Resolve Navigation items based on role
  const navItems = {
    company: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Invoices", href: "/invoices", icon: FileText },
      { label: "Clients", href: "/clients", icon: Users },
      { label: "Employees", href: "/employees", icon: Contact },
      { label: "Payroll", href: "/payroll", icon: DollarSign },
      { label: "Templates", href: "/templates", icon: Palette },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
    employee: [
      { label: "My Payroll", href: "/my", icon: DollarSign },
    ],
    platform_admin: [
      { label: "Platform Overview", href: "/admin", icon: LayoutDashboard },
    ],
  }[role] || [];

  // Branding configuration
  const branding = {
    company: {
      title: "Billy",
      icon: <Building className="h-4 w-4 text-white" />,
      iconBg: "bg-gradient-to-tr from-primary to-accent",
      footerLabel: companyName || "Workspace",
    },
    employee: {
      title: "Billy Portal",
      icon: <User className="h-4.5 w-4.5 text-primary" />,
      iconBg: "bg-primary/10",
      footerLabel: companyName || "Employee Portal",
    },
    platform_admin: {
      title: "Billy Admin",
      icon: <ShieldCheck className="h-4.5 w-4.5 text-primary" />,
      iconBg: "bg-primary/10",
      footerLabel: "Billy Admin",
    },
  }[role];

  // Header Title configuration
  const headerTitle = {
    company: "Workspace",
    employee: "Employee Portal",
    platform_admin: "Admin Console",
  }[role];

  const sidebarContent = (
    <aside className="w-full h-full bg-card flex flex-col">
      {/* Branding */}
      <div className="h-16 flex items-center px-6 border-b border-border justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${branding.iconBg}`}>
            {branding.icon}
          </span>
          <span className="text-xl font-black text-primary tracking-tight">
            {branding.title}
          </span>
        </div>
        {/* Mobile close button inside drawer */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={linkClass(item.href)}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile Details */}
      <div className="p-4 border-t border-border flex items-center justify-between gap-3 overflow-hidden">
        <span className="text-xs text-muted-foreground font-semibold truncate max-w-[150px]">
          {branding.footerLabel}
        </span>
        {userButton}
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background font-sans relative">
      
      {/* Desktop Sidebar (hidden on mobile, visible on md and up) */}
      <div className="hidden md:block w-64 border-r border-border shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer (visible only on mobile when open) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
          {/* Sliding container */}
          <div className="relative w-64 max-w-xs h-full bg-card shadow-2xl z-10 animate-slide-in">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Body view */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Responsive Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            {/* Hamburger icon for mobile view */}
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Open navigation sidebar"
            >
              <Menu className="h-5.5 w-5.5" />
            </button>
            <h2 className="text-md sm:text-lg font-bold tracking-tight text-foreground">
              {headerTitle}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {themeToggle}
          </div>
        </header>

        {/* Content view with responsive paddings */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
