import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import BainesLogoFull from "@/assets/baines-logo-full.svg";

interface InvoiceItem {
  sno: number;
  particulars: string;
  qty: string | number;
  rate: string;
  amount: string;
}

interface InvoiceSection {
  code: string;
  title: string;
  items: InvoiceItem[];
  subtotal: string;
}

interface DischargeInvoiceProps {
  invoiceNo?: string;
  invoiceDate?: string;
  admissionNo?: string;
  patientName?: string;
  uhid?: string;
  age?: string;
  gender?: string;
  admissionDate?: string;
  dischargeDate?: string;
  attendingPhysician?: string;
  grossTotal?: number;
  discount?: number;
  cgst?: number;
  sgst?: number;
  netAmount?: number;
}

const DischargeInvoice = ({
  invoiceNo = "INV009",
  invoiceDate = "21/12/2025",
  admissionNo = "ADM142",
  patientName = "Siva Karthikeyan",
  uhid = "GDID-009",
  age = "35 Years",
  gender = "Male",
  admissionDate = "05/10/2025",
  dischargeDate = "08/10/2025",
  attendingPhysician = "Dr. Arun Kumar, MD (Cardiology)",
  grossTotal = 44000,
  discount = 0,
  cgst = 0,
  sgst = 0,
  netAmount = 44000,
}: DischargeInvoiceProps) => {
  const sections: InvoiceSection[] = [
    {
      code: "A",
      title: "ROOM & BED CHARGES",
      items: [
        { sno: 1, particulars: "Deluxe Room - 3 Days @ ₹2,500/day", qty: 3, rate: "2,500.00", amount: "7,500.00" },
        { sno: 2, particulars: "Nursing Charges (per day)", qty: 3, rate: "400.00", amount: "1,200.00" },
      ],
      subtotal: "8,700.00",
    },
    {
      code: "B",
      title: "DOCTOR CONSULTATION",
      items: [
        { sno: 3, particulars: "Cardiology Consultation - Dr. Arun Kumar", qty: 1, rate: "1,500.00", amount: "1,500.00" },
        { sno: 4, particulars: "Follow-up Visit", qty: 2, rate: "500.00", amount: "1,000.00" },
      ],
      subtotal: "2,500.00",
    },
    {
      code: "C",
      title: "PROCEDURES & SERVICES",
      items: [
        { sno: 5, particulars: "Cardiac Catheterization", qty: 1, rate: "18,000.00", amount: "18,000.00" },
        { sno: 6, particulars: "ECG - 12 Lead", qty: 2, rate: "350.00", amount: "700.00" },
        { sno: 7, particulars: "Echocardiography", qty: 1, rate: "2,500.00", amount: "2,500.00" },
      ],
      subtotal: "21,200.00",
    },
    {
      code: "D",
      title: "LABORATORY INVESTIGATIONS",
      items: [
        { sno: 8, particulars: "Complete Blood Count (CBC)", qty: 2, rate: "400.00", amount: "800.00" },
        { sno: 9, particulars: "Lipid Profile", qty: 1, rate: "650.00", amount: "650.00" },
        { sno: 10, particulars: "Liver Function Test (LFT)", qty: 1, rate: "850.00", amount: "850.00" },
        { sno: 11, particulars: "Cardiac Biomarkers (Troponin I)", qty: 1, rate: "1,200.00", amount: "1,200.00" },
      ],
      subtotal: "3,500.00",
    },
    {
      code: "E",
      title: "RADIOLOGY & IMAGING",
      items: [
        { sno: 12, particulars: "Chest X-Ray (PA View)", qty: 1, rate: "450.00", amount: "450.00" },
        { sno: 13, particulars: "CT Coronary Angiography", qty: 1, rate: "6,500.00", amount: "6,500.00" },
      ],
      subtotal: "6,950.00",
    },
    {
      code: "F",
      title: "PHARMACY & CONSUMABLES",
      items: [
        { sno: 14, particulars: "Medicines & Drugs", qty: "—", rate: "—", amount: "850.00" },
        { sno: 15, particulars: "Surgical Consumables", qty: "—", rate: "—", amount: "300.00" },
      ],
      subtotal: "1,150.00",
    },
  ];

  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num === 0) return 'Zero';
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? '-' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
    if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
    return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '');
  };

  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b border-border">
        <img src={BainesLogoFull} alt="Baines International Healthcare" className="h-9" />
        <div className="text-right text-sm text-muted-foreground">
          <p>123 Healthcare Avenue, Medical District</p>
          <p>Phone: +91 98765 43210 | GSTIN: 29XXXXX1234X1Z5</p>
        </div>
      </div>

      {/* Invoice Details Row */}
      <div className="grid grid-cols-3 p-5 border-b border-border bg-muted/30">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Invoice No.</p>
          <p className="text-sm font-semibold text-foreground">{invoiceNo}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Invoice Date</p>
          <p className="text-sm font-semibold text-foreground">{invoiceDate}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Admission No.</p>
          <p className="text-sm font-semibold text-foreground">{admissionNo}</p>
        </div>
      </div>

      {/* Patient Details */}
      <div className="p-5 border-b border-border">
        <div className="grid grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Patient Details</p>
            <p className="text-sm font-semibold text-foreground">{patientName}</p>
            <p className="text-xs text-muted-foreground">UHID: {uhid}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Age / Gender</p>
            <p className="text-sm font-semibold text-foreground">{age} / {gender}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Admission Date</p>
            <p className="text-sm font-semibold text-foreground">{admissionDate}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Discharge Date</p>
            <p className="text-sm font-semibold text-primary">{dischargeDate}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Attending Physician:</p>
          <p className="text-sm font-medium text-foreground">{attendingPhysician}</p>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="p-5">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-16 text-xs font-semibold">S.NO</TableHead>
              <TableHead className="text-xs font-semibold">PARTICULARS</TableHead>
              <TableHead className="w-24 text-center text-xs font-semibold">QTY</TableHead>
              <TableHead className="w-28 text-right text-xs font-semibold">RATE (₹)</TableHead>
              <TableHead className="w-32 text-right text-xs font-semibold">AMOUNT (₹)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sections.map((section) => (
              <>
                {/* Section Header */}
                <TableRow key={`section-${section.code}`} className="hover:bg-transparent">
                  <TableCell colSpan={5} className="py-3">
                    <span className="text-xs font-bold text-primary">{section.code}. {section.title}</span>
                  </TableCell>
                </TableRow>
                
                {/* Section Items */}
                {section.items.map((item) => (
                  <TableRow key={`item-${item.sno}`} className="hover:bg-muted/30">
                    <TableCell className="text-sm text-muted-foreground">{item.sno}</TableCell>
                    <TableCell className="text-sm text-foreground pl-6">{item.particulars}</TableCell>
                    <TableCell className="text-sm text-center text-muted-foreground">{item.qty}</TableCell>
                    <TableCell className="text-sm text-right text-muted-foreground">{item.rate}</TableCell>
                    <TableCell className="text-sm text-right font-medium text-foreground">{item.amount}</TableCell>
                  </TableRow>
                ))}
                
                {/* Section Subtotal */}
                <TableRow key={`subtotal-${section.code}`} className="bg-muted/30 hover:bg-muted/30">
                  <TableCell colSpan={3}></TableCell>
                  <TableCell className="text-sm text-right font-medium text-muted-foreground">Sub-Total ({section.code})</TableCell>
                  <TableCell className="text-sm text-right font-bold text-foreground">{section.subtotal}</TableCell>
                </TableRow>
              </>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Totals Section */}
      <div className="border-t border-border">
        <div className="flex justify-end p-5">
          <div className="w-80 space-y-2">
            <div className="flex justify-between py-1.5">
              <span className="text-sm text-muted-foreground">Gross Total</span>
              <span className="text-sm font-medium text-foreground">{grossTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-sm text-muted-foreground">Discount ({discount}%)</span>
              <span className="text-sm font-medium text-foreground">0.00</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-sm text-muted-foreground">Taxable Amount</span>
              <span className="text-sm font-medium text-foreground">{grossTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-sm text-muted-foreground">CGST @ {cgst}%</span>
              <span className="text-sm font-medium text-foreground">0.00</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-sm text-muted-foreground">SGST @ {sgst}%</span>
              <span className="text-sm font-medium text-foreground">0.00</span>
            </div>
            <div className="flex justify-between py-3 border-t border-border mt-2">
              <span className="text-base font-bold text-foreground">NET AMOUNT PAYABLE</span>
              <span className="text-lg font-bold text-primary">₹{netAmount.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-xs text-muted-foreground italic text-right">
              Rupees {numberToWords(netAmount)} Only
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border p-5 bg-muted/20">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">Payment Terms</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Payment due on discharge</li>
              <li>• Accepted: Cash, Card, UPI, Net Banking</li>
              <li>• Insurance claims processed within 7 working days</li>
            </ul>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-8">For GoodDoc Hospital</p>
            <p className="text-xs font-semibold text-foreground border-t border-border pt-2">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DischargeInvoice;
