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

        // Prepare the data object, handling optional fields
        const insertData: any = {
            job_title: jobTitle,
            keywords: keywords || '',
            location,
            min_salary: minSalary ? parseInt(minSalary) : null,
            notify_method: notifyMethod || 'Mail',
            experience: experience || '',
            email,
        };

        // Only include phone if it's provided and not empty
        if (phone && phone.trim() !== '') {
            insertData.phone = phone.trim();
        }

        // Use upsert to handle existing records
        const { error } = await supabase
            .from('job_preferences')
            .upsert([insertData], {
                onConflict: 'email',
                ignoreDuplicates: false
            });

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
