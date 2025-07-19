import express, { Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', authenticate, authorize('admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({ isActive: true }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Users can only view their own profile unless they're admin
    if (req.user?.role !== 'admin' && req.user?._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const user = await User.findById(id);
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/users
// @desc    Create new user with ID card number
// @access  Private/Admin
router.post('/', [
  body('idCardNumber').trim().isLength({ min: 1 }).withMessage('ID card number is required'),
  body('name').trim().isLength({ min: 2 }),
  body('role').isIn(['admin', 'worker']),
], authenticate, authorize('admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array(),
      });
    }

    const { idCardNumber, name, role, phone, address, position, salary, hourlyRate } = req.body;

    // Check if user already exists with this ID card number
    const existingUser = await User.findOne({ idCardNumber });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this ID card number',
      });
    }

    // Create new user
    const user = new User({
      idCardNumber,
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

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private
router.put('/:id', [
  body('idCardNumber').optional().trim().isLength({ min: 1 }),
  body('name').optional().trim().isLength({ min: 2 }),
  body('role').optional().isIn(['admin', 'worker']),
], authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Users can only update their own profile unless they're admin
    if (req.user?.role !== 'admin' && req.user?._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
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

    const updateData = req.body;
    
    // Non-admin users cannot change their role
    if (req.user?.role !== 'admin') {
      delete updateData.role;
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (soft delete)
// @access  Private/Admin
router.delete('/:id', authenticate, authorize('admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;