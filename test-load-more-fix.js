const axios = require('axios');

async function testLoadMoreJobs() {
    const baseUrl = 'http://localhost:3000';

    console.log('🧪 Testing Load More Jobs API Fix...\n');

    try {
        // Test payload
        const payload = {
            userId: 'krrrishnendusukumar@gmail.com',
            keywords: 'Backend developer',
            location: 'Remote',
            start: 5,
            f_WT: '2',
            timespan: 'r86400'
        };

        console.log('📤 Sending request with payload:', payload);

        const response = await axios.post(`${baseUrl}/api/load-more-jobs`, payload, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        console.log('\n✅ Response received:');
        console.log('Status:', response.status);
        console.log('Success:', response.data.success);
        console.log('Message:', response.data.message);
        console.log('Jobs returned:', response.data.jobs?.length || 0);
        console.log('New jobs count:', response.data.pagination?.newJobsCount || 0);
        console.log('Next start:', response.data.pagination?.nextStart || 0);
        console.log('Has more:', response.data.pagination?.hasMore || false);

        if (response.data.jobs && response.data.jobs.length > 0) {
            console.log('\n📋 Sample job:');
            console.log('Title:', response.data.jobs[0].title);
            console.log('Company:', response.data.jobs[0].company);
            console.log('Location:', response.data.jobs[0].location);
            console.log('URL:', response.data.jobs[0].job_url?.substring(0, 50) + '...');
        }

    } catch (error) {
        console.error('\n❌ Error:', error.response?.data || error.message);
    }
}

// Run the test
testLoadMoreJobs(); 