# Bright Data Residential Proxy Integration

This document describes the integration of Bright Data's Residential Proxy into the PingJobs LinkedIn scraper.

## 🌐 Overview

The proxy integration provides:
- **Residential IP addresses** for natural browsing patterns
- **Automatic fallback** to direct connection if proxy fails
- **Rate limiting** to avoid LinkedIn bot detection
- **Bandwidth tracking** and cost estimation
- **Browser-like headers** for stealth scraping

## 🔧 Configuration

### Proxy Credentials
```javascript
const PROXY_CONFIG = {
    host: 'brd.superproxy.io',
    port: 33335,
    username: 'brd-customer-hl_db0742f0-zone-residential_proxy1',
    password: 'dsl0klt4fh7',
    protocol: 'https'
};
```

### Cost Structure
- **Pay-as-you-go**: $8.40/GB
- **Bandwidth tracking**: Automatic usage monitoring
- **Cost estimation**: Real-time cost calculation

## 📁 File Structure

```
src/
├── lib/
│   ├── proxy-config.ts          # Proxy configuration and manager
│   └── linkedin-scraper.ts      # Updated scraper with proxy support
├── app/api/
│   ├── proxy-stats/route.ts     # Proxy statistics API
│   └── test-proxy/route.ts      # Proxy connection test API
└── components/
    └── ProxyTest/page.tsx       # Proxy status dashboard component
```

## 🚀 Usage

### 1. Basic Proxy Request
```typescript
import { makeProxyRequest } from '@/lib/proxy-config';

const response = await makeProxyRequest({
    method: 'GET',
    url: 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=developer&location=Remote',
    timeout: 15000
});
```

### 2. Proxy Statistics
```typescript
import { proxyManager } from '@/lib/proxy-config';

// Get current stats
const stats = proxyManager.getStats();
console.log('Total requests:', stats.totalRequests);
console.log('Bandwidth used:', stats.totalBandwidthUsed);
console.log('Estimated cost:', proxyManager.getEstimatedCost());
```

### 3. Connection Testing
```typescript
import { testProxyConnection } from '@/lib/linkedin-scraper';

const isWorking = await testProxyConnection();
if (isWorking) {
    console.log('✅ Proxy is working!');
} else {
    console.log('❌ Proxy failed, using direct connection');
}
```

## 🔄 Automatic Fallback

The proxy system automatically falls back to direct connection when:
- Proxy authentication fails
- Connection times out
- Proxy server is unreachable
- Network errors occur

```typescript
// This will try proxy first, then fallback to direct
const response = await makeProxyRequest({
    method: 'GET',
    url: 'https://linkedin.com/...'
});
```

## 📊 Monitoring

### Dashboard Integration
The proxy status is available in the dashboard under "Proxy Status" tab:
- Real-time connection status
- Request count and success rate
- Bandwidth usage and cost estimation
- Test connection functionality

### API Endpoints
- `GET /api/proxy-stats` - Get proxy statistics
- `POST /api/proxy-stats` - Reset statistics (action: 'reset')
- `GET /api/test-proxy` - Test proxy connection

## 🛡️ Security Features

### Browser-like Headers
```typescript
const BROWSER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9...',
    'Accept-Language': 'en-US,en;q=0.9',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    // ... more headers
};
```

### Rate Limiting
- **Default delay**: 2 seconds between requests
- **Retry mechanism**: 3 attempts with exponential backoff
- **Request throttling**: Prevents overwhelming LinkedIn servers

## 🧪 Testing

### Manual Testing
```bash
# Test proxy integration
node test-proxy-integration.js

# Test from dashboard
# Navigate to Dashboard > Proxy Status > Test Connection
```

### Expected Results
```
🧪 Testing Bright Data Proxy Integration...

📡 Test 1: Basic connection test...
✅ Proxy connection successful!
🌐 IP Address: 185.199.108.153
📊 Response time: 1.2s

📡 Test 2: LinkedIn Guest API test...
✅ LinkedIn API accessible via proxy!
📊 Response status: 200
📄 Content length: 15420 characters
✅ Job listings found in response!

🎉 All proxy tests passed!
💡 The Bright Data proxy is working correctly.
💰 Estimated cost: $8.40/GB (pay-as-you-go)
```

## 🔧 Troubleshooting

### Common Issues

1. **Authentication Failed**
   ```
   ❌ Proxy test failed: ECONNREFUSED
   💡 Check proxy credentials in proxy-config.ts
   ```

2. **LinkedIn 999 Status**
   ```
   ❌ Proxy test failed: Request failed with status code 999
   💡 This is expected - LinkedIn detected the request
   ```

3. **Timeout Issues**
   ```
   ❌ Proxy test failed: ETIMEDOUT
   💡 Increase timeout or check network connection
   ```

### Debug Commands
```bash
# Check proxy stats
curl http://localhost:3000/api/proxy-stats

# Test proxy connection
curl http://localhost:3000/api/test-proxy

# Reset statistics
curl -X POST http://localhost:3000/api/proxy-stats \
  -H "Content-Type: application/json" \
  -d '{"action":"reset"}'
```

## 📈 Performance Optimization

### Best Practices
1. **Use appropriate delays** between requests (1-2 seconds)
2. **Monitor bandwidth usage** to control costs
3. **Implement request caching** for repeated queries
4. **Use connection pooling** for multiple requests
5. **Monitor success rates** and adjust strategies

### Cost Optimization
```typescript
// Monitor costs in real-time
const cost = proxyManager.getEstimatedCost();
if (cost > 10) { // $10 threshold
    console.log('⚠️ High proxy usage detected');
    // Implement cost control measures
}
```

## 🔄 Integration with Job Queue

The proxy is automatically used by:
- `linkedin-scraper.ts` - All LinkedIn requests
- `job-queue.ts` - Background job processing
- `load-more-jobs` API - Pagination requests

### Queue Integration
```typescript
// Jobs are automatically processed with proxy
const jobId = await jobQueue.addJob({
    userId: 'user@example.com',
    keywords: 'developer remote',
    location: 'Remote',
    start: 0
});
```

## 🚀 Deployment

### Environment Variables (Recommended)
```bash
# .env.local
BRIGHT_DATA_HOST=brd.superproxy.io
BRIGHT_DATA_PORT=33335
BRIGHT_DATA_USERNAME=brd-customer-hl_db0742f0-zone-residential_proxy1
BRIGHT_DATA_PASSWORD=dsl0klt4fh7
```

### Production Considerations
1. **Secure credential storage** using environment variables
2. **Monitor usage patterns** and costs
3. **Implement rate limiting** to prevent abuse
4. **Set up alerts** for high usage
5. **Regular testing** of proxy connectivity

## 📚 Additional Resources

- [Bright Data Documentation](https://brightdata.com/docs)
- [Residential Proxy Guide](https://brightdata.com/products/residential-proxy)
- [LinkedIn Scraping Best Practices](https://brightdata.com/blog/linkedin-scraping)
- [Proxy Authentication](https://brightdata.com/docs/proxy-manager/authentication)

## 🤝 Support

For proxy-related issues:
1. Check the dashboard "Proxy Status" tab
2. Review console logs for error messages
3. Test connection using the test button
4. Check Bright Data account status
5. Contact support if issues persist 