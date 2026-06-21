"use client";
import { useEffect } from "react";

/**
 * Silently syncs the Clerk employee role metadata via a Route Handler.
 * This component mounts once after the employee portal loads and fires a
 * POST to /api/sync-role.
 *
 * Why a Route Handler instead of doing it in a Server Component?
 * → Calling clerkClient().users.updateUserMetadata() inside a Server Component
 *   triggers Clerk's invalidateCacheAction() which broadcasts a session refresh
 *   to the client mid-render, causing infinite reload loops.
 * → Route Handlers are plain HTTP endpoints — they have no connection to
 *   React's rendering pipeline, so no cache invalidation is broadcast.
 */
export default function RoleSyncer() {
  useEffect(() => {
    fetch("/api/sync-role", { method: "POST" }).catch(() => {
      // Silently ignore — the AppLayout DB check covers routing even without metadata
    });
  }, []);

  return null;
}
