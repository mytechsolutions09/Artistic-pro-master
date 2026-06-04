# MSG91 OTP Template - Creation Guide

## 📱 How to Create MSG91 OTP Template

### Step 1: Login to MSG91

Visit: https://control.msg91.com/
Login with your credentials

---

### Step 2: Navigate to Templates

1. Click on **"SMS"** in the left sidebar
2. Click on **"Templates"**
3. Click **"Create New Template"** button

---

### Step 3: Template Details

Fill in the following details:

#### **Template Type:**
Select: **Transactional OTP**

#### **Template Name:**
```
OTP Verification
```

#### **Template Message:**

**Option 1 (Simple English):**
```
Your verification code is ##OTP##. Valid for 5 minutes. Do not share with anyone.
```

**Option 2 (With Brand Name):**
```
Your Artistic Pro verification code is ##OTP##. Valid for 5 minutes. Do not share.
```

**Option 3 (Professional):**
```
##OTP## is your verification code for Artistic Pro. Valid for 5 minutes only.
```

**Option 4 (Bilingual - English + Hindi):**
```
Your OTP is ##OTP##. आपका OTP ##OTP## है। Valid for 5 minutes.
```

---

### Step 4: Variable Configuration

MSG91 requires you to define variables:

**Variable Name:** `OTP`  
**Type:** Number  
**Required:** Yes  
**Description:** 6-digit OTP code

---

### Step 5: Sender ID

**For Testing:**
- Use: `MSGIND` (default, works immediately)

**For Production:**
- Create custom sender ID (e.g., `ARTPRO`, `ARTIST`)
- Requires KYC approval (1-2 days)
- 6 characters max
- Only alphabets allowed

---

### Step 6: DLT Template Registration (India Only)

For Indian regulations, you need DLT (Distributed Ledger Technology) registration:

#### **Entity ID:** (Your company's DLT Entity ID)
#### **Template ID:** (Generated after DLT approval)

**Note:** MSG91 will guide you through this process. It takes 1-2 business days.

---

### Step 7: Submit Template

1. Review all details
2. Click **"Submit for Approval"**
3. Wait for approval (usually 1-2 hours, max 24 hours)
4. Once approved, copy the **Template ID**

---

## 📋 Template ID

After approval, you'll get a Template ID like:
```
123456789012345678901234
```

**Save this Template ID** - you'll need it for:
1. Supabase secrets
2. Your .env file

---

## 🎯 Recommended Template (Copy-Paste Ready)

### English Template:
```
Your verification code is ##OTP##. Valid for 5 minutes. Do not share with anyone.
```

### Why This Template?
- ✅ Clear and simple
- ✅ Mentions validity period
- ✅ Security warning
- ✅ Uses ##OTP## variable correctly
- ✅ DLT compliant
- ✅ Under 160 characters (1 SMS credit)

---

## 📐 Template Requirements

### Character Limits:
- **160 characters** = 1 SMS credit
- **161-306 characters** = 2 SMS credits
- **Unicode (Hindi, etc.)** = 70 characters per SMS

### MSG91 Rules:
- Must include `##OTP##` variable
- Cannot include promotional content
- Must be transactional only
- Must mention purpose (verification/authentication)
- Should mention validity period

### DLT Requirements (India):
- Register with DLT portal
- Get Entity ID
- Get Template ID
- Link with MSG91

---

## 🔢 Template Variables

MSG91 automatically replaces these:

| Variable | What it becomes | Example |
|----------|-----------------|---------|
| `##OTP##` | Actual 6-digit OTP | 123456 |
| `##VAR1##` | Custom variable 1 | (optional) |
| `##VAR2##` | Custom variable 2 | (optional) |

For our use case, we only need `##OTP##`

---

## ✅ After Template Creation

Once your template is approved:

### 1. Copy Template ID
```
Template ID: 123456789012345678901234
```

### 2. Set Supabase Secret:
```powershell
npx supabase secrets set MSG91_TEMPLATE_ID=123456789012345678901234
```

### 3. Update .env:
```env
VITE_MSG91_TEMPLATE_ID=123456789012345678901234
```

### 4. Test:
```powershell
npm run dev
```

---

## 🐛 Common Issues

### Template Rejected?

