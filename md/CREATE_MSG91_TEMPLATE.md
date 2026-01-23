# 📱 Create MSG91 OTP Template - Step by Step

## 🎯 Copy This Template (Ready to Use!)

```
Your verification code is ##OTP##. Valid for 5 minutes. Do not share with anyone.
```

---

## 📋 Step-by-Step Instructions

### Step 1️⃣: Login to MSG91
```
🌐 Visit: https://control.msg91.com/
📧 Login with your email & password
```

---

### Step 2️⃣: Go to Templates
```
1. Click "SMS" in left sidebar
2. Click "Templates"
3. Click "Create New Template" button
```

---

### Step 3️⃣: Fill Template Form

#### **Template Name:**
```
OTP Verification
```

#### **Template Type:**
```
Select: Transactional OTP
```

#### **Message:**
```
Your verification code is ##OTP##. Valid for 5 minutes. Do not share with anyone.
```

#### **Variable Configuration:**
```
Variable Name: OTP
Type: Number
Required: Yes
```

#### **Sender ID:**
```
MSGIND
```
(Use this for testing - works immediately!)

---

### Step 4️⃣: Submit
```
1. Review all details
2. Click "Submit for Approval"
3. Wait for approval (1-2 hours)
```

---

### Step 5️⃣: Get Template ID

After approval, you'll see:
```
✅ Template Approved
Template ID: 123456789012345678901234
```

**Copy this Template ID!** You'll need it next.

---

## 🚀 After Getting Template ID

### Set in Supabase:
```powershell
npx supabase secrets set MSG91_TEMPLATE_ID=123456789012345678901234
```

### Add to .env:
```env
VITE_MSG91_TEMPLATE_ID=123456789012345678901234
```

---

## ✅ Checklist

- [ ] Logged into MSG91
- [ ] Created template with message above
- [ ] Added ##OTP## variable
- [ ] Set sender ID to MSGIND
- [ ] Submitted for approval
- [ ] Template approved
- [ ] Template ID copied
- [ ] Set in Supabase secrets
- [ ] Added to .env file

---

## 🎨 Template Preview

When user receives SMS:
```
Your verification code is 123456. Valid for 5 minutes. Do not share with anyone.
```

The `##OTP##` gets replaced with actual 6-digit code!

---

## 🐛 Common Issues

### "Template Rejected"
**Problem:** Missing ##OTP## variable  
**Solution:** Make sure message includes `##OTP##`

### "DLT Required"
**Problem:** Indian regulations require DLT  
**Solution:** MSG91 will guide you through DLT registration

### "Sender ID Not Found"
**Problem:** Wrong sender ID  
**Solution:** Use `MSGIND` for testing

---

## 📞 Need Help?

**MSG91 Support:**
- 📧 Email: support@msg91.com
- 📱 Phone: +91-9650340007
- 💬 Chat: Available in dashboard

**Common Questions:**
- Approval time: 1-2 hours
- Can use same template for testing and production
- No charge for template creation

---

## 📝 Important Notes

1. **##OTP## is required** - This is where the actual OTP code will appear
2. **Keep under 160 characters** - Saves SMS cost (1 credit instead of 2)
3. **Use MSGIND for testing** - Works immediately, no approval needed
4. **DLT for production** - Required for India, MSG91 helps with this
5. **Save Template ID** - You'll need it for Supabase and .env

---

## 🎯 Next Steps After Template Creation

1. ✅ Template created and approved
2. ⏳ Set Template ID in Supabase secrets
3. ⏳ Update .env file
4. ⏳ Test phone authentication
5. ⏳ Send your first OTP!

---

## 💡 Pro Tip

Create the template NOW while waiting for other approvals. Template approval usually takes 1-2 hours, so start it early!

---

**Ready?** 

👉 Open: https://control.msg91.com/  
📝 Copy template from above  
🚀 Submit and wait for approval!

**Good luck!** 🎉

