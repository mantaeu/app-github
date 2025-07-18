import mongoose, { Document, Schema } from 'mongoose';

export interface ISalary extends Document {
  userId: mongoose.Types.ObjectId;
  month: string;
  year: number;
  baseSalary: number;
  overtime: number;
  bonuses: number;
  deductions: number;
  totalSalary: number;
  isPaid: boolean;
  paidAt?: Date;
  presentDays?: number;
  absentDays?: number;
  totalWorkingDays?: number;
  totalHoursWorked?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const salarySchema = new Schema<ISalary>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  month: {
    type: String,
    required: true,
    enum: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
  },
  year: {
    type: Number,
    required: true,
    min: 2020,
    max: 2100,
  },
  baseSalary: {
    type: Number,
    required: true,
    min: 0,
  },
  overtime: {
    type: Number,
    default: 0,
    min: 0,
  },
  bonuses: {
    type: Number,
    default: 0,
    min: 0,
  },
  deductions: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalSalary: {
    type: Number,
    required: true,
    min: 0,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  paidAt: {
    type: Date,
  },
  presentDays: {
    type: Number,
    default: 0,
    min: 0,
  },
  absentDays: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalWorkingDays: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalHoursWorked: {
    type: Number,
    default: 0,
    min: 0,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Create compound index for user, month, and year
salarySchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

// Calculate total salary before saving
salarySchema.pre('save', function (next) {
  this.totalSalary = this.baseSalary + this.overtime + this.bonuses - this.deductions;
  next();
});

export const Salary = mongoose.model<ISalary>('Salary', salarySchema, 'salaries');