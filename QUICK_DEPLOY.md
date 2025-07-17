# 🚀 Quick Deployment Checklist

## ⚡ **Before You Start**

1. **Create Accounts** (if you don't have them):
   - GitHub account
   - Vercel account  
   - Expo account

2. **Install Required Tools**:
```bash
npm install -g @expo/cli
npm install -g eas-cli
npm install -g vercel
```

---

## 🔥 **5-Minute Deployment**

### **Step 1: Backend (Vercel) - 2 minutes**

```bash
cd backend
vercel login
vercel --prod
```

**Set Environment Variables in Vercel Dashboard:**
- `MONGODB_URI` = your MongoDB connection string
- `JWT_SECRET` = your JWT secret
- `NODE_ENV` = production

**Copy your Vercel URL** (e.g., `https://mantaevert-backend-abc123.vercel.app`)

---

### **Step 2: Update API URL - 30 seconds**

In `src/services/api.ts`, replace:
```typescript
const API_BASE_URL = __DEV__
  ? 'http://192.168.0.113:5501/api'
  : 'https://YOUR_VERCEL_URL.vercel.app/api'; // ← Put your Vercel URL here
```

---

### **Step 3: Web App (GitHub Pages) - 2 minutes**

1. **Update package.json** - replace `YOUR_GITHUB_USERNAME`:
```json
"homepage": "https://YOUR_GITHUB_USERNAME.github.io/mantaevert-hr-app"
```

2. **Deploy to GitHub**:
```bash
git init
git add .
git commit -m "Deploy Mantaevert HR App"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mantaevert-hr-app.git
git push -u origin main
npm run deploy
```

3. **Enable GitHub Pages**:
   - Go to GitHub repo → Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: "gh-pages"
   - Save

---

### **Step 4: Mobile APK (Expo) - 5 minutes**

```bash
eas login
eas build:configure
eas build -p android --profile preview
```

Wait for build to complete, then download APK from expo.dev

---

## ✅ **Final Result**

You'll have:
- **🌐 Web App**: `https://your-username.github.io/mantaevert-hr-app`
- **📱 Mobile APK**: Downloaded file for Android
- **🔗 Backend API**: `https://your-vercel-url.vercel.app`

---

## 🚨 **Quick Fixes**

### **CORS Error?**
Add your domain to CORS in `backend/src/server.ts`:
```typescript
origin: [
  'https://your-username.github.io',
  // ... other origins
]
```

### **API Not Working?**
Check Vercel deployment logs and environment variables.

### **GitHub Pages 404?**
Make sure you enabled Pages and selected "gh-pages" branch.

---

## 🎉 **You're Done!**

Your Mantaevert HR app is now live and ready for users! 🚀