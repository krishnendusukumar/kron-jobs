import { NextRequest, NextResponse } from 'next/server';
import { JobService } from '@/lib/job-service';

export async function POST(req: NextRequest) {
    try {
        const { userId, keywords, location, f_WT = '2', timespan = 'r86400', start = 0 } = await req.json();

        if (!userId || !keywords || !location) {
            return NextResponse.json({
                success: false,
                error: 'userId, keywords, and location are required'
            }, { status: 400 });
        }

        console.log(`🔄 Requesting scraping job for user: ${userId}`);

        const result = await JobService.requestScraping({
            userId,
            keywords,
            location,
            f_WT,
            timespan,
            start,
        });

        return NextResponse.json({
            success: true,
            jobId: result.jobId,
            status: result.status,
            message: 'Scraping job queued successfully. Jobs will be available shortly.'
        });

    } catch (error: any) {
        console.error('❌ Error requesting scraping job:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal server error'
        }, { status: 500 });
    }
} 