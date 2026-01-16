import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { PageContent } from "@/components/PageContent";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ChevronLeft, 
  Download,
  Printer,
  Trash2,
  User,
  RotateCcw,
  AlertCircle
} from "lucide-react";
import { formatINR } from "@/utils/currency";
import { toast } from "sonner";
import { PaymentMethodModal, CashPaymentModal } from "@/components/payment";
import { SplitPaymentWizardModal, type SplitPaymentStep } from "@/components/payment/SplitPaymentWizardModal";
import { useSplitPaymentAutoCalc, type SplitRow } from "@/hooks/useSplitPaymentAutoCalc";
import type { PaymentMethod as PaymentMethodType, PaymentAttempt } from "@/types/payment-intent";

// Mock patient data
const mockPatient = {
  name: "Harish Kalyan",
  gdid: "GDID-001",
  age: 44,
  gender: "Male",
  phone: "+91 98765 43210",
  visitId: "V25-004",
  currentAdvance: 320000, // ₹3,200 in paise
  usedAdvance: 0,
  estimatedBill: 980000, // ₹9,800 in paise
};

// Mock advance history with more details
const advanceHistory = [
  {
    id: "ADV-2025-001",
    receiptNo: "RCP001",
    date: "07 Aug 2025",
    time: "11:30 AM",
    amount: 200000,
    method: "UPI",
    reason: "Admission Deposit",
    payerName: "Harish Kalyan",
  },
  {
    id: "ADV-2025-002",
    receiptNo: "RCP002",
    date: "07 Aug 2025",
    time: "02:15 PM",
    amount: 120000,
    method: "Cash",
    reason: "Additional Deposit",
    payerName: "Priya Kalyan",
  },
];

const reasonOptions = [
  "Admission Deposit",
  "Surgery Advance",
  "Procedure Deposit",
  "Treatment Advance",
  "Emergency Deposit",
  "Additional Deposit",
  "Other",
];

