# Razorpay Production Deployment Checklist

## ✅ Pre-Deployment Checklist

### Current Setup Verification
- [  ] Test mode is working perfectly
- [ ] Test payments completing successfully
- [ ] Database tables exist (`razorpay_orders`, `razorpay_refunds`)
- [ ] All test data documented
- [ ] Current `.env` backed up

### Razorpay Account
- [ ] Razorpay account fully verified
- [ ] KYC completed
- [ ] Bank account linked
- [ ] Live keys generated
- [ ] Test keys saved for reference

### Backend Infrastructure
- [ ] Supabase CLI installed (`npm install -g supabase`)
- [ ] Logged in to Supabase (`supabase login`)
- [ ] Project reference identified
- [ ] Edge Functions folder created

## 🚀 Deployment Steps

### Step 1: Deploy Edge Functions (30 minutes)

#### Option A: Automated Script
```bash
# Make script executable
chmod +x deploy-razorpay-production.sh

# Run deployment script
./deploy-razorpay-production.sh
```

#### Option B: Manual Deployment
```bash
# 1. Link project
supabase link --project-ref your-project-ref

# 2. Set secrets
supabase secrets set RAZORPAY_KEY_ID=rzp_live_XXXXX
supabase secrets set RAZORPAY_KEY_SECRET=your_live_secret

# 3. Deploy functions
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
```

**Verification:**
- [ ] Functions deployed successfully
- [ ] No deployment errors
- [ ] Secrets set correctly
- [ ] Functions visible in Supabase dashboard

### Step 2: Update Frontend Code (10 minutes)

#### Backup Current Code
```bash
# Backup test version
cp src/services/razorpayService.ts src/services/razorpayService.test.ts.bak

# Use production version
mv src/services/razorpayService.production.ts src/services/razorpayService.ts
```

#### Update Environment Variables

Update `.env`:
```env
# Change this line
VITE_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXX

# DO NOT add secret to frontend!
# Secret is only in Supabase backend
```

**Verification:**
- [ ] Production service file active
- [ ] Test service backed up
- [ ] Environment variables updated
- [ ] No secrets exposed in frontend

### Step 3: Test Locally (15 minutes)

```bash
# 1. Restart dev server
npm run dev

# 2. Test checkout flow
# 3. Create order (should call Edge Function)
# 4. Complete payment with test card
# 5. Verify order in Razorpay dashboard
```

**Test Cases:**
- [ ] Order creation works
- [ ] Edge Function called successfully
- [ ] Payment modal opens
- [ ] Test card payment completes
- [ ] Payment verified
- [ ] Database updated
- [ ] Order status correct

### Step 4: Deploy to Production (10 minutes)

```bash
# Build production version
npm run build

# Deploy to Netlify/Vercel/etc
# (Your deployment command here)
```

**Verification:**
- [ ] Frontend deployed successfully
- [ ] No build errors
- [ ] Environment variables set in hosting platform
- [ ] Production URL accessible

### Step 5: Production Testing (20 minutes)

#### Test with ₹1 Payment
- [ ] Go to production checkout
- [ ] Add item to cart
- [ ] Proceed to checkout
- [ ] Enter real details
- [ ] Complete payment with ₹1
- [ ] Verify in Razorpay dashboard
- [ ] Check database entry
- [ ] Confirm order created

#### Test Different Scenarios
- [ ] Cancel payment (close modal)
- [ ] Failed payment (insufficient balance)
- [ ] Successful payment (full amount)
- [ ] Different payment methods (UPI, Card, NetBanking)

### Step 6: Monitoring Setup (15 minutes)

#### Enable Function Logs
```bash
# View logs in real-time
supabase functions logs create-razorpay-order --follow
supabase functions logs verify-razorpay-payment --follow
```

#### Database Monitoring
```sql
-- Check recent orders
SELECT * FROM razorpay_orders 
ORDER BY created_at DESC 
LIMIT 10;

-- Check success rate
SELECT 
  status,
  COUNT(*) as count
FROM razorpay_orders
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY status;
```

#### Razorpay Dashboard
- [ ] Set up payment alerts
- [ ] Enable email notifications
- [ ] Configure webhooks (optional)
- [ ] Set up settlement schedule

**Monitoring Checklist:**
- [ ] Function logs accessible
- [ ] Database queries working
- [ ] Razorpay dashboard monitored
- [ ] Error alerts configured

