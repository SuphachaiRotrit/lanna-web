const BE_OFFSET = 543;

export const toBuddhistYear = (gregorianYear: number) => gregorianYear + BE_OFFSET;
export const toGregorianYear = (buddhistYear: number) => buddhistYear - BE_OFFSET;

export const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

export const THAI_WEEKDAYS_SHORT = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

const parse = (value?: string | Date | null): Date | null => {
  if (!value) return null;
  const date = typeof value === 'string' ? new Date(value) : value;
  return isNaN(date.getTime()) ? null : date;
};

/** วันที่แบบสั้น เรียงวัน/เดือน/ปี พ.ศ. เช่น 05/07/2544 */
export const formatThaiDate = (value?: string | Date | null): string => {
  const date = parse(value);
  return date ? date.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
};

/** วันที่แบบสั้น เดือนย่อ เช่น 5 ก.ค. 2544 */
export const formatThaiDateMedium = (value?: string | Date | null): string => {
  const date = parse(value);
  return date ? date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
};

/** วันที่พร้อมเวลา เช่น 05/07/2544 14:30 น. */
export const formatThaiDateTime = (value?: string | Date | null): string => {
  const date = parse(value);
  if (!date) return '';
  const time = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${formatThaiDate(date)} ${time} น.`;
};
