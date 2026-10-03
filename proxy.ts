import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/choose-organization(.*)",
  "/api/inngest(.*)",
])

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId } = await auth()

  // Redirect authenticated users from landing page to workflows
  if (userId && req.nextUrl.pathname === "/") {
    // If user has an org, go to workflows; otherwise go to choose-organization
    const redirectUrl = orgId ? "/workflows" : "/choose-organization"
    return NextResponse.redirect(new URL(redirectUrl, req.url))
  }

  // Protect non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect()

    // Require organization membership for protected routes
    if (!orgId) {
      return NextResponse.redirect(new URL("/choose-organization", req.url))
    }
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
