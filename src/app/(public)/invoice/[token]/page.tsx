interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function PublicInvoicePage({ params }: PageProps) {
  const { token } = await params;
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background text-foreground">
      <div className="max-w-md w-full p-8 border border-border rounded-lg bg-card shadow-sm text-center">
        <h1 className="text-2xl font-bold mb-4 text-primary">Invoice Shared View</h1>
        <p className="text-muted-foreground mb-6">
          This is a public, secure shared view for invoice:
        </p>
        <code className="px-3 py-1.5 bg-muted rounded font-mono text-sm block mb-4 border border-border">
          {token}
        </code>
      </div>
    </div>
  );
}
