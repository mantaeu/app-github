import express from 'express';
import { PDFService } from '../services/pdfService';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/pdf/salary-slip/:salaryId
// @desc    Generate individual salary slip PDF
// @access  Private
router.get('/salary-slip/:salaryId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { salaryId } = req.params;
    console.log(`📄 Generating PDF for salary ID: ${salaryId}`);
    console.log(`👤 User: ${req.user?.name} (${req.user?.role})`);

    if (!salaryId) {
      return res.status(400).json({
        success: false,
        message: 'Salary ID is required'
      });
    }

    // Generate PDF
    const pdfBuffer = await PDFService.generateIndividualSalarySlipPDF(salaryId);
    console.log(`✅ PDF generated successfully, size: ${pdfBuffer.length} bytes`);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="salary-slip-${salaryId}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('��� Error generating salary slip PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate salary slip PDF',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @route   GET /api/pdf/receipt/:receiptId
// @desc    Generate individual receipt PDF
// @access  Private
router.get('/receipt/:receiptId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { receiptId } = req.params;
    console.log(`📄 Generating PDF for receipt ID: ${receiptId}`);
    console.log(`👤 User: ${req.user?.name} (${req.user?.role})`);

    if (!receiptId) {
      return res.status(400).json({
        success: false,
        message: 'Receipt ID is required'
      });
    }

    // Generate PDF
    const pdfBuffer = await PDFService.generateIndividualReceiptPDF(receiptId);
    console.log(`✅ PDF generated successfully, size: ${pdfBuffer.length} bytes`);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="receipt-${receiptId}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('❌ Error generating receipt PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate receipt PDF',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @route   GET /api/pdf/all-salaries
// @desc    Generate PDF export of all salaries
// @access  Private/Admin
router.get('/all-salaries', authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    console.log(`📄 Generating all salaries PDF`);
    console.log(`👤 Admin: ${req.user?.name}`);

    // Generate PDF
    const pdfBuffer = await PDFService.generateAllSalariesPDF();
    console.log(`✅ All salaries PDF generated successfully, size: ${pdfBuffer.length} bytes`);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="all-salaries-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('❌ Error generating all salaries PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate all salaries PDF',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @route   GET /api/pdf/all-receipts
// @desc    Generate PDF export of all receipts
// @access  Private/Admin
router.get('/all-receipts', authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    console.log(`📄 Generating all receipts PDF`);
    console.log(`👤 Admin: ${req.user?.name}`);

    // Generate PDF
    const pdfBuffer = await PDFService.generateAllReceiptsPDF();
    console.log(`✅ All receipts PDF generated successfully, size: ${pdfBuffer.length} bytes`);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="all-receipts-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('❌ Error generating all receipts PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate all receipts PDF',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;