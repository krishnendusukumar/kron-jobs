# Environment Setup Guide

## 🔧 **Step 1: Create Environment File**

Create a `.env.local` file in the root directory with the following content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Webhook Configuration
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret_here

# Optional: Proxy Configuration
PROXY_URL=your_proxy_url_here
PROXY_USERNAME=your_proxy_username_here
PROXY_PASSWORD=your_proxy_password_here
```

## 🗄️ **Step 2: Set Up Supabase Database**

### **Option A: Use the Safe Migration (Recommended)**

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the entire content from `clerk-integration-migration-safe.sql`
4. Run the script

### **Option B: Manual Setup**

If you prefer to run migrations step by step:

1. **Run the basic setup:**
   ```sql
   -- Copy content from database-setup.sql
   ```

2. **Run the Clerk integration:**
   ```sql
   -- Copy content from clerk-integration-migration-safe.sql
   ```

## 🔑 **Step 3: Get Your API Keys**

### **Supabase Keys:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy:
   - Project URL
   - Anon/public key

### **Clerk Keys:**
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to API Keys
4. Copy:
   - Publishable Key
   - Secret Key
   - Webhook Secret (create one if needed)

## 🚀 **Step 4: Test the Setup**

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Check the console** for any remaining errors

3. **Test authentication flow:**
   - Go to `/sign-in`
   - Try to sign up/sign in
   - Check if user profile is created in Supabase

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **"Error fetching user profile"**
   - Make sure Supabase tables exist
   - Check environment variables are set correctly
   - Verify Supabase connection

2. **"Clerk not configured"**
   - Check Clerk environment variables
   - Verify Clerk application is set up

3. **"Database connection failed"**
   - Check Supabase URL and key
   - Verify RLS policies are set up correctly

### **Debug Steps:**

1. **Check environment variables:**
   ```javascript
   console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
   console.log('Clerk Key:', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
   ```

2. **Test Supabase connection:**
   ```javascript
   const { data, error } = await supabase.from('user_profiles').select('count');
   console.log('Supabase test:', { data, error });
   ```

3. **Check database tables:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

## 📋 **Required Tables**

After running the migration, you should have these tables:

- `user_profiles` - User account information
- `user_usage` - Usage tracking
- `billing_subscriptions` - Payment information
- `audit_logs` - Activity logging
- `cron_jobs` - Automated job scheduling
- `cron_executions` - Execution history
- `job_preferences` - User job search preferences
- `jobs` - Scraped job listings

## ✅ **Verification Checklist**

- [ ] `.env.local` file created with all required keys
- [ ] Supabase database migration completed successfully
- [ ] Clerk application configured
- [ ] Development server starts without errors
- [ ] User can sign up/sign in
- [ ] User profile is created in database
- [ ] Dashboard loads without errors

## 🆘 **Need Help?**

If you're still experiencing issues:

1. Check the browser console for specific error messages
2. Verify all environment variables are set correctly
3. Ensure database tables exist and have proper permissions
4. Check Clerk webhook configuration if using webhooks 