// Test script for load-more-jobs API without proxies
// Run with: node test-no-proxy.js

const BASE_URL = 'http://localhost:3000';

async function testLoadMoreJobsNoProxy() {
    console.log('🧪 Testing Load More Jobs API (No Proxy)...\n');
    
    const testPayload = {
        userId: 'test@example.com', // Replace with actual email from your database
        keywords: 'Frontend developer remote',
        location: 'India',
        start: 0,
        f_WT: '2',
        timespan: 'r86400'
    };
    
    try {
        console.log('📡 Testing direct connection to LinkedIn...');
        console.log('📄 Payload:', testPayload);
        
        const response = await fetch(`${BASE_URL}/api/load-more-jobs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testPayload)
        });
        
        const data = await response.json();
        console.log('\n📄 API Response:', {
            success: data.success,
            jobsCount: data.jobs?.length || 0,
            pagination: data.pagination,
            message: data.message,
            error: data.error
        });
        
        if (data.success) {
            console.log('\n✅ Success! Loaded jobs without proxy');
            if (data.jobs && data.jobs.length > 0) {
                console.log(`📋 Sample job: ${data.jobs[0].title} at ${data.jobs[0].company}`);
            }
        } else {
            console.log('\n❌ Failed to load jobs:', data.error);
        }
        
    } catch (error) {
        console.error('❌ Error testing load more jobs:', error);
    }
}

// Run the test
testLoadMoreJobsNoProxy(); 