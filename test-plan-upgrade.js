const { UserProfileService } = require('./src/lib/user-profile-service');

async function testPlanUpgrade() {
    console.log('🧪 Testing plan upgrade functionality...');

    // Test data
    const testUserId = 'test-user-' + Date.now();
    const testEmail = `test-${Date.now()}@example.com`;

    try {
        // 1. Create a test user profile
        console.log('📝 Creating test user profile...');
        const profile = await UserProfileService.createUserProfile(testUserId, testEmail);

        if (!profile) {
            console.error('❌ Failed to create test profile');
            return;
        }

        console.log('✅ Test profile created:', {
            userId: profile.user_id,
            email: profile.email,
            plan: profile.plan,
            credits: profile.credits_remaining,
            maxDailyFetches: profile.max_daily_fetches
        });

        // 2. Test weekly plan upgrade
        console.log('\n🔄 Testing weekly plan upgrade...');
        const weeklySuccess = await UserProfileService.upgradePlan(testUserId, 'weekly', 'test');

        if (weeklySuccess) {
            const updatedProfile = await UserProfileService.getUserProfile(testUserId);
            console.log('✅ Weekly plan upgrade successful:', {
                plan: updatedProfile.plan,
                credits: updatedProfile.credits_remaining,
                maxDailyFetches: updatedProfile.max_daily_fetches,
                maxCronJobs: updatedProfile.max_cron_jobs
            });

            // Verify unlimited credits
            if (updatedProfile.credits_remaining === 999999 && updatedProfile.max_daily_fetches === 999999) {
                console.log('✅ Unlimited credits correctly set for weekly plan');
            } else {
                console.error('❌ Weekly plan should have unlimited credits');
            }
        } else {
            console.error('❌ Weekly plan upgrade failed');
        }

        // 3. Test monthly plan upgrade
        console.log('\n🔄 Testing monthly plan upgrade...');
        const monthlySuccess = await UserProfileService.upgradePlan(testUserId, 'monthly', 'test');

        if (monthlySuccess) {
            const updatedProfile = await UserProfileService.getUserProfile(testUserId);
            console.log('✅ Monthly plan upgrade successful:', {
                plan: updatedProfile.plan,
                credits: updatedProfile.credits_remaining,
                maxDailyFetches: updatedProfile.max_daily_fetches,
                maxCronJobs: updatedProfile.max_cron_jobs
            });

            // Verify unlimited credits
            if (updatedProfile.credits_remaining === 999999 && updatedProfile.max_daily_fetches === 999999) {
                console.log('✅ Unlimited credits correctly set for monthly plan');
            } else {
                console.error('❌ Monthly plan should have unlimited credits');
            }
        } else {
            console.error('❌ Monthly plan upgrade failed');
        }

        console.log('\n🎉 Plan upgrade test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testPlanUpgrade(); 