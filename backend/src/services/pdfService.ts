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

  // Helper method to draw company header with orange logo
  private static drawCompanyHeader(doc: any, pageWidth: number, leftMargin: number) {
    // White background for entire header
    doc.rect(leftMargin, 40, pageWidth, 120).fill('#FFFFFF').stroke('#E5E5E5');
    
    // Orange logo area (circle with company initial)
    doc.circle(leftMargin + 60, 80, 30).fill('#FF6600').stroke('#E5E5E5');
    doc.fontSize(24).fillColor('#FFFFFF').font('Helvetica-Bold');
    doc.text('M', leftMargin + 52, 70);
    
    // Company name in black
    doc.fontSize(28).fillColor('#000000').font('Helvetica-Bold');
    doc.text('MANTAEVERT', leftMargin + 110, 60);
    
    // Subtitle in dark gray
    doc.fontSize(12).fillColor('#333333').font('Helvetica');
    doc.text('Human Resources Management System', leftMargin + 110, 90);
    doc.text('📧 hr@mantaevert.com | 📞 +212 (555) 123-4567', leftMargin + 110, 105);
    doc.text('🌐 www.mantaevert.com | 📍 Casablanca, Morocco', leftMargin + 110, 120);
    
    // Orange accent line
    doc.rect(leftMargin, 160, pageWidth, 3).fill('#FF6600');
  }

  // Helper method to draw professional table with white background and black text
  private static drawTable(doc: any, startX: number, startY: number, width: number, headers: string[], rows: any[][], options: any = {}) {
    const cellPadding = options.cellPadding || 10;
    const headerHeight = options.headerHeight || 30;
    const rowHeight = options.rowHeight || 25;
    const headerColor = options.headerColor || '#FF6600';
    const headerTextColor = options.headerTextColor || '#FFFFFF';
    const borderColor = options.borderColor || '#CCCCCC';
    const alternateRowColor = options.alternateRowColor || '#F9F9F9';
    
    const colWidth = width / headers.length;
    let currentY = startY;

    // Draw header with orange background
    doc.rect(startX, currentY, width, headerHeight).fill(headerColor).stroke(borderColor);
    doc.fontSize(11).fillColor(headerTextColor).font('Helvetica-Bold');
    
    headers.forEach((header, i) => {
      doc.text(header, startX + (i * colWidth) + cellPadding, currentY + (headerHeight / 2) - 6, {
        width: colWidth - (cellPadding * 2),
        align: 'left'
      });
    });

    currentY += headerHeight;

    // Draw rows with white/light gray alternating background
    rows.forEach((row, rowIndex) => {
      const rowColor = rowIndex % 2 === 0 ? '#FFFFFF' : alternateRowColor;
      doc.rect(startX, currentY, width, rowHeight).fill(rowColor).stroke(borderColor);

      doc.fontSize(10).fillColor('#000000').font('Helvetica');
      
      row.forEach((cell, cellIndex) => {
        const cellX = startX + (cellIndex * colWidth) + cellPadding;
        const cellY = currentY + (rowHeight / 2) - 5;
        
        if (typeof cell === 'object' && cell.color) {
          doc.fillColor(cell.color);
          doc.text(cell.text, cellX, cellY, {
            width: colWidth - (cellPadding * 2),
            align: cell.align || 'left'
          });
        } else {
          doc.fillColor('#000000');
          doc.text(cell.toString(), cellX, cellY, {
            width: colWidth - (cellPadding * 2),
            align: 'left'
          });
        }
      });

      currentY += rowHeight;
    });

    return currentY;
  }

  // Helper method to draw signature section
  private static drawSignatureSection(doc: any, currentY: number, pageWidth: number, leftMargin: number, employeeName: string) {
    // Signature section title
    doc.fontSize(16).fillColor('#000000').font('Helvetica-Bold');
    doc.text('AUTHORIZATION & SIGNATURES', leftMargin, currentY);
    
    currentY += 35;
    
    // HR Signature Box
    const boxWidth = (pageWidth / 2) - 15;
    doc.rect(leftMargin, currentY, boxWidth, 100).fill('#FFFFFF').stroke('#CCCCCC');
    
    // HR Title with orange background
    doc.rect(leftMargin, currentY, boxWidth, 25).fill('#FF6600');
    doc.fontSize(12).fillColor('#FFFFFF').font('Helvetica-Bold');
    doc.text('HR DEPARTMENT', leftMargin + 10, currentY + 8);
    
    // HR signature area
    doc.fontSize(10).fillColor('#000000').font('Helvetica');
    doc.text('Authorized by:', leftMargin + 10, currentY + 40);
    
    // Signature line
    doc.moveTo(leftMargin + 10, currentY + 70).lineTo(leftMargin + boxWidth - 10, currentY + 70).stroke('#000000');
    doc.fontSize(9).fillColor('#666666').font('Helvetica');
    doc.text('HR Manager Signature', leftMargin + 10, currentY + 75);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, leftMargin + 10, currentY + 88);

    // Employee Signature Box
    const rightBoxX = leftMargin + boxWidth + 30;
    doc.rect(rightBoxX, currentY, boxWidth, 100).fill('#FFFFFF').stroke('#CCCCCC');
    
    // Employee Title with orange background
    doc.rect(rightBoxX, currentY, boxWidth, 25).fill('#FF6600');
    doc.fontSize(12).fillColor('#FFFFFF').font('Helvetica-Bold');
    doc.text('EMPLOYEE ACKNOWLEDGMENT', rightBoxX + 10, currentY + 8);
    
    // Employee signature area
    doc.fontSize(10).fillColor('#000000').font('Helvetica');
    doc.text('Received by:', rightBoxX + 10, currentY + 40);
    
    // Signature line
    doc.moveTo(rightBoxX + 10, currentY + 70).lineTo(rightBoxX + boxWidth - 10, currentY + 70).stroke('#000000');
    doc.fontSize(9).fillColor('#666666').font('Helvetica');
    doc.text('Employee Signature', rightBoxX + 10, currentY + 75);
    doc.text(`${employeeName}`, rightBoxX + 10, currentY + 88);

    return currentY + 120;
  }

  // Helper method to draw footer
  private static drawFooter(doc: any, currentY: number, pageWidth: number, leftMargin: number, documentType: string) {
    // Orange footer background
    doc.rect(leftMargin, currentY, pageWidth, 50).fill('#FF6600');
    
    doc.fontSize(10).fillColor('#FFFFFF').font('Helvetica');
    doc.text(`This is a computer-generated ${documentType}. No physical signature is required unless specified.`, leftMargin + 15, currentY + 8);
    doc.text('For queries, contact HR at hr@mantaevert.com | Confidential Document', leftMargin + 15, currentY + 22);
    
    doc.fontSize(8).fillColor('#FFE5CC');
    doc.text(`© ${new Date().getFullYear()} Mantaevert. All rights reserved. | Generated on ${new Date().toLocaleString()}`, leftMargin + 15, currentY + 36);
  }

  // Create individual salary slip PDF using PDFKit
  private static createSalarySlipPDF(salary: any, user: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          margin: 40,
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

        // Page dimensions
        const pageWidth = doc.page.width - 80; // Account for margins
        const leftMargin = 40;

        // Company Header with Orange Logo
        this.drawCompanyHeader(doc, pageWidth, leftMargin);

        // Document Title
        let currentY = 180;
        doc.fontSize(24).fillColor('#FF6600').font('Helvetica-Bold');
        doc.text('SALARY SLIP', leftMargin, currentY);
        
        // Document Info Box
        doc.rect(pageWidth - 140, currentY - 5, 140, 60).fill('#FFFFFF').stroke('#FF6600');
        doc.fontSize(10).fillColor('#000000').font('Helvetica');
        doc.text(`Period: ${salary.month} ${salary.year}`, pageWidth - 135, currentY + 5);
        doc.text(`Slip #: ${salary._id.toString().slice(-8).toUpperCase()}`, pageWidth - 135, currentY + 20);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 135, currentY + 35);
        doc.text(`Status: ${salary.isPaid ? 'PAID' : 'PENDING'}`, pageWidth - 135, currentY + 50);

        // Employee Information Table
        currentY = 270;
        doc.fontSize(16).fillColor('#000000').font('Helvetica-Bold');
        doc.text('EMPLOYEE INFORMATION', leftMargin, currentY);
        
        currentY += 25;
        const empHeaders = ['Field', 'Details'];
        const empRows = [
          ['Employee Name', user.name || 'N/A'],
          ['Employee ID', `#${user._id.toString().slice(-8).toUpperCase()}`],
          ['Email Address', user.email || 'N/A'],
          ['Position', user.position || 'N/A'],
          ['Department', user.department || 'General'],
          ['Payment Status', { 
            text: salary.isPaid ? 'PAID ✓' : 'PENDING ⏳', 
            color: salary.isPaid ? '#27AE60' : '#E74C3C',
            align: 'left'
          }]
        ];

        currentY = this.drawTable(doc, leftMargin, currentY, pageWidth, empHeaders, empRows, {
          headerColor: '#FF6600',
          alternateRowColor: '#F9F9F9'
        });

        // Salary Breakdown Table
        currentY += 30;
        doc.fontSize(16).fillColor('#000000').font('Helvetica-Bold');
        doc.text('SALARY BREAKDOWN', leftMargin, currentY);
        
        currentY += 25;
        const salaryHeaders = ['Description', 'Amount (DH)', 'Type'];
        const salaryRows = [
          ['Base Salary', `${(salary.baseSalary || 0).toFixed(2)}`, 'Earning'],
          ['Overtime Pay', `${(salary.overtime || 0).toFixed(2)}`, 'Earning'],
          ['Bonuses & Allowances', `${(salary.bonuses || 0).toFixed(2)}`, 'Earning'],
          ['Deductions', {
            text: `-${(salary.deductions || 0).toFixed(2)}`,
            color: '#E74C3C'
          }, 'Deduction']
        ];

        currentY = this.drawTable(doc, leftMargin, currentY, pageWidth, salaryHeaders, salaryRows, {
          headerColor: '#FF6600',
          alternateRowColor: '#F9F9F9'
        });

        // Net Salary Box with orange background
        currentY += 20;
        doc.rect(leftMargin, currentY, pageWidth, 50).fill('#FF6600').stroke('#E5E5E5');
        doc.fontSize(18).fillColor('#FFFFFF').font('Helvetica-Bold');
        doc.text('NET SALARY', leftMargin + 20, currentY + 15);
        doc.fontSize(24);
        doc.text(`${(salary.totalSalary || 0).toFixed(2)} DH`, pageWidth - 150, currentY + 12);

        // Attendance Summary Table (if available)
        if (salary.presentDays !== undefined) {
          currentY += 80;
          doc.fontSize(16).fillColor('#000000').font('Helvetica-Bold');
          doc.text('ATTENDANCE SUMMARY', leftMargin, currentY);
          
          currentY += 25;
          const attHeaders = ['Metric', 'Count', 'Details'];
          const attRows = [
            ['Total Working Days', `${salary.totalWorkingDays || 0}`, 'Days in pay period'],
            ['Days Present', { 
              text: `${salary.presentDays || 0}`, 
              color: '#27AE60' 
            }, 'Days attended'],
            ['Days Absent', { 
              text: `${salary.absentDays || 0}`, 
              color: '#E74C3C' 
            }, 'Days missed'],
            ['Total Hours Worked', `${(salary.totalHoursWorked || 0).toFixed(1)}h`, 'Productive hours']
          ];

          currentY = this.drawTable(doc, leftMargin, currentY, pageWidth, attHeaders, attRows, {
            headerColor: '#FF6600',
            alternateRowColor: '#F9F9F9'
          });
        }

        // Signature Section
        currentY += 50;
        currentY = this.drawSignatureSection(doc, currentY, pageWidth, leftMargin, user.name);

        // Footer
        currentY += 20;
        this.drawFooter(doc, currentY, pageWidth, leftMargin, 'salary slip');

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
          margin: 40,
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

        // Page dimensions
        const pageWidth = doc.page.width - 80;
        const leftMargin = 40;

        // Company Header with Orange Logo
        this.drawCompanyHeader(doc, pageWidth, leftMargin);

        // Document Title
        let currentY = 180;
        doc.fontSize(24).fillColor('#FF6600').font('Helvetica-Bold');
        doc.text('PAYMENT RECEIPT', leftMargin, currentY);
        
        // Receipt Info Box
        doc.rect(pageWidth - 140, currentY - 5, 140, 75).fill('#FFFFFF').stroke('#FF6600');
        doc.fontSize(10).fillColor('#000000').font('Helvetica');
        doc.text(`Receipt #: ${receipt._id.toString().slice(-8).toUpperCase()}`, pageWidth - 135, currentY + 5);
        doc.text(`Date: ${new Date(receipt.date).toLocaleDateString()}`, pageWidth - 135, currentY + 20);
        doc.text(`Time: ${new Date(receipt.date).toLocaleTimeString()}`, pageWidth - 135, currentY + 35);
        doc.text(`Type: ${receipt.type.toUpperCase()}`, pageWidth - 135, currentY + 50);

        // Recipient Information Table
        currentY = 280;
        doc.fontSize(16).fillColor('#000000').font('Helvetica-Bold');
        doc.text('RECIPIENT INFORMATION', leftMargin, currentY);
        
        currentY += 25;
        const empHeaders = ['Field', 'Details'];
        const empRows = [
          ['Recipient Name', user.name || 'N/A'],
          ['Employee ID', `#${user._id.toString().slice(-8).toUpperCase()}`],
          ['Email Address', user.email || 'N/A'],
          ['Position', user.position || 'N/A'],
          ['Receipt Type', receipt.type.charAt(0).toUpperCase() + receipt.type.slice(1)]
        ];

        currentY = this.drawTable(doc, leftMargin, currentY, pageWidth, empHeaders, empRows, {
          headerColor: '#FF6600',
          alternateRowColor: '#F9F9F9'
        });

        // Amount Section with orange background
        currentY += 30;
        doc.rect(leftMargin, currentY, pageWidth, 70).fill('#FF6600').stroke('#E5E5E5');
        doc.fontSize(18).fillColor('#FFFFFF').font('Helvetica-Bold');
        doc.text('TOTAL AMOUNT', leftMargin + 20, currentY + 15);
        doc.fontSize(32);
        doc.text(`${(receipt.amount || 0).toFixed(2)} DH`, leftMargin + 20, currentY + 40);

        // Payment Details Table
        currentY += 100;
        doc.fontSize(16).fillColor('#000000').font('Helvetica-Bold');
        doc.text('PAYMENT DETAILS', leftMargin, currentY);
        
        currentY += 25;
        const paymentHeaders = ['Description', 'Information'];
        const paymentRows = [
          ['Payment Method', 'Company Transfer'],
          ['Transaction ID', receipt._id.toString().slice(-12).toUpperCase()],
          ['Processing Date', new Date(receipt.date).toLocaleDateString()],
          ['Currency', 'Moroccan Dirham (DH)'],
          ['Status', { text: 'COMPLETED ✓', color: '#27AE60' }]
        ];

        currentY = this.drawTable(doc, leftMargin, currentY, pageWidth, paymentHeaders, paymentRows, {
          headerColor: '#FF6600',
          alternateRowColor: '#F9F9F9'
        });

        // Description Section
        currentY += 30;
        doc.fontSize(16).fillColor('#000000').font('Helvetica-Bold');
        doc.text('DESCRIPTION', leftMargin, currentY);
        
        currentY += 20;
        doc.rect(leftMargin, currentY, pageWidth, 70).fill('#FFFFFF').stroke('#CCCCCC');
        doc.fontSize(11).fillColor('#000000').font('Helvetica');
        doc.text(receipt.description || 'No description provided', leftMargin + 15, currentY + 15, { 
          width: pageWidth - 30,
          align: 'left'
        });

        // Signature Section
        currentY += 100;
        currentY = this.drawSignatureSection(doc, currentY, pageWidth, leftMargin, user.name);

        // Footer
        currentY += 20;
        this.drawFooter(doc, currentY, pageWidth, leftMargin, 'receipt');

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Create all salaries PDF with professional design
  private static createAllSalariesPDF(salaryRecords: any[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          margin: 40,
          size: 'A4',
          info: {
            Title: 'All Salaries Report',
            Author: 'Mantaevert HR System',
            Subject: 'Comprehensive Salary Report',
            Creator: 'Mantaevert'
          }
        });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        const pageWidth = doc.page.width - 80;
        const leftMargin = 40;

        // Company Header
        this.drawCompanyHeader(doc, pageWidth, leftMargin);

        // Report Title
        let currentY = 180;
        doc.fontSize(24).fillColor('#FF6600').font('Helvetica-Bold');
        doc.text('ALL SALARIES REPORT', leftMargin, currentY);
        
        doc.fontSize(12).fillColor('#000000').font('Helvetica');
        doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, leftMargin, currentY + 35);
        doc.text(`Total Records: ${salaryRecords.length}`, leftMargin, currentY + 50);

        // Summary Statistics
        const totalPaid = salaryRecords.reduce((sum, salary) => sum + (salary.totalSalary || 0), 0);
        const paidCount = salaryRecords.filter(salary => salary.isPaid).length;
        const pendingCount = salaryRecords.length - paidCount;

        currentY += 80;
        doc.fontSize(16).fillColor('#000000').font('Helvetica-Bold');
        doc.text('SUMMARY STATISTICS', leftMargin, currentY);

        currentY += 25;
        const summaryHeaders = ['Metric', 'Value'];
        const summaryRows = [
          ['Total Salary Records', salaryRecords.length.toString()],
          ['Total Amount Paid', `${totalPaid.toFixed(2)} DH`],
          ['Paid Salaries', paidCount.toString()],
          ['Pending Salaries', pendingCount.toString()],
          ['Average Salary', `${(totalPaid / salaryRecords.length || 0).toFixed(2)} DH`]
        ];

        currentY = this.drawTable(doc, leftMargin, currentY, pageWidth, summaryHeaders, summaryRows, {
          headerColor: '#FF6600',
          alternateRowColor: '#F9F9F9'
        });

        // Detailed Records
        currentY += 40;
        doc.fontSize(16).fillColor('#000000').font('Helvetica-Bold');
        doc.text('DETAILED SALARY RECORDS', leftMargin, currentY);

        currentY += 25;
        const detailHeaders = ['Employee', 'Period', 'Amount (DH)', 'Status'];
        const detailRows = salaryRecords.map(salary => {
          const user = salary.userId as any;
          return [
            user.name || 'Unknown',
            `${salary.month} ${salary.year}`,
            (salary.totalSalary || 0).toFixed(2),
            {
              text: salary.isPaid ? 'PAID' : 'PENDING',
              color: salary.isPaid ? '#27AE60' : '#E74C3C'
            }
          ];
        });

        this.drawTable(doc, leftMargin, currentY, pageWidth, detailHeaders, detailRows, {
          headerColor: '#FF6600',
          alternateRowColor: '#F9F9F9'
        });

        // Footer
        const footerY = doc.page.height - 90;
        this.drawFooter(doc, footerY, pageWidth, leftMargin, 'salary report');

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Create all receipts PDF with professional design
  private static createAllReceiptsPDF(receipts: any[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          margin: 40,
          size: 'A4',
          info: {
            Title: 'All Receipts Report',
            Author: 'Mantaevert HR System',
            Subject: 'Comprehensive Receipts Report',
            Creator: 'Mantaevert'
          }
        });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        const pageWidth = doc.page.width - 80;
        const leftMargin = 40;

        // Company Header
        this.drawCompanyHeader(doc, pageWidth, leftMargin);

        // Report Title
        let currentY = 180;
        doc.fontSize(24).fillColor('#FF6600').font('Helvetica-Bold');
        doc.text('ALL RECEIPTS REPORT', leftMargin, currentY);
        
        doc.fontSize(12).fillColor('#000000').font('Helvetica');
        doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, leftMargin, currentY + 35);
        doc.text(`Total Records: ${receipts.length}`, leftMargin, currentY + 50);

        // Summary Statistics
        const totalAmount = receipts.reduce((sum, receipt) => sum + (receipt.amount || 0), 0);
        const typeGroups = receipts.reduce((acc, receipt) => {
          acc[receipt.type] = (acc[receipt.type] || 0) + 1;
          return acc;
        }, {} as any);

        currentY += 80;
        doc.fontSize(16).fillColor('#000000').font('Helvetica-Bold');
        doc.text('SUMMARY STATISTICS', leftMargin, currentY);

        currentY += 25;
        const summaryHeaders = ['Metric', 'Value'];
        const summaryRows = [
          ['Total Receipt Records', receipts.length.toString()],
          ['Total Amount', `${totalAmount.toFixed(2)} DH`],
          ['Average Amount', `${(totalAmount / receipts.length || 0).toFixed(2)} DH`],
          ...Object.entries(typeGroups).map(([type, count]) => [
            `${type.charAt(0).toUpperCase() + type.slice(1)} Receipts`,
            count.toString()
          ])
        ];

        currentY = this.drawTable(doc, leftMargin, currentY, pageWidth, summaryHeaders, summaryRows, {
          headerColor: '#FF6600',
          alternateRowColor: '#F9F9F9'
        });

        // Detailed Records
        currentY += 40;
        doc.fontSize(16).fillColor('#000000').font('Helvetica-Bold');
        doc.text('DETAILED RECEIPT RECORDS', leftMargin, currentY);

        currentY += 25;
        const detailHeaders = ['Recipient', 'Type', 'Amount (DH)', 'Date'];
        const detailRows = receipts.map(receipt => {
          const user = receipt.userId as any;
          return [
            user.name || 'Unknown',
            receipt.type.charAt(0).toUpperCase() + receipt.type.slice(1),
            (receipt.amount || 0).toFixed(2),
            new Date(receipt.date).toLocaleDateString()
          ];
        });

        this.drawTable(doc, leftMargin, currentY, pageWidth, detailHeaders, detailRows, {
          headerColor: '#FF6600',
          alternateRowColor: '#F9F9F9'
        });

        // Footer
        const footerY = doc.page.height - 90;
        this.drawFooter(doc, footerY, pageWidth, leftMargin, 'receipts report');

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}