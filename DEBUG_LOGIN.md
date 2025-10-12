# Debug Login Issues

Login is not redirecting? Follow these steps to diagnose the problem.

## Step 1: Check Browser Console

Open browser DevTools (F12 or Cmd+Option+I) and go to the **Console** tab.

### What to Look For:

**After clicking "Sign In", you should see:**
```
✅ Login successful, session created: your-email@gmail.com
```

**If you see this:**
- ✅ Login worked, session created
- Problem is with the redirect itself

**If you DON'T see this:**
- ❌ Login failed or didn't complete
- Check for error messages

### Common Console Errors:

**"Missing environment variable: NEXT_PUBLIC_SUPABASE_URL"**
- Fix: Create `apps/web/.env.local` with your Supabase credentials

**"Invalid login credentials"**
- Wrong email/password
- Or account doesn't exist yet

**"Email address is invalid"**
- Use a real email provider (Gmail, Outlook, not test@test.com)

---

## Step 2: Check Network Tab

Open DevTools → **Network** tab

### Watch for Auth Requests:

1. Click "Sign In"
2. Look for request to: `https://yourproject.supabase.co/auth/v1/token?grant_type=password`

**If Status is 200:**
- ✅ Authentication succeeded
- Check response body for `access_token` and `refresh_token`

**If Status is 400:**
- ❌ Invalid credentials
- Check error message in response

**If Status is 422:**
- ❌ Email validation failed
- Use a real email address

**If No Request:**
- JavaScript error preventing form submission
- Check console for errors

---

## Step 3: Check Environment Variables

Visit: `http://localhost:3000/api/_debug-env`

Should show:
```json
{
  "NEXT_PUBLIC_SUPABASE_URL": "https://yourproject.supabase.co",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY": "eyJ...",
  "NEXT_PUBLIC_APP_URL": "http://localhost:3000",
  "OPENAI_SET": true,
  "NODE_ENV": "development"
}
```

**If you see `null` values:**
- Environment variables not loaded
- Create `apps/web/.env.local` with your credentials

---

## Step 4: Check localStorage

In browser console, run:
```javascript
localStorage.getItem('pulseai-auth-token')
```

**After login, should show:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "...",
  "expires_at": 1234567890
}
```

**If null:**
- Session not being saved
- Check if localStorage is enabled in your browser

---

## Step 5: Test Manually in Console

Open browser console and try:

```javascript
// Import Supabase (if you have it global)
// Or just test the redirect
window.location.href = '/dashboard';
```

**If this works:**
- Redirect mechanism is fine
- Issue is with the login flow logic

**If this doesn't work:**
- Browser issue or JavaScript disabled

---

## Step 6: Check Supabase Configuration

### In Supabase Dashboard:

1. **Authentication → Providers**
   - ✅ Email provider should be enabled

2. **Authentication → URL Configuration**
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/**`

3. **Authentication → Providers → Email**
   - For testing, try disabling "Confirm email"

---

## Step 7: Clear Everything and Retry

```bash
# Stop dev server
# Clear browser localStorage
localStorage.clear();

# Clear Next.js cache
cd apps/web
rm -rf .next

# Restart dev server
cd ../..
pnpm dev
```

Then try logging in again.

---

## Common Fixes

### Fix 1: Environment Variables Not Set

```bash
cd apps/web
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-your-key
EOF

# Restart dev server
cd ../..
pnpm dev
```

### Fix 2: Email Domain Invalid

Don't use: `test@test.com`

Use instead:
- Your real Gmail: `yourname@gmail.com`
- Or disable email confirmation in Supabase

### Fix 3: CORS Issues

Check Supabase Dashboard → Authentication → URL Configuration:
- Site URL should include your domain
- Redirect URLs should allow `http://localhost:3000/**`

---

## Expected Behavior

### Successful Login Flow:

1. Enter email/password → click "Sign In"
2. **Console shows:** `✅ Login successful, session created: your@email.com`
3. **Console shows:** `🔔 Auth state change: SIGNED_IN Session exists`
4. **Console shows:** `✅ SIGNED_IN detected, redirecting to dashboard`
5. **Browser redirects** to `/dashboard`
6. Dashboard loads and shows your email

### If Stuck on Login Page:

**Check console for:**
- Any error messages
- Whether `✅ Login successful` appears
- Any JavaScript errors

**Most likely causes:**
1. Environment variables not set
2. Invalid email domain
3. Supabase URL configuration issue

---

## Quick Test

Open browser console and paste this:

```javascript
// Test environment
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

// Test redirect
setTimeout(() => {
  window.location.href = '/dashboard';
}, 2000);
```

If redirect works after 2 seconds, the issue is with the login logic, not the redirect.

---

## Still Not Working?

1. **Share console output** - Copy all console messages after clicking "Sign In"
2. **Share network request** - Copy the auth request/response
3. **Share environment** - Visit `/api/_debug-env` and copy the output

This will help identify the exact issue!

---

## Quick Workaround

If you need to test other features while debugging login:

```javascript
// In browser console after "successful" login
localStorage.setItem('pulseai-auth-token', JSON.stringify({
  access_token: "your-token-from-network-tab",
  refresh_token: "your-refresh-token",
  expires_at: Date.now() / 1000 + 3600
}));

// Then manually go to dashboard
window.location.href = '/dashboard';
```

This manually sets the session for testing.

