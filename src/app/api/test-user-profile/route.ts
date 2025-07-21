import { NextRequest, NextResponse } from 'next/server';
import { UserProfileService } from '@/lib/user-profile-service';

export async function POST(req: NextRequest) {
    try {
        const { userId, email } = await req.json();

        if (!userId || !email) {
            return NextResponse.json({
                success: false,
                error: 'userId and email are required'
            }, { status: 400 });
        }

        console.log('🧪 Testing user profile for:', userId, email);

        // Test getting user profile
        const existingProfile = await UserProfileService.getUserProfile(userId);
        console.log('🔍 Existing profile:', existingProfile ? 'Found' : 'Not found');

        // Test get or create
        const profile = await UserProfileService.getOrCreateUserProfile(userId, email);
        console.log('✅ Final profile:', profile ? 'Created/Found' : 'Failed');

        return NextResponse.json({
            success: true,
            existingProfile: existingProfile ? 'Found' : 'Not found',
            finalProfile: profile ? 'Success' : 'Failed',
            profile: profile,
            message: profile ? 'User profile test completed successfully' : 'User profile test failed'
        });

    } catch (error: any) {
        console.error('❌ Error in test-user-profile:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal server error'
        }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({
                success: false,
                error: 'userId is required'
            }, { status: 400 });
        }

        console.log('🧪 Testing user profile retrieval for:', userId);

        const profile = await UserProfileService.getUserProfile(userId);

        return NextResponse.json({
            success: true,
            profile: profile,
            found: !!profile,
            message: profile ? 'User profile found' : 'User profile not found'
        });

    } catch (error: any) {
        console.error('❌ Error in test-user-profile GET:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal server error'
        }, { status: 500 });
    }
} 