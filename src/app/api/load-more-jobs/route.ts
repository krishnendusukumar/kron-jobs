import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { saveJobsToDatabase } from '@/lib/job-database';

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

const defaultConfig = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
        'Referer': 'https://www.linkedin.com/jobs/',
        'Origin': 'https://www.linkedin.com'
    },
    retries: 3,
    delay: 2000
};

const randomDelay = (min: number, max: number) => new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));

async function getWithRetry(url: string, retries: number = 3): Promise<string | null> {
    for (let i = 0; i < retries; i++) {
        try {
            const axiosConfig: any = {
                headers: defaultConfig.headers,
                timeout: 15000
            };
            const response = await axios.get(url, axiosConfig);
            if (response.status === 200) return response.data;
        } catch (error: any) {
            console.log(`Attempt ${i + 1} failed for ${url}:`, error.message);
            if (i < retries - 1) await randomDelay(defaultConfig.delay, defaultConfig.delay + 1000);
        }
    }
    return null;
}

function parseJobCards(html: string): JobCard[] {
    const $ = cheerio.load(html);
    const jobs: JobCard[] = [];

    console.log('🔍 Parsing job cards from HTML...');

    $('.job-search-card').each((index, el) => {
        const title = $(el).find('h3.base-search-card__title').text().trim();
        const company = $(el).find('h4.base-search-card__subtitle a').text().trim();
        const location = $(el).find('.job-search-card__location').text().trim();
        const date = $(el).find('time').attr('datetime') || '';
        const job_url = $(el).find('a.base-card__full-link').attr('href') || '';

        console.log(`📋 Job ${index + 1}:`, { title, company, location, job_url: job_url.substring(0, 50) + '...' });

        if (title && company && job_url) {
            jobs.push({
                title,
                company,
                location,
                date,
                job_url,
                applied: 0,
                hidden: 0,
                interview: 0,
                rejected: 0
            });
        } else {
            console.log(`⚠️ Skipping job ${index + 1} - missing required fields:`, { title: !!title, company: !!company, job_url: !!job_url });
        }
    });

    console.log(`✅ Parsed ${jobs.length} valid job cards`);
    return jobs;
}

function removeDuplicates(jobs: JobCard[]): JobCard[] {
    const seen = new Set();
    return jobs.filter(job => {
        const key = `${job.title}-${job.company}-${job.job_url}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}




export async function POST(req: NextRequest) {
    try {
        const { userId, keywords, location, start = 5, f_WT = '2', timespan = 'r86400' } = await req.json();

        if (!userId || !keywords || !location) {
            return NextResponse.json({
                success: false,
                error: 'userId, keywords, and location are required'
            }, { status: 400 });
        }

        console.log(`🔄 Loading more jobs for user: ${userId}, start: ${start}`);

        // Try the new queue system first, fall back to direct scraping if it fails
        try {
            const { JobService } = await import('@/lib/job-service');

            const result = await JobService.requestScraping({
                userId,
                keywords,
                location,
                f_WT,
                timespan,
                start,
            });

            // Check if we should allow more loads (up to 10 times: start=5,10,15,20,25,30,35,40,45,50)
            const maxStart = 50; // 10 loads * 5 increment = 50
            const hasMore = start < maxStart;

            return NextResponse.json({
                success: true,
                jobId: result.jobId,
                status: result.status,
                pagination: {
                    start,
                    nextStart: start + 5, // Increment by 5 as requested
                    hasMore,
                    loadCount: Math.floor((start - 5) / 5) + 1, // Current load number (1-10)
                    maxLoads: 10
                },
                message: `Scraping job queued successfully. Jobs will be available shortly. (Load ${Math.floor((start - 5) / 5) + 1}/10)`
            });

        } catch (queueError: any) {
            console.warn('⚠️ Queue system failed, falling back to direct scraping:', queueError.message);

            // Fall back to the original direct scraping method
            const encodedKeywords = encodeURIComponent(keywords);
            const encodedLocation = encodeURIComponent(location);
            const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodedKeywords}&location=${encodedLocation}&f_TPR=${timespan}&f_WT=${f_WT}&start=${start}`;

            console.log(`📡 Fetching from LinkedIn: ${url}`);

            // Fetch jobs from LinkedIn
            const html = await getWithRetry(url);

            if (!html) {
                return NextResponse.json({
                    success: false,
                    error: 'Failed to fetch jobs from LinkedIn'
                }, { status: 500 });
            }

            // Parse jobs from HTML
            const scrapedJobs = parseJobCards(html);
            console.log(`📋 Scraped ${scrapedJobs.length} jobs from LinkedIn`);

            if (scrapedJobs.length === 0) {
                return NextResponse.json({
                    success: true,
                    jobs: [],
                    message: 'No more jobs available',
                    hasMore: false
                });
            }

            // Remove duplicates
            const uniqueJobs = removeDuplicates(scrapedJobs);
            console.log(`🔍 After deduplication: ${uniqueJobs.length} unique jobs`);

            // Save to database with better error handling
            let savedJobsCount = 0;
            let newJobsCount = 0;
            try {
                savedJobsCount = await saveJobsToDatabase(userId, uniqueJobs);
                console.log(`💾 Processed ${savedJobsCount} jobs from database`);

                // For now, assume all jobs are new since we can't easily track creation time
                newJobsCount = savedJobsCount;

            } catch (dbError: any) {
                console.error('❌ Database error:', dbError);
                // Return the jobs even if database save fails
                newJobsCount = uniqueJobs.length;
            }

            // Check if we should allow more loads (up to 10 times: start=5,10,15,20,25,30,35,40,45,50)
            const maxStart = 50; // 10 loads * 5 increment = 50
            const hasMore = start < maxStart;

            return NextResponse.json({
                success: true,
                jobs: uniqueJobs,
                pagination: {
                    start,
                    nextStart: start + 5, // Increment by 5 as requested
                    hasMore,
                    jobsLoaded: uniqueJobs.length,
                    newJobsCount,
                    loadCount: Math.floor((start - 5) / 5) + 1, // Current load number (1-10)
                    maxLoads: 10
                },
                message: newJobsCount > 0
                    ? `Successfully loaded ${newJobsCount} new jobs (Load ${Math.floor((start - 5) / 5) + 1}/10)`
                    : `No new jobs found in this range (Load ${Math.floor((start - 5) / 5) + 1}/10)`
            });
        }

    } catch (error: any) {
        console.error('❌ Error in load-more-jobs:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal server error'
        }, { status: 500 });
    }
} 