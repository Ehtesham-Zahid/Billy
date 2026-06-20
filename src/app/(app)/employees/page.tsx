export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Employees</h1>
          <p className="text-muted-foreground text-sm">
            Manage your employee list, roles, and salary configurations.
          </p>
        </div>
      </div>
      <div className="border border-border rounded-lg bg-card p-12 text-center">
        <p className="text-muted-foreground text-sm">No employees found. Add your first employee to start payroll tracking.</p>
      </div>
    </div>
  );
}
