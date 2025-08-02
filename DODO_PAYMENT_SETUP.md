# Dodo Payment Gateway Integration Setup

## 🚀 Overview
Complete Dodo payment integration using product URL redirect and webhook notifications with proper signature verification.

## 📋 Prerequisites
- Dodo merchant account
- Product URL from Dodo
- Webhook signing key

## 🔧 Environment Variables Setup

Add these to your `.env.local` file and Vercel environment variables:

```bash
# Dodo Payment Gateway
DODO_WEBHOOK_KEY=your_webhook_signing_key_here
NEXT_PUBLIC_DODO_PRODUCT_ID_WEEKLY=your_weekly_dodo_product_id_here
NEXT_PUBLIC_DODO_PRODUCT_ID_MONTHLY=your_monthly_dodo_product_id_here

# Optional: For advanced features
DODO_PAYMENTS_API_KEY=your_api_key_here
RETURN_URL=https://yourdomain.com/dashboard?payment=success
```

## 🌐 Webhook Configuration

### 1. **Webhook URL**
Your webhook endpoint is: `https://yourdomain.com/api/dodo-webhook`

### 2. **Configure in Dodo Dashboard**
- Log into your Dodo merchant dashboard
- Go to Webhooks/Integrations section
- Add webhook URL: `https://yourdomain.com/api/dodo-webhook`
- Set webhook signing key (save this as `DODO_WEBHOOK_SECRET`)
- Subscribe to events: `payment.succeeded`, `payment.failed`, `dispute.created`

## 💳 Payment Flow

### 1. **User clicks "Upgrade Now"**
- Frontend redirects to your Dodo product URL with metadata
- User completes payment on Dodo's page

### 2. **Dodo sends webhook**
- When payment is successful, Dodo sends webhook to `/api/dodo-webhook`
- Webhook verifies signature using HMAC-SHA256 with Base64 encoding
- Extracts user metadata and upgrades user plan

### 3. **User plan is upgraded**
- Plan is automatically upgraded in database
- User can continue using the app

## 🛡️ Security Features

### 1. **Webhook Signature Verification**
- All webhooks are verified using HMAC-SHA256 with Base64 encoding
- Handles Svix format: `v1,signature`
- Uses timing-safe comparison to prevent timing attacks
- Prevents unauthorized webhook calls

### 2. **User Identification**
- Primary: Uses `metadata.userId` from webhook payload
- Fallback: Uses `customer.email` if userId not available
- Updates user plan in Supabase database

### 3. **Error Handling**
- Comprehensive logging for debugging
- Proper HTTP status codes for different error scenarios
- Graceful handling of missing user profiles

## 🧪 Testing

### 1. **Local Testing**
- Use ngrok for local webhook testing
- Set webhook URL to your ngrok URL
- Test with Dodo's sandbox environment

### 2. **Production**
- Deploy to production
- Update webhook URL in Dodo dashboard
- Test with real payments

## 📊 Monitoring

### 1. **Webhook Logs**
Check server logs for webhook events:
```bash
# Look for these log messages:
🔍 DODO WEBHOOK RECEIVED
✅ Webhook signature verified successfully
💰 Payment succeeded event received
✅ User plan upgraded successfully
```

### 2. **Error Monitoring**
Watch for these error patterns:
- `❌ Webhook signature verification failed`
- `❌ No user profile found`
- `❌ Failed to upgrade user plan`

## 🚨 Troubleshooting

### Common Issues:

1. **Webhook signature verification fails**
   - Check that `DODO_WEBHOOK_SECRET` matches the one in Dodo dashboard
   - Verify the secret is set in both local and production environments
   - Check logs for signature comparison details

2. **Payment not upgrading user**
   - Check if user email matches in webhook payload
   - Verify database connection and user profile exists
   - Review webhook payload format in logs

3. **Missing environment variables**
   - Ensure `NEXT_PUBLIC_DODO_PRODUCT_ID_WEEKLY` and `NEXT_PUBLIC_DODO_PRODUCT_ID_MONTHLY` are set for frontend redirects
   - Verify `DODO_WEBHOOK_SECRET` is set for backend verification

## 🔧 Technical Details

### Webhook Signature Verification
```typescript
// HMAC-SHA256 with Base64 encoding
const hmac = createHmac("sha256", secret);
hmac.update(rawBody, "utf8");
const digest = hmac.digest("base64");

// Extract signature from "v1,signature" format
const actualSignature = signature.split(',')[1];

// Timing-safe comparison
const isValid = timingSafeEqual(Buffer.from(actualSignature), Buffer.from(digest));
```

### Event Handling
- `payment.succeeded`: Upgrades user plan
- `payment.failed`: Logs failure (optional handling)
- `dispute.created`: Logs dispute (optional handling)

## 📞 Support

- Check Dodo's webhook documentation
- Review webhook payload examples in logs
- Test with Dodo's sandbox environment
- Monitor Vercel function logs for detailed debugging

---

**Next Steps:**
1. Set up environment variables in `.env.local` and Vercel
2. Configure webhook in Dodo dashboard
3. Test the complete payment flow
4. Monitor logs for successful webhook processing

**That's it! Secure and reliable Dodo payment integration.** 🎯 