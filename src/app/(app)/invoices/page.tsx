import Link from "next/link";

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Invoices</h1>
          <p className="text-muted-foreground text-sm">
            Create, track, and manage billing invoices for your clients.
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="px-4 py-2 bg-primary text-primary-foreground font-medium text-sm rounded-lg hover:bg-primary/95 transition-colors"
        >
          Create Invoice
        </Link>
      </div>
      <div className="border border-border rounded-lg bg-card p-12 text-center">
        <p className="text-muted-foreground text-sm">No invoices found. Generate your first invoice to bill a client.</p>
      </div>
    </div>
  );
}
