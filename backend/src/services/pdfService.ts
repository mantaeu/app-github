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
    paymentReceipt: 'إيصال الدفع',
    allSalariesReport: 'تقرير جميع الرواتب',
    allReceiptsReport: 'تقرير جميع الإيصالات',
    humanResourcesManagementSystem: 'نظام إدارة الموارد البشرية',
    employeeInformation: 'معلومات الموظف',
    recipientInformation: 'معلومات المستلم',
    employeeName: 'اسم الموظف:',
    recipientName: 'اسم المستلم:',
    employeeId: 'معرف الموظف:',
    position: 'المنصب:',
    department: 'القسم:',
    status: 'الحالة:',
    email: 'البريد الإلكتروني:',
    receiptType: 'نوع الإيصال:',
    salaryBreakdown: 'تفصيل الراتب',
    paymentDetails: 'تفاصيل الدفع',
    description: 'الوصف',
    amount: 'المبلغ (درهم)',
    information: 'المعلومات',
    type: 'النوع',
    baseSalary: 'الراتب الأساسي',
    overtimePay: 'أجر العمل الإضافي',
    bonuses: 'المكافآت',
    deductions: 'الخصومات',
    earning: 'كسب',
    deduction: 'خصم',
    netSalary: 'صافي الراتب:',
    totalAmount: 'المبلغ الإجمالي:',
    attendanceSummary: 'ملخص الحضور',
    metric: 'المقياس',
    count: 'العدد',
    details: 'التفاصيل',
    workingDays: 'أيام العمل',
    presentDays: 'أيام الحضور',
    absentDays: 'أيام الغياب',
    hoursWorked: 'ساعات العمل',
    totalDays: 'إجمالي الأيام',
    daysAttended: 'أيام الحضور',
    daysMissed: 'أيام الغياب',
    totalHours: 'إجمالي الساعات',
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
    computerGeneratedDocument: 'هذه وثيقة مُنشأة بواسطة الكمبيوتر. للاستفسارات، اتصل بالموارد البشرية على hr@mantaevert.com',
    computerGeneratedReceipt: 'هذا إيصال مُنشأ بواسطة الكمبيوتر. احتفظ بهذه الوثيقة لسجلاتك.',
    generatedOn: 'تم الإنشاء في',
    period: 'الفترة:',
    slipNumber: 'رقم القسيمة:',
    receiptNumber: 'رقم الإيصال:',
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

  // Helper method to get text alignment based on language
  private static getTextAlign(language: Language): 'left' | 'right' | 'center' {
    return this.isRTL(language) ? 'right' : 'left';
  }

  // Helper method to get appropriate margins for RTL
  private static getMargins(language: Language, pageWidth: number) {
    const isRTL = this.isRTL(language);
    return {
      leftMargin: isRTL ? 50 : 50,
      rightMargin: isRTL ? 50 : 50,
      contentWidth: pageWidth,
      labelX: isRTL ? pageWidth - 120 : 50,
      valueX: isRTL ? pageWidth - 250 : 170,
      tableDescX: isRTL ? pageWidth - 150 : 60,
      tableAmountX: isRTL ? pageWidth - 300 : 250,
      tableTypeX: isRTL ? pageWidth - 450 : 400
    };
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

  // Create individual salary slip PDF with RTL support
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
        const margins = this.getMargins(language, pageWidth);
        const t = pdfTranslations[language];

        // Header - Company name always LTR
        doc.fontSize(36).fillColor('#FF6600').font('Helvetica-Bold');
        doc.text('MANTAEVERT', isRTL ? pageWidth - 200 : 50, 50);
        
        doc.fontSize(12).fillColor('#000000').font('Helvetica');
        doc.text(t.humanResourcesManagementSystem, isRTL ? 50 : 50, 90, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });
        
        // Document Title
        doc.fontSize(20).fillColor('#000000').font('Helvetica-Bold');
        doc.text(t.salarySlip, 50, 120, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });
        
        // Document Info - Always on the right for all languages
        doc.fontSize(10).fillColor('#000000').font('Helvetica');
        const infoX = pageWidth - 100;
        doc.text(`${t.period} ${salary.month} ${salary.year}`, infoX, 50);
        doc.text(`${t.slipNumber} ${salary._id.toString().slice(-8).toUpperCase()}`, infoX, 65);
        doc.text(`${t.date} ${new Date().toLocaleDateString()}`, infoX, 80);

        let currentY = 160;

        // Employee Information
        doc.fontSize(14).fillColor('#000000').font('Helvetica-Bold');
        doc.text(t.employeeInformation, 50, currentY, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });
        currentY += 20;

        const empData = [
          [t.employeeName, user.name || 'N/A'],
          [t.employeeId, `#${user._id.toString().slice(-8).toUpperCase()}`],
          [t.position, user.position || 'N/A'],
          [t.department, t.general],
          [t.status, salary.isPaid ? t.paid : t.pending]
        ];

        empData.forEach(([label, value]) => {
          doc.fontSize(10).fillColor('#000000').font('Helvetica-Bold');
          if (isRTL) {
            // RTL layout: value on left, label on right
            doc.text(value, 50, currentY, { width: 200 });
            doc.text(label, pageWidth - 150, currentY, { width: 150, align: 'right' });
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
        doc.text(t.salaryBreakdown, 50, currentY, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });
        currentY += 25;

        // Table Header
        doc.rect(50, currentY, pageWidth, 25).fill('#FF6600');
        doc.fontSize(11).fillColor('#FFFFFF').font('Helvetica-Bold');
        
        if (isRTL) {
          // RTL table headers
          doc.text(t.type, 60, currentY + 8, { width: 100, align: 'right' });
          doc.text(t.amount, 200, currentY + 8, { width: 100, align: 'right' });
          doc.text(t.description, pageWidth - 150, currentY + 8, { width: 140, align: 'right' });
        } else {
          // LTR table headers
          doc.text(t.description, 60, currentY + 8);
          doc.text(t.amount, 250, currentY + 8);
          doc.text(t.type, 400, currentY + 8);
        }
        currentY += 25;

        // Table Rows
        const salaryData = [
          [t.baseSalary, (salary.baseSalary || 0).toFixed(2), t.earning],
          [t.overtimePay, (salary.overtime || 0).toFixed(2), t.earning],
          [t.bonuses, (salary.bonuses || 0).toFixed(2), t.earning],
          [t.deductions, (salary.deductions || 0).toFixed(2), t.deduction]
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
        
        if (isRTL) {
          doc.text(`${(salary.totalSalary || 0).toFixed(2)} DH`, 200, currentY + 8, { width: 100, align: 'right' });
          doc.text(t.netSalary, pageWidth - 150, currentY + 8, { width: 140, align: 'right' });
        } else {
          doc.text(t.netSalary, 60, currentY + 8);
          doc.text(`${(salary.totalSalary || 0).toFixed(2)} DH`, 250, currentY + 8);
        }
        currentY += 50;

        // Signatures
        doc.fontSize(12).fillColor('#000000').font('Helvetica-Bold');
        doc.text(t.authorizedSignatures, 50, currentY, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });
        currentY += 30;

        doc.fontSize(10).fillColor('#000000').font('Helvetica');
        if (isRTL) {
          // RTL signatures
          doc.text(t.employee, pageWidth - 150, currentY, { width: 140, align: 'right' });
          doc.moveTo(pageWidth - 150, currentY + 30).lineTo(pageWidth - 10, currentY + 30).stroke('#000000');
          doc.text(`${user.name}`, pageWidth - 150, currentY + 35, { width: 140, align: 'right' });

          doc.text(t.hrDepartment, 50, currentY, { width: 150 });
          doc.moveTo(50, currentY + 30).lineTo(200, currentY + 30).stroke('#000000');
          doc.text(t.signatureDate, 50, currentY + 35);
        } else {
          // LTR signatures
          doc.text(t.hrDepartment, 50, currentY);
          doc.moveTo(50, currentY + 30).lineTo(200, currentY + 30).stroke('#000000');
          doc.text(t.signatureDate, 50, currentY + 35);

          doc.text(t.employee, 300, currentY);
          doc.moveTo(300, currentY + 30).lineTo(450, currentY + 30).stroke('#000000');
          doc.text(`${user.name}`, 300, currentY + 35);
        }

        // Footer
        currentY += 80;
        doc.fontSize(8).fillColor('#666666').font('Helvetica');
        doc.text(t.computerGeneratedDocument, 50, currentY, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });
        doc.text(`${t.generatedOn} ${new Date().toLocaleString()}`, 50, currentY + 12, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Create individual receipt PDF with RTL support
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

        // Header - Company name always LTR
        doc.fontSize(36).fillColor('#FF6600').font('Helvetica-Bold');
        doc.text('MANTAEVERT', isRTL ? pageWidth - 200 : 50, 50);
        
        doc.fontSize(12).fillColor('#000000').font('Helvetica');
        doc.text(t.humanResourcesManagementSystem, 50, 90, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });
        
        // Document Title
        doc.fontSize(20).fillColor('#000000').font('Helvetica-Bold');
        doc.text(t.paymentReceipt, 50, 120, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });
        
        // Document Info - Always on the right
        doc.fontSize(10).fillColor('#000000').font('Helvetica');
        const infoX = pageWidth - 100;
        doc.text(`${t.receiptNumber} ${receipt._id.toString().slice(-8).toUpperCase()}`, infoX, 50);
        doc.text(`${t.date} ${new Date(receipt.date).toLocaleDateString()}`, infoX, 65);
        doc.text(`${t.time} ${new Date(receipt.date).toLocaleTimeString()}`, infoX, 80);

        let currentY = 160;

        // Recipient Information
        doc.fontSize(14).fillColor('#000000').font('Helvetica-Bold');
        doc.text(t.recipientInformation, 50, currentY, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });
        currentY += 20;

        const recipientData = [
          [t.recipientName, user.name || 'N/A'],
          [t.employeeId, `#${user._id.toString().slice(-8).toUpperCase()}`],
          [t.email, user.email || 'N/A'],
          [t.receiptType, receipt.type.charAt(0).toUpperCase() + receipt.type.slice(1)]
        ];

        recipientData.forEach(([label, value]) => {
          doc.fontSize(10).fillColor('#000000').font('Helvetica-Bold');
          if (isRTL) {
            // RTL layout
            doc.text(value, 50, currentY, { width: 200 });
            doc.text(label, pageWidth - 150, currentY, { width: 150, align: 'right' });
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
        doc.text(t.totalAmount, amountBoxX + 15, currentY + 6, {
          width: amountBoxWidth - 30,
          align: isRTL ? 'right' : 'left'
        });
        doc.fontSize(18);
        doc.text(`${(receipt.amount || 0).toFixed(2)} DH`, amountBoxX + 15, currentY + 18, {
          width: amountBoxWidth - 30,
          align: isRTL ? 'right' : 'left'
        });
        currentY += 50;

        // Payment Details
        doc.fontSize(14).fillColor('#000000').font('Helvetica-Bold');
        doc.text(t.paymentDetails, 50, currentY, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });
        currentY += 25;

        doc.rect(50, currentY, pageWidth, 25).fill('#FF6600');
        doc.fontSize(11).fillColor('#FFFFFF').font('Helvetica-Bold');
        
        if (isRTL) {
          doc.text(t.information, 60, currentY + 8, { width: 200, align: 'right' });
          doc.text(t.description, pageWidth - 150, currentY + 8, { width: 140, align: 'right' });
        } else {
          doc.text(t.description, 60, currentY + 8);
          doc.text(t.information, 250, currentY + 8);
        }
        currentY += 25;

        const paymentData = [
          [t.paymentMethod, t.companyTransfer],
          [t.transactionId, receipt._id.toString().slice(-12).toUpperCase()],
          [t.processingDate, new Date(receipt.date).toLocaleDateString()],
          [t.status, t.completed]
        ];

        paymentData.forEach(([desc, info], index) => {
          const bgColor = index % 2 === 0 ? '#F8F9FA' : '#FFFFFF';
          doc.rect(50, currentY, pageWidth, 20).fill(bgColor).stroke('#E0E0E0');
          doc.fontSize(10).fillColor('#000000').font('Helvetica');
          
          if (isRTL) {
            doc.text(info, 60, currentY + 6, { width: 200, align: 'right' });
            doc.text(desc, pageWidth - 150, currentY + 6, { width: 140, align: 'right' });
          } else {
            doc.text(desc, 60, currentY + 6);
            doc.text(info, 250, currentY + 6);
          }
          currentY += 20;
        });

        currentY += 15;

        // Description Section
        doc.fontSize(14).fillColor('#000000').font('Helvetica-Bold');
        doc.text(t.description, 50, currentY, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });
        currentY += 20;

        doc.rect(50, currentY, pageWidth, 40).fill('#F8F9FA').stroke('#E0E0E0');
        doc.fontSize(10).fillColor('#000000').font('Helvetica');
        doc.text(receipt.description || t.noDescriptionProvided, 60, currentY + 10, {
          width: pageWidth - 20,
          align: isRTL ? 'right' : 'left'
        });
        currentY += 60;

        // Signatures
        doc.fontSize(12).fillColor('#000000').font('Helvetica-Bold');
        doc.text(t.authorizedSignatures, 50, currentY, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });
        currentY += 30;

        doc.fontSize(10).fillColor('#000000').font('Helvetica');
        if (isRTL) {
          // RTL signatures
          doc.text(t.recipient, pageWidth - 150, currentY, { width: 140, align: 'right' });
          doc.moveTo(pageWidth - 150, currentY + 30).lineTo(pageWidth - 10, currentY + 30).stroke('#000000');
          doc.text(`${user.name}`, pageWidth - 150, currentY + 35, { width: 140, align: 'right' });

          doc.text(t.hrDepartment, 50, currentY, { width: 150 });
          doc.moveTo(50, currentY + 30).lineTo(200, currentY + 30).stroke('#000000');
          doc.text(t.signatureDate, 50, currentY + 35);
        } else {
          // LTR signatures
          doc.text(t.hrDepartment, 50, currentY);
          doc.moveTo(50, currentY + 30).lineTo(200, currentY + 30).stroke('#000000');
          doc.text(t.signatureDate, 50, currentY + 35);

          doc.text(t.recipient, 300, currentY);
          doc.moveTo(300, currentY + 30).lineTo(450, currentY + 30).stroke('#000000');
          doc.text(`${user.name}`, 300, currentY + 35);
        }

        // Footer
        currentY += 80;
        doc.fontSize(8).fillColor('#666666').font('Helvetica');
        doc.text(t.computerGeneratedReceipt, 50, currentY, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });
        doc.text(`${t.generatedOn} ${new Date().toLocaleString()}`, 50, currentY + 12, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Create all salaries PDF with RTL support
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

        // Header
        doc.fontSize(36).fillColor('#FF6600').font('Helvetica-Bold');
        doc.text('MANTAEVERT', isRTL ? pageWidth - 200 : 50, 50);
        
        doc.fontSize(18).fillColor('#000000').font('Helvetica-Bold');
        doc.text(t.allSalariesReport, 50, 100, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });
        
        doc.fontSize(12).fillColor('#000000').font('Helvetica');
        doc.text(`${t.generatedOn} ${new Date().toLocaleDateString()}`, 50, 125, {
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
          const detailText = `${salary.month} ${salary.year} - ${t.total} ${salary.totalSalary?.toFixed(2) || '0.00'} DH`;
          
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

  // Create all receipts PDF with RTL support
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

        // Header
        doc.fontSize(36).fillColor('#FF6600').font('Helvetica-Bold');
        doc.text('MANTAEVERT', isRTL ? pageWidth - 200 : 50, 50);
        
        doc.fontSize(18).fillColor('#000000').font('Helvetica-Bold');
        doc.text(t.allReceiptsReport, 50, 100, {
          width: pageWidth,
          align: isRTL ? 'right' : 'left'
        });
        
        doc.fontSize(12).fillColor('#000000').font('Helvetica');
        doc.text(`${t.generatedOn} ${new Date().toLocaleDateString()}`, 50, 125, {
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