import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        const {
            jobTitle,
            keywords,
            location,
            minSalary,
            notifyMethod,
            experience,
            phone,
            email,
        } = data;

        const { error } = await supabase.from('job_preferences').insert([
            {
                job_title: jobTitle,
                keywords,
                location,
                min_salary: parseInt(minSalary),
                notify_method: notifyMethod,
                experience,
                phone,
                email,
            },
        ]);

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
