import { supabase } from './supabase';

export interface UserProfile {
    id: number;
    user_id: string;
    clerk_user_id?: string;
    email: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    email_verified?: boolean;
    plan: 'free' | 'lifetime' | 'pro';
    credits_remaining: number;
    credits_reset_date: string;
    cron_times: string[];
    max_cron_jobs: number;
    max_daily_fetches: number;
    upgrade_source: 'stripe' | 'manual' | 'dodo' | null;
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
    last_sign_in?: string;
    sign_up_date?: string;
    created_at: string;
    updated_at: string;
}

export interface UserUsage {
    id: number;
    user_id: string;
    usage_type: 'job_search' | 'cron_execution' | 'api_call';
    credits_consumed: number;
    details?: Record<string, unknown>;
    created_at: string;
}

export interface UserLimits {
    can_perform_action: boolean;
    credits_remaining: number;
    daily_searches_used: number;
    daily_searches_limit: number;
    cron_jobs_used: number;
    cron_jobs_limit: number;
}

export interface CronJob {
    id: number;
    user_id: string;
    cron_time: string;
    is_active: boolean;
    last_run?: string;
    next_run?: string;
    run_count: number;
    error_count: number;
    last_error?: string;
    created_at: string;
    updated_at: string;
}

export interface CronExecution {
    id: number;
    cron_job_id: number;
    user_id: string;
    execution_time: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    jobs_found: number;
    jobs_added: number;
    error_message?: string;
    execution_duration_ms?: number;
    proxy_used?: string;
}

export interface PricingPlan {
    id: string;
    name: string;
    price: string;
    originalPrice?: string;
    description: string;
    features: string[];
    maxCronJobs: number;
    maxDailyFetches: number;
    isAvailable: boolean;
    isPopular?: boolean;
    isComingSoon?: boolean;
}

interface ClerkData {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    email_verified?: boolean;
}

interface UsageDetails {
    keywords?: string;
    location?: string;
    start?: number;
    action?: string;
    [key: string]: unknown;
}

interface UserUsageSummary {
    total_usage: number;
    job_searches: number;
    cron_executions: number;
    api_calls: number;
    daily_breakdown: Array<{ date: string; usage: number }>;
}

export class UserProfileService {
    private static readonly AVAILABLE_CRON_SLOTS = ['10:00', '12:00', '15:00', '18:00', '21:00'];

    static getPricingPlans(): PricingPlan[] {
        return [
            {
                id: 'free',
                name: 'Free',
                price: '$0',
                description: 'Perfect for trying out KronJobs',
                features: [
                    '🔎 3 manual job searches per day',
                    '❌ No automation',
                    '📧 Email notifications',
                    '🔒 Secure & private'
                ],
                maxCronJobs: 0,
                maxDailyFetches: 3,
                isAvailable: true
            },
            {
                id: 'lifetime',
                name: 'Lifetime Deal 💎',
                price: '$5',
                originalPrice: '$29',
                description: 'One-time payment, lifetime access',
                features: [
                    '✅ 2 automated cron job slots daily',
                    '📥 3 job fetches daily (auto)',
                    '🧪 Early access to new features',
                    '🧩 Browser extension (reserved)',
                    '⚡ Priority support',
                    '🔒 Secure & private'
                ],
                maxCronJobs: 2,
                maxDailyFetches: 3,
                isAvailable: true,
                isPopular: true
            },
            {
                id: 'pro',
                name: 'Pro 🚀',
                price: '$9',
                description: 'Advanced features for power users',
                features: [
                    '✅ 5 automated cron jobs/day',
                    '🤖 Auto-apply to supported jobs',
                    '📄 Resume autofill, extension',
                    '💬 Premium chat/email support',
                    '📊 Advanced analytics',
                    '🔒 Secure & private'
                ],
                maxCronJobs: 5,
                maxDailyFetches: 5,
                isAvailable: false,
                isComingSoon: true
            }
        ];
    }

