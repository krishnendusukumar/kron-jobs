import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { headers } from "next/headers";
import { UserProfileService } from '@/lib/user-profile-service';
import { supabase } from '@/lib/supabase';

const webhook = new Webhook(process.env.DODO_WEBHOOK_KEY!);

export async function POST(request: Request) {
    const headersList = await headers();

    try {
        console.log('🔍 DODO WEBHOOK RECEIVED');

        const rawBody = await request.text();
        console.log('📄 Body length:', rawBody.length);

        const webhookHeaders = {
            "webhook-id": headersList.get("webhook-id") || "",
            "webhook-signature": headersList.get("webhook-signature") || "",
            "webhook-timestamp": headersList.get("webhook-timestamp") || "",
        };

        console.log('📋 Webhook headers:', webhookHeaders);

        // Verify the webhook signature using standardwebhooks
        await webhook.verify(rawBody, webhookHeaders);
        console.log('✅ Webhook verified successfully');

        const payload = JSON.parse(rawBody);
        console.log('📊 Event type:', payload.type);
        console.log('📊 Event data keys:', Object.keys(payload.data || {}));

        // Handle different event types
        switch (payload.type) {
            case 'payment.succeeded': {
                console.log('💰 Payment succeeded event received');

                const data = payload.data || {};
                const userId = data?.metadata?.userId;
                const plan = data?.metadata?.plan || 'lifetime';
                const email = data?.customer?.email;

                console.log('🔍 Payment details:', { userId, plan, email });

                if (!email) {
                    console.error('❌ Missing customer email in payload');
                    return NextResponse.json({ error: 'Missing customer email' }, { status: 400 });
                }

                if (userId) {
                    // Try to find user by userId first
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
                        console.error('❌ No user profile found for userId:', userId);
                    }
                } else if (email) {
                    // Fallback to email lookup
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
                        console.error('❌ No user profile found for email:', email);
                        return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
                    }
                } else {
                    console.error('❌ No userId or email found in payment data');
                    return NextResponse.json({ error: 'No user identifier found' }, { status: 400 });
                }
                break;
            }

            case 'payment.failed': {
                console.log('❌ Payment failed event received');
                // Handle failed payment (optional)
                break;
            }

            case 'dispute.created': {
                console.log('⚠️ Dispute created event received');
                // Handle dispute (optional)
                break;
            }

            default: {
                console.log('ℹ️ Unhandled event type:', payload.type);
                break;
            }
        }

        console.log('✅ Webhook processed successfully');
        return NextResponse.json({ success: true, message: 'Webhook processed successfully' });

    } catch (error) {
        console.error('❌ Error processing webhook:', error);
        return NextResponse.json(
            {
                error: 'Webhook processing failed',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 400 }
        );
    }
}; 