import mongoose, { Document, Schema } from 'mongoose';

export interface IInvoice extends Document {
  invoiceNumber: string;
  type: 'invoice' | 'quote';
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  issueDate: Date;
  dueDate?: Date;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema: Schema = new Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['invoice', 'quote'],
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  clientEmail: {
    type: String
  },
  clientPhone: {
    type: String
  },
  clientAddress: {
    type: String
  },
  items: [{
    description: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 20,
    min: 0,
    max: 100
  },
  taxAmount: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'cancelled'],
    default: 'draft'
  },
  issueDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: {
    type: Date
  },
  notes: {
    type: String
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

// Generate invoice number automatically
InvoiceSchema.pre('save', async function(next) {
  if (this.isNew && !this.invoiceNumber) {
    const year = new Date().getFullYear();
    const prefix = this.type === 'invoice' ? 'INV' : 'QUO';
    
    const lastDoc = await mongoose.model('Invoice').findOne({
      type: this.type,
      invoiceNumber: new RegExp(`^${prefix}-${year}-`)
    }).sort({ invoiceNumber: -1 });

    let nextNumber = 1;
    if (lastDoc) {
      const lastNumber = parseInt(lastDoc.invoiceNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    this.invoiceNumber = `${prefix}-${year}-${nextNumber.toString().padStart(4, '0')}`;
  }
  next();
});

export const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);