import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();
const COOKIES_PATH = path.join(process.cwd(), "linkedin-cookies.json");

async function loginToLinkedIn(page: any) {
    console.log("🔐 Logging into LinkedIn...");

    await page.goto("https://www.linkedin.com/login", { waitUntil: "domcontentloaded" });

    await page.type("#username", process.env.LINKEDIN_EMAIL!, { delay: 50 });
    await page.type("#password", process.env.LINKEDIN_PASSWORD!, { delay: 50 });

    await Promise.all([
        page.click("[type='submit']"),
        page.waitForNavigation({ waitUntil: "domcontentloaded" }),
    ]);

    console.log("✅ Logged in. Navigating to job search page...");
    await page.goto("https://www.linkedin.com/jobs/", { waitUntil: "domcontentloaded" });

    const cookies = await page.cookies();
    fs.writeFileSync(COOKIES_PATH, JSON.stringify(cookies, null, 2));

    console.log("✅ Login successful. Cookies saved.");
}

export async function fetchLinkedInJobs({ jobTitle, location, keywords }: {
    jobTitle: string;
    location: string;
    keywords: string;
}) {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Go to login page
    await page.goto("https://www.linkedin.com/login", { waitUntil: "domcontentloaded" });
    await page.type("#username", process.env.LINKEDIN_EMAIL!, { delay: 50 });
    await page.type("#password", process.env.LINKEDIN_PASSWORD!, { delay: 50 });
    await Promise.all([
        page.click("[type='submit']"),
        page.waitForNavigation({ waitUntil: "domcontentloaded" }),
    ]);

    // Now go to the jobs search page
    const searchQuery = encodeURIComponent(`${jobTitle} ${keywords}`);
    const searchURL = `https://www.linkedin.com/jobs/search/?keywords=${searchQuery}&location=${encodeURIComponent(location)}&f_TP=1&f_E=1`;
    await page.goto(searchURL, { waitUntil: "domcontentloaded" });

    // Wait for job cards to appear
    await page.waitForSelector(".jobs-search-results__list-item", { timeout: 15000 });

    // Scrape jobs
    const jobs = await page.evaluate(() => {
        const results: any[] = [];
        document.querySelectorAll(".jobs-search-results__list-item").forEach(card => {
            const title = card.querySelector("h3")?.textContent?.trim();
            const company = card.querySelector(".base-search-card__subtitle")?.textContent?.trim();
            const link = card.querySelector("a")?.href;
            results.push({ title, company, link });
        });
        return results;
    });

    await browser.close();
    return jobs;
}
