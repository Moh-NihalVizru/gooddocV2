import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import type { DischargeBill, BillLineItem, BillBedCharge, BillDepartment } from "@/types/discharge-bill";
import BainesLogoFull from "@/assets/baines-logo-full.svg";

interface DischargeBillInvoiceProps {
  bill: DischargeBill;
  isSample?: boolean;
  /** Filter to show only specific department codes (e.g., ['LAB', 'CONS']) */
  departmentFilter?: string[];
}

// Calculation helpers
const calcLineItem = (item: BillLineItem) => {
  const base = item.unitPrice * item.quantity;
  const discount = item.discountAmount ?? (item.discountPercent ? base * (item.discountPercent / 100) : 0);
  const taxableBase = base - discount;
  const tax = item.taxAmount ?? (item.taxPercent ? taxableBase * (item.taxPercent / 100) : 0);
  const lineTotal = taxableBase + tax;
  return { base, discount, taxableBase, tax, lineTotal };
};

const calcBedCharge = (charge: BillBedCharge) => {
  return charge.subtotal ?? charge.chargePerDay * (charge.days ?? 1);
};

const formatCurrency = (amount: number, currency: string, locale: string) => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateStr: string, locale: string, includeTime = false) => {
  try {
    const date = parseISO(dateStr);
    return includeTime ? format(date, "dd MMM yyyy, HH:mm") : format(date, "dd MMM yyyy");
  } catch {
    return dateStr;
  }
};

const formatDateRange = (start?: string, end?: string, locale: string = "en-IN") => {
  if (!start) return "";
  const startFormatted = formatDate(start, locale, true);
  if (!end || start === end) return startFormatted;
  const endFormatted = formatDate(end, locale, true);
  return `${startFormatted} — ${endFormatted}`;
};

