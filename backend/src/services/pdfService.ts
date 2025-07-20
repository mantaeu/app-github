import PDFDocument from 'pdfkit';
import { User } from '../models/User';
import { Salary } from '../models/Salary';
import { Attendance } from '../models/Attendance';
import { Receipt } from '../models/Receipt';

export class PDFService {
  // Individual Salary Slip PDF Generation
  static async generateIndividualSalarySlipPDF(salaryId: string): Promise<Buffer> {
    try {
      // Fetch salary data with user info
      const salary = await Salary.findById(salaryId).populate('userId');
      if (!salary) {
        throw new Error('Salary record not found');
      }

      const user = salary.userId as any;
      return this.createSalarySlipPDF(salary, user);
    } catch (error) {
      throw error;
    }
  }

  // Individual Receipt PDF Generation
  static async generateIndividualReceiptPDF(receiptId: string): Promise<Buffer> {
    try {
      // Fetch receipt data with user info
      const receipt = await Receipt.findById(receiptId).populate('userId');
      if (!receipt) {
        throw new Error('Receipt not found');
      }

      const user = receipt.userId as any;
      return this.createReceiptPDF(receipt, user);
    } catch (error) {
      throw error;
    }
  }

  // Bulk exports (existing functionality)
  static async generateAllSalariesPDF(): Promise<Buffer> {
    try {
      const salaryRecords = await Salary.find({})
        .populate('userId', 'name email position')
        .sort({ year: -1, month: -1 });

      return this.createAllSalariesPDF(salaryRecords);
    } catch (error) {
      throw error;
    }
  }

  static async generateAllReceiptsPDF(): Promise<Buffer> {
    try {
      const receipts = await Receipt.find({})
        .populate('userId', 'name email')
        .sort({ date: -1 });

      return this.createAllReceiptsPDF(receipts);
    } catch (error) {
      throw error;
    }
  }

