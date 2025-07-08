import { scrapeLinkedInJobs, testProxyConnection } from './linkedin-scraper';

// Simple test function
export async function testScraper() {
    console.log('🧪 Testing LinkedIn scraper...');

    // First test proxy connection
    console.log('\n1. Testing proxy connection...');
    const proxyWorks = await testProxyConnection();

    if (!proxyWorks) {
        console.log('⚠️  Proxy test failed, but continuing with direct connection...');
    }

    console.log('\n2. Testing LinkedIn scraping...');
    try {
        const jobs = await scrapeLinkedInJobs({
            keywords: 'JavaScript developer',
            location: 'Remote',
            f_WT: '2', // Remote work
            timespan: 'r86400' // Last 24 hours
        }, {
            pagesToScrape: 2, // Limit for testing
            delay: 1000 // Faster for testing
        });

        console.log(`✅ Test completed! Found ${jobs.length} jobs`);

        if (jobs.length > 0) {
            console.log('📋 Sample job:');
            console.log(`   Title: ${jobs[0].title}`);
            console.log(`   Company: ${jobs[0].company}`);
            console.log(`   Location: ${jobs[0].location}`);
            console.log(`   URL: ${jobs[0].job_url}`);
        }

        return jobs;
    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    }
}

// Run test if this file is executed directly
if (require.main === module) {
    testScraper()
        .then(() => {
            console.log('🎉 Test completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Test failed:', error);
            process.exit(1);
        });
} 