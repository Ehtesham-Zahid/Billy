import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/clients(.*)",
  "/invoices(.*)",
  "/employees(.*)",
  "/payroll(.*)",
  "/templates(.*)",
  "/settings(.*)",
  "/my(.*)",
  "/admin(.*)",
  "/api/clients(.*)",
  "/api/invoices(.*)",
  "/api/employees(.*)",
  "/api/payroll(.*)",
  "/api/templates(.*)",
  "/api/admin(.*)",
]);

const isCompanyRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/clients(.*)",
  "/invoices(.*)",
  "/employees(.*)",
  "/payroll(.*)",
  "/templates(.*)",
  "/settings(.*)",
]);

const isCompanyApiRoute = createRouteMatcher([
  "/api/clients(.*)",
  "/api/invoices(.*)",
  "/api/employees(.*)",
  "/api/payroll(.*)",
  "/api/templates(.*)",
]);

const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
  "/api/admin(.*)",
]);

const isEmployeeRoute = createRouteMatcher([
  "/my(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);

  if (isProtectedRoute(req)) {
    if (!userId) {
      await auth.protect();
      return;
    }

    const role = (sessionClaims?.publicMetadata as any)?.role;

    // 1. Employee Role Rules
    if (role === "employee") {
      // If trying to access company UI pages, redirect to /my
      if (isCompanyRoute(req) || isAdminRoute(req)) {
        return NextResponse.redirect(new URL("/my", req.url));
      }
      // If trying to access company API, block with 403
      if (isCompanyApiRoute(req) || req.nextUrl.pathname.startsWith("/api/admin")) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }

    // 2. Company Role Rules
    if (role === "company") {
      // If trying to access employee UI or admin UI, redirect to /dashboard
      if (isEmployeeRoute(req) || isAdminRoute(req)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      // If trying to access admin API, block with 403
      if (req.nextUrl.pathname.startsWith("/api/admin")) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }

    // 3. Platform Admin Role Rules
    if (role === "platform_admin") {
      // Only allow access to /admin and /api/admin. Redirect all other UI pages to /admin
      if (isCompanyRoute(req) || isEmployeeRoute(req)) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      // Block non-admin APIs
      if (isCompanyApiRoute(req)) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }

    // 4. Default / New User (no role set yet)
    if (!role) {
      // If they try to access /admin or /api/admin, block/redirect to dashboard
      if (isAdminRoute(req)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html|css|js(?!on)|jpeg|jpg|png|gif|svg|ttf|woff2?|ico|csv|docx|xlsx|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

