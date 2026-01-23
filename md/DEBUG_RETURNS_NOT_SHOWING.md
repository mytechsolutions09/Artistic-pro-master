# Debug: Returns Not Showing in User Dashboard

## 🚨 **Issue:**
Return requests are not showing in the user dashboard returns section.

## 🔍 **Potential Causes:**

### **1. Email Mismatch**
- **Problem**: `requested_by` field in database doesn't match `user?.email`
- **Cause**: ReturnRequestForm was using `localStorage.getItem('userEmail')` instead of auth context
- **Fix**: ✅ Updated ReturnRequestForm to use `user?.email` from auth context

### **2. Database Table Issues**
- **Problem**: `return_requests` table doesn't exist or has RLS issues
- **Solution**: Run the RLS fix script first

### **3. Authentication Issues**
- **Problem**: User not properly authenticated
- **Check**: Verify user is logged in

## 🔧 **Debugging Steps:**

### **Step 1: Check Console Logs**
After creating a return request, check browser console for:
```
Loading returns for customer: user@example.com
Querying returns for email: user@example.com
Database returned: [array of returns]
Found return requests: [array of returns]
```

### **Step 2: Verify Database**
1. Go to Supabase Dashboard → Table Editor
2. Check `return_requests` table
3. Verify there are records with your email in `requested_by` column

### **Step 3: Test Email Matching**
1. Check what email is being used when creating return request
2. Check what email is being used when querying returns
3. Ensure they match exactly

## 🛠️ **Fixes Applied:**

### **1. Fixed Email Source**
```typescript
// Before: Using localStorage
const customerEmail = localStorage.getItem('userEmail') || 'guest@example.com';

// After: Using auth context
const customerEmail = user?.email || 'guest@example.com';
```

### **2. Added Debug Logging**
- ✅ Added console logs in ReturnRequestsList
- ✅ Added console logs in ReturnService
- ✅ Shows email being queried and results returned

## 🧪 **Testing Instructions:**

### **Test 1: Create Return Request**
1. Go to User Dashboard → Orders
2. Find completed order (non-digital)
3. Click "Return" button
4. Fill form and submit
5. Check console logs

### **Test 2: Check Returns Tab**
1. After creating return request
2. Go to User Dashboard → Returns tab
3. Check console logs for:
   - Loading returns for customer: [email]
   - Querying returns for email: [email]
   - Database returned: [data]

### **Test 3: Verify Database**
1. Go to Supabase Dashboard
2. Check return_requests table
3. Verify record exists with correct email

## 📋 **Common Issues & Solutions:**

### **Issue 1: Empty Array Returned**
```
Database returned: []
```
**Solution**: Check if email in database matches email being queried

### **Issue 2: RLS Error**
```
Error fetching customer returns: [RLS error]
```
**Solution**: Run the RLS fix script:
```sql
ALTER TABLE public.return_requests DISABLE ROW LEVEL SECURITY;
```

### **Issue 3: Table Not Found**
```
Error: Could not find the table 'public.return_requests'
```
**Solution**: Run the table creation script first

### **Issue 4: Email Mismatch**
- Database has: `user@example.com`
- Querying with: `User@Example.com`
**Solution**: Ensure exact case matching

## 🔍 **Debug Checklist:**

- [ ] User is authenticated
- [ ] Return request was created successfully
- [ ] Email in database matches email in query
- [ ] RLS policies are correct (or disabled)
- [ ] Console shows debug logs
- [ ] Database table exists and has data

## 🚀 **Quick Fix:**

If still not working, run this SQL to temporarily disable RLS:
```sql
ALTER TABLE public.return_requests DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.return_requests TO authenticated;
```

Then test again and check console logs for the debugging information.
