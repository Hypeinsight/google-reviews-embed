# Stripe Billing & Client Dashboard Setup Guide

## 🎯 Overview

This system now includes:
- **4 pricing tiers**: Basic ($19), Starter ($39), Professional ($79), Enterprise ($199)
- **Stripe integration** for subscriptions and payments
- **Client dashboard** with authentication and billing management
- **Usage tracking** and limit enforcement
- **Webhook handling** for real-time subscription updates

---

## 📋 Prerequisites

- PostgreSQL database set up and running
- Stripe account (use test mode for development)
- SendGrid API key (for email notifications)
- Node.js v18+

---

## 🚀 Step 1: Run Database Migration

```powershell
# Run the billing migration
psql -U your_user -d google_reviews_embed -f db\migration_billing.sql
```

This creates:
- `subscriptions` table
- `pricing_tiers` table (with 4 default tiers)
- `usage_metrics` table
- `invoices` table
- `client_users` table

---

## 🔑 Step 2: Configure Environment Variables

Update your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# JWT Authentication
JWT_SECRET=your_random_jwt_secret_change_in_production
JWT_EXPIRES_IN=7d

# Existing variables...
DATABASE_URL=postgresql://...
SENDGRID_API_KEY=...
```

---

## 💳 Step 3: Set Up Stripe

### 3.1 Create Products & Prices in Stripe Dashboard

Go to **Products** → **Add Product** and create 4 products:

1. **Basic Plan**
   - Price: $19/month recurring
   - Copy the Price ID (starts with `price_...`)

2. **Starter Plan**
   - Price: $39/month recurring
   - Copy the Price ID

3. **Professional Plan**
   - Price: $79/month recurring
   - Copy the Price ID

4. **Enterprise Plan**
   - Price: $199/month recurring
   - Copy the Price ID

### 3.2 Update Database with Real Price IDs

```sql
UPDATE pricing_tiers SET stripe_price_id = 'price_ABC123' WHERE id = 'basic';
UPDATE pricing_tiers SET stripe_price_id = 'price_DEF456' WHERE id = 'starter';
UPDATE pricing_tiers SET stripe_price_id = 'price_GHI789' WHERE id = 'professional';
UPDATE pricing_tiers SET stripe_price_id = 'price_JKL012' WHERE id = 'enterprise';
```

### 3.3 Set Up Webhooks

1. Go to **Developers** → **Webhooks** → **Add endpoint**
2. Endpoint URL: `https://yourdomain.com/api/billing/webhook`
   - For local testing: Use **Stripe CLI** or **ngrok**
3. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the **Signing secret** and add to `.env` as `STRIPE_WEBHOOK_SECRET`

---

## 👤 Step 4: Create Client Users

Use the helper script to create client users:

```powershell
# Syntax
node scripts/create_client_user.js <email> <password> <name> <tenant_id> [role]

# Example
node scripts/create_client_user.js client@example.com mypassword123 "John Doe" tenant_abc owner
```

**Parameters:**
- `email`: User's login email
- `password`: Plain text password (will be hashed with bcrypt)
- `name`: User's display name
- `tenant_id`: Existing tenant ID from your tenants table
- `role`: Either `owner` or `member` (default: `owner`)

---

## 🧪 Step 5: Test the Flow

### 5.1 Start the Server

```powershell
npm run dev
```

### 5.2 Test Client Login

1. Navigate to: `http://localhost:3000/client/`
2. Login with the credentials you created
3. You should see the dashboard

### 5.3 Test Stripe Checkout

1. Click **"Choose a Plan"** on the dashboard
2. Click **"Select Plan"** on any tier
3. You'll be redirected to Stripe Checkout
4. Use Stripe test card: `4242 4242 4242 4242`
5. Complete checkout
6. You should be redirected back to dashboard
7. Subscription should now show as "Active"

### 5.4 Test Webhooks Locally

```powershell
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/billing/webhook

# In another terminal, trigger a test webhook
stripe trigger customer.subscription.created
```

---

## 🔐 Step 6: Enable Customer Portal (Optional)

The "Manage Billing" button uses Stripe Customer Portal.

1. Go to **Settings** → **Billing** → **Customer Portal**
2. Enable **Customer portal**
3. Configure what customers can do:
   - ✅ Update payment method
   - ✅ View billing history
   - ✅ Cancel subscription
   - ✅ Switch plans (enable plan switching)

---

## 📊 Available API Endpoints

### Authentication
- `POST /api/auth/login` - Client login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Billing (Public)
- `GET /api/billing/pricing` - Get pricing tiers

### Billing (Authenticated)
- `POST /api/billing/create-checkout` - Start subscription checkout
- `POST /api/billing/create-portal` - Open customer portal
- `GET /api/billing/subscription` - Get current subscription
- `POST /api/billing/cancel-subscription` - Cancel subscription
- `GET /api/billing/usage` - Get usage metrics
- `GET /api/billing/invoices` - Get invoice history

### Client Dashboard (Authenticated)
- `GET /api/client/dashboard` - Dashboard stats
- `GET /api/client/locations` - List locations
- `GET /api/client/settings` - Get settings
- `PUT /api/client/settings` - Update settings

### Webhooks
- `POST /api/billing/webhook` - Stripe webhook handler (raw body)

---

## 🎨 Client Dashboard Pages

- `/client/` - Login page
- `/client/dashboard.html` - Main dashboard with subscription management

---

## 📈 Usage Tracking

Feedback submissions are automatically tracked and enforced based on plan limits:

- **Basic**: 50/month
- **Starter**: 150/month
- **Professional**: 500/month
- **Enterprise**: Unlimited

When a tenant reaches their limit, they'll receive a `429` error with upgrade prompt.

---

## 🔔 Email Notifications (TODO)

The following email notifications need to be implemented:

- Welcome email on signup
- Trial ending warning (3 days before)
- Payment failed notification
- Subscription cancelled confirmation
- Usage limit warning (80% threshold)

---

## 🚨 Troubleshooting

### "Failed to verify webhook signature"
- Check that `STRIPE_WEBHOOK_SECRET` is correct
- Ensure webhook endpoint uses raw body parser

### "Invalid or expired token"
- JWT_SECRET must be set in `.env`
- Cookies must be enabled in browser

### "Tenant not found" when creating user
- Run `SELECT id, name FROM tenants;` to see available tenants
- Make sure tenant_id matches exactly

### Subscription not showing after checkout
- Check webhook logs in Stripe Dashboard
- Verify webhook secret is correct
- Check server logs for webhook processing errors

---

## 📝 Production Checklist

Before going live:

- [ ] Switch Stripe from test mode to live mode
- [ ] Update all Stripe API keys in `.env`
- [ ] Update webhook endpoint URL in Stripe
- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS (required for Stripe)
- [ ] Test complete checkout flow with real payment
- [ ] Set up monitoring for webhook failures
- [ ] Configure proper CORS settings
- [ ] Add rate limiting to authentication endpoints
- [ ] Implement billing email notifications

---

## 🆘 Support

For issues:
1. Check server logs: `npm run dev`
2. Check Stripe Dashboard → Developers → Logs
3. Check browser console for JavaScript errors
4. Verify database connection and migrations

---

**Built with:** Node.js, Express, PostgreSQL, Stripe, JWT, bcrypt
