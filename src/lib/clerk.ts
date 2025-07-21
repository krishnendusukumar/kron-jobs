import { clerkClient } from '@clerk/nextjs/server';
import { supabase } from './supabase';
import { UserProfileService } from './user-profile-service';

export interface ClerkWebhookPayload {
    type: string;
    data: {
        id: string;
        email_addresses?: Array<{
            email_address: string;
            id: string;
        }>;
        email_address?: {
            email_address: string;
            id: string;
        };
        [key: string]: any;
    };
}

export class ClerkService {
    /**
     * Handle Clerk webhook events for user management
     */
    static async handleWebhook(payload: ClerkWebhookPayload): Promise<{ success: boolean; message: string }> {
        try {
            console.log('🔄 Processing Clerk webhook:', payload.type);

            switch (payload.type) {
                case 'user.created':
                    return await this.handleUserCreated(payload.data);

                case 'user.updated':
                    return await this.handleUserUpdated(payload.data);

                case 'user.deleted':
                    return await this.handleUserDeleted(payload.data);

                case 'email_address.created':
                    return await this.handleEmailCreated(payload.data);

                default:
                    console.log('⚠️ Unhandled webhook type:', payload.type);
                    return { success: true, message: 'Webhook type not handled' };
            }
        } catch (error) {
            console.error('❌ Error processing Clerk webhook:', error);
            return { success: false, message: 'Error processing webhook' };
        }
    }

    /**
     * Handle new user creation - create Supabase profile with free tier
     */
    private static async handleUserCreated(userData: any): Promise<{ success: boolean; message: string }> {
        try {
            const userId = userData.id;
            const email = userData.email_addresses?.[0]?.email_address || userData.email_address?.email_address;

            if (!email) {
                throw new Error('No email found for user');
            }

            console.log(`👤 Creating Supabase profile for user ${userId} with email ${email}`);

            // Create user profile with free tier
            const profile = await UserProfileService.createUserProfile(userId, email);

            if (!profile) {
                throw new Error('Failed to create user profile');
            }

            console.log(`✅ Successfully created profile for user ${userId}`);
            return {
                success: true,
                message: `User profile created with free tier (${profile.credits_remaining} credits)`
            };
        } catch (error) {
            console.error('❌ Error creating user profile:', error);
            return { success: false, message: 'Failed to create user profile' };
        }
    }

    /**
     * Handle user updates - sync changes to Supabase
     */
    private static async handleUserUpdated(userData: any): Promise<{ success: boolean; message: string }> {
        try {
            const userId = userData.id;
            const email = userData.email_addresses?.[0]?.email_address || userData.email_address?.email_address;

            if (!email) {
                throw new Error('No email found for user');
            }

            console.log(`🔄 Updating Supabase profile for user ${userId}`);

            // Update user profile
            const { error } = await supabase
                .from('user_profiles')
                .update({
                    email: email,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);

            if (error) {
                throw new Error(`Failed to update user profile: ${error.message}`);
            }

            console.log(`✅ Successfully updated profile for user ${userId}`);
            return { success: true, message: 'User profile updated' };
        } catch (error) {
            console.error('❌ Error updating user profile:', error);
            return { success: false, message: 'Failed to update user profile' };
        }
    }

    /**
     * Handle user deletion - cleanup Supabase data
     */
    private static async handleUserDeleted(userData: any): Promise<{ success: boolean; message: string }> {
        try {
            const userId = userData.id;

            console.log(`🗑️ Cleaning up Supabase data for user ${userId}`);

            // Delete user profile and related data
            const { error } = await supabase
                .from('user_profiles')
                .delete()
                .eq('user_id', userId);

            if (error) {
                console.error('⚠️ Error deleting user profile:', error);
            }

            // Delete cron jobs
            const { error: cronError } = await supabase
                .from('cron_jobs')
                .delete()
                .eq('user_id', userId);

            if (cronError) {
                console.error('⚠️ Error deleting cron jobs:', cronError);
            }

            // Delete job preferences
            const { error: prefError } = await supabase
                .from('job_preferences')
                .delete()
                .eq('email', userData.email_addresses?.[0]?.email_address);

            if (prefError) {
                console.error('⚠️ Error deleting job preferences:', prefError);
            }

            console.log(`✅ Successfully cleaned up data for user ${userId}`);
            return { success: true, message: 'User data cleaned up' };
        } catch (error) {
            console.error('❌ Error cleaning up user data:', error);
            return { success: false, message: 'Failed to clean up user data' };
        }
    }

    /**
     * Handle email address creation/update
     */
    private static async handleEmailCreated(userData: any): Promise<{ success: boolean; message: string }> {
        try {
            const userId = userData.id;
            const email = userData.email_address?.email_address;

            if (!email) {
                throw new Error('No email found');
            }

            console.log(`📧 Updating email for user ${userId} to ${email}`);

            // Update user profile with new email
            const { error } = await supabase
                .from('user_profiles')
                .update({
                    email: email,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);

            if (error) {
                throw new Error(`Failed to update email: ${error.message}`);
            }

            console.log(`✅ Successfully updated email for user ${userId}`);
            return { success: true, message: 'Email updated' };
        } catch (error) {
            console.error('❌ Error updating email:', error);
            return { success: false, message: 'Failed to update email' };
        }
    }

    /**
     * Get user profile from Clerk and sync with Supabase
     */
    static async getUserProfile(userId: string): Promise<any> {
        try {
            // Get user from Clerk
            const client = await clerkClient();
            const user = await client.users.getUser(userId);

            if (!user) {
                throw new Error('User not found in Clerk');
            }

            const email = user.emailAddresses[0]?.emailAddress;

            if (!email) {
                throw new Error('No email found for user');
            }

            // Get or create Supabase profile
            const profile = await UserProfileService.getOrCreateUserProfile(userId, email);

            return {
                clerkUser: user,
                supabaseProfile: profile
            };
        } catch (error) {
            console.error('❌ Error getting user profile:', error);
            throw error;
        }
    }

    /**
     * Verify webhook signature (implement based on your Clerk webhook secret)
     */
    static verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
        // Implement webhook signature verification
        // This is a placeholder - implement proper verification based on Clerk docs
        return true;
    }
} 