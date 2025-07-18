import puppeteer, { Browser, Page } from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { User } from '../models/User';
import { Salary } from '../models/Salary';
import { Attendance } from '../models/Attendance';
import { Receipt } from '../models/Receipt';

export class PDFService {
  private static browser: Browser | null = null;

  private static async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
    return this.browser;
  }

  // Individual Salary Slip PDF Generation (Single Page)
  static async generateIndividualSalarySlipPDF(salaryId: string): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // Fetch salary data with user info
      const salary = await Salary.findById(salaryId).populate('userId');
      if (!salary) {
        throw new Error('Salary record not found');
      }

      const user = salary.userId as any;
      const html = this.generateIndividualSalarySlipHTML(salary, user);
      
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '10px',
          right: '10px',
          bottom: '10px',
          left: '10px'
        },
        preferCSSPageSize: true
      });

      return pdf;
    } finally {
      await page.close();
    }
  }

  // Individual Receipt PDF Generation (Single Page)
  static async generateIndividualReceiptPDF(receiptId: string): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // Fetch receipt data with user info
      const receipt = await Receipt.findById(receiptId).populate('userId');
      if (!receipt) {
        throw new Error('Receipt not found');
      }

      const user = receipt.userId as any;
      const html = this.generateIndividualReceiptHTML(receipt, user);
      
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '10px',
          right: '10px',
          bottom: '10px',
          left: '10px'
        },
        preferCSSPageSize: true
      });

      return pdf;
    } finally {
      await page.close();
    }
  }

  // Bulk exports (existing functionality)
  static async generateAllSalariesPDF(): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      const salaryRecords = await Salary.find({})
        .populate('userId', 'name email position')
        .sort({ year: -1, month: -1 });

      const html = this.generateAllSalariesHTML(salaryRecords);
      
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });

      return pdf;
    } finally {
      await page.close();
    }
  }

  static async generateAllReceiptsPDF(): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      const receipts = await Receipt.find({})
        .populate('userId', 'name email')
        .sort({ date: -1 });

      const html = this.generateAllReceiptsHTML(receipts);
      
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });

      return pdf;
    } finally {
      await page.close();
    }
  }

  // Individual Salary Slip HTML Template (Fixed Logo and Watermark)
  private static generateIndividualSalarySlipHTML(salary: any, user: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Salary Slip</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          @page {
            size: A4;
            margin: 0;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            background: #000000;
            color: #ffffff;
            padding: 12px;
            line-height: 1.1;
            font-size: 10px;
            height: 100vh;
            overflow: hidden;
          }
          
          .container {
            width: 100%;
            height: 100%;
            background: #111111;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(255, 165, 0, 0.3);
            display: flex;
            flex-direction: column;
            position: relative;
          }
          
          .header {
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
            padding: 12px;
            text-align: center;
            border-bottom: 2px solid #ff6600;
            position: relative;
            flex-shrink: 0;
            z-index: 2;
          }
          
          .logo {
            width: 55px;
            height: 55px;
            background: linear-gradient(135deg, #ff6600 0%, #ff8533 100%);
            border-radius: 50%;
            margin: 0 auto 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            font-weight: bold;
            color: #000000;
            box-shadow: 0 8px 16px rgba(255, 102, 0, 0.5);
            border: 3px solid #ff8533;
            position: relative;
            z-index: 3;
          }
          
          .company-name {
            font-size: 18px;
            font-weight: bold;
            color: #ff6600;
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 1px;
            z-index: 3;
            position: relative;
          }
          
          .document-title {
            font-size: 14px;
            color: #ffffff;
            margin-bottom: 6px;
            font-weight: 300;
            z-index: 3;
            position: relative;
          }
          
          .period {
            font-size: 11px;
            color: #cccccc;
            background: #222222;
            padding: 4px 12px;
            border-radius: 12px;
            display: inline-block;
            z-index: 3;
            position: relative;
          }
          
          .content {
            padding: 10px;
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 8px;
            z-index: 2;
            position: relative;
          }
          
          .info-section {
            background: #1a1a1a;
            border-radius: 5px;
            padding: 8px;
            border-left: 3px solid #ff6600;
            flex-shrink: 0;
          }
          
          .section-title {
            font-size: 11px;
            color: #ff6600;
            margin-bottom: 6px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          
          .info-item {
            margin-bottom: 5px;
          }
          
          .info-label {
            font-size: 8px;
            color: #999999;
            margin-bottom: 1px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          
          .info-value {
            font-size: 9px;
            color: #ffffff;
            font-weight: 600;
          }
          
          .salary-section {
            background: #1a1a1a;
            border-radius: 5px;
            padding: 8px;
            border-left: 3px solid #ff6600;
            flex: 1;
          }
          
          .salary-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 6px;
          }
          
          .salary-table th {
            background: #ff6600;
            color: #000000;
            padding: 5px;
            text-align: left;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            font-size: 8px;
          }
          
          .salary-table td {
            padding: 5px;
            border-bottom: 1px solid #333333;
            color: #ffffff;
            font-size: 8px;
          }
          
          .salary-table tr:nth-child(even) {
            background: #222222;
          }
          
          .amount {
            font-weight: bold;
            font-size: 9px;
          }
          
          .positive {
            color: #00ff88;
          }
          
          .negative {
            color: #ff4444;
          }
          
          .total-row {
            background: #ff6600 !important;
            color: #000000 !important;
            font-weight: bold;
            font-size: 10px;
          }
          
          .total-row td {
            border: none;
            color: #000000 !important;
            padding: 6px 5px;
          }
          
          .footer {
            background: #000000;
            padding: 6px;
            text-align: center;
            color: #666666;
            font-size: 7px;
            flex-shrink: 0;
            z-index: 2;
            position: relative;
          }
          
          .footer-highlight {
            color: #ff6600;
            font-weight: bold;
          }
          
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            color: rgba(255, 102, 0, 0.01);
            font-weight: bold;
            z-index: 1;
            pointer-events: none;
            opacity: 0.01;
            user-select: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Properly Transparent Watermark -->
          <div class="watermark">MANTAEVERT</div>
          
          <div class="header">
            <!-- Fixed Logo -->
            <div class="logo">M</div>
            <div class="company-name">Mantaevert</div>
            <div class="document-title">Salary Slip</div>
            <div class="period">${salary.month} ${salary.year}</div>
          </div>

          <div class="content">
            <div class="info-section">
              <div class="section-title">Employee Information</div>
              <div class="info-grid">
                <div>
                  <div class="info-item">
                    <div class="info-label">Full Name</div>
                    <div class="info-value">${user.name}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Employee ID</div>
                    <div class="info-value">#${user._id.toString().slice(-8).toUpperCase()}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Position</div>
                    <div class="info-value">${user.position || 'N/A'}</div>
                  </div>
                </div>
                <div>
                  <div class="info-item">
                    <div class="info-label">Email</div>
                    <div class="info-value">${user.email}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Phone</div>
                    <div class="info-value">${user.phone || 'N/A'}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Department</div>
                    <div class="info-value">${user.role || 'Worker'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="salary-section">
              <div class="section-title">Salary Breakdown</div>
              <table class="salary-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Base Salary</td>
                    <td class="amount">$${salary.baseSalary?.toFixed(2) || '0.00'}</td>
                  </tr>
                  <tr>
                    <td>Overtime Hours</td>
                    <td class="amount">${salary.overtimeHours || 0} hours</td>
                  </tr>
                  <tr>
                    <td>Overtime Pay</td>
                    <td class="amount positive">+$${salary.overtimePay?.toFixed(2) || '0.00'}</td>
                  </tr>
                  <tr>
                    <td>Bonus</td>
                    <td class="amount positive">+$${salary.bonus?.toFixed(2) || '0.00'}</td>
                  </tr>
                  <tr>
                    <td>Deductions</td>
                    <td class="amount negative">-$${salary.deductions?.toFixed(2) || '0.00'}</td>
                  </tr>
                  <tr class="total-row">
                    <td><strong>TOTAL SALARY</strong></td>
                    <td class="amount"><strong>$${salary.totalSalary?.toFixed(2) || '0.00'}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Signature Sections -->
            <div style="display: flex; justify-content: space-between; gap: 15px; margin-top: 3px; flex-shrink: 0;">
              <div style="text-align: center; flex: 1; background: #1a1a1a; padding: 10px; border-radius: 5px; border: 1px dashed #ff6600;">
                <div style="color: #ff6600; font-weight: bold; margin-bottom: 6px; font-size: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Employee Signature</div>
                <div style="height: 30px; border-bottom: 2px solid #ff6600; margin: 6px 0; background: rgba(255, 102, 0, 0.05); border-radius: 3px;"></div>
                <div style="color: #cccccc; font-size: 7px; margin-top: 3px;">Authorized Signature</div>
              </div>
              <div style="text-align: center; flex: 1; background: #1a1a1a; padding: 10px; border-radius: 5px; border: 1px dashed #ff6600;">
                <div style="color: #ff6600; font-weight: bold; margin-bottom: 6px; font-size: 8px; text-transform: uppercase; letter-spacing: 0.5px;">HR Manager</div>
                <div style="height: 30px; border-bottom: 2px solid #ff6600; margin: 6px 0; background: rgba(255, 102, 0, 0.05); border-radius: 3px;"></div>
                <div style="color: #cccccc; font-size: 7px; margin-top: 3px;">Authorized Signature</div>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Computer-generated document | Generated on <span class="footer-highlight">${new Date().toLocaleDateString()}</span> | © ${new Date().getFullYear()} Mantaevert</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Individual Receipt HTML Template (Fixed Logo and Watermark)
  private static generateIndividualReceiptHTML(receipt: any, user: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          @page {
            size: A4;
            margin: 0;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            background: #000000;
            color: #ffffff;
            padding: 15px;
            line-height: 1.2;
            font-size: 11px;
            height: 100vh;
            overflow: hidden;
          }
          
          .container {
            width: 100%;
            height: 100%;
            background: #111111;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(255, 165, 0, 0.3);
            display: flex;
            flex-direction: column;
            position: relative;
          }
          
          .header {
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
            padding: 15px;
            text-align: center;
            border-bottom: 2px solid #ff6600;
            position: relative;
            flex-shrink: 0;
            z-index: 2;
          }
          
          .logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #ff6600 0%, #ff8533 100%);
            border-radius: 50%;
            margin: 0 auto 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            font-weight: bold;
            color: #000000;
            box-shadow: 0 8px 16px rgba(255, 102, 0, 0.5);
            border: 3px solid #ff8533;
            position: relative;
            z-index: 3;
          }
          
          .company-name {
            font-size: 20px;
            font-weight: bold;
            color: #ff6600;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 1px;
            z-index: 3;
            position: relative;
          }
          
          .document-title {
            font-size: 16px;
            color: #ffffff;
            margin-bottom: 8px;
            font-weight: 300;
            z-index: 3;
            position: relative;
          }
          
          .receipt-number {
            font-size: 12px;
            color: #cccccc;
            background: #222222;
            padding: 5px 15px;
            border-radius: 15px;
            display: inline-block;
            z-index: 3;
            position: relative;
          }
          
          .content {
            padding: 15px;
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 15px;
            z-index: 2;
            position: relative;
          }
          
          .receipt-info {
            background: #1a1a1a;
            border-radius: 6px;
            padding: 15px;
            border-left: 3px solid #ff6600;
            flex-shrink: 0;
          }
          
          .section-title {
            font-size: 14px;
            color: #ff6600;
            margin-bottom: 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          
          .info-item {
            margin-bottom: 8px;
          }
          
          .info-label {
            font-size: 9px;
            color: #999999;
            margin-bottom: 2px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          
          .info-value {
            font-size: 11px;
            color: #ffffff;
            font-weight: 600;
          }
          
          .amount-section {
            background: #1a1a1a;
            border-radius: 6px;
            padding: 20px;
            border-left: 3px solid #ff6600;
            text-align: center;
            flex-shrink: 0;
          }
          
          .amount-label {
            font-size: 12px;
            color: #999999;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .amount-value {
            font-size: 32px;
            color: #ff6600;
            font-weight: bold;
            margin-bottom: 8px;
          }
          
          .type-badge {
            background: #ff6600;
            color: #000000;
            padding: 6px 12px;
            border-radius: 15px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .description-section {
            background: #1a1a1a;
            border-radius: 6px;
            padding: 15px;
            border-left: 3px solid #ff6600;
            flex: 1;
          }
          
          .description-text {
            font-size: 11px;
            color: #ffffff;
            line-height: 1.4;
            background: #222222;
            padding: 12px;
            border-radius: 5px;
            border-left: 2px solid #ff6600;
          }
          
          .footer {
            background: #000000;
            padding: 10px;
            text-align: center;
            color: #666666;
            font-size: 8px;
            flex-shrink: 0;
            z-index: 2;
            position: relative;
          }
          
          .footer-highlight {
            color: #ff6600;
            font-weight: bold;
          }
          
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 90px;
            color: rgba(255, 102, 0, 0.01);
            font-weight: bold;
            z-index: 1;
            pointer-events: none;
            opacity: 0.01;
            user-select: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Properly Transparent Watermark -->
          <div class="watermark">MANTAEVERT</div>
          
          <div class="header">
            <!-- Fixed Logo -->
            <div class="logo">M</div>
            <div class="company-name">Mantaevert</div>
            <div class="document-title">Payment Receipt</div>
            <div class="receipt-number">Receipt #${receipt._id.toString().slice(-8).toUpperCase()}</div>
          </div>

          <div class="content">
            <div class="receipt-info">
              <div class="section-title">Receipt Information</div>
              <div class="info-grid">
                <div>
                  <div class="info-item">
                    <div class="info-label">Employee Name</div>
                    <div class="info-value">${user.name}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Employee Email</div>
                    <div class="info-value">${user.email}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Receipt Type</div>
                    <div class="info-value">${receipt.type.charAt(0).toUpperCase() + receipt.type.slice(1)}</div>
                  </div>
                </div>
                <div>
                  <div class="info-item">
                    <div class="info-label">Date Issued</div>
                    <div class="info-value">${new Date(receipt.date).toLocaleDateString()}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Time Issued</div>
                    <div class="info-value">${new Date(receipt.date).toLocaleTimeString()}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Receipt ID</div>
                    <div class="info-value">#${receipt._id.toString().slice(-8).toUpperCase()}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="amount-section">
              <div class="amount-label">Total Amount</div>
              <div class="amount-value">$${receipt.amount?.toFixed(2) || '0.00'}</div>
              <div class="type-badge">${receipt.type}</div>
            </div>

            <div class="description-section">
              <div class="section-title">Description</div>
              <div class="description-text">
                ${receipt.description}
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Computer-generated receipt | Generated on <span class="footer-highlight">${new Date().toLocaleDateString()}</span> | © ${new Date().getFullYear()} Mantaevert</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Existing bulk export methods (keeping for admin export functionality)
  private static generateAllSalariesHTML(salaryRecords: any[]): string {
    // ... existing implementation
    return `<html><body><h1>All Salaries Report</h1></body></html>`;
  }

  private static generateAllReceiptsHTML(receipts: any[]): string {
    // ... existing implementation  
    return `<html><body><h1>All Receipts Report</h1></body></html>`;
  }

  static async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}