import express from 'express';
import { body, validationResult } from 'express-validator';
import { Salary } from '../models/Salary';
import { Receipt } from '../models/Receipt';
import { User } from '../models/User';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { AttendanceService } from '../services/attendanceService';

const router = express.Router();

// @route   GET /api/salary
// @desc    Get salary records
// @access  Private
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { userId, year, month } = req.query;
    
    let filter: any = {};
    
    // If not admin, users can only see their own salary records
    if (req.user?.role !== 'admin') {
      filter.userId = req.user._id;
    } else if (userId) {
      filter.userId = userId;
    }

    // Year filtering
    if (year) {
      filter.year = parseInt(year as string);
    }

    // Month filtering
    if (month) {
      filter.month = month;
    }

    const salaryRecords = await Salary.find(filter)
      .populate('userId', 'name email')
      .sort({ year: -1, month: -1 });

    res.json({
      success: true,
      data: salaryRecords,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/salary/:id
// @desc    Get salary record by ID
// @access  Private
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const salary = await Salary.findById(req.params.id)
      .populate('userId', 'name email');

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: 'Salary record not found',
      });
    }

    // Users can only view their own salary unless they're admin
    if (req.user?.role !== 'admin' && salary.userId._id.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: salary,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/salary
// @desc    Create salary record
// @access  Private/Admin
router.post('/', [
  body('userId').isMongoId(),
  body('month').isIn([
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]),
  body('year').isInt({ min: 2020, max: 2100 }),
  body('baseSalary').isFloat({ min: 0 }),
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

    const { userId, month, year, baseSalary, overtime, bonuses, deductions, notes } = req.body;

    // Check if salary record already exists for this user, month, and year
    const existingSalary = await Salary.findOne({ userId, month, year });
    if (existingSalary) {
      return res.status(400).json({
        success: false,
        message: 'Salary record already exists for this period',
      });
    }

    const salary = new Salary({
      userId,
      month,
      year,
      baseSalary,
      overtime: overtime || 0,
      bonuses: bonuses || 0,
      deductions: deductions || 0,
      notes,
    });

    await salary.save();
    await salary.populate('userId', 'name email');

    res.status(201).json({
      success: true,
      data: salary,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/salary/:id
// @desc    Update salary record
// @access  Private/Admin
router.put('/:id', [
  body('baseSalary').optional().isFloat({ min: 0 }),
  body('overtime').optional().isFloat({ min: 0 }),
  body('bonuses').optional().isFloat({ min: 0 }),
  body('deductions').optional().isFloat({ min: 0 }),
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

    const salary = await Salary.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: 'Salary record not found',
      });
    }

    res.json({
      success: true,
      data: salary,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/salary/:id/pay
// @desc    Mark salary as paid
// @access  Private/Admin
router.put('/:id/pay', authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const salary = await Salary.findByIdAndUpdate(
      req.params.id,
      { 
        isPaid: true,
        paidAt: new Date(),
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: 'Salary record not found',
      });
    }

    res.json({
      success: true,
      data: salary,
      message: 'Salary marked as paid',
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/salary/:id
// @desc    Delete salary record
// @access  Private/Admin
router.delete('/:id', authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const salary = await Salary.findByIdAndDelete(req.params.id);

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: 'Salary record not found',
      });
    }

    res.json({
      success: true,
      message: 'Salary record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/salary/generate-monthly/:month/:year
// @desc    Generate monthly salary records for all active workers
// @access  Private/Admin
router.post('/generate-monthly/:month/:year', authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { month, year } = req.params;
    
    await AttendanceService.generateMonthlySalaries(month, parseInt(year));
    
    res.json({
      success: true,
      message: `Monthly salary records generated for ${month} ${year}`,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/salary/checkout/:userId/:month/:year
// @desc    Daily salary checkout - Generate detailed receipt (works even for 1 day)
// @access  Private
router.post('/checkout/:userId/:month/:year', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { userId, month, year } = req.params;

    // Users can only checkout their own salary unless they're admin
    if (req.user?.role !== 'admin' && userId !== req.user?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Get the user's actual daily rate from their profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const dailyRate = user.salary || 0; // This is the actual daily rate (e.g., 100 DH)

    // Get or create salary record
    let salaryRecord = await Salary.findOne({ userId, month, year: parseInt(year) });
    
    if (!salaryRecord) {
      // Generate salary record based on daily attendance
      const salaryData = await AttendanceService.calculateDailySalary(userId, month, parseInt(year));
      
      // Ensure minimum values to prevent validation errors
      const presentDays = Math.max(0, salaryData.presentDays || 0);
      const earnedSalary = Math.max(0, salaryData.earnedSalary || 0);
      const totalSalary = Math.max(0, salaryData.totalSalary || 0);
      
      salaryRecord = new Salary({
        userId,
        month,
        year: parseInt(year),
        baseSalary: earnedSalary,
        overtime: 0, // No overtime in daily system
        bonuses: Math.max(0, salaryData.bonuses || 0),
        deductions: Math.max(0, salaryData.missedSalary || 0),
        totalSalary: totalSalary,
        presentDays: presentDays,
        absentDays: Math.max(0, salaryData.absentDays || 0),
        totalWorkingDays: Math.max(0, salaryData.totalWorkingDays || 0),
        totalHoursWorked: 0, // Not relevant for daily system
        isPaid: false
      });
      
      await salaryRecord.save();
    }

    // Create detailed receipt for daily-based salary
    const receiptDescription = `Daily Salary Checkout - ${month} ${year}
Worker: ${user.name}
Daily Rate: ${dailyRate} DH per day
Working Days: ${salaryRecord.presentDays || 0}/${salaryRecord.totalWorkingDays || 0}
Absent Days: ${salaryRecord.absentDays || 0}
Calculation: ${salaryRecord.presentDays || 0} days × ${dailyRate} DH = ${salaryRecord.baseSalary || 0} DH
Missed Salary: ${salaryRecord.deductions || 0} DH
Total Paid: ${salaryRecord.totalSalary || 0} DH`;

    // Ensure receipt amount is never negative or invalid
    const receiptAmount = Math.max(0, salaryRecord.totalSalary || 0);

    const receipt = new Receipt({
      userId,
      type: 'salary',
      amount: receiptAmount,
      description: receiptDescription,
      date: new Date(),
      metadata: {
        salaryRecordId: salaryRecord._id,
        month,
        year: parseInt(year),
        presentDays: salaryRecord.presentDays || 0,
        absentDays: salaryRecord.absentDays || 0,
        totalWorkingDays: salaryRecord.totalWorkingDays || 0,
        totalHoursWorked: salaryRecord.totalHoursWorked || 0,
        dailyRate: dailyRate,
        workerName: user.name,
        breakdown: {
          baseSalary: salaryRecord.baseSalary || 0,
          overtime: salaryRecord.overtime || 0,
          bonuses: salaryRecord.bonuses || 0,
          deductions: salaryRecord.deductions || 0
        }
      }
    });

    await receipt.save();
    await receipt.populate('userId', 'name email');

    res.json({
      success: true,
      data: {
        salaryRecord,
        receipt
      },
      message: `Daily salary checkout completed: ${salaryRecord.presentDays || 0} days × ${dailyRate} DH = ${salaryRecord.totalSalary || 0} DH`,
    });
  } catch (error) {
    next(error);
  }
});

export default router;