import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { Company } from "@/models/Company";

export async function POST(req: Request) {
  // Get webhook signing secret
  const WEBHOOK_SECRET = process.env.SIGNING_SECRET || process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
    return new Response("Error: Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local", {
      status: 500,
    });
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify signature
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook signature:", err);
    return new Response("Error: Verification failed", {
      status: 400,
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  await connectDB();

  try {
    if (eventType === "user.created" || eventType === "user.updated") {
      const data = evt.data;
      const email = data.email_addresses?.[0]?.email_address || "";
      const firstName = data.first_name || "";
      const lastName = data.last_name || "";
      const name = `${firstName} ${lastName}`.trim() || email.split("@")[0] || "New Company";

      // Sync company profile with Clerk User id
      await Company.findOneAndUpdate(
        { clerkId: id },
        {
          clerkId: id,
          name,
          email,
        },
        { upsert: true, new: true }
      );
      console.log(`Company sync success for clerkId: ${id}`);
    } else if (eventType === "user.deleted") {
      await Company.findOneAndDelete({ clerkId: id });
      console.log(`Company deleted for clerkId: ${id}`);
    }

    return new Response("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("Error updating database during webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
