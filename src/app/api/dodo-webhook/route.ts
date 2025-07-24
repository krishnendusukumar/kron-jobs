import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { UserProfileService } from '@/lib/user-profile-service';
import { supabase } from '@/lib/supabase';

export const POST = async (req: Request) => {
    try {
        // 1. Read raw body
        const rawBody = await req.text();

        // 2. Get signature from headers
        const signature = req.headers.get("webhook-signature");
        const secret = process.env.DODO_WEBHOOK_SECRET;

        // DEBUG: Log everything for troubleshooting
        console.log('🔍 DODO WEBHOOK DEBUG START');
        console.log('📋 All headers:', Object.fromEntries(req.headers.entries()));
        console.log('🔑 Signature header value:', signature);
        console.log('🔐 Secret configured:', secret ? 'YES' : 'NO');
        console.log('📄 Raw body length:', rawBody.length);
        console.log('📄 Raw body preview:', rawBody.substring(0, 200) + '...');

        if (!signature || !secret) {
            console.log('❌ Missing signature or secret');
            console.log('   Signature present:', !!signature);
            console.log('   Secret present:', !!secret);
            return NextResponse.json({ message: "Missing signature or secret" }, { status: 400 });
        }

        // 3. Verify signature (HMAC-SHA256)
        const hmac = createHmac("sha256", secret);
        hmac.update(rawBody, "utf8");
        const digest = hmac.digest("hex");

        console.log('🔐 Computed digest:', digest);
        console.log('🔑 Received signature:', signature);
        console.log('📏 Signature length match:', signature.length === digest.length);

        // Use timingSafeEqual for security
        const isValid =
            signature.length === digest.length &&
            timingSafeEqual(Buffer.from(signature), Buffer.from(digest));

        console.log('✅ Signature valid:', isValid);

        if (!isValid) {
            console.log('❌ Invalid signature - rejecting webhook');
            return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
        }

        // 4. Parse event
        const event = JSON.parse(rawBody);
        console.log('📊 Parsed event type:', event.type);
        console.log('📊 Event data keys:', Object.keys(event.data || {}));
        console.log('🔍 DODO WEBHOOK DEBUG END');

        // 5. Handle event types
        switch (event.type) {
            case "payment.succeeded": {
                // Restore business logic for successful payment
                const data = event.data || {};
                const userId = data?.metadata?.userId;
                const plan = data?.metadata?.plan || 'lifetime';
                const email = data?.customer?.email;
                console.log('Dodo payment.succeeded event:', { userId, plan, email });
                if (userId) {
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
                        }
                    } else {
                        console.error('❌ No user profile found for payment:', event);
                    }
                } else if (email) {
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
                        }
                    } else {
                        console.error('❌ No user profile found for payment (by email):', event);
                    }
                }
                break;
            }
            case "payment.failed":
                // Your logic for failed payment
                break;
            default:
                // Handle other event types
                break;
        }

        return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error processing webhook:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}; 