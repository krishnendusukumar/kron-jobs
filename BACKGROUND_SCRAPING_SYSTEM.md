# Background Scraping System

This document describes the new background scraping system that separates job scraping from the frontend UI, ensuring fast and reliable job fetching.

## 🏗️ System Architecture

```
┌────────────┐      User enters details     ┌────────────┐
│  Frontend  ├─────────────────────────────►│  API Layer │
└────────────┘                              └────────────┘
      ▲                                           │
      │                                           ▼
 Fetch jobs from DB                      ┌───────────────────┐
      │                                  │  Supabase Database │
      └──────────────────────────────────┤  (jobs, tasks...)  │
                                         └───────────────────┘
                                                 ▲
                                                 │
                                     Save jobs after scraping
                                                 │
                                         ┌──────────────┐
                                         │ Cron Scraper │
                                         └──────────────┘
```

## 🔄 Process Flow

### A. User Requests Scraping
1. User submits job preferences via frontend
2. API queues a scraping job in the background
3. Returns immediately with job ID and status
4. Frontend can poll for job completion

### B. Background Processing
1. Job queue processes pending jobs
2. Scrapes LinkedIn for jobs
3. Saves jobs to database with deduplication
4. Updates job status to completed

### C. Frontend Fetches Jobs
1. UI requests jobs from database only
2. Fast response with filtering/sorting
3. No scraping delays or timeouts

## 📁 Key Components

### 1. Job Queue (`/lib/job-queue.ts`)
- Manages background scraping tasks
- Handles job status tracking
- Processes jobs sequentially
- Automatic cleanup of old jobs

### 2. Job Service (`/lib/job-service.ts`)
- Centralized job operations
- Database-only job fetching
- Job status management
- Statistics and analytics

### 3. API Routes
- `/api/request-scraping` - Queue new scraping jobs
- `/api/scraping-status` - Check job status
- `/api/jobs` - Fetch jobs from database
- `/api/job-stats` - Get job statistics
- `/api/cron/scrape-jobs` - Automated scraping endpoint

## 🚀 Usage Examples

### Request Scraping
```typescript
const response = await fetch('/api/request-scraping', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user@example.com',
    keywords: 'Software Engineer',
    location: 'San Francisco',
    f_WT: '2', // Remote work
    timespan: 'r86400' // Last 24 hours
  })
});

const { jobId, status } = await response.json();
```

### Check Scraping Status
```typescript
const response = await fetch(`/api/scraping-status?jobId=${jobId}`);
const { job } = await response.json();

if (job.status === 'completed') {
  // Jobs are ready to fetch
  fetchJobs();
}
```

### Fetch Jobs from Database
```typescript
const response = await fetch('/api/jobs?userId=user@example.com&limit=20&offset=0');
const { jobs, pagination } = await response.json();
```

### Update Job Status
```typescript
await fetch('/api/jobs?jobId=123&userId=user@example.com&action=applied', {
  method: 'PUT'
});
```

## ⚙️ Configuration

### Environment Variables
```bash
# Required for cron job security
CRON_SECRET=your-secret-key-here
```

### Database Tables
Run the migration to create the `scraping_jobs` table:
```sql
-- See scraping-jobs-migration.sql
```

## 🔧 Setup Instructions

1. **Run Database Migration**
   ```bash
   # Execute the SQL in scraping-jobs-migration.sql
   ```

2. **Set Environment Variables**
   ```bash
   CRON_SECRET=your-secret-key-here
   ```

3. **Deploy the Application**
   The background processing will start automatically on the server.

4. **Set Up Cron Jobs** (Optional)
   ```bash
   # Every 3 hours
   0 */3 * * * curl -X POST https://your-app.vercel.app/api/cron/scrape-jobs \
     -H "Authorization: Bearer your-secret-key-here"
   ```

## 📊 Benefits

### ✅ Performance
- Frontend loads instantly (no scraping delays)
- Database queries are fast and optimized
- Background processing doesn't block UI

### ✅ Reliability
- Jobs are always saved to database
- Deduplication prevents duplicate jobs
- Failed scraping jobs are tracked and retried

### ✅ Scalability
- Multiple users can scrape simultaneously
- Queue system prevents overload
- Background processing scales automatically

### ✅ User Experience
- No waiting for scraping to complete
- Jobs are always available
- Real-time status updates
- Rich filtering and sorting

## 🔍 Monitoring

### Job Status Tracking
- All scraping jobs are tracked in `scraping_jobs` table
- Status: pending → processing → completed/failed
- Results include jobs scraped and saved

### Error Handling
- Failed jobs are logged with error details
- Automatic retry mechanism
- Graceful degradation if scraping fails

### Analytics
- Job statistics per user
- Scraping success rates
- Performance metrics

## 🚨 Important Notes

1. **Always Save to Database**: All scraped jobs are saved to the database with deduplication
2. **Frontend Only Fetches from DB**: UI never scrapes directly, only fetches from database
3. **Background Processing**: Scraping happens in the background via queue system
4. **User Isolation**: Each user's jobs are isolated and secure
5. **Rate Limiting**: Built-in rate limiting prevents abuse

## 🔮 Future Enhancements

- Email notifications for new jobs
- Auto-apply functionality
- Advanced filtering with AI
- Job recommendations
- Analytics dashboard
- Multi-source scraping (Indeed, Glassdoor, etc.) 