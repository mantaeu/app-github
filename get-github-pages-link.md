# 🔗 Get Your GitHub Pages Link

## **Method 1: Check GitHub Repository**

1. Go to: `https://github.com/YOUR_USERNAME/mantaevert-hr-app`
2. Click **"Settings"** tab
3. Click **"Pages"** in left sidebar
4. You'll see: **"Your site is live at https://YOUR_USERNAME.github.io/mantaevert-hr-app"**

## **Method 2: Deploy First (if not deployed yet)**

```bash
# Make sure you're in the app root directory
cd d:\app-2

# Build web version
expo export -p web

# Deploy to GitHub Pages
npm run deploy
```

## **Method 3: Manual Check**

Your GitHub Pages URL will always be:
```
https://YOUR_GITHUB_USERNAME.github.io/REPOSITORY_NAME
```

For example:
- If your GitHub username is: `johnsmith`
- And your repository name is: `mantaevert-hr-app`
- Your link will be: `https://johnsmith.github.io/mantaevert-hr-app`

## **Method 4: Check Deployment Status**

```bash
# Check if gh-pages branch exists
git branch -a

# You should see: remotes/origin/gh-pages
```

## **Troubleshooting**

### **If you get 404 error:**
1. Make sure `gh-pages` branch exists
2. Check GitHub Pages settings
3. Wait 5-10 minutes for deployment

### **If deployment failed:**
```bash
# Try deploying again
npm run predeploy
npm run deploy
```

### **If you don't have gh-pages branch:**
```bash
# Install gh-pages if not installed
npm install --save-dev gh-pages

# Deploy
npm run deploy
```

## **Quick Commands to Get Link**

```bash
# 1. Deploy to GitHub Pages
npm run deploy

# 2. Check your repository settings
# Go to: https://github.com/YOUR_USERNAME/mantaevert-hr-app/settings/pages

# 3. Your link will be shown there!
```

## **Example URLs**

If your GitHub username is `ahmed123`:
- Repository: `https://github.com/ahmed123/mantaevert-hr-app`
- GitHub Pages: `https://ahmed123.github.io/mantaevert-hr-app`

If your GitHub username is `company-hr`:
- Repository: `https://github.com/company-hr/mantaevert-hr-app`  
- GitHub Pages: `https://company-hr.github.io/mantaevert-hr-app`