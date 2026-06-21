import { auth, currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { Company } from "@/models/Company";

export async function getCompanyForUser() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  await connectDB();

  // Try to find the company first. If it exists, return it immediately to avoid calling currentUser() API.
  let company = await Company.findOne({ clerkId: userId });
  if (company) {
    return company;
  }

  // If not found, call currentUser() to get profile details for creation
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const email = user.emailAddresses?.[0]?.emailAddress || "";
  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || email.split("@")[0] || "My Company";

  // Perform atomic upsert with setOnInsert
  company = await Company.findOneAndUpdate(
    { clerkId: userId },
    {
      $setOnInsert: {
        clerkId: userId,
        name,
        email,
        accountType: "company",
      },
    },
    { upsert: true, new: true }
  );

  return company;
}
