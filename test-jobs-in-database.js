// Test script to check if jobs are in the database
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testJobsInDatabase() {
    console.log('🧪 Testing jobs in database...\n');

    const userEmail = 'sukumarkrishnendu@gmail.com';

    try {
        // Check total jobs in database
        const { data: allJobs, error: allError } = await supabase
            .from('jobs')
            .select('*');

        if (allError) {
            console.error('❌ Error fetching all jobs:', allError);
            return;
        }

        console.log(`📊 Total jobs in database: ${allJobs?.length || 0}`);

        // Check jobs for specific user
        const { data: userJobs, error: userError } = await supabase
            .from('jobs')
            .select('*')
            .eq('user_id', userEmail)
            .order('created_at', { ascending: false })
            .limit(10);

        if (userError) {
            console.error('❌ Error fetching user jobs:', userError);
            return;
        }

        console.log(`📊 Jobs for user ${userEmail}: ${userJobs?.length || 0}`);

        if (userJobs && userJobs.length > 0) {
            console.log('\n📋 Recent jobs:');
            userJobs.forEach((job, index) => {
                console.log(`${index + 1}. ${job.title} at ${job.company}`);
                console.log(`   Location: ${job.location}`);
                console.log(`   Created: ${job.created_at}`);
                console.log(`   User ID: ${job.user_id}`);
                console.log('');
            });
        } else {
            console.log('❌ No jobs found for this user');

            // Check if there are any jobs with different user_id format
            const { data: otherJobs, error: otherError } = await supabase
                .from('jobs')
                .select('user_id, title, company')
                .limit(5);

            if (!otherError && otherJobs && otherJobs.length > 0) {
                console.log('🔍 Sample jobs with different user_id:');
                otherJobs.forEach(job => {
                    console.log(`- ${job.title} at ${job.company} (user_id: ${job.user_id})`);
                });
            }
        }

        // Check job_preferences
        const { data: preferences, error: prefError } = await supabase
            .from('job_preferences')
            .select('*')
            .eq('email', userEmail);

        if (prefError) {
            console.error('❌ Error fetching preferences:', prefError);
        } else {
            console.log(`📊 Job preferences for ${userEmail}: ${preferences?.length || 0}`);
            if (preferences && preferences.length > 0) {
                console.log('📋 Preferences:', preferences[0]);
            }
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testJobsInDatabase().catch(console.error); 