const PatientAdvanceCollection = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromPage = searchParams.get("from");

  // Amount to collect (editable input)
  const [amountToCollect, setAmountToCollect] = useState(5000); // Default ₹5,000

  // Use the auto-calc split payment hook
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
    getAllSteps,
    hasMixedPayment,
  } = useSplitPaymentAutoCalc({ totalDue: amountToCollect });

  const [reason, setReason] = useState("Additional Deposit");
  const [payerName, setPayerName] = useState(mockPatient.name);
  const [payerRelation, setPayerRelation] = useState("self");
  const [payerMobile, setPayerMobile] = useState(mockPatient.phone);
  const [printReceipt, setPrintReceipt] = useState(true);
  const [sendSms, setSendSms] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Payment modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>("card");
  const [showSplitWizard, setShowSplitWizard] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);

  const handlePaymentSuccess = (attempt: PaymentAttempt) => {
    setShowPaymentModal(false);
    const receiptNo = `RCP${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;
    toast.success("Advance collected successfully!", {
      description: `Receipt No: ${receiptNo}`,
    });
    // Reset amount
    setAmountToCollect(0);
  };

  const handleSplitWizardComplete = (steps: SplitPaymentStep[]) => {
    const cardAmount = steps.filter(s => s.method === 'card' && s.status === 'succeeded')
      .reduce((sum, s) => sum + s.amount, 0);
    const upiAmount = steps.filter(s => s.method === 'upi' && s.status === 'succeeded')
      .reduce((sum, s) => sum + s.amount, 0);
    
    const receiptNo = `RCP${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;
    toast.success("Split payment collected successfully!", {
      description: `Card: ${formatINR(cardAmount)} + UPI: ${formatINR(upiAmount)} • Receipt: ${receiptNo}`,
    });
    // Reset
    setAmountToCollect(0);
  };

  const handleSplitWizardPartial = (steps: SplitPaymentStep[]) => {
    const completedAmount = steps.filter(s => s.status === 'succeeded')
      .reduce((sum, s) => sum + s.amount, 0);
    const pendingAmount = steps.filter(s => s.status !== 'succeeded')
      .reduce((sum, s) => sum + s.amount, 0);
    
    toast.warning("Partial payment collected", {
      description: `Collected: ${formatINR(completedAmount)} • Pending: ${formatINR(pendingAmount)}`,
    });
  };

  const availableBalance = mockPatient.currentAdvance - mockPatient.usedAdvance;
  const newBalance = availableBalance + amountToCollect * 100; // Convert to paise

  const handleCollectAdvance = () => {
    if (amountToCollect <= 0 || !isValid) {
      toast.error("Please enter a valid amount and ensure split is correct");
      return;
    }

    // If single cash payment, show cash modal
    if (splitRows.length === 1 && splitRows[0].method === "cash") {
      setShowCashModal(true);
      return;
    }

    // If single Card/UPI payment, show payment modal
    if (splitRows.length === 1 && (splitRows[0].method === "card" || splitRows[0].method === "upi")) {
      setSelectedPaymentMethod(splitRows[0].method);
      setShowPaymentModal(true);
      return;
    }

    // For mixed payments (Cash + Card/UPI), show the wizard
    if (hasMixedPayment() || getCardUpiSteps().length > 0) {
      setShowSplitWizard(true);
    } else {
      // Only cash - open cash modal
      setShowCashModal(true);
    }
  };

  const handleCashPaymentSuccess = () => {
    const receiptNo = `RCP${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;
    toast.success("Advance collected successfully!", {
      description: `Receipt No: ${receiptNo}`,
    });
    setAmountToCollect(0);
  };

  const handleBack = () => {
    navigate(`/patient-insights/${patientId}${fromPage ? `?from=${fromPage}` : ''}`);
  };

  const canConfirm = payerName.trim() !== "" && amountToCollect > 0 && isValid;

  // Get wizard steps for split payment - include all methods when mixed
  const wizardSteps: SplitPaymentStep[] = hasMixedPayment() 
    ? getAllSteps().map(step => ({
        ...step,
        status: 'pending' as const,
      }))
    : getCardUpiSteps().map(step => ({
        ...step,
        status: 'pending' as const,
      }));

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar />
      
      <PageContent className="flex flex-col overflow-hidden">
        <AppHeader 
          breadcrumbs={[
            { label: "Patient Insight", onClick: handleBack },
            "Collect Advance"
          ]} 
        />
        
        {/* Compact Header */}
        <div className="h-[72px] bg-background border-b border-border flex-shrink-0 flex items-center px-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="font-semibold">Back to Patient</span>
          </button>
        </div>
        
        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-[1fr_420px] gap-6">
            {/* Left Panel - Advance History Table */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="billing-section-title">Advance Deposits</h2>
                <div className="flex items-center gap-2">
                  <span className="billing-label">Balance:</span>
                  <span className="billing-amount-success">{formatINR(availableBalance)}</span>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left billing-label p-4">Receipt No.</th>
                      <th className="text-left billing-label p-4">Date & Time</th>
                      <th className="text-left billing-label p-4">Reason</th>
                      <th className="text-left billing-label p-4">Name</th>
                      <th className="text-left billing-label p-4">Method</th>
                      <th className="text-right billing-label p-4">Amount</th>
                      <th className="text-left billing-label p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-background">
                    {advanceHistory.map((adv) => (
                      <tr key={adv.id} className="border-t hover:bg-muted/20 transition-colors">
                        <td className="p-4">
                          <p className="billing-value">{adv.receiptNo}</p>
                        </td>
                        <td className="p-4">
                          <p className="billing-body">{adv.date}</p>
                          <p className="billing-helper">{adv.time}</p>
                        </td>
                        <td className="p-4 billing-body">{adv.reason}</td>
                        <td className="p-4 billing-body">{adv.payerName}</td>
                        <td className="p-4 billing-body">{adv.method}</td>
                        <td className="p-4 text-right billing-amount-success">{formatINR(adv.amount)}</td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Footer */}
              <div className="mt-4 pt-4 border-t flex items-center justify-end">
                <div className="flex items-center gap-2">
                  <span className="billing-label">Total Collected:</span>
                  <span className="billing-value">{formatINR(mockPatient.currentAdvance)}</span>
                </div>
              </div>
            </Card>

            {/* Right Panel - Collection Form */}
            <Card className="overflow-hidden sticky top-6 h-fit">
              {/* Header */}
              <div className="bg-primary px-5 py-4">
                <h3 className="billing-section-title !text-white">Collect Advance</h3>
                <p className="billing-helper !text-white/70 mt-0.5">
                  Record deposit from patient or attendant
                </p>
              </div>
              
              <div className="p-5 space-y-5">
                {/* Reason Selection */}
                <div className="space-y-2">
                  <Label className="billing-label">Reason for Advance</Label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-lg z-50">
                      {reasonOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Current Balance Info */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="billing-label">Current Advance Balance</span>
                    </div>
                    <span className="billing-amount-success">{formatINR(availableBalance)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="billing-helper">Estimated Bill</span>
                    <span className="billing-value">{formatINR(mockPatient.estimatedBill)}</span>
                  </div>
                </div>

                {/* Amount to Collect */}
                <div className="space-y-2">
                  <Label className="billing-label">Amount to Collect</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 billing-label">₹</span>
                    <Input
                      type="number"
                      value={amountToCollect || ""}
                      onChange={(e) => setAmountToCollect(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="pl-7 h-11 billing-amount-primary"
                      min={0}
                    />
                  </div>
                </div>

                {/* Split Payment */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="billing-section-title">Split Payment</span>
                    <button
                      onClick={resetDistribution}
                      className="billing-link flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </button>
                  </div>
                  
                  {splitRows.map((row) => (
                    <div key={row.id} className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 billing-label">₹</span>
                        <Input
                          type="number"
                          value={row.amount || ""}
                          onChange={(e) => updateRowAmount(row.id, parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="pl-7 h-10 billing-nums"
                          min={0}
                        />
                      </div>
                      <Select
                        value={row.method}
                        onValueChange={(value) => updateRowMethod(row.id, value as SplitRow['method'])}
                      >
                        <SelectTrigger className={`w-[140px] h-10 ${row.method === "card" || row.method === "upi" ? "border-primary bg-primary/5" : ""}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border border-border shadow-lg z-50">
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                        </SelectContent>
                      </Select>
                      {splitRows.length > 1 && (
                        <button
                          onClick={() => removeRow(row.id)}
                          className="h-10 w-10 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Validation Error */}
                  {validationError && (
                    <div className="flex items-center gap-2 billing-helper text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      {validationError}
                    </div>
                  )}

                  <button 
                    className="billing-link flex items-center gap-1.5"
                    onClick={addRow}
                  >
                    <span className="text-lg leading-none">+</span> Add Split Payment
                  </button>
                </div>


                {/* Payer Details */}
                <div className="space-y-3 pt-2 border-t border-border">
                  <span className="billing-section-title">Payer Details</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="billing-label">Name</Label>
                      <Input
                        value={payerName}
                        onChange={(e) => setPayerName(e.target.value)}
                        className="h-9 billing-body"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="billing-label">Relation</Label>
                      <Select value={payerRelation} onValueChange={setPayerRelation}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border border-border shadow-lg z-50">
                          <SelectItem value="self">Self</SelectItem>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="billing-label">Mobile Number</Label>
                    <Input
                      type="tel"
                      value={payerMobile}
                      onChange={(e) => setPayerMobile(e.target.value)}
                      className="h-9 billing-body"
                    />
                  </div>
                </div>

                {/* After Payment */}
                <div className="space-y-3">
                  <span className="billing-label uppercase tracking-wide">After Payment</span>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="print-advance"
                        checked={printReceipt}
                        onCheckedChange={(checked) => setPrintReceipt(checked as boolean)}
                      />
                      <Label htmlFor="print-advance" className="billing-control-label cursor-pointer">Print Receipt</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="sms-advance"
                        checked={sendSms}
                        onCheckedChange={(checked) => setSendSms(checked as boolean)}
                      />
                      <Label htmlFor="sms-advance" className="billing-control-label cursor-pointer">SMS</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="email-advance"
                        checked={sendEmail}
                        onCheckedChange={(checked) => setSendEmail(checked as boolean)}
                      />
                      <Label htmlFor="email-advance" className="billing-control-label cursor-pointer">Email</Label>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  onClick={handleCollectAdvance}
                  disabled={!canConfirm || isProcessing}
                  className="w-full h-11"
                >
                  {isProcessing ? "Processing..." : "Collect Advance"}
                </Button>

                {/* Footer Note */}
                <p className="billing-caption text-center leading-relaxed">
                  By collecting this advance, you confirm that payment has been received. 
                  A receipt will be generated automatically.
                </p>
              </div>
            </Card>
          </div>
        </main>

        {/* Single Payment Modal */}
        <PaymentMethodModal
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          patientId={patientId || "P001"}
          patientName={mockPatient.name}
          mrn={mockPatient.gdid}
          orderId={`ADV-${Date.now()}`}
          amount={amountToCollect * 100} // Convert to paise
          purpose="advance"
          defaultMethod={selectedPaymentMethod}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setShowPaymentModal(false)}
        />

        {/* Split Payment Wizard Modal */}
        <SplitPaymentWizardModal
          open={showSplitWizard}
          onOpenChange={setShowSplitWizard}
          patientId={patientId || "P001"}
          patientName={mockPatient.name}
          mrn={mockPatient.gdid}
          orderId={`ADV-${Date.now()}`}
          totalAmount={amountToCollect * 100} // Convert to paise
          purpose="advance"
          steps={wizardSteps}
          onComplete={handleSplitWizardComplete}
          onPartialComplete={handleSplitWizardPartial}
          onCancel={() => setShowSplitWizard(false)}
        />

        {/* Cash Payment Modal */}
        <CashPaymentModal
          open={showCashModal}
          onOpenChange={setShowCashModal}
          patientName={mockPatient.name}
          mrn={mockPatient.gdid}
          amount={amountToCollect * 100} // Convert to paise
          purpose="advance"
          onSuccess={handleCashPaymentSuccess}
          onCancel={() => setShowCashModal(false)}
        />
      </PageContent>
    </div>
  );
};

export default PatientAdvanceCollection;
