const fs = require('fs');
const path = require('path');

// Read the API service file
const apiFilePath = path.join(__dirname, 'src', 'services', 'api.ts');
let content = fs.readFileSync(apiFilePath, 'utf8');

// Replace the old URL with the new one
content = content.replace(
  'https://manteau-app1-1fsk.vercel.app/api',
  'https://mantaevert-backend.vercel.app/api'
);

// Write back to file
fs.writeFileSync(apiFilePath, content);

console.log('✅ API URL updated successfully!');
console.log('🔗 New API URL: https://mantaevert-backend.vercel.app/api');