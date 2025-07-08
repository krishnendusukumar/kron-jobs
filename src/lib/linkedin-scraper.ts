import axios from 'axios';
import { supabase } from './supabase';
import * as cheerio from 'cheerio';

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
    proxies?: Record<string, string>;
    retries: number;
    delay: number;
    pagesToScrape: number;
    rounds: number;
    daysToScrape: number;
}

const PROXY_CONFIG = {
    host: process.env.PROXY_HOST || '198.23.239.134',
    port: parseInt(process.env.PROXY_PORT || '6540'),
    auth: {
        username: process.env.PROXY_USERNAME || 'feybfcyg',
        password: process.env.PROXY_PASSWORD || 'ga2r3k8zna40'
    }
};

const defaultConfig: ScrapingConfig = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive'
    },
    proxies: {
        http: `http://${PROXY_CONFIG.auth.username}:${PROXY_CONFIG.auth.password}@${PROXY_CONFIG.host}:${PROXY_CONFIG.port}`,
        https: `http://${PROXY_CONFIG.auth.username}:${PROXY_CONFIG.auth.password}@${PROXY_CONFIG.host}:${PROXY_CONFIG.port}`
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
            const axiosConfig: any = {
                headers: config.headers,
                timeout: 15000
            };
            if (config.proxies) axiosConfig.proxy = config.proxies;
            const response = await axios.get(url, axiosConfig);
            if (response.status === 200) return response.data;
        } catch (error: any) {
            if (i === retries - 1 && config.proxies && error.code === 'ECONNREFUSED') {
                try {
                    const response = await axios.get(url, { headers: config.headers, timeout: 10000 });
                    if (response.status === 200) return response.data;
                } catch (_) { }
            }
            if (i < retries - 1) await randomDelay(config.delay, config.delay + 1000);
        }
    }
    return null;
}

function parseJobCards(html: string): JobCard[] {
    const $ = cheerio.load(html);
    const jobs: JobCard[] = [];
    $('.job-search-card').each((_, el) => {
        const title = $(el).find('h3.base-search-card__title').text().trim();
        const company = $(el).find('h4.base-search-card__subtitle a').text().trim();
        const location = $(el).find('.job-search-card__location').text().trim();
        const date = $(el).find('time').attr('datetime') || '';
        const job_url = $(el).find('a.base-card__full-link').attr('href') || '';
        if (title && company) {
            jobs.push({ title, company, location, date, job_url, applied: 0, hidden: 0, interview: 0, rejected: 0 });
        }
    });
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

    for (let round = 0; round < config.rounds; round++) {
        const start = 0;
        const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${keywords}&location=${location}&f_TPR=${timespan}&f_WT=${f_WT}&start=${start}`;
        const html = await getWithRetry(url, config);
        if (html) allJobs.push(...parseJobCards(html));
    }

    const uniqueJobs = removeDuplicates(allJobs);
    const filteredJobs = filterJobs(uniqueJobs, {
        titleExclude: ['frontend', 'front end', 'game', 'ui', 'ux'],
        titleInclude: ['developer', 'engineer', 'programmer', 'software'],
        companyExclude: ['ClickJobs.io', 'Upwork', 'Fiverr'],
        descWords: ['agriculture', 'farm', 'manufacturing', 'bilingual', 'chemistry']
    });

    const jobsWithDescriptions: JobCard[] = [];
    for (let i = 0; i < filteredJobs.length; i++) {
        const job = filteredJobs[i];
        if (!job.job_url) continue;
        const descriptionHtml = await getWithRetry(job.job_url, config);
        if (descriptionHtml) {
            job.job_description = parseJobDescription(descriptionHtml);
            jobsWithDescriptions.push(job);
        }
        if (i < filteredJobs.length - 1) await randomDelay(config.delay, config.delay + 1000);
    }
    return jobsWithDescriptions;
}

export async function saveJobsToDatabase(jobs: JobCard[], userId?: string) {
    if (!jobs.length) return;
    try {
        const { data, error } = await supabase.from('jobs').upsert(
            jobs.map(job => ({
                ...job,
                user_id: userId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })),
            { onConflict: 'job_url' }
        );
        if (error) throw error;
        return data;
    } catch (error) {
        throw error;
    }
}

export async function testProxyConnection(): Promise<boolean> {
    try {
        const testUrl = 'https://httpbin.org/ip';
        const response = await axios.get(testUrl, {
            proxy: {
                host: PROXY_CONFIG.host,
                port: PROXY_CONFIG.port,
                auth: PROXY_CONFIG.auth
            },
            timeout: 10000
        });
        console.log('Proxy IP:', response.data.origin);
        return true;
    } catch (_) {
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
