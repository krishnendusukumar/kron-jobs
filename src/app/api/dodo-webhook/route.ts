import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

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
            case "payment.succeeded":
                // Your logic for successful payment
                break;
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