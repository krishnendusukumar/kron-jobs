import { NextRequest, NextResponse } from 'next/server';
import { UserProfileService } from '@/lib/user-profile-service';
import { supabase } from '@/lib/supabase';
import { Webhook } from 'standardwebhooks';

const DODO_WEBHOOK_SECRET = process.env.DODO_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const headersList = req.headers;
        const webhookHeaders = {
            'webhook-id': headersList.get('webhook-id') || '',
            'webhook-signature': headersList.get('webhook-signature') || '',
            'webhook-timestamp': headersList.get('webhook-timestamp') || '',
        };

        if (!DODO_WEBHOOK_SECRET) {
            return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
        }

        const webhook = new Webhook(DODO_WEBHOOK_SECRET);
        try {
            await webhook.verify(rawBody, webhookHeaders);
        } catch (err) {
            console.error('❌ Webhook signature verification failed:', err);
            return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
        }

        const payload = JSON.parse(rawBody);
        console.log('📊 Dodo Webhook Payload:', JSON.stringify(payload, null, 2));

        // Check for payment success
        const isPaymentSuccess =
            payload.status === 'completed' ||
            payload.payment_status === 'completed' ||
            payload.status === 'succeeded' ||
            payload.payment_status === 'succeeded' ||
            payload.event === 'payment.succeeded' ||
            payload.type === 'payment.succeeded';

        if (isPaymentSuccess) {
            // Prefer metadata_userId for matching
            const userId = payload.metadata_userId || (payload.metadata && payload.metadata.userId);
            let userProfile = null;
            if (userId) {
                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('user_id, email, plan')
                    .eq('user_id', userId)
                    .single();
                if (error) {
                    console.error('❌ Error finding user by userId:', error);
                }
                userProfile = data;
            } else {
                // Fallback to email
                const userEmail = payload.email || payload.customer?.email;
                if (userEmail) {
                    const { data, error } = await supabase
                        .from('user_profiles')
                        .select('user_id, email, plan')
                        .eq('email', userEmail)
                        .single();
                    if (error) {
                        console.error('❌ Error finding user by email:', error);
                    }
                    userProfile = data;
                }
            }
            if (userProfile) {
                const plan = payload.metadata_plan || (payload.metadata && payload.metadata.plan) || 'lifetime';
                const upgradeSuccess = await UserProfileService.upgradePlan(
                    userProfile.user_id,
                    plan as 'lifetime' | 'pro',
                    'dodo'
                );
                if (upgradeSuccess) {
                    console.log('✅ User plan upgraded successfully:', {
                        userId: userProfile.user_id,
                        email: userProfile.email,
                        newPlan: plan
                    });
                } else {
                    console.error('❌ Failed to upgrade user plan');
                    return NextResponse.json({ error: 'Failed to upgrade plan' }, { status: 500 });
                }
            } else {
                console.error('❌ No user profile found for payment:', payload);
                return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
            }
        }
        return NextResponse.json({ success: true, message: 'Webhook processed successfully' });
    } catch (error: any) {
        console.error('❌ Error processing Dodo webhook:', error);
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
} 