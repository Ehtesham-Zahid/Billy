import { connectDB } from "@/lib/db";
import { Employee } from "@/models/Employee";
import { Company } from "@/models/Company";
import { auth, currentUser } from "@clerk/nextjs/server";
import { SignUp, SignOutButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

interface PageProps {
  params: Promise<{ inviteToken: string }>;
}

export default async function InvitePage({ params }: PageProps) {
  const { inviteToken } = await params;
  const { userId, sessionClaims } = await auth();
  const user = userId ? await currentUser() : null;

  await connectDB();
  const employee = await Employee.findOne({ inviteToken });

  // 1. Check if token is invalid or employee already linked
  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background text-foreground">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-xl text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Invalid Invitation</h2>
            <p className="text-muted-foreground text-sm">
              This invitation link is invalid, expired, or has already been used. Please contact your company administrator for a new invite.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center px-4 py-2.5 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-colors shadow-sm"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const company = await Company.findById(employee.companyId);
  const companyName = company ? company.name : "their company";

  // 2. If the user is logged in, perform security checks before linking
  if (userId) {
    // Check Case A: Already linked to THIS employee (re-clicking their own link)
    if (employee.clerkUserId === userId) {
      redirect("/my");
    }

    // Check Case B: Already linked to a DIFFERENT employee profile
    const existingEmployee = await Employee.findOne({ clerkUserId: userId });
    if (existingEmployee) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background text-foreground">
          <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-xl text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Account Conflict</h2>
              <p className="text-muted-foreground text-sm">
                You are currently signed in as <span className="font-semibold text-foreground">{existingEmployee.firstName} {existingEmployee.lastName}</span>.
              </p>
              <p className="text-muted-foreground text-sm">
                You are already linked to a different employee account. Sign out to accept this invite instead.
              </p>
            </div>
            <SignOutButton signOutOptions={{ redirectUrl: `/invite/${inviteToken}` }}>
              <button className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-colors shadow-sm cursor-pointer">
                Sign Out & Accept Invite
              </button>
            </SignOutButton>
          </div>
        </div>
      );
    }

    // Check Case C: Logged in as a Company or Platform Admin
    const existingCompany = await Company.findOne({ clerkId: userId });
    const role = (sessionClaims?.publicMetadata as any)?.role;
    if (existingCompany || role === "company" || role === "platform_admin") {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background text-foreground">
          <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-xl text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Account Conflict</h2>
              <p className="text-muted-foreground text-sm">
                You are currently signed in with a company account. To accept this employee invite, please sign out first.
              </p>
            </div>
            <SignOutButton signOutOptions={{ redirectUrl: `/invite/${inviteToken}` }}>
              <button className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-colors shadow-sm cursor-pointer">
                Sign Out & Accept Invite
              </button>
            </SignOutButton>
          </div>
        </div>
      );
    }

    // Check Case D: Email Mismatch
    const hasEmailMatch = user?.emailAddresses.some(
      (e) => e.emailAddress.toLowerCase() === employee.email.toLowerCase()
    );
    if (!hasEmailMatch) {
      const loggedInEmail = user?.emailAddresses[0]?.emailAddress || "your current account";
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background text-foreground">
          <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-xl text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Email Mismatch</h2>
              <p className="text-muted-foreground text-sm">
                This invitation was sent to <span className="font-semibold text-foreground">{employee.email}</span>, but you are signed in as <span className="font-semibold text-foreground">{loggedInEmail}</span>.
              </p>
              <p className="text-muted-foreground text-sm">
                Please sign out and accept this invite using the correct email address.
              </p>
            </div>
            <SignOutButton signOutOptions={{ redirectUrl: `/invite/${inviteToken}` }}>
              <button className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-colors shadow-sm cursor-pointer">
                Sign Out & Accept Invite
              </button>
            </SignOutButton>
          </div>
        </div>
      );
    }

    // 3. Perform linking atomically
    const linkedEmployee = await Employee.findOneAndUpdate(
      { inviteToken, clerkUserId: { $exists: false } },
      { $set: { clerkUserId: userId }, $unset: { inviteToken: "" } },
      { returnDocument: "after" }
    );

    if (!linkedEmployee) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background text-foreground">
          <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-xl text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Invalid Invitation</h2>
              <p className="text-muted-foreground text-sm">
                This invitation has already been accepted or is no longer available.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center px-4 py-2.5 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-colors shadow-sm"
            >
              Go to Home
            </Link>
          </div>
        </div>
      );
    }

    // Linking complete. Redirect to /my immediately.
    // Clerk role metadata is synced separately via /api/sync-role
    // called from the employee portal, to avoid triggering
    // invalidateCacheAction() in a Server Component context.
    redirect("/my");
  }

  // 4. If the user is not logged in, render the Clerk SignUp component
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background space-y-8 text-foreground">
      <div className="text-center space-y-2 max-w-sm">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">Join Billy</h1>
        <p className="text-muted-foreground text-sm">
          Create your account to accept your employee invitation from <span className="font-semibold text-foreground">{companyName}</span>.
        </p>
      </div>
      <div className="shadow-2xl rounded-2xl overflow-hidden border border-border">
        <SignUp
          routing="hash"
          fallbackRedirectUrl={`/invite/${inviteToken}`}
          initialValues={{
            emailAddress: employee.email,
          }}
        />
      </div>
    </div>
  );
}
