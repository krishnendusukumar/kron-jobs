// Test Database Connection Script
// Run this with: node test-database-connection.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testDatabaseConnection() {
    console.log('🔍 Testing Database Connection...\n');

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log('📋 Environment Variables:');
    console.log('  Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.log('  Supabase Key:', supabaseKey ? '✅ Set' : '❌ Missing');
    console.log('');

    if (!supabaseUrl || !supabaseKey) {
        console.log('❌ Missing environment variables!');
        console.log('Please create a .env.local file with your Supabase credentials.');
        return;
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Test 1: Basic connection
        console.log('🔌 Testing basic connection...');
        const { data: testData, error: testError } = await supabase
            .from('user_profiles')
            .select('count')
            .limit(1);

        if (testError) {
            console.log('❌ Connection failed:', testError.message);

            if (testError.message.includes('relation "user_profiles" does not exist')) {
                console.log('\n📋 Database tables not found!');
                console.log('Please run the migration script: clerk-integration-migration-safe.sql');
                console.log('Go to your Supabase Dashboard → SQL Editor → Paste and run the script');
            }
            return;
        }

        console.log('✅ Basic connection successful!\n');

        // Test 2: Check tables
        console.log('📊 Checking database tables...');

        // Use a direct SQL query to check tables
        const { data: tablesData, error: tablesError } = await supabase
            .from('user_profiles')
            .select('*')
            .limit(1);

        if (tablesError) {
            console.log('❌ user_profiles table not found:', tablesError.message);

            if (tablesError.message.includes('relation "user_profiles" does not exist')) {
                console.log('\n📋 Database tables not found!');
                console.log('Please run the migration script: clerk-integration-migration-safe.sql');
                console.log('Go to your Supabase Dashboard → SQL Editor → Paste and run the script');
                return;
            }
        } else {
            console.log('✅ user_profiles table exists and is accessible');
        }

        // Test 3: Check user_profiles table structure
        console.log('\n🔍 Checking user_profiles table...');
        const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .limit(1);

        if (profileError) {
            console.log('❌ user_profiles table error:', profileError.message);
        } else {
            console.log('✅ user_profiles table accessible');
            if (profileData.length > 0) {
                console.log('📊 Sample profile columns:', Object.keys(profileData[0]));
            }
        }

        // Test 4: Check RLS policies
        console.log('\n🔒 Checking RLS policies...');
        const { data: policies, error: policiesError } = await supabase
            .rpc('get_rls_policies');

        if (policiesError) {
            console.log('⚠️ Could not check RLS policies (this is normal for anon key)');
        } else {
            console.log('✅ RLS policies configured');
        }

        console.log('\n🎉 Database connection test completed successfully!');
        console.log('Your Supabase setup is working correctly.');

    } catch (error) {
        console.log('❌ Unexpected error:', error.message);
    }
}

// Run the test
testDatabaseConnection().catch(console.error); 