# 🚀 Complete Deployment Guide - Mantaevert HR App

## 📋 **Prerequisites**
- Node.js installed
- Git installed
- Expo CLI installed (`npm install -g @expo/cli`)
- GitHub account
- Vercel account

---

## 🔧 **PART 1: Backend Deployment (Vercel)**

### **Step 1: Prepare Backend for Vercel**

1. **Create vercel.json in backend folder** (already exists):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

2. **Update package.json scripts** (check if these exist):
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "vercel-build": "npm run build"
  }
}
```

### **Step 2: Deploy Backend to Vercel**

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Navigate to backend folder**:
```bash
cd backend
```

4. **Deploy to Vercel**:
```bash
vercel --prod
```

5. **Set Environment Variables in Vercel Dashboard**:
   - Go to vercel.com → Your Project → Settings → Environment Variables
   - Add these variables:
     ```
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     NODE_ENV=production
     PORT=5501
     ```

6. **Note your Vercel URL** (e.g., `https://mantaevert-backend.vercel.app`)

---

## 📱 **PART 2: Frontend Deployment (GitHub Pages)**

### **Step 3: Prepare Frontend for Web Deployment**

1. **Update API URL in src/services/api.ts**:
```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.0.113:5501/api' 
  : 'https://YOUR_VERCEL_URL.vercel.app/api'; // Replace with your actual Vercel URL
```

2. **Install GitHub Pages deployment package**:
```bash
npm install --save-dev gh-pages
```

3. **Update package.json**:
```json
{
  "homepage": "https://YOUR_GITHUB_USERNAME.github.io/mantaevert-hr-app",
  "scripts": {
    "predeploy": "expo export -p web",
    "deploy": "gh-pages -d dist"
  }
}
```

### **Step 4: Deploy to GitHub Pages**

1. **Create GitHub Repository**:
   - Go to github.com
   - Create new repository: `mantaevert-hr-app`
   - Make it public

2. **Initialize Git and Push**:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mantaevert-hr-app.git
git push -u origin main
```

3. **Deploy to GitHub Pages**:
```bash
npm run deploy
```

4. **Enable GitHub Pages**:
   - Go to GitHub repository → Settings → Pages
   - Source: Deploy from a branch
   - Branch: gh-pages
   - Folder: / (root)
   - Save

---

## 📱 **PART 3: Mobile App (Expo APK)**

### **Step 5: Build APK with Expo**

1. **Install EAS CLI**:
```bash
npm install -g eas-cli
```

2. **Login to Expo**:
```bash
eas login
```

3. **Initialize EAS**:
```bash
eas build:configure
```

4. **Create eas.json**:
```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

5. **Build APK**:
```bash
eas build -p android --profile preview
```

6. **Download APK**:
   - Go to expo.dev → Your account → Builds
   - Download the APK file

---

## 🔗 **PART 4: Final Configuration**

### **Step 6: Update CORS for Production**

Update backend CORS settings in `backend/src/server.ts`:
```typescript
app.use(cors({
  origin: [
    'http://192.168.0.113:8081', 
    'http://localhost:8081', 
    'http://127.0.0.1:8081',
    'https://YOUR_GITHUB_USERNAME.github.io', // Add your GitHub Pages URL
    'https://mantaevert-hr-app.vercel.app' // Add your web app URL if different
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### **Step 7: Test Everything**

1. **Test Backend API**:
   - Visit: `https://your-vercel-url.vercel.app/health`
   - Should return: `{"status":"OK",...}`

2. **Test Web App**:
   - Visit: `https://your-username.github.io/mantaevert-hr-app`
   - Should load the login screen

3. **Test Mobile APK**:
   - Install APK on Android device
   - Should connect to production backend

---

## 📋 **Complete Checklist**

### **Backend (Vercel)**
- [ ] Backend deployed to Vercel
- [ ] Environment variables set
- [ ] Health endpoint working
- [ ] CORS configured for production
- [ ] MongoDB connection working

### **Frontend (GitHub Pages)**
- [ ] Repository created on GitHub
- [ ] Code pushed to GitHub
- [ ] GitHub Pages enabled
- [ ] Web app accessible
- [ ] API calls working

### **Mobile (Expo APK)**
- [ ] EAS configured
- [ ] APK built successfully
- [ ] APK downloaded
- [ ] APK tested on device
- [ ] App connects to production API

### **Final Testing**
- [ ] Login works on web
- [ ] Login works on mobile
- [ ] PDF generation works
- [ ] All features functional
- [ ] Cross-platform compatibility

---

## 🎯 **URLs You'll Have**

After deployment, you'll have:

1. **Backend API**: `https://mantaevert-backend.vercel.app`
2. **Web App**: `https://your-username.github.io/mantaevert-hr-app`
3. **Mobile APK**: Downloaded file for Android installation
4. **Admin Panel**: Accessible from both web and mobile

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: CORS Errors**
- **Solution**: Add your domain to CORS origins in backend

### **Issue 2: API Not Found**
- **Solution**: Check Vercel deployment logs and environment variables

### **Issue 3: APK Won't Install**
- **Solution**: Enable "Install from Unknown Sources" on Android

### **Issue 4: GitHub Pages 404**
- **Solution**: Check repository settings and branch configuration

### **Issue 5: Environment Variables**
- **Solution**: Ensure all required env vars are set in Vercel dashboard

---

## 🎉 **Success!**

Once completed, you'll have:
- ✅ **Professional backend** running on Vercel
- ✅ **Web application** hosted on GitHub Pages
- ✅ **Mobile APK** for Android devices
- ✅ **PDF generation** working across all platforms
- ✅ **Complete HR management system** ready for use

Your Mantaevert HR app will be fully deployed and accessible to users worldwide! 🌍