import { NextRequest, NextResponse } from 'next/server';
import { JobService } from '@/lib/job-service';

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

        const stats = await JobService.getJobStats(userId);

        return NextResponse.json({
            success: true,
            stats
        });

    } catch (error: any) {
        console.error('❌ Error fetching job stats:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal server error'
        }, { status: 500 });
    }
} 