    static async getUserProfile(userId: string): Promise<UserProfile | null> {
        try {
            // Debug: Log environment variables (only in development)
            if (process.env.NODE_ENV === 'development') {
                console.log('🔍 Debug - Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
                console.log('🔍 Debug - Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
            }

            // Check if Supabase is configured
            if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                console.error('❌ Supabase environment variables not configured');
                console.error('Please create a .env.local file with your Supabase credentials');
                return null;
            }

            console.log('🔍 Debug - Attempting to fetch user profile for:', userId);

            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) {
                // Check if this is just "no rows found" (which is normal for new users)
                if (error.code === 'PGRST116' || error.message.includes('0 rows')) {
                    console.log('ℹ️ No user profile found for user ID:', userId, '(This is normal for new users)');
                    return null; // Return null to indicate no profile found, not an error
                }

                console.error('❌ Error fetching user profile:', error);
                console.error('❌ Error details:', JSON.stringify(error, null, 2));

                // Provide helpful error messages
                if (error.message.includes('relation "user_profiles" does not exist')) {
                    console.error('📋 Database tables not found! Please run the migration script.');
                    console.error('Go to Supabase Dashboard → SQL Editor → Run clerk-integration-migration-safe.sql');
                } else if (error.message.includes('JWT')) {
                    console.error('🔑 Authentication error. Check your Supabase API key.');
                }

                return null;
            }

            console.log('✅ Debug - User profile fetched successfully:', data ? 'Found' : 'Not found');
            return data;
        } catch (error) {
            console.error('❌ Unexpected error in getUserProfile:', error);
            console.error('❌ Error details:', JSON.stringify(error, null, 2));
            return null;
        }
    }

