# KronJob Troubleshooting Guide

## 🚨 Common Issues and Solutions

### 1. Database Schema Error: "Could not find the 'experience' column"

**Error Message:**
```
Response error: {"success":false,"error":"Could not find the 'experience' column of 'job_preferences' in the schema cache"}
```

**Solution:**
Run the database migration script in your Supabase SQL Editor:

```sql
-- Add missing columns to job_preferences table
ALTER TABLE job_preferences 
ADD COLUMN IF NOT EXISTS min_salary INTEGER,
ADD COLUMN IF NOT EXISTS notify_method VARCHAR(50) DEFAULT 'Mail',
ADD COLUMN IF NOT EXISTS experience VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- Update existing records to have default values
UPDATE job_preferences 
SET 
    min_salary = 0,
    notify_method = 'Mail',
    experience = '',
    phone = ''
WHERE min_salary IS NULL;
```

**Steps:**
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the above SQL
4. Click "Run"
5. Refresh your application

### 2. Proxy Connection Issues

**Error Message:**
```
❌ Proxy test failed: ECONNREFUSED
```

**Solutions:**

#### A. Check Proxy Credentials
Verify your proxy details are correct:
- Host: `198.23.239.134`
- Port: `6540`
- Username: `feybfcyg`
- Password: `ga2r3k8zna40`

#### B. Test Proxy Manually
```bash
# Test with curl
curl -x http://feybfcyg:ga2r3k8zna40@198.23.239.134:6540 https://httpbin.org/ip
```

#### C. Environment Variables
Create `.env.local` with proxy settings:
```env
PROXY_HOST=198.23.239.134
PROXY_PORT=6540
PROXY_USERNAME=feybfcyg
PROXY_PASSWORD=ga2r3k8zna40
```

#### D. Fallback to Direct Connection
The scraper will automatically fall back to direct connection if proxy fails.

### 3. LinkedIn Blocking Requests

**Symptoms:**
- No jobs found
- 403 Forbidden errors
- Rate limiting messages

**Solutions:**

#### A. Increase Delays
Edit `src/lib/linkedin-scraper.ts`:
```typescript
const defaultConfig: ScrapingConfig = {
  delay: 5000, // Increase from 2000 to 5000ms
  pagesToScrape: 3, // Reduce from 5 to 3
  // ... other settings
};
```

#### B. Rotate User Agents
Add more user agents to the headers:
```typescript
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
];
```

#### C. Use Different Proxies
If you have multiple proxy endpoints, rotate them:
```typescript
const proxyEndpoints = [
  'http://proxy1:port',
  'http://proxy2:port',
  'http://proxy3:port'
];
```

### 4. Supabase Connection Issues

**Error Message:**
```
Supabase connection error
```

**Solutions:**

#### A. Check Environment Variables
Verify `.env.local` contains:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### B. Check Supabase Project Status
1. Go to your Supabase dashboard
2. Verify project is active (not paused)
3. Check API usage limits

#### C. Test Connection
```bash
# Test Supabase connection
curl -X GET "https://your-project.supabase.co/rest/v1/job_preferences" \
  -H "apikey: your-anon-key"
```

### 5. Build Errors

**Error Message:**
```
TypeScript compilation failed
```

**Solutions:**

#### A. Install Missing Dependencies
```bash
npm install axios cheerio node-cron
```

#### B. Check TypeScript Errors
```bash
npx tsc --noEmit
```

#### C. Clear Next.js Cache
```bash
rm -rf .next
npm run dev
```

### 6. Job Scraping Not Working

**Symptoms:**
- No jobs found
- Empty results
- Task fails

**Debugging Steps:**

#### A. Test Individual Components
```bash
# Test proxy
curl http://localhost:3000/api/test-proxy

# Test scraper directly
npx ts-node src/lib/test-scraper.ts
```

#### B. Check LinkedIn URL Structure
Verify the LinkedIn Guest API URL is still valid:
```
https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=...&location=...&start=...
```

#### C. Monitor Network Requests
1. Open browser DevTools
2. Go to Network tab
3. Start scraping
4. Check for failed requests

### 7. Performance Issues

**Symptoms:**
- Slow scraping
- Timeout errors
- Memory issues

**Solutions:**

#### A. Optimize Configuration
```typescript
const optimizedConfig = {
  delay: 3000, // Increase delay
  pagesToScrape: 3, // Reduce pages
  retries: 2, // Reduce retries
  timeout: 20000 // Increase timeout
};
```

#### B. Use Connection Pooling
For high-volume scraping, consider using connection pooling:
```typescript
import { Pool } from 'pg';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000
});
```

### 8. Environment-Specific Issues

#### Development Environment
```bash
# Clear all caches
rm -rf .next node_modules/.cache
npm install
npm run dev
```

#### Production Environment
```bash
# Build for production
npm run build
npm start

# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 9. Database Performance Issues

**Symptoms:**
- Slow queries
- Connection timeouts
- High memory usage

**Solutions:**

#### A. Add Database Indexes
```sql
-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_user_id_created_at ON jobs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_job_tasks_status_created_at ON job_tasks(status, created_at);
```

#### B. Optimize Queries
```sql
-- Use LIMIT and OFFSET for pagination
SELECT * FROM jobs 
WHERE user_id = 'user@example.com' 
ORDER BY created_at DESC 
LIMIT 50 OFFSET 0;
```

#### C. Clean Up Old Data
```sql
-- Remove old tasks (30+ days)
DELETE FROM job_tasks WHERE created_at < NOW() - INTERVAL '30 days';

-- Remove old jobs (90+ days)
DELETE FROM jobs WHERE created_at < NOW() - INTERVAL '90 days';
```

## 🔧 Debug Mode

Enable debug logging by adding to your environment:
```env
DEBUG=true
NODE_ENV=development
```

## 📞 Getting Help

If you're still experiencing issues:

1. **Check the logs**: Look at browser console and server logs
2. **Run the test script**: `node test-setup.js`
3. **Test individual components**: Use the test endpoints
4. **Check Supabase dashboard**: Monitor database performance
5. **Verify environment**: Ensure all variables are set correctly

## 🚀 Quick Fixes

### Reset Everything
```bash
# 1. Clear caches
rm -rf .next node_modules/.cache

# 2. Reinstall dependencies
npm install

# 3. Run database migration
# (Copy database-migration.sql to Supabase SQL Editor)

# 4. Restart development server
npm run dev
```

### Test Everything
```bash
# 1. Test setup
node test-setup.js

# 2. Test proxy
curl http://localhost:3000/api/test-proxy

# 3. Test scraper
npx ts-node src/lib/test-scraper.ts

# 4. Test database
# Check Supabase dashboard for table structure
```

---

**Remember**: Most issues can be resolved by checking environment variables, running the database migration, and ensuring all dependencies are installed correctly. 