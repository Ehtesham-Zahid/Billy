export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Welcome to your Billy dashboard. Monitor billing and payroll metrics here.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder cards */}
        <div className="p-6 bg-card border border-border rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Total Invoiced</h3>
          <p className="text-2xl font-bold text-foreground mt-2 font-mono tabular-nums">$0.00</p>
        </div>
        <div className="p-6 bg-card border border-border rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Outstanding Invoices</h3>
          <p className="text-2xl font-bold text-foreground mt-2 font-mono tabular-nums">$0.00</p>
        </div>
        <div className="p-6 bg-card border border-border rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Active Employees</h3>
          <p className="text-2xl font-bold text-foreground mt-2 font-mono tabular-nums">0</p>
        </div>
        <div className="p-6 bg-card border border-border rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Payroll Month</h3>
          <p className="text-2xl font-bold text-foreground mt-2 font-mono tabular-nums">$0.00</p>
        </div>
      </div>
    </div>
  );
}
