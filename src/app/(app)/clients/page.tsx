export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Clients</h1>
          <p className="text-muted-foreground text-sm">
            Manage your client directory, contact information, and billing history.
          </p>
        </div>
      </div>
      <div className="border border-border rounded-lg bg-card p-12 text-center">
        <p className="text-muted-foreground text-sm">No clients found. Add your first client to get started.</p>
      </div>
    </div>
  );
}
