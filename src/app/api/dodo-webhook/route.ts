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

        // Extract from payload.data
        const data = payload.data || {};
        const userId = data?.metadata?.userId;
        const plan = data?.metadata?.plan || 'lifetime';
        const email = data?.customer?.email;
        const status = data?.status || payload.status || payload.type;
        const type = payload.type;

        const isPaymentSuccess =
            status === 'completed' ||
            status === 'succeeded' ||
            type === 'payment.succeeded';

        if (isPaymentSuccess && userId) {
            // Prefer userId for matching
            const { data: userProfile, error } = await supabase
                .from('user_profiles')
                .select('user_id, email, plan')
                .eq('user_id', userId)
                .single();
            if (error) {
                console.error('❌ Error finding user by userId:', error);
            }
            if (userProfile) {
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
        } else if (isPaymentSuccess && email) {
            // Fallback to email
            const { data: userProfile, error } = await supabase
                .from('user_profiles')
                .select('user_id, email, plan')
                .eq('email', email)
                .single();
            if (error) {
                console.error('❌ Error finding user by email:', error);
            }
            if (userProfile) {
                const upgradeSuccess = await UserProfileService.upgradePlan(
                    userProfile.user_id,
                    plan as 'lifetime' | 'pro',
                    'dodo'
                );
                if (upgradeSuccess) {
                    console.log('✅ User plan upgraded successfully (by email):', {
                        userId: userProfile.user_id,
                        email: userProfile.email,
                        newPlan: plan
                    });
                } else {
                    console.error('❌ Failed to upgrade user plan (by email)');
                    return NextResponse.json({ error: 'Failed to upgrade plan' }, { status: 500 });
                }
            } else {
                console.error('❌ No user profile found for payment (by email):', payload);
                return NextResponse.json({ error: 'User profile not found (by email)' }, { status: 404 });
            }
        }
        return NextResponse.json({ success: true, message: 'Webhook processed successfully' });
    } catch (error: any) {
        console.error('❌ Error processing Dodo webhook:', error);
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
} 