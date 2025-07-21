import { cronScheduler } from './cron-scheduler';

// Initialize cron scheduler when this module is imported
let isInitialized = false;

export async function initializeCronScheduler() {
    if (isInitialized) {
        console.log('🔄 Cron scheduler already initialized');
        return;
    }

    try {
        console.log('🚀 Initializing cron scheduler...');
        await cronScheduler.initialize();
        isInitialized = true;
        console.log('✅ Cron scheduler initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize cron scheduler:', error);
    }
}

// Auto-initialize when this module is imported
if (typeof window === 'undefined') {
    // Only run on server side
    initializeCronScheduler().catch(console.error);
}

export { cronScheduler }; 