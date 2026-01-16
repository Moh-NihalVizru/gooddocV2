import { format, isSameMonth, isSameDay, isToday, isTomorrow, isYesterday } from "date-fns";

export type DateLocale = "en-GB" | "en-US" | "en-IN";

/**
 * Format a single date as "EEE | dd MMM yyyy"
 * Example: "Tue | 06 Jan 2026"
 */
export function formatDate(date: Date, locale: DateLocale = "en-GB"): string {
  const dayName = format(date, "EEE");
  const day = format(date, "dd");
  const month = format(date, "MMM");
  const year = format(date, "yyyy");
  return `${dayName} | ${day} ${month} ${year}`;
}

/**
 * Format a date range with smart month/year compression
 * Same month: "Tue 06 — Fri 09 Jan 2026"
 * Different months: "Tue 28 Jan — Fri 02 Feb 2026"
 */
export function formatRange(start: Date, end: Date, locale: DateLocale = "en-GB"): string {
  const startDay = format(start, "EEE dd");
  const endDay = format(end, "EEE dd");
  const endMonthYear = format(end, "MMM yyyy");
  
  if (isSameMonth(start, end)) {
    return `${startDay} — ${endDay} ${endMonthYear}`;
  }
  
  const startMonth = format(start, "MMM");
  return `${startDay} ${startMonth} — ${endDay} ${endMonthYear}`;
}

/**
 * Get a relative date label (Today, Tomorrow, Yesterday, or formatted date)
 */
export function getRelativeDateLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEE dd MMM");
}

/**
 * Parse day tokens like ["M 05", "T 06", "W 07"] to a single date
 * T = Tuesday (Thu must be "Th")
 */
export function parseDayTokensToDate(
  tokens: string[],
  month: number,
  year: number,
  minDate?: Date,
  maxDate?: Date
): Date | null {
  const dayMap: Record<string, number> = {
    "Su": 0, "Sun": 0, "S": 0,
    "M": 1, "Mon": 1,
    "T": 2, "Tu": 2, "Tue": 2,
    "W": 3, "Wed": 3,
    "Th": 4, "Thu": 4,
    "F": 5, "Fri": 5,
    "Sa": 6, "Sat": 6,
  };

  for (const token of tokens) {
    const match = token.trim().match(/^([A-Za-z]+)\s*(\d{1,2})$/);
    if (!match) continue;
    
    const [, dayAbbr, dayNum] = match;
    const dayOfMonth = parseInt(dayNum, 10);
    
    const candidateDate = new Date(year, month, dayOfMonth);
    
    // Validate the date is within bounds
    if (minDate && candidateDate < minDate) continue;
    if (maxDate && candidateDate > maxDate) continue;
    
    // Validate the day of week matches (optional strict mode)
    const expectedDayOfWeek = dayMap[dayAbbr];
    if (expectedDayOfWeek !== undefined && candidateDate.getDay() !== expectedDayOfWeek) {
      // Day letter doesn't match, but we can still use the date
      console.warn(`Day mismatch: ${dayAbbr} ${dayNum} is actually ${format(candidateDate, "EEE")}`);
    }
    
    return candidateDate;
  }
  
  return null;
}

/**
 * Check if a date is the same day as another
 */
export { isSameDay, isToday, isTomorrow, isYesterday };
