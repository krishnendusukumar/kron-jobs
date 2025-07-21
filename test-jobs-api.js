// Test script to check if the jobs API is working correctly
require('dotenv').config({ path: '.env.local' });

async function testJobsAPI() {
    console.log('🧪 Testing Jobs API...\n');

    const userEmail = 'sukumarkrishnendu@gmail.com';
    const apiUrl = `http://localhost:3000/api/jobs?userId=${encodeURIComponent(userEmail)}&limit=10&sortBy=created_at&sortOrder=desc`;

    console.log('📡 Testing API URL:', apiUrl);

    try {
        const response = await fetch(apiUrl);
        console.log('📥 Response status:', response.status);
        console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

        const data = await response.json();
        console.log('📄 Response data:', JSON.stringify(data, null, 2));

        if (data.success) {
            console.log(`✅ API Success!`);
            console.log(`📊 Jobs returned: ${data.jobs?.length || 0}`);
            console.log(`📊 Total jobs in database: ${data.pagination?.total || 0}`);

            if (data.jobs && data.jobs.length > 0) {
                console.log('\n📋 Sample jobs:');
                data.jobs.slice(0, 3).forEach((job, index) => {
                    console.log(`${index + 1}. ${job.title} at ${job.company}`);
                    console.log(`   User ID: ${job.user_id}`);
                    console.log(`   Created: ${job.created_at}`);
                    console.log('');
                });
            }
        } else {
            console.log(`❌ API Error: ${data.error}`);
        }

    } catch (error) {
        console.log('❌ Fetch error:', error.message);
    }
}

// Run the test
testJobsAPI().catch(console.error); 