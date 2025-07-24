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

        if (!signature || !secret) {
            return NextResponse.json({ message: "Missing signature or secret" }, { status: 400 });
        }

        // 3. Verify signature (HMAC-SHA256)
        const hmac = createHmac("sha256", secret);
        hmac.update(rawBody, "utf8");
        const digest = hmac.digest("hex");

        // Use timingSafeEqual for security
        const isValid =
            signature.length === digest.length &&
            timingSafeEqual(Buffer.from(signature), Buffer.from(digest));

        if (!isValid) {
            return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
        }

        // 4. Parse event
        const event = JSON.parse(rawBody);

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