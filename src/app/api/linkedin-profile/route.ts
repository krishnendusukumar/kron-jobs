import { NextRequest, NextResponse } from 'next/server';
import { ProfileService } from '../../../lib/profile-service';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const profile = await ProfileService.getLinkedInProfile(userId);
        
        return NextResponse.json({
            success: true,
            profile
        });
    } catch (error) {
        console.error('Error in GET /api/linkedin-profile:', error);
        return NextResponse.json(
            { error: 'Failed to fetch LinkedIn profile' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, linkedinUrl, profileData } = body;

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        if (!linkedinUrl) {
            return NextResponse.json(
                { error: 'LinkedIn URL is required' },
                { status: 400 }
            );
        }

        // Validate LinkedIn URL
        if (!ProfileService.validateLinkedInUrl(linkedinUrl)) {
            return NextResponse.json(
                { error: 'Invalid LinkedIn URL format' },
                { status: 400 }
            );
        }

        // Parse LinkedIn profile data (this would typically come from LinkedIn API)
        // For now, we'll store the URL and any provided data
        const profile = {
            user_id: userId,
            linkedin_url: linkedinUrl,
            profile_data: profileData || {},
            name: profileData?.name,
            current_job_title: profileData?.current_job_title,
            company: profileData?.company,
            location: profileData?.location,
            summary: profileData?.summary,
            skills: profileData?.skills || [],
            experience: profileData?.experience || [],
            education: profileData?.education || [],
            certifications: profileData?.certifications || [],
            languages: profileData?.languages || []
        };

        const savedProfile = await ProfileService.saveLinkedInProfile(profile);

        if (!savedProfile) {
            return NextResponse.json(
                { error: 'Failed to save LinkedIn profile' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'LinkedIn profile saved successfully',
            profile: savedProfile
        });
    } catch (error) {
        console.error('Error in POST /api/linkedin-profile:', error);
        return NextResponse.json(
            { error: 'Failed to save LinkedIn profile' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, updates } = body;

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Get existing profile
        const existingProfile = await ProfileService.getLinkedInProfile(userId);
        if (!existingProfile) {
            return NextResponse.json(
                { error: 'LinkedIn profile not found' },
                { status: 404 }
            );
        }

        // Update profile
        const updatedProfile = {
            ...existingProfile,
            ...updates,
            user_id: userId
        };

        const savedProfile = await ProfileService.saveLinkedInProfile(updatedProfile);

        if (!savedProfile) {
            return NextResponse.json(
                { error: 'Failed to update LinkedIn profile' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'LinkedIn profile updated successfully',
            profile: savedProfile
        });
    } catch (error) {
        console.error('Error in PUT /api/linkedin-profile:', error);
        return NextResponse.json(
            { error: 'Failed to update LinkedIn profile' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const success = await ProfileService.deleteLinkedInProfile(userId);

        if (!success) {
            return NextResponse.json(
                { error: 'Failed to delete LinkedIn profile' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'LinkedIn profile deleted successfully'
        });
    } catch (error) {
        console.error('Error in DELETE /api/linkedin-profile:', error);
        return NextResponse.json(
            { error: 'Failed to delete LinkedIn profile' },
            { status: 500 }
        );
    }
} 