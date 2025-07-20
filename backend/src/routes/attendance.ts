import express from 'express';
import { body, validationResult } from 'express-validator';
import { Attendance } from '../models/Attendance';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { AttendanceService } from '../services/attendanceService';

const router = express.Router();

// @route   GET /api/attendance
// @desc    Get attendance records
// @access  Private
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { userId, startDate, endDate } = req.query;
    
    let filter: any = {};
    
    // If not admin, users can only see their own attendance
    if (req.user?.role !== 'admin') {
      filter.userId = req.user._id;
    } else if (userId) {
      filter.userId = userId;
    }

    // Date filtering
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    const attendance = await Attendance.find(filter)
      .populate('userId', 'name email')
      .sort({ date: -1 });

    res.json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/attendance/:id
// @desc    Get attendance record by ID
// @access  Private
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('userId', 'name email');

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    // Users can only view their own attendance unless they're admin
    if (req.user?.role !== 'admin' && attendance.userId._id.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/attendance
// @desc    Create attendance record
// @access  Private
router.post('/', [
  body('userId').optional().isMongoId(),
  body('date').isISO8601(),
  body('checkIn').isISO8601(),
  body('checkOut').optional().isISO8601(),
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

    let { userId, date, checkIn, checkOut, status, notes } = req.body;

    // If not admin, use current user's ID
    if (req.user?.role !== 'admin') {
      userId = req.user._id;
    }

    // Check if attendance already exists for this user and date
    const existingAttendance = await Attendance.findOne({
      userId,
      date: new Date(date),
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already recorded for this date',
      });
    }

    const attendance = new Attendance({
      userId,
      date: new Date(date),
      checkIn: new Date(checkIn),
      checkOut: checkOut ? new Date(checkOut) : undefined,
      status,
      notes,
    });

    await attendance.save();
    await attendance.populate('userId', 'name email');

    // Update daily earnings when attendance is recorded
    try {
      await AttendanceService.updateDailyEarnings(userId, new Date(date), status || 'present');
      console.log(`💰 Daily earnings updated for user ${userId} on ${date}`);
    } catch (error) {
      console.error('Error updating daily earnings:', error);
      // Don't fail the attendance creation if earnings update fails
    }

    res.status(201).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/attendance/:id
// @desc    Update attendance record
// @access  Private
router.put('/:id', [
  body('checkIn').optional().isISO8601(),
  body('checkOut').optional().isISO8601(),
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

    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    // Users can only update their own attendance unless they're admin
    if (req.user?.role !== 'admin' && attendance.userId.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const updateData = req.body;
    
    // Convert date strings to Date objects
    if (updateData.checkIn) updateData.checkIn = new Date(updateData.checkIn);
    if (updateData.checkOut) updateData.checkOut = new Date(updateData.checkOut);

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    // Update daily earnings when attendance status is changed
    if (updateData.status) {
      try {
        await AttendanceService.updateDailyEarnings(
          attendance.userId.toString(), 
          attendance.date, 
          updateData.status
        );
        console.log(`💰 Daily earnings updated for status change: ${updateData.status}`);
      } catch (error) {
        console.error('Error updating daily earnings on status change:', error);
      }
    }

    res.json({
      success: true,
      data: updatedAttendance,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/attendance/:id
// @desc    Delete attendance record
// @access  Private/Admin
router.delete('/:id', authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    // Update daily earnings before deleting (recalculate without this day)
    try {
      await AttendanceService.updateDailyEarnings(
        attendance.userId.toString(), 
        attendance.date, 
        'deleted'
      );
      console.log(`💰 Daily earnings updated after deleting attendance record`);
    } catch (error) {
      console.error('Error updating daily earnings on delete:', error);
    }

    await Attendance.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Attendance record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/attendance/mark-absent
// @desc    Manually mark absent workers (Admin only)
// @access  Private/Admin
router.post('/mark-absent', authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    await AttendanceService.markAbsentWorkers();
    res.json({
      success: true,
      message: 'Absent workers marked successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/attendance/monthly-report/:userId/:month/:year
// @desc    Get monthly attendance report for a user
// @access  Private
router.get('/monthly-report/:userId/:month/:year', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { userId, month, year } = req.params;

    // Users can only view their own report unless they're admin
    if (req.user?.role !== 'admin' && userId !== req.user?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const salaryData = await AttendanceService.calculateDailySalary(userId, month, parseInt(year));
    
    res.json({
      success: true,
      data: salaryData,
    });
  } catch (error) {
    next(error);
  }
});

export default router;