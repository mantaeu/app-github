import { Attendance } from '../models/Attendance';
import { User } from '../models/User';
import { Salary } from '../models/Salary';
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
          
          console.log(`📝 Marked ${worker.name} as absent for ${today.toDateString()}`);
        }
      }
    } catch (error) {
      console.error('❌ Error in daily attendance check:', error);
    }
  }

  // Calculate monthly salary based on attendance
  static async calculateMonthlySalary(userId: string, month: string, year: number) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      // Get attendance records for the month
      const startDate = new Date(year, this.getMonthNumber(month), 1);
      const endDate = new Date(year, this.getMonthNumber(month) + 1, 0);
      
      const attendanceRecords = await Attendance.find({
        userId,
        date: { $gte: startDate, $lte: endDate }
      });

      // Calculate working days in month (excluding weekends)
      const totalWorkingDays = this.getWorkingDaysInMonth(year, this.getMonthNumber(month));
      
      // Count present days
      const presentDays = attendanceRecords.filter(record => record.status === 'present').length;
      const absentDays = totalWorkingDays - presentDays;
      
      // Calculate total hours worked and overtime
      const totalHoursWorked = attendanceRecords.reduce((sum, record) => sum + record.hoursWorked, 0);
      const totalOvertime = attendanceRecords.reduce((sum, record) => sum + record.overtime, 0);
      
      // Calculate salary
      const dailySalary = user.salary ? user.salary / totalWorkingDays : 0;
      const baseSalary = dailySalary * presentDays;
      const overtimePay = totalOvertime * (user.hourlyRate || 0);
      const absentDeduction = dailySalary * absentDays;
      
      const totalSalary = baseSalary + overtimePay;

      return {
        baseSalary: user.salary || 0,
        actualBaseSalary: baseSalary,
        overtime: overtimePay,
        bonuses: 0,
        deductions: absentDeduction,
        totalSalary,
        presentDays,
        absentDays,
        totalWorkingDays,
        totalHoursWorked,
        attendanceRecords
      };
    } catch (error) {
      console.error('Error calculating monthly salary:', error);
      throw error;
    }
  }

  // Generate monthly salary records for all active workers
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
          const salaryData = await this.calculateMonthlySalary(worker._id.toString(), month, year);
          
          await Salary.create({
            userId: worker._id,
            month,
            year,
            baseSalary: salaryData.actualBaseSalary,
            overtime: salaryData.overtime,
            bonuses: salaryData.bonuses,
            deductions: salaryData.deductions,
            totalSalary: salaryData.totalSalary,
            isPaid: false,
            presentDays: salaryData.presentDays,
            absentDays: salaryData.absentDays,
            totalWorkingDays: salaryData.totalWorkingDays,
            totalHoursWorked: salaryData.totalHoursWorked
          });
          
          console.log(`💰 Generated salary record for ${worker.name} - ${month} ${year}`);
        }
      }
    } catch (error) {
      console.error('Error generating monthly salaries:', error);
      throw error;
    }
  }

  // Helper methods
  private static getMonthNumber(monthName: string): number {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months.indexOf(monthName);
  }

  private static getWorkingDaysInMonth(year: number, month: number): number {
    const date = new Date(year, month, 1);
    let workingDays = 0;
    
    while (date.getMonth() === month) {
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        workingDays++;
      }
      date.setDate(date.getDate() + 1);
    }
    
    return workingDays;
  }

  // Calculate hours worked between check-in and check-out
  static calculateHoursWorked(checkIn: Date, checkOut: Date): { hoursWorked: number; overtime: number } {
    const diffMs = checkOut.getTime() - checkIn.getTime();
    const totalHours = diffMs / (1000 * 60 * 60);
    
    const regularHours = Math.min(totalHours, 8); // 8 hours regular work day
    const overtime = Math.max(0, totalHours - 8);
    
    return {
      hoursWorked: Math.round(regularHours * 100) / 100,
      overtime: Math.round(overtime * 100) / 100
    };
  }
}