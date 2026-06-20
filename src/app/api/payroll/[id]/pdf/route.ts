import { NextRequest, NextResponse } from "next/server";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  const { id } = await params;

  return NextResponse.json({
    message: `PDF stream placeholder for payslip: ${id}. PDF rendering logic using @react-pdf/renderer will run on the standard Node.js serverless container.`,
  });
}
