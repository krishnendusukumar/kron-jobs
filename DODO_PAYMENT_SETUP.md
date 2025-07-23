# Dodo Payment Gateway Integration Setup

## 🚀 Overview
Simple Dodo payment integration using product URL redirect and webhook notifications.

## 📋 Prerequisites
- Dodo merchant account
- Product URL from Do`-`++++++++++++++++++++++++++++do
- Webhook signing key

## 🔧 Environment Variables Setup

Add these to your `.env.local` file:

```bash
# Dodo Payment Gateway
DODO_WEBHOOK_SECRET=your_webhook_signing_key_here
NEXT_PUBLIC_DODO_PRODUCT_URL=https://your-dodo-product-url-here
```

## 🌐 Webhook Configuration

### 1. **Webhook URL**
Your webhook endpoint is: `https://yourdomain.com/api/dodo-webhook`

### 2. **Configure in Dodo Dashboard**
- Log into your Dodo merchant dashboard
- Go to Webhooks/Integrations section
- Add webhook URL: `https://yourdomain.com/api/dodo-webhook`
- Set webhook signing key (save this as `DODO_WEBHOOK_SECRET`)

## 💳 Payment Flow

### 1. **User clicks "Upgrade Now"**
- Frontend redirects to your Dodo product URL
- User completes payment on Dodo's page

### 2. **Dodo sends webhook**
- When payment is successful, Dodo sends webhook to `/api/dodo-webhook`
- Webhook verifies signature and upgrades user plan

### 3. **User plan is upgraded**
- Plan is automatically upgraded in database
- User can continue using the app

## 🛡️ Security Features

### 1. **Webhook Signature Verification**
- All webhooks are verified using HMAC-SHA256
- Prevents unauthorized webhook calls

### 2. **Simple and Clean**
- No complex API calls
- Just redirect to product URL
- Webhook handles the rest

## 🧪 Testing

### 1. **Local Testing**
- Use ngrok for local webhook testing
- Set webhook URL to your ngrok URL

### 2. **Production**
- Deploy to production
- Update webhook URL in Dodo dashboard
- Test with real payments

## 📊 Monitoring

### 1. **Webhook Logs**
Check server logs for webhook events:
```bash
# Look for these log messages:
📨 Received Dodo webhook
✅ Payment completed, upgrading user plan
✅ User plan upgraded successfully
```

## 🚨 Troubleshooting

### Common Issues:

1. **Webhook not receiving events**
   - Check webhook URL is correct
   - Verify webhook secret matches
   - Check server logs for errors

2. **Payment not upgrading user**
   - Check if user email matches in webhook
   - Verify database connection
   - Review webhook payload format

## 📞 Support

- Check Dodo's webhook documentation
- Review webhook payload examples
- Test with Dodo's sandbox environment

---

**Next Steps:**
1. Get your Dodo product URL and webhook signing key
2. Set up environment variables
3. Configure webhook in Dodo dashboard
4. Test the complete payment flow

**That's it! Simple and clean.** 🎯 