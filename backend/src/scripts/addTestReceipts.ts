import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Receipt } from '../models/Receipt';

// Load environment variables
dotenv.config();

const addTestReceipts = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Get all workers
    const workers = await User.find({ role: 'worker' });
    console.log(`Found ${workers.length} workers`);

    // Clear existing receipts
    await Receipt.deleteMany({});
    console.log('🗑️  Cleared existing receipts');

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Create realistic test receipts for each worker
    for (const worker of workers) {
      const testReceipts = [
        {
          type: 'salary',
          description: `Monthly salary slip for ${worker.name} - June 2025`,
          amount: worker.salary || 5000,
          date: new Date(currentYear, currentMonth, 1),
        },
        {
          type: 'salary',
          description: `Monthly salary slip for ${worker.name} - May 2025`,
          amount: worker.salary || 5000,
          date: new Date(currentYear, currentMonth - 1, 1),
        },
        {
          type: 'payment',
          description: `Overtime payment for ${worker.name} - Project Alpha`,
          amount: Math.floor(Math.random() * 1000) + 500,
          date: new Date(currentYear, currentMonth, 15),
        },
        {
          type: 'invoice',
          description: `Expense reimbursement for ${worker.name} - Business Travel`,
          amount: Math.floor(Math.random() * 800) + 200,
          date: new Date(currentYear, currentMonth, 10),
        },
        {
          type: 'salary',
          description: `Performance bonus for ${worker.name} - Q2 2025`,
          amount: Math.floor(Math.random() * 2000) + 1000,
          date: new Date(currentYear, currentMonth, 20),
        },
        {
          type: 'payment',
          description: `Project completion bonus for ${worker.name} - Beta Release`,
          amount: Math.floor(Math.random() * 1500) + 800,
          date: new Date(currentYear, currentMonth - 1, 25),
        },
        {
          type: 'invoice',
          description: `Equipment purchase receipt for ${worker.name} - Laptop & Monitor`,
          amount: Math.floor(Math.random() * 1200) + 800,
          date: new Date(currentYear, currentMonth - 2, 5),
        },
        {
          type: 'salary',
          description: `Annual bonus for ${worker.name} - 2024 Performance`,
          amount: Math.floor(Math.random() * 3000) + 2000,
          date: new Date(currentYear, 0, 15), // January
        },
        {
          type: 'payment',
          description: `Training allowance for ${worker.name} - Professional Development`,
          amount: Math.floor(Math.random() * 600) + 300,
          date: new Date(currentYear, currentMonth - 1, 12),
        },
        {
          type: 'invoice',
          description: `Conference attendance for ${worker.name} - Tech Summit 2025`,
          amount: Math.floor(Math.random() * 1000) + 500,
          date: new Date(currentYear, currentMonth - 3, 8),
        },
        {
          type: 'payment',
          description: `Referral bonus for ${worker.name} - New hire recommendation`,
          amount: 1000,
          date: new Date(currentYear, currentMonth, 5),
        },
        {
          type: 'invoice',
          description: `Home office setup for ${worker.name} - Desk & Chair`,
          amount: Math.floor(Math.random() * 600) + 400,
          date: new Date(currentYear, currentMonth - 4, 20),
        },
      ];

      for (let i = 0; i < testReceipts.length; i++) {
        const receiptData = testReceipts[i];
        const receipt = new Receipt({
          userId: worker._id,
          type: receiptData.type,
          amount: receiptData.amount,
          description: receiptData.description,
          date: receiptData.date,
          pdfUrl: `https://example.com/receipts/${worker.name.replace(' ', '_')}_${receiptData.type}_${Date.now()}_${i}.pdf`,
        });

        await receipt.save();
      }

      console.log(`✅ Created ${testReceipts.length} test receipts for ${worker.name}`);
    }

    const totalReceipts = await Receipt.countDocuments();
    console.log(`🧾 Total receipts created: ${totalReceipts}`);

    console.log('\n🎉 Test receipts added successfully!');
    console.log('\n📋 Login to see receipts:');
    console.log('Worker: john.doe@mantaevert.com / worker123');
    console.log('Worker: jane.smith@mantaevert.com / worker123');
    console.log('Worker: mike.johnson@mantaevert.com / worker123');

  } catch (error) {
    console.error('❌ Error adding test receipts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
};

addTestReceipts();