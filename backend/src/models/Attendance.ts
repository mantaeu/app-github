import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  hoursWorked: number;
  overtime: number;
  status: 'present' | 'absent' | 'late';
  autoMarked?: boolean; // If marked automatically by system
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  checkIn: {
    type: Date,
  },
  checkOut: {
    type: Date,
  },
  hoursWorked: {
    type: Number,
    default: 0,
    min: 0,
  },
  overtime: {
    type: Number,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    default: 'present',
  },
  autoMarked: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Create compound index for user and date
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

// Calculate hours worked before saving
attendanceSchema.pre('save', function (next) {
  if (this.checkIn && this.checkOut) {
    const diffMs = this.checkOut.getTime() - this.checkIn.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    this.hoursWorked = Math.max(0, diffHours);
    
    // Calculate overtime (assuming 8 hours is standard)
    this.overtime = Math.max(0, this.hoursWorked - 8);
  }
  next();
});

export const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema, 'attendances');