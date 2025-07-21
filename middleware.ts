import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
    // Public routes that don't require authentication
    publicRoutes: [
        "/",
        "/api/clerk-webhook",
        "/api/jobs(.*)",
        "/api/start-scraping(.*)",
        "/api/load-more-jobs(.*)",
        "/api/scraping-status(.*)",
        "/api/submit-preferences(.*)",
        "/api/job-stats(.*)",
        "/api/proxy-stats(.*)",
        "/api/test-proxy(.*)",
        "/api/debug-jobs(.*)",
        "/api/request-scraping(.*)",
        "/api/scraping-status(.*)",
        "/api/cron/scrape-jobs(.*)",
    ],

    // Routes that are always accessible to signed-in users
    ignoredRoutes: [
        "/api/clerk-webhook",
    ],
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 