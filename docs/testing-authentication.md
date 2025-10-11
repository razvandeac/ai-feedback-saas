# Testing Authentication

Guide for testing authentication in development without real email services.

## Quick Solution: Use a Real Email

**Easiest approach for testing:**

Use a real email address from a valid provider:
- ✅ Gmail: `yourname@gmail.com`
- ✅ Outlook: `yourname@outlook.com`
- ✅ Yahoo: `yourname@yahoo.com`
- ✅ ProtonMail: `yourname@proton.me`

Supabase validates email domains and rejects fake domains like `test@test.com`.

---

## Option 1: Disable Email Confirmation (Development Only)

### Configure Supabase for Testing

1. **Go to Supabase Dashboard:** https://app.supabase.com
2. **Select your project**
3. **Go to Authentication → Providers**
4. **Click on "Email"**
5. **Disable "Confirm email"** toggle

**Settings:**
```
☐ Confirm email
☐ Secure email change
```

**Now you can:**
- Sign up without email verification
- Use any real email domain
- Login immediately after signup
- No need to check email

⚠️ **Only do this in development!** Re-enable for production.

---

## Option 2: Use Email Testing Services

For testing with email verification enabled:

### Mailtrap (Recommended)

1. Sign up at https://mailtrap.io (free tier available)
2. Get SMTP credentials
3. Configure Supabase to use Mailtrap SMTP
4. All verification emails go to Mailtrap inbox

### Ethereal Email (Quick & Free)

1. Visit https://ethereal.email
2. Click "Create Ethereal Account"
3. Get instant test email address
4. Use for signup - verification link appears in their inbox

### Gmail with + Addressing

Use Gmail's plus addressing for multiple test accounts:
```
yourname+test1@gmail.com
yourname+test2@gmail.com
yourname+dev@gmail.com
```

All emails go to `yourname@gmail.com`, but Supabase treats them as different accounts.

---

## Option 3: Supabase Local Development

For full local testing without external services:

### 1. Install Supabase CLI

```bash
brew install supabase/tap/supabase
# or
npm install -g supabase
```

### 2. Initialize Supabase Locally

```bash
cd /Users/razvan/dev/ai-feedback-saas
supabase init
```

### 3. Start Local Supabase

```bash
supabase start
```

This starts:
- Local PostgreSQL database
- Local Auth service (no email validation!)
- Local API gateway
- Studio UI at http://localhost:54323

### 4. Update `.env.local`

```bash
# Local Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

Now you can use ANY email (even `test@test.com`) without validation!

---

## Option 4: Configure Supabase Auth Settings

### Allow Specific Test Domains

Supabase doesn't have a built-in allowlist, but you can:

1. **Use a custom SMTP server** that accepts test domains
2. **Disable email confirmation** for development
3. **Use real email providers** for testing

### Recommended Development Settings

**Supabase Dashboard → Authentication → Settings:**

```
Email Templates:
- ✓ Customize if needed

User Signups:
☑ Enable email confirmations (for production)
☐ Enable email confirmations (for development) ← Disable this

Session:
- Session timeout: 1 week
- Refresh token rotation: Enabled

Security:
- Enable database password hashing: ✓
```

---

## Testing Workflow

### For Development (Quick Testing)

1. **Disable email confirmation** in Supabase
2. Use any valid email format: `dev@gmail.com`, `test@outlook.com`
3. Sign up immediately without verification
4. Test authentication flows

### For Staging (Realistic Testing)

1. **Enable email confirmation**
2. Use Gmail + addressing: `yourname+test@gmail.com`
3. Verify with real email
4. Test complete flow

### For Production

1. **Enable email confirmation** ✓
2. **Enable secure email change** ✓
3. Use real user emails
4. Monitor auth metrics

---

## Common Email Validation Errors

### "Email address is invalid"

**Causes:**
- Using fake domain: `test@test.com`, `user@example.com`
- Typo in email address
- Special characters not allowed

**Solutions:**
- Use a real email provider
- Check for typos
- Try a different email

### "User already exists"

**Cause:** Email already registered

**Solutions:**
- Use a different email
- Or sign in instead of signing up
- Or reset password if you forgot it

### "Email not confirmed"

**Cause:** Email confirmation enabled but not verified

**Solutions:**
- Check your email inbox
- Click verification link
- Or disable email confirmation in Supabase settings

---

## Quick Test Accounts

### Using Gmail

Create multiple test accounts with one Gmail:

```
youremail+app-test@gmail.com
youremail+dev1@gmail.com
youremail+dev2@gmail.com
youremail+staging@gmail.com
```

All go to `youremail@gmail.com` but count as separate accounts!

### Using Temporary Email

For one-time testing:
- https://temp-mail.org
- https://10minutemail.com
- https://guerrillamail.com

Get a temporary email, use for signup, receive verification email.

---

## Supabase Email Configuration

### Custom SMTP (Advanced)

If you need full control over emails:

1. **Go to Supabase Dashboard → Project Settings → Auth**
2. **Click "SMTP Settings"**
3. **Enable Custom SMTP**
4. **Add your SMTP credentials:**
   - Host: smtp.mailtrap.io (or your SMTP)
   - Port: 2525
   - Username: your-username
   - Password: your-password

Now all auth emails go through your SMTP.

---

## Development Best Practices

### Quick Start (No Email Hassle)

```
1. Disable email confirmation in Supabase
2. Use yourname@gmail.com for testing
3. Sign up - works immediately
4. Test features
```

### Full Flow Testing

```
1. Enable email confirmation
2. Use real email (Gmail + addressing)
3. Sign up
4. Check email
5. Click verification link
6. Test complete flow
```

---

## TL;DR - Quick Fix

**For immediate testing:**

1. Go to **Supabase Dashboard → Authentication → Providers → Email**
2. **Disable** "Confirm email" toggle
3. Use any email with a real domain: `dev@gmail.com`
4. Sign up - works immediately without verification!

**Or:**

Just use your real Gmail/Outlook email address for testing. ✅

---

## Need Help?

If you're still having issues:
1. Check Supabase auth logs: Dashboard → Authentication → Logs
2. Verify SMTP settings if using custom
3. Try a different email provider
4. Disable email confirmation for development

---

**Recommended for now:** Use your real email address (like `yourname@gmail.com`) for testing. It's the simplest solution! 📧

