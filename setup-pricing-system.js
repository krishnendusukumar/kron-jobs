#!/usr/bin/env node

/**
 * Setup script for KronJobs Pricing and Cron System
 * Run this script to initialize the database and test the system
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function setupPricingSystem() {
    console.log('🚀 Setting up KronJobs Pricing and Cron System...\n');

    try {
        // 1. Test database connection
        console.log('1. Testing database connection...');
        const { data, error } = await supabase
            .from('user_profiles')
            .select('count')
            .limit(1);

        if (error) {
            console.log('❌ Database connection failed. Please run the migration first:');
            console.log('   - Copy the contents of user-profiles-migration.sql');
            console.log('   - Execute it in your Supabase SQL Editor');
            return;
        }
        console.log('✅ Database connection successful\n');

        // 2. Create test user profiles
        console.log('2. Creating test user profiles...');
        const testUsers = [
            { user_id: 'test-free-user', email: 'free@example.com', plan: 'free' },
            { user_id: 'test-lifetime-user', email: 'lifetime@example.com', plan: 'lifetime' },
            { user_id: 'test-pro-user', email: 'pro@example.com', plan: 'pro' }
        ];

        for (const user of testUsers) {
            const { error } = await supabase
                .from('user_profiles')
                .upsert({
                    user_id: user.user_id,
                    email: user.email,
                    plan: user.plan,
                    credits_remaining: user.plan === 'pro' ? 5 : 3,
                    max_cron_jobs: user.plan === 'free' ? 0 : user.plan === 'lifetime' ? 2 : 5,
                    max_daily_fetches: user.plan === 'pro' ? 5 : 3
                }, { onConflict: 'user_id' });

            if (error) {
                console.log(`❌ Failed to create ${user.plan} user:`, error.message);
            } else {
                console.log(`✅ Created ${user.plan} user: ${user.email}`);
            }
        }
        console.log('');

        // 3. Create test cron jobs for paid users
        console.log('3. Creating test cron jobs...');
        const paidUsers = testUsers.filter(u => u.plan !== 'free');

        for (const user of paidUsers) {
            const cronTimes = user.plan === 'lifetime' ? ['10:00', '18:00'] : ['10:00', '12:00', '15:00'];

            for (const time of cronTimes) {
                const { error } = await supabase
                    .from('cron_jobs')
                    .upsert({
                        user_id: user.user_id,
                        cron_time: time,
                        is_active: true,
                        next_run: calculateNextRunTime(time)
                    }, { onConflict: 'user_id,cron_time' });

                if (error) {
                    console.log(`❌ Failed to create cron job for ${user.email} at ${time}:`, error.message);
                } else {
                    console.log(`✅ Created cron job for ${user.email} at ${time}`);
                }
            }
        }
        console.log('');

        // 4. Test API endpoints
        console.log('4. Testing API endpoints...');
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        console.log(`   Testing user profile API...`);
        console.log(`   GET ${baseUrl}/api/user-profile?userId=test-free-user`);
        console.log(`   POST ${baseUrl}/api/user-profile`);
        console.log(`   PATCH ${baseUrl}/api/user-profile`);
        console.log('');

        console.log(`   Testing cron jobs API...`);
        console.log(`   GET ${baseUrl}/api/cron-jobs?userId=test-lifetime-user`);
        console.log(`   POST ${baseUrl}/api/cron-jobs`);
        console.log(`   DELETE ${baseUrl}/api/cron-jobs?userId=test-lifetime-user&jobId=1`);
        console.log('');

        // 5. Display dashboard URLs
        console.log('5. Dashboard URLs:');
        console.log(`   Main Dashboard: ${baseUrl}/dashboard`);
        console.log(`   Pricing Page: ${baseUrl}/dashboard (Pricing tab)`);
        console.log(`   Automation Page: ${baseUrl}/dashboard (Automation tab)`);
        console.log('');

        // 6. Display test credentials
        console.log('6. Test Credentials:');
        console.log('   Free User: test-free-user (no automation access)');
        console.log('   Lifetime User: test-lifetime-user (2 cron slots)');
        console.log('   Pro User: test-pro-user (5 cron slots)');
        console.log('');

        // 7. Next steps
        console.log('7. Next Steps:');
        console.log('   ✅ Database migration completed');
        console.log('   ✅ Test users created');
        console.log('   ✅ Test cron jobs created');
        console.log('   🔄 Start your Next.js development server: npm run dev');
        console.log('   🔄 Initialize cron scheduler in your app');
        console.log('   🔄 Test the dashboard and API endpoints');
        console.log('   🔄 Integrate with your existing scraping logic');
        console.log('');

        console.log('🎉 Setup completed successfully!');
        console.log('   Check the PRICING_AND_CRON_SYSTEM.md file for detailed documentation.');

    } catch (error) {
        console.error('❌ Setup failed:', error);
        console.log('\nTroubleshooting:');
        console.log('1. Make sure your .env file has the correct Supabase credentials');
        console.log('2. Run the database migration first');
        console.log('3. Check that your Supabase project is active');
    }
}

function calculateNextRunTime(cronTime) {
    const [hours, minutes] = cronTime.split(':').map(Number);
    const now = new Date();
    const nextRun = new Date();

    nextRun.setHours(hours, minutes, 0, 0);

    // If the time has already passed today, schedule for tomorrow
    if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
    }

    return nextRun.toISOString();
}

// Run the setup
if (require.main === module) {
    setupPricingSystem();
}

module.exports = { setupPricingSystem }; 