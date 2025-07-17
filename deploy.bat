@echo off
echo ========================================
echo    Mantaevert HR App Deployment Script
echo ========================================
echo.

echo Step 1: Installing required packages...
npm install -g @expo/cli
npm install -g eas-cli
npm install -g vercel
npm install --save-dev gh-pages

echo.
echo Step 2: Building backend...
cd backend
npm run build
echo Backend built successfully!

echo.
echo Step 3: Deploying backend to Vercel...
echo Please run: vercel --prod
echo Then set environment variables in Vercel dashboard
pause

echo.
echo Step 4: Building web version...
cd ..
expo export -p web

echo.
echo Step 5: Ready for GitHub deployment...
echo Please run the following commands:
echo git init
echo git add .
echo git commit -m "Initial deployment"
echo git branch -M main
echo git remote add origin https://github.com/YOUR_USERNAME/mantaevert-hr-app.git
echo git push -u origin main
echo npm run deploy

echo.
echo Step 6: Building Android APK...
echo Please run: eas build -p android --profile preview

echo.
echo ========================================
echo    Deployment Guide Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Update API_BASE_URL in src/services/api.ts with your Vercel URL
echo 2. Update homepage in package.json with your GitHub username
echo 3. Set environment variables in Vercel dashboard
echo 4. Enable GitHub Pages in repository settings
echo.
pause