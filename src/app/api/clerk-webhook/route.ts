import { NextRequest, NextResponse } from 'next/server';
import { ClerkService, ClerkWebhookPayload } from '@/lib/clerk';

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json() as ClerkWebhookPayload;
        const signature = request.headers.get('svix-signature');
        const timestamp = request.headers.get('svix-timestamp');
        const id = request.headers.get('svix-id');

        console.log('📨 Received Clerk webhook:', {
            type: payload.type,
            userId: payload.data.id,
            signature: signature ? 'present' : 'missing',
            timestamp,
            id
        });

        // Verify webhook signature (implement proper verification)
        // const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
        // if (!ClerkService.verifyWebhookSignature(request.body, signature, webhookSecret)) {
        //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        // }

        // Process the webhook
        const result = await ClerkService.handleWebhook(payload);

        if (result.success) {
            console.log('✅ Webhook processed successfully:', result.message);
            return NextResponse.json({ success: true, message: result.message });
        } else {
            console.error('❌ Webhook processing failed:', result.message);
            return NextResponse.json({ error: result.message }, { status: 500 });
        }
    } catch (error: any) {
        console.error('❌ Error processing Clerk webhook:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({ message: 'Clerk webhook endpoint is active' });
} 