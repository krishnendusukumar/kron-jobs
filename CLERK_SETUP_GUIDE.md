# 🚀 Clerk Integration Setup Guide

This guide will help you set up a complete SaaS authentication and user management flow using Clerk for auth and Supabase for backend data.

## 📋 Prerequisites

- Supabase project with database access
- Clerk account (free tier available)
- Node.js 18+ and npm

## 🔧 Step 1: Set Up Clerk

### 1.1 Create Clerk Application

1. Go to [clerk.com](https://clerk.com) and sign up
2. Create a new application
3. Choose "Next.js" as your framework
4. Note down your **Publishable Key** and **Secret Key**

### 1.2 Configure Clerk Settings

1. **Authentication Methods:**
   - Enable Email/Password
   - Enable Google OAuth (optional)
   - Enable GitHub OAuth (optional)

2. **User Management:**
   - Enable email verification
   - Set up password requirements
   - Configure user profile fields

3. **Webhooks:**
   - Go to Webhooks section
   - Create a new webhook endpoint
   - Set URL to: `https://your-domain.com/api/clerk-webhook`
   - Select events: `user.created`, `user.updated`, `user.deleted`, `email_address.created`
   - Copy the webhook secret

## 🔧 Step 2: Set Up Supabase

### 2.1 Run Database Migrations

1. Go to your Supabase SQL Editor
2. Run the following migrations in order:

```sql
-- First run the existing migrations
-- database-setup.sql
-- user-profiles-migration.sql

-- Then run the new Clerk integration migration
-- clerk-integration-migration.sql
```

### 2.2 Configure Row Level Security (RLS)

The migrations will automatically set up RLS policies. Verify they're working:

```sql
-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'user_usage', 'billing_subscriptions');
```

## 🔧 Step 3: Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Clerk Webhook (for Supabase sync)
CLERK_WEBHOOK_SECRET=whsec_your_clerk_webhook_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🔧 Step 4: Test the Integration

### 4.1 Start the Development Server

```bash
npm run dev
```

### 4.2 Test User Flow

1. **Visit:** `http://localhost:3000/sign-up`
2. **Create a new account** with email/password
3. **Verify email** (if enabled)
4. **Sign in** and redirect to dashboard
5. **Check Supabase** - user profile should be created automatically

### 4.3 Test Webhook

1. **Create a test user** in Clerk dashboard
2. **Check logs** - webhook should be received
3. **Verify Supabase** - user profile should be created

## 🔧 Step 5: Verify Database Tables

Check that all tables are created correctly:

```sql
-- Check user_profiles table
SELECT * FROM user_profiles LIMIT 5;

-- Check user_usage table
SELECT * FROM user_usage LIMIT 5;

-- Check billing_subscriptions table
SELECT * FROM billing_subscriptions LIMIT 5;

-- Check audit_logs table
SELECT * FROM audit_logs LIMIT 5;
```

## 🔧 Step 6: Test Usage Tracking

### 6.1 Test Credit Consumption

```javascript
// In your API routes, track usage like this:
await UserProfileService.trackUsage(userId, 'job_search', 1, {
  keywords: 'react developer',
  location: 'remote'
});
```

### 6.2 Test User Limits

```javascript
// Check if user can perform action
const canSearch = await UserProfileService.canPerformAction(userId, 'job_search');
if (!canSearch) {
  return { error: 'Daily limit reached or no credits remaining' };
}
```

## 🔧 Step 7: Production Deployment

### 7.1 Update Environment Variables

For production, update your environment variables:

```env
# Production Clerk Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
CLERK_SECRET_KEY=sk_live_your_production_secret

# Production Webhook URL
# Update webhook URL in Clerk dashboard to your production domain
```

### 7.2 Set Up Cron Jobs

For daily credit resets, set up a cron job:

```bash
# Add to your server's crontab
0 0 * * * curl -X POST https://your-domain.com/api/cron/reset-credits
```

## 🔧 Step 8: Advanced Features

### 8.1 Stripe Integration

To add payment processing:

1. **Install Stripe:**
   ```bash
   npm install stripe @stripe/stripe-js
   ```

2. **Add Stripe keys to environment:**
   ```env
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable
   ```

3. **Create payment API routes** (see Stripe documentation)

### 8.2 Email Notifications

To add email notifications:

1. **Install email service:**
   ```bash
   npm install @sendgrid/mail
   ```

2. **Add SendGrid key:**
   ```env
   SENDGRID_API_KEY=your_sendgrid_key
   ```

3. **Create email service** for job notifications

## 🔧 Step 9: Monitoring and Analytics

### 9.1 Usage Analytics

Query user usage data:

```sql
-- Get usage summary for a user
SELECT * FROM get_user_usage_summary('user_id', 30);

-- Get system-wide usage
SELECT 
  plan,
  COUNT(*) as users,
  AVG(credits_remaining) as avg_credits
FROM user_profiles 
GROUP BY plan;
```

### 9.2 Audit Logs

Monitor user actions:

```sql
-- Recent user actions
SELECT * FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 100;

-- Failed actions
SELECT * FROM audit_logs 
WHERE action LIKE '%failed%' 
ORDER BY created_at DESC;
```

## 🔧 Step 10: Troubleshooting

### Common Issues

1. **Webhook not receiving events:**
   - Check webhook URL is correct
   - Verify webhook secret
   - Check server logs for errors

2. **User profile not created:**
   - Check Supabase RLS policies
   - Verify database functions exist
   - Check webhook processing logs

3. **Credits not resetting:**
   - Verify cron job is running
   - Check `reset_daily_credits()` function
   - Verify `credits_reset_date` logic

4. **Authentication errors:**
   - Check Clerk keys are correct
   - Verify middleware configuration
   - Check environment variables

### Debug Commands

```bash
# Check if all tables exist
psql -h your-supabase-host -U postgres -d postgres -c "\dt"

# Check RLS policies
psql -h your-supabase-host -U postgres -d postgres -c "SELECT * FROM pg_policies;"

# Test webhook endpoint
curl -X GET https://your-domain.com/api/clerk-webhook
```

## 🎉 Success!

Your SaaS application now has:

✅ **Complete authentication** with Clerk  
✅ **Automatic user profile creation** with free tier  
✅ **Credit-based usage tracking**  
✅ **Plan enforcement** and limits  
✅ **Audit logging** for compliance  
✅ **Webhook sync** between Clerk and Supabase  
✅ **Production-ready** database schema  

## 📚 Next Steps

1. **Add Stripe payments** for plan upgrades
2. **Implement email notifications** for job alerts
3. **Add analytics dashboard** for usage insights
4. **Set up monitoring** and alerting
5. **Add user onboarding** flow
6. **Implement referral system**

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Clerk and Supabase documentation
3. Check server logs for detailed error messages
4. Verify all environment variables are set correctly

Happy coding! 🚀 