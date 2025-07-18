import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Attendance } from '../models/Attendance';
import { Salary } from '../models/Salary';
import { Receipt } from '../models/Receipt';
import { Admin } from '../models/Admin';

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI=mongodb+srv://app618942:9aumT9IDOeoRUnet@cluster0.esqblo4.mongodb.net/app-1?retryWrites=true&w=majority&appName=Cluster0');
    }

    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Admin.deleteMany({});
    await Attendance.deleteMany({});
    await Salary.deleteMany({});
    await Receipt.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Define admins and workers as arrays for flexibility
    const admins = [
      {
        email: 'admin@mantaevert.com',
        password: 'admin123',
        name: 'Admin User',
        phone: '+1234567890',
        address: '123 Admin Street, City, Country',
        position: 'System Administrator',
        role: 'admin',
      },
      // Add more admin objects here if needed
    ];

    const workers = [
      {
        email: 'john.doe@mantaevert.com',
        password: 'worker123',
        name: 'John Doe',
        role: 'worker',
        phone: '+1234567891',
        address: '456 Worker Lane, City, Country',
        position: 'Software Developer',
        salary: 5000,
        hourlyRate: 25,
      },
      {
        email: 'jane.smith@mantaevert.com',
        password: 'worker123',
        name: 'Jane Smith',
        role: 'worker',
        phone: '+1234567892',
        address: '789 Employee Ave, City, Country',
        position: 'Project Manager',
        salary: 6000,
        hourlyRate: 30,
      },
      {
        email: 'mike.johnson@mantaevert.com',
        password: 'worker123',
        name: 'Mike Johnson',
        role: 'worker',
        phone: '+1234567893',
        address: '321 Staff Road, City, Country',
        position: 'Designer',
        salary: 4500,
        hourlyRate: 22,
      },
      // Add more worker objects here if needed
    ];

    // Create admin users
    for (const adminData of admins) {
      const admin = new Admin(adminData);
      await admin.save();
    }
    console.log('👤 Created admin user(s)');

    // Create sample workers
    const createdWorkers = [];
    for (const workerData of workers) {
      const worker = new User(workerData);
      await worker.save();
      createdWorkers.push(worker);
    }
    console.log('👥 Created sample workers');

    // Create sample attendance records
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    for (const worker of createdWorkers) {
      // Create attendance for the last 20 days
      for (let i = 1; i <= 20; i++) {
        const date = new Date(currentYear, currentMonth, i);
        const checkIn = new Date(date);
        checkIn.setHours(9, 0, 0, 0); // 9:00 AM

        const checkOut = new Date(date);
        checkOut.setHours(17, 30, 0, 0); // 5:30 PM

        const attendance = new Attendance({
          userId: worker._id,
          date,
          checkIn,
          checkOut,
          status: Math.random() > 0.1 ? 'present' : 'absent', // 90% present
        });

        await attendance.save();
      }
    }
    console.log('📅 Created sample attendance records');

    // Create sample salary records
    const months = ['January', 'February', 'March', 'April', 'May', 'June'];
    
    for (const worker of createdWorkers) {
      for (const month of months) {
        const baseSalary = worker.salary || 5000;
        const overtime = Math.floor(Math.random() * 500); // Random overtime
        const bonuses = Math.floor(Math.random() * 1000); // Random bonuses
        const deductions = Math.floor(Math.random() * 200); // Random deductions
        const totalSalary = baseSalary + overtime + bonuses - deductions;
        const salary = new Salary({
          userId: worker._id,
          month,
          year: currentYear,
          baseSalary,
          overtime,
          bonuses,
          deductions,
          totalSalary,
          isPaid: Math.random() > 0.3, // 70% paid
        });

        await salary.save();
      }
    }
    console.log('💰 Created sample salary records');

    // Create sample receipts
    for (const worker of createdWorkers) {
      for (let i = 0; i < 5; i++) {
        const receipt = new Receipt({
          userId: worker._id,
          type: ['salary', 'payment', 'invoice'][Math.floor(Math.random() * 3)],
          amount: Math.floor(Math.random() * 5000) + 1000,
          description: `Sample receipt ${i + 1} for ${worker.name}`,
          date: new Date(currentYear, currentMonth - i, Math.floor(Math.random() * 28) + 1),
        });

        await receipt.save();
      }
    }
    console.log('🧾 Created sample receipts');

    console.log('🎉 Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin@mantaevert.com / admin123');
    console.log('Worker: john.doe@mantaevert.com / worker123');
    console.log('Worker: jane.smith@mantaevert.com / worker123');
    console.log('Worker: mike.johnson@mantaevert.com / worker123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
};

seedDatabase();