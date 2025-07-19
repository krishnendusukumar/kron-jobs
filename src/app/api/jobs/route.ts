import { NextRequest, NextResponse } from 'next/server';
import { JobService } from '@/lib/job-service';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const keywords = searchParams.get('keywords') || undefined;
        const location = searchParams.get('location') || undefined;
        const applied = searchParams.get('applied') === 'true';
        const hidden = searchParams.get('hidden') === 'true';
        const interview = searchParams.get('interview') === 'true';
        const rejected = searchParams.get('rejected') === 'true';
        const limit = parseInt(searchParams.get('limit') || '20');
        const page = parseInt(searchParams.get('page') || '1');
        const offset = (page - 1) * limit; // Convert page to offset
        const sortBy = searchParams.get('sortBy') as any || 'created_at';
        const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc';

        if (!userId) {
            return NextResponse.json({
                success: false,
                error: 'userId is required'
            }, { status: 400 });
        }

        const filters = {
            userId,
            keywords,
            location,
            applied: applied || undefined,
            hidden: hidden || undefined,
            interview: interview || undefined,
            rejected: rejected || undefined,
            limit,
            offset,
            sortBy,
            sortOrder,
        };

        const result = await JobService.getJobs(filters);

        const totalPages = Math.ceil(result.total / limit);

        return NextResponse.json({
            success: true,
            jobs: result.jobs,
            pagination: {
                total: result.total,
                totalPages,
                currentPage: page,
                limit,
                offset,
                hasMore: page < totalPages,
            },
        });

    } catch (error: any) {
        console.error('❌ Error fetching jobs:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal server error'
        }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const jobId = searchParams.get('jobId');
        const userId = searchParams.get('userId');
        const action = searchParams.get('action'); // applied, hidden, interview, rejected

        if (!jobId || !userId || !action) {
            return NextResponse.json({
                success: false,
                error: 'Job ID, User ID, and action are required'
            }, { status: 400 });
        }

        if (!['applied', 'hidden', 'interview', 'rejected'].includes(action)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid action'
            }, { status: 400 });
        }

        const updates: any = {};
        updates[action] = true;

        await JobService.updateJobStatus(jobId, userId, updates);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('❌ Error updating job status:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal server error'
        }, { status: 500 });
    }
} 