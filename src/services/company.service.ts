import { connectDB } from "@/lib/db";
import { Company, ICompany } from "@/models/Company";

/**
 * Updates a company's details by their Clerk ID.
 * @param clerkId The Clerk User ID associated with the company account.
 * @param data Partial fields of Company to update.
 */
export async function updateCompany(
  clerkId: string,
  data: Partial<ICompany>
): Promise<ICompany | null> {
  await connectDB();
  return Company.findOneAndUpdate(
    { clerkId },
    { $set: data },
    { new: true, runValidators: true }
  );
}
