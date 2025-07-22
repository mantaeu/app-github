import mongoose, { Document, Schema } from 'mongoose';

export interface IInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IInvoice extends Document {
  type: 'devis' | 'facture';
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  items: IInvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  dueDate?: Date;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  pdfPath?: string;
}

const InvoiceItemSchema = new Schema({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
});

const InvoiceSchema = new Schema({
  type: {
    type: String,
    enum: ['devis', 'facture'],
    required: true,
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  clientName: {
    type: String,
    required: true,
    trim: true,
  },
  clientEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },
  clientAddress: {
    type: String,
    trim: true,
  },
  items: [InvoiceItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  taxRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  taxAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  notes: {
    type: String,
    trim: true,
  },
  dueDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'cancelled'],
    default: 'draft',
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  pdfPath: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
InvoiceSchema.index({ createdBy: 1, createdAt: -1 });
InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ type: 1, status: 1 });
InvoiceSchema.index({ clientName: 1 });

// Virtual for formatted invoice number
InvoiceSchema.virtual('formattedNumber').get(function() {
  return this.invoiceNumber;
});

// Pre-save middleware to calculate totals
InvoiceSchema.pre('save', function(next) {
  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
  
  // Calculate discount amount
  this.discountAmount = (this.subtotal * this.discount) / 100;
  
  // Calculate tax amount (after discount)
  const afterDiscount = this.subtotal - this.discountAmount;
  this.taxAmount = (afterDiscount * this.taxRate) / 100;
  
  // Calculate total amount
  this.totalAmount = this.subtotal - this.discountAmount + this.taxAmount;
  
  next();
});

// Static method to generate invoice number
InvoiceSchema.statics.generateInvoiceNumber = function(type: 'devis' | 'facture') {
  const prefix = type === 'devis' ? 'DEV' : 'FAC';
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const time = String(date.getTime()).slice(-4);
  return `${prefix}-${year}${month}${day}-${time}`;
};

// Instance method to mark as paid (for factures)
InvoiceSchema.methods.markAsPaid = function() {
  if (this.type === 'facture') {
    this.status = 'paid';
    return this.save();
  }
  throw new Error('Only factures can be marked as paid');
};

// Instance method to convert devis to facture
InvoiceSchema.methods.convertToFacture = function() {
  if (this.type === 'devis') {
    const newInvoiceNumber = (this.constructor as any).generateInvoiceNumber('facture');
    
    // Create a new facture based on this devis
    const factureData = {
      ...this.toObject(),
      _id: undefined,
      type: 'facture',
      invoiceNumber: newInvoiceNumber,
      status: 'draft',
      createdAt: undefined,
      updatedAt: undefined,
    };
    
    return new (this.constructor as any)(factureData);
  }
  throw new Error('Only devis can be converted to facture');
};

export const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);