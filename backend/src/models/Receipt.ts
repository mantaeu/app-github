import mongoose, { Document, Schema } from 'mongoose';

export interface IReceipt extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'salary' | 'payment' | 'invoice';
  amount: number;
  description: string;
  date: Date;
  pdfUrl?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const receiptSchema = new Schema<IReceipt>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['salary', 'payment', 'invoice'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  pdfUrl: {
    type: String,
    trim: true,
  },
  metadata: {
    type: Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Index for efficient querying
receiptSchema.index({ userId: 1, date: -1 });
receiptSchema.index({ type: 1 });

export const Receipt = mongoose.model<IReceipt>('Receipt', receiptSchema, 'receipts');