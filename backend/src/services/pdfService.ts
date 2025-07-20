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

  // Helper method to draw a professional table
  private static drawTable(doc: any, startX: number, startY: number, width: number, headers: string[], rows: any[][], options: any = {}) {
    const cellPadding = options.cellPadding || 8;
    const headerHeight = options.headerHeight || 25;
    const rowHeight = options.rowHeight || 20;
    const headerColor = options.headerColor || '#2c3e50';
    const headerTextColor = options.headerTextColor || '#FFFFFF';
    const borderColor = options.borderColor || '#bdc3c7';
    const alternateRowColor = options.alternateRowColor || '#f8f9fa';
    
    const colWidth = width / headers.length;
    let currentY = startY;

    // Draw header
    doc.rect(startX, currentY, width, headerHeight).fill(headerColor).stroke(borderColor);
    doc.fontSize(10).fillColor(headerTextColor).font('Helvetica-Bold');
    
    headers.forEach((header, i) => {
      doc.text(header, startX + (i * colWidth) + cellPadding, currentY + cellPadding, {
        width: colWidth - (cellPadding * 2),
        align: 'left'
      });
    });

    currentY += headerHeight;

    // Draw rows
    rows.forEach((row, rowIndex) => {
      // Alternate row colors
      if (rowIndex % 2 === 0) {
        doc.rect(startX, currentY, width, rowHeight).fill(alternateRowColor).stroke(borderColor);
      } else {
        doc.rect(startX, currentY, width, rowHeight).fill('#FFFFFF').stroke(borderColor);
      }

      doc.fontSize(9).fillColor('#000000').font('Helvetica');
      
      row.forEach((cell, cellIndex) => {
        const cellX = startX + (cellIndex * colWidth) + cellPadding;
        const cellY = currentY + cellPadding;
        
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

        // Company Header with Logo Area
        doc.rect(leftMargin, 40, pageWidth, 100).fill('#1a365d').stroke('#2d3748');
        
        // Company Name and Logo Area
        doc.fontSize(32).fillColor('#FFFFFF').font('Helvetica-Bold');
        doc.text('MANTAEVERT', leftMargin + 20, 65);
        
        doc.fontSize(12).fillColor('#e2e8f0').font('Helvetica');
        doc.text('Human Resources Management System', leftMargin + 20, 100);
        doc.text('📧 hr@mantaevert.com | 📞 +1 (555) 123-4567', leftMargin + 20, 115);

        // Document Title
        doc.fontSize(24).fillColor('#FFFFFF').font('Helvetica-Bold');
        doc.text('SALARY SLIP', pageWidth - 150, 65);
        
        // Document Info Box
        doc.rect(pageWidth - 140, 85, 120, 45).fill('#2d3748').stroke('#4a5568');
        doc.fontSize(9).fillColor('#FFFFFF').font('Helvetica');
        doc.text(`Period: ${salary.month} ${salary.year}`, pageWidth - 135, 90);
        doc.text(`Slip #: ${salary._id.toString().slice(-8).toUpperCase()}`, pageWidth - 135, 105);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 135, 120);

        // Employee Information Table
        let currentY = 170;
        doc.fontSize(14).fillColor('#2c3e50').font('Helvetica-Bold');
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
            color: salary.isPaid ? '#27ae60' : '#e74c3c',
            align: 'left'
          }]
        ];

        currentY = this.drawTable(doc, leftMargin, currentY, pageWidth, empHeaders, empRows, {
          headerColor: '#3498db',
          alternateRowColor: '#f8f9fa'
        });

        // Salary Breakdown Table
        currentY += 30;
        doc.fontSize(14).fillColor('#2c3e50').font('Helvetica-Bold');
        doc.text('SALARY BREAKDOWN', leftMargin, currentY);
        
        currentY += 25;
        const salaryHeaders = ['Description', 'Amount ($)', 'Type'];
        const salaryRows = [
      ['Base Salary', `${(salary.baseSalary || 0).toFixed(2)} DH`, 'Earning'],
        ['Overtime Pay', `${(salary.overtime || 0).toFixed(2)} DH`, 'Earning'],
        ['Bonuses & Allowances', `${(salary.bonuses || 0).toFixed(2)} DH`, 'Earning'],
        ['Deductions', {
        text: `-${(salary.deductions || 0).toFixed(2)} DH`,
        color: '#e74c3c'
        }, 'Deduction']
        ];

        currentY = this.drawTable(doc, leftMargin, currentY, pageWidth, salaryHeaders, salaryRows, {
          headerColor: '#27ae60',
          alternateRowColor: '#f0fff4'
        });

        // Net Salary Box
        currentY += 20;
        doc.rect(leftMargin, currentY, pageWidth, 40).fill('#2c3e50').stroke('#34495e');
        doc.fontSize(16).fillColor('#FFFFFF').font('Helvetica-Bold');
        doc.text('NET SALARY', leftMargin + 20, currentY + 12);
        doc.fontSize(20);
        doc.text(`${(salary.totalSalary || 0).toFixed(2)} DH`, pageWidth - 120, currentY + 10);

        // Attendance Summary Table (if available)
        if (salary.presentDays !== undefined) {
          currentY += 70;
          doc.fontSize(14).fillColor('#2c3e50').font('Helvetica-Bold');
          doc.text('ATTENDANCE SUMMARY', leftMargin, currentY);
          
          currentY += 25;
          const attHeaders = ['Metric', 'Count', 'Details'];
          const attRows = [
            ['Total Working Days', `${salary.totalWorkingDays || 0}`, 'Days in pay period'],
            ['Days Present', { 
              text: `${salary.presentDays || 0}`, 
              color: '#27ae60' 
            }, 'Days attended'],
            ['Days Absent', { 
              text: `${salary.absentDays || 0}`, 
              color: '#e74c3c' 
            }, 'Days missed'],
            ['Total Hours Worked', `${(salary.totalHoursWorked || 0).toFixed(1)}h`, 'Productive hours']
          ];

          currentY = this.drawTable(doc, leftMargin, currentY, pageWidth, attHeaders, attRows, {
            headerColor: '#9b59b6',
            alternateRowColor: '#faf5ff'
          });
        }

        // Signature Section
        currentY += 50;
        doc.fontSize(14).fillColor('#2c3e50').font('Helvetica-Bold');
        doc.text('AUTHORIZATION & SIGNATURES', leftMargin, currentY);
        
        currentY += 30;
        
        // HR Signature Box
        doc.rect(leftMargin, currentY, (pageWidth / 2) - 10, 80).fill('#f8f9fa').stroke('#dee2e6');
        doc.fontSize(12).fillColor('#2c3e50').font('Helvetica-Bold');
        doc.text('HR DEPARTMENT', leftMargin + 10, currentY + 10);
        
        // Signature line
        doc.moveTo(leftMargin + 10, currentY + 50).lineTo(leftMargin + (pageWidth / 2) - 20, currentY + 50).stroke('#000000');
        doc.fontSize(9).fillColor('#666666').font('Helvetica');
        doc.text('Authorized Signature', leftMargin + 10, currentY + 55);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, leftMargin + 10, currentY + 68);

        // Employee Signature Box
        doc.rect(leftMargin + (pageWidth / 2) + 10, currentY, (pageWidth / 2) - 10, 80).fill('#f8f9fa').stroke('#dee2e6');
        doc.fontSize(12).fillColor('#2c3e50').font('Helvetica-Bold');
        doc.text('EMPLOYEE ACKNOWLEDGMENT', leftMargin + (pageWidth / 2) + 20, currentY + 10);
        
        // Signature line
        doc.moveTo(leftMargin + (pageWidth / 2) + 20, currentY + 50).lineTo(pageWidth + 30, currentY + 50).stroke('#000000');
        doc.fontSize(9).fillColor('#666666').font('Helvetica');
        doc.text('Employee Signature', leftMargin + (pageWidth / 2) + 20, currentY + 55);
        doc.text(`${user.name}`, leftMargin + (pageWidth / 2) + 20, currentY + 68);

        // Footer
        currentY += 110;
        doc.rect(leftMargin, currentY, pageWidth, 40).fill('#1a365d');
        doc.fontSize(9).fillColor('#FFFFFF').font('Helvetica');
        doc.text('This is a computer-generated salary slip. No physical signature is required unless specified.', leftMargin + 10, currentY + 8);
        doc.text('For queries, contact HR at hr@mantaevert.com | Confidential Document', leftMargin + 10, currentY + 22);
        doc.fillColor('#cbd5e0');
        doc.text(`© ${new Date().getFullYear()} Mantaevert. All rights reserved. | Generated on ${new Date().toLocaleString()}`, leftMargin + 10, currentY + 32);

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

        // Company Header
        doc.rect(leftMargin, 40, pageWidth, 100).fill('#1a365d').stroke('#2d3748');
        
        doc.fontSize(32).fillColor('#FFFFFF').font('Helvetica-Bold');
        doc.text('MANTAEVERT', leftMargin + 20, 65);
        
        doc.fontSize(12).fillColor('#e2e8f0').font('Helvetica');
        doc.text('Human Resources Management System', leftMargin + 20, 100);
        doc.text('📧 hr@mantaevert.com | 📞 +1 (555) 123-4567', leftMargin + 20, 115);

        // Document Title
        doc.fontSize(24).fillColor('#FFFFFF').font('Helvetica-Bold');
        doc.text('PAYMENT RECEIPT', pageWidth - 180, 65);
        
        // Receipt Info Box
        doc.rect(pageWidth - 140, 85, 120, 45).fill('#2d3748').stroke('#4a5568');
        doc.fontSize(9).fillColor('#FFFFFF').font('Helvetica');
        doc.text(`Receipt #: ${receipt._id.toString().slice(-8).toUpperCase()}`, pageWidth - 135, 90);
        doc.text(`Date: ${new Date(receipt.date).toLocaleDateString()}`, pageWidth - 135, 105);
        doc.text(`Time: ${new Date(receipt.date).toLocaleTimeString()}`, pageWidth - 135, 120);

        // Employee Information Table
        let currentY = 170;
        doc.fontSize(14).fillColor('#2c3e50').font('Helvetica-Bold');
        doc.text('RECIPIENT INFORMATION', leftMargin, currentY);
        
        currentY += 25;
        const empHeaders = ['Field', 'Details'];
        const empRows = [
          ['Recipient Name', user.name || 'N/A'],
          ['Employee ID', `#${user._id.toString().slice(-8).toUpperCase()}`],
          ['Email Address', user.email || 'N/A'],
          ['Receipt Type', receipt.type.charAt(0).toUpperCase() + receipt.type.slice(1)]
        ];

        currentY = this.drawTable(doc, leftMargin, currentY, pageWidth, empHeaders, empRows, {
          headerColor: '#3498db',
          alternateRowColor: '#f8f9fa'
        });

        // Amount Section
        currentY += 30;
        doc.rect(leftMargin, currentY, pageWidth, 60).fill('#27ae60').stroke('#229954');
        doc.fontSize(16).fillColor('#FFFFFF').font('Helvetica-Bold');
        doc.text('TOTAL AMOUNT', leftMargin + 20, currentY + 15);
        doc.fontSize(36);
        doc.text(`${(receipt.amount || 0).toFixed(2)} DH`, leftMargin + 20, currentY + 35);

        // Payment Details Table
        currentY += 90;
        doc.fontSize(14).fillColor('#2c3e50').font('Helvetica-Bold');
        doc.text('PAYMENT DETAILS', leftMargin, currentY);
        
        currentY += 25;
        const paymentHeaders = ['Description', 'Information'];
        const paymentRows = [
          ['Payment Method', 'Company Transfer'],
          ['Transaction ID', receipt._id.toString().slice(-12).toUpperCase()],
          ['Processing Date', new Date(receipt.date).toLocaleDateString()],
          ['Status', { text: 'COMPLETED ✓', color: '#27ae60' }]
        ];

        currentY = this.drawTable(doc, leftMargin, currentY, pageWidth, paymentHeaders, paymentRows, {
          headerColor: '#f39c12',
          alternateRowColor: '#fef9e7'
        });

        // Description Section
        currentY += 30;
        doc.fontSize(14).fillColor('#2c3e50').font('Helvetica-Bold');
        doc.text('DESCRIPTION', leftMargin, currentY);
        
        currentY += 20;
        doc.rect(leftMargin, currentY, pageWidth, 60).fill('#f8f9fa').stroke('#dee2e6');
        doc.fontSize(11).fillColor('#000000').font('Helvetica');
        doc.text(receipt.description || 'No description provided', leftMargin + 15, currentY + 15, { 
          width: pageWidth - 30,
          align: 'left'
        });

        // Signature Section
        currentY += 90;
        doc.fontSize(14).fillColor('#2c3e50').font('Helvetica-Bold');
        doc.text('AUTHORIZATION & ACKNOWLEDGMENT', leftMargin, currentY);
        
        currentY += 30;
        
        // HR Signature Box
        doc.rect(leftMargin, currentY, (pageWidth / 2) - 10, 80).fill('#f8f9fa').stroke('#dee2e6');
        doc.fontSize(12).fillColor('#2c3e50').font('Helvetica-Bold');
        doc.text('ISSUED BY', leftMargin + 10, currentY + 10);
        
        doc.moveTo(leftMargin + 10, currentY + 50).lineTo(leftMargin + (pageWidth / 2) - 20, currentY + 50).stroke('#000000');
        doc.fontSize(9).fillColor('#666666').font('Helvetica');
        doc.text('HR Department Signature', leftMargin + 10, currentY + 55);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, leftMargin + 10, currentY + 68);

        // Employee Acknowledgment Box
        doc.rect(leftMargin + (pageWidth / 2) + 10, currentY, (pageWidth / 2) - 10, 80).fill('#f8f9fa').stroke('#dee2e6');
        doc.fontSize(12).fillColor('#2c3e50').font('Helvetica-Bold');
        doc.text('RECEIVED BY', leftMargin + (pageWidth / 2) + 20, currentY + 10);
        
        doc.moveTo(leftMargin + (pageWidth / 2) + 20, currentY + 50).lineTo(pageWidth + 30, currentY + 50).stroke('#000000');
        doc.fontSize(9).fillColor('#666666').font('Helvetica');
        doc.text('Recipient Signature', leftMargin + (pageWidth / 2) + 20, currentY + 55);
        doc.text(`${user.name}`, leftMargin + (pageWidth / 2) + 20, currentY + 68);

        // Footer
        currentY += 110;
        doc.rect(leftMargin, currentY, pageWidth, 40).fill('#1a365d');
        doc.fontSize(9).fillColor('#FFFFFF').font('Helvetica');
        doc.text('This is a computer-generated receipt. Keep this document for your records.', leftMargin + 10, currentY + 8);
        doc.text('For queries, contact HR at hr@mantaevert.com | Confidential Document', leftMargin + 10, currentY + 22);
        doc.fillColor('#cbd5e0');
        doc.text(`© ${new Date().getFullYear()} Mantaevert. All rights reserved. | Generated on ${new Date().toLocaleString()}`, leftMargin + 10, currentY + 32);

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

        // Header
        doc.fontSize(24).fillColor('#ff6600').text('MANTAEVERT', 50, 50);
        doc.fontSize(18).fillColor('#000000').text('All Salaries Report', 50, 80);
        doc.fontSize(12).text(`Generated on ${new Date().toLocaleDateString()}`, 50, 105);

        let yPos = 140;
        salaryRecords.forEach((salary, index) => {
          if (yPos > 700) {
            doc.addPage();
            yPos = 50;
          }

          const user = salary.userId as any;
          doc.fontSize(12).fillColor('#ff6600').text(`${index + 1}. ${user.name}`, 50, yPos);
          yPos += 15;
          doc.fontSize(10).fillColor('#000000');
          doc.text(`${salary.month} ${salary.year} - Total: ${salary.totalSalary?.toFixed(2) || '0.00'}`, 70, yPos);
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

        // Header
        doc.fontSize(24).fillColor('#ff6600').text('MANTAEVERT', 50, 50);
        doc.fontSize(18).fillColor('#000000').text('All Receipts Report', 50, 80);
        doc.fontSize(12).text(`Generated on ${new Date().toLocaleDateString()}`, 50, 105);

        let yPos = 140;
        receipts.forEach((receipt, index) => {
          if (yPos > 700) {
            doc.addPage();
            yPos = 50;
          }

          const user = receipt.userId as any;
          doc.fontSize(12).fillColor('#ff6600').text(`${index + 1}. ${user.name}`, 50, yPos);
          yPos += 15;
          doc.fontSize(10).fillColor('#000000');
          doc.text(`${receipt.type} - ${receipt.amount?.toFixed(2) || '0.00'} - ${new Date(receipt.date).toLocaleDateString()}`, 70, yPos);
          yPos += 25;
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}