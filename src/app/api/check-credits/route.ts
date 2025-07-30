import { NextRequest, NextResponse } from 'next/server';
import { UserProfileService } from '@/lib/user-profile-service';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({
                success: false,
                error: 'User ID is required'
            }, { status: 400 });
        }

        // Get user profile to check plan type
        const userProfile = await UserProfileService.getUserProfile(userId);
        if (!userProfile) {
            return NextResponse.json({
                success: false,
                error: 'User profile not found',
                message: '❌ User profile not found. Please try refreshing the page.'
            }, { status: 404 });
        }

        // Check if user has unlimited search (weekly/monthly plans)
        const hasUnlimitedSearch = userProfile.plan === 'weekly' || userProfile.plan === 'monthly';

        if (hasUnlimitedSearch) {
            // Unlimited plans can always perform job searches
            return NextResponse.json({
                success: true,
                message: '✅ Unlimited job search available',
                limits: {
                    can_perform_action: true,
                    credits_remaining: 999999,
                    daily_searches_used: 0,
                    daily_searches_limit: 999999,
                    cron_jobs_used: 0,
                    cron_jobs_limit: userProfile.max_cron_jobs
                }
            });
        }

        // For free plan users, check credits normally
        const canPerform = await UserProfileService.canPerformAction(userId, 'job_search');

        if (!canPerform) {
            // Get current limits to provide specific error message
            const limits = await UserProfileService.getUserLimits(userId);

            if (limits) {
                if (limits.credits_remaining <= 0) {
                    return NextResponse.json({
                        success: false,
                        error: 'No credits remaining',
                        message: '❌ No credits remaining! Please upgrade your plan or wait for daily reset tomorrow.',
                        limits
                    });
                } else if (limits.daily_searches_used >= limits.daily_searches_limit) {
                    return NextResponse.json({
                        success: false,
                        error: 'Daily limit reached',
                        message: `❌ Daily search limit reached! You've used ${limits.daily_searches_used}/${limits.daily_searches_limit} searches today. Come back tomorrow!`,
                        limits
                    });
                }
            }

            return NextResponse.json({
                success: false,
                error: 'Cannot perform action',
                message: '❌ Cannot perform job search at this time. Please try again later.',
                limits
            });
        }

        // Consume credit
        const creditConsumed = await UserProfileService.consumeCredit(userId);

        if (!creditConsumed) {
            return NextResponse.json({
                success: false,
                error: 'Failed to consume credit',
                message: '❌ Failed to process credit. Please try again.'
            });
        }

        // Track usage
        await UserProfileService.trackUsage(userId, 'job_search', 1, {
            action: 'manual_job_search',
            timestamp: new Date().toISOString()
        });

        // Get updated profile
        const updatedProfile = await UserProfileService.getUserProfile(userId);

        return NextResponse.json({
            success: true,
            message: '✅ Credit consumed successfully',
            profile: updatedProfile
        });

    } catch (error: any) {
        console.error('❌ Error in check-credits:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal server error'
        }, { status: 500 });
    }
} 