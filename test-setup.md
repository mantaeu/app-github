# Mantaevert App - Test Setup Guide

## ✅ **Complete File Structure Verification**

### Frontend Files (React Native + Expo)
```
d:\app-2\
├── package.json ✅
├── app.json ✅
├── tsconfig.json ✅
├── babel.config.js ✅
├── expo-env.d.ts ✅
├── App.tsx ✅
├── .gitignore ✅
├── README.md ✅
├── assets/
│   ├── icon.png ✅ (placeholder)
│   ├── splash.png ✅ (placeholder)
│   ├── adaptive-icon.png ✅ (placeholder)
│   └── favicon.png ✅ (placeholder)
└── src/
    ├── components/
    │   ├── ThemedButton.tsx ✅
    │   ├── ThemedCard.tsx ✅
    │   └── ThemedTextInput.tsx ✅
    ├── constants/
    │   └── Colors.ts ✅
    ├── contexts/
    │   ├── AuthContext.tsx ✅
    │   ├── LanguageContext.tsx ✅
    │   └── ThemeContext.tsx ✅
    ├── localization/
    │   └── translations.ts ✅
    ├── navigation/
    │   ├── AppNavigator.tsx ✅
    │   └── TabNavigator.tsx ✅
    ├── screens/
    │   ├── AttendanceScreen.tsx ✅
    │   ├── DashboardScreen.tsx ✅
    │   ├── LoginScreen.tsx ✅
    │   ├── ProfileScreen.tsx ✅
    │   ├── ReceiptsScreen.tsx ✅
    │   ├── SalaryScreen.tsx ✅
    │   ├── SettingsScreen.tsx ✅
    │   └── UsersScreen.tsx ✅
    ├── services/
    │   └── api.ts ✅
    └── types/
        └── index.ts ✅
```

### Backend Files (Node.js + Express + MongoDB)
```
d:\app-2\backend\
├── package.json ✅
├── tsconfig.json ✅
├── .env ✅
└── src/
    ├── server.ts ✅
    ├── middleware/
    │   ├── auth.ts ✅
    │   ├── errorHandler.ts ✅
    │   └── notFound.ts ✅
    ├── models/
    │   ├── Attendance.ts ✅
    │   ├── Receipt.ts ✅
    │   ├── Salary.ts ✅
    │   └── User.ts ✅
    ├── routes/
    │   ├── attendance.ts ✅
    │   ├── auth.ts ✅
    │   ├── dashboard.ts ✅
    │   ├── receipts.ts ✅
    │   ├── salary.ts ✅
    │   └── users.ts ✅
    └── scripts/
        └── seedDatabase.ts ✅
```

## 🚀 **Step-by-Step Testing Instructions**

### 1. Install Dependencies

**Frontend:**
```bash
cd d:\app-2
npm install
```

**Backend:**
```bash
cd d:\app-2\backend
npm install
```

### 2. Setup Database

The MongoDB connection string is already configured in `.env`:
```
MONGODB_URI=mongodb+srv://app618942:9aumT9IDOeoRUnet@cluster0.esqblo4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

**Seed the database with sample data:**
```bash
cd d:\app-2\backend
npm run seed
```

### 3. Start Backend Server

```bash
cd d:\app-2\backend
npm run dev
```

**Expected output:**
```
✅ MongoDB connected successfully
🚀 Server running on port 3000
📊 Environment: development
🔗 Health check: http://localhost:3000/health
```

### 4. Start Frontend App

```bash
cd d:\app-2
npm start
```

**Expected output:**
```
Starting Metro Bundler
› Metro waiting on exp://192.168.x.x:19000
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

### 5. Test Login Credentials

**Admin Account:**
- Email: `admin@mantaevert.com`
- Password: `admin123`

**Worker Accounts:**
- Email: `john.doe@mantaevert.com` / Password: `worker123`
- Email: `jane.smith@mantaevert.com` / Password: `worker123`
- Email: `mike.johnson@mantaevert.com` / Password: `worker123`

## 🧪 **Feature Testing Checklist**

### Authentication ✅
- [ ] Login with admin credentials
- [ ] Login with worker credentials
- [ ] Logout functionality
- [ ] JWT token persistence

### Admin Features ✅
- [ ] Dashboard with system stats
- [ ] User management (view, add, edit, delete)
- [ ] Attendance management
- [ ] Salary management
- [ ] Receipt generation
- [ ] Settings and preferences

### Worker Features ✅
- [ ] Personal dashboard
- [ ] View own attendance
- [ ] Check-in/check-out
- [ ] View salary records
- [ ] Download salary slips
- [ ] Profile management

### Multilingual Support ✅
- [ ] Switch to English
- [ ] Switch to French
- [ ] Switch to Arabic (RTL layout)
- [ ] Language persistence

### Theme Support ✅
- [ ] Light theme
- [ ] Dark theme
- [ ] Theme persistence

### API Endpoints ✅
- [ ] GET /api/auth/me
- [ ] POST /api/auth/login
- [ ] GET /api/users
- [ ] GET /api/attendance
- [ ] GET /api/salary
- [ ] GET /api/receipts
- [ ] GET /api/dashboard/stats

## 🔧 **Troubleshooting**

### Common Issues:

1. **Metro bundler issues:**
   ```bash
   npx expo start --clear
   ```

2. **Backend connection issues:**
   - Check if port 3000 is available
   - Verify MongoDB connection string
   - Check firewall settings

3. **TypeScript errors:**
   ```bash
   npx expo install --fix
   ```

4. **Dependencies issues:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📱 **Testing on Device**

### iOS:
1. Install Expo Go from App Store
2. Scan QR code from terminal
3. App should load automatically

### Android:
1. Install Expo Go from Play Store
2. Scan QR code from terminal
3. App should load automatically

### Web:
```bash
npm run web
```

## 🎯 **Expected App Behavior**

1. **Login Screen:** Clean, modern login with language switcher
2. **Admin Dashboard:** System stats, user management, quick actions
3. **Worker Dashboard:** Personal stats, attendance summary
4. **Navigation:** Bottom tabs with role-based visibility
5. **Theming:** Smooth transitions between light/dark modes
6. **Localization:** Instant language switching with RTL support
7. **API Integration:** Real-time data from MongoDB

## ✨ **All Features Implemented**

- ✅ Complete authentication system
- ✅ Role-based access control
- ✅ User management (CRUD)
- ✅ Attendance tracking
- ✅ Salary management
- ✅ Receipt generation
- ✅ Dashboard analytics
- ✅ Multilingual support (EN/FR/AR)
- ✅ Light/Dark themes
- ✅ Responsive design
- ✅ MongoDB integration
- ✅ RESTful API
- ✅ TypeScript throughout
- ✅ Modern UI components

**The app is now ready for testing! 🎉**