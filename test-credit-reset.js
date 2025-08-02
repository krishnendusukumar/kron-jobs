const { UserProfileService } = require('./src/lib/user-profile-service');

async function testCreditReset() {
    console.log('🧪 Testing daily credit reset functionality...');

    // Test data
    const testUserId = 'test-credit-reset-' + Date.now();
    const testEmail = `test-credit-reset-${Date.now()}@example.com`;

    try {
        // 1. Create a test user profile with weekly plan
        console.log('📝 Creating test user profile with weekly plan...');
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

        // 2. Upgrade to weekly plan
        console.log('\n🔄 Upgrading to weekly plan...');
        const weeklySuccess = await UserProfileService.upgradePlan(testUserId, 'weekly', 'test');

        if (weeklySuccess) {
            const updatedProfile = await UserProfileService.getUserProfile(testUserId);
            console.log('✅ Weekly plan upgrade successful:', {
                plan: updatedProfile.plan,
                credits: updatedProfile.credits_remaining,
                maxDailyFetches: updatedProfile.max_daily_fetches
            });
        } else {
            console.error('❌ Weekly plan upgrade failed');
            return;
        }

        // 3. Simulate credit consumption (should not reduce credits for unlimited plan)
        console.log('\n🔄 Testing credit consumption for unlimited plan...');
        const consumeResult = await UserProfileService.consumeCredit(testUserId);

        if (consumeResult) {
            const profileAfterConsumption = await UserProfileService.getUserProfile(testUserId);
            console.log('✅ Credit consumption successful:', {
                credits: profileAfterConsumption.credits_remaining,
                expected: 'Should remain 999999 (unlimited)'
            });

            if (profileAfterConsumption.credits_remaining === 999999) {
                console.log('✅ Credits correctly maintained at unlimited level');
            } else {
                console.error('❌ Credits were reduced, should remain unlimited');
            }
        } else {
            console.error('❌ Credit consumption failed');
        }

        // 4. Test daily credit reset
        console.log('\n🔄 Testing daily credit reset...');
        await UserProfileService.resetDailyCredits();

        const profileAfterReset = await UserProfileService.getUserProfile(testUserId);
        console.log('✅ Credit reset completed:', {
            plan: profileAfterReset.plan,
            credits: profileAfterReset.credits_remaining,
            maxDailyFetches: profileAfterReset.max_daily_fetches
        });

        // Verify unlimited credits are maintained after reset
        if (profileAfterReset.credits_remaining === 999999 && profileAfterReset.max_daily_fetches === 999999) {
            console.log('✅ Unlimited credits correctly maintained after daily reset');
        } else {
            console.error('❌ Credits were reset to limited values, should remain unlimited');
        }

        console.log('\n🎉 Credit reset test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testCreditReset(); 