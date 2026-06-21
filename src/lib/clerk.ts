import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { Company } from "@/models/Company";

export async function getCompanyForUser() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  await connectDB();
  const company = await Company.findOne({ clerkId: userId });
  if (!company) {
    throw new Error("CompanyNotFound");
  }

  return company;
}
