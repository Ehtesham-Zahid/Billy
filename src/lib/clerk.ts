import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { Company } from "@/models/Company";
import { Employee } from "@/models/Employee";

export async function getCurrentUserRole() {
  const { userId } = await auth();
  if (!userId) {
    return "new_user";
  }

  await connectDB();

  // Check Company table
  const company = await Company.findOne({ clerkId: userId });
  if (company) {
    return company.accountType || "company"; // "company" or "platform_admin"
  }

  // Check Employee table
  const employee = await Employee.findOne({ clerkUserId: userId });
  if (employee) {
    return "employee";
  }

  return "new_user";
}

export async function getCompanyForUser() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  await connectDB();

  // Block employees from lazy-creating/accessing company accounts
  const employee = await Employee.findOne({ clerkUserId: userId });
  if (employee) {
    throw new Error("Unauthorized: Employees cannot access company accounts");
  }

  // Try to find the company first. If it exists, return it immediately to avoid calling currentUser() API.
  let company = await Company.findOne({ clerkId: userId });
  if (company) {
    const { sessionClaims } = await auth();
    const currentRole = (sessionClaims?.publicMetadata as any)?.role;
    const targetRole = company.accountType || "company";

    // Sync role if missing or different from database definition
    if (currentRole !== targetRole) {
      try {
        const client = await clerkClient();
        await client.users.updateUserMetadata(userId, {
          publicMetadata: {
            role: targetRole,
          },
        });
      } catch (err) {
        console.error("Failed to sync Clerk publicMetadata for existing company:", err);
      }
    }
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

  // Set role in Clerk's publicMetadata for edge-compatible access
  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: company.accountType || "company",
      },
    });
  } catch (err) {
    console.error("Failed to set Clerk publicMetadata for company", err);
  }

  return company;
}

