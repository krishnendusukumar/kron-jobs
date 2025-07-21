import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        console.log('🔍 Testing Supabase connection from API route...');

        // Test basic connection
        const { data, error } = await supabase
            .from('user_profiles')
            .select('count')
            .limit(1);

        if (error) {
            console.error('❌ Supabase error:', error);
            return NextResponse.json({
                success: false,
                error: error.message,
                details: error
            }, { status: 500 });
        }

        console.log('✅ Supabase connection successful');
        return NextResponse.json({
            success: true,
            message: 'Supabase connection working',
            data: data
        });

    } catch (error) {
        console.error('❌ Unexpected error:', error);
        return NextResponse.json({
            success: false,
            error: 'Unexpected error',
            details: error
        }, { status: 500 });
    }
} 