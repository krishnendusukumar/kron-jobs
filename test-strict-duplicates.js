const axios = require('axios');

async function testStrictDuplicates() {
    const baseUrl = 'http://localhost:3000';

    console.log('🧪 Testing Strict Duplicate Prevention & 10-Load Limit...\n');

    const basePayload = {
        userId: 'krrrishnendusukumar@gmail.com',
        keywords: 'Backend developer',
        location: 'Remote',
        f_WT: '2',
        timespan: 'r86400'
    };

    try {
        console.log('🔄 Test 1: First load (start=5)');
        const payload1 = { ...basePayload, start: 5 };
        const response1 = await axios.post(`${baseUrl}/api/load-more-jobs`, payload1);
        console.log(`✅ Load ${response1.data.pagination?.loadCount || 0}/${response1.data.pagination?.maxLoads || 0}`);
        console.log(`✅ Jobs returned: ${response1.data.jobs?.length || 0}`);
        console.log(`✅ New jobs: ${response1.data.pagination?.newJobsCount || 0}`);
        console.log(`✅ Has more: ${response1.data.pagination?.hasMore || false}\n`);

        console.log('🔄 Test 2: Same load again (should return 0 new jobs)');
        const response2 = await axios.post(`${baseUrl}/api/load-more-jobs`, payload1);
        console.log(`✅ Load ${response2.data.pagination?.loadCount || 0}/${response2.data.pagination?.maxLoads || 0}`);
        console.log(`✅ Jobs returned: ${response2.data.jobs?.length || 0}`);
        console.log(`✅ New jobs: ${response2.data.pagination?.newJobsCount || 0}`);
        console.log(`✅ Has more: ${response2.data.pagination?.hasMore || false}\n`);

        console.log('🔄 Test 3: Next load (start=10)');
        const payload3 = { ...basePayload, start: 10 };
        const response3 = await axios.post(`${baseUrl}/api/load-more-jobs`, payload3);
        console.log(`✅ Load ${response3.data.pagination?.loadCount || 0}/${response3.data.pagination?.maxLoads || 0}`);
        console.log(`✅ Jobs returned: ${response3.data.jobs?.length || 0}`);
        console.log(`✅ New jobs: ${response3.data.pagination?.newJobsCount || 0}`);
        console.log(`✅ Has more: ${response3.data.pagination?.hasMore || false}\n`);

        console.log('🔄 Test 4: Last load (start=50)');
        const payload4 = { ...basePayload, start: 50 };
        const response4 = await axios.post(`${baseUrl}/api/load-more-jobs`, payload4);
        console.log(`✅ Load ${response4.data.pagination?.loadCount || 0}/${response4.data.pagination?.maxLoads || 0}`);
        console.log(`✅ Jobs returned: ${response4.data.jobs?.length || 0}`);
        console.log(`✅ New jobs: ${response4.data.pagination?.newJobsCount || 0}`);
        console.log(`✅ Has more: ${response4.data.pagination?.hasMore || false}\n`);

        console.log('🔄 Test 5: Beyond limit (start=55)');
        const payload5 = { ...basePayload, start: 55 };
        const response5 = await axios.post(`${baseUrl}/api/load-more-jobs`, payload5);
        console.log(`✅ Load ${response5.data.pagination?.loadCount || 0}/${response5.data.pagination?.maxLoads || 0}`);
        console.log(`✅ Jobs returned: ${response5.data.jobs?.length || 0}`);
        console.log(`✅ New jobs: ${response5.data.pagination?.newJobsCount || 0}`);
        console.log(`✅ Has more: ${response5.data.pagination?.hasMore || false}\n`);

        console.log('📊 Summary:');
        console.log('- Test 1: Should insert new jobs');
        console.log('- Test 2: Should return 0 new jobs (strict duplicates)');
        console.log('- Test 3: Should insert new jobs from next range');
        console.log('- Test 4: Should be the last allowed load (10/10)');
        console.log('- Test 5: Should not allow more loads (beyond limit)');

    } catch (error) {
        console.error('\n❌ Error:', error.response?.data || error.message);
    }
}

// Run the test
testStrictDuplicates(); 