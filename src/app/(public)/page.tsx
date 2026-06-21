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
  AlertCircle
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
      
      {/* Custom Styles Injection for animations and effects */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(8px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.4; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        .text-gradient {
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }
        .glass-card {
          background: rgba(var(--card-rgb, 255, 255, 255), 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        .dark .glass-card {
          background: rgba(20, 20, 22, 0.6);
        }
      `}</style>

      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] left-[10%] w-[550px] h-[550px] bg-primary/10 rounded-full blur-[140px] pointer-events-none z-0 dark:bg-primary/5 animate-pulse-slow"></div>
      <div className="absolute top-[25%] right-[-10%] w-[650px] h-[650px] bg-accent/10 rounded-full blur-[140px] pointer-events-none z-0 dark:bg-accent/5 animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
      <div className="absolute bottom-[15%] left-[-5%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none z-0 dark:bg-indigo-500/5 animate-pulse-slow" style={{ animationDelay: "4s" }}></div>

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_75%,transparent_100%)] z-0"></div>

      {/* Sticky & Floating Header Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 transition-all duration-300">
        <header
          className={`max-w-6xl mx-auto transition-all duration-300 rounded-2xl ${
            isScrolled
              ? "glass-card border border-border/40 shadow-lg px-6 py-3"
              : "bg-transparent border border-transparent px-4 py-4"
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection("hero")}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary via-indigo-600 to-accent flex items-center justify-center shadow-md shadow-primary/20">
                <span className="text-white font-black text-lg tracking-tight">B</span>
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                Billy
              </span>
            </div>

            {/* Desktop Navigation links */}
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => scrollToSection("sandbox")}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Interactive Demo
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("calculator")}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Savings
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
                    className="text-xs font-bold text-muted-foreground hover:text-foreground px-3 py-1.5 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="text-xs font-bold bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2.5 rounded-xl transition-all shadow-md shadow-primary/10 hover:shadow-primary/20"
                  >
                    Start Free
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    className="text-xs font-bold bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2.5 rounded-xl transition-all shadow-md shadow-primary/10 hover:shadow-primary/20 flex items-center gap-1.5 mr-2"
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
                className="text-foreground p-2 rounded-lg hover:bg-muted/80 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-border/20 space-y-3 animate-fade-in">
              <button
                onClick={() => scrollToSection("sandbox")}
                className="block w-full text-left py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Interactive Demo
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="block w-full text-left py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("calculator")}
                className="block w-full text-left py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Savings Calculator
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="block w-full text-left py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="block w-full text-left py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                FAQ
              </button>
              <div className="h-px bg-border/25 my-3" />
              <div className="flex flex-col gap-2">
                {!isSignedIn ? (
                  <>
                    <Link
                      href="/login"
                      className="w-full text-center py-2 rounded-xl font-medium border border-border text-foreground hover:bg-muted transition-colors text-xs"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="w-full text-center py-2.5 rounded-xl font-medium bg-primary text-primary-foreground hover:bg-primary/95 transition-colors shadow-lg text-xs"
                    >
                      Start Free
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      className="w-full text-center py-2 rounded-xl font-medium bg-primary text-primary-foreground hover:bg-primary/95 transition-colors shadow-lg text-xs flex items-center justify-center gap-1.5"
                    >
                      Go to Dashboard
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <div className="flex items-center justify-center pt-2 gap-2 border-t border-border/20 mt-1">
                      <span className="text-[10px] text-muted-foreground font-semibold">Logged in as:</span>
                      <UserButton />
                    </div>
                  </>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-border/20 mt-1">
                  <span className="text-xs text-muted-foreground font-medium">Appearance</span>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          )}
        </header>
      </div>

      {/* Main Content */}
      <main className="relative z-10 pt-20">
        
        {/* Section: Centered Hero */}
        <section id="hero" className="relative pt-16 pb-20 sm:pt-28 sm:pb-36 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
            
            {/* Announcement Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-semibold mb-8 hover:bg-primary/15 transition-all cursor-pointer">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Smart billing workflows for modern companies</span>
            </div>

            {/* Premium Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-[1.05] text-foreground max-w-3xl mb-8">
              We build billing systems that <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary via-indigo-500 to-accent text-gradient">
                run completely by themselves.
              </span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mb-12 leading-relaxed">
              Billy automates repetitive billing cycles, processes compliant local payroll, and handles smart invoice follow-ups. Built specifically for startups, SaaS, and fast-growing agencies.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-20 justify-center">
              <Link
                href="/signup"
                className="px-7 py-3.5 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => scrollToSection("sandbox")}
                className="px-7 py-3.5 bg-card text-foreground hover:bg-muted border border-border hover:border-muted-foreground/30 rounded-xl font-bold transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                Try Sandbox Demo
                <Zap className="w-4 h-4 text-accent" />
              </button>
            </div>

            {/* Creative Visual: 3D Stacked Workspace Deck */}
            <div className="relative w-full max-w-5xl mt-12 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-0 px-4 select-none pb-8">
              
              {/* Central Background Ring Glow */}
              <div className="absolute inset-0 m-auto w-[350px] h-[350px] bg-primary/10 rounded-full blur-[80px] pointer-events-none z-0 dark:bg-primary/5"></div>

              {/* Stack Card 1: Smart Invoice (Left Tilted) */}
              <div className="glass-card border border-border/70 p-5 rounded-2xl shadow-xl w-full max-w-[310px] md:translate-x-4 md:rotate-[-4deg] hover:rotate-0 hover:-translate-y-4 hover:scale-[1.04] hover:z-30 hover:border-primary/45 transition-all duration-500 ease-out cursor-pointer z-10 relative">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Invoicing</span>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Paid
                  </span>
                </div>
                
                <div className="mb-4">
                  <span className="text-[10px] text-muted-foreground">Vortex Technologies</span>
                  <h4 className="text-xl font-bold text-foreground mt-0.5">$8,500.00</h4>
                </div>

                <div className="h-px bg-border/40 my-3"></div>

                <div className="space-y-2 text-[10px]">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Q2 Product Design Support</span>
                    <span className="font-semibold text-foreground">$6,800.00</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Platform Setup Milestone</span>
                    <span className="font-semibold text-foreground">$1,700.00</span>
                  </div>
                </div>

                <div className="h-px bg-border/40 my-3"></div>

                <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-primary" /> Auto-reminder sent
                  </span>
                  <span>June 18th</span>
                </div>
              </div>

              {/* Stack Card 2: Payroll distribution (Center Focus Card) */}
              <div className="bg-card border-2 border-primary/50 p-6 rounded-2xl shadow-2xl w-full max-w-[340px] md:scale-[1.02] hover:-translate-y-5 hover:scale-[1.05] hover:z-30 hover:border-primary transition-all duration-500 ease-out cursor-pointer z-20 relative">
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-bold text-foreground">Payroll Dispatch</span>
                  </div>
                  <span className="text-[9px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Auto-Run
                  </span>
                </div>

                <div className="mb-5">
                  <span className="text-[10px] text-muted-foreground">Operational Team Ledger</span>
                  <h4 className="text-2xl font-black text-foreground mt-0.5">$48,250.00</h4>
                  <p className="text-[9px] text-muted-foreground mt-1">Direct deposits sent successfully to 16 members.</p>
                </div>

                {/* Simulated payout progress */}
                <div className="space-y-2 mb-4 bg-muted/40 p-3 rounded-lg border border-border/40">
                  <div className="flex justify-between text-[9px] font-bold text-foreground">
                    <span>Tax Withholdings Ledger</span>
                    <span className="text-emerald-600 dark:text-emerald-400">100% compliant</span>
                  </div>
                  <div className="w-full bg-border h-1 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-primary to-accent h-full w-[85%] rounded-full"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Taxes auto-filed
                  </span>
                  <span className="font-mono">Ready for IRS</span>
                </div>
              </div>

              {/* Stack Card 3: Compliance Checklist (Right Tilted) */}
              <div className="glass-card border border-border/70 p-5 rounded-2xl shadow-xl w-full max-w-[310px] md:-translate-x-4 md:rotate-[4deg] hover:rotate-0 hover:-translate-y-4 hover:scale-[1.04] hover:z-30 hover:border-primary/45 transition-all duration-500 ease-out cursor-pointer z-10 relative">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Compliance</span>
                  <span className="text-[9px] bg-accent/15 text-accent px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Contractor
                  </span>
                </div>

                <div className="mb-4">
                  <span className="text-[10px] text-muted-foreground">Signature Desk</span>
                  <h4 className="text-base font-bold text-foreground mt-0.5">Alex Rivera</h4>
                  <p className="text-[9px] text-muted-foreground mt-0.5 font-mono">ID: W9-CONTRACTOR-44</p>
                </div>

                <div className="h-px bg-border/40 my-3"></div>

                <div className="space-y-2.5 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>W-9 tax classification verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>Independent Contractor Agreement signed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>1099 Tax log compiled</span>
                  </div>
                </div>

                <div className="h-px bg-border/40 my-3"></div>

                <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                  <span className="flex items-center gap-1 font-semibold text-accent">
                    <Shield className="w-3 h-3" /> Encrypted & Audited
                  </span>
                  <span>1099-NEC ready</span>
                </div>
              </div>

              {/* Floating decorative vector circles */}
              <div className="hidden lg:block absolute left-4 -top-8 bg-card border border-border p-2.5 rounded-xl shadow-lg animate-float text-[12px] z-30">
                <DollarSign className="w-4 h-4 text-accent" />
              </div>
              <div className="hidden lg:block absolute right-4 -bottom-4 bg-card border border-border p-2.5 rounded-xl shadow-lg animate-float-delayed text-[12px] z-30">
                <ShieldCheck className="w-4 h-4 text-primary" />
              </div>

            </div>

          </div>
        </section>

        {/* Section: Interactive Invoice Builder Sandbox */}
        <section id="sandbox" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-y border-border/40 bg-muted/20 relative">
          <div className="max-w-6xl mx-auto">
            
            {/* Header info */}
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-3 py-1 rounded-full tracking-wider">
                Product Sandbox
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-4 mb-4">
                Test the automation engine live
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Toggle the controls on the left to see how Billy's background rule engine instantly builds compliance, fee structures, and tracking actions into client invoices.
              </p>
            </div>

            {/* Interactive Sandbox Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 sm:gap-12 items-stretch">
              
              {/* Left Sandbox Control Panel */}
              <div className="col-span-1 lg:col-span-2 bg-card border border-border p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground mb-1.5 flex items-center gap-2">
                    <Building className="w-4 h-4 text-primary" />
                    Configure Billing Rules
                  </h3>
                  <p className="text-xs text-muted-foreground mb-6">Click toggles to dynamically update the invoice logic.</p>
                  
                  <div className="space-y-4">
                    
                    {/* Control 1: Reminders */}
                    <button
                      onClick={() => setSandboxReminders(!sandboxReminders)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                        sandboxReminders
                          ? "border-primary/50 bg-primary/5 shadow-sm"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center mt-0.5 shrink-0 ${
                        sandboxReminders ? "bg-primary text-primary-foreground" : "border border-border/80 text-transparent"
                      }`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          Autopilot Reminders
                          <span className="text-[8px] bg-accent/20 text-accent font-extrabold px-1 rounded uppercase tracking-wider scale-90">Auto</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Auto-followup clients via email & SMS when invoice is viewed or overdue.</p>
                      </div>
                    </button>

                    {/* Control 2: Late Fees */}
                    <button
                      onClick={() => setSandboxLateFee(!sandboxLateFee)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                        sandboxLateFee
                          ? "border-primary/50 bg-primary/5 shadow-sm"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center mt-0.5 shrink-0 ${
                        sandboxLateFee ? "bg-primary text-primary-foreground" : "border border-border/80 text-transparent"
                      }`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">Apply Late Fees (1.5%)</div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Automatically calculate and append a 1.5% late fee if unpaid past terms.</p>
                      </div>
                    </button>

                    {/* Control 3: Instant Transfer */}
                    <button
                      onClick={() => setSandboxInstantPayout(!sandboxInstantPayout)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                        sandboxInstantPayout
                          ? "border-primary/50 bg-primary/5 shadow-sm"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center mt-0.5 shrink-0 ${
                        sandboxInstantPayout ? "bg-primary text-primary-foreground" : "border border-border/80 text-transparent"
                      }`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          Instant Bank Settlement
                          <span className="text-[8px] bg-indigo-500/20 text-indigo-500 font-extrabold px-1 rounded uppercase tracking-wider scale-90">Saves Time</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Enable instant direct payouts to settle funds into your operating bank ledger.</p>
                      </div>
                    </button>

                    {/* Control 4: Tax compliance */}
                    <button
                      onClick={() => setSandboxTaxWithholding(!sandboxTaxWithholding)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                        sandboxTaxWithholding
                          ? "border-primary/50 bg-primary/5 shadow-sm"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center mt-0.5 shrink-0 ${
                        sandboxTaxWithholding ? "bg-primary text-primary-foreground" : "border border-border/80 text-transparent"
                      }`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          Compliant Tax Withholding
                          <span className="text-[8px] bg-red-500/10 text-red-500 font-extrabold px-1 rounded uppercase tracking-wider scale-90">IRS</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Automatically withhold 20% backup tax logs for 1099-NEC compliance.</p>
                      </div>
                    </button>

                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-border/60 text-[10px] text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5 text-accent shrink-0" />
                  <span>These rules trigger actions instantly behind the scenes on our node server.</span>
                </div>
              </div>

              {/* Right Sandbox Visual Output (Dynamic Invoice mockup) */}
              <div className="col-span-1 lg:col-span-3 bg-[#0c0c0e] text-white border border-[#27272a] p-6 sm:p-8 rounded-2xl flex flex-col justify-between shadow-2xl relative overflow-hidden">
                
                {/* Decorative glow inside invoice container */}
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>

                <div>
                  {/* Dynamic invoice header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="text-sm font-black flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
                          <span className="text-white text-[10px] font-black">B</span>
                        </div>
                        Billy Invoice Editor
                      </div>
                      <div className="text-[9px] text-zinc-500 font-mono mt-1">OPERATIONS ID: BL-924-INVOICE</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] bg-zinc-800 text-zinc-300 font-mono px-2.5 py-1 rounded-md border border-zinc-700/60 uppercase">
                        Draft Mode
                      </span>
                    </div>
                  </div>

                  {/* Client & Company details grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6 text-[10px] border-b border-zinc-800/80 pb-4">
                    <div>
                      <span className="text-zinc-500 font-semibold block mb-1">ISSUED BY</span>
                      <span className="font-bold text-zinc-200">Design Agency Co.</span>
                      <span className="text-zinc-400 block">finance@designagency.co</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-semibold block mb-1">CLIENT BILL TO</span>
                      <span className="font-bold text-zinc-200">Vortex Technologies</span>
                      <span className="text-zinc-400 block">billing@vortextech.com</span>
                    </div>
                  </div>

                  {/* Invoice Line Items */}
                  <div className="space-y-3 mb-6">
                    <span className="text-[10px] text-zinc-500 font-bold block mb-1 uppercase tracking-wider">Line Items</span>
                    
                    {/* Item 1 */}
                    <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/40">
                      <div>
                        <div className="font-bold text-zinc-200">Q2 Product Strategy Consulting</div>
                        <div className="text-[9px] text-zinc-500">Contract milestone delivery</div>
                      </div>
                      <div className="font-mono font-bold text-zinc-300">${baseInvoiceAmt.toLocaleString()}.00</div>
                    </div>

                    {/* Dyn Item: Late Fee */}
                    {sandboxLateFee && (
                      <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-red-950/20 border border-red-900/30 animate-slide-in">
                        <div>
                          <div className="font-bold text-red-400 flex items-center gap-1">
                            Late Payment Penalty
                            <span className="text-[8px] bg-red-500/25 text-red-300 font-bold px-1 rounded">+1.5%</span>
                          </div>
                          <div className="text-[9px] text-zinc-500 font-mono">Overdue terms applied automatically</div>
                        </div>
                        <div className="font-mono font-bold text-red-400">+${lateFeeAmt.toLocaleString()}.00</div>
                      </div>
                    )}

                    {/* Dyn Item: Tax Withholding */}
                    {sandboxTaxWithholding && (
                      <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-indigo-950/20 border border-indigo-900/30 animate-slide-in">
                        <div>
                          <div className="font-bold text-indigo-400 flex items-center gap-1">
                            Compliance Backup Tax Withholding
                            <span className="text-[8px] bg-indigo-500/25 text-indigo-300 font-bold px-1 rounded">20%</span>
                          </div>
                          <div className="text-[9px] text-zinc-500 font-mono">Auto-withheld 1099 backup tax filing logs</div>
                        </div>
                        <div className="font-mono font-bold text-indigo-400">-${taxWithheldAmt.toLocaleString()}.00</div>
                      </div>
                    )}

                  </div>

                  {/* Calculations breakdown */}
                  <div className="border-t border-zinc-800/80 pt-4 flex flex-col items-end gap-1.5 text-xs text-right">
                    <div className="flex justify-between w-44 text-[10px] text-zinc-400">
                      <span>Base Total:</span>
                      <span className="font-mono font-semibold">${baseInvoiceAmt.toLocaleString()}.00</span>
                    </div>
                    {sandboxLateFee && (
                      <div className="flex justify-between w-44 text-[10px] text-red-400">
                        <span>Late Fees:</span>
                        <span className="font-mono font-semibold">+${lateFeeAmt.toLocaleString()}.00</span>
                      </div>
                    )}
                    {sandboxTaxWithholding && (
                      <div className="flex justify-between w-44 text-[10px] text-indigo-400">
                        <span>Withheld Tax:</span>
                        <span className="font-mono font-semibold">-${taxWithheldAmt.toLocaleString()}.00</span>
                      </div>
                    )}
                    <div className="flex justify-between w-44 text-sm font-black border-t border-zinc-800 pt-2 text-white">
                      <span>Net Payout:</span>
                      <span className="font-mono text-accent">${netInvoiceAmt.toLocaleString()}.00</span>
                    </div>
                  </div>

                </div>

                {/* Automation Visual Response Bar */}
                <div className="mt-8 pt-4 border-t border-zinc-800/80 flex flex-col gap-3">
                  
                  {/* Status pills reflecting toggles */}
                  <div className="flex flex-wrap gap-2.5">
                    
                    {/* Auto-reminder Status */}
                    <div className={`inline-flex items-center gap-1 text-[9px] px-2.5 py-1 rounded-full border transition-all ${
                      sandboxReminders
                        ? "bg-primary/20 border-primary text-primary font-bold"
                        : "bg-zinc-900 border-zinc-800 text-zinc-500"
                    }`}>
                      <Bell className="w-2.5 h-2.5" />
                      <span>{sandboxReminders ? "Reminders Set (Autopilot)" : "Manual Follow-up"}</span>
                    </div>

                    {/* Instant Settlement Status */}
                    <div className={`inline-flex items-center gap-1 text-[9px] px-2.5 py-1 rounded-full border transition-all ${
                      sandboxInstantPayout
                        ? "bg-accent/20 border-accent text-accent font-bold"
                        : "bg-zinc-900 border-zinc-800 text-zinc-500"
                    }`}>
                      <Zap className="w-2.5 h-2.5" />
                      <span>{sandboxInstantPayout ? "Instant Bank Settlement Enabled" : "Standard ACH (3-5 Days)"}</span>
                    </div>

                    {/* 1099 Compliance status */}
                    <div className={`inline-flex items-center gap-1 text-[9px] px-2.5 py-1 rounded-full border transition-all ${
                      sandboxTaxWithholding
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold"
                        : "bg-zinc-900 border-zinc-800 text-zinc-500"
                    }`}>
                      <ShieldCheck className="w-2.5 h-2.5" />
                      <span>{sandboxTaxWithholding ? "1099 Document Queued" : "No W-9 tax checks"}</span>
                    </div>

                  </div>

                  {/* Actions bubble dynamically fading in */}
                  {sandboxReminders && (
                    <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex gap-2.5 items-start text-[10px] text-zinc-300 animate-slide-in">
                      <Send className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-zinc-100 block">Autopilot Rule Triggered</span>
                        <span className="text-zinc-400">If unpaid by June 20th, auto-alert client billing leads via primary gateway.</span>
                      </div>
                    </div>
                  )}

                </div>

              </div>

            </div>

          </div>
        </section>

        {/* Section: Product Interactive Feature Tabs */}
        <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-6xl mx-auto">
            
            {/* Header section */}
            <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
              <span className="text-[10px] font-bold text-accent uppercase bg-accent/10 px-3 py-1 rounded-full tracking-wider">
                Product deep-dive
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-4 mb-4">
                Explore the Billy core infrastructure
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Click the categories below to view custom layout mocks of how Billy centralizes invoices, payroll tax logs, employee workspaces, and compliance workflows.
              </p>
            </div>

            {/* Split layout: Interactive tabs on left, rich mocks on right */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 sm:gap-16 items-start">
              
              {/* Left Side: Category Tabs buttons */}
              <div className="lg:col-span-2 space-y-4">
                
                {/* Tab 1 button */}
                <button
                  onClick={() => setActiveTab("invoice")}
                  className={`w-full text-left p-5 rounded-2xl border transition-all flex gap-4 items-start cursor-pointer ${
                    activeTab === "invoice"
                      ? "bg-card border-primary/40 shadow-md ring-1 ring-primary/20"
                      : "border-transparent hover:bg-muted/50"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${activeTab === "invoice" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"} shrink-0`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${activeTab === "invoice" ? "text-foreground" : "text-muted-foreground"} transition-colors`}>
                      1. Smart Billing & Invoices
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Auto-generate, style, and schedule billing cycles. Fully compatible with multi-currency configurations and digital payment links.
                    </p>
                  </div>
                </button>

                {/* Tab 2 button */}
                <button
                  onClick={() => setActiveTab("payroll")}
                  className={`w-full text-left p-5 rounded-2xl border transition-all flex gap-4 items-start cursor-pointer ${
                    activeTab === "payroll"
                      ? "bg-card border-primary/40 shadow-md ring-1 ring-primary/20"
                      : "border-transparent hover:bg-muted/50"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${activeTab === "payroll" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"} shrink-0`}>
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${activeTab === "payroll" ? "text-foreground" : "text-muted-foreground"} transition-colors`}>
                      2. Compliant Payroll Auto-Run
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      One-click payout distribution for local employees. Automated local tax calculation logs, tax slips delivery, and direct ledger deposit syncs.
                    </p>
                  </div>
                </button>

                {/* Tab 3 button */}
                <button
                  onClick={() => setActiveTab("portal")}
                  className={`w-full text-left p-5 rounded-2xl border transition-all flex gap-4 items-start cursor-pointer ${
                    activeTab === "portal"
                      ? "bg-card border-primary/40 shadow-md ring-1 ring-primary/20"
                      : "border-transparent hover:bg-muted/50"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${activeTab === "portal" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"} shrink-0`}>
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${activeTab === "portal" ? "text-foreground" : "text-muted-foreground"} transition-colors`}>
                      3. Self-Serve Client Portal
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Give your clients a unified portal to retrieve past transaction histories, download raw PDFs, change cards, and initiate instant direct ACH.
                    </p>
                  </div>
                </button>

                {/* Tab 4 button */}
                <button
                  onClick={() => setActiveTab("compliance")}
                  className={`w-full text-left p-5 rounded-2xl border transition-all flex gap-4 items-start cursor-pointer ${
                    activeTab === "compliance"
                      ? "bg-card border-primary/40 shadow-md ring-1 ring-primary/20"
                      : "border-transparent hover:bg-muted/50"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${activeTab === "compliance" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"} shrink-0`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${activeTab === "compliance" ? "text-foreground" : "text-muted-foreground"} transition-colors`}>
                      4. Contractor Onboarding & Taxes
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Instantly onboard independent contractors, track digital signatures, automatically compile W-8/W-9 logs, and issue 1099-NEC at tax season.
                    </p>
                  </div>
                </button>

              </div>

              {/* Right Side: Tab View Mockup */}
              <div className="lg:col-span-3 bg-card border border-border p-5 sm:p-6 rounded-2xl shadow-xl min-h-[380px] flex flex-col justify-between">
                
                {/* Header of dynamic mock display */}
                <div className="flex justify-between items-center pb-3 border-b border-border/50 text-[11px]">
                  <span className="text-muted-foreground font-mono">WORKSPACE CORE DISPLAY</span>
                  <span className="text-accent font-bold uppercase tracking-widest text-[9px] bg-accent/15 px-2 py-0.5 rounded">Active View</span>
                </div>

                {/* Dynamic Content 1: Invoicing */}
                {activeTab === "invoice" && (
                  <div className="py-6 space-y-4">
                    <div className="bg-background border border-border p-4 rounded-xl shadow-sm">
                      <div className="flex items-center justify-between text-xs font-semibold text-foreground mb-3">
                        <span>Invoice Template Builder</span>
                        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">Standard PDF style</span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-6 bg-muted/40 rounded flex items-center justify-between px-3 text-[10px] text-muted-foreground">
                          <span>Set Primary Accent Color</span>
                          <span className="w-4 h-4 rounded-full bg-primary inline-block"></span>
                        </div>
                        <div className="h-6 bg-muted/40 rounded flex items-center justify-between px-3 text-[10px] text-muted-foreground">
                          <span>Include Bank Transfer Routing details</span>
                          <span className="text-emerald-500 font-bold text-[9px] uppercase">Enabled</span>
                        </div>
                        <div className="h-6 bg-muted/40 rounded flex items-center justify-between px-3 text-[10px] text-muted-foreground">
                          <span>Add business logo file</span>
                          <span className="text-zinc-400 text-[9px]">billy-logo.png</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-background border border-border p-3.5 rounded-xl">
                        <span className="text-[9px] text-muted-foreground font-bold tracking-wider block mb-1">RECURRING FREQUENCY</span>
                        <span className="text-xs font-bold text-foreground">Monthly (Every 1st)</span>
                      </div>
                      <div className="bg-background border border-border p-3.5 rounded-xl">
                        <span className="text-[9px] text-muted-foreground font-bold tracking-wider block mb-1">AUTO-GATEWAYS</span>
                        <span className="text-xs font-bold text-foreground">Stripe, ACH & Wire</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dynamic Content 2: Payroll */}
                {activeTab === "payroll" && (
                  <div className="py-6 space-y-4">
                    <div className="bg-background border border-border p-4 rounded-xl shadow-sm">
                      <span className="text-[10px] font-bold text-muted-foreground block mb-2.5 uppercase tracking-wider">Employee Payroll Roster</span>
                      
                      <div className="space-y-2.5 text-[11px]">
                        <div className="flex justify-between items-center border-b border-border/40 pb-2">
                          <span className="font-bold text-foreground">Sarah Jenkins (Full-Time)</span>
                          <span className="font-mono text-muted-foreground">$8,250.00 / mo</span>
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded">Taxes Paid</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-border/40 pb-2">
                          <span className="font-bold text-foreground">Alex Rivera (Contractor)</span>
                          <span className="font-mono text-muted-foreground">$5,400.00 / mo</span>
                          <span className="text-[9px] bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded">1099 File</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-foreground">Marcus Cole (Full-Time)</span>
                          <span className="font-mono text-muted-foreground">$7,800.00 / mo</span>
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded">Taxes Paid</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 text-[10px] text-primary flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>Federal and State tax withholdings calculated and filed automatically with local agencies.</span>
                    </div>
                  </div>
                )}

                {/* Dynamic Content 3: Client Portal */}
                {activeTab === "portal" && (
                  <div className="py-6 space-y-4">
                    <div className="bg-background border border-border p-4 rounded-xl shadow-sm">
                      <div className="flex justify-between items-center text-xs font-semibold text-foreground mb-3">
                        <span>Customer Portal Interface (Preview)</span>
                        <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded dark:bg-emerald-500/10 dark:text-emerald-400">Secure link</span>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-muted/40 border border-border/60 text-center">
                        <span className="text-[10px] text-muted-foreground block">INV-2026-004 TOTAL DUE</span>
                        <span className="text-2xl font-black text-foreground block my-1.5">$8,500.00</span>
                        
                        <div className="flex gap-2 max-w-xs mx-auto mt-4">
                          <button className="w-full py-2 bg-primary text-primary-foreground text-[10px] rounded-lg font-bold shadow hover:bg-primary/95">
                            Pay via Bank (ACH)
                          </button>
                          <button className="w-full py-2 bg-card text-foreground border border-border text-[10px] rounded-lg font-bold hover:bg-muted">
                            Credit Card
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dynamic Content 4: Compliance */}
                {activeTab === "compliance" && (
                  <div className="py-6 space-y-4">
                    <div className="bg-background border border-border p-4 rounded-xl shadow-sm">
                      <span className="text-[10px] font-bold text-muted-foreground block mb-3 uppercase tracking-wider">Contractor Compliance Tracker</span>
                      
                      <div className="space-y-2 text-[10px] text-muted-foreground">
                        <div className="flex items-center justify-between p-1.5 rounded bg-muted/30">
                          <span className="font-bold text-foreground">W-9 Form Verification</span>
                          <span className="text-emerald-500 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Verified (Signature Match)
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-1.5 rounded bg-muted/30">
                          <span className="font-bold text-foreground">Direct Deposit Details</span>
                          <span className="text-emerald-500 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Synchronized
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-1.5 rounded bg-muted/30">
                          <span className="font-bold text-foreground">Independent Contractor Agreement</span>
                          <span className="text-emerald-500 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Digitally Signed
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground bg-muted/20 p-3 rounded-lg border border-border/50">
                      <span>W-9 backup tax logs processed for fiscal year tax delivery.</span>
                      <span className="font-bold text-foreground">1099-NEC Ready</span>
                    </div>
                  </div>
                )}

                {/* Footer segment of dynamic mockup */}
                <div className="text-[10px] text-muted-foreground pt-3 border-t border-border/50 flex justify-between items-center">
                  <span>Interactive product visualizer.</span>
                  <Link href="/signup" className="text-primary font-bold hover:underline flex items-center gap-0.5">
                    Start setup <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* Section: Savings Calculator Simulator */}
        <section id="calculator" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-muted/30 relative">
          <div className="max-w-6xl mx-auto">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20 items-center">
              
              {/* Left Side info */}
              <div>
                <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-3 py-1 rounded-full tracking-wider">
                  Operational value
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-4 mb-6 leading-tight">
                  Quantify the time and cost you reclaim
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-8">
                  Financial administration shouldn't dominate your calendar. By replacing fragmented workflows, follow-up emails, tax withholding formulas, and bank reconciliations with Billy, you instantly claim back wasted days.
                </p>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Clock className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Eliminate Manual Bookkeeping</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Automatic invoice tracking saves business administrators from manually verifying ledgers and checking receipts.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                      <DollarSign className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Reduce Accounting Agencies Costs</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Auto-calculate payroll withholdings and tax compliance, lowering operational billing dependencies on CPA agencies.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side Calculator widget */}
              <div className="bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-xl">
                <h3 className="text-base font-bold text-foreground mb-1.5 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-primary" />
                  Savings Estimator
                </h3>
                <p className="text-xs text-muted-foreground mb-8">Adjust the sliders based on your business size.</p>
                
                <div className="space-y-8">
                  
                  {/* Slider 1 */}
                  <div className="space-y-3.5">
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
                    <div className="flex justify-between text-[9px] text-muted-foreground">
                      <span>1 member</span>
                      <span>100 members</span>
                    </div>
                  </div>

                  {/* Slider 2 */}
                  <div className="space-y-3.5">
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
                    <div className="flex justify-between text-[9px] text-muted-foreground">
                      <span>1 invoice</span>
                      <span>200 invoices</span>
                    </div>
                  </div>

                </div>

                <div className="h-px bg-border my-8"></div>

                {/* Calculation Outputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl">
                    <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-1">
                      Time Reclaimed
                    </div>
                    <div className="text-2xl font-black text-primary">
                      {monthlyHoursSaved} hrs / mo
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-1">
                      ≈ {annualDaysSaved} full work days / yr
                    </div>
                  </div>

                  <div className="bg-accent/5 border border-accent/10 p-4 rounded-xl">
                    <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-1">
                      Annual Resource Savings
                    </div>
                    <div className="text-2xl font-black text-accent">
                      ${annualDollarsSaved.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-1">
                      Based on standard admin cost
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    href="/signup"
                    className="w-full inline-flex justify-center items-center gap-2 px-4 py-3 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/95 transition-colors shadow-md shadow-primary/15 text-xs"
                  >
                    Claim Your Saved Hours
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* Section: Simple & Fair Pricing */}
        <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-6xl mx-auto">
            
            {/* Title headers */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-3 py-1 rounded-full tracking-wider">
                Transparent options
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-4 mb-4">
                Sleek pricing. Tailored to your operations.
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Choose a plan built for your current billing needs. Upgrade, downgrade, or cancel at any time.
              </p>

              {/* Monthly / Annual Toggle */}
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

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
              
              {/* Card 1: Starter */}
              <div className="bg-card border border-border p-6 sm:p-8 rounded-2xl flex flex-col justify-between hover:border-muted-foreground/20 transition-all duration-300">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Freelance</span>
                  <h3 className="text-lg font-bold text-foreground mt-1">Starter Plan</h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-6">For single founders starting workflows.</p>
                  
                  <div className="mb-6">
                    <span className="text-3xl font-black text-foreground">$0</span>
                    <span className="text-xs text-muted-foreground"> / month</span>
                  </div>

                  <div className="h-px bg-border/60 mb-6"></div>

                  <ul className="space-y-3.5 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Up to 5 client invoices / month</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Manage up to 2 team members</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Basic reporting ledger</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-muted-foreground/45 line-through">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>Dedicated client portal access</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-muted-foreground/45 line-through">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>Direct bank payout automation</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8">
                  <Link
                    href="/signup"
                    className="w-full text-center py-2.5 rounded-xl text-xs font-semibold border border-border text-foreground hover:bg-muted block transition-colors"
                  >
                    Start Free
                  </Link>
                </div>
              </div>

              {/* Card 2: Growth (Popular) */}
              <div className="bg-card border-2 border-primary p-6 sm:p-8 rounded-2xl flex flex-col justify-between relative hover:scale-[1.01] transition-all duration-300 shadow-xl shadow-primary/5">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                  Recommended
                </span>

                <div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Scaling Teams</span>
                  <h3 className="text-lg font-bold text-foreground mt-1">Growth Plan</h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-6">Best for growing business layouts.</p>
                  
                  <div className="mb-6">
                    <span className="text-3xl font-black text-foreground">
                      ${isMonthly ? "29" : "23"}
                    </span>
                    <span className="text-xs text-muted-foreground"> / month</span>
                    {!isMonthly && <p className="text-[9px] text-accent font-semibold mt-1">Billed annually (${23 * 12}/yr)</p>}
                  </div>

                  <div className="h-px bg-border/60 mb-6"></div>

                  <ul className="space-y-3.5 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="font-bold text-foreground">Unlimited invoices & clients</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Manage up to 25 team members</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Dedicated self-serve client portals</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>One-click automated payroll payouts</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Federal & state tax withholdings</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8">
                  <Link
                    href="/signup"
                    className="w-full text-center py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/95 block transition-colors shadow-md shadow-primary/10"
                  >
                    Start 14-Day Free Trial
                  </Link>
                </div>
              </div>

              {/* Card 3: Enterprise */}
              <div className="bg-card border border-border p-6 sm:p-8 rounded-2xl flex flex-col justify-between hover:border-muted-foreground/20 transition-all duration-300">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Corp</span>
                  <h3 className="text-lg font-bold text-foreground mt-1">Enterprise Plan</h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-6">For large business scales with custom compliance.</p>
                  
                  <div className="mb-6">
                    <span className="text-3xl font-black text-foreground">
                      ${isMonthly ? "99" : "79"}
                    </span>
                    <span className="text-xs text-muted-foreground"> / month</span>
                    {!isMonthly && <p className="text-[9px] text-accent font-semibold mt-1">Billed annually (${79 * 12}/yr)</p>}
                  </div>

                  <div className="h-px bg-border/60 mb-6"></div>

                  <ul className="space-y-3.5 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="font-semibold text-foreground">Unlimited invoices, team, & clients</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Custom API access & webhook triggers</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Contractor signing & W-8/W-9 audit logs</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Priority dedicated support manager</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Custom invoice terms & corporate branding</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8">
                  <Link
                    href="/signup"
                    className="w-full text-center py-2.5 rounded-xl text-xs font-semibold border border-border text-foreground hover:bg-muted block transition-colors"
                  >
                    Contact Enterprise
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* Section: Frequently Asked Questions */}
        <section id="faq" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-muted/20 relative">
          <div className="max-w-4xl mx-auto">
            
            {/* Header segment */}
            <div className="text-center mb-16">
              <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-3 py-1 rounded-full tracking-wider">
                Support desk
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-4 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                Got questions about the billing logic or tax filings? We've got standard answers compiled below.
              </p>
            </div>

            {/* Accordion Layout */}
            <div className="space-y-4 max-w-3xl mx-auto">
              
              {[
                {
                  question: "How secure is the client transaction infrastructure?",
                  answer: "We use bank-level encryption (AES-256) for all invoice databases and document storage. Payment settlement processes are handled via secure partners PCI-DSS compliant. We never directly store credit card details or bank logins on our server files."
                },
                {
                  question: "Can I automatically onboard new contractors and track documents?",
                  answer: "Yes! Billy has a full contractor portal module. When adding a contractor, you can auto-send a signature agreement link. They can securely upload W-9/W-8 forms. Billy checks files for compliance tags and saves documents in your dashboard folders."
                },
                {
                  question: "How are national and state tax withholdings calculated for payroll?",
                  answer: "Billy automatically references the latest tax tables based on the business address and employee location details. We auto-withhold relevant income taxes, calculate FICA deductions, compile pay slips, and queue federal filings."
                },
                {
                  question: "Do you integrate with my existing accounting ledger like QuickBooks?",
                  answer: "Absolutely. Billy supports automatic transaction export files in CSV/Excel and direct sync connections with popular accounting tools. You can export complete billing registries, tax summaries, and payroll details in one click."
                },
                {
                  question: "What is your refund policy if I cancel my subscription?",
                  answer: "Billy operates month-to-month. If you decide to cancel, your access transitions to the Starter plan on the next billing date. You can export all invoice databases, contractor agreements, and tax slips beforehand without fee penalties."
                }
              ].map((faqItem, index) => (
                <div
                  key={index}
                  className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-300"
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

        {/* Section: Centered Final Call-To-Action Banner */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-5xl mx-auto bg-gradient-to-tr from-primary to-indigo-700 rounded-3xl p-8 sm:p-14 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/10">
            {/* Absolute design decorations */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff07_1px,transparent_1px),linear-gradient(to_bottom,#ffffff07_1px,transparent_1px)] bg-[size:16px_16px]"></div>
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-accent/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-5 max-w-2xl leading-tight">
                Get your company operations on autopilot today
              </h2>
              <p className="text-sm sm:text-base text-indigo-100 max-w-2xl mb-8 leading-relaxed">
                Take less than 10 minutes to sync your bank ledger, invite employees, and issue smart automated billing. Discover invoicing simplicity.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
                <Link
                  href="/signup"
                  className="px-7 py-3.5 bg-white text-primary hover:bg-indigo-50 font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 text-xs flex items-center justify-center gap-2"
                >
                  Start For Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="px-7 py-3.5 bg-primary-foreground/10 text-white hover:bg-primary-foreground/20 border border-white/20 rounded-xl font-bold transition-all transform hover:-translate-y-0.5 text-xs"
                >
                  Speak With Sales
                </Link>
              </div>

              <div className="flex items-center gap-6 mt-8 text-[10px] text-indigo-200">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-accent" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-accent" />
                  <span>14-day trial of Pro tools</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-accent" />
                  <span>Instant self-onboarding</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border/80 pt-14 pb-10 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            
            {/* Column 1: Billy Brand info */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
                  <span className="text-white font-extrabold text-sm">B</span>
                </div>
                <span className="text-lg font-bold tracking-tight text-foreground">
                  Billy
                </span>
              </div>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                Billy is the automated financial and payroll platform built specifically to help modern startups and digital agencies scale their client billing and contractor compliance without admin stress.
              </p>
              <div className="text-[10px] text-muted-foreground">
                © {new Date().getFullYear()} Billy Technologies Inc. All rights reserved.
              </div>
            </div>

            {/* Column 2: Product */}
            <div>
              <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-3.5">Product</h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => scrollToSection("features")} className="text-muted-foreground hover:text-foreground cursor-pointer text-left">Smart Invoices</button></li>
                <li><button onClick={() => scrollToSection("features")} className="text-muted-foreground hover:text-foreground cursor-pointer text-left">Payroll Compliance</button></li>
                <li><button onClick={() => scrollToSection("features")} className="text-muted-foreground hover:text-foreground cursor-pointer text-left">Client Portals</button></li>
                <li><button onClick={() => scrollToSection("features")} className="text-muted-foreground hover:text-foreground cursor-pointer text-left">Tax Withholding</button></li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div>
              <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-3.5">Tools</h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => scrollToSection("calculator")} className="text-muted-foreground hover:text-foreground cursor-pointer text-left">Savings Calculator</button></li>
                <li><button onClick={() => scrollToSection("pricing")} className="text-muted-foreground hover:text-foreground cursor-pointer text-left">Pricing Models</button></li>
                <li><button onClick={() => scrollToSection("faq")} className="text-muted-foreground hover:text-foreground cursor-pointer text-left">FAQ Help</button></li>
                <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Rules</Link></li>
              </ul>
            </div>

            {/* Column 4: Company */}
            <div>
              <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-3.5">Company</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About Us</Link></li>
                <li><Link href="/careers" className="text-muted-foreground hover:text-foreground">Careers</Link></li>
                <li><Link href="/press" className="text-muted-foreground hover:text-foreground">Press Kit</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact Sales</Link></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-border/60 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[10px] text-muted-foreground">
              Designed with premium Next-Gen visual aesthetics. Developed with Next.js, Clerk, and Tailwind CSS.
            </p>
            <div className="flex gap-4">
              <Link href="https://twitter.com" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
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
