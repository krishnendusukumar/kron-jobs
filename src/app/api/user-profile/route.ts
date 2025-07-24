import { NextRequest, NextResponse } from 'next/server';
import { UserProfileService } from '../../../lib/user-profile-service';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const email = searchParams.get('email');

        console.log('🔍 /api/user-profile called with:', { userId, email, url: request.url });

        if (!userId && !email) {
            return NextResponse.json(
                { error: 'userId or email parameter is required' },
                { status: 400 }
            );
        }

        let profile;
        if (userId) {
            profile = await UserProfileService.getUserProfile(userId);
        } else if (email) {
            // For email-based lookup, we'll need to find by email
            // This would require a different approach since our service uses userId
            return NextResponse.json(
                { error: 'Email-based lookup not implemented yet' },
                { status: 400 }
            );
        }

        if (!profile) {
            console.log('❌ No user profile found for user ID:', userId, '(This is normal for new users)');
            return NextResponse.json(
                { error: 'User profile not found' },
                { status: 404 }
            );
        }

        console.log('✅ Debug - User profile fetched successfully:', profile ? 'Found' : 'Not found');
        return NextResponse.json({ profile });
    } catch (error) {
        console.error('Error in GET /api/user-profile:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, email } = body;

        if (!userId || !email) {
            return NextResponse.json(
                { error: 'userId and email are required' },
                { status: 400 }
            );
        }

        const profile = await UserProfileService.getOrCreateUserProfile(userId, email);

        if (!profile) {
            return NextResponse.json(
                { error: 'Failed to create user profile' },
                { status: 500 }
            );
        }

        return NextResponse.json({ profile });
    } catch (error) {
        console.error('Error in POST /api/user-profile:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, plan, source = 'manual' } = body;

        if (!userId || !plan) {
            return NextResponse.json(
                { error: 'userId and plan are required' },
                { status: 400 }
            );
        }

        if (!['lifetime', 'pro'].includes(plan)) {
            return NextResponse.json(
                { error: 'Invalid plan. Must be "lifetime" or "pro"' },
                { status: 400 }
            );
        }

        const success = await UserProfileService.upgradePlan(userId, plan, source);

        if (!success) {
            return NextResponse.json(
                { error: 'Failed to upgrade plan' },
                { status: 500 }
            );
        }

        // Get updated profile
        const profile = await UserProfileService.getUserProfile(userId);

        return NextResponse.json({
            success: true,
            message: `Successfully upgraded to ${plan} plan`,
            profile
        });
    } catch (error) {
        console.error('Error in PATCH /api/user-profile:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 