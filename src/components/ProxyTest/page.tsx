'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Wifi, WifiOff, DollarSign, Activity } from 'lucide-react';
import GradientButton from '../shared/GradientButton';

interface ProxyStats {
    totalRequests: number;
    totalBandwidthUsed: number;
    failedRequests: number;
    lastUsed: Date;
    estimatedCost: number;
    estimatedCostFormatted: string;
    bandwidthUsedMB: string;
    bandwidthUsedGB: string;
    successRate: string;
}

export default function ProxyTest() {
    const [stats, setStats] = useState<ProxyStats | null>(null);
    const [isTesting, setIsTesting] = useState(false);
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/proxy-stats');
            const data = await response.json();

            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching proxy stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const testConnection = async () => {
        setIsTesting(true);
        try {
            const response = await fetch('/api/test-proxy');
            const data = await response.json();
            setIsConnected(data.success);

            if (data.success) {
                await fetchStats(); // Refresh stats after successful test
            }
        } catch (error) {
            console.error('Error testing proxy:', error);
            setIsConnected(false);
        } finally {
            setIsTesting(false);
        }
    };

    const resetStats = async () => {
        try {
            await fetch('/api/proxy-stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reset' })
            });
            await fetchStats();
        } catch (error) {
            console.error('Error resetting stats:', error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="bg-white text-black border border-cyan-400/20 rounded-2xl p-6">
                <div className="flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                    <span className="ml-2 text-cyan-200">Loading proxy stats...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white text-black border border-cyan-400/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-cyan-200">Bright Data Proxy</h3>
                <div className="flex items-center space-x-2">
                    {isConnected === true && (
                        <div className="flex items-center text-green-400">
                            <Wifi className="w-4 h-4 mr-1" />
                            <span className="text-sm">Connected</span>
                        </div>
                    )}
                    {isConnected === false && (
                        <div className="flex items-center text-red-400">
                            <WifiOff className="w-4 h-4 mr-1" />
                            <span className="text-sm">Disconnected</span>
                        </div>
                    )}
                </div>
            </div>

            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-black/20 rounded-lg p-3">
                        <div className="flex items-center text-cyan-300">
                            <Activity className="w-4 h-4 mr-2" />
                            <span className="text-sm font-medium">Requests</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.totalRequests}</div>
                    </div>

                    <div className="bg-black/20 rounded-lg p-3">
                        <div className="flex items-center text-green-300">
                            <Wifi className="w-4 h-4 mr-2" />
                            <span className="text-sm font-medium">Success Rate</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.successRate}%</div>
                    </div>

                    <div className="bg-black/20 rounded-lg p-3">
                        <div className="flex items-center text-blue-300">
                            <Activity className="w-4 h-4 mr-2" />
                            <span className="text-sm font-medium">Bandwidth</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.bandwidthUsedMB} MB</div>
                    </div>

                    <div className="bg-black/20 rounded-lg p-3">
                        <div className="flex items-center text-yellow-300">
                            <DollarSign className="w-4 h-4 mr-2" />
                            <span className="text-sm font-medium">Cost</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.estimatedCostFormatted}</div>
                    </div>
                </div>
            )}

            <div className="flex space-x-3">
                <GradientButton
                    onClick={testConnection}
                    icon={isTesting ? RefreshCw : Wifi}
                    size="sm"
                    variant="primary"
                    disabled={isTesting}
                >
                    {isTesting ? 'Testing...' : 'Test Connection'}
                </GradientButton>

                <GradientButton
                    onClick={fetchStats}
                    icon={RefreshCw}
                    size="sm"
                    variant="outline"
                >
                    Refresh Stats
                </GradientButton>

                <GradientButton
                    onClick={resetStats}
                    icon={RefreshCw}
                    size="sm"
                    variant="outline"
                >
                    Reset Stats
                </GradientButton>
            </div>

            <div className="mt-4 text-xs text-gray-400">
                <p>• Residential IPs for natural browsing patterns</p>
                <p>• Automatic fallback to direct connection if proxy fails</p>
                <p>• Rate limited to 1-2 requests per second</p>
                <p>• Pay-as-you-go: $8.40/GB</p>
            </div>
        </div>
    );
} 