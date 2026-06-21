"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Sparkles,
  ArrowRight,
  Check,
  Zap,
  Shield,
  Users,
  FileText,
  Calculator,
  HelpCircle,
  Menu,
  X,
  ChevronDown,
  CheckCircle2,
  DollarSign,
  Clock,
  TrendingUp,
  Briefcase,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Plus,
  Send,
  Building,
  Bell,
  CheckCircle,
  FileSpreadsheet,
  AlertCircle,
  Star,
  Activity,
  Workflow,
  Globe,
  Database,
  Lock,
  LayoutDashboard,
} from "lucide-react";

export default function LandingPage() {
  const { isSignedIn } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Active feature tab state
  const [activeTab, setActiveTab] = useState<"invoice" | "payroll" | "portal" | "compliance">("invoice");

  // Invoice Sandbox State
  const [sandboxReminders, setSandboxReminders] = useState(true);
  const [sandboxLateFee, setSandboxLateFee] = useState(false);
  const [sandboxInstantPayout, setSandboxInstantPayout] = useState(false);
  const [sandboxTaxWithholding, setSandboxTaxWithholding] = useState(false);

  // Savings Calculator State
  const [employees, setEmployees] = useState(12);
  const [invoices, setInvoices] = useState(25);

  // Pricing Toggle State (true = monthly, false = annual)
  const [isMonthly, setIsMonthly] = useState(true);

  // FAQ Active State (null = none open, index = open accordion)
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Savings Calculations
  const monthlyHoursSaved = Math.round((employees * 1.5 + invoices * 0.8) * 10) / 10;
  const annualDaysSaved = Math.round((monthlyHoursSaved * 12) / 8); // Assuming 8h workday
  const hourlyRateVal = 50; // Business owner hourly value
  const annualDollarsSaved = Math.round(monthlyHoursSaved * 12 * hourlyRateVal);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Dynamic invoice total calculations for Sandbox
  const baseInvoiceAmt = 8500;
  const lateFeeAmt = sandboxLateFee ? baseInvoiceAmt * 0.015 : 0;
  const taxWithheldAmt = sandboxTaxWithholding ? baseInvoiceAmt * 0.20 : 0;
  const netInvoiceAmt = baseInvoiceAmt + lateFeeAmt - taxWithheldAmt;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden selection:bg-primary/30">
      
      {/* Custom Styles Injection for modern visuals & cloud backdrops */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(10px) rotate(-1deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.9; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 10s ease-in-out infinite;
        }
        .text-gradient {
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .dark .glass-card {
          background: rgba(20, 20, 25, 0.55);
        }
      `}</style>

      {/* Cloud-Like Gradient Blurs (Matching the visual mockup style) */}
      <div className="absolute top-[-5%] left-[-10%] w-[700px] h-[700px] bg-primary/10 rounded-full blur-[140px] pointer-events-none z-0 dark:bg-primary/5 animate-pulse-slow"></div>
      <div className="absolute top-[15%] right-[-10%] w-[800px] h-[800px] bg-violet-500/10 rounded-full blur-[160px] pointer-events-none z-0 dark:bg-violet-500/5 animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
      <div className="absolute bottom-[20%] left-[-15%] w-[800px] h-[800px] bg-accent/10 rounded-full blur-[160px] pointer-events-none z-0 dark:bg-accent/5 animate-pulse-slow" style={{ animationDelay: "4s" }}></div>

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_75%,transparent_100%)] z-0"></div>

      {/* Floating Header Navigation (Sleek Pills Design) */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 transition-all duration-300">
        <header
          className={`max-w-6xl mx-auto transition-all duration-300 ${
            isMobileMenuOpen
              ? "bg-card border border-border shadow-xl px-6 py-4 rounded-3xl"
              : isScrolled
              ? "glass-card border border-border/40 shadow-xl px-6 py-2.5 rounded-full"
              : "bg-transparent border border-transparent px-4 py-4 rounded-full"
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => scrollToSection("hero")}>
              <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-violet-600 to-violet-500 text-gradient">
                Billy
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => scrollToSection("sandbox")}
                className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Sandbox Demo
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("calculator")}
                className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Savings
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                FAQ
              </button>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              {!isSignedIn ? (
                <>
                  <Link
                    href="/login"
                    className="text-xs font-bold text-muted-foreground hover:text-foreground px-2 py-1.5 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="text-xs font-bold bg-primary hover:bg-primary/95 text-primary-foreground px-5 py-2.5 rounded-full transition-all shadow-md shadow-primary/10"
                  >
                    Unlimited Free Trial
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    className="text-xs font-bold bg-primary hover:bg-primary/95 text-primary-foreground px-5 py-2.5 rounded-full transition-all shadow-md flex items-center gap-1.5"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <UserButton />
                </>
              )}
              <ThemeToggle />
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-foreground p-2 rounded-full hover:bg-muted/80 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-border/20 space-y-3 px-2">
              <button
                onClick={() => scrollToSection("sandbox")}
                className="block w-full text-center py-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                Sandbox Demo
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="block w-full text-center py-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("calculator")}
                className="block w-full text-center py-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                Savings Calculator
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="block w-full text-center py-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="block w-full text-center py-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                FAQ
              </button>
              <div className="h-px bg-border/25 my-3" />
              <div className="flex flex-col gap-2">
                {!isSignedIn ? (
                  <>
                    <Link
                      href="/login"
                      className="w-full text-center py-2 rounded-full font-semibold border border-border text-foreground hover:bg-muted transition-colors text-xs"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="w-full text-center py-2.5 rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/95 transition-colors shadow-lg text-xs"
                    >
                      Unlimited Free Trial
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      className="w-full text-center py-2 rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/95 transition-colors shadow-lg text-xs flex items-center justify-center gap-1.5"
                    >
                      Go to Dashboard
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <div className="flex items-center justify-center pt-2 gap-2 border-t border-border/20 mt-1">
                      <span className="text-[10px] text-muted-foreground font-semibold">Account:</span>
                      <UserButton />
                    </div>
                  </>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-border/20 mt-1">
                  <span className="text-xs text-muted-foreground font-semibold">Theme</span>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          )}
        </header>
      </div>

      {/* Main Content */}
      <main className="relative z-10 pt-20">
        
        {/* Section: Centered Hero (Matching Image Layout) */}
        <section id="hero" className="relative pt-16 pb-16 sm:pt-24 sm:pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
            
            {/* Rating Stars Badge (Directly copied from image concept) */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-bold mb-8 hover:bg-primary/15 transition-all">
              <div className="flex items-center -space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent stroke-0" />
                ))}
              </div>
              <span className="text-foreground/90 font-bold">4.9/5 Rated by 12,000+ Teams</span>
            </div>

            {/* Giant Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-foreground max-w-4xl mb-6">
              Best HR & Billing Software Built <br />
              <span className="bg-gradient-to-r from-primary via-violet-600 to-accent text-gradient">
                For Modern Businesses
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mb-10 leading-relaxed font-medium">
              Billy automates repetitive billing cycles, processes compliant local payroll, and handles smart invoice follow-ups. Everything you need to manage your business operations in one place.
            </p>

            {/* Search Signup Input Bar (Direct copy from Image email form layout) */}
            <div className="w-full max-w-md bg-card border border-border shadow-xl rounded-full p-1.5 flex items-center justify-between mb-16 gap-2">
              <input
                type="email"
                placeholder="Enter Email Address"
                className="bg-transparent border-none outline-none text-sm font-semibold pl-4 flex-1 text-foreground placeholder:text-muted-foreground/60 w-full"
              />
              <Link
                href="/signup"
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs sm:text-sm px-6 py-3 rounded-full transition-all shrink-0 flex items-center gap-1"
              >
                Get Started Free
                <ArrowRight className="w-3.5 h-3.5 text-primary-foreground" />
              </Link>
            </div>

            {/* Floating Glassmorphic Application Dashboard Visual (Copied visual design from image) */}
            <div className="relative w-full max-w-5xl mt-6 rounded-2xl border border-border/80 bg-card/45 p-3.5 sm:p-5 shadow-2xl shadow-primary/10 select-none pb-8 animate-float">
              
              {/* Outer Glow behind mock */}
              <div className="absolute inset-0 m-auto w-[400px] h-[350px] bg-primary/10 rounded-full blur-[90px] pointer-events-none z-0"></div>

              {/* Dashboard Layout Mockup */}
              <div className="relative bg-background border border-border/60 rounded-xl overflow-hidden shadow-xl flex flex-col md:flex-row h-[420px]">
                
                {/* Sidebar mock */}
                <aside className="w-full md:w-48 bg-card border-r border-border/60 p-4 flex flex-col justify-between shrink-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-black text-primary">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-[10px]">B</span>
                      Billy Workspace
                    </div>
                    <nav className="space-y-1.5 text-left">
                      <div className="flex items-center gap-2 text-[10.5px] font-bold text-primary bg-primary/10 px-2.5 py-1.5 rounded-lg">
                        <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                      </div>
                      <div className="flex items-center gap-2 text-[10.5px] font-bold text-muted-foreground px-2.5 py-1.5 rounded-lg">
                        <FileText className="w-3.5 h-3.5" /> Invoices
                      </div>
                      <div className="flex items-center gap-2 text-[10.5px] font-bold text-muted-foreground px-2.5 py-1.5 rounded-lg">
                        <Users className="w-3.5 h-3.5" /> Employees
                      </div>
                      <div className="flex items-center gap-2 text-[10.5px] font-bold text-muted-foreground px-2.5 py-1.5 rounded-lg">
                        <DollarSign className="w-3.5 h-3.5" /> Payroll
                      </div>
                    </nav>
                  </div>
                  <div className="h-8 bg-muted/40 border border-border/40 rounded-lg flex items-center px-2 text-[9px] font-bold text-muted-foreground truncate">
                    Acme Corporation
                  </div>
                </aside>

                {/* Dashboard Main Content Mockup */}
                <div className="flex-1 bg-background p-5 flex flex-col justify-between overflow-hidden text-left">
                  <div className="space-y-5">
                    {/* Header */}
                    <div className="flex justify-between items-center pb-3 border-b border-border/40">
                      <div>
                        <h4 className="text-xs font-black text-foreground">Operational Overview</h4>
                        <p className="text-[9px] text-muted-foreground">Financial ledger is synced</p>
                      </div>
                      <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Live System
                      </span>
                    </div>

                    {/* Stat Metrics Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-card border border-border/50 p-3 rounded-lg shadow-sm">
                        <span className="text-[8px] font-bold text-muted-foreground uppercase">Net Revenue</span>
                        <div className="text-sm font-black text-foreground mt-0.5">$84,250.00</div>
                        <span className="text-[7.5px] text-emerald-600 font-bold block mt-0.5">↑ 12.5% this mo</span>
                      </div>
                      <div className="bg-card border border-border/50 p-3 rounded-lg shadow-sm">
                        <span className="text-[8px] font-bold text-muted-foreground uppercase">Pending Invoices</span>
                        <div className="text-sm font-black text-foreground mt-0.5">4 Invoices</div>
                        <span className="text-[7.5px] text-muted-foreground font-bold block mt-0.5">Expected: $12.4k</span>
                      </div>
                      <div className="bg-card border border-border/50 p-3 rounded-lg shadow-sm">
                        <span className="text-[8px] font-bold text-muted-foreground uppercase">Compliance Rate</span>
                        <div className="text-sm font-black text-foreground mt-0.5">100% Verified</div>
                        <span className="text-[7.5px] text-violet-600 font-bold block mt-0.5">W-9/W-8 audit logs</span>
                      </div>
                    </div>

                    {/* Dynamic Chart Area Mockup */}
                    <div className="grid grid-cols-5 gap-3 items-stretch">
                      <div className="col-span-3 bg-card border border-border/50 p-3 rounded-lg shadow-sm flex flex-col justify-between">
                        <span className="text-[8px] font-bold text-muted-foreground uppercase">Revenue Growth Trend</span>
                        <div className="h-16 flex items-end justify-between gap-1 pt-4">
                          <div className="w-full bg-primary/20 h-[30%] rounded-sm"></div>
                          <div className="w-full bg-primary/30 h-[45%] rounded-sm"></div>
                          <div className="w-full bg-primary/20 h-[25%] rounded-sm"></div>
                          <div className="w-full bg-primary/40 h-[60%] rounded-sm"></div>
                          <div className="w-full bg-primary/60 h-[80%] rounded-sm"></div>
                          <div className="w-full bg-primary h-[95%] rounded-sm"></div>
                        </div>
                      </div>
                      <div className="col-span-2 bg-card border border-border/50 p-3 rounded-lg shadow-sm flex flex-col justify-between items-center text-center">
                        <span className="text-[8px] font-bold text-muted-foreground uppercase mb-1">Payroll compliant</span>
                        <div className="relative w-12 h-12 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path className="text-muted/40 stroke-current" strokeWidth="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="text-primary stroke-current" strokeDasharray="85, 100" strokeWidth="4" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          </svg>
                          <span className="absolute text-[8.5px] font-black text-foreground">85%</span>
                        </div>
                        <span className="text-[7px] text-muted-foreground mt-1">IRS 941 auto-compiled</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[9px] text-muted-foreground border-t border-border/40 pt-2">
                    <span>Database Connection: Active</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-bold"><Check className="w-3 h-3" /> Fully Compliant</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Horizontal Logo Badge Belt (Pill-shaped design copied from image) */}
            <div className="w-full max-w-5xl mt-16">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-6">Integrated Systems & Modalities</p>
              
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border bg-card shadow-sm text-xs font-bold text-foreground">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Recruit Management
                </span>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border bg-card shadow-sm text-xs font-bold text-foreground">
                  <span className="w-2 h-2 rounded-full bg-accent"></span>
                  Payroll Systems
                </span>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border bg-card shadow-sm text-xs font-bold text-foreground">
                  <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                  Performance Analytics
                </span>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border bg-card shadow-sm text-xs font-bold text-foreground">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Compliance Checks
                </span>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border bg-card shadow-sm text-xs font-bold text-foreground">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Invoicing Autopilot
                </span>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border bg-card shadow-sm text-xs font-bold text-foreground">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Expense Ledger
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* Section: Sandbox (Keep interactive demo but styled elegantly) */}
        <section id="sandbox" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-y border-border/40 bg-muted/20 relative">
          <div className="max-w-6xl mx-auto">
            
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-3 py-1 rounded-full tracking-wider">
                Product Sandbox
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-4 mb-4">
                Test the automation engine live
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Toggle the controls on the left to see how Billy's rule engine instantly injects compliance, fees, and tracking parameters into client invoices.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 sm:gap-12 items-stretch">
              {/* Left Controls Panel */}
              <div className="col-span-1 lg:col-span-2 bg-card border border-border p-6 rounded-2xl flex flex-col justify-between shadow-sm">
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-1.5 flex items-center gap-2">
                    <Building className="w-4 h-4 text-primary" />
                    Configure Billing Rules
                  </h3>
                  <p className="text-[11px] text-muted-foreground mb-6">Click toggles to dynamically update the invoice logic.</p>
                  
                  <div className="space-y-3.5">
                    {/* Control 1 */}
                    <button
                      onClick={() => setSandboxReminders(!sandboxReminders)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                        sandboxReminders
                          ? "border-primary/50 bg-primary/5 shadow-sm"
                          : "border-border hover:border-muted-foreground/35"
                      }`}
                    >
                      <div className={`w-4.5 h-4.5 rounded flex items-center justify-center mt-0.5 shrink-0 ${
                        sandboxReminders ? "bg-primary text-primary-foreground" : "border border-border/80 text-transparent"
                      }`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          Autopilot Reminders
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Send auto-followup emails to clients when invoice is overdue.</p>
                      </div>
                    </button>

                    {/* Control 2 */}
                    <button
                      onClick={() => setSandboxLateFee(!sandboxLateFee)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                        sandboxLateFee
                          ? "border-primary/50 bg-primary/5 shadow-sm"
                          : "border-border hover:border-muted-foreground/35"
                      }`}
                    >
                      <div className={`w-4.5 h-4.5 rounded flex items-center justify-center mt-0.5 shrink-0 ${
                        sandboxLateFee ? "bg-primary text-primary-foreground" : "border border-border/80 text-transparent"
                      }`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">Apply Late Fees (1.5%)</div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Automatically append a 1.5% late fee if unpaid past terms.</p>
                      </div>
                    </button>

                    {/* Control 3 */}
                    <button
                      onClick={() => setSandboxInstantPayout(!sandboxInstantPayout)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                        sandboxInstantPayout
                          ? "border-primary/50 bg-primary/5 shadow-sm"
                          : "border-border hover:border-muted-foreground/35"
                      }`}
                    >
                      <div className={`w-4.5 h-4.5 rounded flex items-center justify-center mt-0.5 shrink-0 ${
                        sandboxInstantPayout ? "bg-primary text-primary-foreground" : "border border-border/80 text-transparent"
                      }`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">Instant Settlement</div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Enable instant bank direct payouts to settle funds immediately.</p>
                      </div>
                    </button>

                    {/* Control 4 */}
                    <button
                      onClick={() => setSandboxTaxWithholding(!sandboxTaxWithholding)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                        sandboxTaxWithholding
                          ? "border-primary/50 bg-primary/5 shadow-sm"
                          : "border-border hover:border-muted-foreground/35"
                      }`}
                    >
                      <div className={`w-4.5 h-4.5 rounded flex items-center justify-center mt-0.5 shrink-0 ${
                        sandboxTaxWithholding ? "bg-primary text-primary-foreground" : "border border-border/80 text-transparent"
                      }`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">Tax Withholding</div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Automatically withhold 20% backup tax for 1099 compliance.</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border/60 text-[10px] text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-accent shrink-0" />
                  <span>These rules trigger actions instantly behind the scenes.</span>
                </div>
              </div>

              {/* Right Output invoice display */}
              <div className="col-span-1 lg:col-span-3 bg-zinc-950 text-white border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>

                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="text-sm font-black flex items-center gap-1.5">
                        <div className="w-5.5 h-5.5 rounded-md bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-[10px]">B</div>
                        Invoice Preview
                      </div>
                      <div className="text-[9px] text-zinc-500 mt-1">REF: BL-924-INVOICE</div>
                    </div>
                    <span className="text-[9px] bg-zinc-800 text-zinc-300 font-mono px-2 py-0.5 rounded border border-zinc-700/60 uppercase">Draft</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 text-[10px] border-b border-zinc-800 pb-4">
                    <div>
                      <span className="text-zinc-500 font-bold block mb-1">ISSUED BY</span>
                      <span className="font-bold text-zinc-200">Design Agency Co.</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-bold block mb-1">CLIENT BILL TO</span>
                      <span className="font-bold text-zinc-200">Vortex Technologies</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-center text-xs p-2 rounded bg-zinc-900/60 border border-zinc-800/40">
                      <div>
                        <div className="font-bold text-zinc-200">Q2 Product Consulting</div>
                        <div className="text-[8.5px] text-zinc-500">Contract milestone delivery</div>
                      </div>
                      <span className="font-mono font-bold text-zinc-300">${baseInvoiceAmt.toLocaleString()}.00</span>
                    </div>

                    {sandboxLateFee && (
                      <div className="flex justify-between items-center text-xs p-2 rounded bg-red-950/20 border border-red-900/30">
                        <div>
                          <div className="font-bold text-red-400">Late Payment Penalty</div>
                          <div className="text-[8.5px] text-zinc-500">Auto-appended overdue terms</div>
                        </div>
                        <span className="font-mono font-bold text-red-400">+${lateFeeAmt.toLocaleString()}.00</span>
                      </div>
                    )}

                    {sandboxTaxWithholding && (
                      <div className="flex justify-between items-center text-xs p-2 rounded bg-violet-950/20 border border-violet-900/30">
                        <div>
                          <div className="font-bold text-violet-400">Tax Withholding</div>
                          <div className="text-[8.5px] text-zinc-500">20% Backup tax log</div>
                        </div>
                        <span className="font-mono font-bold text-violet-400">-${taxWithheldAmt.toLocaleString()}.00</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-zinc-800/80 pt-4 flex flex-col items-end gap-1 text-xs text-right">
                    <div className="flex justify-between w-44 text-[10px] text-zinc-400">
                      <span>Base Total:</span>
                      <span className="font-mono">${baseInvoiceAmt.toLocaleString()}.00</span>
                    </div>
                    {sandboxLateFee && (
                      <div className="flex justify-between w-44 text-[10px] text-red-400">
                        <span>Late Fees:</span>
                        <span className="font-mono">+${lateFeeAmt.toLocaleString()}.00</span>
                      </div>
                    )}
                    {sandboxTaxWithholding && (
                      <div className="flex justify-between w-44 text-[10px] text-violet-400">
                        <span>Withheld Tax:</span>
                        <span className="font-mono">-${taxWithheldAmt.toLocaleString()}.00</span>
                      </div>
                    )}
                    <div className="flex justify-between w-44 font-black border-t border-zinc-800 pt-2 text-white text-sm">
                      <span>Net Payout:</span>
                      <span className="font-mono text-violet-400">${netInvoiceAmt.toLocaleString()}.00</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    <div className={`inline-flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full border transition-all ${
                      sandboxReminders ? "bg-primary/20 border-primary text-primary font-bold" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                    }`}>
                      <Bell className="w-2.5 h-2.5" />
                      <span>{sandboxReminders ? "Reminders Set" : "No Reminders"}</span>
                    </div>

                    <div className={`inline-flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full border transition-all ${
                      sandboxInstantPayout ? "bg-accent/20 border-accent text-accent font-bold" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                    }`}>
                      <Zap className="w-2.5 h-2.5" />
                      <span>{sandboxInstantPayout ? "Instant bank payout" : "Standard ACH"}</span>
                    </div>
                  </div>

                  {sandboxReminders && (
                    <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 flex gap-2.5 items-start text-[10px] text-zinc-300">
                      <Send className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-zinc-100 block">Autopilot Reminder Queued</span>
                        <span className="text-zinc-400 text-[9.5px]">Will auto-notify Vortex Technologies billing leads if unpaid.</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* Section: Features Tabs ("Simplify Tasks Boost Productivity" Copied from image) */}
        <section id="features" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="max-w-3xl mx-auto text-center mb-16">
              <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-3 py-1 rounded-full tracking-wider">
                Product Core
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-4 mb-4">
                Simplify Tasks Boost Productivity
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Click the categories below to view custom layout mocks of how Billy centralizes invoices, payroll tax logs, employee workspaces, and compliance workflows.
              </p>
            </div>

            {/* Split layout: Tabs on left, Mockup on right */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 sm:gap-12 items-center">
              
              {/* Left Tabs */}
              <div className="lg:col-span-2 space-y-3">
                {/* Tab 1 */}
                <button
                  onClick={() => setActiveTab("invoice")}
                  className={`w-full text-left p-4.5 rounded-2xl border transition-all flex gap-3.5 items-start cursor-pointer ${
                    activeTab === "invoice"
                      ? "bg-primary text-primary-foreground border-primary shadow-lg"
                      : "border-border bg-card hover:bg-muted/50 text-foreground"
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${activeTab === "invoice" ? "bg-white/10 text-white" : "bg-primary/10 text-primary"}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold">1. Invoicing & Billing Cycles</h3>
                    <p className={`text-[10.5px] mt-1 leading-relaxed ${activeTab === "invoice" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      Auto-generate, style, and schedule client billing. Compatible with multiple currencies and direct stripe integrations.
                    </p>
                  </div>
                </button>

                {/* Tab 2 */}
                <button
                  onClick={() => setActiveTab("payroll")}
                  className={`w-full text-left p-4.5 rounded-2xl border transition-all flex gap-3.5 items-start cursor-pointer ${
                    activeTab === "payroll"
                      ? "bg-primary text-primary-foreground border-primary shadow-lg"
                      : "border-border bg-card hover:bg-muted/50 text-foreground"
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${activeTab === "payroll" ? "bg-white/10 text-white" : "bg-primary/10 text-primary"}`}>
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold">2. Local payroll Compliance</h3>
                    <p className={`text-[10.5px] mt-1 leading-relaxed ${activeTab === "payroll" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      One-click payout logs for local employees. Automated withholding calculations, tax slip delivery, and ACH deposits.
                    </p>
                  </div>
                </button>

                {/* Tab 3 */}
                <button
                  onClick={() => setActiveTab("portal")}
                  className={`w-full text-left p-4.5 rounded-2xl border transition-all flex gap-3.5 items-start cursor-pointer ${
                    activeTab === "portal"
                      ? "bg-primary text-primary-foreground border-primary shadow-lg"
                      : "border-border bg-card hover:bg-muted/50 text-foreground"
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${activeTab === "portal" ? "bg-white/10 text-white" : "bg-primary/10 text-primary"}`}>
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold">3. Self-Serve portals</h3>
                    <p className={`text-[10.5px] mt-1 leading-relaxed ${activeTab === "portal" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      Provide clients and employees unified interfaces to download PDFs, verify records, and change credentials.
                    </p>
                  </div>
                </button>

                {/* Tab 4 */}
                <button
                  onClick={() => setActiveTab("compliance")}
                  className={`w-full text-left p-4.5 rounded-2xl border transition-all flex gap-3.5 items-start cursor-pointer ${
                    activeTab === "compliance"
                      ? "bg-primary text-primary-foreground border-primary shadow-lg"
                      : "border-border bg-card hover:bg-muted/50 text-foreground"
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${activeTab === "compliance" ? "bg-white/10 text-white" : "bg-primary/10 text-primary"}`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold">4. Document Audits</h3>
                    <p className={`text-[10.5px] mt-1 leading-relaxed ${activeTab === "compliance" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      Instantly onboard independent contractors, track direct signatures, and automatically compile W-8/W-9 logs.
                    </p>
                  </div>
                </button>
              </div>

              {/* Right Side Mockup (Updates based on active tab) */}
              <div className="lg:col-span-3 bg-card border border-border p-5 rounded-2xl shadow-xl min-h-[340px] flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/5 rounded-full blur-[60px] pointer-events-none"></div>

                <div className="flex justify-between items-center pb-2.5 border-b border-border/40 text-[10px]">
                  <span className="text-muted-foreground font-mono">WORKSPACE SIMULATION</span>
                  <span className="text-primary font-bold uppercase tracking-wider text-[8px] bg-primary/10 px-2 py-0.5 rounded">Operational View</span>
                </div>

                {activeTab === "invoice" && (
                  <div className="py-6 space-y-4">
                    <div className="bg-background border border-border p-3.5 rounded-xl shadow-sm space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-foreground">
                        <span>Invoice Template Builder</span>
                        <span className="w-3.5 h-3.5 rounded-full bg-primary"></span>
                      </div>
                      <div className="h-6 bg-muted/40 rounded flex items-center justify-between px-3 text-[9px] text-muted-foreground">
                        <span>Direct payout routing details</span>
                        <span className="text-emerald-500 font-bold text-[8px] uppercase">Enabled</span>
                      </div>
                      <div className="h-6 bg-muted/40 rounded flex items-center justify-between px-3 text-[9px] text-muted-foreground">
                        <span>Branding Logo File</span>
                        <span className="text-zinc-500 text-[8px]">company-logo.svg</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "payroll" && (
                  <div className="py-6 space-y-3">
                    <div className="bg-background border border-border p-3.5 rounded-xl shadow-sm">
                      <span className="text-[9px] font-bold text-muted-foreground block mb-2.5 uppercase tracking-wider">Payroll Ledger</span>
                      <div className="space-y-2 text-[10px]">
                        <div className="flex justify-between items-center border-b border-border/40 pb-1.5">
                          <span className="font-bold text-foreground">Sarah Jenkins (Full-Time)</span>
                          <span className="font-mono text-muted-foreground">$8,250.00 / mo</span>
                          <span className="text-[8px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded">Compliant</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-foreground">Alex Rivera (Contractor)</span>
                          <span className="font-mono text-muted-foreground">$5,400.00 / mo</span>
                          <span className="text-[8px] bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded">1099 File</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "portal" && (
                  <div className="py-6 space-y-4">
                    <div className="bg-background border border-border p-4 rounded-xl shadow-sm text-center">
                      <span className="text-[9px] text-muted-foreground block">AMOUNT DUE FOR CLIENT</span>
                      <span className="text-xl font-black text-foreground block my-1">$8,500.00</span>
                      <div className="flex gap-2 justify-center mt-3">
                        <button className="px-4 py-1.5 bg-primary text-primary-foreground text-[9px] rounded-lg font-bold">ACH Bank</button>
                        <button className="px-4 py-1.5 bg-card text-foreground border border-border text-[9px] rounded-lg font-bold">Credit Card</button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "compliance" && (
                  <div className="py-6 space-y-3">
                    <div className="bg-background border border-border p-3.5 rounded-xl shadow-sm space-y-2 text-[9px]">
                      <div className="flex justify-between p-1 bg-muted/40 rounded">
                        <span className="font-bold text-foreground">W-9 Tax Form</span>
                        <span className="text-emerald-500 font-bold">Verified ✅</span>
                      </div>
                      <div className="flex justify-between p-1 bg-muted/40 rounded">
                        <span className="font-bold text-foreground">Contractor Agreement</span>
                        <span className="text-emerald-500 font-bold">Signed ✅</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-[10px] text-muted-foreground pt-2.5 border-t border-border/40 flex justify-between items-center">
                  <span>Interactive product visualizer.</span>
                  <Link href="/signup" className="text-primary font-bold hover:underline flex items-center gap-0.5">
                    Start setup <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* Section: "Innovative Technology For That Drives Results" (Grid Cards layout copied from image) */}
        <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-muted/10 relative">
          <div className="max-w-6xl mx-auto">
            
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-[10px] font-bold text-accent uppercase bg-accent/10 px-3 py-1 rounded-full tracking-wider">
                Our Modalities
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-4 mb-4">
                Innovative Technology For <br /> That Drives Results
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Unlock higher productivity, robust audit trails, and streamlined bank connections with Billy.
              </p>
            </div>

            {/* 3-Column Grid Cards (matching image layout exactly) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              
              {/* Card 1: Billing/Invoices */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 mb-6 flex justify-center items-center h-44">
                    {/* Mock chart visual inside card */}
                    <div className="w-full space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-bold text-foreground">
                        <span>Invoice volume</span>
                        <span className="text-primary">+34% yr</span>
                      </div>
                      <div className="flex items-end justify-between gap-1 h-20 pt-2">
                        <div className="w-full bg-primary/20 h-[30%] rounded-sm"></div>
                        <div className="w-full bg-primary/30 h-[40%] rounded-sm"></div>
                        <div className="w-full bg-primary/45 h-[65%] rounded-sm"></div>
                        <div className="w-full bg-primary h-[85%] rounded-sm"></div>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-md sm:text-lg font-black text-foreground mb-2">Automated Billing Logs</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Auto-trigger billing cycles and track views. Fully compatible with digital invoice tokens.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-border/40">
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs px-4.5 py-2 rounded-full transition-all"
                  >
                    Explore Features <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Card 2: Interconnected Node graph visual */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 mb-6 flex justify-center items-center h-44 relative overflow-hidden">
                    {/* Interconnected network visual nodes */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full border border-primary/40 flex items-center justify-center bg-background z-10">
                        <Building className="w-5 h-5 text-primary" />
                      </div>
                      {/* Dotted lines and side nodes */}
                      <div className="absolute w-24 h-px border-t border-dashed border-primary/40 rotate-[30deg]"></div>
                      <div className="absolute w-24 h-px border-t border-dashed border-primary/40 -rotate-[30deg]"></div>
                      <div className="absolute left-6 top-8 w-7 h-7 rounded-full bg-background border border-accent flex items-center justify-center">
                        <Users className="w-3.5 h-3.5 text-accent" />
                      </div>
                      <div className="absolute right-6 top-8 w-7 h-7 rounded-full bg-background border border-violet-500 flex items-center justify-center">
                        <FileText className="w-3.5 h-3.5 text-violet-500" />
                      </div>
                      <div className="absolute left-10 bottom-8 w-7 h-7 rounded-full bg-background border border-primary flex items-center justify-center">
                        <DollarSign className="w-3.5 h-3.5 text-violet-400" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-md sm:text-lg font-black text-foreground mb-2">Compliance Directory</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Automatically onboard, file W-9/W-8 credentials, and compile direct deposit direct routing logs.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-border/40">
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs px-4.5 py-2 rounded-full transition-all"
                  >
                    View Compliance <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Card 3: Mobile Access phone frame mockup (copied from image layout) */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-accent/5 rounded-full blur-[50px] pointer-events-none"></div>

                <div>
                  <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 mb-6 flex justify-center items-center h-44 relative overflow-hidden">
                    {/* Sleek Smartphone Mockup frame */}
                    <div className="w-28 h-56 bg-zinc-950 border-4 border-zinc-800 rounded-2xl p-2 flex flex-col justify-between text-white text-[7px] shadow-lg absolute -bottom-16">
                      {/* Notch */}
                      <div className="w-8 h-2.5 bg-zinc-800 rounded-b-md mx-auto mb-1.5 shrink-0"></div>
                      
                      {/* Content */}
                      <div className="space-y-1.5 flex-1">
                        <div className="bg-zinc-900 p-1 rounded-md border border-zinc-800 text-left">
                          <span className="text-[5px] text-zinc-500 block">TOTAL PAYOUT</span>
                          <span className="font-bold text-[9px] text-violet-400">$4,850.00</span>
                        </div>
                        <div className="bg-zinc-900 p-1 rounded-md border border-zinc-800 text-left flex justify-between items-center">
                          <span>Salary slip</span>
                          <span className="bg-emerald-500/20 text-emerald-400 p-0.5 rounded text-[5px]">Paid</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-md sm:text-lg font-black text-foreground mb-2">Instant Mobile Access</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Provide clients and employees responsive portals to view tax logs, payout histories, and details.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-border/40">
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs px-4.5 py-2 rounded-full transition-all"
                  >
                    14-Day Free Trial <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* Section: "How Our HR Software Works" (Copied layout structure from image) */}
        <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-6xl mx-auto">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20 items-center">
              
              {/* Left Side: Overlapping document cards visual stack (directly from image visual layout) */}
              <div className="relative h-[320px] flex items-center justify-center select-none">
                {/* Backdrop Glow */}
                <div className="absolute w-[200px] h-[200px] bg-primary/10 rounded-full blur-[70px]"></div>

                {/* Card 1 (Bottom stacked) */}
                <div className="absolute w-[260px] bg-card border border-border p-4.5 rounded-xl shadow-lg -rotate-[6deg] -translate-x-6 -translate-y-4 opacity-75">
                  <div className="flex justify-between items-center text-[9px] mb-2.5">
                    <span className="text-muted-foreground">MARCH PAYSLIP</span>
                    <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded font-bold">Paid</span>
                  </div>
                  <div className="h-2 w-20 bg-muted rounded mb-2"></div>
                  <div className="h-1.5 w-full bg-muted/60 rounded mb-1.5"></div>
                  <div className="h-1.5 w-[75%] bg-muted/60 rounded"></div>
                </div>

                {/* Card 2 (Middle stacked) */}
                <div className="absolute w-[260px] bg-card border border-border/80 p-4.5 rounded-xl shadow-xl rotate-[3deg] translate-x-2 translate-y-2">
                  <div className="flex justify-between items-center text-[9px] mb-2.5">
                    <span className="text-muted-foreground">APRIL PAYSLIP</span>
                    <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded font-bold">Paid</span>
                  </div>
                  <div className="h-2 w-20 bg-muted rounded mb-2"></div>
                  <div className="h-1.5 w-full bg-muted/60 rounded mb-1.5"></div>
                  <div className="h-1.5 w-[85%] bg-muted/60 rounded"></div>
                </div>

                {/* Card 3 (Top focused stacked) */}
                <div className="absolute w-[260px] bg-card border-2 border-primary p-5 rounded-xl shadow-2xl -rotate-[1deg] translate-x-4 -translate-y-2 z-10 scale-[1.03]">
                  <div className="flex justify-between items-center text-[10px] mb-3">
                    <span className="font-bold text-primary uppercase">Active Ledger</span>
                    <span className="text-[9px] bg-emerald-500/15 text-emerald-600 px-2 py-0.5 rounded font-bold">Processed</span>
                  </div>
                  <h4 className="text-sm font-black text-foreground">$4,850.00</h4>
                  <p className="text-[9.5px] text-muted-foreground mt-0.5">Net direct bank payout</p>
                  <div className="h-px bg-border/40 my-3"></div>
                  <div className="flex items-center gap-1.5 text-[9px] text-emerald-600 font-bold">
                    <Check className="w-3.5 h-3.5" /> Direct deposit successful
                  </div>
                </div>

              </div>

              {/* Right Side: Step-by-Step Pills list (copied layout style from image) */}
              <div>
                <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-3 py-1 rounded-full tracking-wider">
                  Operational Flow
                </span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-4 mb-6 leading-tight">
                  How Our HR Software Works
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-8 font-medium">
                  Billy scales company onboarding and client billing in 4 secure steps:
                </p>

                <div className="space-y-3.5">
                  <div className="flex items-center gap-3.5 p-4 rounded-full border border-border bg-card shadow-sm hover:border-primary/40 transition-colors">
                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">1</span>
                    <span className="text-xs sm:text-sm font-bold text-foreground">Configure custom billing rules & intervals</span>
                  </div>

                  <div className="flex items-center gap-3.5 p-4 rounded-full border border-border bg-card shadow-sm hover:border-primary/40 transition-colors">
                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">2</span>
                    <span className="text-xs sm:text-sm font-bold text-foreground">Onboard employees & contractors</span>
                  </div>

                  <div className="flex items-center gap-3.5 p-4 rounded-full border border-border bg-card shadow-sm hover:border-primary/40 transition-colors">
                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">3</span>
                    <span className="text-xs sm:text-sm font-bold text-foreground">Automate net direct deposits</span>
                  </div>

                  <div className="flex items-center gap-3.5 p-4 rounded-full border border-border bg-card shadow-sm hover:border-primary/40 transition-colors">
                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">4</span>
                    <span className="text-xs sm:text-sm font-bold text-foreground">Sync withholdings and generate IRS filings</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* Section: Arched Integrations Network (directly copied concept and design from image integrations layout) */}
        <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-primary/5 to-transparent relative overflow-hidden">
          <div className="max-w-6xl mx-auto text-center relative z-10">
            
            <div className="max-w-2xl mx-auto mb-16">
              <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-3 py-1 rounded-full tracking-wider">
                System Sync
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-4 mb-4">
                Unlock The Power Of Your <br /> Tool With Easy Integrations
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                Sync Billy's data pipelines directly with major payment gateways, auth services, databases, and accounting software.
              </p>
            </div>

            {/* Graphical Arched Network Visual (copied visual layout style from image) */}
            <div className="relative w-full max-w-4xl mx-auto h-[280px] sm:h-[340px] flex items-end justify-center select-none overflow-hidden sm:overflow-visible">
              
              {/* Radial arched rings mock */}
              <div className="absolute bottom-0 w-[420px] sm:w-[620px] h-[210px] sm:h-[310px] border-t-2 border-dashed border-primary/25 rounded-t-full flex items-center justify-center">
                <div className="w-[300px] sm:w-[440px] h-[150px] sm:h-[220px] border-t border-dashed border-primary/20 rounded-t-full"></div>
              </div>

              {/* Bottom Central Hub Node (Neon Lime accent matching the image central green hub) */}
              <div className="absolute bottom-0 w-16 h-16 sm:w-20 sm:h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg shadow-primary/30 z-20 hover:scale-105 transition-all">
                <span className="text-black font-black text-lg sm:text-xl text-primary-foreground">B</span>
              </div>

              {/* Arched node icons mapping (Slack, Stripe, Clerk, MongoDB, Gmail, Vercel) */}
              {/* Clerk Node */}
              <div className="absolute left-[8%] sm:left-[15%] bottom-[12%] sm:bottom-[15%] w-10 h-10 sm:w-12 sm:h-12 bg-card border border-border/80 rounded-full flex items-center justify-center shadow-md animate-float">
                <span className="text-[8px] font-bold text-foreground">Clerk</span>
              </div>
              {/* Stripe Node */}
              <div className="absolute left-[18%] sm:left-[28%] bottom-[42%] sm:bottom-[48%] w-10 h-10 sm:w-12 sm:h-12 bg-card border border-border/80 rounded-full flex items-center justify-center shadow-md animate-float-delayed">
                <span className="text-[8px] font-bold text-primary font-serif">S</span>
              </div>
              {/* Slack Node */}
              <div className="absolute left-[38%] sm:left-[44%] bottom-[75%] sm:bottom-[85%] w-10 h-10 sm:w-12 sm:h-12 bg-card border border-border/80 rounded-full flex items-center justify-center shadow-md animate-float">
                <Sparkles className="w-4.5 h-4.5 text-accent" />
              </div>
              {/* Gmail Node */}
              <div className="absolute right-[38%] sm:right-[44%] bottom-[75%] sm:bottom-[85%] w-10 h-10 sm:w-12 sm:h-12 bg-card border border-border/80 rounded-full flex items-center justify-center shadow-md animate-float-delayed">
                <Send className="w-4.5 h-4.5 text-primary" />
              </div>
              {/* MongoDB Node */}
              <div className="absolute right-[18%] sm:right-[28%] bottom-[42%] sm:bottom-[48%] w-10 h-10 sm:w-12 sm:h-12 bg-card border border-border/80 rounded-full flex items-center justify-center shadow-md animate-float">
                <Database className="w-4.5 h-4.5 text-emerald-500" />
              </div>
              {/* Vercel Node */}
              <div className="absolute right-[8%] sm:right-[15%] bottom-[12%] sm:bottom-[15%] w-10 h-10 sm:w-12 sm:h-12 bg-card border border-border/80 rounded-full flex items-center justify-center shadow-md animate-float-delayed">
                <span className="text-[8px] font-bold text-foreground">Vercel</span>
              </div>

            </div>

          </div>
        </section>

        {/* Section: Savings Calculator Simulator */}
        <section id="calculator" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30 relative">
          <div className="max-w-6xl mx-auto">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20 items-center">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-3 py-1 rounded-full tracking-wider">
                  Operational value
                </span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-4 mb-6 leading-tight">
                  Quantify the time and cost you reclaim
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-8 font-medium">
                  Financial administration shouldn't dominate your calendar. By replacing fragmented workflows, follow-up emails, tax logs, and reconciliations with Billy, you instantly claim back wasted days.
                </p>

                <div className="space-y-5">
                  <div className="flex gap-4">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Clock className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Eliminate Manual Bookkeeping</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Automatic invoice tracking saves business administrators from manually checking ledgers.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                      <DollarSign className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Reduce CPA Agency Costs</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Auto-calculate payroll withholdings and tax compliance, lowering operational billing dependencies.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calculator Panel */}
              <div className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-lg">
                <h3 className="text-base font-bold text-foreground mb-1 flex items-center gap-2">
                  <Calculator className="w-4.5 h-4.5 text-primary" />
                  Savings Estimator
                </h3>
                <p className="text-xs text-muted-foreground mb-6">Adjust sliders based on your business operations.</p>
                
                <div className="space-y-6">
                  {/* Slider 1 */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <label htmlFor="employees-range" className="text-muted-foreground">Team Size (Employees & Contractors)</label>
                      <span className="text-foreground bg-muted px-2 py-0.5 rounded border border-border/60">
                        {employees} Members
                      </span>
                    </div>
                    <input
                      id="employees-range"
                      type="range"
                      min="1"
                      max="100"
                      value={employees}
                      onChange={(e) => setEmployees(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  {/* Slider 2 */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <label htmlFor="invoices-range" className="text-muted-foreground">Monthly Invoices Processed</label>
                      <span className="text-foreground bg-muted px-2 py-0.5 rounded border border-border/60">
                        {invoices} Invoices
                      </span>
                    </div>
                    <input
                      id="invoices-range"
                      type="range"
                      min="1"
                      max="200"
                      value={invoices}
                      onChange={(e) => setInvoices(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                  </div>
                </div>

                <div className="h-px bg-border my-6"></div>

                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="bg-primary/5 border border-primary/10 p-3.5 rounded-xl">
                    <div className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Time Reclaimed</div>
                    <div className="text-xl font-black text-primary">{monthlyHoursSaved} hrs / mo</div>
                    <div className="text-[8px] text-muted-foreground mt-0.5">≈ {annualDaysSaved} work days / yr</div>
                  </div>

                  <div className="bg-accent/5 border border-accent/10 p-3.5 rounded-xl">
                    <div className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Annual Resource Savings</div>
                    <div className="text-xl font-black text-accent">${annualDollarsSaved.toLocaleString()}</div>
                    <div className="text-[8px] text-muted-foreground mt-0.5">Based on standard admin cost</div>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    href="/signup"
                    className="w-full inline-flex justify-center items-center gap-2 px-4 py-3 rounded-xl font-bold bg-primary hover:bg-primary/95 text-primary-foreground transition-colors shadow-md text-xs"
                  >
                    Claim Your Saved Hours
                    <ArrowRight className="w-4 h-4 text-primary-foreground" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Section: Simple & Fair Pricing */}
        <section id="pricing" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-6xl mx-auto">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-3 py-1 rounded-full tracking-wider">
                Transparent Options
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-4 mb-4">
                Sleek pricing. Tailored to your operations.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Choose a plan built for your current billing needs. Upgrade, downgrade, or cancel at any time.
              </p>

              <div className="inline-flex items-center gap-3 bg-muted p-1 rounded-full border border-border/85 mt-8">
                <button
                  onClick={() => setIsMonthly(true)}
                  className={`px-3.5 py-1.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                    isMonthly ? "bg-card text-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setIsMonthly(false)}
                  className={`px-3.5 py-1.5 rounded-full text-[10px] font-semibold transition-all relative cursor-pointer ${
                    !isMonthly ? "bg-card text-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Annually
                  <span className="absolute -top-3.5 -right-3.5 px-1.5 py-0.5 bg-accent text-[7px] text-white font-black rounded-full tracking-wider uppercase scale-90">
                    -20%
                  </span>
                </button>
              </div>
            </div>

            {/* pricing grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
              {/* Plan 1 */}
              <div className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between hover:border-muted-foreground/20 transition-all">
                <div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Freelance</span>
                  <h3 className="text-base font-bold text-foreground mt-1">Starter Plan</h3>
                  <p className="text-[11px] text-muted-foreground mt-1 mb-6">For single founders starting workflows.</p>
                  <div className="mb-6">
                    <span className="text-3xl font-black text-foreground">$0</span>
                    <span className="text-xs text-muted-foreground"> / month</span>
                  </div>
                  <div className="h-px bg-border/60 mb-6"></div>
                  <ul className="space-y-3 text-xs text-muted-foreground text-left">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Up to 5 client invoices / month</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Manage up to 2 team members</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Basic reporting ledger</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8">
                  <Link
                    href="/signup"
                    className="w-full text-center py-2 rounded-xl text-xs font-bold border border-border text-foreground hover:bg-muted block transition-colors"
                  >
                    Start Free
                  </Link>
                </div>
              </div>

              {/* Plan 2 */}
              <div className="bg-card border-2 border-primary p-6 rounded-2xl flex flex-col justify-between relative hover:scale-[1.01] transition-all shadow-lg shadow-primary/5">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                  Recommended
                </span>

                <div>
                  <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Scaling Teams</span>
                  <h3 className="text-base font-bold text-foreground mt-1">Growth Plan</h3>
                  <p className="text-[11px] text-muted-foreground mt-1 mb-6">Best for growing business layouts.</p>
                  <div className="mb-6">
                    <span className="text-3xl font-black text-foreground">
                      ${isMonthly ? "29" : "23"}
                    </span>
                    <span className="text-xs text-muted-foreground"> / month</span>
                    {!isMonthly && <p className="text-[8px] text-accent font-semibold mt-1">Billed annually (${23 * 12}/yr)</p>}
                  </div>
                  <div className="h-px bg-border/60 mb-6"></div>
                  <ul className="space-y-3 text-xs text-muted-foreground text-left">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="font-bold text-foreground">Unlimited invoices & clients</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Manage up to 25 team members</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Dedicated client portals</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Direct bank payout automation</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8">
                  <Link
                    href="/signup"
                    className="w-full text-center py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/95 block transition-colors"
                  >
                    Start Free Trial
                  </Link>
                </div>
              </div>

              {/* Plan 3 */}
              <div className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between hover:border-muted-foreground/20 transition-all">
                <div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Global Corp</span>
                  <h3 className="text-base font-bold text-foreground mt-1">Enterprise Plan</h3>
                  <p className="text-[11px] text-muted-foreground mt-1 mb-6">For large corporate scales.</p>
                  <div className="mb-6">
                    <span className="text-3xl font-black text-foreground">
                      ${isMonthly ? "99" : "79"}
                    </span>
                    <span className="text-xs text-muted-foreground"> / month</span>
                    {!isMonthly && <p className="text-[8px] text-accent font-semibold mt-1">Billed annually (${79 * 12}/yr)</p>}
                  </div>
                  <div className="h-px bg-border/60 mb-6"></div>
                  <ul className="space-y-3 text-xs text-muted-foreground text-left">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="font-semibold text-foreground">Unlimited invoices & team</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Custom API access & webhook triggers</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Contractor compliance audit logs</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8">
                  <Link
                    href="/signup"
                    className="w-full text-center py-2 rounded-xl text-xs font-bold border border-border text-foreground hover:bg-muted block transition-colors"
                  >
                    Contact Enterprise
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Section: Frequently Asked Questions */}
        <section id="faq" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-muted/20 relative">
          <div className="max-w-4xl mx-auto">
            
            <div className="text-center mb-16">
              <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-3 py-1 rounded-full tracking-wider">
                Support Desk
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-4 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                Got questions about the billing logic or tax filings? We've got standard answers compiled below.
              </p>
            </div>

            <div className="space-y-4 max-w-3xl mx-auto text-left">
              {[
                {
                  question: "How secure is the client transaction infrastructure?",
                  answer: "We use bank-level encryption (AES-256) for all invoice databases. Payment processes are handled via secure partners PCI-DSS compliant. We never directly store credit card details or bank logins on our servers."
                },
                {
                  question: "Can I automatically onboard new contractors and track documents?",
                  answer: "Yes! Billy has a full contractor portal module. When adding a contractor, you can auto-send a signature agreement link. They can securely upload W-9/W-8 forms. Billy checks files for compliance and saves documents in your folders."
                },
                {
                  question: "How are national and state tax withholdings calculated for payroll?",
                  answer: "Billy automatically references the latest tax tables based on the business address and employee location. We auto-calculate relevant income taxes, FICA deductions, and pay slips."
                },
                {
                  question: "Do you integrate with my existing accounting ledger like QuickBooks?",
                  answer: "Absolutely. Billy supports automatic transaction export files in CSV/Excel and direct sync connections with QuickBooks and other popular tools."
                },
                {
                  question: "What is your refund policy if I cancel my subscription?",
                  answer: "Billy operates month-to-month. If you decide to cancel, your access transitions to the Starter plan on the next billing date. You can export all invoice databases beforehand without penalties."
                }
              ].map((faqItem, index) => (
                <div
                  key={index}
                  className="bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300 shadow-sm"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-4.5 text-left font-bold text-xs sm:text-sm text-foreground hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <span>{faqItem.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform duration-300 shrink-0 ${
                        activeFaq === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      activeFaq === index ? "max-h-[300px] border-t border-border/40" : "max-h-0"
                    }`}
                  >
                    <p className="p-4.5 text-xs text-muted-foreground leading-relaxed bg-muted/10">
                      {faqItem.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* Section: Testimonials ("What Our Customers Say" Copied from image layout) */}
        <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-6xl mx-auto text-center">
            
            <div className="max-w-2xl mx-auto mb-16">
              <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-3 py-1 rounded-full tracking-wider">
                Endorsements
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-4 mb-4">
                What Our Customers Say
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                Hear from agencies and scaling SaaS companies currently automating billing on Billy.
              </p>
            </div>

            {/* Testimonials Grid (matching visual columns in the image) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch max-w-5xl mx-auto text-left">
              {/* Card 1 */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent stroke-0" />
                    ))}
                  </div>
                  <p className="text-xs text-foreground/90 font-semibold italic leading-relaxed mb-6">
                    "Billy has completely eliminated our invoicing workload. We set billing rules once and the engine takes care of client follow-ups and ledger checks automatically."
                  </p>
                </div>
                <div className="flex items-center gap-3 border-t border-border/40 pt-4">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs">LH</div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">Lucas H.</span>
                    <span className="text-[9.5px] text-muted-foreground">Founder, Pixel Studio</span>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent stroke-0" />
                    ))}
                  </div>
                  <p className="text-xs text-foreground/90 font-semibold italic leading-relaxed mb-6">
                    "Compliance and direct deposit distribution used to take days of manual sheets. With Billy, employee direct payments and 1099 compliance happen instantly."
                  </p>
                </div>
                <div className="flex items-center gap-3 border-t border-border/40 pt-4">
                  <div className="w-9 h-9 rounded-full bg-accent/10 text-accent flex items-center justify-center font-black text-xs">JM</div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">Julia M.</span>
                    <span className="text-[9.5px] text-muted-foreground">Operations Director, Apex</span>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent stroke-0" />
                    ))}
                  </div>
                  <p className="text-xs text-foreground/90 font-semibold italic leading-relaxed mb-6">
                    "The customer portal layout is extremely premium. Our clients appreciate being able to fetch raw invoice PDFs and process bank transfers without billing back-and-forth."
                  </p>
                </div>
                <div className="flex items-center gap-3 border-t border-border/40 pt-4">
                  <div className="w-9 h-9 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center font-black text-xs">TC</div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">Thomas C.</span>
                    <span className="text-[9.5px] text-muted-foreground">Product Lead, DevVibe</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Section: Centered Final Call-To-Action Banner (Revamped with search/signup layout matching image) */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-5xl mx-auto bg-gradient-to-tr from-primary to-violet-700 rounded-[36px] p-8 sm:p-14 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/10">
            {/* Absolute design decorations */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-accent/15 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center">
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-5 max-w-2xl leading-tight">
                Transform The Way Your <br /> Team Works Starting Now
              </h2>
              <p className="text-sm text-violet-100 max-w-xl mb-10 leading-relaxed font-semibold">
                Sync your bank ledger, invite employees, and issue smart automated billing in less than 10 minutes.
              </p>
              
              {/* Search Signup Input Bar (nested green button) */}
              <div className="w-full max-w-md bg-white/10 border border-white/20 backdrop-blur-md shadow-xl rounded-full p-1.5 flex items-center justify-between gap-2 mb-8">
                <input
                  type="email"
                  placeholder="Enter Email Address"
                  className="bg-transparent border-none outline-none text-sm font-semibold pl-4 flex-1 text-white placeholder:text-white/60 w-full"
                />
                <Link
                  href="/signup"
                  className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs sm:text-sm px-6 py-3 rounded-full transition-all shrink-0 flex items-center gap-1 animate-pulse"
                >
                  Get Started Free
                  <ArrowRight className="w-3.5 h-3.5 text-primary-foreground" />
                </Link>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-6 text-[10px] text-violet-200">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-violet-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-violet-400" />
                  <span>14-day trial of Pro tools</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-violet-400" />
                  <span>Instant self-onboarding</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer (revamped with modern columns & download store badges matching photo footer concept) */}
      <footer className="bg-card border-t border-border/80 pt-16 pb-10 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            
            {/* Column 1 */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
                  <span className="text-white font-extrabold text-sm">B</span>
                </div>
                <span className="text-lg font-black tracking-tight text-foreground">
                  Billy
                </span>
              </div>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed font-semibold">
                Billy is the automated financial and payroll platform built specifically to help startups scale client billing and contractor compliance without admin stress.
              </p>
              <div className="text-[10px] text-muted-foreground font-semibold">
                © {new Date().getFullYear()} Billy Technologies Inc. All rights reserved.
              </div>
            </div>

            {/* Column 2: Navigation shortcuts */}
            <div>
              <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-3.5">Product</h4>
              <ul className="space-y-2 text-xs font-semibold">
                <li><button onClick={() => scrollToSection("features")} className="text-muted-foreground hover:text-foreground cursor-pointer text-left">Smart Invoices</button></li>
                <li><button onClick={() => scrollToSection("features")} className="text-muted-foreground hover:text-foreground cursor-pointer text-left">Payroll Compliance</button></li>
                <li><button onClick={() => scrollToSection("features")} className="text-muted-foreground hover:text-foreground cursor-pointer text-left">Client Portals</button></li>
              </ul>
            </div>

            {/* Column 3: Platform resources */}
            <div>
              <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-3.5">Resources</h4>
              <ul className="space-y-2 text-xs font-semibold">
                <li><button onClick={() => scrollToSection("calculator")} className="text-muted-foreground hover:text-foreground cursor-pointer text-left">Savings Calculator</button></li>
                <li><button onClick={() => scrollToSection("pricing")} className="text-muted-foreground hover:text-foreground cursor-pointer text-left">Sleek Pricing</button></li>
                <li><button onClick={() => scrollToSection("faq")} className="text-muted-foreground hover:text-foreground cursor-pointer text-left">Frequently Asked</button></li>
              </ul>
            </div>

            {/* Column 4: App Download Badges (Direct copy of footer concept from photo) */}
            <div>
              <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-3.5">Get the App</h4>
              <div className="space-y-2.5">
                <Link href="#" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black text-white hover:bg-zinc-900 transition-colors border border-zinc-800 text-left w-36">
                  <svg className="w-5 h-5 fill-white shrink-0" viewBox="0 0 24 24">
                    <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.1 16.67C20.08 16.74 19.67 18.11 18.71 19.5M15.97 4.17C16.63 3.37 17.07 2.28 16.95 1C15.85 1.04 14.51 1.73 13.73 2.64C13.07 3.41 12.49 4.52 12.64 5.78C13.87 5.87 15.12 5.17 15.97 4.17Z"/>
                  </svg>
                  <div>
                    <span className="text-[6.5px] uppercase font-bold text-zinc-400 block leading-tight">Download on</span>
                    <span className="text-[10px] font-bold text-white block leading-tight">App Store</span>
                  </div>
                </Link>

                <Link href="#" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black text-white hover:bg-zinc-900 transition-colors border border-zinc-800 text-left w-36">
                  <svg className="w-5 h-5 fill-white shrink-0" viewBox="0 0 24 24">
                    <path d="M5 3.14l11.66 11.66-3.66 3.66-9.66-9.66C3.12 8.35 3 7.88 3 7.5c0-.38.12-.85.34-1.3l1.66-3.06z M16.66 3.14L5 14.8l-1.66-3.06C3.12 11.29 3 10.82 3 10.44c0-.38.12-.85.34-1.3l13.32-6z M17.66 4.14l4 4c.22.22.34.52.34.86 0 .34-.12.64-.34.86l-4 4-4-4 4-4z M17.66 19.86l-4-4 4-4 4 4c.22.22.34.52.34.86 0 .34-.12.64-.34.86l-4 4z"/>
                  </svg>
                  <div>
                    <span className="text-[6.5px] uppercase font-bold text-zinc-400 block leading-tight">Get it on</span>
                    <span className="text-[10px] font-bold text-white block leading-tight">Google Play</span>
                  </div>
                </Link>
              </div>
            </div>

          </div>

          <div className="border-t border-border/40 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[10px] text-muted-foreground font-semibold">
              Billy Technologies Inc. | Safe & Compliant payroll processing.
            </div>

            <div className="flex gap-4">
              <Link href="https://twitter.com" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.095 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="https://github.com" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
