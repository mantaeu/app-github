# Mantaevert - HR Management App

A modern, multilingual HR and payroll management application built with React Native (Expo) and Node.js.

## Features

- **Authentication**: Secure login for admins and workers with JWT-based session management
- **User Management**: Add, edit, and delete workers with role-based access control
- **Attendance Tracking**: Track worker attendance, workdays, and calculate overtime
- **Salary Management**: Calculate and display salaries with bonuses and deductions
- **Receipt Generation**: Generate, view, and download PDF receipts and salary slips
- **Dashboard**: Admin dashboard with system stats and worker dashboard for personal data
- **Multilingual Support**: Full translation support for English, French, and Arabic with RTL layout
- **Theme Support**: Light and dark themes with custom accent colors
- **Responsive Design**: Modern, clean UI optimized for mobile devices

## Tech Stack

### Frontend
- React Native (Expo)
- TypeScript
- React Navigation
- Context API for state management
- Expo Vector Icons
- React Native Paper (UI components)
- i18n-js for internationalization

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- Express validation
- CORS and security middleware

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mantaeu/manteau-app1.git
   cd mantaevert-app
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Environment Setup**
   
   Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb+srv://app618942:9aumT9IDOeoRUnet@cluster0.esqblo4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=*
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the React Native app**
   ```bash
   # In the root directory
   npm start
   ```

3. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your device

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (admin only)
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Create attendance record
- `PUT /api/attendance/:id` - Update attendance record
- `DELETE /api/attendance/:id` - Delete attendance record (admin only)

### Salary
- `GET /api/salary` - Get salary records
- `POST /api/salary` - Create salary record (admin only)
- `PUT /api/salary/:id` - Update salary record (admin only)
- `PUT /api/salary/:id/pay` - Mark salary as paid (admin only)

### Receipts
- `GET /api/receipts` - Get receipts
- `POST /api/receipts` - Create receipt (admin only)
- `POST /api/receipts/salary-slip` - Generate salary slip PDF

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (admin only)
- `GET /api/dashboard/user-stats/:userId` - Get user-specific stats

## Default Users

The application comes with default admin credentials:
- **Email**: admin@mantaevert.com
- **Password**: admin123

## Project Structure

```
mantaevert-app/
├── src/
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React contexts (Auth, Theme, Language)
│   ├── navigation/         # Navigation configuration
│   ├── screens/           # App screens
│   ├── services/          # API services
│   ├── types/             # TypeScript type definitions
│   ├── constants/         # App constants
│   └── localization/      # Translation files
├── backend/
│   ├── src/
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   └── server.ts      # Main server file
│   └── package.json
├── assets/                # App assets (icons, images)
├── App.tsx               # Main app component
└── package.json
```

## Languages Supported

- **English** (en)
- **French** (fr) 
- **Arabic** (ar) with RTL support

## Themes

- **Light Theme**: Clean, bright interface
- **Dark Theme**: Dark background with light text
- **Custom Colors**: Configurable accent colors

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@mantaevert.com or create an issue in the GitHub repository.

## Acknowledgments

- React Native and Expo teams for the excellent framework
- MongoDB for the database solution
- All contributors and testers

---

**Mantaevert** - Modern HR Management Made Simple