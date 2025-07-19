import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

// Bright Data Residential Proxy Configuration
const PROXY_CONFIG = {
    host: 'pr.oxylabs.io',
    port: 7777,
    username: 'customer-krishnendu_6SII9-cc-US',
    password: 'INDU+k19651965',
    protocol: 'https'
};

// Proxy URL with authentication
const PROXY_URL = `https://${PROXY_CONFIG.username}:${PROXY_CONFIG.password}@${PROXY_CONFIG.host}:${PROXY_CONFIG.port}`;

// Browser-like headers to avoid detection
const BROWSER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Referer': 'https://www.linkedin.com/jobs/',
    'Origin': 'https://www.linkedin.com',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
};

// Bandwidth tracking
let totalBandwidthUsed = 0;

export interface ProxyStats {
    totalRequests: number;
    totalBandwidthUsed: number;
    failedRequests: number;
    lastUsed: Date;
}

class ProxyManager {
    private axiosInstance: AxiosInstance;
    private stats: ProxyStats = {
        totalRequests: 0,
        totalBandwidthUsed: 0,
        failedRequests: 0,
        lastUsed: new Date()
    };

    constructor() {
        this.axiosInstance = this.createProxyAxiosInstance();
    }

    private createProxyAxiosInstance(): AxiosInstance {
        const httpsAgent = new HttpsProxyAgent(PROXY_URL, {
            rejectUnauthorized: false // Allow self-signed certificates
        });

        return axios.create({
            httpsAgent,
            timeout: 30000, // 30 seconds timeout
            headers: BROWSER_HEADERS,
            maxRedirects: 5,
            validateStatus: (status) => status < 500 && status !== 407 && status !== 403, // Accept all status codes < 500 except 407 and 403
        });
    }

    /**
     * Make a request through the proxy with automatic retry and fallback
     */
    async request<T = any>(config: AxiosRequestConfig): Promise<T> {
        const startTime = Date.now();
        this.stats.totalRequests++;
        this.stats.lastUsed = new Date();

        try {
            console.log(`🌐 Proxy request to: ${config.url}`);

            const response = await this.axiosInstance.request(config);

            // Check for proxy authentication error (407) or LinkedIn blocking (403)
            if (response.status === 407) {
                console.log('🔐 Proxy authentication failed (407), falling back to direct connection...');
                return this.fallbackToDirect(config);
            }

            if (response.status === 403) {
                console.log('🚫 LinkedIn blocked proxy request (403), falling back to direct connection...');
                return this.fallbackToDirect(config);
            }

            // Track bandwidth usage (approximate)
            const responseSize = JSON.stringify(response.data).length;
            this.stats.totalBandwidthUsed += responseSize;

            const duration = Date.now() - startTime;
            console.log(`✅ Proxy request successful: ${response.status} (${duration}ms, ~${Math.round(responseSize / 1024)}KB)`);

            return response.data;
        } catch (error: any) {
            this.stats.failedRequests++;
            const duration = Date.now() - startTime;

            console.error(`❌ Proxy request failed: ${error.message} (${duration}ms)`);

            // If proxy fails, try direct connection as fallback
            if (this.shouldFallbackToDirect(error)) {
                console.log('🔄 Falling back to direct connection...');
                return this.fallbackToDirect(config);
            }

            throw error;
        }
    }

    /**
     * Determine if we should fallback to direct connection
     */
    private shouldFallbackToDirect(error: any): boolean {
        const proxyErrors = [
            'ECONNREFUSED',
            'ETIMEDOUT',
            'ENOTFOUND',
            'ECONNRESET',
            'PROXY_AUTHENTICATION_FAILED'
        ];

        // Check for proxy authentication error (407) or LinkedIn blocking (403)
        if (error.response?.status === 407 || error.response?.status === 403) {
            return true;
        }

        return proxyErrors.some(errType =>
            error.code === errType ||
            error.message?.includes(errType) ||
            error.message?.includes('proxy')
        );
    }

    /**
     * Fallback to direct connection without proxy
     */
    private async fallbackToDirect<T = any>(config: AxiosRequestConfig): Promise<T> {
        console.log('🌐 Direct request (no proxy):', config.url);

        const directAxios = axios.create({
            timeout: 30000,
            headers: BROWSER_HEADERS,
            maxRedirects: 5,
            validateStatus: (status) => status < 500,
        });

        const response = await directAxios.request(config);
        return response.data;
    }

    /**
     * Get proxy statistics
     */
    getStats(): ProxyStats {
        return { ...this.stats };
    }

    /**
     * Get estimated cost based on bandwidth usage
     */
    getEstimatedCost(): number {
        const gbUsed = this.stats.totalBandwidthUsed / (1024 * 1024 * 1024);
        return gbUsed * 8.40; // $8.40 per GB
    }

    /**
     * Reset statistics
     */
    resetStats(): void {
        this.stats = {
            totalRequests: 0,
            totalBandwidthUsed: 0,
            failedRequests: 0,
            lastUsed: new Date()
        };
    }

    /**
     * Check if proxy is working
     */
    async testConnection(): Promise<boolean> {
        try {
            await this.request({
                method: 'GET',
                url: 'https://httpbin.org/ip',
                timeout: 10000
            });
            console.log('✅ Proxy connection test successful');
            return true;
        } catch (error) {
            console.error('❌ Proxy connection test failed:', error);
            return false;
        }
    }
}

// Singleton instance
export const proxyManager = new ProxyManager();

// Export the proxy-enabled axios instance for direct use
export const proxyAxios = proxyManager['axiosInstance'];

// Utility function to make proxy requests
export async function makeProxyRequest<T = any>(config: AxiosRequestConfig): Promise<T> {
    return proxyManager.request(config);
}

// Export for use in other modules
export { PROXY_CONFIG, BROWSER_HEADERS }; 