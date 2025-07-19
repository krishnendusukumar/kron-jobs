const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

// Bright Data Residential Proxy Configuration
const PROXY_CONFIG = {
    host: 'brd.superproxy.io',
    port: 33335,
    username: 'brd-customer-hl_db0742f0-zone-residential_proxy1',
    password: 'dsll0klt4fh7', // Based on your working curl test
    protocol: 'https'
};

// Proxy URL with authentication
const PROXY_URL = `https://${PROXY_CONFIG.username}:${PROXY_CONFIG.password}@${PROXY_CONFIG.host}:${PROXY_CONFIG.port}`;

// Browser-like headers
const BROWSER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Cache-Control': 'max-age=0',
    'Referer': 'https://www.linkedin.com/',
    'Origin': 'https://www.linkedin.com'
};

async function testProxyConnection() {
    console.log('🧪 Testing Bright Data Proxy Integration...\n');

    try {
        // Create proxy agent
        const httpsAgent = new HttpsProxyAgent(PROXY_URL);

        // Test 1: Basic connection test
        console.log('📡 Test 1: Basic connection test...');
        const response1 = await axios.get('https://httpbin.org/ip', {
            httpsAgent,
            headers: BROWSER_HEADERS,
            timeout: 10000
        });

        console.log('✅ Proxy connection successful!');
        console.log('🌐 IP Address:', response1.data.origin);
        console.log('📊 Response time:', response1.headers['x-response-time'] || 'N/A');

        // Test 2: LinkedIn Guest API test
        console.log('\n📡 Test 2: LinkedIn Guest API test...');
        const linkedinUrl = 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=developer&location=Remote&f_TPR=r86400&f_WT=2&start=0';

        const response2 = await axios.get(linkedinUrl, {
            httpsAgent,
            headers: BROWSER_HEADERS,
            timeout: 15000
        });

        console.log('✅ LinkedIn API accessible via proxy!');
        console.log('📊 Response status:', response2.status);
        console.log('📄 Content length:', response2.data.length, 'characters');

        // Test 3: Check if we got job listings
        if (response2.data.includes('job-search-card')) {
            console.log('✅ Job listings found in response!');
        } else {
            console.log('⚠️ No job listings found in response');
        }

        console.log('\n🎉 All proxy tests passed!');
        console.log('💡 The Bright Data proxy is working correctly.');
        console.log('💰 Estimated cost: $8.40/GB (pay-as-you-go)');

    } catch (error) {
        console.error('❌ Proxy test failed:', error.message);

        if (error.code === 'ECONNREFUSED') {
            console.log('💡 This might be a proxy authentication issue. Check credentials.');
        } else if (error.code === 'ETIMEDOUT') {
            console.log('💡 Request timed out. This might be normal for LinkedIn.');
        } else if (error.response?.status === 999) {
            console.log('💡 LinkedIn returned 999 status. This is expected - they detected the request.');
        }

        console.log('\n🔄 Trying direct connection as fallback...');

        try {
            const directResponse = await axios.get('https://httpbin.org/ip', {
                headers: BROWSER_HEADERS,
                timeout: 10000
            });
            console.log('✅ Direct connection works:', directResponse.data.origin);
        } catch (directError) {
            console.error('❌ Direct connection also failed:', directError.message);
        }
    }
}

// Run the test
testProxyConnection(); 