  // Create individual salary slip PDF using PDFKit
  private static createSalarySlipPDF(salary: any, user: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          margin: 50,
          size: 'A4',
          info: {
            Title: `Salary Slip - ${user.name} - ${salary.month} ${salary.year}`,
            Author: 'Mantaevert HR System',
            Subject: 'Employee Salary Slip',
            Creator: 'Mantaevert'
          }
        });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        const pageWidth = doc.page.width - 100;
        const leftMargin = 50;

        // Header with Orange Logo
        doc.fontSize(36).fillColor('#FF6600').font('Helvetica-Bold');
        doc.text('MANTAEVERT', leftMargin, 50);
        
        doc.fontSize(12).fillColor('#000000').font('Helvetica');
        doc.text('Human Resources Management System', leftMargin, 90);
        
        // Document Title
        doc.fontSize(20).fillColor('#000000').font('Helvetica-Bold');
        doc.text('SALARY SLIP', leftMargin, 120);
        
        // Document Info
        doc.fontSize(10).fillColor('#000000').font('Helvetica');
        doc.text(`Period: ${salary.month} ${salary.year}`, pageWidth - 100, 50);
        doc.text(`Slip #: ${salary._id.toString().slice(-8).toUpperCase()}`, pageWidth - 100, 65);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 100, 80);

        let currentY = 160;

        // Employee Information
        doc.fontSize(14).fillColor('#000000').font('Helvetica-Bold');
        doc.text('Employee Information', leftMargin, currentY);
        currentY += 20;

        const empData = [
          ['Employee Name:', user.name || 'N/A'],
          ['Employee ID:', `#${user._id.toString().slice(-8).toUpperCase()}`],
          ['Position:', user.position || 'N/A'],
          ['Department:', 'General'],
          ['Status:', salary.isPaid ? 'PAID ✓' : 'PENDING']
        ];

        empData.forEach(([label, value]) => {
          doc.fontSize(10).fillColor('#000000').font('Helvetica-Bold');
          doc.text(label, leftMargin, currentY, { width: 120 });
          doc.font('Helvetica');
          doc.text(value, leftMargin + 120, currentY);
          currentY += 15;
        });

        currentY += 20;

        // Salary Breakdown Table
        doc.fontSize(14).fillColor('#000000').font('Helvetica-Bold');
        doc.text('Salary Breakdown', leftMargin, currentY);
        currentY += 25;

        // Table Header
        doc.rect(leftMargin, currentY, pageWidth, 25).fill('#FF6600');
        doc.fontSize(11).fillColor('#FFFFFF').font('Helvetica-Bold');
        doc.text('Description', leftMargin + 10, currentY + 8);
        doc.text('Amount (DH)', leftMargin + 250, currentY + 8);
        doc.text('Type', leftMargin + 400, currentY + 8);
        currentY += 25;

        // Table Rows
        const salaryData = [
          ['Base Salary', (salary.baseSalary || 0).toFixed(2), 'Earning'],
          ['Overtime Pay', (salary.overtime || 0).toFixed(2), 'Earning'],
          ['Bonuses', (salary.bonuses || 0).toFixed(2), 'Earning'],
          ['Deductions', (salary.deductions || 0).toFixed(2), 'Deduction']
        ];

        salaryData.forEach(([desc, amount, type], index) => {
          const bgColor = index % 2 === 0 ? '#F8F9FA' : '#FFFFFF';
          doc.rect(leftMargin, currentY, pageWidth, 20).fill(bgColor).stroke('#E0E0E0');
          
          doc.fontSize(10).fillColor('#000000').font('Helvetica');
          doc.text(desc, leftMargin + 10, currentY + 6);
          doc.text(`${amount} DH`, leftMargin + 250, currentY + 6);
          doc.text(type, leftMargin + 400, currentY + 6);
          currentY += 20;
        });

        // Total Section
        currentY += 10;
        doc.rect(leftMargin, currentY, pageWidth, 30).fill('#FF6600');
        doc.fontSize(14).fillColor('#FFFFFF').font('Helvetica-Bold');
        doc.text('NET SALARY:', leftMargin + 10, currentY + 8);
        doc.text(`${(salary.totalSalary || 0).toFixed(2)} DH`, leftMargin + 250, currentY + 8);
        currentY += 50;

        // Attendance Summary (if available)
        if (salary.presentDays !== undefined) {
          doc.fontSize(14).fillColor('#000000').font('Helvetica-Bold');
          doc.text('Attendance Summary', leftMargin, currentY);
          currentY += 25;

          // Attendance Table Header
          doc.rect(leftMargin, currentY, pageWidth, 25).fill('#FF6600');
          doc.fontSize(11).fillColor('#FFFFFF').font('Helvetica-Bold');
          doc.text('Metric', leftMargin + 10, currentY + 8);
          doc.text('Count', leftMargin + 200, currentY + 8);
          doc.text('Details', leftMargin + 300, currentY + 8);
          currentY += 25;

          const attData = [
            ['Working Days', salary.totalWorkingDays || 0, 'Total days'],
            ['Present Days', salary.presentDays || 0, 'Days attended'],
            ['Absent Days', salary.absentDays || 0, 'Days missed'],
            ['Hours Worked', `${(salary.totalHoursWorked || 0).toFixed(1)}h`, 'Total hours']
          ];

          attData.forEach(([metric, count, details], index) => {
            const bgColor = index % 2 === 0 ? '#F8F9FA' : '#FFFFFF';
            doc.rect(leftMargin, currentY, pageWidth, 20).fill(bgColor).stroke('#E0E0E0');
            
            doc.fontSize(10).fillColor('#000000').font('Helvetica');
            doc.text(metric, leftMargin + 10, currentY + 6);
            doc.text(count.toString(), leftMargin + 200, currentY + 6);
            doc.text(details, leftMargin + 300, currentY + 6);
            currentY += 20;
          });
          currentY += 20;
        }

        // Signatures
        doc.fontSize(12).fillColor('#000000').font('Helvetica-Bold');
        doc.text('Authorized Signatures', leftMargin, currentY);
        currentY += 30;

        // HR Signature
        doc.fontSize(10).fillColor('#000000').font('Helvetica');
        doc.text('HR Department', leftMargin, currentY);
        doc.moveTo(leftMargin, currentY + 30).lineTo(leftMargin + 150, currentY + 30).stroke('#000000');
        doc.text('Signature & Date', leftMargin, currentY + 35);

        // Employee Signature
        doc.text('Employee', leftMargin + 300, currentY);
        doc.moveTo(leftMargin + 300, currentY + 30).lineTo(leftMargin + 450, currentY + 30).stroke('#000000');
        doc.text(`${user.name}`, leftMargin + 300, currentY + 35);

        // Footer
        currentY += 80;
        doc.fontSize(8).fillColor('#666666').font('Helvetica');
        doc.text('This is a computer-generated document. For queries, contact HR at hr@mantaevert.com', leftMargin, currentY);
        doc.text(`Generated on ${new Date().toLocaleString()}`, leftMargin, currentY + 12);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Create individual receipt PDF using PDFKit
  private static createReceiptPDF(receipt: any, user: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          margin: 50,
          size: 'A4',
          info: {
            Title: `Receipt - ${user.name} - ${receipt._id.toString().slice(-8).toUpperCase()}`,
            Author: 'Mantaevert HR System',
            Subject: 'Payment Receipt',
            Creator: 'Mantaevert'
          }
        });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        const pageWidth = doc.page.width - 100;
        const leftMargin = 50;

        // Header with Orange Logo
        doc.fontSize(36).fillColor('#FF6600').font('Helvetica-Bold');
        doc.text('MANTAEVERT', leftMargin, 50);
        
        doc.fontSize(12).fillColor('#000000').font('Helvetica');
        doc.text('Human Resources Management System', leftMargin, 90);
        
        // Document Title
        doc.fontSize(20).fillColor('#000000').font('Helvetica-Bold');
        doc.text('PAYMENT RECEIPT', leftMargin, 120);
        
        // Document Info
        doc.fontSize(10).fillColor('#000000').font('Helvetica');
        doc.text(`Receipt #: ${receipt._id.toString().slice(-8).toUpperCase()}`, pageWidth - 100, 50);
        doc.text(`Date: ${new Date(receipt.date).toLocaleDateString()}`, pageWidth - 100, 65);
        doc.text(`Time: ${new Date(receipt.date).toLocaleTimeString()}`, pageWidth - 100, 80);

        let currentY = 160;

        // Recipient Information
        doc.fontSize(14).fillColor('#000000').font('Helvetica-Bold');
        doc.text('Recipient Information', leftMargin, currentY);
        currentY += 20;

        const recipientData = [
          ['Recipient Name:', user.name || 'N/A'],
          ['Employee ID:', `#${user._id.toString().slice(-8).toUpperCase()}`],
          ['Email:', user.email || 'N/A'],
          ['Receipt Type:', receipt.type.charAt(0).toUpperCase() + receipt.type.slice(1)]
        ];

        recipientData.forEach(([label, value]) => {
          doc.fontSize(10).fillColor('#000000').font('Helvetica-Bold');
          doc.text(label, leftMargin, currentY, { width: 120 });
          doc.font('Helvetica');
          doc.text(value, leftMargin + 120, currentY);
          currentY += 15;
        });

        currentY += 30;

        // Amount Section
        doc.rect(leftMargin, currentY, pageWidth, 50).fill('#FF6600');
        doc.fontSize(16).fillColor('#FFFFFF').font('Helvetica-Bold');
        doc.text('TOTAL AMOUNT:', leftMargin + 20, currentY + 10);
        doc.fontSize(24);
        doc.text(`${(receipt.amount || 0).toFixed(2)} DH`, leftMargin + 20, currentY + 25);
        currentY += 70;

        // Payment Details
        doc.fontSize(14).fillColor('#000000').font('Helvetica-Bold');
        doc.text('Payment Details', leftMargin, currentY);
        currentY += 25;

        // Payment Details Table
        doc.rect(leftMargin, currentY, pageWidth, 25).fill('#FF6600');
        doc.fontSize(11).fillColor('#FFFFFF').font('Helvetica-Bold');
        doc.text('Description', leftMargin + 10, currentY + 8);
        doc.text('Information', leftMargin + 250, currentY + 8);
        currentY += 25;

        const paymentData = [
          ['Payment Method', 'Company Transfer'],
          ['Transaction ID', receipt._id.toString().slice(-12).toUpperCase()],
          ['Processing Date', new Date(receipt.date).toLocaleDateString()],
          ['Status', 'COMPLETED ✓']
        ];

        paymentData.forEach(([desc, info], index) => {
          const bgColor = index % 2 === 0 ? '#F8F9FA' : '#FFFFFF';
          doc.rect(leftMargin, currentY, pageWidth, 20).fill(bgColor).stroke('#E0E0E0');
          
          doc.fontSize(10).fillColor('#000000').font('Helvetica');
          doc.text(desc, leftMargin + 10, currentY + 6);
          doc.text(info, leftMargin + 250, currentY + 6);
          currentY += 20;
        });

        currentY += 20;

        // Description Section
        doc.fontSize(14).fillColor('#000000').font('Helvetica-Bold');
        doc.text('Description', leftMargin, currentY);
        currentY += 20;

        doc.rect(leftMargin, currentY, pageWidth, 40).fill('#F8F9FA').stroke('#E0E0E0');
        doc.fontSize(10).fillColor('#000000').font('Helvetica');
        doc.text(receipt.description || 'No description provided', leftMargin + 10, currentY + 10, {
          width: pageWidth - 20,
          align: 'left'
        });
        currentY += 60;

        // Signatures
        doc.fontSize(12).fillColor('#000000').font('Helvetica-Bold');
        doc.text('Authorized Signatures', leftMargin, currentY);
        currentY += 30;

        // HR Signature
        doc.fontSize(10).fillColor('#000000').font('Helvetica');
        doc.text('HR Department', leftMargin, currentY);
        doc.moveTo(leftMargin, currentY + 30).lineTo(leftMargin + 150, currentY + 30).stroke('#000000');
        doc.text('Signature & Date', leftMargin, currentY + 35);

        // Recipient Signature
        doc.text('Recipient', leftMargin + 300, currentY);
        doc.moveTo(leftMargin + 300, currentY + 30).lineTo(leftMargin + 450, currentY + 30).stroke('#000000');
        doc.text(`${user.name}`, leftMargin + 300, currentY + 35);

        // Footer
        currentY += 80;
        doc.fontSize(8).fillColor('#666666').font('Helvetica');
        doc.text('This is a computer-generated receipt. Keep this document for your records.', leftMargin, currentY);
        doc.text(`Generated on ${new Date().toLocaleString()}`, leftMargin, currentY + 12);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Create all salaries PDF
  private static createAllSalariesPDF(salaryRecords: any[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Header with Orange Logo
        doc.fontSize(36).fillColor('#FF6600').font('Helvetica-Bold');
        doc.text('MANTAEVERT', 50, 50);
        
        doc.fontSize(18).fillColor('#000000').font('Helvetica-Bold');
        doc.text('All Salaries Report', 50, 100);
        
        doc.fontSize(12).fillColor('#000000').font('Helvetica');
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 50, 125);

        let yPos = 160;
        salaryRecords.forEach((salary, index) => {
          if (yPos > 700) {
            doc.addPage();
            yPos = 50;
          }

          const user = salary.userId as any;
          doc.fontSize(12).fillColor('#FF6600').font('Helvetica-Bold');
          doc.text(`${index + 1}. ${user.name}`, 50, yPos);
          yPos += 15;
          doc.fontSize(10).fillColor('#000000').font('Helvetica');
          doc.text(`${salary.month} ${salary.year} - Total: ${salary.totalSalary?.toFixed(2) || '0.00'} DH`, 70, yPos);
          yPos += 25;
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Create all receipts PDF
  private static createAllReceiptsPDF(receipts: any[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Header with Orange Logo
        doc.fontSize(36).fillColor('#FF6600').font('Helvetica-Bold');
        doc.text('MANTAEVERT', 50, 50);
        
        doc.fontSize(18).fillColor('#000000').font('Helvetica-Bold');
        doc.text('All Receipts Report', 50, 100);
        
        doc.fontSize(12).fillColor('#000000').font('Helvetica');
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 50, 125);

        let yPos = 160;
        receipts.forEach((receipt, index) => {
          if (yPos > 700) {
            doc.addPage();
            yPos = 50;
          }

          const user = receipt.userId as any;
          doc.fontSize(12).fillColor('#FF6600').font('Helvetica-Bold');
          doc.text(`${index + 1}. ${user.name}`, 50, yPos);
          yPos += 15;
          doc.fontSize(10).fillColor('#000000').font('Helvetica');
          doc.text(`${receipt.type} - ${receipt.amount?.toFixed(2) || '0.00'} DH - ${new Date(receipt.date).toLocaleDateString()}`, 70, yPos);
          yPos += 25;
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}