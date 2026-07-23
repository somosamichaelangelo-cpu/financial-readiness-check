# 🚀 Deploy to Vercel - Step by Step Guide

## ✅ Prerequisites Completed

Your app is ready for deployment! All checks passed:
- ✅ No hardcoded secrets
- ✅ Environment variables properly configured
- ✅ All API calls use relative paths
- ✅ CORS configured correctly
- ✅ Next.js production-ready

## 📋 What You'll Need

1. **GitHub Account** (free) - to store your code
2. **Vercel Account** (free) - to host your app
3. **5 minutes** of your time

---

## Step 1: Create a GitHub Repository

### Option A: Via GitHub Website (Easiest)

1. Go to https://github.com/new
2. **Repository name**: `financial-readiness-check` (or any name you prefer)
3. **Visibility**: Choose "Private" (recommended) or "Public"
4. **Do NOT** initialize with README, .gitignore, or license
5. Click **"Create repository"**
6. **Keep this page open** - you'll need the commands shown

### Option B: Via GitHub CLI (if you have it installed)

```bash
gh repo create financial-readiness-check --private
```

---

## Step 2: Push Your Code to GitHub

### 2.1 Initialize Git (if not already done)

Run these commands in your terminal:

```bash
cd /app
git init
git add .
git commit -m "Initial commit - Financial Readiness Check app"
```

### 2.2 Connect to GitHub

Replace `YOUR-USERNAME` with your actual GitHub username:

```bash
git remote add origin https://github.com/YOUR-USERNAME/financial-readiness-check.git
git branch -M main
git push -u origin main
```

**If prompted for credentials:**
- Username: Your GitHub username
- Password: Use a **Personal Access Token** (not your password)
  - Create token at: https://github.com/settings/tokens
  - Select: `repo` scope
  - Copy and use as password

---

## Step 3: Deploy to Vercel

### 3.1 Sign Up for Vercel

1. Go to https://vercel.com/signup
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub account
4. Complete the signup process

### 3.2 Import Your Repository

1. On Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find your `financial-readiness-check` repository
3. Click **"Import"**

### 3.3 Configure Your Project

**Framework Preset**: Should auto-detect as **Next.js**

**Root Directory**: Leave as `./` (root)

**Build Settings**: Leave defaults
- Build Command: `next build`
- Output Directory: `.next`
- Install Command: `yarn install`

### 3.4 Add Environment Variables

**IMPORTANT**: Add these environment variables:

1. Click **"Environment Variables"**
2. Add each of these:

```
NEXT_PUBLIC_SUPABASE_URL
https://wfnjlichwncplxghtpin.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
sb_publishable_AquKAVINO3DsMzFmSFH7UA_8OiYPNc2

NEXT_PUBLIC_BASE_URL
https://your-app-name.vercel.app

CORS_ORIGINS
*
```

**Note**: For `NEXT_PUBLIC_BASE_URL`, use the URL Vercel will give you (shown after deployment), or wait and update it later.

### 3.5 Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes for the build to complete
3. 🎉 **Your app is live!**

---

## Step 4: Update Your App URL

### 4.1 Get Your Vercel URL

After deployment, Vercel gives you a URL like:
- `https://financial-readiness-check.vercel.app`
- Or: `https://financial-readiness-check-username.vercel.app`

### 4.2 Update Environment Variable

1. In Vercel dashboard → Your project → **Settings** → **Environment Variables**
2. Find `NEXT_PUBLIC_BASE_URL`
3. Update it with your actual Vercel URL
4. Click **Save**
5. Go to **Deployments** tab
6. Click **"Redeploy"** on the latest deployment

---

## Step 5: Add Custom Domain (Optional)

### Want your own domain?

1. Buy a domain (e.g., from Namecheap, GoDaddy, Google Domains)
2. In Vercel: **Settings** → **Domains**
3. Add your domain
4. Update your domain's DNS settings as instructed by Vercel
5. Wait 5-60 minutes for DNS propagation

Example domains you could use:
- `financialcheck.com`
- `readinesscheck.ph`
- `michaelangelo-financial.com`

---

## ✅ Post-Deployment Checklist

- [ ] App is accessible at Vercel URL
- [ ] Can complete assessment
- [ ] Can submit lead information
- [ ] Can view results page
- [ ] Can access admin dashboard at `/admin/login`
- [ ] Environment variables are set correctly
- [ ] Database connection working (Supabase)

---

## 🔄 How to Update Your App

After initial deployment, updates are automatic:

1. Make changes to your code locally
2. Commit changes:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```
3. Vercel **automatically deploys** your changes
4. New version live in 2-3 minutes

---

## 💰 Pricing

**Vercel Free Tier includes:**
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ 100 GB bandwidth/month
- ✅ Serverless functions
- ✅ Preview deployments
- ✅ Custom domains

**This is FREE and sufficient for:**
- Personal projects
- Small businesses
- ~10,000+ visitors/month

**You only pay if you need:**
- Team collaboration features
- More bandwidth (>100GB/month)
- Advanced analytics

---

## 🆘 Troubleshooting

### Build Failed

**Check:**
1. All environment variables are set
2. No syntax errors in code
3. Check Vercel build logs for specific error

### Can't Access Admin Dashboard

**Solution:**
1. Verify you created admin user in Supabase (see SETUP.md)
2. Check Supabase credentials in environment variables

### Assessment Not Submitting

**Solution:**
1. Open browser console (F12)
2. Check for API errors
3. Verify Supabase connection
4. Check environment variables

### Need Help?

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Next.js Docs: https://nextjs.org/docs

---

## 🎯 Success!

Once deployed, your **Financial Readiness Check™** app will be:

✅ **Live 24/7** on the internet
✅ **Fast** with global CDN
✅ **Secure** with automatic HTTPS
✅ **Scalable** to handle traffic spikes
✅ **Free** on Vercel's hobby plan
✅ **Easy to update** - just push to GitHub

**Your new production URL will be:**
`https://your-app-name.vercel.app`

---

## 📱 Share Your App

Once live, you can:
- Share the URL on Facebook
- Add to your email signature
- Include in your social media bio
- Use in Facebook Ads campaigns
- Add to your business cards

**Congratulations on deploying your Financial Readiness Check™ app! 🎉**
