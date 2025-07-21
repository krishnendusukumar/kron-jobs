// Test job search API endpoint
const fetch = require('node-fetch');

async function testJobSearchAPI() {
    console.log('🔍 Testing job search API endpoint...\n');

    const testData = {
        jobTitle: 'Software Engineer',
        location: 'New York, NY',
        keywords: 'React, JavaScript, Node.js',
        experience: 'mid',
        jobType: 'full-time',
        email: 'test@example.com'
    };

    console.log('📤 Sending test request:', testData);

    try {
        const response = await fetch('http://localhost:3000/api/request-scraping', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData),
        });

        console.log('📥 Response status:', response.status);
        const result = await response.json();
        console.log('📥 Response body:', result);

        if (result.success) {
            console.log('✅ API test successful!');
            console.log('Job ID:', result.jobId);
            console.log('Status:', result.status);
            console.log('Message:', result.message);
        } else {
            console.log('❌ API test failed:', result.error);
        }

    } catch (error) {
        console.log('❌ API test error:', error.message);
        console.log('Make sure the development server is running on http://localhost:3000');
    }
}

// Run the test
testJobSearchAPI().catch(console.error); 