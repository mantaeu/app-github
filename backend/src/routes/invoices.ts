import express from 'express';
import { Invoice, IInvoice, IInvoiceItem } from '../models/Invoice';
import { auth } from '../middleware/auth';
import { adminAuth } from '../middleware/adminAuth';

const router = express.Router();

// Get all invoices (admin only)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      status,
      clientName,
      startDate,
      endDate,
    } = req.query;

    // Build filter object
    const filter: any = {};
    
    if (type && (type === 'devis' || type === 'facture')) {
      filter.type = type;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (clientName) {
      filter.clientName = { $regex: clientName, $options: 'i' };
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate as string);
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Invoice.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        invoices,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoices',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get invoice by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    // Check if user has permission to view this invoice
    const user = req.user as any;
    if (user.role !== 'admin' && invoice.createdBy._id.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoice',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Create new invoice
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const {
      type,
      clientName,
      clientEmail,
      clientAddress,
      items,
      taxRate = 20,
      discount = 0,
      notes,
      dueDate,
    } = req.body;

    // Validate required fields
    if (!type || !clientName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: type, clientName, and items are required',
      });
    }

    // Validate type
    if (type !== 'devis' && type !== 'facture') {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "devis" or "facture"',
      });
    }

    // Validate and process items
    const processedItems: IInvoiceItem[] = items.map((item: any) => {
      if (!item.description || typeof item.quantity !== 'number' || typeof item.unitPrice !== 'number') {
        throw new Error('Each item must have description, quantity, and unitPrice');
      }
      
      return {
        description: item.description.trim(),
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.quantity) * Number(item.unitPrice),
      };
    });

    // Generate invoice number
    const invoiceNumber = (Invoice as any).generateInvoiceNumber(type);

    // Create invoice
    const invoice = new Invoice({
      type,
      invoiceNumber,
      clientName: clientName.trim(),
      clientEmail: clientEmail?.trim(),
      clientAddress: clientAddress?.trim(),
      items: processedItems,
      taxRate: Number(taxRate),
      discount: Number(discount),
      notes: notes?.trim(),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      createdBy: (req.user as any)._id,
    });

    await invoice.save();

    // Populate the created invoice
    await invoice.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: invoice,
      message: `${type === 'devis' ? 'Devis' : 'Facture'} created successfully`,
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating invoice',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Update invoice
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const {
      clientName,
      clientEmail,
      clientAddress,
      items,
      taxRate,
      discount,
      notes,
      dueDate,
      status,
    } = req.body;

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    // Update fields if provided
    if (clientName) invoice.clientName = clientName.trim();
    if (clientEmail !== undefined) invoice.clientEmail = clientEmail?.trim();
    if (clientAddress !== undefined) invoice.clientAddress = clientAddress?.trim();
    if (notes !== undefined) invoice.notes = notes?.trim();
    if (dueDate !== undefined) invoice.dueDate = dueDate ? new Date(dueDate) : undefined;
    if (status) invoice.status = status;
    if (typeof taxRate === 'number') invoice.taxRate = taxRate;
    if (typeof discount === 'number') invoice.discount = discount;

    // Update items if provided
    if (items && Array.isArray(items)) {
      const processedItems: IInvoiceItem[] = items.map((item: any) => {
        if (!item.description || typeof item.quantity !== 'number' || typeof item.unitPrice !== 'number') {
          throw new Error('Each item must have description, quantity, and unitPrice');
        }
        
        return {
          description: item.description.trim(),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          total: Number(item.quantity) * Number(item.unitPrice),
        };
      });
      
      invoice.items = processedItems;
    }

    await invoice.save();
    await invoice.populate('createdBy', 'name email');

    res.json({
      success: true,
      data: invoice,
      message: 'Invoice updated successfully',
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating invoice',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Delete invoice
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    await Invoice.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting invoice',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Mark facture as paid
router.patch('/:id/mark-paid', auth, adminAuth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    if (invoice.type !== 'facture') {
      return res.status(400).json({
        success: false,
        message: 'Only factures can be marked as paid',
      });
    }

    await invoice.markAsPaid();
    await invoice.populate('createdBy', 'name email');

    res.json({
      success: true,
      data: invoice,
      message: 'Facture marked as paid successfully',
    });
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking invoice as paid',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Convert devis to facture
router.post('/:id/convert-to-facture', auth, adminAuth, async (req, res) => {
  try {
    const devis = await Invoice.findById(req.params.id);

    if (!devis) {
      return res.status(404).json({
        success: false,
        message: 'Devis not found',
      });
    }

    if (devis.type !== 'devis') {
      return res.status(400).json({
        success: false,
        message: 'Only devis can be converted to facture',
      });
    }

    const facture = devis.convertToFacture();
    await facture.save();
    await facture.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: facture,
      message: 'Devis converted to facture successfully',
    });
  } catch (error) {
    console.error('Error converting devis to facture:', error);
    res.status(500).json({
      success: false,
      message: 'Error converting devis to facture',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get invoice statistics
router.get('/stats/overview', auth, adminAuth, async (req, res) => {
  try {
    const [
      totalDevis,
      totalFactures,
      paidFactures,
      pendingFactures,
      totalRevenue,
      thisMonthRevenue,
    ] = await Promise.all([
      Invoice.countDocuments({ type: 'devis' }),
      Invoice.countDocuments({ type: 'facture' }),
      Invoice.countDocuments({ type: 'facture', status: 'paid' }),
      Invoice.countDocuments({ type: 'facture', status: { $in: ['draft', 'sent'] } }),
      Invoice.aggregate([
        { $match: { type: 'facture', status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Invoice.aggregate([
        {
          $match: {
            type: 'facture',
            status: 'paid',
            createdAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalDevis,
        totalFactures,
        paidFactures,
        pendingFactures,
        totalRevenue: totalRevenue[0]?.total || 0,
        thisMonthRevenue: thisMonthRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching invoice statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoice statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;