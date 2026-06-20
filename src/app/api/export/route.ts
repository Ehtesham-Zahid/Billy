import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: "Export endpoint placeholder. Returns CSV/XLSX data sheets containing payroll or invoicing logs.",
  });
}
