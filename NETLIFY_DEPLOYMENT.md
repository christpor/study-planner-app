# Deploy Study Planner to Netlify

This guide explains how to deploy the Study Planner app to Netlify as a web app with offline support.

## What's Included

✅ **Progressive Web App (PWA)** — Install as app on desktop/mobile
✅ **Offline Support** — Service worker caches data for offline access
✅ **Web Manifest** — App metadata for installation
✅ **Netlify Configuration** — Automatic build and deployment setup

## Prerequisites

- Netlify Pro Plan (you have this ✓)
- Git repository (GitHub, GitLab, or Bitbucket)
- Node.js 22+ and pnpm installed locally

## Step-by-Step Deployment

### 1. Prepare the Project

The project is already configured for Netlify. Key files:
- `netlify.toml` — Build configuration
- `public/service-worker.js` — Offline support
- `public/manifest.json` — PWA metadata
- `lib/pwa-init.ts` — Service worker registration

### 2. Push to Git Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Study Planner - Ready for Netlify deployment"

# Push to your repository
git push origin main
```

### 3. Connect to Netlify

**Option A: Via Netlify UI**

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Select your Git provider (GitHub/GitLab/Bitbucket)
4. Choose the `study-planner-app` repository
5. Netlify auto-detects `netlify.toml` settings
6. Click "Deploy site"

**Option B: Via Netlify CLI**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

### 4. Verify Deployment

After deployment completes:

1. **Visit your site** — `https://your-site-name.netlify.app`
2. **Test offline mode:**
   - Open DevTools (F12)
   - Go to Application → Service Workers
   - Check "Offline" box
   - Refresh page — should still work!
3. **Install as app:**
   - Desktop: Click install icon in address bar
   - Mobile: Menu → "Install app"

## Features After Deployment

### ✅ Offline Access
- All data stored locally in browser
- Works without internet connection
- Syncs when connection returns

### ✅ Install as App
- Desktop: Standalone window
- Mobile: Home screen icon
- Works like native app

### ✅ Service Worker
- Caches all assets on first visit
- Network-first strategy for API calls
- Automatic cache updates

## Environment Variables

If you add backend features later:

1. Go to Netlify Site Settings
2. Build & Deploy → Environment
3. Add variables (e.g., `VITE_API_URL`)
4. Redeploy

## Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Verify `public/service-worker.js` exists
- Clear browser cache and hard refresh (Ctrl+Shift+R)

### Offline Mode Not Working
- Check DevTools → Application → Cache Storage
- Verify service worker is "activated"
- Try offline toggle in DevTools

### Build Fails
- Check Netlify build logs
- Ensure `pnpm` version matches (9.12.0)
- Run `pnpm install` locally and test

## Updating the App

After making changes:

```bash
git add .
git commit -m "Update: [description]"
git push origin main
```

Netlify automatically rebuilds and deploys! 🚀

## Performance Tips

- Service worker caches for 1 hour (configurable in `service-worker.js`)
- Static assets cached forever (with hash busting)
- API calls use network-first strategy
- Offline data stored in browser's IndexedDB (via AsyncStorage)

## Next Steps

1. ✅ Deploy to Netlify
2. Test on mobile and desktop
3. Share the link with users
4. Add push notifications (optional)
5. Implement cloud sync (optional)

---

**Need help?** Check Netlify docs: https://docs.netlify.com
