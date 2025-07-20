import PDFDocument from 'pdfkit';
import { User } from '../models/User';
import { Salary } from '../models/Salary';
import { Attendance } from '../models/Attendance';
import { Receipt } from '../models/Receipt';

// PDF Translations
const pdfTranslations = {
  en: {
    salarySlip: 'SALARY SLIP',
    paymentReceipt: 'PAYMENT RECEIPT',
    allSalariesReport: 'All Salaries Report',
    allReceiptsReport: 'All Receipts Report',
    humanResourcesManagementSystem: 'Human Resources Management System',
    employeeInformation: 'Employee Information',
    recipientInformation: 'Recipient Information',
    employeeName: 'Employee Name:',
    recipientName: 'Recipient Name:',
    employeeId: 'Employee ID:',
    position: 'Position:',
    department: 'Department:',
    status: 'Status:',
    email: 'Email:',
    receiptType: 'Receipt Type:',
    salaryBreakdown: 'Salary Breakdown',
    paymentDetails: 'Payment Details',
    description: 'Description',
    amount: 'Amount (DH)',
    information: 'Information',
    type: 'Type',
    baseSalary: 'Base Salary',
    overtimePay: 'Overtime Pay',
    bonuses: 'Bonuses',
    deductions: 'Deductions',
    earning: 'Earning',
    deduction: 'Deduction',
    netSalary: 'NET SALARY:',
    totalAmount: 'TOTAL AMOUNT:',
    attendanceSummary: 'Attendance Summary',
    metric: 'Metric',
    count: 'Count',
    details: 'Details',
    workingDays: 'Working Days',
    presentDays: 'Present Days',
    absentDays: 'Absent Days',
    hoursWorked: 'Hours Worked',
    totalDays: 'Total days',
    daysAttended: 'Days attended',
    daysMissed: 'Days missed',
    totalHours: 'Total hours',
    authorizedSignatures: 'Authorized Signatures',
    hrDepartment: 'HR Department',
    employee: 'Employee',
    recipient: 'Recipient',
    signatureDate: 'Signature & Date',
    paymentMethod: 'Payment Method',
    transactionId: 'Transaction ID',
    processingDate: 'Processing Date',
    completed: 'COMPLETED ✓',
    companyTransfer: 'Company Transfer',
    noDescriptionProvided: 'No description provided',
    computerGeneratedDocument: 'This is a computer-generated document. For queries, contact HR at hr@mantaevert.com',
    computerGeneratedReceipt: 'This is a computer-generated receipt. Keep this document for your records.',
    generatedOn: 'Generated on',
    period: 'Period:',
    slipNumber: 'Slip #:',
    receiptNumber: 'Receipt #:',
    date: 'Date:',
    time: 'Time:',
    paid: 'PAID ✓',
    pending: 'PENDING',
    general: 'General',
    total: 'Total:'
  },
  fr: {
    salarySlip: 'FICHE DE PAIE',
    paymentReceipt: 'REÇU DE PAIEMENT',
    allSalariesReport: 'Rapport de tous les salaires',
    allReceiptsReport: 'Rapport de tous les reçus',
    humanResourcesManagementSystem: 'Système de gestion des ressources humaines',
    employeeInformation: 'Informations sur l\'employé',
    recipientInformation: 'Informations sur le destinataire',
    employeeName: 'Nom de l\'employé:',
    recipientName: 'Nom du destinataire:',
    employeeId: 'ID employé:',
    position: 'Poste:',
    department: 'Département:',
    status: 'Statut:',
    email: 'Email:',
    receiptType: 'Type de reçu:',
    salaryBreakdown: 'Détail du salaire',
    paymentDetails: 'Détails du paiement',
    description: 'Description',
    amount: 'Montant (DH)',
    information: 'Information',
    type: 'Type',
    baseSalary: 'Salaire de base',
    overtimePay: 'Heures supplémentaires',
    bonuses: 'Primes',
    deductions: 'Déductions',
    earning: 'Gain',
    deduction: 'Déduction',
    netSalary: 'SALAIRE NET:',
    totalAmount: 'MONTANT TOTAL:',
    attendanceSummary: 'Résumé de présence',
    metric: 'Métrique',
    count: 'Nombre',
    details: 'Détails',
    workingDays: 'Jours de travail',
    presentDays: 'Jours présents',
    absentDays: 'Jours absents',
    hoursWorked: 'Heures travaillées',
    totalDays: 'Total des jours',
    daysAttended: 'Jours présents',
    daysMissed: 'Jours manqués',
    totalHours: 'Total des heures',
    authorizedSignatures: 'Signatures autorisées',
    hrDepartment: 'Département RH',
    employee: 'Employé',
    recipient: 'Destinataire',
    signatureDate: 'Signature et date',
    paymentMethod: 'Méthode de paiement',
    transactionId: 'ID de transaction',
    processingDate: 'Date de traitement',
    completed: 'TERMINÉ ✓',
    companyTransfer: 'Virement d\'entreprise',
    noDescriptionProvided: 'Aucune description fournie',
    computerGeneratedDocument: 'Ceci est un document généré par ordinateur. Pour toute question, contactez RH à hr@mantaevert.com',
    computerGeneratedReceipt: 'Ceci est un reçu généré par ordinateur. Conservez ce document pour vos dossiers.',
    generatedOn: 'Généré le',
    period: 'Période:',
    slipNumber: 'Fiche #:',
    receiptNumber: 'Reçu #:',
    date: 'Date:',
    time: 'Heure:',
    paid: 'PAYÉ ✓',
    pending: 'EN ATTENTE',
    general: 'Général',
    total: 'Total:'
  },
  ar: {
    salarySlip: 'قسيمة الراتب',
    paymentReceipt: 'ايصال الدفع',
    allSalariesReport: 'تقرير جميع الرواتب',
    allReceiptsReport: 'تقرير جميع الايصالات',
    humanResourcesManagementSystem: 'نظام ادارة الموارد البشرية',
    employeeInformation: 'معلومات الموظف',
    recipientInformation: 'معلومات المستلم',
    employeeName: 'اسم الموظف:',
    recipientName: 'اسم المستلم:',
    employeeId: 'معرف الموظف:',
    position: 'المنصب:',
    department: 'القسم:',
    status: 'الحالة:',
    email: 'البريد الالكتروني:',
    receiptType: 'نوع الايصال:',
    salaryBreakdown: 'تفصيل الراتب',
    paymentDetails: 'تفاصيل الدفع',
    description: 'الوصف',
    amount: 'المبلغ (درهم)',
    information: 'المعلومات',
    type: 'النوع',
    baseSalary: 'الراتب الاساسي',
    overtimePay: 'اجر العمل الاضافي',
    bonuses: 'المكافآت',
    deductions: 'الخصومات',
    earning: 'كسب',
    deduction: 'خصم',
    netSalary: 'صافي الراتب:',
    totalAmount: 'المبلغ الاجمالي:',
    attendanceSummary: 'ملخص الحضور',
    metric: 'المقياس',
    count: 'العدد',
    details: 'التفاصيل',
    workingDays: 'ايام العمل',
    presentDays: 'ايام الحضور',
    absentDays: 'ايام الغياب',
    hoursWorked: 'ساعات العمل',
    totalDays: 'اجمالي الايام',
    daysAttended: 'ايام الحضور',
    daysMissed: 'ايام الغياب',
    totalHours: 'اجمالي الساعات',
    authorizedSignatures: 'التوقيعات المعتمدة',
    hrDepartment: 'قسم الموارد البشرية',
    employee: 'الموظف',
    recipient: 'المستلم',
    signatureDate: 'التوقيع والتاريخ',
    paymentMethod: 'طريقة الدفع',
    transactionId: 'معرف المعاملة',
    processingDate: 'تاريخ المعالجة',
    completed: 'مكتمل ✓',
    companyTransfer: 'تحويل الشركة',
    noDescriptionProvided: 'لم يتم تقديم وصف',
    computerGeneratedDocument: 'هذه وثيقة منشأة بواسطة الكمبيوتر. للاستفسارات، اتصل بالموارد البشرية',
    computerGeneratedReceipt: 'هذا ايصال منشأ بواسطة الكمبيوتر. احتفظ بهذه الوثيقة لسجلاتك.',
    generatedOn: 'تم الانشاء في',
    period: 'الفترة:',
    slipNumber: 'رقم القسيمة:',
    receiptNumber: 'رقم الايصال:',
    date: 'التاريخ:',
    time: 'الوقت:',
    paid: 'مدفوع ✓',
    pending: 'معلق',
    general: 'عام',
    total: 'المجموع:'
  }
};

