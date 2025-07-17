const fs = require('fs');
const path = require('path');

// Your current Vercel URL
const currentVercelUrl = 'https://manteau-app1-di0sqwbkb-mantaeus-projects.vercel.app';

// Update the landing page with your actual Vercel URL
const webBuildDir = path.join(__dirname, 'web-build');
const indexPath = path.join(webBuildDir, 'index.html');

if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, 'utf8');
  
  // Update the redirect URL and button links
  content = content.replace(/https:\/\/manteau-app1-di0sqwbkb-mantaeus-projects\.vercel\.app/g, currentVercelUrl);
  
  fs.writeFileSync(indexPath, content);
  console.log('✅ Landing page updated with Vercel URL!');
  console.log(`🔗 Vercel URL: ${currentVercelUrl}`);
} else {
  console.log('❌ Landing page not found. Run: node create-web-build.js first');
}