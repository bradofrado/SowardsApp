import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isCronRoute = createRouteMatcher(["/api/cron"]);

export default clerkMiddleware((auth, req) => {
  if (!isCronRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
