# MSG91 DLT Compliance Guide

## 🚨 Template Rejected? DLT Registration Required!

Your MSG91 template was rejected because **DLT (Distributed Ledger Technology) registration is missing**. This is mandatory for all Indian SMS providers due to TRAI regulations.

---

## 📋 What is DLT?

**DLT (Distributed Ledger Technology)** is a TRAI-mandated system for:
- ✅ Verifying sender identities
- ✅ Preventing spam messages
- ✅ Ensuring message authenticity
- ✅ Compliance with Indian telecom regulations

---

## 🔧 Quick Fix Steps

### 1. **Create DLT-Compliant Template**

Use this **DLT-approved template**:

```
Your Lurevi verification code is ##OTP##. Valid for 5 minutes. Do not share with anyone. - Lurevi Team
```

**Key DLT Requirements:**
- ✅ Must include your **brand name** (Lurevi)
- ✅ Must include **sender identification**
- ✅ Must have **clear purpose** (verification)
- ✅ Must include **security warning**

### 2. **Alternative Templates (Choose One)**

**Option A - Simple:**
```
Your Lurevi OTP is ##OTP##. Valid for 5 minutes. Do not share. - Lurevi
```

**Option B - Detailed:**
```
Lurevi verification code: ##OTP##. Valid for 5 minutes. Never share this code. - Lurevi Team
```

**Option C - Professional:**
```
Your Lurevi account verification code is ##OTP##. Valid for 5 minutes. Keep it secure. - Lurevi
```

---

## 🏢 DLT Registration Process

### Step 1: Register Your Entity
1. Go to [TRAI DLT Portal](https://www.dltconnect.gov.in/)
2. Register your business entity
3. Submit required documents:
   - Business registration
   - PAN card
   - Address proof
   - Authorized person details

### Step 2: Register Your Sender ID
1. In DLT portal, register sender ID: **LUREVI**
2. Provide business details
3. Submit verification documents

### Step 3: Create Template
1. In DLT portal, create template category: **Transactional**
2. Submit template for approval
3. Wait for TRAI approval (usually 24-48 hours)

### Step 4: Link with MSG91
1. In MSG91 dashboard, go to **DLT Management**
2. Link your DLT registration
3. Upload approved template
4. Test the template

---

## 🔄 MSG91 DLT Integration

### Update Your MSG91 Template

1. **Login to MSG91 Dashboard**
2. **Go to Templates → DLT Templates**
3. **Create New Template:**

```
Template Name: Lurevi_OTP_Verification
Category: Transactional
Content: Your Lurevi verification code is ##OTP##. Valid for 5 minutes. Do not share with anyone. - Lurevi Team
```

4. **Submit for DLT Approval**
5. **Wait for approval** (24-48 hours)

---

## ⚡ Quick Test Without DLT

If you need **immediate testing**, use MSG91's **test mode**:

1. **Enable Test Mode** in MSG91 dashboard
2. **Use test template** (no DLT required)
3. **Test your integration**
4. **Disable test mode** after DLT approval

---

## 🔧 Update Your Code

### Environment Variables
```env
# MSG91 SMS CONFIGURATION
VITE_MSG91_AUTH_KEY=your-msg91-auth-key
VITE_MSG91_SENDER_ID=LUREVI
VITE_MSG91_TEMPLATE_ID=your-new-dlt-template-id
```

### Edge Function Update
```typescript
// Update template ID in send-otp-msg91 function
const templateId = process.env.MSG91_TEMPLATE_ID;
```

---

## 📞 MSG91 Support

**Contact MSG91 Support:**
- **Email:** support@msg91.com
- **Phone:** +91-120-4567890
- **Live Chat:** Available in dashboard
- **Documentation:** [MSG91 DLT Guide](https://docs.msg91.com/dlt-compliance)

**Ask them for:**
- ✅ DLT registration assistance
- ✅ Template approval help
- ✅ Sender ID verification
- ✅ Test mode activation

---

## 🚀 Alternative: Use Test Mode

**For immediate testing:**

1. **Enable Test Mode** in MSG91
2. **Use any template** (DLT not required)
3. **Test your phone auth**
4. **Switch to production** after DLT approval

---

## 📋 Checklist

- [ ] Register entity in TRAI DLT portal
- [ ] Register sender ID (LUVERI)
- [ ] Create DLT-compliant template
- [ ] Submit template for approval
- [ ] Link DLT with MSG91
- [ ] Update template ID in code
- [ ] Test the integration
- [ ] Go live after approval

---

## ⏱️ Timeline

- **DLT Registration:** 1-2 business days
- **Template Approval:** 24-48 hours
- **MSG91 Integration:** 1 hour
- **Testing:** 30 minutes

**Total Time:** 2-3 business days

---

## 🆘 Need Help?

1. **Check MSG91 documentation**
2. **Contact MSG91 support**
3. **Use test mode for immediate testing**
4. **Follow this guide step by step**

---

**The template rejection is normal - DLT compliance is mandatory for Indian SMS providers!** 🚀
