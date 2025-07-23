import { NextRequest, NextResponse } from 'next/server';
import { UserProfileService } from '@/lib/user-profile-service';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

const DODO_WEBHOOK_SECRET = process.env.DODO_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
    try {
        // Get the raw body for signature verification
        const body = await req.text();
        const signature = req.headers.get('x-dodo-signature') || req.headers.get('signature');

        console.log('📨 Received Dodo webhook:', {
            hasBody: !!body,
            hasSignature: !!signature,
            bodyLength: body.length
        });

        // Verify webhook signature if secret is configured
        if (DODO_WEBHOOK_SECRET && signature) {
            const expectedSignature = crypto
                .createHmac('sha256', DODO_WEBHOOK_SECRET)
                .update(body)
                .digest('hex');

            if (signature !== expectedSignature) {
                console.error('❌ Invalid webhook signature');
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        }

        // Parse the webhook payload
        let payload;
        try {
            payload = JSON.parse(body);
        } catch (error) {
            console.error('❌ Failed to parse webhook payload:', error);
            return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
        }

        console.log('📊 Webhook payload:', payload);

        // Handle payment success - upgrade user plan
        // Dodo will send webhook when payment is successful
        if (payload.status === 'completed' || payload.payment_status === 'completed') {
            console.log('✅ Payment completed, upgrading user plan');

            // For now, upgrade to lifetime plan (you can modify this based on your needs)
            // In a real scenario, you might want to identify which user made the payment
            // You could store user info in a separate table or use email matching

            // Example: if you have user email in the webhook
            const userEmail = payload.customer?.email || payload.email;
            if (userEmail) {
                // Find user by email and upgrade
                const { data: userProfile } = await supabase
                    .from('user_profiles')
                    .select('user_id')
                    .eq('email', userEmail)
                    .single();

                if (userProfile) {
                    const upgradeSuccess = await UserProfileService.upgradePlan(
                        userProfile.user_id,
                        'lifetime',
                        'dodo'
                    );

                    if (upgradeSuccess) {
                        console.log('✅ User plan upgraded successfully:', userEmail);
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Webhook processed successfully'
        });

    } catch (error: any) {
        console.error('❌ Error processing Dodo webhook:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error.message
        }, { status: 500 });
    }
} 