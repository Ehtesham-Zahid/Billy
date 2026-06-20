export default function PayrollPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Payroll</h1>
          <p className="text-muted-foreground text-sm">
            Process monthly payroll sheets, calculate deductions, and generate pay slips.
          </p>
        </div>
      </div>
      <div className="border border-border rounded-lg bg-card p-12 text-center">
        <p className="text-muted-foreground text-sm">No payroll entries found. Process a new payroll sheet to get started.</p>
      </div>
    </div>
  );
}