## 🔍 Post-Deployment Verification

### Immediate (First Hour)
- [ ] Complete 3-5 test transactions
- [ ] Verify all payments in dashboard
- [ ] Check function logs for errors
- [ ] Monitor database entries
- [ ] Test refund process (if needed)

### First Day
- [ ] Monitor all transactions
- [ ] Check for any errors
- [ ] Verify settlement process
- [ ] Test different payment methods
- [ ] Ensure emails sent correctly

### First Week
- [ ] Review success rate
- [ ] Check for failed payments
- [ ] Monitor function performance
- [ ] Review customer feedback
- [ ] Optimize if needed

## 🔧 Rollback Plan

If something goes wrong:

### Quick Rollback
```bash
# 1. Restore test version
mv src/services/razorpayService.test.ts.bak src/services/razorpayService.ts

# 2. Update .env
# Change back to: VITE_RAZORPAY_KEY_ID=rzp_test_XXXXX

# 3. Rebuild and deploy
npm run build
# Deploy

# 4. Notify customers
```

### Investigate Issues
```bash
# Check function logs
supabase functions logs create-razorpay-order --limit 100

# Check database
SELECT * FROM razorpay_orders WHERE status = 'failed';

# Check Razorpay dashboard
# Go to Payments → Failed Payments
```

## 📊 Success Metrics

### Key Metrics to Monitor
- **Payment Success Rate:** Target > 95%
- **Order Creation Success:** Target > 99%
- **Function Response Time:** Target < 2 seconds
- **Failed Payments:** Target < 5%

### Dashboard URLs
- Supabase Functions: `https://app.supabase.com/project/[ref]/functions`
- Razorpay Dashboard: `https://dashboard.razorpay.com/`
- Database Stats: `https://app.supabase.com/project/[ref]/editor`

## 🆘 Troubleshooting

### Issue: Edge Function Not Found
**Solution:**
```bash
# Redeploy functions
supabase functions deploy
```

### Issue: 401 Unauthorized
**Solution:**
- Check RAZORPAY_KEY_ID is correct
- Verify key is for correct mode (live/test)
- Regenerate keys if needed

### Issue: Payment Verification Failed
**Solution:**
- Check RAZORPAY_KEY_SECRET is set correctly
- Verify signature algorithm
- Check function logs

### Issue: Order Not Created in Database
**Solution:**
- Check RLS policies on `razorpay_orders` table
- Verify service role key permissions
- Check function logs for errors

## 📞 Support Contacts

### Razorpay Support
- Dashboard: https://dashboard.razorpay.com/
- Email: support@razorpay.com
- Phone: 1800-120-020-020

### Supabase Support
- Dashboard: https://app.supabase.com/
- Discord: https://discord.supabase.com
- Docs: https://supabase.com/docs

## 🎉 Go-Live Announcement

After successful testing:

### Internal Team
- [ ] Notify team of production launch
- [ ] Share monitoring dashboard access
- [ ] Provide support documentation
- [ ] Set up on-call rotation

### Customers
- [ ] Test checkout flow works
- [ ] Verify payment methods available
- [ ] Ensure mobile experience smooth
- [ ] Check email confirmations sent

## 📝 Documentation

### Update Documentation
- [ ] API endpoints documented
- [ ] Error codes listed
- [ ] Monitoring procedures written
- [ ] Rollback steps documented
- [ ] Contact info updated

### Knowledge Base
- [ ] How to process refunds
- [ ] How to check payment status
- [ ] How to handle disputes
- [ ] How to read function logs

## ✅ Final Checklist

Before considering production complete:

- [ ] All test payments successful
- [ ] Monitoring dashboards set up
- [ ] Team trained on new system
- [ ] Rollback plan tested
- [ ] Documentation complete
- [ ] Support contacts available
- [ ] Error alerts configured
- [ ] Backup systems ready

## 🚀 You're Ready for Production!

Congratulations! You've successfully migrated Razorpay from test to production.

**Key Reminders:**
1. Monitor closely for first 24 hours
2. Keep test mode code as backup
3. Document any issues encountered
4. Optimize based on real usage
5. Celebrate successful transactions! 🎉

---

**Need Help?** 
- Check `RAZORPAY_PRODUCTION_MIGRATION.md`
- View `supabase/functions/README.md`
- Review function logs
- Contact Razorpay support if needed

