const axios = require('axios');

async function testStartIncrement() {
    const baseUrl = 'http://localhost:3000';

    console.log('🧪 Testing Start Parameter Increment...\n');

    const basePayload = {
        userId: 'krrrishnendusukumar@gmail.com',
        keywords: 'Backend developer',
        location: 'Remote',
        f_WT: '2',
        timespan: 'r86400'
    };

    try {
        console.log('🔄 Test 1: First load (should use start=5)');
        const payload1 = { ...basePayload, start: 5 };
        const response1 = await axios.post(`${baseUrl}/api/load-more-jobs`, payload1);
        console.log(`✅ Start: ${payload1.start}, Jobs returned: ${response1.data.jobs?.length || 0}`);
        console.log(`✅ Next start: ${response1.data.pagination?.nextStart || 0}\n`);

        console.log('🔄 Test 2: Second load (should use start=10)');
        const payload2 = { ...basePayload, start: 10 };
        const response2 = await axios.post(`${baseUrl}/api/load-more-jobs`, payload2);
        console.log(`✅ Start: ${payload2.start}, Jobs returned: ${response2.data.jobs?.length || 0}`);
        console.log(`✅ Next start: ${response2.data.pagination?.nextStart || 0}\n`);

        console.log('🔄 Test 3: Third load (should use start=15)');
        const payload3 = { ...basePayload, start: 15 };
        const response3 = await axios.post(`${baseUrl}/api/load-more-jobs`, payload3);
        console.log(`✅ Start: ${payload3.start}, Jobs returned: ${response3.data.jobs?.length || 0}`);
        console.log(`✅ Next start: ${response3.data.pagination?.nextStart || 0}\n`);

        console.log('📊 Summary:');
        console.log('- Each request should use a different start value');
        console.log('- start=5, start=10, start=15, etc.');
        console.log('- This ensures we get different job ranges from LinkedIn');

    } catch (error) {
        console.error('\n❌ Error:', error.response?.data || error.message);
    }
}

// Run the test
testStartIncrement(); 