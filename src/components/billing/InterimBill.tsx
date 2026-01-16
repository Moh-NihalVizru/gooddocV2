import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Calendar, 
  Bed, 
  Phone,
  Mail,
  Download,
  Printer,
  CreditCard
} from "lucide-react";
import bainesLogo from "@/assets/baines-logo-english.svg";

interface InterimBillProps {
  onProceedToPayment?: () => void;
}

const InterimBill = ({ onProceedToPayment }: InterimBillProps) => {
  const bedCharges = [
    { date: "18 Dec 2025", ward: "Cardiac Care / CC-207", roomType: "Deluxe", bedType: "Motorized", days: 1, rate: 2500, amount: 2500 },
    { date: "19 Dec 2025", ward: "Cardiac Care / CC-207", roomType: "Deluxe", bedType: "Motorized", days: 1, rate: 2500, amount: 2500 },
    { date: "20 Dec 2025", ward: "Cardiac Care / CC-207", roomType: "Deluxe", bedType: "Motorized", days: 1, rate: 2500, amount: 2500 },
  ];

  const consultations = [
    { date: "18 Dec 2025, 15:30", code: "CONS-CARD", description: "Cardiology Consultation - Dr. Arun Kumar", clinician: "Dr. Arun Kumar", qty: 1, rate: 1500, tax: 0, total: 1500 },
    { date: "19 Dec 2025, 15:00", code: "CONS-FU", description: "Follow-up Visit", clinician: "Dr. Arun Kumar", qty: 2, rate: 500, tax: 0, total: 1000 },
  ];

  const procedures = [
    { date: "19 Dec 2025, 14:00", code: "PROC-CATH", description: "Cardiac Catheterization", clinician: "Dr. Arun Kumar", qty: 1, rate: 18000, tax: 900, total: 18900 },
    { date: "18 Dec 2025, 16:30", code: "PROC-ECG", description: "ECG - 12 Lead", clinician: "—", qty: 2, rate: 350, tax: 35, total: 735 },
    { date: "19 Dec 2025, 19:30", code: "PROC-ECHO", description: "2D Echocardiography", clinician: "Dr. Arun Kumar", qty: 1, rate: 2500, tax: 125, total: 2625 },
  ];

  const labTests = [
    { date: "18 Dec 2025, 13:05", code: "LAB-CBC", description: "Complete Blood Count (CBC)", clinician: "—", qty: 2, rate: 400, tax: 40, total: 840 },
    { date: "18 Dec 2025, 13:10", code: "LAB-LIPID", description: "Lipid Profile", clinician: "—", qty: 1, rate: 650, tax: 32.50, total: 682.50 },
    { date: "19 Dec 2025, 13:00", code: "LAB-LFT", description: "Liver Function Test (LFT)", clinician: "—", qty: 1, rate: 850, tax: 42.50, total: 892.50 },
    { date: "18 Dec 2025, 13:30", code: "LAB-TROP", description: "Cardiac Biomarkers (Troponin I)", clinician: "—", qty: 1, rate: 1200, tax: 60, total: 1260 },
  ];

  const radiology = [
    { date: "18 Dec 2025, 14:45", code: "RAD-XRAY", description: "Chest X-Ray (PA View)", clinician: "Dr. Ramesh", qty: 1, rate: 450, tax: 22.50, total: 472.50 },
    { date: "19 Dec 2025, 12:00", code: "RAD-CTCA", description: "CT Coronary Angiography", clinician: "Dr. Ramesh", qty: 1, rate: 6500, tax: 325, total: 6825 },
  ];

  const pharmacy = [
    { date: "18 Dec 2025, 17:30", code: "—", description: "Medicines & Drugs", clinician: "—", qty: 1, rate: 850, tax: 42.50, total: 892.50 },
    { date: "19 Dec 2025, 15:30", code: "—", description: "Surgical Consumables", clinician: "—", qty: 1, rate: 300, tax: 15, total: 315 },
  ];

  const nursing = [
    { date: "—", code: "—", description: "Nursing Charges (per day)", clinician: "—", qty: 3, uom: "day", rate: 400, tax: 0, total: 1200 },
    { date: "—", code: "—", description: "IV Cannulation & Monitoring", clinician: "—", qty: 1, uom: "—", rate: 800, tax: 0, total: 800 },
  ];

  const adjustments = [
    { date: "21 Dec 2025", type: "Loyalty Discount", reason: "Returning patient benefit", amount: -500 },
  ];

  const payments = [
    { date: "18 Dec 2025", method: "Card", reference: "TXN-88776655", remarks: "Advance payment", amount: 20000 },
  ];

  const renderServiceTable = (
    title: string, 
    code: string, 
    items: any[], 
    subtotal: number,
    visitedRange?: string
  ) => (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">{title}<span className="text-muted-foreground font-normal">({code})</span></h3>
      </div>
      {visitedRange && (
        <p className="text-xs text-muted-foreground mb-3">Visited: {visitedRange}</p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 text-xs font-medium text-muted-foreground uppercase">DATE</th>
              <th className="text-left py-2 text-xs font-medium text-muted-foreground uppercase">CODE</th>
              <th className="text-left py-2 text-xs font-medium text-muted-foreground uppercase">DESCRIPTION</th>
              <th className="text-left py-2 text-xs font-medium text-muted-foreground uppercase">CLINICIAN</th>
              <th className="text-right py-2 text-xs font-medium text-muted-foreground uppercase">QTY</th>
              <th className="text-left py-2 text-xs font-medium text-muted-foreground uppercase">UOM</th>
              <th className="text-right py-2 text-xs font-medium text-muted-foreground uppercase">RATE</th>
              <th className="text-right py-2 text-xs font-medium text-muted-foreground uppercase">TAX</th>
              <th className="text-right py-2 text-xs font-medium text-muted-foreground uppercase">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b border-border/50">
                <td className="py-2.5 text-muted-foreground">{item.date}</td>
                <td className="py-2.5 font-mono text-xs">{item.code}</td>
                <td className="py-2.5">{item.description}</td>
                <td className="py-2.5 text-muted-foreground">{item.clinician}</td>
                <td className="py-2.5 text-right">{item.qty}</td>
                <td className="py-2.5 text-muted-foreground">{item.uom || "—"}</td>
                <td className="py-2.5 text-right">₹{item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td className="py-2.5 text-right text-muted-foreground">{item.tax ? `₹${item.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : "—"}</td>
                <td className="py-2.5 text-right font-medium">₹{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-muted/30">
              <td colSpan={8} className="py-2.5 text-right font-medium">{title} Subtotal</td>
              <td className="py-2.5 text-right font-semibold">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Interim Bill Box */}
      <div className="bg-card border border-border rounded-lg overflow-hidden w-full">
        {/* Hospital Header */}
        <div className="bg-primary/5 border-b border-border p-6">
          <div className="flex items-start justify-between">
            <img src={bainesLogo} alt="Baines International Healthcare" className="h-10" />
            <div className="text-right text-sm text-muted-foreground">
              <p>123 Healthcare Avenue, Medical District, Chennai, Tamil Nadu, 600001</p>
              <div className="flex items-center justify-end gap-4 mt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  +91 98765 43210
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  billing@baines.health
                </span>
              </div>
              <div className="flex items-center justify-end gap-4 mt-1">
                <span>GSTIN: 33XXXXX1234X1Z5</span>
                <span>REG-TN-HOSP-2024-001</span>
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="px-6 py-4 border-b border-border bg-white dark:bg-card">
          <h2 className="text-lg font-semibold text-primary">Interim Bill</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Patient & Admission Info Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Patient Information */}
            <Card className="p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Patient Information
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-foreground text-base">Siva Karthikeyan</p>
                  <p className="text-muted-foreground">MRN: GDID-009 | Ph: +91 98765 12345</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">DOB</p>
                    <p className="font-medium">15 May 1990</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Sex: Male</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Admission Details */}
            <Card className="p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Admission Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Admission</p>
                  <p className="font-medium">18 Dec 2025, 15:00</p>
                  <Badge variant="outline" className="mt-1">Elective</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Till Date</p>
                  <p className="font-medium">21 Dec 2025, 19:30</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Admission ID</p>
                  <p className="font-mono text-xs">ADM-2025-0142</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ward / Room / Bed</p>
                  <p className="font-medium">Cardiac Care / CC-207 / Bed A</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Attending Providers */}
          <Card className="p-5">
            <h3 className="font-semibold text-foreground mb-3">Attending Providers</h3>
            <div className="flex flex-wrap items-start gap-x-12 gap-y-3 text-sm">
              <div className="min-w-[180px]">
                <p className="font-medium">Dr. Arun Kumar</p>
                <p className="text-muted-foreground">Attending Cardiologist</p>
              </div>
              <div className="min-w-[180px]">
                <p className="font-medium">Dr. Priya Sharma</p>
                <p className="text-muted-foreground">Consulting Physician</p>
              </div>
            </div>
          </Card>

          {/* Insurance Details */}
          <Card className="p-5">
            <h3 className="font-semibold text-foreground mb-3">Insurance Details</h3>
            <div className="flex flex-wrap items-start gap-x-10 gap-y-4 text-sm">
              <div className="min-w-[160px]">
                <p className="text-muted-foreground">Payer</p>
                <p className="font-medium">Star Health Insurance</p>
              </div>
              <div className="min-w-[140px]">
                <p className="text-muted-foreground">Plan</p>
                <p className="font-medium">Family Health Optima</p>
              </div>
              <div className="min-w-[120px]">
                <p className="text-muted-foreground">Member ID</p>
                <p className="font-mono text-xs">SH-88991234</p>
              </div>
              <div className="min-w-[140px]">
                <p className="text-muted-foreground">Policy No.</p>
                <p className="font-mono text-xs">POL-2024-559900</p>
              </div>
              <div className="min-w-[130px]">
                <p className="text-muted-foreground">Pre-Auth No.</p>
                <p className="font-mono text-xs">PA-2025-00456</p>
              </div>
              <div className="min-w-[80px]">
                <p className="text-muted-foreground">Coverage</p>
                <p className="font-medium text-green-600">80%</p>
              </div>
            </div>
          </Card>

          {/* Bed & Room Charges */}
          <Card className="p-5">
            <h3 className="font-semibold text-foreground mb-4">Bed & Room Charges</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-xs font-medium text-muted-foreground uppercase">DATE</th>
                    <th className="text-left py-2 text-xs font-medium text-muted-foreground uppercase">WARD/ROOM</th>
                    <th className="text-left py-2 text-xs font-medium text-muted-foreground uppercase">ROOM TYPE</th>
                    <th className="text-left py-2 text-xs font-medium text-muted-foreground uppercase">BED TYPE</th>
                    <th className="text-right py-2 text-xs font-medium text-muted-foreground uppercase">DAYS</th>
                    <th className="text-right py-2 text-xs font-medium text-muted-foreground uppercase">RATE</th>
                    <th className="text-right py-2 text-xs font-medium text-muted-foreground uppercase">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {bedCharges.map((item, index) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="py-2.5">{item.date}</td>
                      <td className="py-2.5">{item.ward}</td>
                      <td className="py-2.5">{item.roomType}</td>
                      <td className="py-2.5">{item.bedType}</td>
                      <td className="py-2.5 text-right">{item.days}</td>
                      <td className="py-2.5 text-right">₹{item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="py-2.5 text-right font-medium">₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/30">
                    <td colSpan={6} className="py-2.5 text-right font-medium">Bed Charges Subtotal</td>
                    <td className="py-2.5 text-right font-semibold">₹7,500.00</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          {/* Service Categories */}
          {renderServiceTable("Doctor Consultation", "CONS", consultations, 2500)}
          {renderServiceTable("Procedures & Services", "PROC", procedures, 22260, "19 Dec 2025, 13:30 — 19 Dec 2025, 18:00")}
          {renderServiceTable("Laboratory", "LAB", labTests, 3675, "18 Dec 2025, 13:00 — 20 Dec 2025, 13:30")}
          {renderServiceTable("Radiology & Imaging", "RAD", radiology, 7297.50)}
          {renderServiceTable("Pharmacy & Consumables", "PHARM", pharmacy, 1207.50)}
          {renderServiceTable("Nursing & Care", "NURS", nursing, 2000)}

          {/* Adjustments */}
          <Card className="p-5">
            <h3 className="font-semibold text-foreground mb-4">Adjustments</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-xs font-medium text-muted-foreground uppercase">DATE</th>
                    <th className="text-left py-2 text-xs font-medium text-muted-foreground uppercase">TYPE</th>
                    <th className="text-left py-2 text-xs font-medium text-muted-foreground uppercase">REASON</th>
                    <th className="text-right py-2 text-xs font-medium text-muted-foreground uppercase">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {adjustments.map((item, index) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="py-2.5">{item.date}</td>
                      <td className="py-2.5">{item.type}</td>
                      <td className="py-2.5 text-muted-foreground">{item.reason}</td>
                      <td className="py-2.5 text-right font-medium text-green-600">{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Payments Received */}
          <Card className="p-5">
            <h3 className="font-semibold text-foreground mb-4">Payments Received</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-xs font-medium text-muted-foreground uppercase">DATE</th>
                    <th className="text-left py-2 text-xs font-medium text-muted-foreground uppercase">METHOD</th>
                    <th className="text-left py-2 text-xs font-medium text-muted-foreground uppercase">REFERENCE</th>
                    <th className="text-left py-2 text-xs font-medium text-muted-foreground uppercase">REMARKS</th>
                    <th className="text-right py-2 text-xs font-medium text-muted-foreground uppercase">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((item, index) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="py-2.5">{item.date}</td>
                      <td className="py-2.5">{item.method}</td>
                      <td className="py-2.5 font-mono text-xs">{item.reference}</td>
                      <td className="py-2.5 text-muted-foreground">{item.remarks}</td>
                      <td className="py-2.5 text-right font-medium">₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/30">
                    <td colSpan={4} className="py-2.5 text-right font-medium">Total Paid</td>
                    <td className="py-2.5 text-right font-semibold">₹20,000.00</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          {/* Bill Summary */}
          <Card className="p-5 bg-muted/30">
            <div className="flex justify-end">
              <div className="space-y-2 text-sm w-80">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gross Charges</span>
                  <span className="font-medium">₹44,800.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">₹1,640.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Adjustments</span>
                  <span className="font-medium text-green-600">-₹500.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-medium">- ₹20,000.00</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">AMOUNT DUE</span>
                  <span className="font-bold text-primary">₹25,940.00</span>
                </div>
                <p className="text-xs text-muted-foreground italic text-right">Rupees Twenty Five Thousand Nine Hundred Forty Only</p>
              </div>
            </div>
          </Card>

          {/* Terms */}
          <Card className="p-5">
            <h3 className="font-semibold text-foreground mb-3">Terms & Conditions</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Payment is due on discharge unless prior arrangements have been made.</li>
              <li>• Accepted payment methods: Cash, Card, UPI, Net Banking, Cheque.</li>
              <li>• Insurance claims are processed within 7-14 working days.</li>
              <li>• For billing queries, contact: billing@baines.health</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">Thank you for choosing Baines International Healthcare. Wishing you a speedy recovery!</p>
          </Card>

          {/* Signature Section */}
          <Card className="p-5">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">For Baines International Healthcare</p>
                <p className="font-semibold mt-2">Dr. V. Krishnan (Medical Director)</p>
                <p className="text-sm text-muted-foreground">Authorized Signatory</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Cashier: A. Patel</p>
                <p className="text-xs text-muted-foreground">Generated by: Hospital Billing System v3.2</p>
                <p className="text-xs text-muted-foreground mt-2">This is a system-generated document. Page 1 of 1</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Action Buttons - Outside the bill box */}
      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
        <Button variant="outline" className="gap-2">
          <Printer className="w-4 h-4" />
          Print Invoice
        </Button>
      </div>
    </div>
  );
};

export default InterimBill;
