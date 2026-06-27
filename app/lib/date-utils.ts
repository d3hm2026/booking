// أدوات مساعدة للتواريخ - تقويم ميلادي فقط بصيغة YYYY-MM-DD

export function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return toDateString(d);
}

/**
 * يبني مصفوفة من التواريخ (كنصوص YYYY-MM-DD) بين تاريخين، شاملة البداية
 * وغير شاملة النهاية (نفس منطق check_in/check_out في قاعدة البيانات)
 */
export function dateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  let current = startDate;
  while (current < endDate) {
    dates.push(current);
    current = addDays(current, 1);
  }
  return dates;
}

const ARABIC_WEEKDAYS = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];
const ARABIC_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

export function formatDayLabel(dateStr: string): { weekday: string; day: number } {
  const d = new Date(dateStr + "T00:00:00Z");
  return {
    weekday: ARABIC_WEEKDAYS[d.getUTCDay()],
    day: d.getUTCDate(),
  };
}

export function formatMonthYear(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return `${ARABIC_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function isWeekend(dateStr: string): boolean {
  const d = new Date(dateStr + "T00:00:00Z");
  const day = d.getUTCDay();
  return day === 5 || day === 6; // الجمعة والسبت (نهاية الأسبوع السعودي)
}

export function todayString(): string {
  return toDateString(new Date());
}