    static async createUserProfile(userId: string, email: string, clerkData?: ClerkData): Promise<UserProfile | null> {
        try {
            console.log('🔍 Debug - Attempting to create user profile for:', userId, 'with email:', email);

            // Check if Supabase is configured
            if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                console.error('❌ Supabase environment variables not configured');
                console.error('Please create a .env.local file with your Supabase credentials');
                return null;
            }

            const profileData = {
                user_id: userId,
                clerk_user_id: userId, // For Clerk integration
                email: email,
                first_name: clerkData?.first_name,
                last_name: clerkData?.last_name,
                avatar_url: clerkData?.avatar_url,
                email_verified: clerkData?.email_verified || false,
                plan: 'free',
                credits_remaining: 3,
                credits_reset_date: new Date().toISOString().split('T')[0],
                max_cron_jobs: 0,
                max_daily_fetches: 3,
                sign_up_date: new Date().toISOString()
            };

            console.log('🔍 Debug - Profile data to insert:', profileData);

            const { data, error } = await supabase
                .from('user_profiles')
                .insert(profileData)
                .select()
                .single();

            if (error) {
                console.error('❌ Error creating user profile:', error);
                console.error('❌ Error details:', JSON.stringify(error, null, 2));

                // Provide helpful error messages
                if (error.message.includes('relation "user_profiles" does not exist')) {
                    console.error('📋 Database tables not found! Please run the migration script.');
                    console.error('Go to Supabase Dashboard → SQL Editor → Run clerk-integration-migration-safe.sql');
                } else if (error.message.includes('duplicate key')) {
                    console.error('🔄 User profile already exists for this user ID');
                } else if (error.message.includes('JWT')) {
                    console.error('🔑 Authentication error. Check your Supabase API key.');
                }

                return null;
            }

            console.log('✅ User profile created successfully for:', userId);
            return data;
        } catch (error) {
            console.error('❌ Unexpected error in createUserProfile:', error);
            console.error('❌ Error details:', JSON.stringify(error, null, 2));
            return null;
        }
    }

    static async upgradePlan(userId: string, plan: 'lifetime' | 'pro', source: 'stripe' | 'manual' | 'dodo' = 'manual'): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('user_profiles')
                .update({
                    plan: plan,
                    max_cron_jobs: plan === 'lifetime' ? 2 : 5,
                    max_daily_fetches: plan === 'lifetime' ? 3 : 5,
                    upgrade_source: source,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);

            if (error) {
                console.error('Error upgrading plan:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in upgradePlan:', error);
            return false;
        }
    }

    static async getOrCreateUserProfile(userId: string, email: string): Promise<UserProfile | null> {
        try {
            console.log('🔍 Getting or creating user profile for:', userId, 'with email:', email);

            // First, try to get existing profile by user_id
            let profile = await this.getUserProfile(userId);

            if (!profile) {
                // If no profile found by user_id, check if a profile exists with this email
                console.log('ℹ️ No profile found by user_id, checking for existing profile by email...');

                const { data: existingProfile, error: emailCheckError } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('email', email)
                    .single();

                if (emailCheckError && emailCheckError.code !== 'PGRST116') {
                    console.error('❌ Error checking for existing profile by email:', emailCheckError);
                }

                if (existingProfile) {
                    console.log('🔄 Found existing profile with same email, updating user_id...');

                    // Update the existing profile with the new user_id
                    const { data: updatedProfile, error: updateError } = await supabase
                        .from('user_profiles')
                        .update({
                            user_id: userId,
                            clerk_user_id: userId,
                            updated_at: new Date().toISOString()
                        })
                        .eq('email', email)
                        .select()
                        .single();

                    if (updateError) {
                        console.error('❌ Error updating existing profile:', updateError);
                        return null;
                    }

                    console.log('✅ Existing profile updated with new user_id');
                    return updatedProfile;
                }

                // No existing profile found, create new one
                console.log('ℹ️ No existing profile found, creating new profile...');
                profile = await this.createUserProfile(userId, email);

                if (profile) {
                    console.log('✅ New user profile created successfully');
                } else {
                    console.error('❌ Failed to create user profile');
                }
            } else {
                console.log('✅ Existing user profile found');
            }

            return profile;
        } catch (error) {
            console.error('❌ Error in getOrCreateUserProfile:', error);
            return null;
        }
    }

    static async consumeCredit(userId: string): Promise<boolean> {
        try {
            const profile = await this.getUserProfile(userId);
            if (!profile || profile.credits_remaining <= 0) {
                return false;
            }

            const { error } = await supabase
                .from('user_profiles')
                .update({
                    credits_remaining: profile.credits_remaining - 1,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);

            if (error) {
                console.error('Error consuming credit:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in consumeCredit:', error);
            return false;
        }
    }

    static async resetDailyCredits(): Promise<void> {
        try {
            const { error } = await supabase.rpc('reset_daily_credits');
            if (error) {
                console.error('Error resetting daily credits:', error);
            }
        } catch (error) {
            console.error('Error in resetDailyCredits:', error);
        }
    }

    static async getCronJobs(userId: string): Promise<CronJob[]> {
        try {
            const { data, error } = await supabase
                .from('cron_jobs')
                .select('*')
                .eq('user_id', userId)
                .order('cron_time');

            if (error) {
                console.error('Error fetching cron jobs:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getCronJobs:', error);
            return [];
        }
    }

    static async createCronJob(userId: string, cronTime: string): Promise<CronJob | null> {
        try {
            // Check if user can add more cron jobs
            const profile = await this.getUserProfile(userId);
            if (!profile) return null;

            const existingJobs = await this.getCronJobs(userId);
            if (existingJobs.length >= profile.max_cron_jobs) {
                throw new Error('Maximum cron jobs reached for this plan');
            }

            // Check if cron time is already selected
            if (existingJobs.some(job => job.cron_time === cronTime)) {
                throw new Error('Cron time already selected');
            }

            // Calculate next run time
            const nextRun = this.calculateNextRunTime(cronTime);

            const { data, error } = await supabase
                .from('cron_jobs')
                .insert({
                    user_id: userId,
                    cron_time: cronTime,
                    is_active: true,
                    next_run: nextRun
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating cron job:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in createCronJob:', error);
            return null;
        }
    }

    static async deleteCronJob(userId: string, cronJobId: number): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('cron_jobs')
                .delete()
                .eq('id', cronJobId)
                .eq('user_id', userId);

            if (error) {
                console.error('Error deleting cron job:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in deleteCronJob:', error);
            return false;
        }
    }

    static async getCronExecutions(userId: string, limit: number = 10): Promise<CronExecution[]> {
        try {
            const { data, error } = await supabase
                .from('cron_executions')
                .select('*')
                .eq('user_id', userId)
                .order('execution_time', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Error fetching cron executions:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getCronExecutions:', error);
            return [];
        }
    }

    static async createCronExecution(cronJobId: number, userId: string): Promise<CronExecution | null> {
        try {
            const { data, error } = await supabase
                .from('cron_executions')
                .insert({
                    cron_job_id: cronJobId,
                    user_id: userId,
                    status: 'pending'
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating cron execution:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in createCronExecution:', error);
            return null;
        }
    }

    static async updateCronExecution(executionId: number, updates: Partial<CronExecution>): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('cron_executions')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', executionId);

            if (error) {
                console.error('Error updating cron execution:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in updateCronExecution:', error);
            return false;
        }
    }

    static async getDueCronJobs(): Promise<CronJob[]> {
        try {
            const now = new Date();
            const { data, error } = await supabase
                .from('cron_jobs')
                .select('*')
                .eq('is_active', true)
                .lte('next_run', now.toISOString());

            if (error) {
                console.error('Error fetching due cron jobs:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getDueCronJobs:', error);
            return [];
        }
    }

    static async updateCronJobNextRun(cronJobId: number): Promise<boolean> {
        try {
            const cronJob = await supabase
                .from('cron_jobs')
                .select('cron_time')
                .eq('id', cronJobId)
                .single();

            if (!cronJob.data) return false;

            const nextRun = this.calculateNextRunTime(cronJob.data.cron_time);

            const { error } = await supabase
                .from('cron_jobs')
                .update({
                    next_run: nextRun,
                    last_run: new Date().toISOString(),
                    run_count: supabase.rpc('increment', { value: 1 })
                })
                .eq('id', cronJobId);

            if (error) {
                console.error('Error updating cron job next run:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in updateCronJobNextRun:', error);
            return false;
        }
    }

    private static calculateNextRunTime(cronTime: string): string {
        const [hours, minutes] = cronTime.split(':').map(Number);
        const now = new Date();
        const nextRun = new Date();

        nextRun.setHours(hours, minutes, 0, 0);

        // If the time has already passed today, schedule for tomorrow
        if (nextRun <= now) {
            nextRun.setDate(nextRun.getDate() + 1);
        }

        return nextRun.toISOString();
    }

    static getAvailableCronSlots(plan: string): string[] {
        if (plan === 'free') return [];
        return this.AVAILABLE_CRON_SLOTS;
    }

    static getMaxCronJobs(plan: string): number {
        switch (plan) {
            case 'free': return 0;
            case 'lifetime': return 2;
            case 'pro': return 5;
            default: return 0;
        }
    }

    static getMaxDailyFetches(plan: string): number {
        switch (plan) {
            case 'free': return 3;
            case 'lifetime': return 3;
            case 'pro': return 5;
            default: return 3;
        }
    }

    // Enhanced methods for Clerk integration and usage tracking

    static async trackUsage(userId: string, usageType: 'job_search' | 'cron_execution' | 'api_call', creditsConsumed: number = 1, details?: UsageDetails): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('user_usage')
                .insert({
                    user_id: userId,
                    usage_type: usageType,
                    credits_consumed: creditsConsumed,
                    details: details || {}
                });

            if (error) {
                console.error('Error tracking usage:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in trackUsage:', error);
            return false;
        }
    }

    static async getUserLimits(userId: string): Promise<UserLimits | null> {
        try {
            const { data, error } = await supabase.rpc('check_user_limits', {
                p_user_id: userId
            });

            if (error || !data || data.length === 0) {
                console.error('Error getting user limits:', error);
                return null;
            }

            return data[0];
        } catch (error) {
            console.error('Error in getUserLimits:', error);
            return null;
        }
    }

    static async getDailySearchesUsed(userId: string): Promise<number> {
        try {
            const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

            const { data, error } = await supabase
                .from('user_usage')
                .select('credits_consumed')
                .eq('user_id', userId)
                .eq('usage_type', 'job_search')
                .gte('created_at', today + 'T00:00:00.000Z')
                .lt('created_at', today + 'T23:59:59.999Z');

            if (error) {
                console.error('Error getting daily searches used:', error);
                return 0;
            }

            const totalUsed = data?.reduce((sum, record) => sum + (record.credits_consumed || 0), 0) || 0;
            console.log(`📊 Daily searches used for ${userId}: ${totalUsed}`);
            return totalUsed;
        } catch (error) {
            console.error('Error in getDailySearchesUsed:', error);
            return 0;
        }
    }

    static async getUserUsageSummary(userId: string, days: number = 30): Promise<UserUsageSummary | null> {
        try {
            const { data, error } = await supabase
                .from('user_usage')
                .select('*')
                .eq('user_id', userId)
                .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching usage summary:', error);
                return null;
            }

            const usage = data || [];
            const totalUsage = usage.reduce((sum, record) => sum + record.credits_consumed, 0);
            const jobSearches = usage.filter(record => record.usage_type === 'job_search').length;
            const cronExecutions = usage.filter(record => record.usage_type === 'cron_execution').length;
            const apiCalls = usage.filter(record => record.usage_type === 'api_call').length;

            // Group by date
            const dailyBreakdown = usage.reduce((acc, record) => {
                const date = record.created_at.split('T')[0];
                acc[date] = (acc[date] || 0) + record.credits_consumed;
                return acc;
            }, {} as Record<string, number>);

            return {
                total_usage: totalUsage,
                job_searches: jobSearches,
                cron_executions: cronExecutions,
                api_calls: apiCalls,
                daily_breakdown: Object.entries(dailyBreakdown).map(([date, usage]) => ({ date, usage: usage as number }))
            };
        } catch (error) {
            console.error('Error in getUserUsageSummary:', error);
            return null;
        }
    }

    static async syncClerkUser(clerkUserId: string, email: string, clerkData?: ClerkData): Promise<UserProfile | null> {
        try {
            console.log('🔄 Syncing Clerk user:', clerkUserId, 'with email:', email);

            // First, try to get existing profile by Clerk user ID
            let profile = await this.getUserProfile(clerkUserId);

            if (!profile) {
                // Try to find by email
                const { data: emailProfile, error: emailError } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('email', email)
                    .single();

                if (emailProfile && !emailError) {
                    // Update existing profile with Clerk user ID
                    const { data: updatedProfile, error: updateError } = await supabase
                        .from('user_profiles')
                        .update({
                            user_id: clerkUserId,
                            clerk_user_id: clerkUserId,
                            first_name: clerkData?.first_name || emailProfile.first_name,
                            last_name: clerkData?.last_name || emailProfile.last_name,
                            avatar_url: clerkData?.avatar_url || emailProfile.avatar_url,
                            email_verified: clerkData?.email_verified || emailProfile.email_verified,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', emailProfile.id)
                        .select()
                        .single();

                    if (updateError) {
                        console.error('Error updating profile with Clerk ID:', updateError);
                        return null;
                    }

                    profile = updatedProfile;
                } else {
                    // Create new profile
                    profile = await this.createUserProfile(clerkUserId, email, clerkData);
                }
            } else {
                // Update existing profile with latest Clerk data
                const { data: updatedProfile, error: updateError } = await supabase
                    .from('user_profiles')
                    .update({
                        first_name: clerkData?.first_name || profile.first_name,
                        last_name: clerkData?.last_name || profile.last_name,
                        avatar_url: clerkData?.avatar_url || profile.avatar_url,
                        email_verified: clerkData?.email_verified || profile.email_verified,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', clerkUserId)
                    .select()
                    .single();

                if (updateError) {
                    console.error('Error updating profile:', updateError);
                    return null;
                }

                profile = updatedProfile;
            }

            console.log('✅ Clerk user synced successfully:', profile?.user_id);
            return profile;
        } catch (error) {
            console.error('❌ Error syncing Clerk user:', error);
            return null;
        }
    }

    static async updateLastSignIn(userId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('user_profiles')
                .update({
                    last_sign_in: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);

            if (error) {
                console.error('Error updating last sign in:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in updateLastSignIn:', error);
            return false;
        }
    }

    static async canPerformAction(userId: string, actionType: 'job_search' | 'cron_execution' | 'api_call'): Promise<boolean> {
        try {
            const limits = await this.getUserLimits(userId);
            if (!limits) return false;

            // Check if user has credits
            if (!limits.can_perform_action) return false;

            // Check daily limits for job searches
            if (actionType === 'job_search' && limits.daily_searches_used >= limits.daily_searches_limit) {
                return false;
            }

            // Check cron job limits for cron executions
            if (actionType === 'cron_execution' && limits.cron_jobs_used >= limits.cron_jobs_limit) {
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in canPerformAction:', error);
            return false;
        }
    }
} 