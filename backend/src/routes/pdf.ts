import express from 'express';
import { PDFService } from '../services/pdfService';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Define Language type locally
type Language = 'en' | 'fr' | 'ar';

// Type guard function
function isValidLanguage(lang: string): lang is Language {
  return ['en', 'fr', 'ar'].includes(lang);
}

// @route   GET /api/pdf/salary-slip/:salaryId?lang=en
// @desc    Generate individual salary slip PDF
// @access  Private
router.get('/salary-slip/:salaryId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { salaryId } = req.params;
    const language = (req.query.lang as string) || 'en';
    console.log(`📄 Generating PDF for salary ID: ${salaryId} in language: ${language}`);
    console.log(`👤 User: ${req.user?.name} (${req.user?.role})`);

    if (!salaryId) {
      return res.status(400).json({
        success: false,
        message: 'Salary ID is required'
      });
    }

    // Validate language
    if (!isValidLanguage(language)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid language. Supported languages: en, fr, ar'
      });
    }

    // Generate PDF (note: language parameter is not used in current implementation)
    const pdfBuffer = await PDFService.generateIndividualSalarySlipPDF(salaryId);
    console.log(`✅ PDF generated successfully, size: ${pdfBuffer.length} bytes`);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="salary-slip-${salaryId}-${language}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('❌ Error generating salary slip PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate salary slip PDF',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @route   GET /api/pdf/receipt/:receiptId?lang=en
// @desc    Generate individual receipt PDF
// @access  Private
router.get('/receipt/:receiptId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { receiptId } = req.params;
    const language = (req.query.lang as string) || 'en';
    console.log(`📄 Generating PDF for receipt ID: ${receiptId} in language: ${language}`);
    console.log(`👤 User: ${req.user?.name} (${req.user?.role})`);

    if (!receiptId) {
      return res.status(400).json({
        success: false,
        message: 'Receipt ID is required'
      });
    }

    // Validate language
    if (!isValidLanguage(language)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid language. Supported languages: en, fr, ar'
      });
    }

    // Generate PDF (note: language parameter is not used in current implementation)
    const pdfBuffer = await PDFService.generateIndividualReceiptPDF(receiptId);
    console.log(`✅ PDF generated successfully, size: ${pdfBuffer.length} bytes`);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="receipt-${receiptId}-${language}.pdf"`);
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

// @route   GET /api/pdf/all-salaries?lang=en
// @desc    Generate PDF export of all salaries
// @access  Private/Admin
router.get('/all-salaries', authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const language = (req.query.lang as string) || 'en';
    console.log(`📄 Generating all salaries PDF in language: ${language}`);
    console.log(`👤 Admin: ${req.user?.name}`);

    // Validate language
    if (!isValidLanguage(language)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid language. Supported languages: en, fr, ar'
      });
    }

    // Generate PDF (note: language parameter is not used in current implementation)
    const pdfBuffer = await PDFService.generateAllSalariesPDF();
    console.log(`✅ All salaries PDF generated successfully, size: ${pdfBuffer.length} bytes`);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="all-salaries-${new Date().toISOString().split('T')[0]}-${language}.pdf"`);
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

// @route   GET /api/pdf/all-receipts?lang=en
// @desc    Generate PDF export of all receipts
// @access  Private/Admin
router.get('/all-receipts', authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const language = (req.query.lang as string) || 'en';
    console.log(`📄 Generating all receipts PDF in language: ${language}`);
    console.log(`👤 Admin: ${req.user?.name}`);

    // Validate language
    if (!isValidLanguage(language)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid language. Supported languages: en, fr, ar'
      });
    }

    // Generate PDF (note: language parameter is not used in current implementation)
    const pdfBuffer = await PDFService.generateAllReceiptsPDF();
    console.log(`✅ All receipts PDF generated successfully, size: ${pdfBuffer.length} bytes`);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="all-receipts-${new Date().toISOString().split('T')[0]}-${language}.pdf"`);
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