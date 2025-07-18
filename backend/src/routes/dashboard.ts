import express from 'express';
import { User } from '../models/User';
import { Attendance } from '../models/Attendance';
import { Salary } from '../models/Salary';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/stats', authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Get total active users
    const totalUsers = await User.countDocuments({ isActive: true, role: 'worker' });

    // Get monthly attendance count
    const monthlyAttendance = await Attendance.countDocuments({
      date: {
        $gte: new Date(currentYear, currentMonth - 1, 1),
        $lt: new Date(currentYear, currentMonth, 1),
      },
      status: 'present',
    });

    // Get pending salaries count
    const pendingSalaries = await Salary.countDocuments({
      isPaid: false,
      year: currentYear,
    });

    // Get recent activity (last 10 attendance records)
    const recentActivity = await Attendance.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        totalUsers,
        monthlyAttendance,
        pendingSalaries,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/dashboard/user-stats/:userId
// @desc    Get user-specific dashboard statistics
// @access  Private
router.get('/user-stats/:userId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { userId } = req.params;
    
    // Users can only view their own stats unless they're admin
    if (req.user?.role !== 'admin' && req.user?._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Get user's monthly attendance
    const monthlyAttendance = await Attendance.countDocuments({
      userId,
      date: {
        $gte: new Date(currentYear, currentMonth - 1, 1),
        $lt: new Date(currentYear, currentMonth, 1),
      },
      status: 'present',
    });

    // Get user's total hours this month
    const attendanceRecords = await Attendance.find({
      userId,
      date: {
        $gte: new Date(currentYear, currentMonth - 1, 1),
        $lt: new Date(currentYear, currentMonth, 1),
      },
    });

    const totalHours = attendanceRecords.reduce((sum, record) => sum + record.hoursWorked, 0);
    const totalOvertime = attendanceRecords.reduce((sum, record) => sum + record.overtime, 0);

    // Get pending salary
    const pendingSalary = await Salary.findOne({
      userId,
      year: currentYear,
      isPaid: false,
    });

    res.json({
      success: true,
      data: {
        monthlyAttendance,
        totalHours,
        totalOvertime,
        pendingSalary: pendingSalary?.totalSalary || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;