export function DischargeBillInvoice({ bill, isSample = true, departmentFilter }: DischargeBillInvoiceProps) {
  const locale = bill.invoice.locale || "en-IN";
  const currency = bill.invoice.currency || "INR";

  // Filter departments if filter is provided
  const filteredDepartments = departmentFilter && departmentFilter.length > 0
    ? bill.departments.filter((dept) => departmentFilter.includes(dept.code || ''))
    : bill.departments;

  // Hide bed charges if filter is active (only show specific departments)
  const showBedCharges = !departmentFilter || departmentFilter.length === 0;

  // Calculate all totals (using filtered departments)
  const calculations = useMemo(() => {
    let totalBedCharges = 0;
    let totalGross = 0;
    let totalDiscounts = 0;
    let totalTax = 0;

    // Bed charges (only if no filter active)
    if (showBedCharges && bill.bedCharges) {
      totalBedCharges = bill.bedCharges.reduce((sum, c) => sum + calcBedCharge(c), 0);
    }

    // Department line items (use filtered departments)
    const departmentSubtotals: Record<string, { gross: number; discount: number; tax: number; total: number }> = {};
    
    filteredDepartments.forEach((dept) => {
      let deptGross = 0;
      let deptDiscount = 0;
      let deptTax = 0;
      let deptTotal = 0;

      dept.lineItems.forEach((item) => {
        const calc = calcLineItem(item);
        deptGross += calc.base;
        deptDiscount += calc.discount;
        deptTax += calc.tax;
        deptTotal += calc.lineTotal;
      });

      departmentSubtotals[dept.name] = { gross: deptGross, discount: deptDiscount, tax: deptTax, total: deptTotal };
      totalGross += deptGross;
      totalDiscounts += deptDiscount;
      totalTax += deptTax;
    });

    // Add bed charges to gross
    totalGross += totalBedCharges;

    // Tax breakdown additions
    const taxBreakdownTotal = bill.taxBreakdown?.reduce((sum, t) => sum + t.amount, 0) || 0;

    // Adjustments
    const adjustmentsTotal = bill.adjustments?.reduce((sum, a) => sum + a.amount, 0) || 0;

    // Payments
    const paymentsTotal = bill.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

    // Insurance & Co-pay from summary
    const insuranceCoverage = bill.summary?.insuranceCoverage || 0;
    const coPay = bill.summary?.coPay || 0;
    const roundOff = bill.summary?.roundOff || 0;

    // Amount due
    const amountDue = totalGross - totalDiscounts + totalTax + taxBreakdownTotal + adjustmentsTotal - insuranceCoverage - coPay - paymentsTotal + roundOff;

    return {
      totalBedCharges,
      departmentSubtotals,
      totalGross,
      totalDiscounts,
      totalTax: totalTax + taxBreakdownTotal,
      adjustmentsTotal,
      insuranceCoverage,
      coPay,
      paymentsTotal,
      roundOff,
      amountDue,
    };
  }, [bill, filteredDepartments, showBedCharges]);

  // Number to words (Indian system)
  const numberToWords = (num: number): string => {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    if (num === 0) return "Zero";
    if (num < 0) return "Minus " + numberToWords(Math.abs(num));
    if (num < 20) return ones[Math.floor(num)];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[Math.floor(num % 10)] : "");
    if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + numberToWords(num % 100) : "");
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + numberToWords(num % 1000) : "");
    if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + numberToWords(num % 100000) : "");
    return numberToWords(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 ? " " + numberToWords(num % 10000000) : "");
  };

  // Check which columns have data (use filtered departments)
  const hasServiceCodes = filteredDepartments.some((d) => d.lineItems.some((i) => i.serviceCode));
  const hasClinicians = filteredDepartments.some((d) => d.lineItems.some((i) => i.clinician));
  const hasUom = filteredDepartments.some((d) => d.lineItems.some((i) => i.uom));
  const hasDiscounts = filteredDepartments.some((d) => d.lineItems.some((i) => i.discountPercent || i.discountAmount));
  const hasTax = filteredDepartments.some((d) => d.lineItems.some((i) => i.taxPercent || i.taxAmount));

  return (
    <div className={cn("bg-white border border-border rounded-lg overflow-hidden relative print:border-0 print:rounded-none", isSample && "is-sample")}>
      {/* Sample Watermark */}
      {isSample && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden print:hidden">
          <div className="text-[120px] font-bold text-muted-foreground/10 rotate-[-35deg] select-none whitespace-nowrap">
            SAMPLE
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm 10mm;
          }
          .is-sample::before {
            content: "SAMPLE";
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-35deg);
            font-size: 100px;
            font-weight: bold;
            color: rgba(0,0,0,0.05);
            z-index: 1000;
            pointer-events: none;
          }
          .print\\:hidden { display: none !important; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
          .section-header { page-break-after: avoid; }
        }
      `}</style>

      {/* Header */}
      <header className="p-5 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {bill.facility.logoUrl ? (
              <img src={bill.facility.logoUrl} alt={bill.facility.name} className="h-12 object-contain" />
            ) : (
              <img src={BainesLogoFull} alt={bill.facility.name} className="h-10" />
            )}
          </div>
          <div className="text-right">
            {bill.facility.address && (
              <p className="text-xs text-muted-foreground">
                {[bill.facility.address.line1, bill.facility.address.line2, bill.facility.address.city, bill.facility.address.state, bill.facility.address.postalCode].filter(Boolean).join(", ")}
              </p>
            )}
            {bill.facility.contact && (
              <p className="text-xs text-muted-foreground">
                {[bill.facility.contact.phone && `Tel: ${bill.facility.contact.phone}`, bill.facility.contact.email && `Email: ${bill.facility.contact.email}`].filter(Boolean).join(" | ")}
              </p>
            )}
            {bill.facility.taxId && <p className="text-xs text-muted-foreground">{bill.facility.taxId}</p>}
            {bill.facility.registrationId && <p className="text-xs text-muted-foreground">{bill.facility.registrationId}</p>}
          </div>
        </div>

        {/* Document Title */}
        <div className="mt-4 pt-4 border-t border-border">
          <h2 className="text-center text-lg font-bold text-primary uppercase tracking-wide">Interim Bill</h2>
        </div>
      </header>

      {/* Patient & Encounter */}
      <div className="p-5 border-b border-border">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Patient Information</h3>
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-2">
            <p className="text-sm font-semibold text-foreground">{bill.patient.name}</p>
            <div className="flex gap-3 mt-1">
              {bill.patient.mrn && <span className="text-xs text-muted-foreground">MRN: {bill.patient.mrn}</span>}
              {bill.patient.id && <span className="text-xs text-muted-foreground">ID: {bill.patient.id}</span>}
            </div>
            {bill.patient.contact?.phone && <p className="text-xs text-muted-foreground mt-1">Ph: {bill.patient.contact.phone}</p>}
          </div>
          <div>
            {bill.patient.dob && (
              <>
                <p className="text-[10px] font-medium text-muted-foreground uppercase">DOB</p>
                <p className="text-sm text-foreground">{formatDate(bill.patient.dob, locale)}</p>
              </>
            )}
            {bill.patient.sex && <p className="text-xs text-muted-foreground mt-1">Sex: {bill.patient.sex}</p>}
          </div>
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase">Admission</p>
            <p className="text-sm text-foreground">{bill.encounter.admissionDateTime ? formatDate(bill.encounter.admissionDateTime, locale, true) : "—"}</p>
            {bill.encounter.admissionType && <p className="text-xs text-muted-foreground">{bill.encounter.admissionType}</p>}
          </div>
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase">Till Date</p>
            <p className="text-sm font-semibold text-primary">{bill.encounter.dischargeDateTime ? formatDate(bill.encounter.dischargeDateTime, locale, true) : "—"}</p>
          </div>
        </div>
        
        {/* Encounter details row */}
        <div className="flex gap-6 mt-3 pt-3 border-t border-border/50">
          {bill.encounter.admissionId && (
            <div>
              <span className="text-[10px] text-muted-foreground uppercase">Admission ID: </span>
              <span className="text-xs font-medium font-mono">{bill.encounter.admissionId}</span>
            </div>
          )}
          {bill.encounter.ward && (
            <div>
              <span className="text-[10px] text-muted-foreground uppercase">Ward: </span>
              <span className="text-xs font-medium">{bill.encounter.ward}</span>
            </div>
          )}
          {bill.encounter.room && (
            <div>
              <span className="text-[10px] text-muted-foreground uppercase">Room: </span>
              <span className="text-xs font-medium">{bill.encounter.room}</span>
            </div>
          )}
          {bill.encounter.bed && (
            <div>
              <span className="text-[10px] text-muted-foreground uppercase">Bed: </span>
              <span className="text-xs font-medium">{bill.encounter.bed}</span>
            </div>
          )}
        </div>

        {/* Providers */}
        {bill.providers && bill.providers.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1">Attending Providers</p>
            <div className="flex flex-wrap gap-3">
              {bill.providers.map((p, i) => (
                <span key={i} className="text-xs text-foreground">
                  <span className="font-medium">{p.name}</span>
                  {p.role && <span className="text-muted-foreground"> ({p.role})</span>}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Insurance Section */}
      {bill.insurance && (
        <div className="p-5 border-b border-border bg-blue-50/50 dark:bg-blue-950/20">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Insurance Details</h3>
          <div className="grid grid-cols-4 gap-4">
            {bill.insurance.payerName && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Payer</p>
                <p className="text-sm font-medium text-foreground">{bill.insurance.payerName}</p>
              </div>
            )}
            {bill.insurance.planName && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Plan</p>
                <p className="text-sm text-foreground">{bill.insurance.planName}</p>
              </div>
            )}
            {bill.insurance.memberId && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Member ID</p>
                <p className="text-sm font-mono text-foreground">{bill.insurance.memberId}</p>
              </div>
            )}
            {bill.insurance.policyNumber && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Policy No.</p>
                <p className="text-sm font-mono text-foreground">{bill.insurance.policyNumber}</p>
              </div>
            )}
            {bill.insurance.tpaName && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">TPA</p>
                <p className="text-sm text-foreground">{bill.insurance.tpaName}</p>
              </div>
            )}
            {bill.insurance.preauthNumber && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Pre-Auth No.</p>
                <p className="text-sm font-mono text-foreground">{bill.insurance.preauthNumber}</p>
              </div>
            )}
            {bill.insurance.coveragePercent !== undefined && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Coverage</p>
                <p className="text-sm font-semibold text-primary">{bill.insurance.coveragePercent}%</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bed/Room Charges (hidden when filter is active) */}
      {showBedCharges && bill.bedCharges && bill.bedCharges.length > 0 && (
        <div className="p-5 border-b border-border">
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3 section-header">Bed & Room Charges</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Ward/Room</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Room Type</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Bed Type</th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Days</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Rate</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill.bedCharges.map((charge, i) => (
                <tr key={i} className={cn(i % 2 === 1 && "bg-muted/20")}>
                  <td className="py-2 px-3 text-foreground">{formatDate(charge.date, locale)}</td>
                  <td className="py-2 px-3 text-foreground">{charge.ward || "—"} / {charge.roomNumber || "—"}</td>
                  <td className="py-2 px-3 text-muted-foreground">{charge.roomType || "—"}</td>
                  <td className="py-2 px-3 text-muted-foreground">{charge.bedType || "—"}</td>
                  <td className="py-2 px-3 text-center text-muted-foreground">{charge.days ?? 1}</td>
                  <td className="py-2 px-3 text-right text-muted-foreground">{formatCurrency(charge.chargePerDay, currency, locale)}</td>
                  <td className="py-2 px-3 text-right font-medium text-foreground">{formatCurrency(calcBedCharge(charge), currency, locale)}</td>
                </tr>
              ))}
              <tr className="bg-muted/40 font-medium">
                <td colSpan={6} className="py-2 px-3 text-right text-muted-foreground">Bed Charges Subtotal</td>
                <td className="py-2 px-3 text-right font-bold text-foreground">{formatCurrency(calculations.totalBedCharges, currency, locale)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Department Sections (uses filtered departments) */}
      {filteredDepartments.map((dept, deptIdx) => (
        <div key={deptIdx} className="p-5 border-b border-border">
          <div className="flex items-center justify-between mb-3 section-header">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider">
              {dept.name}
              {dept.code && <span className="text-muted-foreground ml-1">({dept.code})</span>}
            </h3>
            {(dept.startDateTime || dept.endDateTime) && (
              <span className="text-[10px] text-muted-foreground">
                Visited: {formatDateRange(dept.startDateTime, dept.endDateTime, locale)}
              </span>
            )}
          </div>
          
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left py-2 px-2 text-[10px] font-semibold text-muted-foreground uppercase">Date</th>
                {hasServiceCodes && <th className="text-left py-2 px-2 text-[10px] font-semibold text-muted-foreground uppercase">Code</th>}
                <th className="text-left py-2 px-2 text-[10px] font-semibold text-muted-foreground uppercase">Description</th>
                {hasClinicians && <th className="text-left py-2 px-2 text-[10px] font-semibold text-muted-foreground uppercase">Clinician</th>}
                <th className="text-center py-2 px-2 text-[10px] font-semibold text-muted-foreground uppercase">Qty</th>
                {hasUom && <th className="text-center py-2 px-2 text-[10px] font-semibold text-muted-foreground uppercase">UOM</th>}
                <th className="text-right py-2 px-2 text-[10px] font-semibold text-muted-foreground uppercase">Rate</th>
                {hasDiscounts && <th className="text-right py-2 px-2 text-[10px] font-semibold text-muted-foreground uppercase">Disc.</th>}
                {hasTax && <th className="text-right py-2 px-2 text-[10px] font-semibold text-muted-foreground uppercase">Tax</th>}
                <th className="text-right py-2 px-2 text-[10px] font-semibold text-muted-foreground uppercase">Total</th>
              </tr>
            </thead>
            <tbody>
              {dept.lineItems.map((item, i) => {
                const calc = calcLineItem(item);
                return (
                  <tr key={i} className={cn(i % 2 === 1 && "bg-muted/20")}>
                    <td className="py-1.5 px-2 text-xs text-muted-foreground whitespace-nowrap">
                      {item.dateStart ? formatDate(item.dateStart, locale, true) : "—"}
                    </td>
                    {hasServiceCodes && (
                      <td className="py-1.5 px-2 text-xs font-mono text-muted-foreground">{item.serviceCode || "—"}</td>
                    )}
                    <td className="py-1.5 px-2 text-sm text-foreground">{item.description}</td>
                    {hasClinicians && (
                      <td className="py-1.5 px-2 text-xs text-muted-foreground">{item.clinician || "—"}</td>
                    )}
                    <td className="py-1.5 px-2 text-center text-sm text-foreground">{item.quantity}</td>
                    {hasUom && (
                      <td className="py-1.5 px-2 text-center text-xs text-muted-foreground">{item.uom || "—"}</td>
                    )}
                    <td className="py-1.5 px-2 text-right text-sm text-muted-foreground">{formatCurrency(item.unitPrice, currency, locale)}</td>
                    {hasDiscounts && (
                      <td className="py-1.5 px-2 text-right text-xs text-muted-foreground">
                        {calc.discount > 0 ? `-${formatCurrency(calc.discount, currency, locale)}` : "—"}
                      </td>
                    )}
                    {hasTax && (
                      <td className="py-1.5 px-2 text-right text-xs text-muted-foreground">
                        {calc.tax > 0 ? formatCurrency(calc.tax, currency, locale) : "—"}
                      </td>
                    )}
                    <td className="py-1.5 px-2 text-right font-medium text-foreground">{formatCurrency(calc.lineTotal, currency, locale)}</td>
                  </tr>
                );
              })}
              <tr className="bg-muted/40">
                <td colSpan={hasServiceCodes && hasClinicians && hasUom && hasDiscounts && hasTax ? 9 : hasServiceCodes || hasClinicians ? 7 : 5} className="py-2 px-2 text-right text-xs font-medium text-muted-foreground">
                  {dept.name} Subtotal
                </td>
                <td className="py-2 px-2 text-right font-bold text-foreground">
                  {formatCurrency(calculations.departmentSubtotals[dept.name]?.total || 0, currency, locale)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}

      {/* Adjustments */}
      {bill.adjustments && bill.adjustments.length > 0 && (
        <div className="p-5 border-b border-border">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Adjustments</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Type</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Reason</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill.adjustments.map((adj, i) => (
                <tr key={i} className={cn(i % 2 === 1 && "bg-muted/20")}>
                  <td className="py-2 px-3 text-muted-foreground">{adj.date ? formatDate(adj.date, locale) : "—"}</td>
                  <td className="py-2 px-3 text-foreground">{adj.type || "—"}</td>
                  <td className="py-2 px-3 text-muted-foreground">{adj.reason || "—"}</td>
                  <td className={cn("py-2 px-3 text-right font-medium", adj.amount < 0 ? "text-green-600" : "text-foreground")}>
                    {adj.amount < 0 ? "-" : ""}{formatCurrency(Math.abs(adj.amount), currency, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payments */}
      {bill.payments && bill.payments.length > 0 && (
        <div className="p-5 border-b border-border">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Payments Received</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Method</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Reference</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Remarks</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill.payments.map((pmt, i) => (
                <tr key={i} className={cn(i % 2 === 1 && "bg-muted/20")}>
                  <td className="py-2 px-3 text-foreground">{formatDate(pmt.date, locale)}</td>
                  <td className="py-2 px-3 text-foreground">{pmt.method}</td>
                  <td className="py-2 px-3 font-mono text-muted-foreground">{pmt.reference || "—"}</td>
                  <td className="py-2 px-3 text-muted-foreground">{pmt.remarks || "—"}</td>
                  <td className="py-2 px-3 text-right font-medium text-green-600">{formatCurrency(pmt.amount, currency, locale)}</td>
                </tr>
              ))}
              <tr className="bg-muted/40 font-medium">
                <td colSpan={4} className="py-2 px-3 text-right text-muted-foreground">Total Paid</td>
                <td className="py-2 px-3 text-right font-bold text-green-600">{formatCurrency(calculations.paymentsTotal, currency, locale)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Grand Summary */}
      <div className="p-5 border-b border-border bg-muted/20">
        <div className="flex justify-end">
          <div className="w-[340px] space-y-1.5">
            <div className="flex justify-between py-1">
              <span className="text-sm text-muted-foreground">Gross Charges</span>
              <span className="text-sm font-medium text-foreground">{formatCurrency(calculations.totalGross, currency, locale)}</span>
            </div>
            {calculations.totalDiscounts > 0 && (
              <div className="flex justify-between py-1">
                <span className="text-sm text-muted-foreground">Total Discounts</span>
                <span className="text-sm font-medium text-green-600">- {formatCurrency(calculations.totalDiscounts, currency, locale)}</span>
              </div>
            )}
            {calculations.totalTax > 0 && (
              <div className="flex justify-between py-1">
                <span className="text-sm text-muted-foreground">Tax</span>
                <span className="text-sm font-medium text-foreground">{formatCurrency(calculations.totalTax, currency, locale)}</span>
              </div>
            )}
            {calculations.adjustmentsTotal !== 0 && (
              <div className="flex justify-between py-1">
                <span className="text-sm text-muted-foreground">Adjustments</span>
                <span className={cn("text-sm font-medium", calculations.adjustmentsTotal < 0 ? "text-green-600" : "text-foreground")}>
                  {calculations.adjustmentsTotal < 0 ? "-" : ""}{formatCurrency(Math.abs(calculations.adjustmentsTotal), currency, locale)}
                </span>
              </div>
            )}
            {calculations.insuranceCoverage > 0 && (
              <div className="flex justify-between py-1">
                <span className="text-sm text-muted-foreground">Insurance Coverage</span>
                <span className="text-sm font-medium text-green-600">- {formatCurrency(calculations.insuranceCoverage, currency, locale)}</span>
              </div>
            )}
            {calculations.coPay > 0 && (
              <div className="flex justify-between py-1">
                <span className="text-sm text-muted-foreground">Co-Pay</span>
                <span className="text-sm font-medium text-foreground">{formatCurrency(calculations.coPay, currency, locale)}</span>
              </div>
            )}
            {calculations.paymentsTotal > 0 && (
              <div className="flex justify-between py-1">
                <span className="text-sm text-muted-foreground">Amount Paid</span>
                <span className="text-sm font-medium text-green-600">- {formatCurrency(calculations.paymentsTotal, currency, locale)}</span>
              </div>
            )}
            {calculations.roundOff !== 0 && (
              <div className="flex justify-between py-1">
                <span className="text-sm text-muted-foreground">Round-Off</span>
                <span className="text-sm font-medium text-foreground">{formatCurrency(calculations.roundOff, currency, locale)}</span>
              </div>
            )}
            <div className="flex justify-between py-3 border-t-2 border-primary mt-2">
              <span className="text-base font-bold text-foreground">AMOUNT DUE</span>
              <span className="text-xl font-bold text-primary">{formatCurrency(calculations.amountDue, currency, locale)}</span>
            </div>
            <p className="text-xs text-muted-foreground italic text-right">
              {currency === "INR" ? "Rupees" : currency} {numberToWords(Math.round(Math.abs(calculations.amountDue)))} Only
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-5 bg-muted/10">
        <div className="flex justify-between items-start">
          <div className="max-w-md">
            <p className="text-xs font-semibold text-foreground mb-2">Terms & Conditions</p>
            <ul className="text-[10px] text-muted-foreground space-y-0.5">
              <li>• Payment is due on discharge unless prior arrangements have been made.</li>
              <li>• Accepted payment methods: Cash, Card, UPI, Net Banking, Cheque.</li>
              <li>• Insurance claims are processed within 7-14 working days.</li>
              <li>• For billing queries, contact: {bill.facility.contact?.email || "billing@hospital.com"}</li>
            </ul>
            {bill.invoice.notes && (
              <p className="text-[10px] text-muted-foreground mt-2 italic">{bill.invoice.notes}</p>
            )}
          </div>
          <div className="text-right">
            <div className="mb-10">
              <p className="text-xs text-muted-foreground">For {bill.facility.name}</p>
            </div>
            <div className="border-t border-border pt-2 min-w-[160px]">
              {bill.signatures?.authorizedBy && (
                <p className="text-xs font-medium text-foreground">{bill.signatures.authorizedBy}</p>
              )}
              <p className="text-[10px] text-muted-foreground">Authorized Signatory</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center text-[10px] text-muted-foreground">
          <div>
            {bill.signatures?.cashierName && <span>Cashier: {bill.signatures.cashierName}</span>}
            {bill.signatures?.generatedBy && <span className="ml-4">Generated by: {bill.signatures.generatedBy}</span>}
          </div>
          <p>This is a system-generated document. Page 1 of 1</p>
        </div>
      </footer>
    </div>
  );
}

export default DischargeBillInvoice;
