import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { UserProfileService } from '@/lib/user-profile-service';
import { supabase } from '@/lib/supabase';

export const POST = async (req: Request) => {
    try {
        console.log('🔍 DODO WEBHOOK RECEIVED');

        // Get the raw body for signature verification
        const rawBody = await req.text();
        const signature = req.headers.get("webhook-signature");
        const secret = process.env.DODO_WEBHOOK_SECRET;

        console.log('📋 Headers received:', Object.keys(Object.fromEntries(req.headers.entries())));
        console.log('📄 Body length:', rawBody.length);
        console.log('🔑 Signature header value:', signature);
        console.log('🔐 Secret configured:', secret ? 'YES' : 'NO');

        if (!signature || !secret) {
            console.log('❌ Missing signature or secret');
            return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
        }

        // Verify the webhook signature (HMAC-SHA256) - Svix format
        const hmac = createHmac("sha256", secret);
        hmac.update(rawBody, "utf8");
        const digest = hmac.digest("base64"); // Use base64 to match Svix format

        console.log('🔐 Computed digest (base64):', digest);
        console.log('🔑 Received signature:', signature);

        // Extract the actual signature from the "v1,signature" format
        const signatureParts = signature.split(',');
        const actualSignature = signatureParts.length > 1 ? signatureParts[1] : signature;

        console.log('🔑 Extracted signature:', actualSignature);
        console.log('📏 Signature length match:', actualSignature.length === digest.length);

        // Use timingSafeEqual for security
        const isValid = timingSafeEqual(Buffer.from(actualSignature), Buffer.from(digest));

        console.log('✅ Signature valid:', isValid);

        if (!isValid) {
            console.log('❌ Invalid signature - rejecting webhook');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // Parse the event
        const event = JSON.parse(rawBody);
        console.log('📊 Event type:', event.type);
        console.log('📊 Event data keys:', Object.keys(event.data || {}));

        // Handle different event types
        switch (event.type) {
            case 'payment.succeeded': {
                console.log('💰 Payment succeeded event received');

                const data = event.data || {};
                const userId = data?.metadata?.userId;
                const plan = data?.metadata?.plan || 'lifetime';
                const email = data?.customer?.email;

                console.log('🔍 Payment details:', { userId, plan, email });

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
                console.log('ℹ️ Unhandled event type:', event.type);
                break;
            }
        }

        console.log('✅ Webhook processed successfully');
        return NextResponse.json({ success: true, message: 'Webhook processed successfully' });

    } catch (error) {
        console.error('❌ Error processing webhook:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}; 