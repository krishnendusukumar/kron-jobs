// Test job_tasks table existence
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testJobTasksTable() {
    console.log('🔍 Testing job_tasks table...\n');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.log('❌ Missing environment variables!');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Test 1: Check if job_tasks table exists
        console.log('🔍 Checking if job_tasks table exists...');
        const { data: tasksData, error: tasksError } = await supabase
            .from('job_tasks')
            .select('*')
            .limit(1);

        if (tasksError) {
            console.log('❌ job_tasks table error:', tasksError.message);

            if (tasksError.message.includes('relation "job_tasks" does not exist')) {
                console.log('\n📋 job_tasks table not found!');
                console.log('Please run the database migration: database-setup.sql');
                console.log('Go to your Supabase Dashboard → SQL Editor → Run database-setup.sql');
                return;
            }
        } else {
            console.log('✅ job_tasks table exists and is accessible');
            if (tasksData.length > 0) {
                console.log('📊 Sample job_tasks columns:', Object.keys(tasksData[0]));
            }
        }

        // Test 2: Try to insert a test job
        console.log('\n🔍 Testing job insertion...');
        const testJob = {
            id: `test_${Date.now()}`,
            user_id: 'test@example.com',
            keywords: 'test job',
            location: 'test location',
            f_wt: '2',
            timespan: 'r86400',
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            completed_at: null,
            error: null,
            results: null
        };

        const { data: insertData, error: insertError } = await supabase
            .from('job_tasks')
            .insert(testJob)
            .select()
            .single();

        if (insertError) {
            console.log('❌ Error inserting test job:', insertError.message);
        } else {
            console.log('✅ Test job inserted successfully:', insertData.id);

            // Clean up test job
            const { error: deleteError } = await supabase
                .from('job_tasks')
                .delete()
                .eq('id', testJob.id);

            if (deleteError) {
                console.log('⚠️ Could not clean up test job:', deleteError.message);
            } else {
                console.log('✅ Test job cleaned up');
            }
        }

    } catch (error) {
        console.log('❌ Unexpected error:', error.message);
    }
}

// Run the test
testJobTasksTable().catch(console.error); 