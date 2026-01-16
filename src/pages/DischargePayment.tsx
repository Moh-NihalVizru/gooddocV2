import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, Printer, Download, FileText, Pill, Receipt, ClipboardList, Plus, Trash2, User, CreditCard, CheckCircle2, Calendar, Clock, Stethoscope, Building2, Bed, Activity, FlaskConical, Syringe, Heart, Smartphone, RotateCcw, AlertCircle } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import BainesPoweredLogo from "@/assets/baines-powered-logo.svg";
import { PaymentMethodModal } from "@/components/payment";
import { SplitPaymentWizardModal, type SplitPaymentStep } from "@/components/payment/SplitPaymentWizardModal";
import { useSplitPaymentAutoCalc, type SplitRow } from "@/hooks/useSplitPaymentAutoCalc";
import type { PaymentMethod as PaymentMethodType, PaymentAttempt } from "@/types/payment-intent";
import { formatINR } from "@/utils/currency";

// Mock visit history data
const visitHistoryData = {
  patient: {
    name: "Harish Kalyan",
    uhid: "GDID-001",
    age: "44 Years",
    gender: "Male",
    bloodGroup: "B+",
    phone: "+91 98765 43210",
  },
  admission: {
    admissionNo: "ADM-2025-0142",
    admissionDate: "18/12/2025",
    admissionTime: "10:30 AM",
    dischargeDate: "22/12/2025",
    dischargeTime: "02:45 PM",
    los: "4 Days",
    ward: "Deluxe Room - 302",
    department: "Cardiology",
    attendingDoctor: "Dr. Arun Kumar, MD (Cardiology)",
  },
  diagnosis: {
    primary: "Unstable Angina (ICD-10: I20.0)",
    secondary: ["Hypertension (I10)", "Type 2 Diabetes Mellitus (E11.9)"],
  },
  timeline: [
    { date: "18/12/2025", time: "10:30 AM", event: "Patient Admitted", type: "admission", details: "Emergency admission via OPD" },
    { date: "18/12/2025", time: "11:00 AM", event: "Initial Assessment", type: "assessment", details: "Vitals recorded, ECG done" },
    { date: "18/12/2025", time: "02:00 PM", event: "Cardiac Catheterization", type: "procedure", details: "Diagnostic angiography performed" },
    { date: "19/12/2025", time: "09:00 AM", event: "Cardiologist Consultation", type: "consultation", details: "Dr. Arun Kumar reviewed reports" },
    { date: "19/12/2025", time: "11:30 AM", event: "Echocardiography", type: "diagnostic", details: "2D Echo with Doppler" },
    { date: "20/12/2025", time: "08:00 AM", event: "Lab Tests", type: "lab", details: "CBC, Lipid Profile, Cardiac Markers" },
    { date: "21/12/2025", time: "10:00 AM", event: "CT Coronary Angiography", type: "radiology", details: "For detailed vessel mapping" },
    { date: "22/12/2025", time: "02:45 PM", event: "Patient Discharged", type: "discharge", details: "Discharged with medications" },
  ],
  billingSummary: {
    roomCharges: [
      { item: "Deluxe Room - 4 Days @ ₹2,500/day", qty: 4, rate: 2500, amount: 10000 },
      { item: "Nursing Charges (per day)", qty: 4, rate: 400, amount: 1600 },
    ],
    consultations: [
      { item: "Cardiology Consultation - Dr. Arun Kumar", qty: 1, rate: 1500, amount: 1500 },
      { item: "Follow-up Visits", qty: 3, rate: 500, amount: 1500 },
    ],
    procedures: [
      { item: "Cardiac Catheterization", qty: 1, rate: 18000, amount: 18000 },
      { item: "ECG - 12 Lead", qty: 3, rate: 350, amount: 1050 },
      { item: "Echocardiography", qty: 1, rate: 2500, amount: 2500 },
    ],
    laboratory: [
      { item: "Complete Blood Count (CBC)", qty: 2, rate: 400, amount: 800 },
      { item: "Lipid Profile", qty: 1, rate: 650, amount: 650 },
      { item: "Cardiac Biomarkers (Troponin I)", qty: 2, rate: 1200, amount: 2400 },
    ],
    radiology: [
      { item: "Chest X-Ray (PA View)", qty: 2, rate: 450, amount: 900 },
      { item: "CT Coronary Angiography", qty: 1, rate: 6500, amount: 6500 },
    ],
    pharmacy: [
      { item: "Medicines & Drugs", qty: 1, rate: 2850, amount: 2850 },
      { item: "Surgical Consumables", qty: 1, rate: 600, amount: 600 },
    ],
  },
  paymentDetails: {
    grossTotal: 51700,
    discount: 0,
    advancePaid: 20000,
    amountCollected: 31700,
    paymentMode: "Cash",
    receiptNo: "RCP521",
    paymentDate: "22/12/2025",
    paymentTime: "02:30 PM",
  },
  dischargeSummary: {
    conditionAtDischarge: "Stable",
    followUpDate: "29/12/2025",
    followUpDoctor: "Dr. Arun Kumar",
    dietAdvice: "Low salt, low fat diet. Avoid fried foods.",
    activityAdvice: "Light walking, avoid strenuous activity for 2 weeks",
    medications: [
      { name: "Aspirin 75mg", dosage: "1 tablet", frequency: "Once daily", duration: "Lifelong" },
      { name: "Atorvastatin 40mg", dosage: "1 tablet", frequency: "At night", duration: "Lifelong" },
      { name: "Metoprolol 50mg", dosage: "1 tablet", frequency: "Twice daily", duration: "3 months" },
      { name: "Clopidogrel 75mg", dosage: "1 tablet", frequency: "Once daily", duration: "1 year" },
    ],
    emergencyInstructions: "Return immediately if chest pain, breathlessness, or palpitations occur",
  },
};

const DischargePayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { patientId } = useParams();
  const [depositExpanded, setDepositExpanded] = useState(false);
  const [confirmCounseling, setConfirmCounseling] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const fromSearch = searchParams.get("from") === "search";
  const patientSearchQuery = searchParams.get("q") || "";

  const handleBack = () => {
    if (paymentCompleted) {
      navigate(`/patient-insights/${patientId}`);
    } else {
      navigate(`/patient-insights/${patientId}/discharge`);
    }
  };

  const { isCollapsed } = useSidebarContext();

  // Calculate totals
  const totalBill = 32700;
  const patientDeposit = 20000;
  const depositUsed = depositExpanded ? Math.min(patientDeposit, totalBill) : 0;
  const remainingDeposit = patientDeposit - depositUsed;
  const netPayable = depositExpanded ? Math.max(0, totalBill - depositUsed) : totalBill;

  // Use auto-calc split payment hook
  const {
    rows: splitRows,
    totalEntered,
    isValid,
    validationError,
    updateRowAmount,
    updateRowMethod,
    addRow,
    removeRow,
    resetDistribution,
    getCardUpiSteps,
  } = useSplitPaymentAutoCalc({ totalDue: netPayable });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>("card");
  const [showSplitWizard, setShowSplitWizard] = useState(false);

  const handlePaymentSuccess = (attempt: PaymentAttempt) => {
    setShowPaymentModal(false);
    toast({
      title: "Payment Collected Successfully",
      description: `${formatINR(netPayable * 100)} received. Receipt No: RCP521`,
    });
    setPaymentCompleted(true);
  };

  const handleSplitWizardComplete = (steps: SplitPaymentStep[]) => {
    const cardAmount = steps.filter(s => s.method === 'card' && s.status === 'succeeded')
      .reduce((sum, s) => sum + s.amount, 0);
    const upiAmount = steps.filter(s => s.method === 'upi' && s.status === 'succeeded')
      .reduce((sum, s) => sum + s.amount, 0);
    
    toast({
      title: "Split payment collected successfully!",
      description: `Card: ${formatINR(cardAmount)} + UPI: ${formatINR(upiAmount)}`,
    });
    setPaymentCompleted(true);
  };

  const handleCollectPayment = () => {
    if (!isValid) {
      toast({ title: "Invalid split", description: validationError || "Please check amounts", variant: "destructive" });
      return;
    }

    // If user chose a single method (Card/UPI) via dropdown, open the payment popup
    if (splitRows.length === 1 && (splitRows[0].method === "card" || splitRows[0].method === "upi")) {
      setSelectedPaymentMethod(splitRows[0].method);
      setShowPaymentModal(true);
      return;
    }

    const cardUpiSteps = getCardUpiSteps();
    if (cardUpiSteps.length > 0) {
      setShowSplitWizard(true);
    } else {
      toast({
        title: "Payment Collected Successfully",
        description: `${formatINR(netPayable * 100)} received. Receipt No: RCP521`,
      });
      setPaymentCompleted(true);
    }
  };

  // Wizard steps
  const wizardSteps: SplitPaymentStep[] = getCardUpiSteps().map(step => ({
    ...step,
    status: 'pending' as const,
  }));

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case "admission": return <Building2 className="w-3 h-3" />;
      case "assessment": return <Activity className="w-3 h-3" />;
      case "procedure": return <Syringe className="w-3 h-3" />;
      case "consultation": return <Stethoscope className="w-3 h-3" />;
      case "diagnostic": return <Heart className="w-3 h-3" />;
      case "lab": return <FlaskConical className="w-3 h-3" />;
      case "radiology": return <Activity className="w-3 h-3" />;
      case "discharge": return <CheckCircle2 className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  // Payment completed - show visit summary
  if (paymentCompleted) {
    const data = visitHistoryData;
    const billing = data.billingSummary;
    const payment = data.paymentDetails;

    return (
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        
        <div className={cn("flex-1 transition-all duration-300", isCollapsed ? "ml-[60px]" : "ml-[220px]")}>
          <AppHeader breadcrumbs={["Patient Insights", "Discharge", "Visit Summary"]} />
          
          {/* Success Header */}
          <div className="h-[72px] bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-800 flex items-center justify-between px-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="font-semibold">Back to Patient</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Discharge Complete</span>
              </div>
              <Badge variant="outline" className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-300">
                Receipt: {payment.receiptNo}
              </Badge>
            </div>
          </div>

          <main className="p-6">
            <div className="max-w-[1000px] mx-auto space-y-5">
              {/* Hospital Header */}
              <Card className="p-5 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <div className="flex items-start justify-between">
                  <div>
                    <img src={BainesPoweredLogo} alt="Baines International Healthcare" className="h-9" />
                    <p className="text-sm text-muted-foreground mt-2">123 Healthcare Avenue, Medical District, Chennai - 600001</p>
                    <p className="text-sm text-muted-foreground">Phone: +91 44 2345 6789 | GSTIN: 33XXXXX1234X1Z5</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">IP Discharge Summary</p>
                    <p className="text-sm text-muted-foreground">{data.admission.admissionNo}</p>
                  </div>
                </div>
              </Card>

              {/* Patient & Admission Info */}
              <div className="grid grid-cols-2 gap-5">
                <Card className="p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Patient Information
                  </h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Patient Name</p>
                      <p className="text-sm font-medium">{data.patient.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">UHID</p>
                      <p className="text-sm font-medium">{data.patient.uhid}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Age / Gender</p>
                      <p className="text-sm font-medium">{data.patient.age} / {data.patient.gender}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Blood Group</p>
                      <p className="text-sm font-medium">{data.patient.bloodGroup}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    Admission Details
                  </h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Admission</p>
                      <p className="text-sm font-medium">{data.admission.admissionDate}, {data.admission.admissionTime}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Discharge</p>
                      <p className="text-sm font-medium">{data.admission.dischargeDate}, {data.admission.dischargeTime}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Length of Stay</p>
                      <p className="text-sm font-medium">{data.admission.los}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Ward</p>
                      <p className="text-sm font-medium">{data.admission.ward}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Diagnosis & Timeline */}
              <div className="grid grid-cols-3 gap-5">
                <Card className="p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-primary" />
                    Diagnosis
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Primary</p>
                      <p className="text-sm font-medium">{data.diagnosis.primary}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Secondary</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {data.diagnosis.secondary.map((d, i) => (
                          <Badge key={i} variant="secondary" className="text-xs px-2 py-0.5">{d}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 col-span-2">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Visit Timeline
                  </h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    {data.timeline.map((event, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                          event.type === "admission" || event.type === "discharge" 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted text-muted-foreground"
                        )}>
                          {getTimelineIcon(event.type)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{event.event}</p>
                          <p className="text-xs text-muted-foreground">{event.date}, {event.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Detailed Bill */}
              <Card className="p-4 overflow-hidden">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-primary" />
                  Detailed Bill Statement
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Particulars</th>
                        <th className="text-center py-2 px-3 font-medium text-muted-foreground w-16">Qty</th>
                        <th className="text-right py-2 px-3 font-medium text-muted-foreground w-24">Rate</th>
                        <th className="text-right py-2 px-3 font-medium text-muted-foreground w-24">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: "A. Room & Bed Charges", items: billing.roomCharges },
                        { label: "B. Doctor Consultation", items: billing.consultations },
                        { label: "C. Procedures & Services", items: billing.procedures },
                        { label: "D. Laboratory", items: billing.laboratory },
                        { label: "E. Radiology", items: billing.radiology },
                        { label: "F. Pharmacy", items: billing.pharmacy },
                      ].map((section, sIdx) => (
                        <>
                          <tr key={`section-${sIdx}`} className="bg-muted/20">
                            <td colSpan={4} className="py-1.5 px-3 font-semibold text-foreground">{section.label}</td>
                          </tr>
                          {section.items.map((item, i) => (
                            <tr key={`${sIdx}-${i}`} className="border-b border-border/50">
                              <td className="py-1.5 px-3">{item.item}</td>
                              <td className="py-1.5 px-3 text-center">{item.qty}</td>
                              <td className="py-1.5 px-3 text-right">₹{item.rate.toLocaleString()}</td>
                              <td className="py-1.5 px-3 text-right font-medium">₹{item.amount.toLocaleString()}</td>
                            </tr>
                          ))}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bill Summary */}
                <div className="mt-4 pt-4 border-t border-border flex justify-end">
                  <div className="w-64 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gross Total</span>
                      <span className="font-medium">₹{payment.grossTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Advance Paid</span>
                      <span className="font-medium text-emerald-600">- ₹{payment.advancePaid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="font-semibold">Amount Collected</span>
                      <span className="font-bold text-primary">₹{payment.amountCollected.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      {payment.paymentMode} • {payment.paymentDate}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Medications & Follow-up */}
              <div className="grid grid-cols-2 gap-5">
                <Card className="p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Pill className="w-4 h-4 text-primary" />
                    Discharge Medications
                  </h3>
                  <div className="space-y-3">
                    {data.dischargeSummary.medications.map((med, i) => (
                      <div key={i} className="flex items-start justify-between text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                        <div>
                          <p className="font-medium">{med.name}</p>
                          <p className="text-xs text-muted-foreground">{med.frequency} • {med.duration}</p>
                        </div>
                        <span className="text-muted-foreground shrink-0">{med.dosage}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Follow-up & Instructions
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Next Visit</span>
                      <span className="font-medium">{data.dischargeSummary.followUpDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Doctor</span>
                      <span className="font-medium">{data.dischargeSummary.followUpDoctor}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Condition</span>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                        {data.dischargeSummary.conditionAtDischarge}
                      </Badge>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground uppercase mb-1">Emergency</p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">{data.dischargeSummary.emergencyInstructions}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Printer className="w-4 h-4" />
                    Print
                  </Button>
                </div>
                <Button size="sm" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Email to Patient
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      
      <div className={cn("flex-1 transition-all duration-300", isCollapsed ? "ml-[60px]" : "ml-[220px]")}>
        <AppHeader breadcrumbs={["Patient Insights", "Discharge", "Collect Payment"]} />
        
        {/* Compact Header */}
        <div className="h-[72px] bg-background border-b border-border flex items-center justify-between px-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="font-semibold">Back to Discharge</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Harish Kalyan</p>
              <p className="text-xs text-muted-foreground">GDID-001 • 44Y / M</p>
            </div>
          </div>
        </div>

        <main className="p-6">
          <div className="flex gap-6 justify-center">
            {/* Left Column - Payment Settlement */}
            <div className="w-[500px] space-y-6">
              {/* Settlement & Payment Adjustments Combined */}
              <Card className="p-0 overflow-hidden">
                <div className="bg-primary px-4 py-3 rounded-t-lg">
                  <h2 className="text-base font-semibold text-primary-foreground">Payment Settlement</h2>
                  <p className="text-xs text-primary-foreground/80 mt-0.5">INV009</p>
                </div>
                
                <div className="p-4 space-y-4">
                  {/* Amount to Collect */}
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-xs text-muted-foreground mb-1">Amount to Collect</p>
                    <p className="text-2xl font-bold text-primary">₹{netPayable.toLocaleString()}</p>
                  </div>

                  {/* Patient Deposit Section */}
                  <div className="p-4 bg-muted/20 rounded-lg border border-border/50 space-y-3">
                    {/* Header row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="text-sm font-medium text-foreground">Patient Deposit</span>
                      </div>
                      <span className="text-sm font-semibold text-emerald-600">₹{patientDeposit.toLocaleString()}</span>
                    </div>
                    
                    {/* Toggle row */}
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={depositExpanded}
                        onCheckedChange={setDepositExpanded}
                      />
                      <span className="text-sm text-muted-foreground">Adjust deposit against this bill</span>
                    </div>
                    
                    {/* Deposit details - shown when toggle is on */}
                    {depositExpanded && (
                      <div className="space-y-2 pt-2 border-t border-border/50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Deposit Used</span>
                          <span className="text-sm font-medium text-destructive">- ₹{depositUsed.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Remaining Deposit</span>
                          <span className="text-sm font-semibold text-emerald-600">₹{remainingDeposit.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Split Payment */}
                  <div className="space-y-3 pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">Split Payment</p>
                      <button
                        onClick={resetDistribution}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset
                      </button>
                    </div>

                    <div className="space-y-2">
                      {splitRows.map((row) => (
                        <div key={row.id} className="flex items-center gap-2">
                          <div className="flex-1 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                            <Input
                              type="number"
                              value={row.amount || ""}
                              onChange={(e) => updateRowAmount(row.id, parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="pl-7 h-10"
                              min={0}
                            />
                          </div>
                          <Select
                            value={row.method}
                            onValueChange={(value) => updateRowMethod(row.id, value as SplitRow['method'])}
                          >
                            <SelectTrigger className={`w-[120px] bg-background ${row.method === "card" || row.method === "upi" ? "border-primary bg-primary/5" : ""}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-background border border-border z-50">
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="card">Card</SelectItem>
                              <SelectItem value="upi">UPI</SelectItem>
                            </SelectContent>
                          </Select>
                          {splitRows.length > 1 && (
                            <button
                              onClick={() => removeRow(row.id)}
                              className="p-2 rounded-lg transition-colors text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Validation Error */}
                    {validationError && (
                      <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        {validationError}
                      </div>
                    )}

                    <button
                      onClick={addRow}
                      className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Split Payment
                    </button>

                  </div>

                  {/* Payer Details */}
                  <div className="space-y-3 pt-2 border-t border-border">
                    <p className="text-sm font-medium text-foreground">Payer Details</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">Name</label>
                        <Input placeholder="Payer name" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">Relation</label>
                        <Select defaultValue="self">
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select relation" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border border-border z-50">
                            <SelectItem value="self">Self</SelectItem>
                            <SelectItem value="spouse">Spouse</SelectItem>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="child">Child</SelectItem>
                            <SelectItem value="sibling">Sibling</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Mobile Number</label>
                      <Input placeholder="+91" />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 space-y-2">
                    <Button className="w-full" size="lg" onClick={handleCollectPayment}>
                      Collect Payment
                    </Button>
                    <Button variant="outline" className="w-full gap-2">
                      <Printer className="w-4 h-4" />
                      Print Bill
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Documents & Finalize */}
            <div className="w-[380px] space-y-6">
              {/* Discharge Documents */}
              <Card className="p-6">
                <h2 className="text-base font-semibold text-foreground mb-4">Discharge Documents</h2>
                
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left">
                    <FileText className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Discharge Summary</p>
                      <p className="text-xs text-muted-foreground">PDF Document</p>
                    </div>
                    <Download className="w-4 h-4 text-muted-foreground" />
                  </button>
                  
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left">
                    <Pill className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Prescription</p>
                      <p className="text-xs text-muted-foreground">e-Prescription</p>
                    </div>
                    <Download className="w-4 h-4 text-muted-foreground" />
                  </button>
                  
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left">
                    <Receipt className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Final Bill</p>
                      <p className="text-xs text-muted-foreground">Invoice & Receipt</p>
                    </div>
                    <Download className="w-4 h-4 text-muted-foreground" />
                  </button>
                  
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left">
                    <ClipboardList className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Care Instructions</p>
                      <p className="text-xs text-muted-foreground">Patient Guide</p>
                    </div>
                    <Download className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </Card>

              {/* Finalize */}
              <Card className="p-6">
                <h2 className="text-base font-semibold text-foreground mb-4">Finalize Discharge</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <Checkbox 
                      checked={confirmCounseling}
                      onCheckedChange={(checked) => setConfirmCounseling(!!checked)}
                    />
                    <p className="text-sm text-foreground leading-relaxed">
                      I confirm discharge counseling provided and documents shared with patient/attendant.
                    </p>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    disabled={!confirmCounseling}
                  >
                    Complete Discharge
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    Collect outstanding balance before discharge
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </main>

        {/* Payment Modal */}
        <PaymentMethodModal
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          patientId={patientId || "P001"}
          patientName={visitHistoryData.patient.name}
          mrn={visitHistoryData.patient.uhid}
          orderId={visitHistoryData.admission.admissionNo}
          amount={netPayable * 100}
          purpose="settlement"
          defaultMethod={selectedPaymentMethod}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setShowPaymentModal(false)}
        />

        {/* Split Payment Wizard Modal */}
        <SplitPaymentWizardModal
          open={showSplitWizard}
          onOpenChange={setShowSplitWizard}
          patientId={patientId || "P001"}
          patientName={visitHistoryData.patient.name}
          mrn={visitHistoryData.patient.uhid}
          orderId={visitHistoryData.admission.admissionNo}
          totalAmount={netPayable * 100}
          purpose="settlement"
          steps={wizardSteps}
          onComplete={handleSplitWizardComplete}
          onCancel={() => setShowSplitWizard(false)}
        />
      </div>
    </div>
  );
};

export default DischargePayment;
