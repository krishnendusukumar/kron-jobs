import axios from 'axios';
import { supabase } from './supabase';
import * as cheerio from 'cheerio';
import { makeProxyRequest, proxyManager } from './proxy-config';

interface JobSearchParams {
    keywords: string;
    location: string;
    f_WT?: string;
    timespan?: string;
    start?: number;
}

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

interface ScrapingConfig {
    headers: Record<string, string>;
    retries: number;
    delay: number;
    pagesToScrape: number;
    rounds: number;
    daysToScrape: number;
}

const defaultConfig: ScrapingConfig = {
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
    delay: 2000,
    pagesToScrape: 5,
    rounds: 1,
    daysToScrape: 7
};

const randomDelay = (min: number, max: number) => new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));

async function getWithRetry(url: string, config: ScrapingConfig, retries: number = 3): Promise<string | null> {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`🌐 Attempt ${i + 1}/${retries} - Fetching via proxy: ${url}`);

            const response = await makeProxyRequest({
                method: 'GET',
                url: url,
                timeout: 15000,
                headers: config.headers
            });

            if (response) return response;
        } catch (error: any) {
            console.log(`❌ Attempt ${i + 1} failed for ${url}:`, error.message);
            if (i < retries - 1) {
                console.log(`⏳ Waiting ${config.delay}ms before retry...`);
                await randomDelay(config.delay, config.delay + 1000);
            }
        }
    }
    return null;
}

function parseJobCards(html: string): JobCard[] {
    const $ = cheerio.load(html);
    const jobs: JobCard[] = [];

    console.log('🔍 Parsing HTML for job cards...');
    console.log('📄 HTML length:', html.length);
    console.log('📄 First 500 chars:', html.substring(0, 500));

    // Updated selectors for current LinkedIn structure
    const selectors = [
        'li', // LinkedIn now uses li elements for job cards
        '.job-search-card',
        '.base-search-card',
        '.job-search-card__container',
        '.base-card',
        '[data-entity-urn]' // LinkedIn job cards have this attribute
    ];

    for (const selector of selectors) {
        const elements = $(selector);
        console.log(`🔍 Trying selector "${selector}": found ${elements.length} elements`);

        elements.each((index, el) => {
            const $el = $(el);

            // Try multiple title selectors
            const title = $el.find('h3, h2, .base-search-card__title, .job-search-card__title, [data-testid="job-card-title"]').first().text().trim();

            // Try multiple company selectors
            const company = $el.find('h4, .base-search-card__subtitle a, .job-search-card__company, [data-testid="job-card-company"]').first().text().trim();

            // Try multiple location selectors
            const location = $el.find('.job-search-card__location, .base-search-card__location, [data-testid="job-card-location"]').first().text().trim();

            // Try multiple URL selectors
            const job_url = $el.find('a[href*="linkedin.com/jobs"], .base-card__full-link, [data-testid="job-card-link"]').first().attr('href') || '';

            // Get date if available
            const date = $el.find('time').attr('datetime') || new Date().toISOString();

            console.log(`📋 Job ${index + 1}:`, {
                title: title.substring(0, 50),
                company: company.substring(0, 30),
                location: location.substring(0, 30),
                hasUrl: !!job_url
            });

            if (title && company && job_url && title.length > 3 && company.length > 1) {
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
            }
        });

        if (jobs.length > 0) {
            console.log(`✅ Found ${jobs.length} jobs using selector: ${selector}`);
            break;
        }
    }

    if (jobs.length === 0) {
        console.log('⚠️ No jobs found with any selector, trying comprehensive fallback parsing...');

        // More comprehensive fallback
        $('*').each((_, el) => {
            const $el = $(el);
            const text = $el.text().trim();

            // Look for job-like patterns
            if (text.length > 10 && text.length < 200) {
                const title = $el.find('h3, h2, h1, .title, [class*="title"]').text().trim();
                const company = $el.find('h4, h5, .company, .subtitle, [class*="company"]').text().trim();
                const location = $el.find('.location, .place, [class*="location"]').text().trim();
                const job_url = $el.find('a[href*="linkedin.com/jobs"], a[href*="/jobs/"]').attr('href') || '';

                if (title && company && job_url && title.length > 5 && company.length > 2) {
                    console.log(`🎯 Found job via fallback: ${title} at ${company}`);
                    jobs.push({
                        title,
                        company,
                        location,
                        date: new Date().toISOString(),
                        job_url,
                        applied: 0,
                        hidden: 0,
                        interview: 0,
                        rejected: 0
                    });
                }
            }
        });
    }

    console.log(`📊 Total jobs parsed: ${jobs.length}`);
    return jobs;
}

function parseJobDescription(html: string): string {
    const $ = cheerio.load(html);
    return $('.description__text--rich').text().trim() || 'Could not find Job Description';
}

