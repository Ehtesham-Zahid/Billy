interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PayrollDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Payroll Slips</h1>
        <p className="text-muted-foreground text-sm">
          Detailed payslip metrics and options for payroll entry: <span className="font-mono">{id}</span>
        </p>
      </div>
      <div className="border border-border rounded-lg bg-card p-8">
        <p className="text-muted-foreground text-sm">Detailed payslip breakdown and printing options placeholder.</p>
      </div>
    </div>
  );
}
