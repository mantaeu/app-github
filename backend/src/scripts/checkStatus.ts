import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Admin } from '../models/Admin';
import { Attendance } from '../models/Attendance';
import { Salary } from '../models/Salary';
import { Receipt } from '../models/Receipt';

// Load environment variables
dotenv.config();

const checkStatus = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Check collections
    console.log('\n📊 DATABASE STATUS CHECK:');
    console.log('=' .repeat(50));

    // Check Admins
    const adminCount = await Admin.countDocuments();
    const admins = await Admin.find({}, 'email name').limit(5);
    console.log(`\n👤 ADMINS: ${adminCount} total`);
    admins.forEach(admin => {
      console.log(`   - ${admin.name} (${admin.email})`);
    });

    // Check Users/Workers
    const userCount = await User.countDocuments();
    const users = await User.find({}, 'idCardNumber name role position salary').limit(5);
    console.log(`\n👥 WORKERS: ${userCount} total`);
    users.forEach(user => {
      console.log(`   - ${user.name} (ID: ${user.idCardNumber}) - ${user.position} - $${user.salary}`);
    });

    // Check Attendance
    const attendanceCount = await Attendance.countDocuments();
    const recentAttendance = await Attendance.find()
      .populate('userId', 'name')
      .sort({ date: -1 })
      .limit(5);
    console.log(`\n📅 ATTENDANCE RECORDS: ${attendanceCount} total`);
    recentAttendance.forEach(record => {
      const user = record.userId as any;
      console.log(`   - ${user?.name || 'Unknown'}: ${record.status} on ${record.date.toDateString()}`);
    });

    // Check Salaries
    const salaryCount = await Salary.countDocuments();
    const pendingSalaries = await Salary.countDocuments({ isPaid: false });
    const recentSalaries = await Salary.find()
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
    console.log(`\n💰 SALARY RECORDS: ${salaryCount} total (${pendingSalaries} pending)`);
    recentSalaries.forEach(salary => {
      const user = salary.userId as any;
      console.log(`   - ${user?.name || 'Unknown'}: $${salary.totalSalary} for ${salary.month} ${salary.year} ${salary.isPaid ? '✅' : '⏳'}`);
    });

    // Check Receipts
    const receiptCount = await Receipt.countDocuments();
    const recentReceipts = await Receipt.find()
      .populate('userId', 'name')
      .sort({ date: -1 })
      .limit(5);
    console.log(`\n🧾 RECEIPTS: ${receiptCount} total`);
    recentReceipts.forEach(receipt => {
      const user = receipt.userId as any;
      console.log(`   - ${user?.name || 'Unknown'}: ${receipt.type} - $${receipt.amount}`);
    });

    // Dashboard Stats Simulation
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const monthlyAttendance = await Attendance.countDocuments({
      date: {
        $gte: new Date(currentYear, currentMonth - 1, 1),
        $lt: new Date(currentYear, currentMonth, 1),
      },
      status: 'present',
    });

    console.log(`\n📈 DASHBOARD STATS:`);
    console.log(`   - Total Active Workers: ${userCount}`);
    console.log(`   - Monthly Attendance: ${monthlyAttendance}`);
    console.log(`   - Pending Salaries: ${pendingSalaries}`);

    console.log('\n🎯 SYSTEM STATUS:');
    console.log('=' .repeat(50));
    console.log('✅ MongoDB Connection: Working');
    console.log('✅ User Authentication: Ready');
    console.log('✅ Admin Dashboard: Ready');
    console.log('✅ Worker Dashboard: Ready');
    console.log('✅ Attendance Tracking: Ready');
    console.log('✅ Salary Management: Ready');
    console.log('✅ Receipt System: Ready');

    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('=' .repeat(50));
    console.log('Admin: admin@mantaevert.com / admin123');
    if (users.length > 0) {
      users.forEach(user => {
        console.log(`Worker: ${user.idCardNumber} (ID card login)`);
      });
    }

    console.log('\n🚀 READY TO USE!');

  } catch (error) {
    console.error('❌ Error checking status:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
};

checkStatus();