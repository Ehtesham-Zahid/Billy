import { connectDB } from "@/lib/db";
import { Employee } from "@/models/Employee";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { SignUp } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

interface PageProps {
  params: Promise<{ inviteToken: string }>;
}

export default async function InvitePage({ params }: PageProps) {
  const { inviteToken } = await params;
  const { userId } = await auth();

  await connectDB();
  const employee = await Employee.findOne({ inviteToken });

  // 1. Check if token is invalid or employee already linked
  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
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
            className="inline-flex w-full items-center justify-center px-4 py-2.5 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // 2. If the user is not logged in, render the Clerk SignUp component
  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background space-y-8">
        <div className="text-center space-y-2 max-w-sm">
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">Join Billy</h1>
          <p className="text-muted-foreground text-sm">
            Create your account to accept your employee invitation from <span className="font-semibold text-foreground">{employee.firstName} {employee.lastName}</span>.
          </p>
        </div>
        <div className="shadow-2xl rounded-2xl overflow-hidden border border-border">
          <SignUp
            routing="hash"
            fallbackRedirectUrl={`/invite/${inviteToken}`}
          />
        </div>
      </div>
    );
  }

  // 3. User is logged in, perform the linking
  // Link the employee clerkUserId, clear the invite token atomically to prevent race conditions
  const linkedEmployee = await Employee.findOneAndUpdate(
    { inviteToken, clerkUserId: { $exists: false } },
    { $set: { clerkUserId: userId }, $unset: { inviteToken: "" } },
    { new: true }
  );

  if (!linkedEmployee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
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
            className="inline-flex w-full items-center justify-center px-4 py-2.5 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // Set role in Clerk's publicMetadata using Clerk backend API
  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "employee",
      },
    });
  } catch (error) {
    console.error("Failed to update Clerk user metadata to employee:", error);
  }

  // Redirect to `/my` employee portal
  redirect("/my");
}
