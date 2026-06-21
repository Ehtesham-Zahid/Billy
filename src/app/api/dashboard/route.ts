import { NextRequest, NextResponse } from "next/server";
import { getCompanyForUser } from "@/lib/clerk";
import { getDashboardData } from "@/services/dashboard.service";

export async function GET(req: NextRequest) {
  try {
    const company = await getCompanyForUser();
    
    const { searchParams } = new URL(req.url);
    const periodParam = searchParams.get("period") || "all";
    
    // Validate period
    if (periodParam !== "all" && periodParam !== "month" && periodParam !== "30days") {
      return NextResponse.json({ error: "Invalid period parameter" }, { status: 400 });
    }
    
    const period = periodParam as "all" | "month" | "30days";
    const data = await getDashboardData(company._id as string, period);
    
    return NextResponse.json(data);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
