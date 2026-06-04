# Supabase CLI Commands (Using npx)

Since Supabase CLI is not installed globally, use `npx supabase@latest` instead of `supabase`.

## ✅ All Commands Use `npx supabase@latest`

### Deploy Edge Function
```powershell
npx supabase@latest functions deploy delhivery-api --no-verify-jwt
```

### Set Secrets
```powershell
npx supabase@latest secrets set DELHIVERY_API_TOKEN=your-token-here
```

### List Functions
```powershell
npx supabase@latest functions list
```

### View Logs
```powershell
npx supabase@latest functions logs delhivery-api --tail
```

### List Secrets
```powershell
npx supabase@latest secrets list
```

### Link Project (if needed)
```powershell
npx supabase@latest link --project-ref varduayfdqivaofymfov
```

### Login (if needed)
```powershell
npx supabase@latest login
```

## 🎯 Quick Reference

**Instead of:** `supabase functions deploy delhivery-api`  
**Use:** `npx supabase@latest functions deploy delhivery-api --no-verify-jwt`

**Instead of:** `supabase secrets set DELHIVERY_API_TOKEN=token`  
**Use:** `npx supabase@latest secrets set DELHIVERY_API_TOKEN=token`

## ✅ Already Done

- ✅ Edge Function deployed using `npx supabase@latest functions deploy delhivery-api --no-verify-jwt`
- ⚠️ **Next:** Set your Delhivery API token using the command above
