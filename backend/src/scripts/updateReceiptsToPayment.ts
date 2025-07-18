import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Receipt } from '../models/Receipt';

// Load environment variables
dotenv.config();

const updateReceiptsToPayment = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Update all receipts to be "payment" type
    const result = await Receipt.updateMany(
      {}, // Update all receipts
      { 
        $set: { 
          type: 'payment' 
        } 
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} receipts to "payment" type`);

    // Also update descriptions to reflect payment type
    const receipts = await Receipt.find({});
    
    for (const receipt of receipts) {
      let newDescription = receipt.description;
      
      // Replace "slip" with "payment"
      newDescription = newDescription.replace(/slip/gi, 'payment');
      
      // Replace "receipt" with "payment"
      newDescription = newDescription.replace(/receipt/gi, 'payment');
      
      // Replace "reimbursement" with "reimbursement payment"
      if (newDescription.includes('reimbursement') && !newDescription.includes('reimbursement payment')) {
        newDescription = newDescription.replace(/reimbursement/gi, 'reimbursement payment');
      }
      
      // Update if description changed
      if (newDescription !== receipt.description) {
        await Receipt.findByIdAndUpdate(receipt._id, { description: newDescription });
      }
    }

    console.log('✅ Updated receipt descriptions to reflect payment type');

    // Get final count
    const totalReceipts = await Receipt.countDocuments({ type: 'payment' });
    console.log(`🧾 Total payment receipts: ${totalReceipts}`);

    console.log('\n🎉 All receipts are now "payment" type!');
    console.log('\n📋 Login to see updated receipts:');
    console.log('Worker: john.doe@mantaevert.com / worker123');
    console.log('Worker: jane.smith@mantaevert.com / worker123');
    console.log('Worker: mike.johnson@mantaevert.com / worker123');

  } catch (error) {
    console.error('❌ Error updating receipts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
};

updateReceiptsToPayment();