import { SignUp } from "@clerk/nextjs";

export default function SignupPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background p-4 space-y-6">
      <div className="shadow-2xl rounded-2xl overflow-hidden border border-border">
        <SignUp routing="path" path="/signup" signInUrl="/login" />
      </div>
      <div className="max-w-sm text-center bg-card border border-border p-4 rounded-xl shadow-sm">
        <p className="text-xs text-muted-foreground font-sans">
          <strong>Notice:</strong> Creating an account here registers a new <span className="font-semibold text-foreground">Company</span> profile.
          If you are an employee, please ask your company administrator to email you an invitation link—you do not need to sign up here.
        </p>
      </div>
    </div>
  );
}
