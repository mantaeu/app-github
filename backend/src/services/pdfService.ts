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
    absentDays: 'أيام ��لغياب',
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

  // Create individual salary slip PDF
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
        const leftMargin = 50;
        const t = pdfTranslations[language];

        // Header
        doc.fontSize(36).fillColor('#FF6600').font('Helvetica-Bold');
        doc.text('MANTAEVERT', leftMargin, 50);
        doc.fontSize(12).fillColor('#000000').font('Helvetica');
        doc.text(t.humanResourcesManagementSystem, leftMargin, 90);
        
        // Document Title
        doc.fontSize(20).fillColor('#000000').font('Helvetica-Bold');
        doc.text(t.salarySlip, leftMargin, 120);
        
        // Document Info
        doc.fontSize(10).fillColor('#000000').font('Helvetica');
        doc.text(`${t.period} ${salary.month} ${salary.year}`, pageWidth - 100, 50);
        doc.text(`${t.slipNumber} ${salary._id.toString().slice(-8).toUpperCase()}`, pageWidth - 100, 65);
        doc.text(`${t.date} ${new Date().toLocaleDateString()}`, pageWidth - 100, 80);

        let currentY = 160;

        // Employee Information
        doc.fontSize(14).fillColor('#000000').font('Helvetica-Bold');
        doc.text(t.employeeInformation, leftMargin, currentY);
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
          doc.text(label, leftMargin, currentY, { width: 120 });
          doc.font('Helvetica');
          doc.text(value, leftMargin + 120, currentY);
          currentY += 15;
        });

        currentY += 20;

        // Salary Breakdown Table
        doc.fontSize(14).fillColor('#000000').font('Helvetica-Bold');
        doc.text(t.salaryBreakdown, leftMargin, currentY);
        currentY += 25;

        // Table Header
        doc.rect(leftMargin, currentY, pageWidth, 25).fill('#FF6600');
        doc.fontSize(11).fillColor('#FFFFFF').font('Helvetica-Bold');
        doc.text(t.description, leftMargin + 10, currentY + 8);
        doc.text(t.amount, leftMargin + 250, currentY + 8);
        doc.text(t.type, leftMargin + 400, currentY + 8);
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
        doc.text(t.netSalary, leftMargin + 10, currentY + 8);
        doc.text(`${(salary.totalSalary || 0).toFixed(2)} DH`, leftMargin + 250, currentY + 8);
        currentY += 50;

        // Attendance Summary (if available)
        if (salary.presentDays !== undefined) {
          doc.fontSize(14).fillColor('#000000').font('Helvetica-Bold');
          doc.text(t.attendanceSummary, leftMargin, currentY);
          currentY += 25;

          doc.rect(leftMargin, currentY, pageWidth, 25).fill('#FF6600');
          doc.fontSize(11).fillColor('#FFFFFF').font('Helvetica-Bold');
          doc.text(t.metric, leftMargin + 10, currentY + 8);
          doc.text(t.count, leftMargin + 200, currentY + 8);
          doc.text(t.details, leftMargin + 300, currentY + 8);
          currentY += 25;

          const attData = [
            [t.workingDays, salary.totalWorkingDays || 0, t.totalDays],
            [t.presentDays, salary.presentDays || 0, t.daysAttended],
            [t.absentDays, salary.absentDays || 0, t.daysMissed],
            [t.hoursWorked, `${(salary.totalHoursWorked || 0).toFixed(1)}h`, t.totalHours]
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
        doc.text(t.authorizedSignatures, leftMargin, currentY);
        currentY += 30;

        doc.fontSize(10).fillColor('#000000').font('Helvetica');
        doc.text(t.hrDepartment, leftMargin, currentY);
        doc.moveTo(leftMargin, currentY + 30).lineTo(leftMargin + 150, currentY + 30).stroke('#000000');
        doc.text(t.signatureDate, leftMargin, currentY + 35);

        doc.text(t.employee, leftMargin + 300, currentY);
        doc.moveTo(leftMargin + 300, currentY + 30).lineTo(leftMargin + 450, currentY + 30).stroke('#000000');
        doc.text(`${user.name}`, leftMargin + 300, currentY + 35);

        // Footer
        currentY += 80;
        doc.fontSize(8).fillColor('#666666').font('Helvetica');
        doc.text(t.computerGeneratedDocument, leftMargin, currentY);
        doc.text(`${t.generatedOn} ${new Date().toLocaleString()}`, leftMargin, currentY + 12);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Create individual receipt PDF
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
        const leftMargin = 50;
        const t = pdfTranslations[language];

        // Header
        doc.fontSize(36).fillColor('#FF6600').font('Helvetica-Bold');
        doc.text('MANTAEVERT', leftMargin, 50);
        doc.fontSize(12).fillColor('#000000').font('Helvetica');
        doc.text(t.humanResourcesManagementSystem, leftMargin, 90);
        
        // Document Title
        doc.fontSize(20).fillColor('#000000').font('Helvetica-Bold');
        doc.text(t.paymentReceipt, leftMargin, 120);
        
        // Document Info
        doc.fontSize(10).fillColor('#000000').font('Helvetica');
        doc.text(`${t.receiptNumber} ${receipt._id.toString().slice(-8).toUpperCase()}`, pageWidth - 100, 50);
        doc.text(`${t.date} ${new Date(receipt.date).toLocaleDateString()}`, pageWidth - 100, 65);
        doc.text(`${t.time} ${new Date(receipt.date).toLocaleTimeString()}`, pageWidth - 100, 80);

        let currentY = 160;

        // Recipient Information
        doc.fontSize(14).fillColor('#000000').font('Helvetica-Bold');
        doc.text(t.recipientInformation, leftMargin, currentY);
        currentY += 20;

        const recipientData = [
          [t.recipientName, user.name || 'N/A'],
          [t.employeeId, `#${user._id.toString().slice(-8).toUpperCase()}`],
          [t.email, user.email || 'N/A'],
          [t.receiptType, receipt.type.charAt(0).toUpperCase() + receipt.type.slice(1)]
        ];

        recipientData.forEach(([label, value]) => {
          doc.fontSize(10).fillColor('#000000').font('Helvetica-Bold');
          doc.text(label, leftMargin, currentY, { width: 120 });
          doc.font('Helvetica');
          doc.text(value, leftMargin + 120, currentY);
          currentY += 15;
        });

        currentY += 30;

        // Payment Details
        doc.fontSize(14).fillColor('#000000').font('Helvetica-Bold');
        doc.text(t.paymentDetails, leftMargin, currentY);
        currentY += 25;

        doc.rect(leftMargin, currentY, pageWidth, 25).fill('#FF6600');
        doc.fontSize(11).fillColor('#FFFFFF').font('Helvetica-Bold');
        doc.text(t.description, leftMargin + 10, currentY + 8);
        doc.text(t.information, leftMargin + 250, currentY + 8);
        currentY += 25;

        const paymentData = [
          [t.paymentMethod, t.companyTransfer],
          [t.transactionId, receipt._id.toString().slice(-12).toUpperCase()],
          [t.processingDate, new Date(receipt.date).toLocaleDateString()],
          [t.status, t.completed]
        ];

        paymentData.forEach(([desc, info], index) => {
          const bgColor = index % 2 === 0 ? '#F8F9FA' : '#FFFFFF';
          doc.rect(leftMargin, currentY, pageWidth, 20).fill(bgColor).stroke('#E0E0E0');
          doc.fontSize(10).fillColor('#000000').font('Helvetica');
          doc.text(desc, leftMargin + 10, currentY + 6);
          doc.text(info, leftMargin + 250, currentY + 6);
          currentY += 20;
        });

        currentY += 15;

        // Amount Section (right side)
        const amountBoxWidth = 200;
        const amountBoxX = leftMargin + pageWidth - amountBoxWidth;
        doc.rect(amountBoxX, currentY, amountBoxWidth, 35).fill('#FF6600');
        doc.fontSize(12).fillColor('#FFFFFF').font('Helvetica-Bold');
        doc.text(t.totalAmount, amountBoxX + 15, currentY + 6);
        doc.fontSize(18);
        doc.text(`${(receipt.amount || 0).toFixed(2)} DH`, amountBoxX + 15, currentY + 18);
        currentY += 50;

        // Description Section
        doc.fontSize(14).fillColor('#000000').font('Helvetica-Bold');
        doc.text(t.description, leftMargin, currentY);
        currentY += 20;

        doc.rect(leftMargin, currentY, pageWidth, 40).fill('#F8F9FA').stroke('#E0E0E0');
        doc.fontSize(10).fillColor('#000000').font('Helvetica');
        doc.text(receipt.description || t.noDescriptionProvided, leftMargin + 10, currentY + 10, {
          width: pageWidth - 20,
          align: 'left'
        });
        currentY += 60;

        // Signatures
        doc.fontSize(12).fillColor('#000000').font('Helvetica-Bold');
        doc.text(t.authorizedSignatures, leftMargin, currentY);
        currentY += 30;

        doc.fontSize(10).fillColor('#000000').font('Helvetica');
        doc.text(t.hrDepartment, leftMargin, currentY);
        doc.moveTo(leftMargin, currentY + 30).lineTo(leftMargin + 150, currentY + 30).stroke('#000000');
        doc.text(t.signatureDate, leftMargin, currentY + 35);

        doc.text(t.recipient, leftMargin + 300, currentY);
        doc.moveTo(leftMargin + 300, currentY + 30).lineTo(leftMargin + 450, currentY + 30).stroke('#000000');
        doc.text(`${user.name}`, leftMargin + 300, currentY + 35);

        // Footer
        currentY += 80;
        doc.fontSize(8).fillColor('#666666').font('Helvetica');
        doc.text(t.computerGeneratedReceipt, leftMargin, currentY);
        doc.text(`${t.generatedOn} ${new Date().toLocaleString()}`, leftMargin, currentY + 12);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Create all salaries PDF
  private static createAllSalariesPDF(salaryRecords: any[], language: Language = 'en'): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        const t = pdfTranslations[language];

        // Header
        doc.fontSize(36).fillColor('#FF6600').font('Helvetica-Bold');
        doc.text('MANTAEVERT', 50, 50);
        doc.fontSize(18).fillColor('#000000').font('Helvetica-Bold');
        doc.text(t.allSalariesReport, 50, 100);
        doc.fontSize(12).fillColor('#000000').font('Helvetica');
        doc.text(`${t.generatedOn} ${new Date().toLocaleDateString()}`, 50, 125);

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
          doc.text(`${salary.month} ${salary.year} - ${t.total} ${salary.totalSalary?.toFixed(2) || '0.00'} DH`, 70, yPos);
          yPos += 25;
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Create all receipts PDF
  private static createAllReceiptsPDF(receipts: any[], language: Language = 'en'): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        const t = pdfTranslations[language];

        // Header
        doc.fontSize(36).fillColor('#FF6600').font('Helvetica-Bold');
        doc.text('MANTAEVERT', 50, 50);
        doc.fontSize(18).fillColor('#000000').font('Helvetica-Bold');
        doc.text(t.allReceiptsReport, 50, 100);
        doc.fontSize(12).fillColor('#000000').font('Helvetica');
        doc.text(`${t.generatedOn} ${new Date().toLocaleDateString()}`, 50, 125);

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