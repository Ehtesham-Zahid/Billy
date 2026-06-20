import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4 text-primary">
        Billy
      </h1>
      <p className="max-w-md text-center text-muted-foreground mb-8">
        Smart Invoice & Payroll Management Platform for small and medium businesses.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/95 transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-2 rounded-lg font-medium border border-border bg-card hover:bg-muted transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
