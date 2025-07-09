# KronJob - Complete Setup Guide

## 🚀 Quick Start

This guide will help you set up the complete KronJob LinkedIn job scraper from scratch.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Git installed

## Step 1: Clone and Install Dependencies

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd KronJob

# Install dependencies
npm install

# Install additional dependencies for scraping
npm install axios cheerio node-cron
```

## Step 2: Set up Supabase Database

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready

### 2.2 Get Your Credentials

1. Go to Settings → API
2. Copy your:
   - Project URL
   - Anon public key

### 2.3 Set up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# LinkedIn Scraping Configuration
LINKEDIN_SCRAPING_DELAY=2000
LINKEDIN_PAGES_TO_SCRAPE=5
LINKEDIN_ROUNDS=1
```

### 2.4 Create Database Tables

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the entire content from `database-setup.sql`
4. Click "Run" to execute the SQL

This will create:
- `job_preferences` table
- `job_tasks` table  
- `jobs` table
- All necessary indexes and policies

## Step 3: Test the Setup

### 3.1 Start the Development Server

```bash
npm run dev
```

### 3.2 Test the Application

1. Open [http://localhost:3000](http://localhost:3000)
2. You should see the KronJob interface

### 3.3 Test Job Preferences

1. Fill out the job preferences form
2. Submit the form
3. Check that data appears in your Supabase `job_preferences` table

### 3.4 Test Job Scraping

1. Click "Start Job Scraping" button
2. Watch the real-time status updates
3. Check that jobs appear in your Supabase `jobs` table

## Step 4: Production Deployment

### 4.1 Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### 4.2 Environment Variables for Production

Make sure to set these in your production environment:

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

## Step 5: Advanced Configuration

### 5.1 Customize Scraping Parameters

Edit `src/lib/linkedin-scraper.ts` to modify:

```typescript
const defaultConfig: ScrapingConfig = {
  headers: { /* Custom headers */ },
  retries: 3,
  delay: 2000, // Delay between requests
  pagesToScrape: 5, // Number of pages to scrape
  rounds: 1, // Number of scraping rounds
  daysToScrape: 7 // How many days back to scrape
};
```

### 5.2 Add Proxy Support

If you need to use proxies, uncomment and configure in `.env.local`:

```env
PROXY_URL=http://your-proxy:8080
PROXY_USERNAME=your_username
PROXY_PASSWORD=your_password
```

### 5.3 Customize Job Filtering

Edit the filtering logic in `src/lib/linkedin-scraper.ts`:

```typescript
const filteredJobs = filterJobs(uniqueJobs, {
  titleExclude: ['frontend', 'front end', 'game', 'ui', 'ux'],
  titleInclude: ['developer', 'engineer', 'programmer', 'software'],
  companyExclude: ['ClickJobs.io', 'Upwork', 'Fiverr'],
  descWords: ['agriculture', 'farm', 'manufacturing', 'bilingual', 'chemistry']
});
```

## Step 6: Monitoring and Maintenance

### 6.1 Monitor Scraping Performance

Check your Supabase dashboard for:
- Job scraping success rates
- Database performance
- API usage

### 6.2 Set up Automated Scraping

Create a cron job or use Vercel Cron to run scraping automatically:

```typescript
// In a new API route: /api/cron-scrape
export async function GET() {
  // Run scraping for all users
  const { data: users } = await supabase.from("job_preferences").select("*");
  
  for (const user of users || []) {
    await jobProcessor.addTask({
      userId: user.email,
      keywords: `${user.job_title} ${user.keywords}`,
      location: user.location
    });
  }
  
  return NextResponse.json({ success: true });
}
```

### 6.3 Database Maintenance

Regularly clean up old data:

```sql
-- Clean up old tasks (older than 30 days)
DELETE FROM job_tasks 
WHERE created_at < NOW() - INTERVAL '30 days';

-- Clean up old jobs (older than 90 days)
DELETE FROM jobs 
WHERE created_at < NOW() - INTERVAL '90 days';
```

## Troubleshooting

### Common Issues

1. **"Supabase connection error"**
   - Check your environment variables
   - Verify your Supabase project is active

2. **"No jobs found"**
   - Check if LinkedIn is blocking requests
   - Try reducing scraping speed (increase delay)
   - Verify your search keywords

3. **"Task failed"**
   - Check the browser console for errors
   - Verify your Supabase tables exist
   - Check the task error message in the database

### Debug Mode

Enable debug logging by adding to your environment:

```env
DEBUG=true
```

### Performance Optimization

1. **Reduce scraping frequency** if you hit rate limits
2. **Use proxies** for high-volume scraping
3. **Implement caching** for job descriptions
4. **Optimize database queries** with proper indexes

## Security Considerations

1. **Rate Limiting**: Implement rate limiting to prevent abuse
2. **Input Validation**: Validate all user inputs
3. **Row Level Security**: Already configured in the database setup
4. **Environment Variables**: Never commit sensitive data to Git

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify your Supabase configuration
3. Test with the provided test file: `src/lib/test-scraper.ts`
4. Check the logs in your deployment platform

## Next Steps

Once your basic setup is working:

1. **Add user authentication** with Supabase Auth
2. **Implement email notifications** for new jobs
3. **Add job application tracking**
4. **Create a mobile app** with React Native
5. **Add analytics** to track usage patterns

---

🎉 **Congratulations!** Your KronJob LinkedIn scraper is now ready to use! 