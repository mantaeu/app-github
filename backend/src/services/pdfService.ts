import puppeteer, { Browser, Page } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
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
      const executablePath = await chromium.executablePath();
      this.browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath,
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
      });
    }
    return this.browser;
  }

  // Individual Salary Slip PDF Generation
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

  // Individual Receipt PDF Generation
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

  // Individual Salary Slip HTML Template (Black design with orange logo)
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
          
          body {
            font-family: 'Arial', sans-serif;
            background: #000000;
            color: #ffffff;
            padding: 40px;
            line-height: 1.6;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: #111111;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(255, 165, 0, 0.3);
          }
          
          .header {
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
            padding: 40px;
            text-align: center;
            border-bottom: 3px solid #ff6600;
            position: relative;
          }
          
          .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #ff6600 0%, #ff8533 100%);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            font-weight: bold;
            color: #000000;
            box-shadow: 0 10px 20px rgba(255, 102, 0, 0.4);
          }
          
          .company-name {
            font-size: 32px;
            font-weight: bold;
            color: #ff6600;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          
          .document-title {
            font-size: 24px;
            color: #ffffff;
            margin-bottom: 15px;
            font-weight: 300;
          }
          
          .period {
            font-size: 18px;
            color: #cccccc;
            background: #222222;
            padding: 10px 20px;
            border-radius: 25px;
            display: inline-block;
          }
          
          .content {
            padding: 40px;
          }
          
          .employee-section {
            background: #1a1a1a;
            border-radius: 10px;
            padding: 30px;
            margin-bottom: 30px;
            border-left: 5px solid #ff6600;
          }
          
          .section-title {
            font-size: 20px;
            color: #ff6600;
            margin-bottom: 20px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .employee-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          
          .info-item {
            margin-bottom: 15px;
          }
          
          .info-label {
            font-size: 14px;
            color: #999999;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .info-value {
            font-size: 16px;
            color: #ffffff;
            font-weight: 600;
          }
          
          .salary-section {
            background: #1a1a1a;
            border-radius: 10px;
            padding: 30px;
            margin-bottom: 30px;
            border-left: 5px solid #ff6600;
          }
          
          .salary-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          
          .salary-table th {
            background: #ff6600;
            color: #000000;
            padding: 15px;
            text-align: left;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .salary-table td {
            padding: 15px;
            border-bottom: 1px solid #333333;
            color: #ffffff;
          }
          
          .salary-table tr:nth-child(even) {
            background: #222222;
          }
          
          .salary-table tr:hover {
            background: #2a2a2a;
          }
          
          .amount {
            font-weight: bold;
            font-size: 16px;
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
            font-size: 18px;
          }
          
          .total-row td {
            border: none;
            color: #000000 !important;
          }
          
          .signature-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 50px;
            padding-top: 30px;
            border-top: 2px solid #333333;
          }
          
          .signature-box {
            text-align: center;
            padding: 20px;
            background: #1a1a1a;
            border-radius: 10px;
            border: 2px dashed #ff6600;
          }
          
          .signature-label {
            color: #ff6600;
            font-weight: bold;
            margin-bottom: 40px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .signature-line {
            border-top: 2px solid #ff6600;
            margin-top: 40px;
            padding-top: 10px;
            color: #cccccc;
            font-size: 12px;
          }
          
          .footer {
            background: #000000;
            padding: 30px;
            text-align: center;
            color: #666666;
            font-size: 12px;
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
            font-size: 120px;
            color: rgba(255, 102, 0, 0.05);
            font-weight: bold;
            z-index: 0;
            pointer-events: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="watermark">MANTAEVERT</div>
            <div class="logo">M</div>
            <div class="company-name">Mantaevert</div>
            <div class="document-title">Salary Slip</div>
            <div class="period">${salary.month} ${salary.year}</div>
          </div>

          <div class="content">
            <div class="employee-section">
              <div class="section-title">Employee Information</div>
              <div class="employee-grid">
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
                    <div class="info-label">Email Address</div>
                    <div class="info-value">${user.email}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Phone Number</div>
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

            <div class="signature-section">
              <div class="signature-box">
                <div class="signature-label">Employee Signature</div>
                <div class="signature-line">Authorized Signature</div>
              </div>
              <div class="signature-box">
                <div class="signature-label">HR Manager</div>
                <div class="signature-line">Authorized Signature</div>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>This is a <span class="footer-highlight">computer-generated document</span>. No physical signature is required.</p>
            <p>Generated on <span class="footer-highlight">${new Date().toLocaleDateString()}</span> | Mantaevert HR Management System</p>
            <p>© ${new Date().getFullYear()} Mantaevert. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Individual Receipt HTML Template (Black design with orange logo)
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
          
          body {
            font-family: 'Arial', sans-serif;
            background: #000000;
            color: #ffffff;
            padding: 40px;
            line-height: 1.6;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: #111111;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(255, 165, 0, 0.3);
          }
          
          .header {
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
            padding: 40px;
            text-align: center;
            border-bottom: 3px solid #ff6600;
            position: relative;
          }
          
          .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #ff6600 0%, #ff8533 100%);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            font-weight: bold;
            color: #000000;
            box-shadow: 0 10px 20px rgba(255, 102, 0, 0.4);
          }
          
          .company-name {
            font-size: 32px;
            font-weight: bold;
            color: #ff6600;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          
          .document-title {
            font-size: 24px;
            color: #ffffff;
            margin-bottom: 15px;
            font-weight: 300;
          }
          
          .receipt-number {
            font-size: 18px;
            color: #cccccc;
            background: #222222;
            padding: 10px 20px;
            border-radius: 25px;
            display: inline-block;
          }
          
          .content {
            padding: 40px;
          }
          
          .receipt-info {
            background: #1a1a1a;
            border-radius: 10px;
            padding: 30px;
            margin-bottom: 30px;
            border-left: 5px solid #ff6600;
          }
          
          .section-title {
            font-size: 20px;
            color: #ff6600;
            margin-bottom: 20px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          
          .info-item {
            margin-bottom: 15px;
          }
          
          .info-label {
            font-size: 14px;
            color: #999999;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .info-value {
            font-size: 16px;
            color: #ffffff;
            font-weight: 600;
          }
          
          .amount-section {
            background: #1a1a1a;
            border-radius: 10px;
            padding: 30px;
            margin-bottom: 30px;
            border-left: 5px solid #ff6600;
            text-align: center;
          }
          
          .amount-label {
            font-size: 16px;
            color: #999999;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .amount-value {
            font-size: 48px;
            color: #ff6600;
            font-weight: bold;
            margin-bottom: 10px;
          }
          
          .type-badge {
            background: #ff6600;
            color: #000000;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .description-section {
            background: #1a1a1a;
            border-radius: 10px;
            padding: 30px;
            margin-bottom: 30px;
            border-left: 5px solid #ff6600;
          }
          
          .description-text {
            font-size: 16px;
            color: #ffffff;
            line-height: 1.8;
            background: #222222;
            padding: 20px;
            border-radius: 8px;
            border-left: 3px solid #ff6600;
          }
          
          .footer {
            background: #000000;
            padding: 30px;
            text-align: center;
            color: #666666;
            font-size: 12px;
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
            font-size: 120px;
            color: rgba(255, 102, 0, 0.05);
            font-weight: bold;
            z-index: 0;
            pointer-events: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="watermark">MANTAEVERT</div>
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
            <p>This is a <span class="footer-highlight">computer-generated receipt</span>. No physical signature is required.</p>
            <p>Generated on <span class="footer-highlight">${new Date().toLocaleDateString()}</span> | Mantaevert HR Management System</p>
            <p>© ${new Date().getFullYear()} Mantaevert. All rights reserved.</p>
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