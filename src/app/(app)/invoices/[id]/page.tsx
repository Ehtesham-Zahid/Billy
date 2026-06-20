interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Invoice Details</h1>
        <p className="text-muted-foreground text-sm">
          Detailed view and management actions for invoice: <span className="font-mono">{id}</span>
        </p>
      </div>
      <div className="border border-border rounded-lg bg-card p-8">
        <p className="text-muted-foreground text-sm">Invoice details and action control panel placeholder.</p>
      </div>
    </div>
  );
}