export type Language = 'en' | 'fr' | 'ar';

export class PDFService {
  // Helper method to determine if language is RTL
  private static isRTL(language: Language): boolean {
    return language === 'ar';
  }

  // Helper method to safely render text (fallback for Arabic)
  private static safeText(text: string, language: Language): string {
    if (language === 'ar') {
      // For Arabic, we'll use a simplified approach
      // Remove complex Arabic characters that might not render properly
      return text.replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0020-\u007F]/g, '');
    }
    return text;
  }

  // Individual Salary Slip PDF Generation
  static async generateIndividualSalarySlipPDF(salaryId: string, language: Language = 'en'): Promise<Buffer> {
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

  // Individual Receipt PDF Generation
  static async generateIndividualReceiptPDF(receiptId: string, language: Language = 'en'): Promise<Buffer> {
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

  // Bulk exports
  static async generateAllSalariesPDF(language: Language = 'en'): Promise<Buffer> {
    try {
      const salaryRecords = await Salary.find({})
        .populate('userId', 'name email position')
        .sort({ year: -1, month: -1 });
      return this.createAllSalariesPDF(salaryRecords, language);
    } catch (error) {
      throw error;
    }
  }

  static async generateAllReceiptsPDF(language: Language = 'en'): Promise<Buffer> {
    try {
      const receipts = await Receipt.find({})
        .populate('userId', 'name email')
        .sort({ date: -1 });
      return this.createAllReceiptsPDF(receipts, language);
    } catch (error) {
      throw error;
    }
  }

  // Create individual salary slip PDF with improved Arabic support
  private static createSalarySlipPDF(salary: any, user: any, language: Language = 'en'): Promise<Buffer> {
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
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        const pageWidth = doc.page.width - 100;
        const isRTL = this.isRTL(language);
        const t = pdfTranslations[language];

        // Use default font for all languages (better Arabic support than custom fonts)
        doc.font('Helvetica');

        // Header - Company name always LTR
        doc.fontSize(36).fillColor('#FF6600').font('Helvetica-Bold');
        doc.text('MANTAEVERT', isRTL ? pageWidth - 200 : 50, 50);
        
        doc.fontSize(12).fillColor('#000000').font('Helvetica');
        const systemText = this.safeText(t.humanResourcesManagementSystem, language);
        doc.text(systemText, 50, 90, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });
        
        // Document Title
        doc.fontSize(20).fillColor('#000000').font('Helvetica-Bold');
        const titleText = this.safeText(t.salarySlip, language);
        doc.text(titleText, 50, 120, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });
        
        // Document Info - Always on the right for all languages
        doc.fontSize(10).fillColor('#000000').font('Helvetica');
        const infoX = pageWidth - 150;
        doc.text(`${this.safeText(t.period, language)} ${salary.month} ${salary.year}`, infoX, 50, {
          width: 150,
          align: 'right'
        });
        doc.text(`${this.safeText(t.slipNumber, language)} ${salary._id.toString().slice(-8).toUpperCase()}`, infoX, 65, {
          width: 150,
          align: 'right'
        });
        doc.text(`${this.safeText(t.date, language)} ${new Date().toLocaleDateString()}`, infoX, 80, {
          width: 150,
          align: 'right'
        });

        let currentY = 160;

        // Employee Information
        doc.fontSize(14).fillColor('#000000').font('Helvetica-Bold');
        const empInfoText = this.safeText(t.employeeInformation, language);
        doc.text(empInfoText, 50, currentY, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });
        currentY += 20;

        const empData = [
          [this.safeText(t.employeeName, language), user.name || 'N/A'],
          [this.safeText(t.employeeId, language), `#${user._id.toString().slice(-8).toUpperCase()}`],
          [this.safeText(t.position, language), user.position || 'N/A'],
          [this.safeText(t.department, language), this.safeText(t.general, language)],
          [this.safeText(t.status, language), salary.isPaid ? this.safeText(t.paid, language) : this.safeText(t.pending, language)]
        ];

        empData.forEach(([label, value]) => {
          doc.fontSize(10).fillColor('#000000').font('Helvetica-Bold');
          if (isRTL) {
            // RTL layout: value on left, label on right
            doc.text(value, 50, currentY, { width: 200 });
            doc.text(label, pageWidth - 200, currentY, { width: 190, align: 'right' });
          } else {
            // LTR layout: label on left, value on right
            doc.text(label, 50, currentY, { width: 120 });
            doc.font('Helvetica');
            doc.text(value, 170, currentY);
          }
          currentY += 15;
        });

        currentY += 20;

        // Salary Breakdown Table
        doc.fontSize(14).fillColor('#000000').font('Helvetica-Bold');
        const breakdownText = this.safeText(t.salaryBreakdown, language);
        doc.text(breakdownText, 50, currentY, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });
        currentY += 25;

        // Table Header
        doc.rect(50, currentY, pageWidth, 25).fill('#FF6600');
        doc.fontSize(11).fillColor('#FFFFFF').font('Helvetica-Bold');
        
        if (isRTL) {
          // RTL table headers
          doc.text(this.safeText(t.type, language), 60, currentY + 8, { width: 100, align: 'right' });
          doc.text(this.safeText(t.amount, language), 200, currentY + 8, { width: 100, align: 'right' });
          doc.text(this.safeText(t.description, language), pageWidth - 150, currentY + 8, { width: 140, align: 'right' });
        } else {
          // LTR table headers
          doc.text(this.safeText(t.description, language), 60, currentY + 8);
          doc.text(this.safeText(t.amount, language), 250, currentY + 8);
          doc.text(this.safeText(t.type, language), 400, currentY + 8);
        }
        currentY += 25;

        // Table Rows
        const salaryData = [
          [this.safeText(t.baseSalary, language), (salary.baseSalary || 0).toFixed(2), this.safeText(t.earning, language)],
          [this.safeText(t.overtimePay, language), (salary.overtime || 0).toFixed(2), this.safeText(t.earning, language)],
          [this.safeText(t.bonuses, language), (salary.bonuses || 0).toFixed(2), this.safeText(t.earning, language)],
          [this.safeText(t.deductions, language), (salary.deductions || 0).toFixed(2), this.safeText(t.deduction, language)]
        ];

        salaryData.forEach(([desc, amount, type], index) => {
          const bgColor = index % 2 === 0 ? '#F8F9FA' : '#FFFFFF';
          doc.rect(50, currentY, pageWidth, 20).fill(bgColor).stroke('#E0E0E0');
          doc.fontSize(10).fillColor('#000000').font('Helvetica');
          
          if (isRTL) {
            // RTL table data
            doc.text(type, 60, currentY + 6, { width: 100, align: 'right' });
            doc.text(`${amount} DH`, 200, currentY + 6, { width: 100, align: 'right' });
            doc.text(desc, pageWidth - 150, currentY + 6, { width: 140, align: 'right' });
          } else {
            // LTR table data
            doc.text(desc, 60, currentY + 6);
            doc.text(`${amount} DH`, 250, currentY + 6);
            doc.text(type, 400, currentY + 6);
          }
          currentY += 20;
        });

        // Total Section
        currentY += 10;
        doc.rect(50, currentY, pageWidth, 30).fill('#FF6600');
        doc.fontSize(14).fillColor('#FFFFFF').font('Helvetica-Bold');
        
        const netSalaryText = this.safeText(t.netSalary, language);
        const totalAmount = `${(salary.totalSalary || 0).toFixed(2)} DH`;
        
        if (isRTL) {
          doc.text(totalAmount, 200, currentY + 8, { width: 100, align: 'right' });
          doc.text(netSalaryText, pageWidth - 200, currentY + 8, { width: 190, align: 'right' });
        } else {
          doc.text(netSalaryText, 60, currentY + 8);
          doc.text(totalAmount, 250, currentY + 8);
        }
        currentY += 50;

        // Signatures
        doc.fontSize(12).fillColor('#000000').font('Helvetica-Bold');
        const signaturesText = this.safeText(t.authorizedSignatures, language);
        doc.text(signaturesText, 50, currentY, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });
        currentY += 30;

        doc.fontSize(10).fillColor('#000000').font('Helvetica');
        const hrText = this.safeText(t.hrDepartment, language);
        const employeeText = this.safeText(t.employee, language);
        const signatureDateText = this.safeText(t.signatureDate, language);
        
        if (isRTL) {
          // RTL signatures
          doc.text(employeeText, pageWidth - 150, currentY, { width: 140, align: 'right' });
          doc.moveTo(pageWidth - 150, currentY + 30).lineTo(pageWidth - 10, currentY + 30).stroke('#000000');
          doc.text(`${user.name}`, pageWidth - 150, currentY + 35, { width: 140, align: 'right' });

          doc.text(hrText, 50, currentY, { width: 150 });
          doc.moveTo(50, currentY + 30).lineTo(200, currentY + 30).stroke('#000000');
          doc.text(signatureDateText, 50, currentY + 35);
        } else {
          // LTR signatures
          doc.text(hrText, 50, currentY);
          doc.moveTo(50, currentY + 30).lineTo(200, currentY + 30).stroke('#000000');
          doc.text(signatureDateText, 50, currentY + 35);

          doc.text(employeeText, 300, currentY);
          doc.moveTo(300, currentY + 30).lineTo(450, currentY + 30).stroke('#000000');
          doc.text(`${user.name}`, 300, currentY + 35);
        }

        // Footer
        currentY += 80;
        doc.fontSize(8).fillColor('#666666').font('Helvetica');
        const footerText = this.safeText(t.computerGeneratedDocument, language);
        const generatedText = `${this.safeText(t.generatedOn, language)} ${new Date().toLocaleString()}`;
        
        doc.text(footerText, 50, currentY, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });
        doc.text(generatedText, 50, currentY + 12, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Create individual receipt PDF with improved Arabic support
  private static createReceiptPDF(receipt: any, user: any, language: Language = 'en'): Promise<Buffer> {
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
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        const pageWidth = doc.page.width - 100;
        const isRTL = this.isRTL(language);
        const t = pdfTranslations[language];

        // Use default font
        doc.font('Helvetica');

        // Header - Company name always LTR
        doc.fontSize(36).fillColor('#FF6600').font('Helvetica-Bold');
        doc.text('MANTAEVERT', isRTL ? pageWidth - 200 : 50, 50);
        
        doc.fontSize(12).fillColor('#000000').font('Helvetica');
        const systemText = this.safeText(t.humanResourcesManagementSystem, language);
        doc.text(systemText, 50, 90, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });
        
        // Document Title
        doc.fontSize(20).fillColor('#000000').font('Helvetica-Bold');
        const titleText = this.safeText(t.paymentReceipt, language);
        doc.text(titleText, 50, 120, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });
        
        // Document Info - Always on the right
        doc.fontSize(10).fillColor('#000000').font('Helvetica');
        const infoX = pageWidth - 150;
        doc.text(`${this.safeText(t.receiptNumber, language)} ${receipt._id.toString().slice(-8).toUpperCase()}`, infoX, 50, {
          width: 150,
          align: 'right'
        });
        doc.text(`${this.safeText(t.date, language)} ${new Date(receipt.date).toLocaleDateString()}`, infoX, 65, {
          width: 150,
          align: 'right'
        });
        doc.text(`${this.safeText(t.time, language)} ${new Date(receipt.date).toLocaleTimeString()}`, infoX, 80, {
          width: 150,
          align: 'right'
        });

        let currentY = 160;

        // Recipient Information
        doc.fontSize(14).fillColor('#000000').font('Helvetica-Bold');
        const recipientInfoText = this.safeText(t.recipientInformation, language);
        doc.text(recipientInfoText, 50, currentY, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });
        currentY += 20;

        const recipientData = [
          [this.safeText(t.recipientName, language), user.name || 'N/A'],
          [this.safeText(t.employeeId, language), `#${user._id.toString().slice(-8).toUpperCase()}`],
          [this.safeText(t.email, language), user.email || 'N/A'],
          [this.safeText(t.receiptType, language), receipt.type.charAt(0).toUpperCase() + receipt.type.slice(1)]
        ];

        recipientData.forEach(([label, value]) => {
          doc.fontSize(10).fillColor('#000000').font('Helvetica-Bold');
          if (isRTL) {
            // RTL layout
            doc.text(value, 50, currentY, { width: 200 });
            doc.text(label, pageWidth - 200, currentY, { width: 190, align: 'right' });
          } else {
            // LTR layout
            doc.text(label, 50, currentY, { width: 120 });
            doc.font('Helvetica');
            doc.text(value, 170, currentY);
          }
          currentY += 15;
        });

        currentY += 30;

        // Amount Section - Always on the right side for visual impact
        const amountBoxWidth = 200;
        const amountBoxX = pageWidth - amountBoxWidth + 50;
        doc.rect(amountBoxX, currentY, amountBoxWidth, 35).fill('#FF6600');
        doc.fontSize(12).fillColor('#FFFFFF').font('Helvetica-Bold');
        const totalAmountText = this.safeText(t.totalAmount, language);
        doc.text(totalAmountText, amountBoxX + 15, currentY + 6, {
          width: amountBoxWidth - 30,
          align: isRTL ? 'right' : 'left'
        });
        doc.fontSize(18);
        doc.text(`${(receipt.amount || 0).toFixed(2)} DH`, amountBoxX + 15, currentY + 18, {
          width: amountBoxWidth - 30,
          align: isRTL ? 'right' : 'left'
        });
        currentY += 50;

        // Footer
        currentY += 80;
        doc.fontSize(8).fillColor('#666666').font('Helvetica');
        const footerText = this.safeText(t.computerGeneratedReceipt, language);
        const generatedText = `${this.safeText(t.generatedOn, language)} ${new Date().toLocaleString()}`;
        
        doc.text(footerText, 50, currentY, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });
        doc.text(generatedText, 50, currentY + 12, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Create all salaries PDF with improved Arabic support
  private static createAllSalariesPDF(salaryRecords: any[], language: Language = 'en'): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        const pageWidth = doc.page.width - 100;
        const isRTL = this.isRTL(language);
        const t = pdfTranslations[language];

        // Use default font
        doc.font('Helvetica');

        // Header
        doc.fontSize(36).fillColor('#FF6600').font('Helvetica-Bold');
        doc.text('MANTAEVERT', isRTL ? pageWidth - 200 : 50, 50);
        
        doc.fontSize(18).fillColor('#000000').font('Helvetica-Bold');
        const reportText = this.safeText(t.allSalariesReport, language);
        doc.text(reportText, 50, 100, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });
        
        doc.fontSize(12).fillColor('#000000').font('Helvetica');
        const generatedText = `${this.safeText(t.generatedOn, language)} ${new Date().toLocaleDateString()}`;
        doc.text(generatedText, 50, 125, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });

        let yPos = 160;
        salaryRecords.forEach((salary, index) => {
          if (yPos > 700) {
            doc.addPage();
            yPos = 50;
          }
          const user = salary.userId as any;
          doc.fontSize(12).fillColor('#FF6600').font('Helvetica-Bold');
          
          const entryText = `${index + 1}. ${user.name}`;
          const detailText = `${salary.month} ${salary.year} - ${this.safeText(t.total, language)} ${salary.totalSalary?.toFixed(2) || '0.00'} DH`;
          
          if (isRTL) {
            doc.text(entryText, 50, yPos, { width: pageWidth, align: 'right' });
            yPos += 15;
            doc.fontSize(10).fillColor('#000000').font('Helvetica');
            doc.text(detailText, 50, yPos, { width: pageWidth, align: 'right' });
          } else {
            doc.text(entryText, 50, yPos);
            yPos += 15;
            doc.fontSize(10).fillColor('#000000').font('Helvetica');
            doc.text(detailText, 70, yPos);
          }
          yPos += 25;
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Create all receipts PDF with improved Arabic support
  private static createAllReceiptsPDF(receipts: any[], language: Language = 'en'): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        const pageWidth = doc.page.width - 100;
        const isRTL = this.isRTL(language);
        const t = pdfTranslations[language];

        // Use default font
        doc.font('Helvetica');

        // Header
        doc.fontSize(36).fillColor('#FF6600').font('Helvetica-Bold');
        doc.text('MANTAEVERT', isRTL ? pageWidth - 200 : 50, 50);
        
        doc.fontSize(18).fillColor('#000000').font('Helvetica-Bold');
        const reportText = this.safeText(t.allReceiptsReport, language);
        doc.text(reportText, 50, 100, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });
        
        doc.fontSize(12).fillColor('#000000').font('Helvetica');
        const generatedText = `${this.safeText(t.generatedOn, language)} ${new Date().toLocaleDateString()}`;
        doc.text(generatedText, 50, 125, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });

        let yPos = 160;
        receipts.forEach((receipt, index) => {
          if (yPos > 700) {
            doc.addPage();
            yPos = 50;
          }
          const user = receipt.userId as any;
          doc.fontSize(12).fillColor('#FF6600').font('Helvetica-Bold');
          
          const entryText = `${index + 1}. ${user.name}`;
          const detailText = `${receipt.type} - ${receipt.amount?.toFixed(2) || '0.00'} DH - ${new Date(receipt.date).toLocaleDateString()}`;
          
          if (isRTL) {
            doc.text(entryText, 50, yPos, { width: pageWidth, align: 'right' });
            yPos += 15;
            doc.fontSize(10).fillColor('#000000').font('Helvetica');
            doc.text(detailText, 50, yPos, { width: pageWidth, align: 'right' });
          } else {
            doc.text(entryText, 50, yPos);
            yPos += 15;
            doc.fontSize(10).fillColor('#000000').font('Helvetica');
            doc.text(detailText, 70, yPos);
          }
          yPos += 25;
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}