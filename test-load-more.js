// Test script for load-more-jobs API
// Run with: node test-load-more.js

const BASE_URL = 'http://localhost:3000';

async function testLoadMoreJobs() {
    console.log('🧪 Testing Load More Jobs API...\n');

    const testPayload = {
        userId: 'test@example.com', // Replace with actual email
        keywords: 'Frontend developer remote',
        location: 'India',
        start: 0,
        f_WT: '2',
        timespan: 'r86400'
    };

    try {
        // Test first load (start=0)
        console.log('📄 Testing first load (start=0)...');
        const response1 = await fetch(`${BASE_URL}/api/load-more-jobs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testPayload)
        });

        const data1 = await response1.json();
        console.log('First load response:', {
            success: data1.success,
            jobsCount: data1.jobs?.length || 0,
            pagination: data1.pagination,
            message: data1.message
        });

        if (data1.success && data1.pagination?.hasMore) {
            // Test second load (start=25)
            console.log('\n📄 Testing second load (start=25)...');
            const payload2 = { ...testPayload, start: 25 };
            const response2 = await fetch(`${BASE_URL}/api/load-more-jobs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload2)
            });

            const data2 = await response2.json();
            console.log('Second load response:', {
                success: data2.success,
                jobsCount: data2.jobs?.length || 0,
                pagination: data2.pagination,
                message: data2.message
            });

            // Test third load (start=50)
            if (data2.success && data2.pagination?.hasMore) {
                console.log('\n📄 Testing third load (start=50)...');
                const payload3 = { ...testPayload, start: 50 };
                const response3 = await fetch(`${BASE_URL}/api/load-more-jobs`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload3)
                });

                const data3 = await response3.json();
                console.log('Third load response:', {
                    success: data3.success,
                    jobsCount: data3.jobs?.length || 0,
                    pagination: data3.pagination,
                    message: data3.message
                });
            }
        }

        console.log('\n✅ Load more jobs test completed!');

    } catch (error) {
        console.error('❌ Error testing load more jobs:', error);
    }
}

// Run the test
testLoadMoreJobs(); 