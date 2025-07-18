const axios = require('axios');

async function testDuplicateHandling() {
    const baseUrl = 'http://localhost:3000';

    console.log('🧪 Testing Duplicate Job Handling...\n');

    const payload = {
        userId: 'krrrishnendusukumar@gmail.com',
        keywords: 'Backend developer',
        location: 'Remote',
        start: 5,
        f_WT: '2',
        timespan: 'r86400'
    };

    try {
        console.log('🔄 Test 1: First load (should insert new jobs)');
        const response1 = await axios.post(`${baseUrl}/api/load-more-jobs`, payload);
        console.log(`✅ Jobs returned: ${response1.data.jobs?.length || 0}`);
        console.log(`✅ New jobs count: ${response1.data.pagination?.newJobsCount || 0}`);
        console.log(`✅ Message: ${response1.data.message}\n`);

        console.log('🔄 Test 2: Second load with same parameters (should skip duplicates)');
        const response2 = await axios.post(`${baseUrl}/api/load-more-jobs`, payload);
        console.log(`✅ Jobs returned: ${response2.data.jobs?.length || 0}`);
        console.log(`✅ New jobs count: ${response2.data.pagination?.newJobsCount || 0}`);
        console.log(`✅ Message: ${response2.data.message}\n`);

        console.log('🔄 Test 3: Load next page (should insert new jobs)');
        const payload2 = { ...payload, start: 10 };
        const response3 = await axios.post(`${baseUrl}/api/load-more-jobs`, payload2);
        console.log(`✅ Jobs returned: ${response3.data.jobs?.length || 0}`);
        console.log(`✅ New jobs count: ${response3.data.pagination?.newJobsCount || 0}`);
        console.log(`✅ Message: ${response3.data.message}\n`);

        console.log('📊 Summary:');
        console.log('- Test 1: Should show new jobs being inserted');
        console.log('- Test 2: Should show 0 new jobs (duplicates skipped)');
        console.log('- Test 3: Should show new jobs from next page');

    } catch (error) {
        console.error('\n❌ Error:', error.response?.data || error.message);
    }
}

// Run the test
testDuplicateHandling(); 