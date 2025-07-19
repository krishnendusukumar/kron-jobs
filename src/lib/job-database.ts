import { supabase } from './supabase';

interface JobCard {
    title: string;
    company: string;
    location: string;
    date: string;
    job_url: string;
    job_description?: string;
    applied?: number;
    hidden?: number;
    interview?: number;
    rejected?: number;
}

export async function saveJobsToDatabase(userId: string, jobs: JobCard[]) {
    if (!jobs.length) {
        console.log("⛔ No jobs to insert.");
        return 0;
    }

    const jobsToInsert = jobs.map((job) => ({
        ...job,
        user_id: userId,
        applied: job.applied ?? 0,
        hidden: job.hidden ?? 0,
        interview: job.interview ?? 0,
        rejected: job.rejected ?? 0,
        // Ensure job_description is not empty
        job_description: job.job_description || `Job at ${job.company} - ${job.title}`,
    }));

    console.log(`💾 Attempting to upsert ${jobsToInsert.length} jobs for user: ${userId}`);
    console.log("📋 Sample job to save:", {
        title: jobsToInsert[0].title,
        company: jobsToInsert[0].company,
        location: jobsToInsert[0].location,
        job_url: jobsToInsert[0].job_url?.substring(0, 50) + '...'
    });

    // Try upsert with the new composite constraint
    const { data, error } = await supabase
        .from("jobs")
        .upsert(jobsToInsert, {
            onConflict: "job_url,user_id", // Use the new composite constraint
        })
        .select();

    if (error) {
        console.error("❌ Supabase upsert error:", error);
        
        // Fallback: try individual inserts if upsert fails
        console.log("🔄 Falling back to individual inserts...");
        let savedCount = 0;
        for (const job of jobsToInsert) {
            const { error: insertError } = await supabase
                .from("jobs")
                .insert(job);
            
            if (insertError) {
                if (insertError.code === '23505') {
                    console.log(`⏭️ Job already exists: ${job.title} at ${job.company}`);
                } else {
                    console.error(`❌ Error inserting job ${job.title}:`, insertError);
                }
            } else {
                console.log(`✅ Saved job: ${job.title} at ${job.company}`);
                savedCount++;
            }
        }
        return savedCount;
    }

    console.log(`✅ Database operation completed. Jobs inserted/updated: ${data?.length}`);
    return data?.length || 0;
} 