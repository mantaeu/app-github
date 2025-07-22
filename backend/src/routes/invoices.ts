import express from 'express';
import { Invoice } from '../models/Invoice';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all invoices/quotes
router.get('/', authenticate, authorize('admin'), async (req: AuthRequest, res) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;
    
    const filter: any = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const invoices = await Invoice.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Invoice.countDocuments(filter);

    res.json({
      success: true,
      data: {
        invoices,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoices'
    });
  }
});

// Get single invoice/quote
router.get('/:id', authenticate, authorize('admin'), async (req: AuthRequest, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoice'
    });
  }
});

// Create new invoice/quote
router.post('/', authenticate, authorize('admin'), async (req: AuthRequest, res) => {
  try {
    const {
      type,
      clientName,
      clientEmail,
      clientPhone,
      clientAddress,
      items,
      taxRate = 20,
      dueDate,
      notes
    } = req.body;

    // Validate required fields
    if (!type || !clientName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type, clientName, and items'
      });
    }

    // Calculate totals
    let subtotal = 0;
    const processedItems = items.map((item: any) => {
      const total = item.quantity * item.unitPrice;
      subtotal += total;
      return {
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total
      };
    });

    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    const invoice = new Invoice({
      type,
      clientName,
      clientEmail,
      clientPhone,
      clientAddress,
      items: processedItems,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      notes,
      createdBy: req.user?._id
    });

    await invoice.save();
    await invoice.populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create invoice'
    });
  }
});

// Update invoice/quote
router.put('/:id', authenticate, authorize('admin'), async (req: AuthRequest, res) => {
  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      clientAddress,
      items,
      taxRate,
      status,
      dueDate,
      notes
    } = req.body;

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    // Update fields
    if (clientName) invoice.clientName = clientName;
    if (clientEmail !== undefined) invoice.clientEmail = clientEmail;
    if (clientPhone !== undefined) invoice.clientPhone = clientPhone;
    if (clientAddress !== undefined) invoice.clientAddress = clientAddress;
    if (status) invoice.status = status;
    if (dueDate !== undefined) invoice.dueDate = dueDate ? new Date(dueDate) : undefined;
    if (notes !== undefined) invoice.notes = notes;

    // Recalculate if items changed
    if (items && Array.isArray(items)) {
      let subtotal = 0;
      const processedItems = items.map((item: any) => {
        const total = item.quantity * item.unitPrice;
        subtotal += total;
        return {
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total
        };
      });

      const currentTaxRate = taxRate || invoice.taxRate;
      const taxAmount = (subtotal * currentTaxRate) / 100;
      const totalAmount = subtotal + taxAmount;

      invoice.items = processedItems;
      invoice.subtotal = subtotal;
      invoice.taxRate = currentTaxRate;
      invoice.taxAmount = taxAmount;
      invoice.totalAmount = totalAmount;
    }

    await invoice.save();
    await invoice.populate('createdBy', 'name');

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update invoice'
    });
  }
});

// Delete invoice/quote
router.delete('/:id', authenticate, authorize('admin'), async (req: AuthRequest, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete invoice'
    });
  }
});

export default router;