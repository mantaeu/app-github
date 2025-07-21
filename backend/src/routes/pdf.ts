import express from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { PDFService } from '../services/pdfService';

const router = express.Router();

// @route   GET /api/pdf/salary-slip/:salaryId
// @desc    Generate and download individual salary slip PDF
// @access  Private
router.get('/salary-slip/:salaryId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { salaryId } = req.params;
    const { lang = 'en' } = req.query;
    const language = lang as string;

    console.log(`🔍 Generating salary slip PDF for salary ID: ${salaryId}, language: ${language}`);

    // Users can only view their own salary slips unless they're admin
    if (req.user?.role !== 'admin') {
      // TODO: Add check to ensure user can only access their own salary slip
      // const salary = await Salary.findById(salaryId);
      // if (salary?.userId.toString() !== req.user._id.toString()) {
      //   return res.status(403).json({
      //     success: false,
      //     message: 'Access denied',
      //   });
      // }
    }

    // Generate PDF with language support
    const pdfBuffer = await PDFService.generateIndividualSalarySlipPDF(salaryId, language);
    console.log(`✅ PDF generated successfully, size: ${pdfBuffer.length} bytes`);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="salary-slip-${salaryId}-${language}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('❌ Error generating salary slip PDF:', error);
    next(error);
  }
});

// @route   GET /api/pdf/receipt/:receiptId
// @desc    Generate and download individual receipt PDF
// @access  Private
router.get('/receipt/:receiptId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { receiptId } = req.params;
    const { lang = 'en' } = req.query;
    const language = lang as string;

    console.log(`🔍 Generating receipt PDF for receipt ID: ${receiptId}, language: ${language}`);

    // Users can only view their own receipts unless they're admin
    if (req.user?.role !== 'admin') {
      // TODO: Add check to ensure user can only access their own receipt
      // const receipt = await Receipt.findById(receiptId);
      // if (receipt?.userId.toString() !== req.user._id.toString()) {
      //   return res.status(403).json({
      //     success: false,
      //     message: 'Access denied',
      //   });
      // }
    }

    // Generate PDF with language support
    const pdfBuffer = await PDFService.generateIndividualReceiptPDF(receiptId, language);
    console.log(`✅ PDF generated successfully, size: ${pdfBuffer.length} bytes`);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="receipt-${receiptId}-${language}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('❌ Error generating receipt PDF:', error);
    next(error);
  }
});

// @route   GET /api/pdf/all-salaries
// @desc    Generate and download all salaries PDF (Admin only)
// @access  Private/Admin
router.get('/all-salaries', authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { lang = 'en' } = req.query;
    const language = lang as string;

    console.log(`🔍 Generating all salaries PDF, language: ${language}`);

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    // Generate PDF with language support
    const pdfBuffer = await PDFService.generateAllSalariesPDF(language);
    console.log(`✅ All salaries PDF generated successfully, size: ${pdfBuffer.length} bytes`);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="all-salaries-${new Date().toISOString().split('T')[0]}-${language}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('❌ Error generating all salaries PDF:', error);
    next(error);
  }
});

// @route   GET /api/pdf/all-receipts
// @desc    Generate and download all receipts PDF (Admin only)
// @access  Private/Admin
router.get('/all-receipts', authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { lang = 'en' } = req.query;
    const language = lang as string;

    console.log(`🔍 Generating all receipts PDF, language: ${language}`);

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    // Generate PDF with language support
    const pdfBuffer = await PDFService.generateAllReceiptsPDF(language);
    console.log(`✅ All receipts PDF generated successfully, size: ${pdfBuffer.length} bytes`);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="all-receipts-${new Date().toISOString().split('T')[0]}-${language}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('❌ Error generating all receipts PDF:', error);
    next(error);
  }
});

export default router;