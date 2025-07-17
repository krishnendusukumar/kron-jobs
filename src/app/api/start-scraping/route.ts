import { NextResponse } from "next/server";
import { jobProcessor } from "@/lib/job-processor";
import { supabase } from "@/lib/supabase";
import { scrapeAndSaveJobs } from '@/lib/linkedin-scraper';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // Get user preferences
        const { data: userPrefs, error: prefError } = await supabase
            .from("job_preferences")
            .select("*")
            .eq("email", userId)
            .single();

        if (prefError || !userPrefs) {
            return NextResponse.json({ error: "User preferences not found" }, { status: 404 });
        }

        // Add scraping task to queue
        const taskId = await jobProcessor.addTask({
            userId: userId,
            keywords: `${userPrefs.job_title} ${userPrefs.keywords}`,
            location: userPrefs.location,
            f_WT: "2", // Remote work preference
            timespan: "r86400" // Last 24 hours
        });

        console.log(`Added scraping task ${taskId} for user ${userId}`);

        // Directly call the scraping logic (for now, for debugging)
        const jobs = await scrapeAndSaveJobs({
            keywords: `${userPrefs.job_title} ${userPrefs.keywords}`,
            location: userPrefs.location,
            f_WT: "2",
            timespan: "r86400"
        }, userId);

        return NextResponse.json({
            success: true,
            taskId,
            jobs, // Return jobs for debugging
            message: "Scraping task added to queue and jobs scraped."
        });

    } catch (error: any) {
        console.error("Error starting scraping:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const taskId = searchParams.get('taskId');

        const userId = searchParams.get('userId');

        if (taskId) {
            // Get specific task status
            const task = await jobProcessor.getTaskStatus(taskId);
            if (!task) {
                return NextResponse.json({ error: "Task not found" }, { status: 404 });
            }
            return NextResponse.json({ task });
        }

        if (userId) {
            // Get all tasks for user
            const tasks = await jobProcessor.getUserTasks(userId);
            console.log('Start-scraping API tasks result:', { tasks, userId });
            return NextResponse.json({ tasks });
        }

        // Get queue status
        const queueStatus = jobProcessor.getQueueStatus();
        return NextResponse.json({ queueStatus });

    } catch (error: any) {
        console.error("Error getting task status:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 