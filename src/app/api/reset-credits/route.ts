import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        // This endpoint is for testing purposes only
        // In production, this should be protected or removed

        console.log('🔄 Manually resetting daily credits...');

        // Call the database function to reset credits
        const { error } = await supabase.rpc('reset_daily_credits');

        if (error) {
            console.error('❌ Error resetting credits:', error);
            return NextResponse.json({
                success: false,
                error: error.message
            }, { status: 500 });
        }

        console.log('✅ Daily credits reset successfully');

        return NextResponse.json({
            success: true,
            message: '✅ Daily credits reset successfully at ' + new Date().toISOString(),
            resetTime: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('❌ Error in reset-credits:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal server error'
        }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        // Get current credit reset status
        const { data: userProfiles, error } = await supabase
            .from('user_profiles')
            .select('user_id, email, plan, credits_remaining, credits_reset_date')
            .order('credits_reset_date', { ascending: false })
            .limit(10);

        if (error) {
            console.error('❌ Error fetching user profiles:', error);
            return NextResponse.json({
                success: false,
                error: error.message
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Credit reset status',
            userProfiles,
            currentTime: new Date().toISOString(),
            nextResetTime: new Date().toISOString().split('T')[0] + 'T00:00:00.000Z' // Next midnight UTC
        });

    } catch (error: any) {
        console.error('❌ Error in reset-credits GET:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal server error'
        }, { status: 500 });
    }
} 