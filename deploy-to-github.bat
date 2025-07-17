@echo off
echo ========================================
echo    Deploying Mantaevert HR to GitHub
echo ========================================
echo.

echo Step 1: Updating API URL...
node update-api-url.js

echo.
echo Step 2: Installing dependencies...
npm install

echo.
echo Step 3: Building for web...
npm run build:web

echo.
echo Step 4: Deploying to GitHub Pages...
npm run deploy

echo.
echo ========================================
echo    Deployment Complete!
echo ========================================
echo.
echo Your app will be available at:
echo https://YOUR_USERNAME.github.io/mantaevert-hr-app
echo.
echo Don't forget to:
echo 1. Deploy your backend to Vercel
echo 2. Update the API URL with your backend URL
echo 3. Set environment variables in Vercel
echo.
pause