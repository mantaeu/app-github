import PDFDocument from 'pdfkit';
import { User } from '../models/User';
import { Salary } from '../models/Salary';
import { Attendance } from '../models/Attendance';
import { Receipt } from '../models/Receipt';

// Translation object
const translations = {
  en: {
    // Company Info
    hrSystem: 'Human Resources Management System',
    email: 'mantaeuvert@gmail.com',
    phone: '0649736309/0660955530',
    website: 'www.mantaevert.com',
    location: 'Sefrou, Morocco',
    
    // Salary Slip
    salarySlip: 'SALARY SLIP',
    period: 'Period',
    slipNumber: 'Slip #',
    date: 'Date',
    status: 'Status',
    paid: 'PAID',
    pending: 'PENDING',
    
    // Employee Info
    employeeInfo: 'EMPLOYEE INFORMATION',
    employeeName: 'Employee Name',
    employeeId: 'Employee ID',
    emailAddress: 'Email Address',
    position: 'Position',
    department: 'Department',
    paymentStatus: 'Payment Status',
    
    // Salary Breakdown
    salaryBreakdown: 'SALARY BREAKDOWN',
    description: 'Description',
    amount: 'Amount (DH)',
    type: 'Type',
    baseSalary: 'Base Salary',
    overtimePay: 'Overtime Pay',
    bonuses: 'Bonuses & Allowances',
    deductions: 'Deductions',
    earning: 'Earning',
    deduction: 'Deduction',
    netSalary: 'NET SALARY',
    
    // Signatures
    signatures: 'AUTHORIZATION & SIGNATURES',
    hrDepartment: 'HR DEPARTMENT',
    employeeAck: 'EMPLOYEE ACKNOWLEDGMENT',
    authorizedBy: 'Authorized by:',
    receivedBy: 'Received by:',
    hrSignature: 'HR Manager Signature',
    employeeSignature: 'Employee Signature',
    
    // Receipt
    paymentReceipt: 'PAYMENT RECEIPT',
    receiptNumber: 'Receipt #',
    time: 'Time',
    recipientInfo: 'RECIPIENT INFORMATION',
    recipientName: 'Recipient Name',
    receiptType: 'Receipt Type',
    totalAmount: 'TOTAL AMOUNT',
    paymentDetails: 'PAYMENT DETAILS',
    paymentMethod: 'Payment Method',
    transactionId: 'Transaction ID',
    processingDate: 'Processing Date',
    currency: 'Currency',
    completed: 'COMPLETED',
    companyTransfer: 'Company Transfer',
    moroccanDirham: 'Moroccan Dirham (DH)',
    issuedBy: 'ISSUED BY',
    
    // Footer
    computerGenerated: 'This is a computer-generated document. No physical signature is required unless specified.',
    queries: 'For queries, contact HR at mantaeuvert@gmail.com | Confidential Document',
    copyright: 'Mantaevert. All rights reserved. | Generated on',
    
    // Reports
    allSalariesReport: 'ALL SALARIES REPORT',
    allReceiptsReport: 'ALL RECEIPTS REPORT',
    generatedOn: 'Generated on',
    totalRecords: 'Total Records',
    summaryStats: 'SUMMARY STATISTICS',
    detailedRecords: 'DETAILED SALARY RECORDS',
    detailedReceiptRecords: 'DETAILED RECEIPT RECORDS',
    metric: 'Metric',
    value: 'Value',
    employee: 'Employee',
    recipient: 'Recipient',
    unknown: 'Unknown',
    general: 'General',
    noDescription: 'No description provided'
  },
  ar: {
    // Company Info
    hrSystem: 'نظام إدارة الموارد البشرية',
    email: 'mantaeuvert@gmail.com',
    phone: '0649736309/0660955530',
    website: 'www.mantaevert.com',
    location: 'صفرو، المغرب',
    
    // Salary Slip
    salarySlip: 'قسيمة الراتب',
    period: 'الفترة',
    slipNumber: 'رقم القسيمة',
    date: 'التاريخ',
    status: 'الحالة',
    paid: 'مدفوع',
    pending: 'معلق',
    
    // Employee Info
    employeeInfo: 'معلومات الموظف',
    employeeName: 'اسم الموظف',
    employeeId: 'رقم الموظف',
    emailAddress: 'البريد الإلكتروني',
    position: 'المنصب',
    department: 'القسم',
    paymentStatus: 'حالة الدفع',
    
    // Salary Breakdown
    salaryBreakdown: 'تفصيل الراتب',
    description: 'الوصف',
    amount: 'المبلغ (درهم)',
    type: 'النوع',
    baseSalary: 'الراتب الأساسي',
    overtimePay: 'أجر الوقت الإضافي',
    bonuses: 'المكافآت والبدلات',
    deductions: 'الخصومات',
    earning: 'مكسب',
    deduction: 'خصم',
    netSalary: 'صافي الراتب',
    
    // Signatures
    signatures: 'التوقيعات والتفويض',
    hrDepartment: 'قسم الموارد البشرية',
    employeeAck: 'إقرار الموظف',
    authorizedBy: 'مفوض من:',
    receivedBy: 'مستلم من:',
    hrSignature: 'توقيع مدير الموارد البشرية',
    employeeSignature: 'توقيع الموظف',
    
    // Receipt
    paymentReceipt: 'إيصال الدفع',
    receiptNumber: 'رقم الإيصال',
    time: 'الوقت',
    recipientInfo: 'معلومات المستلم',
    recipientName: 'اسم المستلم',
    receiptType: 'نوع الإيصال',
    totalAmount: 'المبلغ الإجمالي',
    paymentDetails: 'تفاصيل الدفع',
    paymentMethod: 'طريقة الدفع',
    transactionId: 'رقم المعاملة',
    processingDate: 'تاريخ المعالجة',
    currency: 'العملة',
    completed: 'مكتمل',
    companyTransfer: 'تحويل الشركة',
    moroccanDirham: 'الدرهم المغربي',
    issuedBy: 'صادر من',
    
    // Footer
    computerGenerated: 'هذه وثيقة مولدة بالحاسوب. لا يتطلب توقيع فعلي ما لم يُحدد خلاف ذلك.',
    queries: 'للاستفسارات، اتصل بالموارد البشرية على mantaeuvert@gmail.com | وثيقة سرية',
    copyright: 'مانتايفرت. جميع الحقوق محفوظة. | تم إنشاؤها في',
    
    // Reports
    allSalariesReport: 'تقرير جميع الرواتب',
    allReceiptsReport: 'تقرير جميع الإيصالات',
    generatedOn: 'تم إنشاؤه في',
    totalRecords: 'إجمالي السجلات',
    summaryStats: 'إحصائيات موجزة',
    detailedRecords: 'سجلات الرواتب التفصيلية',
    detailedReceiptRecords: 'سجلات الإيصالات التفصيلية',
    metric: 'المقياس',
    value: 'القيمة',
    employee: 'الموظف',
    recipient: 'المستلم',
    unknown: 'غير معروف',
    general: 'عام',
    noDescription: 'لا يوجد وصف'
  },
  fr: {
    // Company Info
    hrSystem: 'Système de Gestion des Ressources Humaines',
    email: 'mantaeuvert@gmail.com',
    phone: '0649736309/0660955530',
    website: 'www.mantaevert.com',
    location: 'Sefrou, Maroc',
    
    // Salary Slip
    salarySlip: 'BULLETIN DE PAIE',
    period: 'Période',
    slipNumber: 'N° Bulletin',
    date: 'Date',
    status: 'Statut',
    paid: 'PAYÉ',
    pending: 'EN ATTENTE',
    
    // Employee Info
    employeeInfo: 'INFORMATIONS EMPLOYÉ',
    employeeName: 'Nom de l\'employé',
    employeeId: 'ID Employé',
    emailAddress: 'Adresse e-mail',
    position: 'Poste',
    department: 'Département',
    paymentStatus: 'Statut de paiement',
    
    // Salary Breakdown
    salaryBreakdown: 'DÉTAIL DU SALAIRE',
    description: 'Description',
    amount: 'Montant (DH)',
    type: 'Type',
    baseSalary: 'Salaire de base',
    overtimePay: 'Heures supplémentaires',
    bonuses: 'Primes et allocations',
    deductions: 'Déductions',
    earning: 'Gain',
    deduction: 'Déduction',
    netSalary: 'SALAIRE NET',
    
    // Signatures
    signatures: 'AUTORISATIONS & SIGNATURES',
    hrDepartment: 'DÉPARTEMENT RH',
    employeeAck: 'ACCUSÉ RÉCEPTION EMPLOYÉ',
    authorizedBy: 'Autorisé par:',
    receivedBy: 'Reçu par:',
    hrSignature: 'Signature Responsable RH',
    employeeSignature: 'Signature Employé',
    
    // Receipt
    paymentReceipt: 'REÇU DE PAIEMENT',
    receiptNumber: 'N° Reçu',
    time: 'Heure',
    recipientInfo: 'INFORMATIONS DESTINATAIRE',
    recipientName: 'Nom du destinataire',
    receiptType: 'Type de reçu',
    totalAmount: 'MONTANT TOTAL',
    paymentDetails: 'DÉTAILS DU PAIEMENT',
    paymentMethod: 'Méthode de paiement',
    transactionId: 'ID Transaction',
    processingDate: 'Date de traitement',
    currency: 'Devise',
    completed: 'TERMINÉ',
    companyTransfer: 'Virement entreprise',
    moroccanDirham: 'Dirham Marocain (DH)',
    issuedBy: 'ÉMIS PAR',
    
    // Footer
    computerGenerated: 'Ceci est un document généré par ordinateur. Aucune signature physique n\'est requise sauf indication contraire.',
    queries: 'Pour toute question, contactez RH à mantaeuvert@gmail.com | Document confidentiel',
    copyright: 'Mantaevert. Tous droits réservés. | Généré le',
    
    // Reports
    allSalariesReport: 'RAPPORT DE TOUS LES SALAIRES',
    allReceiptsReport: 'RAPPORT DE TOUS LES REÇUS',
    generatedOn: 'Généré le',
    totalRecords: 'Total des enregistrements',
    summaryStats: 'STATISTIQUES RÉSUMÉES',
    detailedRecords: 'ENREGISTREMENTS DÉTAILLÉS DES SALAIRES',
    detailedReceiptRecords: 'ENREGISTREMENTS DÉTAILLÉS DES REÇUS',
    metric: 'Métrique',
    value: 'Valeur',
    employee: 'Employé',
    recipient: 'Destinataire',
    unknown: 'Inconnu',
    general: 'Général',
    noDescription: 'Aucune description fournie'
  }
};

