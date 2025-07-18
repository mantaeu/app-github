const { PDFService } = require('./dist/services/pdfService');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

// Import models to register schemas
require('./dist/models/User');
require('./dist/models/Salary');
require('./dist/models/Receipt');
require('./dist/models/Attendance');

dotenv.config();

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get a salary record to test with
    const { Salary } = require('./dist/models/Salary');
    const salaryRecord = await Salary.findOne().populate('userId');
    
    if (salaryRecord) {
      console.log('📄 Generating Individual Salary Slip PDF...');
      const salaryPdf = await PDFService.generateIndividualSalarySlipPDF(salaryRecord._id.toString());
      fs.writeFileSync('test-individual-salary.pdf', salaryPdf);
      console.log('✅ Individual Salary PDF generated successfully!');
    } else {
      console.log('⚠️ No salary records found');
    }
    
    // Get a receipt record to test with
    const { Receipt } = require('./dist/models/Receipt');
    const receiptRecord = await Receipt.findOne().populate('userId');
    
    if (receiptRecord) {
      console.log('📄 Generating Individual Receipt PDF...');
      const receiptPdf = await PDFService.generateIndividualReceiptPDF(receiptRecord._id.toString());
      fs.writeFileSync('test-individual-receipt.pdf', receiptPdf);
      console.log('✅ Individual Receipt PDF generated successfully!');
    } else {
      console.log('⚠️ No receipt records found');
    }
    
    await PDFService.closeBrowser();
    await mongoose.disconnect();
    console.log('🎉 All tests completed!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

test();