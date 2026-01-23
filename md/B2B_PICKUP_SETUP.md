# B2B Pickup Request Setup Guide

## 🔍 Issue Identified

Based on the [Delhivery B2B Pickup Request documentation](https://one.delhivery.com/developer-portal/document/b2b/detail/pickup-request), **B2B pickup requests require a `client_name` parameter** that was missing from our implementation.

## ✅ Solution Applied

The code has been updated to support B2B pickup requests by adding the `client_name` parameter.

---

## 📋 Required Configuration

### Step 1: Get Your Client Name

The `client_name` should match your **registered client name with Delhivery**. To obtain this:

1. **Contact your Delhivery Business Development (BD) or Customer Service (CS) manager**
   - They will provide your client account information including:
     - Client Name (`client_name`)
     - User Name
     - Client ID
     - API Token

2. **Or check your Delhivery dashboard:**
   - Log in to: https://one.delhivery.com
   - Navigate to: **Account Settings** or **Profile**
   - Look for: **Client Name** or **Account Name**

### Step 2: Configure Client Name

Add the client name to your `.env` file:

```env
# Delhivery Client Name (Required for B2B pickup requests)
VITE_DELHIVERY_CLIENT_NAME=YourCompanyName
```

**Example:**
```env
VITE_DELHIVERY_CLIENT_NAME=Lurevi
```

### Step 3: Restart Development Server

After updating `.env`:
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

---

## 🔧 How It Works

### B2C Format (Default - if client_name not set)
```json
{
  "pickup_time": "10:00:00",
  "pickup_date": "2025-01-XX",
  "warehouse_name": "Lurevi - Janak puri",
  "quantity": 1
}
```

### B2B Format (When client_name is configured)
```json
{
  "pickup_time": "10:00:00",
  "pickup_date": "2025-01-XX",
  "warehouse_name": "Lurevi - Janak puri",
  "quantity": 1,
  "client_name": "YourCompanyName"
}
```

---

## 🧪 Testing

After configuring `client_name`:

1. **Check browser console** - You should see:
   ```
   📋 B2B Pickup Request: client_name="YourCompanyName"
   ```

2. **Try pickup request again** - The 401 error might be resolved if:
   - Your account requires B2B format
   - The missing `client_name` was causing authentication issues

---

## ⚠️ Important Notes

1. **Client Name Must Match Exactly**
   - The `client_name` must match what's registered with Delhivery
   - Case-sensitive
   - Contact Delhivery support if unsure

2. **B2B vs B2C**
   - **B2C**: Consumer-to-consumer pickups (small parcels)
   - **B2B**: Business-to-business pickups (larger volumes)
   - Your Delhivery account type determines which format you need

3. **If Still Getting 401 Error**
   - Verify `client_name` matches Delhivery records exactly
   - Check that your API token has pickup permissions
   - Contact Delhivery support with:
     - Your API token (mention it works for waybills)
     - Your client name
     - Warehouse name: "Lurevi - Janak puri"
     - Error: 401 Unauthorized on `/fm/request/new/`

---

## 📞 Getting Help

If you're unsure about your client name:

1. **Email Delhivery Support**: support@delhivery.com
2. **Subject**: "Request Client Name for B2B Pickup API"
3. **Include**:
   - Your account email
   - Your account name
   - Request: "Please provide my registered client name for B2B pickup API requests"

---

## 🔗 References

- [Delhivery B2B Pickup Request Documentation](https://one.delhivery.com/developer-portal/document/b2b/detail/pickup-request)
- [Delhivery Developer Portal](https://one.delhivery.com/developer-portal)
- [Delhivery API FAQ](https://delhivery-express-api-doc.readme.io/reference/frequently-asked-questions)

---

## ✅ Next Steps

1. ✅ Code updated to support `client_name` parameter
2. ⏳ **You need to**: Get your client name from Delhivery
3. ⏳ **You need to**: Add `VITE_DELHIVERY_CLIENT_NAME` to `.env` file
4. ⏳ **You need to**: Restart development server
5. ⏳ **You need to**: Test pickup request again

The 401 error might be resolved once `client_name` is properly configured!