export class PDFService {
  // Individual Salary Slip PDF Generation with language support
  static async generateIndividualSalarySlipPDF(salaryId: string, language: string = 'en'): Promise<Buffer> {
    try {
      const salary = await Salary.findById(salaryId).populate('userId');
      if (!salary) {
        throw new Error('Salary record not found');
      }

      const user = salary.userId as any;
      return this.createSalarySlipPDF(salary, user, language);
    } catch (error) {
      throw error;
    }
  }

  // Individual Receipt PDF Generation with language support
  static async generateIndividualReceiptPDF(receiptId: string, language: string = 'en'): Promise<Buffer> {
    try {
      const receipt = await Receipt.findById(receiptId).populate('userId');
      if (!receipt) {
        throw new Error('Receipt not found');
      }

      const user = receipt.userId as any;
      return this.createReceiptPDF(receipt, user, language);
    } catch (error) {
      throw error;
    }
  }

  // Bulk exports with language support
  static async generateAllSalariesPDF(language: string = 'en'): Promise<Buffer> {
    try {
      const salaryRecords = await Salary.find({})
        .populate('userId', 'name email position')
        .sort({ year: -1, month: -1 });

      return this.createAllSalariesPDF(salaryRecords, language);
    } catch (error) {
      throw error;
    }
  }

