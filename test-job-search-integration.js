// Test job search integration
require('dotenv').config({ path: '.env.local' });

async function testJobSearchIntegration() {
    console.log('🧪 Testing Job Search Integration...\n');

    const testData = {
        jobTitle: 'Software Engineer',
        location: 'New York, NY',
        keywords: 'React, JavaScript, Node.js',
        experience: 'mid',
        jobType: 'full-time',
        email: 'test@example.com'
    };

    console.log('📤 Test data:', testData);

    try {
        // Test 1: Submit preferences
        console.log('\n🔍 Testing preferences submission...');
        const preferencesResponse = await fetch('http://localhost:3000/api/submit-preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: testData.email,
                jobTitle: testData.jobTitle,
                keywords: testData.keywords,
                location: testData.location,
                experience: testData.experience,
                notifyMethod: 'Mail'
            }),
        });

        console.log('📥 Preferences response status:', preferencesResponse.status);
        const preferencesResult = await preferencesResponse.json();
        console.log('📥 Preferences response:', preferencesResult);

        if (!preferencesResult.success) {
            console.log('❌ Preferences submission failed:', preferencesResult.error);
            return;
        }

        // Test 2: Load more jobs (scraping)
        console.log('\n🔍 Testing load-more-jobs API...');
        const response = await fetch('http://localhost:3000/api/load-more-jobs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: testData.email,
                keywords: `${testData.jobTitle} ${testData.keywords}`.trim(),
                location: testData.location,
                start: 5,
                f_WT: '2',
                timespan: 'r86400'
            }),
        });

        console.log('📥 Response status:', response.status);
        const result = await response.json();
        console.log('📥 Response body:', result);

        if (result.success) {
            console.log('✅ API test successful!');
            console.log('Job ID:', result.jobId);
            console.log('Status:', result.status);
            console.log('Message:', result.message);

                        // Test 3: Check jobs
            console.log('\n🔍 Testing jobs endpoint...');
            const jobsResponse = await fetch(`http://localhost:3000/api/jobs?userId=${encodeURIComponent(testData.email)}&limit=5&sortBy=created_at&sortOrder=desc`);
            const jobsResult = await jobsResponse.json();
            
            if (jobsResult.success) {
                console.log('✅ Jobs endpoint working!');
                console.log('Jobs found:', jobsResult.jobs.length);
                if (jobsResult.jobs.length > 0) {
                    console.log('Latest job:', {
                        id: jobsResult.jobs[0].id,
                        title: jobsResult.jobs[0].title,
                        company: jobsResult.jobs[0].company,
                        location: jobsResult.jobs[0].location,
                        created_at: jobsResult.jobs[0].created_at
                    });
                }
            } else {
                console.log('❌ Jobs endpoint failed:', jobsResult.error);
            }

        } else {
            console.log('❌ API test failed:', result.error);
        }

    } catch (error) {
        console.log('❌ Test error:', error.message);
        console.log('Make sure the development server is running on http://localhost:3000');
    }
}

// Run the test
testJobSearchIntegration().catch(console.error); 