const fs = require('fs');
const path = require('path');

// Create web-build directory
const webBuildDir = path.join(__dirname, 'web-build');
if (!fs.existsSync(webBuildDir)) {
  fs.mkdirSync(webBuildDir);
}

// Create a simple index.html that redirects to your Vercel app
const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mantaevert HR - Redirecting...</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            text-align: center;
            padding: 40px;
            border-radius: 15px;
            background: #111111;
            box-shadow: 0 20px 40px rgba(255, 102, 0, 0.3);
            border: 2px solid #ff6600;
        }
        .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #ff6600 0%, #ff8533 100%);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            font-weight: bold;
            color: #000000;
        }
        h1 {
            color: #ff6600;
            margin-bottom: 20px;
        }
        .loading {
            margin: 20px 0;
        }
        .spinner {
            border: 3px solid #333;
            border-top: 3px solid #ff6600;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .btn {
            background: #ff6600;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px;
            text-decoration: none;
            display: inline-block;
        }
        .btn:hover {
            background: #ff8533;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">M</div>
        <h1>Mantaevert HR System</h1>
        <p>Professional HR Management with PDF Generation</p>
        
        <div class="loading">
            <div class="spinner"></div>
            <p>Redirecting to application...</p>
        </div>
        
        <div>
            <a href="https://manteau-app1-di0sqwbkb-mantaeus-projects.vercel.app" class="btn">
                🌐 Open Web App
            </a>
            <a href="https://github.com/mantaeu/mantaevert-hr-app" class="btn">
                📱 Download APK
            </a>
        </div>
        
        <p style="margin-top: 30px; color: #999; font-size: 14px;">
            Features: Employee Management • Attendance Tracking • Salary Management • PDF Reports
        </p>
    </div>

    <script>
        // Auto-redirect after 3 seconds
        setTimeout(() => {
            window.location.href = 'https://manteau-app1-di0sqwbkb-mantaeus-projects.vercel.app';
        }, 3000);
    </script>
</body>
</html>
`;

// Write the index.html file
fs.writeFileSync(path.join(webBuildDir, 'index.html'), indexHtml);

console.log('✅ Web build created successfully!');
console.log('📁 Files created in web-build/ directory');
console.log('🚀 Ready to deploy to GitHub Pages!');