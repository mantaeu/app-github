import { TranslationKey } from '../localization/translations';

// Convert month name to number (1-12)
export const getMonthNumber = (monthName: string): number => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const index = months.indexOf(monthName);
  return index >= 0 ? index + 1 : 1; // Return 1 (January) if not found
};

// Convert month number (1-12) to month name
export const getMonthName = (monthNumber: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNumber - 1] || 'January';
};

// Get translated month name using month number
export const getTranslatedMonth = (monthNumber: number): TranslationKey => {
  return `month${monthNumber}` as TranslationKey;
};

// Get current month as number
export const getCurrentMonthNumber = (): number => {
  return new Date().getMonth() + 1;
};

// Get current month name
export const getCurrentMonthName = (): string => {
  return getMonthName(getCurrentMonthNumber());
};

// Format date for display
export const formatDateForDisplay = (date: Date): string => {
  return date.toLocaleDateString();
};

// Get working days in month
export const getWorkingDaysInMonth = (year: number, month: number): number => {
  const date = new Date(year, month - 1, 1); // month is 1-based, Date constructor is 0-based
  let workingDays = 0;
  
  while (date.getMonth() === month - 1) {
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      workingDays++;
    }
    date.setDate(date.getDate() + 1);
  }
  
  return workingDays;
};