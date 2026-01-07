# Billing System Testing Guide

## ✅ Completed Setup
- ✅ Database migration executed successfully on Render PostgreSQL
- ✅ 4 pricing tiers created with Stripe Price IDs
- ✅ Test client user created
- ✅ Code deployed to GitHub (commit a758ee5)
- ⏳ Render deployment in progress (auto-deploy from GitHub)

## Test Client User Credentials

**Email:** test@hypeinsight.com  
**Password:** password123  
**Tenant:** Hype Insight (tenant_hype_insight)

## Testing Steps

### 1. Wait for Render Deployment (2-3 minutes)
Check deployment status at: https://dashboard.render.com

### 2. Test Client Login
1. Navigate to: https://reviewmanagement.hypeinsight.com/client/
2. Login with the credentials above
3. You should see the dashboard with:
   - Current subscription status (likely "No Active Subscription")
   - Usage statistics
   - Pricing cards for all 4 tiers

### 3. Test Stripe Checkout Flow
1. Click "Get Started" on any pricing tier (e.g., Basic - $19/month)
2. You'll be redirected to Stripe Checkout
3. Use Stripe test card:
   - **Card Number:** 4242 4242 4242 4242
   - **Expiry:** Any future date (e.g., 12/30)
   - **CVC:** Any 3 digits (e.g., 123)
   - **ZIP:** Any 5 digits (e.g., 12345)
4. Complete the checkout
5. You should be redirected back to the dashboard
6. Dashboard should now show:
   - Active subscription
   - Current plan details
   - Usage limits
   - "Manage Subscription" button

### 4. Test Subscription Management
1. Click "Manage Subscription" button
2. You'll be redirected to Stripe Customer Portal
3. You can:
   - Update payment method
   - Cancel subscription
   - View invoices

### 5. Set Up Stripe Webhook (Important!)
For production use, you need to configure the webhook endpoint:

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Enter endpoint URL: `https://reviewmanagement.hypeinsight.com/api/billing/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret
6. Add to Render environment variables as `STRIPE_WEBHOOK_SECRET`

### 6. Test Usage Tracking & Limits
1. Try to submit feedback for the tenant
2. Check that usage is tracked in the dashboard
3. Verify limits are enforced based on the plan

## Environment Variables to Verify on Render

Make sure these are set in your Render environment:

```bash
DATABASE_URL=<your_render_database_url>
STRIPE_SECRET_KEY=<your_stripe_secret_key>
STRIPE_PUBLISHABLE_KEY=<your_stripe_publishable_key>
JWT_SECRET=<generate_random_secret>
API_BASE_URL=https://reviewmanagement.hypeinsight.com
```

⚠️ **IMPORTANT:** Change `JWT_SECRET` to a strong random value in production!

## Pricing Tiers Summary

| Plan         | Price/Month | Feedback Limit | Locations | Stripe Price ID                  |
|--------------|-------------|----------------|-----------|----------------------------------|
| Basic        | $19         | 50             | 1         | price_1SmvNAIJU39QO7T6WmRR217n  |
| Starter      | $39         | 150            | 3         | price_1SmvNlIJU39QO7T618xVVqpd  |
| Professional | $79         | 500            | 10        | price_1SmvOCIJU39QO7T6dHHScLp9  |
| Enterprise   | $199        | Unlimited      | Unlimited | price_1SmvOYIJU39QO7T6yMmaQzgy  |

## API Endpoints Available

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user info

### Billing
- `GET /api/billing/pricing` - Get all pricing tiers
- `POST /api/billing/create-checkout` - Create Stripe checkout session
- `POST /api/billing/create-portal` - Create Stripe customer portal session
- `GET /api/billing/subscription` - Get current subscription
- `GET /api/billing/usage` - Get usage statistics
- `GET /api/billing/invoices` - Get invoice history
- `POST /api/billing/webhook` - Stripe webhook endpoint

### Client Dashboard
- `GET /api/client/dashboard` - Get dashboard data
- `GET /api/client/locations` - Get tenant locations
- `GET /api/client/settings` - Get tenant settings
- `PUT /api/client/settings` - Update tenant settings

## Troubleshooting

### Can't login?
- Check that the deployment completed successfully
- Verify DATABASE_URL is correct on Render
- Check browser console for errors

### Checkout fails?
- Verify STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY are set correctly
- Check Stripe dashboard for errors
- Ensure test mode is enabled in Stripe

### Webhook not working?
- Verify webhook endpoint is configured in Stripe dashboard
- Check webhook signing secret is set in environment variables
- View webhook logs in Stripe dashboard

## Next Steps After Testing

1. ✅ Verify all flows work correctly
2. 🔄 Remove temporary migration endpoint from `api/index.ts` (line with `/api/admin/migrate`)
3. 🔒 Update JWT_SECRET to a strong random value
4. 📧 Add email notification templates (optional)
5. 👥 Update admin panel to show subscription status (optional)
6. 🚀 Switch to live Stripe keys when ready for production
7. 💰 Test with real payments in live mode

## Support

If you encounter any issues during testing, check:
1. Render deployment logs
2. Browser console errors
3. Network tab in browser dev tools
4. Stripe dashboard for payment/webhook errors