  static async generateAllReceiptsPDF(language: string = 'en'): Promise<Buffer> {
    try {
      const receipts = await Receipt.find({})
        .populate('userId', 'name email')
        .sort({ date: -1 });

      return this.createAllReceiptsPDF(receipts, language);
    } catch (error) {
      throw error;
    }
  }

  // Helper method to get translation
  private static t(key: string, language: string): string {
    const lang = translations[language as keyof typeof translations] || translations.en;
    return lang[key as keyof typeof lang] || key;
  }

  // Helper method to draw company header with fixed logo alignment
  private static drawCompanyHeader(doc: any, pageWidth: number, leftMargin: number, language: string) {
    // White background for entire header
    doc.rect(leftMargin, 40, pageWidth, 100).fill('#FFFFFF').stroke('#E5E5E5');
    
    // White logo area (circle with fancy black M)
    doc.circle(leftMargin + 55, 75, 30).fill('#FFFFFF').stroke('#CCCCCC');
    doc.fontSize(32).fillColor('#000000').font('Helvetica-Bold');
    doc.text('M', leftMargin + 47, 62);
    
    // Company name in black - properly aligned with correct spelling
    doc.fontSize(24).fillColor('#000000').font('Helvetica-Bold');
    doc.text('MANTAEUVERT', leftMargin + 100, 55);
    
    // Subtitle in dark gray - properly aligned with fixed text
    doc.fontSize(10).fillColor('#333333').font('Helvetica');
    doc.text(this.t('hrSystem', language), leftMargin + 90, 75);
    doc.text(`Email: ${this.t('email', language)} | Tel: ${this.t('phone', language)}`, leftMargin + 90, 88);
    doc.text(`Web: ${this.t('website', language)} | Address: ${this.t('location', language)}`, leftMargin + 90, 101);
    
    // Orange accent line
    doc.rect(leftMargin, 140, pageWidth, 2).fill('#FF6600');
  }

