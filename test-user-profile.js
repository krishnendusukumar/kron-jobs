const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase environment variables not configured');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUserProfile() {
    try {
        console.log('🔍 Testing user profile creation...');

        const testEmail = 'test@example.com';
        const testUserId = 'test@example.com';

        // Check if user profile exists
        const { data: existingProfile, error: fetchError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', testUserId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('❌ Error fetching user profile:', fetchError);
            return;
        }

        if (existingProfile) {
            console.log('✅ User profile exists:', existingProfile);
        } else {
            console.log('🔍 Creating new user profile...');

            const profileData = {
                user_id: testUserId,
                clerk_user_id: testUserId,
                email: testEmail,
                plan: 'free',
                credits_remaining: 3,
                credits_reset_date: new Date().toISOString().split('T')[0],
                max_cron_jobs: 0,
                max_daily_fetches: 3,
                sign_up_date: new Date().toISOString()
            };

            const { data: newProfile, error: createError } = await supabase
                .from('user_profiles')
                .insert(profileData)
                .select()
                .single();

            if (createError) {
                console.error('❌ Error creating user profile:', createError);
                return;
            }

            console.log('✅ User profile created successfully:', newProfile);
        }

        // Test job preferences
        console.log('🔍 Testing job preferences...');

        const { data: preferences, error: prefError } = await supabase
            .from('job_preferences')
            .select('*')
            .eq('email', testEmail)
            .single();

        if (prefError && prefError.code !== 'PGRST116') {
            console.error('❌ Error fetching job preferences:', prefError);
        } else if (preferences) {
            console.log('✅ Job preferences exist:', preferences);
        } else {
            console.log('ℹ️ No job preferences found for test user');
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

testUserProfile(); 