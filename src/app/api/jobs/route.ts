import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const status = searchParams.get('status'); // applied, hidden, interview, rejected

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
        }

        let query = supabase
            .from('jobs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        // Add status filter if provided
        if (status && ['applied', 'hidden', 'interview', 'rejected'].includes(status)) {
            query = query.eq(status, 1);
        }

        // Add pagination
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data: jobs, error, count } = await query;

        console.log('Jobs API query result:', { jobs, error, count, userId, status });

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            jobs,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            }
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const jobId = searchParams.get('jobId');
        const action = searchParams.get('action'); // applied, hidden, interview, rejected

        if (!jobId || !action) {
            return NextResponse.json({ success: false, error: 'Job ID and action are required' }, { status: 400 });
        }

        if (!['applied', 'hidden', 'interview', 'rejected'].includes(action)) {
            return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }

        const updateData: any = {};
        updateData[action] = 1;

        const { error } = await supabase
            .from('jobs')
            .update(updateData)
            .eq('id', jobId);

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
} 