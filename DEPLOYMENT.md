# Vercel Deployment Guide for Yolofi

## Overview
This project is automatically deployed to Vercel via CI/CD integration with GitHub.

## How It Works

### Automatic Deployment
Every time you push code to the `main` branch on GitHub, Vercel automatically:
1. Detects the push via webhook
2. Pulls the latest code
3. Runs the build process (`npm run build`)
4. Deploys the production build

### Deployment Workflow

```bash
# 1. Make your changes locally
# Edit files in src/

# 2. Stage your changes
git add .

# 3. Commit with a descriptive message
git commit -m "your commit message"

# 4. Push to GitHub (triggers Vercel deployment)
git push origin main
```

## Common Issues & Solutions

### Issue 1: Changes Not Showing in Vercel
**Problem:** You pushed to GitHub but Vercel isn't updating.

**Solutions:**
- Check the Vercel dashboard to see if deployment failed
- Verify your GitHub repository is connected to Vercel
- Check for build errors in Vercel logs
- Clear browser cache (Ctrl + Shift + R)

### Issue 2: Case-Sensitivity Errors
**Problem:** Files work locally on Windows but fail on Vercel (Linux).

**Solution:** Always use consistent casing in filenames and imports.
- ✅ Correct: `GetStarted.jsx` → `import GetStarted from "./components/GetStarted"`
- ❌ Wrong: `GetStarted.jsx` → `import GetStarted from "./components/getstarted"`

### Issue 3: Build Fails on Vercel
**Problem:** Local dev works but Vercel build fails.

**Check:**
- Run `npm run build` locally to catch build errors early
- Check package.json dependencies are properly listed
- Review Vercel build logs for specific errors

## Vercel Dashboard Access

1. Visit [vercel.com](https://vercel.com)
2. Log in with your GitHub account
3. Find the `yolofi.in` project
4. View deployments, logs, and settings

## Useful Vercel Features

### Preview Deployments
- Every push to **any branch** gets a preview URL
- Main branch deploys to production
- Pull requests get automatic preview links

### Environment Variables
Set via Vercel Dashboard → Project Settings → Environment Variables

### Custom Domain
Configure custom domain in Vercel Dashboard → Project Settings → Domains

## Quick Commands Reference

```bash
# Local development
npm run dev            # Start dev server

# Testing production build locally
npm run build          # Create production build
npm run preview        # Preview production build

# Git workflow
git status             # Check file changes
git add .              # Stage all changes
git commit -m "msg"    # Commit changes
git push origin main   # Push and trigger deployment
```

## Build Settings (Configured in Vercel)

- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- **Node Version:** 18.x (or latest LTS)

## Troubleshooting Checklist

- [ ] Files use consistent naming (no case mismatches)
- [ ] All imports match actual file names exactly
- [ ] `npm run build` works locally without errors
- [ ] All dependencies are in `package.json`
- [ ] Changes are committed and pushed to GitHub
- [ ] Vercel project is connected to correct GitHub repo
- [ ] Check Vercel dashboard for deployment status

## Contact & Support

- **Vercel Docs:** https://vercel.com/docs
- **Project Repository:** https://github.com/rainel-projects/yolofi.in

---

**Last Updated:** December 8, 2025
