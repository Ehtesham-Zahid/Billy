import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { Employee } from "@/models/Employee";

// Route Handler — NOT a Server Component.
// Calling clerkClient here does NOT trigger Clerk's invalidateCacheAction()
// broadcast to the client, so it is safe to await updateUserMetadata here
// without causing infinite reload loops on the browser.
export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const employee = await Employee.findOne({ clerkUserId: userId });
  if (!employee) {
    return NextResponse.json({ error: "Not an employee" }, { status: 403 });
  }

  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: "employee" },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to sync employee role metadata:", err);
    return NextResponse.json({ error: "Failed to sync role" }, { status: 500 });
  }
}
