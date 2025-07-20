import { Attendance } from '../models/Attendance';
import { User } from '../models/User';
import { Salary } from '../models/Salary';
import { Receipt } from '../models/Receipt';
import cron from 'node-cron';

export class AttendanceService {
  // Check for absent workers daily at 6 PM
  static initializeDailyAttendanceCheck() {
    cron.schedule('0 18 * * *', async () => {
      console.log('🔍 Running daily attendance check...');
      await this.markAbsentWorkers();
    });
  }

  // Mark workers as absent if they haven't checked in by 6 PM
  static async markAbsentWorkers() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get all active workers
      const activeWorkers = await User.find({ isActive: true, role: 'worker' });
      
      for (const worker of activeWorkers) {
        // Check if worker has attendance record for today
        const todayAttendance = await Attendance.findOne({
          userId: worker._id,
          date: {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        });

        // If no attendance record, mark as absent
        if (!todayAttendance) {
          await Attendance.create({
            userId: worker._id,
            date: today,
            status: 'absent',
            hoursWorked: 0,
            overtime: 0,
            autoMarked: true
          });
          
          // Update daily earnings for absent day
          await this.updateDailyEarnings(worker._id.toString(), today, 'absent');
          
          console.log(`📝 Marked ${worker.name} as absent for ${today.toDateString()}`);
        }
      }
    } catch (error) {
      console.error('❌ Error in daily attendance check:', error);
    }
  }

  // Calculate daily-based salary for a period (safe for any number of days)
  static async calculateDailySalary(userId: string, month: string, year: number) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        console.warn(`User not found: ${userId}`);
        return this.getDefaultSalaryData();
      }

      // Get attendance records for the month
      const startDate = new Date(year, this.getMonthNumber(month), 1);
      const endDate = new Date(year, this.getMonthNumber(month) + 1, 0);
      
      const attendanceRecords = await Attendance.find({
        userId,
        date: { $gte: startDate, $lte: endDate }
      });

      // Calculate working days in month (excluding weekends)
      const totalWorkingDays = this.getWorkingDaysInMonth(year, this.getMonthNumber(month));
      
      // Count present days (safe calculation)
      const presentDays = Math.max(0, attendanceRecords.filter(record => record.status === 'present').length);
      const absentDays = Math.max(0, attendanceRecords.filter(record => record.status === 'absent').length);
      
      // Daily salary calculation (user.salary is daily rate, e.g., 50 DH per day)
      const dailyRate = Math.max(0, user.salary || 0); // This is the daily rate (e.g., 50 DH)
      const earnedSalary = Math.max(0, dailyRate * presentDays); // Only pay for days worked
      const missedSalary = Math.max(0, dailyRate * absentDays); // Amount lost due to absence
      
      console.log(`💰 Calculated salary for ${user.name}: ${presentDays} days × ${dailyRate} DH = ${earnedSalary} DH`);
      
      return {
        dailyRate,
        presentDays,
        absentDays,
        totalWorkingDays: Math.max(0, totalWorkingDays),
        earnedSalary,
        missedSalary,
        totalSalary: earnedSalary, // Only what they earned
        deductions: missedSalary, // What they lost
        bonuses: 0,
        overtime: 0,
        attendanceRecords
      };
    } catch (error) {
      console.error('Error calculating daily salary:', error);
      // Return safe defaults if calculation fails
      return this.getDefaultSalaryData();
    }
  }

  // Return default salary data to prevent errors
  private static getDefaultSalaryData() {
    return {
      dailyRate: 0,
      presentDays: 0,
      absentDays: 0,
      totalWorkingDays: 0,
      earnedSalary: 0,
      missedSalary: 0,
      totalSalary: 0,
      deductions: 0,
      bonuses: 0,
      overtime: 0,
      attendanceRecords: []
    };
  }

  // Generate daily-based salary records for all active workers
  static async generateMonthlySalaries(month: string, year: number) {
    try {
      const activeWorkers = await User.find({ isActive: true, role: 'worker' });
      
      for (const worker of activeWorkers) {
        // Check if salary record already exists
        const existingSalary = await Salary.findOne({
          userId: worker._id,
          month,
          year
        });

        if (!existingSalary) {
          const salaryData = await this.calculateDailySalary(worker._id.toString(), month, year);
          
          await Salary.create({
            userId: worker._id,
            month,
            year,
            baseSalary: salaryData.earnedSalary,
            overtime: 0, // No overtime in daily system
            bonuses: salaryData.bonuses,
            deductions: salaryData.missedSalary,
            totalSalary: salaryData.totalSalary,
            isPaid: false,
            presentDays: salaryData.presentDays,
            absentDays: salaryData.absentDays,
            totalWorkingDays: salaryData.totalWorkingDays,
            totalHoursWorked: 0 // Not relevant for daily system
          });
          
          console.log(`💰 Generated daily salary record for ${worker.name} - ${month} ${year}: ${salaryData.presentDays} days × ${salaryData.dailyRate} DH = ${salaryData.earnedSalary} DH`);
        }
      }
    } catch (error) {
      console.error('Error generating monthly salaries:', error);
      throw error;
    }
  }

  // Update daily earnings when attendance is recorded
  static async updateDailyEarnings(userId: string, attendanceDate: Date, status: string) {
    try {
      const user = await User.findById(userId);
      if (!user || user.role !== 'worker') return;

      const dailyRate = Math.max(0, user.salary || 0);
      if (dailyRate === 0) {
        console.warn(`No daily rate set for user ${user.name}`);
        return;
      }

      const date = new Date(attendanceDate);
      const month = date.toLocaleString('en-US', { month: 'long' });
      const year = date.getFullYear();

      console.log(`💰 Updating daily earnings for ${user.name}: ${status} on ${date.toDateString()}`);

      // Find or create monthly salary record
      let salaryRecord = await Salary.findOne({
        userId,
        month,
        year
      });

      if (!salaryRecord) {
        // Create new salary record for this month
        const salaryData = await this.calculateDailySalary(userId, month, year);
        
        salaryRecord = new Salary({
          userId,
          month,
          year,
          baseSalary: Math.max(0, salaryData.earnedSalary),
          overtime: 0,
          bonuses: 0,
          deductions: Math.max(0, salaryData.missedSalary),
          totalSalary: Math.max(0, salaryData.totalSalary),
          isPaid: false,
          presentDays: Math.max(0, salaryData.presentDays),
          absentDays: Math.max(0, salaryData.absentDays),
          totalWorkingDays: Math.max(0, salaryData.totalWorkingDays),
          totalHoursWorked: 0
        });

        await salaryRecord.save();
        console.log(`💰 Created new salary record for ${user.name} - ${month} ${year}`);
      } else {
        // Update existing salary record
        const salaryData = await this.calculateDailySalary(userId, month, year);
        
        salaryRecord.baseSalary = Math.max(0, salaryData.earnedSalary);
        salaryRecord.deductions = Math.max(0, salaryData.missedSalary);
        salaryRecord.totalSalary = Math.max(0, salaryData.totalSalary);
        salaryRecord.presentDays = Math.max(0, salaryData.presentDays);
        salaryRecord.absentDays = Math.max(0, salaryData.absentDays);
        salaryRecord.totalWorkingDays = Math.max(0, salaryData.totalWorkingDays);

        await salaryRecord.save();
        console.log(`💰 Updated salary record for ${user.name} - ${month} ${year}: ${salaryData.presentDays} days × ${dailyRate} DH = ${salaryData.earnedSalary} DH`);
      }

      // Create daily earning receipt for present days
      if (status === 'present') {
        await this.createDailyEarningReceipt(userId, date, dailyRate);
      }

      return salaryRecord;
    } catch (error) {
      console.error('Error updating daily earnings:', error);
      // Don't throw error to prevent attendance creation from failing
    }
  }

  // Create daily earning receipt when worker is checked in
  static async createDailyEarningReceipt(userId: string, attendanceDate: Date, dailyRate: number) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      const date = new Date(attendanceDate);
      const dateString = date.toLocaleDateString();

      const receiptDescription = `Daily Attendance Earning - ${dateString}
Worker: ${user.name}
Daily Rate: ${dailyRate} DH
Status: Present
Earned: ${dailyRate} DH`;

      const receipt = new Receipt({
        userId,
        type: 'salary',
        amount: Math.max(0, dailyRate), // Ensure amount is never negative
        description: receiptDescription,
        date: new Date(),
        metadata: {
          attendanceDate: date.toISOString(),
          dailyRate,
          type: 'daily_earning'
        }
      });

      await receipt.save();
      console.log(`📄 Created daily earning receipt for ${user.name}: ${dailyRate} DH`);
      
      return receipt;
    } catch (error) {
      console.error('Error creating daily earning receipt:', error);
      // Don't throw error to prevent attendance creation from failing
    }
  }

  // Helper methods
  private static getMonthNumber(monthName: string): number {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const index = months.indexOf(monthName);
    return index >= 0 ? index : 0; // Return 0 (January) if month not found
  }

  private static getWorkingDaysInMonth(year: number, month: number): number {
    try {
      const date = new Date(year, month, 1);
      let workingDays = 0;
      
      while (date.getMonth() === month) {
        const dayOfWeek = date.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
          workingDays++;
        }
        date.setDate(date.getDate() + 1);
      }
      
      return Math.max(0, workingDays);
    } catch (error) {
      console.error('Error calculating working days:', error);
      return 0;
    }
  }

  // Calculate hours worked between check-in and check-out
  static calculateHoursWorked(checkIn: Date, checkOut: Date): { hoursWorked: number; overtime: number } {
    try {
      const diffMs = checkOut.getTime() - checkIn.getTime();
      const totalHours = diffMs / (1000 * 60 * 60);
      
      const regularHours = Math.min(totalHours, 8); // 8 hours regular work day
      const overtime = Math.max(0, totalHours - 8);
      
      return {
        hoursWorked: Math.max(0, Math.round(regularHours * 100) / 100),
        overtime: Math.max(0, Math.round(overtime * 100) / 100)
      };
    } catch (error) {
      console.error('Error calculating hours worked:', error);
      return { hoursWorked: 0, overtime: 0 };
    }
  }
}