import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';

// Load environment variables
dotenv.config();

const fixDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Get the users collection
    const collection = mongoose.connection.db.collection('users');

    console.log('\n🔍 Checking current indexes...');
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(idx => ({ name: idx.name, key: idx.key })));

    // Check if email index exists
    const emailIndexExists = indexes.some(idx => idx.key && idx.key.email);
    
    if (emailIndexExists) {
      console.log('\n🗑️ Dropping email index...');
      try {
        await collection.dropIndex('email_1');
        console.log('✅ Email index dropped successfully');
      } catch (error) {
        console.log('⚠️ Email index might not exist or already dropped:', error);
      }
    } else {
      console.log('✅ Email index does not exist');
    }

    // Ensure idCardNumber index exists and is unique
    console.log('\n📝 Ensuring idCardNumber index...');
    try {
      await collection.createIndex({ idCardNumber: 1 }, { unique: true, sparse: true });
      console.log('✅ idCardNumber unique index created/verified');
    } catch (error) {
      console.log('⚠️ idCardNumber index might already exist:', error);
    }

    // Check final indexes
    console.log('\n🔍 Final indexes:');
    const finalIndexes = await collection.indexes();
    finalIndexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    // Clean up old users without idCardNumber
    console.log('\n🧹 Checking for users without idCardNumber...');
    const usersWithoutIdCard = await collection.find({ idCardNumber: { $exists: false } }).toArray();
    console.log(`Found ${usersWithoutIdCard.length} users without idCardNumber`);

    if (usersWithoutIdCard.length > 0) {
      console.log('Users without idCardNumber:');
      usersWithoutIdCard.forEach(user => {
        console.log(`  - ${user.name} (${user.email || 'no email'})`);
      });

      console.log('\n⚠️ These users need to be migrated or removed manually.');
      console.log('They cannot login with the new ID card system.');
    }

    console.log('\n✅ Database fix completed!');

  } catch (error) {
    console.error('❌ Error fixing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
};

fixDatabase();