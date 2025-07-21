// Test job_preferences table structure
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testJobPreferences() {
    console.log('🔍 Testing job_preferences table...\n');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.log('❌ Missing environment variables!');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Test 1: Check table structure
        console.log('🔍 Checking job_preferences table structure...');
        const { data: prefsData, error: prefsError } = await supabase
            .from('job_preferences')
            .select('*')
            .limit(1);

        if (prefsError) {
            console.log('❌ job_preferences table error:', prefsError.message);
            return;
        }

        console.log('✅ job_preferences table exists and is accessible');
        if (prefsData.length > 0) {
            console.log('📊 Sample job_preferences columns:', Object.keys(prefsData[0]));
        } else {
            console.log('📊 No existing preferences found');
        }

        // Test 2: Try to insert a test preference
        console.log('\n🔍 Testing preference insertion...');
        const testPreference = {
            email: 'test@example.com',
            job_title: 'Software Engineer',
            keywords: 'React, JavaScript',
            location: 'New York, NY',
            experience: 'mid',
            notify_method: 'Mail'
        };

        const { data: insertData, error: insertError } = await supabase
            .from('job_preferences')
            .upsert(testPreference, {
                onConflict: 'email',
                ignoreDuplicates: false
            })
            .select()
            .single();

        if (insertError) {
            console.log('❌ Error inserting test preference:', insertError.message);
        } else {
            console.log('✅ Test preference inserted/updated successfully:', insertData);

            // Clean up test preference
            const { error: deleteError } = await supabase
                .from('job_preferences')
                .delete()
                .eq('email', 'test@example.com');

            if (deleteError) {
                console.log('⚠️ Could not clean up test preference:', deleteError.message);
            } else {
                console.log('✅ Test preference cleaned up');
            }
        }

    } catch (error) {
        console.log('❌ Unexpected error:', error.message);
    }
}

// Run the test
testJobPreferences().catch(console.error); 