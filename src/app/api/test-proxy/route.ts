import { NextRequest, NextResponse } from 'next/server';
import { testProxyConnection } from '@/lib/linkedin-scraper';

export async function GET(req: NextRequest) {
    try {
        console.log('🧪 Testing Bright Data proxy connection...');

        const isWorking = await testProxyConnection();

        if (isWorking) {
            return NextResponse.json({
                success: true,
                message: 'Proxy connection test successful',
                timestamp: new Date().toISOString()
            });
        } else {
            return NextResponse.json({
                success: false,
                message: 'Proxy connection test failed',
                timestamp: new Date().toISOString()
            }, { status: 500 });
        }
    } catch (error: any) {
        console.error('❌ Error testing proxy:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal server error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
} 