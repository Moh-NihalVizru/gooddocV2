import { format, differenceInDays, differenceInHours } from "date-fns";

export type PageKey = 
  | "appointment-request"
  | "op-patients"
  | "ip-patients"
  | "diagnostics"
  | "lab-results"
  | "radiology"
  | "pharmacy"
  | "billing"
  | "payments"
  | "advances"
  | "discharge"
  | "transfers"
  | "doctors"
  | "overview"
  | "surgeries"
  | "emergency"
  | "scheduled-today"
  | "beds"
  | "default";

interface SubtextParams {
  pageKey: PageKey;
  selectedDate: Date | null;
  selectedRange?: { from: Date | null; to: Date | null };
  now?: Date;
  locale?: string;
  timezone?: string;
}

/**
 * Generate dynamic, context-aware subtext based on page and selected date
 * All subtexts are max ~90 chars and time-aware
 */
export function getPageSubtext(params: SubtextParams): string {
  const { pageKey, selectedDate, selectedRange, now = new Date() } = params;
  
  // Handle range mode
  if (selectedRange?.from && selectedRange?.to) {
    return getRangeSubtext(pageKey, selectedRange.from, selectedRange.to, now);
  }
  
  // Handle no date selected
  if (!selectedDate) {
    return getNoDateSubtext(pageKey);
  }
  
  // Handle single date selected
  return getSingleDateSubtext(pageKey, selectedDate, now);
}

function getNoDateSubtext(pageKey: PageKey): string {
  const subtexts: Record<PageKey, string> = {
    "appointment-request": "Pick a date to see available slots",
    "op-patients": "Select a date to view outpatient schedule",
    "ip-patients": "Select a date to filter admissions",
    "diagnostics": "Choose a date to view pending tests",
    "lab-results": "Select a date to filter lab results",
    "radiology": "Pick a date to see imaging queue",
    "pharmacy": "Select a date to view prescriptions",
    "billing": "Choose a date to filter invoices",
    "payments": "Select a date to view transactions",
    "advances": "Pick a date to see advance collections",
    "discharge": "Select a date to view discharges",
    "transfers": "Choose a date to see bed transfers",
    "doctors": "Select a date to view doctor schedules",
    "overview": "Select a date to view hospital metrics",
    "surgeries": "Pick a date to see scheduled surgeries",
    "emergency": "Select a date to filter emergency cases",
    "scheduled-today": "Pick a date to view scheduled requests",
    "beds": "Select a date to view bed availability",
    "default": "Select a date to filter results",
  };
  
  return subtexts[pageKey] || subtexts["default"];
}

