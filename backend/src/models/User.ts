import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  idCardNumber: string;
  name: string;
  role: 'admin' | 'worker';
  phone?: string;
  address?: string;
  position?: string;
  salary?: number; // Daily rate (e.g., 50 DH per day)
  hourlyRate?: number; // Not used in daily system
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  compareIdCard(candidateIdCard: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  idCardNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['admin', 'worker'],
    default: 'worker',
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  position: {
    type: String,
    trim: true,
  },
  salary: {
    type: Number,
    min: 0,
  },
  hourlyRate: {
    type: Number,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Compare ID card method (simple string comparison since ID card is the password)
userSchema.methods.compareIdCard = async function (candidateIdCard: string): Promise<boolean> {
  return this.idCardNumber === candidateIdCard;
};

// JSON output (no sensitive data to remove since ID card is used for login)
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  return userObject;
};

export const User = mongoose.model<IUser>('User', userSchema, 'users');