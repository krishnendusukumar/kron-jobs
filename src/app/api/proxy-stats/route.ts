import { NextRequest, NextResponse } from 'next/server';
import { proxyManager } from '@/lib/proxy-config';

export async function GET(req: NextRequest) {
    try {
        const stats = proxyManager.getStats();
        const estimatedCost = proxyManager.getEstimatedCost();
        
        return NextResponse.json({
            success: true,
            stats: {
                ...stats,
                estimatedCost: estimatedCost,
                estimatedCostFormatted: `$${estimatedCost.toFixed(4)}`,
                bandwidthUsedMB: (stats.totalBandwidthUsed / (1024 * 1024)).toFixed(2),
                bandwidthUsedGB: (stats.totalBandwidthUsed / (1024 * 1024 * 1024)).toFixed(4),
                successRate: stats.totalRequests > 0 
                    ? ((stats.totalRequests - stats.failedRequests) / stats.totalRequests * 100).toFixed(1)
                    : '0.0'
            }
        });
    } catch (error: any) {
        console.error('❌ Error fetching proxy stats:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal server error'
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { action } = await req.json();
        
        if (action === 'reset') {
            proxyManager.resetStats();
            return NextResponse.json({
                success: true,
                message: 'Proxy statistics reset successfully'
            });
        }
        
        return NextResponse.json({
            success: false,
            error: 'Invalid action'
        }, { status: 400 });
    } catch (error: any) {
        console.error('❌ Error in proxy stats action:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal server error'
        }, { status: 500 });
    }
} 