  // Helper method to draw compact professional table
  private static drawTable(doc: any, startX: number, startY: number, width: number, headers: string[], rows: any[][], options: any = {}) {
    const cellPadding = options.cellPadding || 8;
    const headerHeight = options.headerHeight || 25;
    const rowHeight = options.rowHeight || 20;
    const headerColor = options.headerColor || '#FF6600';
    const headerTextColor = options.headerTextColor || '#FFFFFF';
    const borderColor = options.borderColor || '#CCCCCC';
    const alternateRowColor = options.alternateRowColor || '#F9F9F9';
    
    const colWidth = width / headers.length;
    let currentY = startY;

    // Draw header with orange background
    doc.rect(startX, currentY, width, headerHeight).fill(headerColor).stroke(borderColor);
    doc.fontSize(9).fillColor(headerTextColor).font('Helvetica-Bold');
    
    headers.forEach((header, i) => {
      doc.text(header, startX + (i * colWidth) + cellPadding, currentY + (headerHeight / 2) - 4, {
        width: colWidth - (cellPadding * 2),
        align: 'left'
      });
    });

    currentY += headerHeight;

    // Draw rows with white/light gray alternating background
    rows.forEach((row, rowIndex) => {
      const rowColor = rowIndex % 2 === 0 ? '#FFFFFF' : alternateRowColor;
      doc.rect(startX, currentY, width, rowHeight).fill(rowColor).stroke(borderColor);

      doc.fontSize(8).fillColor('#000000').font('Helvetica');
      
      row.forEach((cell, cellIndex) => {
        const cellX = startX + (cellIndex * colWidth) + cellPadding;
        const cellY = currentY + (rowHeight / 2) - 3;
        
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

  // Helper method to draw compact signature section
  private static drawSignatureSection(doc: any, currentY: number, pageWidth: number, leftMargin: number, employeeName: string, language: string) {
    // Signature section title
    doc.fontSize(12).fillColor('#000000').font('Helvetica-Bold');
    doc.text(this.t('signatures', language), leftMargin, currentY);
    
    currentY += 25;
    
    // HR Signature Box
    const boxWidth = (pageWidth / 2) - 15;
    doc.rect(leftMargin, currentY, boxWidth, 80).fill('#FFFFFF').stroke('#CCCCCC');
    
    // HR Title with orange background
    doc.rect(leftMargin, currentY, boxWidth, 20).fill('#FF6600');
    doc.fontSize(9).fillColor('#FFFFFF').font('Helvetica-Bold');
    doc.text(this.t('hrDepartment', language), leftMargin + 8, currentY + 6);
    
    // HR signature area
    doc.fontSize(8).fillColor('#000000').font('Helvetica');
    doc.text(this.t('authorizedBy', language), leftMargin + 8, currentY + 30);
    
    // Signature line
    doc.moveTo(leftMargin + 8, currentY + 55).lineTo(leftMargin + boxWidth - 8, currentY + 55).stroke('#000000');
    doc.fontSize(7).fillColor('#666666').font('Helvetica');
    doc.text(this.t('hrSignature', language), leftMargin + 8, currentY + 60);
    doc.text(`${this.t('date', language)}: ${new Date().toLocaleDateString()}`, leftMargin + 8, currentY + 70);

    // Employee Signature Box
    const rightBoxX = leftMargin + boxWidth + 30;
    doc.rect(rightBoxX, currentY, boxWidth, 80).fill('#FFFFFF').stroke('#CCCCCC');
    
    // Employee Title with orange background
    doc.rect(rightBoxX, currentY, boxWidth, 20).fill('#FF6600');
    doc.fontSize(9).fillColor('#FFFFFF').font('Helvetica-Bold');
    doc.text(this.t('employeeAck', language), rightBoxX + 8, currentY + 6);
    
    // Employee signature area
    doc.fontSize(8).fillColor('#000000').font('Helvetica');
    doc.text(this.t('receivedBy', language), rightBoxX + 8, currentY + 30);
    
    // Signature line
    doc.moveTo(rightBoxX + 8, currentY + 55).lineTo(rightBoxX + boxWidth - 8, currentY + 55).stroke('#000000');
    doc.fontSize(7).fillColor('#666666').font('Helvetica');
    doc.text(this.t('employeeSignature', language), rightBoxX + 8, currentY + 60);
    doc.text(`${employeeName}`, rightBoxX + 8, currentY + 70);

    return currentY + 90;
  }

  // Helper method to draw compact footer
  private static drawFooter(doc: any, currentY: number, pageWidth: number, leftMargin: number, documentType: string, language: string) {
    // Orange footer background
    doc.rect(leftMargin, currentY, pageWidth, 40).fill('#FF6600');
    
    doc.fontSize(8).fillColor('#FFFFFF').font('Helvetica');
    doc.text(this.t('computerGenerated', language), leftMargin + 10, currentY + 5);
    doc.text(this.t('queries', language), leftMargin + 10, currentY + 15);
    
    doc.fontSize(7).fillColor('#FFE5CC');
    doc.text(`© ${new Date().getFullYear()} ${this.t('copyright', language)} ${new Date().toLocaleString()}`, leftMargin + 10, currentY + 28);
  }

  // Create individual salary slip PDF with language support
  private static createSalarySlipPDF(salary: any, user: any, language: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          margin: 30,
          size: 'A4',
          info: {
            Title: `${this.t('salarySlip', language)} - ${user.name} - ${salary.month} ${salary.year}`,
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
        const pageWidth = doc.page.width - 60;
        const leftMargin = 30;

        // Company Header with Orange Logo
        this.drawCompanyHeader(doc, pageWidth, leftMargin, language);

        // Document Title
        let currentY = 155;
        doc.fontSize(18).fillColor('#FF6600').font('Helvetica-Bold');
        doc.text(this.t('salarySlip', language), leftMargin, currentY);
        
        // Document Info Box - more compact
        doc.rect(pageWidth - 120, currentY - 5, 120, 50).fill('#FFFFFF').stroke('#FF6600');
        doc.fontSize(8).fillColor('#000000').font('Helvetica');
        doc.text(`${this.t('period', language)}: ${salary.month} ${salary.year}`, pageWidth - 115, currentY + 2);
        doc.text(`${this.t('slipNumber', language)}: ${salary._id.toString().slice(-8).toUpperCase()}`, pageWidth - 115, currentY + 12);
        doc.text(`${this.t('date', language)}: ${new Date().toLocaleDateString()}`, pageWidth - 115, currentY + 22);
        doc.text(`${this.t('status', language)}: ${salary.isPaid ? this.t('paid', language) : this.t('pending', language)}`, pageWidth - 115, currentY + 32);

        // Employee Information Table - more compact
        currentY = 220;
        doc.fontSize(12).fillColor('#000000').font('Helvetica-Bold');
        doc.text(this.t('employeeInfo', language), leftMargin, currentY);
        
        currentY += 20;
        const empHeaders = [this.t('description', language), this.t('value', language)];
        const empRows = [
          [this.t('employeeName', language), user.name || this.t('unknown', language)],
          [this.t('employeeId', language), `#${user._id.toString().slice(-8).toUpperCase()}`],
          [this.t('emailAddress', language), user.email || 'N/A'],
          [this.t('position', language), user.position || 'N/A'],
          [this.t('department', language), user.department || this.t('general', language)],
          [this.t('paymentStatus', language), { 
            text: salary.isPaid ? this.t('paid', language) + ' [PAID]' : this.t('pending', language) + ' [PENDING]', 
            color: salary.isPaid ? '#27AE60' : '#E74C3C',
            align: 'left'
          }]
        ];

        currentY = this.drawTable(doc, leftMargin, currentY, pageWidth, empHeaders, empRows, {
          headerColor: '#FF6600',
          alternateRowColor: '#F9F9F9',
          rowHeight: 18,
          headerHeight: 22
        });

        // Salary Breakdown Table - more compact
        currentY += 20;
        doc.fontSize(12).fillColor('#000000').font('Helvetica-Bold');
        doc.text(this.t('salaryBreakdown', language), leftMargin, currentY);
        
        currentY += 20;
        const salaryHeaders = [this.t('description', language), this.t('amount', language), this.t('type', language)];
        const salaryRows = [
          [this.t('baseSalary', language), `${(salary.baseSalary || 0).toFixed(2)}`, this.t('earning', language)],
          [this.t('overtimePay', language), `${(salary.overtime || 0).toFixed(2)}`, this.t('earning', language)],
          [this.t('bonuses', language), `${(salary.bonuses || 0).toFixed(2)}`, this.t('earning', language)],
          [this.t('deductions', language), {
            text: `-${(salary.deductions || 0).toFixed(2)}`,
            color: '#E74C3C'
          }, this.t('deduction', language)]
        ];

        currentY = this.drawTable(doc, leftMargin, currentY, pageWidth, salaryHeaders, salaryRows, {
          headerColor: '#FF6600',
          alternateRowColor: '#F9F9F9',
          rowHeight: 18,
          headerHeight: 22
        });

        // Net Salary Box - smaller and more compact
        currentY += 15;
        doc.rect(leftMargin, currentY, pageWidth, 35).fill('#FF6600').stroke('#E5E5E5');
        doc.fontSize(14).fillColor('#FFFFFF').font('Helvetica-Bold');
        doc.text(this.t('netSalary', language), leftMargin + 15, currentY + 10);
        doc.fontSize(16);
        doc.text(`${(salary.totalSalary || 0).toFixed(2)} DH`, pageWidth - 120, currentY + 8);

        // Signature Section (replaces attendance summary)
        currentY += 55;
        currentY = this.drawSignatureSection(doc, currentY, pageWidth, leftMargin, user.name, language);

        // Footer
        currentY += 15;
        this.drawFooter(doc, currentY, pageWidth, leftMargin, 'salary slip', language);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Create individual receipt PDF with language support
  private static createReceiptPDF(receipt: any, user: any, language: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          margin: 30,
          size: 'A4',
          info: {
            Title: `${this.t('paymentReceipt', language)} - ${user.name} - ${receipt._id.toString().slice(-8).toUpperCase()}`,
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
        const pageWidth = doc.page.width - 60;
        const leftMargin = 30;

        // Company Header with Orange Logo
        this.drawCompanyHeader(doc, pageWidth, leftMargin, language);

        // Document Title
        let currentY = 155;
        doc.fontSize(18).fillColor('#FF6600').font('Helvetica-Bold');
        doc.text(this.t('paymentReceipt', language), leftMargin, currentY);
        
        // Receipt Info Box - more compact
        doc.rect(pageWidth - 120, currentY - 5, 120, 60).fill('#FFFFFF').stroke('#FF6600');
        doc.fontSize(8).fillColor('#000000').font('Helvetica');
        doc.text(`${this.t('receiptNumber', language)}: ${receipt._id.toString().slice(-8).toUpperCase()}`, pageWidth - 115, currentY + 2);
        doc.text(`${this.t('date', language)}: ${new Date(receipt.date).toLocaleDateString()}`, pageWidth - 115, currentY + 12);
        doc.text(`${this.t('time', language)}: ${new Date(receipt.date).toLocaleTimeString()}`, pageWidth - 115, currentY + 22);
        doc.text(`${this.t('type', language)}: ${receipt.type.toUpperCase()}`, pageWidth - 115, currentY + 32);

        // Recipient Information Table - more compact
        currentY = 230;
        doc.fontSize(12).fillColor('#000000').font('Helvetica-Bold');
        doc.text(this.t('recipientInfo', language), leftMargin, currentY);
        
        currentY += 20;
        const empHeaders = [this.t('description', language), this.t('value', language)];
        const empRows = [
          [this.t('recipientName', language), user.name || this.t('unknown', language)],
          [this.t('employeeId', language), `#${user._id.toString().slice(-8).toUpperCase()}`],
          [this.t('emailAddress', language), user.email || 'N/A'],
          [this.t('position', language), user.position || 'N/A'],
          [this.t('receiptType', language), receipt.type.charAt(0).toUpperCase() + receipt.type.slice(1)]
        ];

        currentY = this.drawTable(doc, leftMargin, currentY, pageWidth, empHeaders, empRows, {
          headerColor: '#FF6600',
          alternateRowColor: '#F9F9F9',
          rowHeight: 18,
          headerHeight: 22
        });

        // Amount Section - smaller
        currentY += 20;
        doc.rect(leftMargin, currentY, pageWidth, 45).fill('#FF6600').stroke('#E5E5E5');
        doc.fontSize(14).fillColor('#FFFFFF').font('Helvetica-Bold');
        doc.text(this.t('totalAmount', language), leftMargin + 15, currentY + 10);
        doc.fontSize(20);
        doc.text(`${(receipt.amount || 0).toFixed(2)} DH`, leftMargin + 15, currentY + 25);

        // Payment Details Table - more compact
        currentY += 65;
        doc.fontSize(12).fillColor('#000000').font('Helvetica-Bold');
        doc.text(this.t('paymentDetails', language), leftMargin, currentY);
        
        currentY += 20;
        const paymentHeaders = [this.t('description', language), this.t('value', language)];
        const paymentRows = [
          [this.t('paymentMethod', language), this.t('companyTransfer', language)],
          [this.t('transactionId', language), receipt._id.toString().slice(-12).toUpperCase()],
          [this.t('processingDate', language), new Date(receipt.date).toLocaleDateString()],
          [this.t('currency', language), this.t('moroccanDirham', language)],
          [this.t('status', language), { text: this.t('completed', language) + ' [COMPLETED]', color: '#27AE60' }]
        ];

        currentY = this.drawTable(doc, leftMargin, currentY, pageWidth, paymentHeaders, paymentRows, {
          headerColor: '#FF6600',
          alternateRowColor: '#F9F9F9',
          rowHeight: 18,
          headerHeight: 22
        });

        // Description Section - more compact
        currentY += 20;
        doc.fontSize(12).fillColor('#000000').font('Helvetica-Bold');
        doc.text(this.t('description', language), leftMargin, currentY);
        
        currentY += 15;
        doc.rect(leftMargin, currentY, pageWidth, 40).fill('#FFFFFF').stroke('#CCCCCC');
        doc.fontSize(9).fillColor('#000000').font('Helvetica');
        doc.text(receipt.description || this.t('noDescription', language), leftMargin + 10, currentY + 10, { 
          width: pageWidth - 20,
          align: 'left'
        });

        // Signature Section
        currentY += 60;
        currentY = this.drawSignatureSection(doc, currentY, pageWidth, leftMargin, user.name, language);

        // Footer
        currentY += 15;
        this.drawFooter(doc, currentY, pageWidth, leftMargin, 'receipt', language);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Create all salaries PDF with language support
  private static createAllSalariesPDF(salaryRecords: any[], language: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          margin: 30,
          size: 'A4',
          info: {
            Title: this.t('allSalariesReport', language),
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

        const pageWidth = doc.page.width - 60;
        const leftMargin = 30;

        // Company Header
        this.drawCompanyHeader(doc, pageWidth, leftMargin, language);

        // Report Title
        let currentY = 155;
        doc.fontSize(18).fillColor('#FF6600').font('Helvetica-Bold');
        doc.text(this.t('allSalariesReport', language), leftMargin, currentY);
        
        doc.fontSize(10).fillColor('#000000').font('Helvetica');
        doc.text(`${this.t('generatedOn', language)} ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, leftMargin, currentY + 25);
        doc.text(`${this.t('totalRecords', language)}: ${salaryRecords.length}`, leftMargin, currentY + 35);

        // Summary Statistics
        const totalPaid = salaryRecords.reduce((sum, salary) => sum + (salary.totalSalary || 0), 0);
        const paidCount = salaryRecords.filter(salary => salary.isPaid).length;
        const pendingCount = salaryRecords.length - paidCount;

        currentY += 55;
        doc.fontSize(12).fillColor('#000000').font('Helvetica-Bold');
        doc.text(this.t('summaryStats', language), leftMargin, currentY);

        currentY += 20;
        const summaryHeaders = [this.t('metric', language), this.t('value', language)];
        const summaryRows = [
          [this.t('totalRecords', language), salaryRecords.length.toString()],
          ['Total Amount Paid', `${totalPaid.toFixed(2)} DH`],
          ['Paid Salaries', paidCount.toString()],
          ['Pending Salaries', pendingCount.toString()],
          ['Average Salary', `${(totalPaid / salaryRecords.length || 0).toFixed(2)} DH`]
        ];

        currentY = this.drawTable(doc, leftMargin, currentY, pageWidth, summaryHeaders, summaryRows, {
          headerColor: '#FF6600',
          alternateRowColor: '#F9F9F9',
          rowHeight: 18,
          headerHeight: 22
        });

        // Detailed Records
        currentY += 30;
        doc.fontSize(12).fillColor('#000000').font('Helvetica-Bold');
        doc.text(this.t('detailedRecords', language), leftMargin, currentY);

        currentY += 20;
        const detailHeaders = [this.t('employee', language), this.t('period', language), this.t('amount', language), this.t('status', language)];
        const detailRows = salaryRecords.slice(0, 20).map(salary => { // Limit to first 20 for space
          const user = salary.userId as any;
          return [
            user.name || this.t('unknown', language),
            `${salary.month} ${salary.year}`,
            `${(salary.totalSalary || 0).toFixed(2)} DH`,
            {
              text: salary.isPaid ? this.t('paid', language) : this.t('pending', language),
              color: salary.isPaid ? '#27AE60' : '#E74C3C'
            }
          ];
        });

        this.drawTable(doc, leftMargin, currentY, pageWidth, detailHeaders, detailRows, {
          headerColor: '#FF6600',
          alternateRowColor: '#F9F9F9',
          rowHeight: 16,
          headerHeight: 20
        });

        // Footer
        const footerY = doc.page.height - 70;
        this.drawFooter(doc, footerY, pageWidth, leftMargin, 'salary report', language);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Create all receipts PDF with language support
  private static createAllReceiptsPDF(receipts: any[], language: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          margin: 30,
          size: 'A4',
          info: {
            Title: this.t('allReceiptsReport', language),
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

        const pageWidth = doc.page.width - 60;
        const leftMargin = 30;

        // Company Header
        this.drawCompanyHeader(doc, pageWidth, leftMargin, language);

        // Report Title
        let currentY = 155;
        doc.fontSize(18).fillColor('#FF6600').font('Helvetica-Bold');
        doc.text(this.t('allReceiptsReport', language), leftMargin, currentY);
        
        doc.fontSize(10).fillColor('#000000').font('Helvetica');
        doc.text(`${this.t('generatedOn', language)} ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, leftMargin, currentY + 25);
        doc.text(`${this.t('totalRecords', language)}: ${receipts.length}`, leftMargin, currentY + 35);

        // Summary Statistics
        const totalAmount = receipts.reduce((sum, receipt) => sum + (receipt.amount || 0), 0);
        const typeGroups = receipts.reduce((acc, receipt) => {
          acc[receipt.type] = (acc[receipt.type] || 0) + 1;
          return acc;
        }, {} as any);

        currentY += 55;
        doc.fontSize(12).fillColor('#000000').font('Helvetica-Bold');
        doc.text(this.t('summaryStats', language), leftMargin, currentY);

        currentY += 20;
        const summaryHeaders = [this.t('metric', language), this.t('value', language)];
        const summaryRows = [
          [this.t('totalRecords', language), receipts.length.toString()],
          ['Total Amount', `${totalAmount.toFixed(2)} DH`],
          ['Average Amount', `${(totalAmount / receipts.length || 0).toFixed(2)} DH`],
          ...Object.entries(typeGroups).map(([type, count]) => [
            `${type.charAt(0).toUpperCase() + type.slice(1)} Receipts`,
            count.toString()
          ])
        ];

        currentY = this.drawTable(doc, leftMargin, currentY, pageWidth, summaryHeaders, summaryRows, {
          headerColor: '#FF6600',
          alternateRowColor: '#F9F9F9',
          rowHeight: 18,
          headerHeight: 22
        });

        // Detailed Records
        currentY += 30;
        doc.fontSize(12).fillColor('#000000').font('Helvetica-Bold');
        doc.text(this.t('detailedReceiptRecords', language), leftMargin, currentY);

        currentY += 20;
        const detailHeaders = [this.t('recipient', language), this.t('type', language), this.t('amount', language), this.t('date', language)];
        const detailRows = receipts.slice(0, 20).map(receipt => { // Limit to first 20 for space
          const user = receipt.userId as any;
          return [
            user.name || this.t('unknown', language),
            receipt.type.charAt(0).toUpperCase() + receipt.type.slice(1),
            `${(receipt.amount || 0).toFixed(2)} DH`,
            new Date(receipt.date).toLocaleDateString()
          ];
        });

        this.drawTable(doc, leftMargin, currentY, pageWidth, detailHeaders, detailRows, {
          headerColor: '#FF6600',
          alternateRowColor: '#F9F9F9',
          rowHeight: 16,
          headerHeight: 20
        });

        // Footer
        const footerY = doc.page.height - 70;
        this.drawFooter(doc, footerY, pageWidth, leftMargin, 'receipts report', language);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}