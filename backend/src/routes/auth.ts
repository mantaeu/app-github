import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';
import { Admin } from '../models/Admin';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Generate JWT token
const generateToken = (userId: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  return jwt.sign({ userId }, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
};

// @route   POST /api/auth/login
// @desc    Login user with ID card number
// @access  Public
router.post('/login', [
  body('idCardNumber').trim().isLength({ min: 1 }).withMessage('ID card number is required'),
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array(),
      });
    }

    const { idCardNumber } = req.body;

    // Try to find user in users collection by ID card number
    let user = await User.findOne({ idCardNumber, isActive: true });
    let isAdmin = false;
    
    if (!user) {
      // If not found, try admins collection (admins still use email/password)
      user = await Admin.findOne({ email: idCardNumber, isActive: true });
      isAdmin = !!user;
      
      // For admin login, we still need to check password if provided
      if (user && req.body.password) {
        const isPasswordValid = await user.comparePassword(req.body.password);
        if (!isPasswordValid) {
          return res.status(401).json({
            success: false,
            message: 'Invalid credentials',
          });
        }
      }
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid ID card number',
      });
    }

    // For regular users, ID card number is both username and password
    if (!isAdmin) {
      const isIdCardValid = await user.compareIdCard(idCardNumber);
      if (!isIdCardValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid ID card number',
        });
      }
    }

    // Generate token
    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      data: {
        user: { ...user.toObject(), role: isAdmin ? 'admin' : user.role || 'worker' },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/admin-login
// @desc    Login admin with email and password
// @access  Public
router.post('/admin-login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 1 }).withMessage('Password is required'),
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ email, isActive: true });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(admin._id.toString());

    res.json({
      success: true,
      data: {
        user: { ...admin.toObject(), role: 'admin' },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/register
// @desc    Register new user (admin only)
// @access  Private/Admin
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 }),
  body('role').isIn(['admin', 'worker']),
], authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Only admins can register new users
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array(),
      });
    }

    const { email, password, name, role, phone, address, position, salary, hourlyRate } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      role,
      phone,
      address,
      position,
      salary,
      hourlyRate,
    });

    await user.save();

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', [
  body('currentPassword').isLength({ min: 6 }),
  body('newPassword').isLength({ min: 6 }),
], authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array(),
      });
    }

    const { currentPassword, newPassword } = req.body;
    const user = req.user!;

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;