**Reason 1: Missing ##OTP## variable**
- Solution: Add `##OTP##` in the message

**Reason 2: Promotional content**
- Solution: Remove any promotional text
- Keep it purely transactional

**Reason 3: DLT not registered**
- Solution: Complete DLT registration first
- Provide Entity ID and Template ID

**Reason 4: Sender ID not approved**
- Solution: Use `MSGIND` for testing
- Apply for custom sender ID separately

### Template Pending Too Long?

**If pending > 24 hours:**
1. Contact MSG91 support
2. Email: support@msg91.com
3. Phone: +91-9650340007
4. Chat: Available in dashboard

---

## 📞 MSG91 Support

### For Template Issues:
- **Dashboard:** https://control.msg91.com/support
- **Email:** support@msg91.com
- **Phone:** +91-9650340007
- **Working Hours:** 24/7

### Common Questions:
**Q: How long does approval take?**  
A: Usually 1-2 hours, max 24 hours

**Q: Can I have multiple templates?**  
A: Yes! Create different templates for different purposes

**Q: Can I edit approved template?**  
A: No, you must create a new template and get it approved

**Q: Do I need different templates for testing and production?**  
A: No, same template works for both

---

## 🎨 Template Examples for Different Use Cases

### 1. Login OTP:
```
Your login OTP is ##OTP##. Valid for 5 minutes. Artistic Pro
```

### 2. Registration OTP:
```
Welcome to Artistic Pro! Your registration code is ##OTP##. Valid for 5 minutes.
```

### 3. Order Verification:
```
Your order verification code is ##OTP##. Valid for 5 minutes. Do not share.
```

### 4. Password Reset:
```
Your password reset OTP is ##OTP##. Valid for 5 minutes. If you didn't request this, ignore.
```

**Note:** Each template needs separate approval. Start with one general "verification" template.

---

## 📊 Template Best Practices

### Do's:
✅ Keep it under 160 characters  
✅ Mention validity period  
✅ Add security warning  
✅ Use brand name  
✅ Use ##OTP## variable  
✅ Keep it simple and clear  

### Don'ts:
❌ Include promotional content  
❌ Add URLs or links  
❌ Use special characters excessively  
❌ Make it too long (>160 chars)  
❌ Forget the ##OTP## variable  

---

## 🚀 Quick Setup Checklist

After creating template:

- [ ] Template created in MSG91
- [ ] Template submitted for approval
- [ ] Template approved
- [ ] Template ID copied
- [ ] Template ID set in Supabase secrets
- [ ] Template ID added to .env
- [ ] Test OTP sent successfully
- [ ] OTP received on phone
- [ ] OTP verified successfully

---

## 📝 Template ID Usage

Your Template ID will be used in:

### 1. Supabase Edge Function:
```typescript
const msg91TemplateId = Deno.env.get('MSG91_TEMPLATE_ID')
```

### 2. MSG91 API Call:
```
https://control.msg91.com/api/v5/otp?template_id=YOUR_TEMPLATE_ID
```

### 3. Environment Variables:
```env
VITE_MSG91_TEMPLATE_ID=your-template-id
```

---

## 🎯 Next Steps

1. ✅ Create template in MSG91
2. ✅ Wait for approval (1-2 hours)
3. ✅ Copy Template ID
4. ⏳ Set Supabase secret
5. ⏳ Update .env file
6. ⏳ Test phone authentication

---

## 💡 Pro Tips

### Faster Approval:
- Use standard OTP template format
- Avoid special characters
- Complete KYC beforehand
- Use recommended template above

### Multiple Languages:
- Create separate templates for each language
- Use Unicode for Hindi/regional languages
- Remember: Unicode = 70 chars per SMS (costlier)

### Testing:
- Use `MSGIND` sender ID for immediate testing
- No need to wait for custom sender ID approval
- Test template works same way in production

---

## ✨ Ready-to-Use Template

**Copy this exact template for fastest approval:**

```
Your verification code is ##OTP##. Valid for 5 minutes. Do not share with anyone.
```

**Template Settings:**
- Type: Transactional OTP
- Sender ID: MSGIND (for testing)
- Variable: ##OTP##
- Language: English
- Characters: 87 (1 SMS credit)

---

**Good luck with your template creation!** 🚀

Once approved, come back to set the Template ID in secrets!

