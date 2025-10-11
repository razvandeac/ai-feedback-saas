# ⚠️ CRITICAL: You MUST Set Root Directory in Vercel Dashboard

## The Error You're Seeing

```
Error: No Next.js version detected. Make sure your package.json has "next" 
in either "dependencies" or "devDependencies". Also check your Root Directory 
setting matches the directory of your package.json file.
```

## Why This Happens

**Vercel is looking in the wrong place!**

Your project structure:
```
ai-feedback-saas/           ← Vercel is looking HERE
├── package.json            ← No "next" dependency ❌
└── apps/
    └── web/
        └── package.json    ← "next" is HERE ✓
```

## The Solution (REQUIRED!)

**You MUST manually set the Root Directory in Vercel Dashboard.**

This **CANNOT** be done via config files. It's a project-level setting.

---

## 🔴 Step-by-Step Instructions (DO THIS NOW!)

### 1. Open Vercel Dashboard

Go to: **https://vercel.com/dashboard**

### 2. Select Your Project

Click on the project name (e.g., "ai-feedback-saas")

### 3. Go to Settings

- Click the **"Settings"** tab at the top of the page
- Click **"General"** in the left sidebar

### 4. Scroll to "Root Directory"

You'll see a section labeled **"Root Directory"**

### 5. Click "Edit"

There will be an **"Edit"** button next to "Root Directory"

### 6. Enter "apps/web"

In the text field that appears, type:
```
apps/web
```

**Important:** 
- No leading slash: ❌ `/apps/web` 
- No trailing slash: ❌ `apps/web/`
- Just: ✅ `apps/web`

### 7. ✅ CHECK THE BOX (CRITICAL!)

Below the text field, there's a checkbox:

```
☐ Include source files outside of the Root Directory in the Build Step
```

**YOU MUST CHECK THIS BOX!** ✅

This allows Vercel to access workspace packages in `packages/` directory.

### 8. Click "Save"

Click the **"Save"** button to apply the changes.

### 9. Verify It Worked

After saving, you should see:
```
Root Directory: apps/web
✓ Including source files outside root directory
```

### 10. Redeploy

- Go to the **"Deployments"** tab
- Find your latest (failed) deployment
- Click the three dots **⋯** on the right
- Click **"Redeploy"**
- Wait for the build to complete

---

## ✅ Expected Result

After setting Root Directory and redeploying:

**Build log should show:**
```
✓ Detected Next.js version: 15.0.2
✓ Detected Package Manager: pnpm
✓ Installing dependencies...
✓ Building @pulseai/shared
✓ Building @pulseai/worker
✓ Building @pulseai/web
✓ Deployment successful
```

**Instead of:**
```
❌ Error: No Next.js version detected
```

---

## 🎯 Why Config Files Aren't Enough

**vercel.json CAN configure:**
- ✅ Build commands
- ✅ Framework settings
- ✅ Output directory

**vercel.json CANNOT configure:**
- ❌ Root Directory
- ❌ Include source files setting

**These must be set in the Vercel Dashboard UI!**

---

## 📸 Visual Guide

### Finding Root Directory Setting

1. Dashboard → Select Project
2. Settings Tab
3. General (left sidebar)
4. Scroll down to "Root Directory"
5. Click "Edit"
6. Enter `apps/web`
7. ✅ Check the "Include source files" box
8. Save

---

## ❓ FAQ

### Q: I created vercel.json but still get the error
**A:** You must ALSO set Root Directory in the dashboard. Config files alone won't work.

### Q: Where exactly is the Root Directory setting?
**A:** Vercel Dashboard → Your Project → Settings → General → Scroll down to "Root Directory"

### Q: What if I don't see "Root Directory" option?
**A:** You might be in the wrong section. Make sure you're in Settings → General, not Settings → Git or other tabs.

### Q: Can I set this via Vercel CLI?
**A:** Yes! Alternative method:
```bash
cd apps/web
vercel --prod
# CLI will detect it's a Next.js app from this directory
```

### Q: I set it but build still fails
**A:** Make sure you:
- Clicked "Save" after editing
- Checked the "Include source files" checkbox
- Redeployed (not just triggered a new commit)

---

## 🆘 Still Not Working?

If you've set Root Directory and still see the error:

1. **Double-check the setting:**
   - Settings → General → Root Directory
   - Should show: `apps/web`
   - Checkbox should be checked ✅

2. **Redeploy properly:**
   - Deployments tab
   - Click ⋯ on failed deployment
   - Click "Redeploy" (not just pushing new code)

3. **Check build logs:**
   - Look for "Root Directory: apps/web" in logs
   - If not mentioned, setting didn't apply

4. **Try Vercel CLI:**
   ```bash
   cd apps/web
   vercel --prod
   ```

---

## ⚡ TL;DR

**YOU MUST DO THIS IN VERCEL DASHBOARD:**

1. Settings → General → Root Directory
2. Click "Edit"  
3. Enter: `apps/web`
4. ✅ Check: "Include source files outside Root Directory"
5. Click "Save"
6. Redeploy

**This is NOT optional. Config files cannot do this for you.**

After doing this, your build will succeed! 🚀