function getSingleDateSubtext(pageKey: PageKey, date: Date, now: Date): string {
  const daysDiff = differenceInDays(date, now);
  const formattedDate = format(date, "EEE dd MMM");
  const isToday = daysDiff === 0;
  const isPast = daysDiff < 0;
  const isFuture = daysDiff > 0;
  
  const subtexts: Record<PageKey, () => string> = {
    "appointment-request": () => {
      if (isToday) return "Showing today's appointment requests";
      if (isPast) return `Viewing requests from ${formattedDate}`;
      return `Earliest slot on ${formattedDate}: 09:30 AM`;
    },
    "op-patients": () => {
      if (isToday) return "Live outpatient queue for today";
      if (isPast) return `${formattedDate} — 42 consultations completed`;
      return `${formattedDate} — 28 appointments scheduled`;
    },
    "ip-patients": () => {
      if (isToday) return "Current inpatient census: real-time";
      if (isPast) return `Census on ${formattedDate}: 156 patients`;
      return `Projected admissions for ${formattedDate}`;
    },
    "diagnostics": () => {
      if (isToday) return "Live diagnostics queue — 12 pending";
      if (isPast) return `${formattedDate} — 89 tests processed`;
      return `${formattedDate} — Scheduling available`;
    },
    "lab-results": () => {
      if (isToday) return "Today's results: 8 pending review";
      if (isPast) return `Lab results from ${formattedDate}`;
      return `Scheduled collections for ${formattedDate}`;
    },
    "radiology": () => {
      if (isToday) return "Current imaging queue: 6 in progress";
      if (isPast) return `Radiology log for ${formattedDate}`;
      return `Imaging slots on ${formattedDate}`;
    },
    "pharmacy": () => {
      if (isToday) return "Active prescriptions: 15 ready for pickup";
      if (isPast) return `Dispensed on ${formattedDate}: 124 orders`;
      return `Pre-orders for ${formattedDate}`;
    },
    "billing": () => {
      if (isToday) return "Today's billing: ₹2.4L collected";
      if (isPast) return `Revenue on ${formattedDate}`;
      return `Projected billing for ${formattedDate}`;
    },
    "payments": () => {
      if (isToday) return "Today's collections: ₹1.8L received";
      if (isPast) return `Payments on ${formattedDate}`;
      return `Scheduled payments for ${formattedDate}`;
    },
    "advances": () => {
      if (isToday) return "Today's advances: ₹85K collected";
      if (isPast) return `Advance collections on ${formattedDate}`;
      return `Expected advances for ${formattedDate}`;
    },
    "discharge": () => {
      if (isToday) return "Today: 8 pending, 12 completed discharges";
      if (isPast) return `Discharges on ${formattedDate}: 18 total`;
      return `Planned discharges for ${formattedDate}`;
    },
    "transfers": () => {
      if (isToday) return "Today: 3 transfers pending";
      if (isPast) return `Bed transfers on ${formattedDate}`;
      return `Scheduled transfers for ${formattedDate}`;
    },
    "doctors": () => {
      if (isToday) return "18 doctors on duty today";
      if (isPast) return `Duty roster for ${formattedDate}`;
      return `${formattedDate} schedule: 22 doctors`;
    },
    "overview": () => {
      if (isToday) return "Live hospital dashboard";
      if (isPast) return `Metrics snapshot for ${formattedDate}`;
      return `Projected metrics for ${formattedDate}`;
    },
    "surgeries": () => {
      if (isToday) return "Today: 5 surgeries scheduled, 2 in progress";
      if (isPast) return `Surgeries on ${formattedDate}: 8 completed`;
      return `${formattedDate}: 6 surgeries scheduled`;
    },
    "emergency": () => {
      if (isToday) return "Live ER: 4 critical, 8 stable";
      if (isPast) return `ER admissions on ${formattedDate}`;
      return `Viewing ${formattedDate} (projected)`;
    },
    "scheduled-today": () => {
      if (isToday) return "Requests awaiting confirmation today";
      if (isPast) return `Requests from ${formattedDate}`;
      return `Scheduled requests for ${formattedDate}`;
    },
    "beds": () => {
      if (isToday) return "Live bed availability across all floors";
      if (isPast) return `Bed occupancy on ${formattedDate}`;
      return `Projected availability for ${formattedDate}`;
    },
    "default": () => {
      if (isToday) return "Showing today's data";
      return `Filtered to ${formattedDate}`;
    },
  };
  
  const generator = subtexts[pageKey] || subtexts["default"];
  return generator();
}

function getRangeSubtext(pageKey: PageKey, from: Date, to: Date, now: Date): string {
  const days = differenceInDays(to, from) + 1;
  const fromStr = format(from, "dd MMM");
  const toStr = format(to, "dd MMM");
  
  const rangeSubtexts: Record<PageKey, string> = {
    "appointment-request": `Showing ${days}-day availability (${fromStr} — ${toStr})`,
    "op-patients": `${days}-day report: ${fromStr} — ${toStr}`,
    "ip-patients": `Admission trends: ${fromStr} — ${toStr}`,
    "diagnostics": `Test volume for ${days} days`,
    "lab-results": `Lab results: ${fromStr} — ${toStr}`,
    "radiology": `Imaging records: ${fromStr} — ${toStr}`,
    "pharmacy": `Dispensary report: ${days} days`,
    "billing": `Revenue report: ${fromStr} — ${toStr}`,
    "payments": `Collections: ${fromStr} — ${toStr}`,
    "advances": `Advance summary: ${days} days`,
    "discharge": `Discharge report: ${fromStr} — ${toStr}`,
    "transfers": `Transfer log: ${days} days`,
    "doctors": `Schedule overview: ${fromStr} — ${toStr}`,
    "overview": `Dashboard: ${fromStr} — ${toStr}`,
    "surgeries": `Surgery log: ${days} days`,
    "emergency": `ER cases: ${fromStr} — ${toStr}`,
    "scheduled-today": `Requests: ${fromStr} — ${toStr}`,
    "beds": `Bed availability: ${fromStr} — ${toStr}`,
    "default": `Showing ${days}-day range`,
  };
  
  return rangeSubtexts[pageKey] || rangeSubtexts["default"];
}
