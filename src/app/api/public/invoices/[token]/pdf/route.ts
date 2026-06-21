export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getInvoiceByTokenForPdf } from "@/services/invoice.service";
import { renderToStream } from "@react-pdf/renderer";
import React from "react";
import { InvoicePDFTemplate } from "@/features/invoices/templates/InvoicePDFTemplate";
import { isInvoicePublicViewable } from "@/features/invoices/lib/invoiceUtils";

interface RouteProps {
  params: Promise<{ token: string }>;
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const { token } = await params;
    
    const invoice = await getInvoiceByTokenForPdf(token);

    // Block access if invoice does not exist or status does not allow public viewing
    if (!invoice || !isInvoicePublicViewable(invoice.status)) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const stream = await renderToStream(
      React.createElement(InvoicePDFTemplate, { invoice }) as any
    );

    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("GET /api/public/invoices/[token]/pdf error:", error);
    return NextResponse.json(
      { error: "Internal Server Error during PDF rendering" },
      { status: 500 }
    );
  }
}
