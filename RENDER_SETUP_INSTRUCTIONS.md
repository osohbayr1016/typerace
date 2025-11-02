# 🚨 IMMEDIATE FIX: Set FRONTEND_URL in Render Dashboard

## Your Current Issue

Render logs show:
```
❌ Origin not allowed: https://typerace-gamma.vercel.app
Allowed origins: ['http://localhost:3000']
```

This means `FRONTEND_URL` is NOT set correctly in Render dashboard!

---

## ✅ IMMEDIATE FIX (Do This Now!)

### Step 1: Open Render Dashboard
1. Go to https://dashboard.render.com
2. Log in
3. Click on your backend service: **`typerace-9p8k`** (or your service name)

### Step 2: Go to Environment Tab
1. Click **"Environment"** in the left sidebar
2. You should see all environment variables

### Step 3: Find and Update FRONTEND_URL

**If FRONTEND_URL doesn't exist:**
1. Click **"Add Environment Variable"**
2. Key: `FRONTEND_URL`
3. Value: `https://typerace-gamma.vercel.app`
4. Click **"Save Changes"**

**If FRONTEND_URL exists but has wrong value:**
1. Click on `FRONTEND_URL` to edit
2. Change value to: `https://typerace-gamma.vercel.app`
3. Click **"Save Changes"**

### Step 4: Wait for Redeploy
- Render will automatically redeploy
- Wait 1-2 minutes for deployment to complete
- Go to "Logs" tab to watch progress

### Step 5: Verify

In the logs, you should now see:
```
🔍 Environment check:
   FRONTEND_URL: https://typerace-gamma.vercel.app

🌐 CORS allowed origins: [
  'https://typerace-gamma.vercel.app',
  'https://typerace-gamma.vercel.app',
  'https://typerace-gamma.vercel.app/'
]
```

And when you access the site:
```
✅ Origin allowed: https://typerace-gamma.vercel.app
```

---

## 📸 What It Should Look Like

In Render Environment tab, you should have:

```
Key                 | Value
--------------------|--------------------------------------------------
NODE_ENV            | production
MONGODB_URI         | mongodb+srv://...
JWT_SECRET          | <your-secret>
FRONTEND_URL        | https://typerace-gamma.vercel.app  ✅ THIS ONE!
```

---

## ⚠️ Common Mistakes

### ❌ Don't Do This:
- `FRONTEND_URL=http://localhost:3000` (wrong!)
- `FRONTEND_URL=https://typerace-gamma.vercel.app/` (trailing slash!)
- `FRONTEND_URL=typerace-gamma.vercel.app` (no https!)
- Forgetting to click "Save Changes"

### ✅ Do This:
- `FRONTEND_URL=https://typerace-gamma.vercel.app` (correct!)

---

## 🧪 Test It

After redeploying, test your app:

1. Go to https://typerace-gamma.vercel.app
2. Open browser DevTools (F12)
3. Try to login
4. Should work with **no CORS errors**! ✅

---

## 🆘 Still Not Working?

If it's still not working:

1. **Double-check** the exact URL in Vercel
   - Go to Vercel dashboard
   - Copy the EXACT deployment URL
   - Make sure it matches exactly in Render

2. **Check logs** after redeploy
   - Go to Render logs
   - Look for "CORS allowed origins"
   - Should include your frontend URL

3. **Verify** you clicked "Save Changes"
   - Environment variables only apply after saving
   - Check if Render is redeploying

---

## ✅ Success Checklist

- [ ] Opened Render dashboard
- [ ] Found Environment tab
- [ ] Found/created FRONTEND_URL variable
- [ ] Set value to: `https://typerace-gamma.vercel.app`
- [ ] Clicked "Save Changes"
- [ ] Render redeployed
- [ ] Logs show correct CORS origins
- [ ] Tested frontend - no CORS errors
- [ ] Everything works! 🎉

---

## 📞 Quick Reference

- **Your Backend:** `https://typerace-9p8k.onrender.com`
- **Your Frontend:** `https://typerace-gamma.vercel.app`
- **FRONTEND_URL to set:** `https://typerace-gamma.vercel.app`

**That's it! Just set this one environment variable and you're done!** 🚀

