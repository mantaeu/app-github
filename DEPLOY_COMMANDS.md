# 📋 Exact Commands to Run

## 🔧 **Setup (Run Once)**

```bash
# Install required tools
npm install -g @expo/cli
npm install -g eas-cli  
npm install -g vercel
npm install --save-dev gh-pages

# Login to services
vercel login
eas login
```

---

## 🚀 **Deploy Backend (Vercel)**

```bash
# Navigate to backend
cd backend

# Deploy to Vercel
vercel --prod

# Note: Set environment variables in Vercel dashboard:
# MONGODB_URI, JWT_SECRET, NODE_ENV=production
```

---

## 🌐 **Deploy Web App (GitHub Pages)**

```bash
# Navigate back to root
cd ..

# Update API URL in src/services/api.ts (replace with your Vercel URL)
# Update homepage in package.json (replace with your GitHub username)

# Initialize Git and deploy
git init
git add .
git commit -m "Deploy Mantaevert HR App"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mantaevert-hr-app.git
git push -u origin main

# Deploy to GitHub Pages
npm run deploy
```

---

## 📱 **Build Mobile APK (Expo)**

```bash
# Configure EAS
eas build:configure

# Build APK
eas build -p android --profile preview

# Download APK from expo.dev when build completes
```

---

## ✅ **Enable GitHub Pages**

1. Go to: `https://github.com/YOUR_USERNAME/mantaevert-hr-app/settings/pages`
2. Source: "Deploy from a branch"
3. Branch: "gh-pages"
4. Folder: "/ (root)"
5. Click "Save"

---

## 🔗 **Your Final URLs**

- **Backend**: `https://your-project-name.vercel.app`
- **Web App**: `https://your-username.github.io/mantaevert-hr-app`
- **Mobile APK**: Download from expo.dev builds page

---

## 🎯 **Test Everything**

```bash
# Test backend
curl https://your-vercel-url.vercel.app/health

# Test web app
# Visit: https://your-username.github.io/mantaevert-hr-app

# Test mobile APK
# Install APK on Android device and test login
```

---

## 🚨 **If Something Goes Wrong**

### Backend Issues:
```bash
# Check Vercel logs
vercel logs

# Redeploy if needed
vercel --prod --force
```

### Frontend Issues:
```bash
# Rebuild and redeploy
npm run predeploy
npm run deploy
```

### Mobile Issues:
```bash
# Check build status
eas build:list

# Rebuild if needed
eas build -p android --profile preview --clear-cache
```

---

## 🎉 **Success!**

Your Mantaevert HR app is now deployed and ready for production use! 🚀