function removeDuplicates(jobs: JobCard[]): JobCard[] {
    const seen = new Set();
    return jobs.filter(job => {
        const key = `${job.title}-${job.company}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function filterJobs(jobs: JobCard[], config: { titleExclude?: string[]; titleInclude?: string[]; companyExclude?: string[]; descWords?: string[] }): JobCard[] {
    return jobs.filter(job => {
        const title = job.title.toLowerCase();
        const company = job.company.toLowerCase();
        const description = job.job_description?.toLowerCase() || '';
        if (config.titleExclude?.some(word => title.includes(word))) return false;
        if (config.titleInclude?.length && !config.titleInclude.some(word => title.includes(word))) return false;
        if (config.companyExclude?.some(word => company.includes(word))) return false;
        if (config.descWords?.some(word => description.includes(word))) return false;
        return true;
    });
}

export async function scrapeLinkedInJobs(params: JobSearchParams, userConfig?: Partial<ScrapingConfig>): Promise<JobCard[]> {
    const config = { ...defaultConfig, ...userConfig };
    const allJobs: JobCard[] = [];
    const keywords = encodeURIComponent(params.keywords);
    const location = encodeURIComponent(params.location);
    const f_WT = params.f_WT || '';
    const timespan = params.timespan || 'r86400';
    const start = params.start || 0;

    console.log(`🔍 Scraping LinkedIn jobs: ${keywords} in ${location}, start: ${start}`);

    for (let round = 0; round < config.rounds; round++) {
        const currentStart = start + (round * 25); // LinkedIn returns 25 jobs per request
        const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${keywords}&location=${location}&f_TPR=${timespan}&f_WT=${f_WT}&start=${currentStart}`;

        console.log(`📡 Fetching from: ${url}`);
        const html = await getWithRetry(url, config);

        if (html) {
            const jobs = parseJobCards(html);
            console.log(`📋 Found ${jobs.length} jobs from this request`);
            allJobs.push(...jobs);
        } else {
            console.log(`❌ Failed to fetch jobs from start position ${currentStart}`);
        }
    }

    console.log(`📊 Total jobs scraped: ${allJobs.length}`);

    const uniqueJobs = removeDuplicates(allJobs);
    console.log(`🔍 After deduplication: ${uniqueJobs.length} unique jobs`);

    // Apply basic filtering (no description filtering since we're not fetching descriptions)
    const filteredJobs = uniqueJobs.filter(job => {
        const title = job.title.toLowerCase();
        const company = job.company.toLowerCase();

        // Basic title filtering
        if (['frontend', 'front end', 'game', 'ui', 'ux'].some(word => title.includes(word))) return false;
        if (!['developer', 'engineer', 'programmer', 'software', 'sre', 'devops'].some(word => title.includes(word))) return false;

        // Basic company filtering
        if (['ClickJobs.io', 'Upwork', 'Fiverr'].some(word => company.includes(word.toLowerCase()))) return false;

        return true;
    });

    console.log(`✅ Final filtered jobs: ${filteredJobs.length}`);

    // Return jobs without descriptions (much faster and no 999 errors)
    return filteredJobs.map(job => ({
        ...job,
        job_description: `Job at ${job.company} - ${job.title}` // Simple placeholder
    }));
}

export async function saveJobsToDatabase(jobs: JobCard[], userId?: string) {
    if (!jobs.length) return;

    console.log(`💾 Attempting to upsert ${jobs.length} jobs for user: ${userId}`);
    console.log(`📋 Sample job to save:`, {
        title: jobs[0].title.substring(0, 50) + '...',
        company: jobs[0].company,
        location: jobs[0].location,
        job_url: jobs[0].job_url.substring(0, 50) + '...'
    });

    try {
        // Try upsert first with the correct constraint
        const { data, error } = await supabase.from('jobs').upsert(
            jobs.map(job => ({
                ...job,
                user_id: userId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })),
            { onConflict: 'job_url' } // Use the unique constraint on job_url
        );

        if (error) {
            console.log(`❌ Supabase upsert error:`, error);
            throw error;
        }

        console.log(`✅ Successfully upserted ${jobs.length} jobs`);
        return data;

    } catch (error: any) {
        console.log(`🔄 Falling back to individual inserts...`);

        // Fallback: insert jobs one by one, ignoring duplicates
        let savedCount = 0;
        for (const job of jobs) {
            try {
                const { error: insertError } = await supabase.from('jobs').insert({
                    ...job,
                    user_id: userId,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

                if (insertError) {
                    // If it's a duplicate key error, that's fine
                    if (insertError.code === '23505') { // Unique violation
                        console.log(`⚠️ Job already exists: ${job.title} at ${job.company}`);
                    } else {
                        console.log(`❌ Error inserting job ${job.title}:`, insertError);
                    }
                } else {
                    console.log(`✅ Saved job: ${job.title} at ${job.company}`);
                    savedCount++;
                }
            } catch (insertError: any) {
                console.log(`❌ Failed to insert job ${job.title}:`, insertError.message);
            }
        }

        console.log(`✅ Database save completed: ${savedCount} jobs saved`);
        return { savedCount };
    }
}

export async function testProxyConnection(): Promise<boolean> {
    try {
        console.log('🧪 Testing Bright Data proxy connection...');
        const isWorking = await proxyManager.testConnection();

        if (isWorking) {
            const stats = proxyManager.getStats();
            console.log('📊 Proxy stats:', {
                totalRequests: stats.totalRequests,
                failedRequests: stats.failedRequests,
                estimatedCost: `$${proxyManager.getEstimatedCost().toFixed(4)}`
            });
        }

        return isWorking;
    } catch (error) {
        console.error('❌ Proxy test failed:', error);
        return false;
    }
}

export async function scrapeAndSaveJobs(params: JobSearchParams, userId?: string, config?: Partial<ScrapingConfig>) {
    try {
        const jobs = await scrapeLinkedInJobs(params, config);
        await saveJobsToDatabase(jobs, userId);
        return jobs;
    } catch (error) {
        throw error;
    }
}
