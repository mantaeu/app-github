import express from 'express';
import { body, validationResult } from 'express-validator';
import { Receipt } from '../models/Receipt';
import { Salary } from '../models/Salary';
import { User } from '../models/User';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/receipts
// @desc    Get receipts
// @access  Private
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { userId, type } = req.query;
    
    let filter: any = {};
    
    // If not admin, users can only see their own receipts
    if (req.user?.role !== 'admin') {
      filter.userId = req.user._id;
    } else if (userId) {
      filter.userId = userId;
    }

    // Type filtering
    if (type) {
      filter.type = type;
    }

    const receipts = await Receipt.find(filter)
      .populate('userId', 'name email')
      .sort({ date: -1 });

    res.json({
      success: true,
      data: receipts,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/receipts/:id
// @desc    Get receipt by ID
// @access  Private
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate('userId', 'name email');

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found',
      });
    }

    // Users can only view their own receipts unless they're admin
    if (req.user?.role !== 'admin' && receipt.userId._id.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/receipts
// @desc    Create receipt
// @access  Private/Admin
router.post('/', [
  body('userId').isMongoId(),
  body('type').isIn(['salary', 'payment', 'invoice']),
  body('amount').isFloat({ min: 0 }),
  body('description').trim().isLength({ min: 1 }),
], authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array(),
      });
    }

    const { userId, type, amount, description, date, metadata } = req.body;

    const receipt = new Receipt({
      userId,
      type,
      amount,
      description,
      date: date ? new Date(date) : new Date(),
      metadata,
    });

    await receipt.save();
    await receipt.populate('userId', 'name email');

    res.status(201).json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/receipts/salary-slip
// @desc    Generate salary slip PDF
// @access  Private
router.post('/salary-slip', [
  body('userId').isMongoId(),
  body('month').isIn([
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]),
  body('year').isInt({ min: 2020, max: 2100 }),
], authenticate, async (req: AuthRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array(),
      });
    }

    const { userId, month, year } = req.body;

    // Users can only generate their own salary slips unless they're admin
    if (req.user?.role !== 'admin' && req.user?._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Find salary record
    const salaryRecord = await Salary.findOne({ userId, month, year })
      .populate('userId', 'name email position');

    if (!salaryRecord) {
      return res.status(404).json({
        success: false,
        message: 'Salary record not found for the specified period',
      });
    }

    // For now, return a mock PDF URL
    // In a real implementation, you would generate a PDF using puppeteer or similar
    const pdfUrl = `${req.protocol}://${req.get('host')}/api/receipts/salary-slip/${salaryRecord._id}.pdf`;

    // Create receipt record
    const receipt = new Receipt({
      userId,
      type: 'salary',
      amount: salaryRecord.totalSalary,
      description: `Salary slip for ${month} ${year}`,
      date: new Date(),
      pdfUrl,
      metadata: {
        salaryRecordId: salaryRecord._id,
        month,
        year,
      },
    });

    await receipt.save();

    res.json({
      success: true,
      data: {
        pdfUrl,
        receipt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/receipts/:id
// @desc    Update receipt
// @access  Private/Admin
router.put('/:id', [
  body('amount').optional().isFloat({ min: 0 }),
  body('description').optional().trim().isLength({ min: 1 }),
], authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array(),
      });
    }

    const receipt = await Receipt.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found',
      });
    }

    res.json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/receipts/:id
// @desc    Delete receipt
// @access  Private/Admin
router.delete('/:id', authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const receipt = await Receipt.findByIdAndDelete(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found',
      });
    }

    res.json({
      success: true,
      message: 'Receipt deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;