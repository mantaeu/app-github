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

async function testEndpoint() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get a salary record to test with
    const { Salary } = require('./dist/models/Salary');
    const salaryRecord = await Salary.findOne().populate('userId');
    
    if (salaryRecord) {
      console.log(`📄 Testing PDF generation for salary ID: ${salaryRecord._id}`);
      console.log(`📄 Employee: ${salaryRecord.userId.name}`);
      console.log(`📄 Period: ${salaryRecord.month} ${salaryRecord.year}`);
      
      const salaryPdf = await PDFService.generateIndividualSalarySlipPDF(salaryRecord._id.toString());
      fs.writeFileSync('test-endpoint-salary.pdf', salaryPdf);
      console.log('✅ PDF generated successfully!');
      console.log(`📄 PDF size: ${salaryPdf.length} bytes`);
      
      // Test the API endpoint URL
      console.log(`🔗 API endpoint would be: http://localhost:5501/api/pdf/salary-slip/${salaryRecord._id}`);
    } else {
      console.log('⚠️ No salary records found');
    }
    
    await PDFService.closeBrowser();
    await mongoose.disconnect();
    console.log('🎉 Test completed!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testEndpoint();