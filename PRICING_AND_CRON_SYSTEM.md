# Pricing and Cron Scheduler System

## Overview

KronJobs now features a comprehensive tiered pricing system with automated job scraping capabilities. The system is designed to monetize the platform while providing value to users at different levels.

## Pricing Tiers

### 🆓 Free Plan
- **Price**: $0 forever
- **Features**:
  - 3 manual job searches per day
  - No automation
  - Email notifications
  - Secure & private

### 💎 Lifetime Deal (Early Adopter)
- **Price**: $5 one-time
- **Features**:
  - 2 automated cron job slots daily
  - 3 job fetches daily (auto)
  - Early access to new features
  - Browser extension (reserved)
  - Priority support
  - Secure & private

### 🚀 Pro Plan (Coming Soon)
- **Price**: $9/month
- **Features**:
  - 5 automated cron jobs/day
  - Auto-apply to supported jobs
  - Resume autofill, extension
  - Premium chat/email support
  - Advanced analytics
  - Secure & private

## Cron Scheduler System

### Fixed Time Slots
The system uses 5 fixed time slots to optimize resource usage:
- 10:00 AM
- 12:00 PM
- 3:00 PM
- 6:00 PM
- 9:00 PM

### Plan Limitations
- **Free**: No cron access
- **Lifetime**: Max 2 time slots
- **Pro**: Max 5 time slots

### Credit System
- Credits reset daily at midnight UTC
- Each scraping execution consumes 1 credit
- Free/Lifetime: 3 credits per day
- Pro: 5 credits per day

## Database Schema

### User Profiles Table
```sql
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    plan VARCHAR(50) NOT NULL DEFAULT 'free',
    credits_remaining INTEGER NOT NULL DEFAULT 3,
    credits_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
    cron_times TEXT[] DEFAULT '{}',
    max_cron_jobs INTEGER NOT NULL DEFAULT 0,
    max_daily_fetches INTEGER NOT NULL DEFAULT 3,
    upgrade_source VARCHAR(50),
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Cron Jobs Table
```sql
CREATE TABLE cron_jobs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    cron_time VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_run TIMESTAMP,
    next_run TIMESTAMP,
    run_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Cron Executions Table
```sql
CREATE TABLE cron_executions (
    id SERIAL PRIMARY KEY,
    cron_job_id INTEGER REFERENCES cron_jobs(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    execution_time TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    jobs_found INTEGER DEFAULT 0,
    jobs_added INTEGER DEFAULT 0,
    error_message TEXT,
    execution_duration_ms INTEGER,
    proxy_used VARCHAR(255)
);
```

## API Endpoints

### User Profile Management
- `GET /api/user-profile?userId={userId}` - Get user profile
- `POST /api/user-profile` - Create user profile
- `PATCH /api/user-profile` - Upgrade plan

### Cron Job Management
- `GET /api/cron-jobs?userId={userId}` - Get user's cron jobs
- `POST /api/cron-jobs` - Create new cron job
- `DELETE /api/cron-jobs?userId={userId}&jobId={jobId}` - Delete cron job

### Cron Scheduler
- `POST /api/cron-scheduler/init` - Initialize cron scheduler
- `GET /api/cron-scheduler/init` - Get scheduler status

## Components

### PricingSection
- Displays all pricing tiers
- Handles plan upgrades
- Shows current plan information
- Includes FAQ section

### CronManager
- Manages automated job scheduling
- Shows current cron jobs
- Displays execution history
- Handles cron job creation/deletion

### Dashboard
- Integrated view of all features
- Overview of credits and plan
- Quick access to automation and pricing

## Business Logic

### Credit Consumption
- Manual scraping: Consumes 1 credit immediately
- Automated scraping: Credit consumed at execution time
- Credits reset daily at midnight UTC
- No credits = no scraping allowed

### Plan Upgrades
- Free → Lifetime: Manual upgrade (for demo)
- Free → Pro: Coming soon
- Lifetime → Pro: Coming soon
- All upgrades update user limits immediately

### Cron Job Management
- Users can only select from available time slots
- Maximum jobs enforced per plan
- Duplicate time slots prevented
- Failed executions logged with error details

## Security Features

### Row Level Security (RLS)
- Users can only access their own data
- Cron jobs protected by user_id
- Executions tied to specific users
- Profile data isolated per user

### Rate Limiting
- Fixed time slots prevent abuse
- Credit system limits daily usage
- Plan-based restrictions on automation

## Monitoring and Logging

### Execution Tracking
- All cron executions logged
- Success/failure status tracked
- Performance metrics (duration)
- Error messages stored

### Error Handling
- Failed executions don't consume credits
- Error count tracked per cron job
- Automatic retry logic (future enhancement)
- User notifications for failures

## Future Enhancements

### Stripe Integration
- Real payment processing
- Subscription management
- Webhook handling
- Invoice generation

### Advanced Features
- Custom cron schedules
- Email notifications for results
- Job application automation
- Resume parsing and autofill

### Analytics
- Usage statistics
- Performance metrics
- User behavior tracking
- Revenue analytics

## Setup Instructions

1. Run the database migration:
   ```sql
   -- Execute user-profiles-migration.sql in Supabase
   ```

2. Initialize the cron scheduler:
   ```typescript
   import { initializeCronScheduler } from './lib/init-cron-scheduler';
   await initializeCronScheduler();
   ```

3. Add components to your pages:
   ```tsx
   import PricingSection from './components/PricingSection/page';
   import CronManager from './components/CronManager/page';
   ```

4. Update your scraping API to check credits:
   ```typescript
   const userProfile = await UserProfileService.getOrCreateUserProfile(userId, email);
   if (userProfile.credits_remaining <= 0) {
     return { error: 'No credits remaining' };
   }
   ```

## Environment Variables

Add these to your `.env.local`:
```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Testing

### Manual Testing
1. Create a free user profile
2. Try to access automation (should be blocked)
3. Upgrade to lifetime plan
4. Create cron jobs
5. Monitor executions

### Automated Testing
- Unit tests for UserProfileService
- Integration tests for cron scheduler
- API endpoint testing
- Component testing

## Troubleshooting

### Common Issues
1. **Cron jobs not running**: Check scheduler initialization
2. **Credits not resetting**: Verify daily reset function
3. **Permission errors**: Check RLS policies
4. **API errors**: Verify user profile exists

### Debug Commands
```sql
-- Check user profiles
SELECT * FROM user_profiles WHERE user_id = 'your-user-id';

-- Check cron jobs
SELECT * FROM cron_jobs WHERE user_id = 'your-user-id';

-- Check executions
SELECT * FROM cron_executions WHERE user_id = 'your-user-id' ORDER BY execution_time DESC LIMIT 10;
```

## Performance Considerations

### Database Optimization
- Indexes on frequently queried columns
- Efficient RLS policies
- Connection pooling

### Cron Scheduler
- Singleton pattern prevents multiple instances
- Efficient job scheduling with node-cron
- Memory management for long-running processes

### API Performance
- Caching for user profiles
- Efficient credit checking
- Optimized database queries 