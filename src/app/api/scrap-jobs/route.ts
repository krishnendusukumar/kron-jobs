import { NextResponse } from "next/server";
import { scrapeAndSaveJobs } from "@/lib/linkedin-scraper";
import { supabase } from "@/lib/supabase";

export async function GET() {
    try {
        console.log("********************************************************API route called******************************************************************");

        const { data: users, error: supabaseError } = await supabase.from("job_preferences").select("*");

        if (supabaseError) {
            console.error("Supabase error:", supabaseError);
            return NextResponse.json({ error: supabaseError.message }, { status: 500 });
        }

        console.log("Users found:", users?.length || 0);

        const results = [];

        for (const user of users || []) {
            console.log("Processing user:", user.email);
            try {
                const jobs = await scrapeAndSaveJobs({
                    keywords: `${user.job_title} ${user.keywords}`,
                    location: user.location,
                    f_WT: "2", // Remote work preference
                    timespan: "r86400" // Last 24 hours
                }, user.email);

                console.log("Jobs found for user:", jobs?.length || 0);
                results.push({ user: user.email, jobs });
            }
            catch (scrapingError: any) {
                console.error("Scraping error for user:", user.email, scrapingError);
                results.push({ user: user.email, jobs: [], error: scrapingError.message });
            }
        }

        console.log("Final results:", results);
        return NextResponse.json({ results });
    } catch (error: any) {
        console.error("API route error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
