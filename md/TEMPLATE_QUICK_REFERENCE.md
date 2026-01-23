# 📱 MSG91 Template - Quick Reference Card

## 🎯 Template Message (Copy This)

```
Your verification code is ##OTP##. Valid for 5 minutes. Do not share with anyone.
```

---

## ⚙️ Settings

| Field | Value |
|-------|-------|
| **Template Name** | OTP Verification |
| **Type** | Transactional OTP |
| **Sender ID** | MSGIND |
| **Variable** | ##OTP## (Number) |
| **Characters** | 87 (1 SMS credit) |

---

## 🚀 Quick Steps

1. Login: https://control.msg91.com/
2. SMS → Templates → Create New
3. Paste message above
4. Submit → Wait 1-2 hours
5. Copy Template ID

---

## ✅ After Approval

```powershell
# Set in Supabase
npx supabase secrets set MSG91_TEMPLATE_ID=your-template-id-here
```

```env
# Add to .env
VITE_MSG91_TEMPLATE_ID=your-template-id-here
```

---

## 📋 Full Guides Available

- **`CREATE_MSG91_TEMPLATE.md`** - Step-by-step with screenshots guide
- **`MSG91_TEMPLATE_GUIDE.md`** - Comprehensive guide with examples
- **`MSG91_TEMPLATE_QUICK_COPY.txt`** - Plain text copy-paste format

---

## 💬 Example SMS Output

```
Your verification code is 123456. Valid for 5 minutes. Do not share with anyone.
```

---

**That's it! Simple!** 🎉

