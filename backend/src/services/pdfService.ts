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
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Header
        doc.fontSize(24).fillColor('#ff6600').text('MANTAEVERT', 50, 50);
        doc.fontSize(18).fillColor('#000000').text('Salary Slip', 50, 80);
        doc.fontSize(12).text(`${salary.month} ${salary.year}`, 50, 105);

        // Employee Information
        doc.fontSize(14).fillColor('#ff6600').text('Employee Information', 50, 140);
        doc.fontSize(10).fillColor('#000000');
        doc.text(`Name: ${user.name}`, 50, 165);
        doc.text(`Email: ${user.email}`, 50, 180);
        doc.text(`Position: ${user.position || 'N/A'}`, 50, 195);
        doc.text(`Employee ID: #${user._id.toString().slice(-8).toUpperCase()}`, 300, 165);

        // Salary Details
        doc.fontSize(14).fillColor('#ff6600').text('Salary Breakdown', 50, 230);
        doc.fontSize(10).fillColor('#000000');
        
        let yPos = 255;
        doc.text(`Base Salary: ${salary.baseSalary?.toFixed(2) || '0.00'}`, 50, yPos);
        yPos += 15;
        doc.text(`Overtime Hours: ${salary.overtimeHours || 0} hours`, 50, yPos);
        yPos += 15;
        doc.text(`Overtime Pay: ${salary.overtimePay?.toFixed(2) || '0.00'}`, 50, yPos);
        yPos += 15;
        doc.text(`Bonus: ${salary.bonus?.toFixed(2) || '0.00'}`, 50, yPos);
        yPos += 15;
        doc.text(`Deductions: ${salary.deductions?.toFixed(2) || '0.00'}`, 50, yPos);
        yPos += 20;
        
        // Total
        doc.fontSize(12).fillColor('#ff6600');
        doc.text(`TOTAL SALARY: ${salary.totalSalary?.toFixed(2) || '0.00'}`, 50, yPos);

        // Footer
        doc.fontSize(8).fillColor('#666666');
        doc.text('This is a computer-generated document. No physical signature is required.', 50, 700);
        doc.text(`Generated on ${new Date().toLocaleDateString()} | Mantaevert HR Management System`, 50, 715);

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
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Header
        doc.fontSize(24).fillColor('#ff6600').text('MANTAEVERT', 50, 50);
        doc.fontSize(18).fillColor('#000000').text('Payment Receipt', 50, 80);
        doc.fontSize(12).text(`Receipt #${receipt._id.toString().slice(-8).toUpperCase()}`, 50, 105);

        // Receipt Information
        doc.fontSize(14).fillColor('#ff6600').text('Receipt Information', 50, 140);
        doc.fontSize(10).fillColor('#000000');
        doc.text(`Employee Name: ${user.name}`, 50, 165);
        doc.text(`Employee Email: ${user.email}`, 50, 180);
        doc.text(`Receipt Type: ${receipt.type.charAt(0).toUpperCase() + receipt.type.slice(1)}`, 50, 195);
        doc.text(`Date Issued: ${new Date(receipt.date).toLocaleDateString()}`, 300, 165);
        doc.text(`Time Issued: ${new Date(receipt.date).toLocaleTimeString()}`, 300, 180);

        // Amount
        doc.fontSize(16).fillColor('#ff6600').text('Total Amount', 50, 230);
        doc.fontSize(24).text(`${receipt.amount?.toFixed(2) || '0.00'}`, 50, 250);

        // Description
        doc.fontSize(14).fillColor('#ff6600').text('Description', 50, 290);
        doc.fontSize(10).fillColor('#000000');
        doc.text(receipt.description, 50, 315, { width: 500 });

        // Footer
        doc.fontSize(8).fillColor('#666666');
        doc.text('This is a computer-generated receipt. No physical signature is required.', 50, 700);
        doc.text(`Generated on ${new Date().toLocaleDateString()} | Mantaevert HR Management System`, 50, 715);

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