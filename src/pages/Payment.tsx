import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Download, Printer, Trash2, RotateCcw, AlertCircle } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { PageContent } from "@/components/PageContent";
import { BookingSteps } from "@/components/BookingSteps";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaymentMethodModal, CashPaymentModal } from "@/components/payment";
import { SplitPaymentWizardModal, type SplitPaymentStep } from "@/components/payment/SplitPaymentWizardModal";
import { useSplitPaymentAutoCalc, type SplitRow } from "@/hooks/useSplitPaymentAutoCalc";
import type { PaymentMethod as PaymentMethodType, PaymentAttempt } from "@/types/payment-intent";
import { formatINR } from "@/utils/currency";
import { toast } from "sonner";

interface InvoiceItem {
  name: string;
  price: number;
}

interface PaymentData {
  appointmentType: string;
  items: InvoiceItem[];
  subtotal: number;
  total: number;
  date: string;
}

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const paymentData = location.state as PaymentData & { fromPatientInsights?: boolean; patientId?: string };
  const fromPatientInsights = paymentData?.fromPatientInsights;
  const patientId = paymentData?.patientId;
  
  const [useAdvance, setUseAdvance] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>("card");
  const [showSplitWizard, setShowSplitWizard] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);

  const advanceAmount = 1000;
  const billAmount = 6000;
  const usedAdvance = useAdvance ? Math.min(advanceAmount, billAmount) : 0;
  const remainingBalance = useAdvance ? Math.max(0, advanceAmount - billAmount) : advanceAmount;
  const payableAmount = Math.max(0, billAmount - usedAdvance);

  // Use auto-calc split payment hook
  const {
    rows: splitRows,
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
  } = useSplitPaymentAutoCalc({ totalDue: payableAmount });

  // Wizard steps - include all payment methods when mixed
  const wizardSteps: SplitPaymentStep[] = hasMixedPayment() 
    ? getAllSteps().map(step => ({
        ...step,
        status: 'pending' as const,
      }))
    : getCardUpiSteps().map(step => ({
        ...step,
        status: 'pending' as const,
      }));


  const handlePayNow = () => {
    if (!isValid) {
      toast.error(validationError || "Please check split amounts");
      return;
    }

    // If user chose a single cash method, open cash modal
    if (splitRows.length === 1 && splitRows[0].method === "cash") {
      setShowCashModal(true);
      return;
    }

    // If user chose a single method (Card/UPI) via dropdown, open the payment popup
    if (splitRows.length === 1 && (splitRows[0].method === "card" || splitRows[0].method === "upi")) {
      setSelectedPaymentMethod(splitRows[0].method);
      setShowPaymentModal(true);
      return;
    }

    // For mixed payments (Cash + Card/UPI), show the wizard
    if (hasMixedPayment() || getCardUpiSteps().length > 0) {
      setShowSplitWizard(true);
    } else {
      // All cash - show cash modal
      setShowCashModal(true);
    }
  };

  const handleCashPaymentSuccess = () => {
    toast.success("Payment collected successfully");
    navigate("/");
  };


  const handleSplitWizardComplete = (steps: SplitPaymentStep[]) => {
    const cardAmount = steps.filter(s => s.method === 'card' && s.status === 'succeeded')
      .reduce((sum, s) => sum + s.amount, 0);
    const upiAmount = steps.filter(s => s.method === 'upi' && s.status === 'succeeded')
      .reduce((sum, s) => sum + s.amount, 0);
    
    toast.success(`Split payment collected: Card ${formatINR(cardAmount)} + UPI ${formatINR(upiAmount)}`);
    navigate("/");
  };

  const handlePaymentSuccess = (attempt: PaymentAttempt) => {
    setShowPaymentModal(false);
    toast.success("Payment collected successfully");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      
      <PageContent>
        <AppHeader breadcrumbs={["Appointments", "Payment"]} />
        
        <main className="p-6">
          <div className="flex items-center justify-between h-10 mb-12">
            <div className="w-[130px]">
              <button
                onClick={() => navigate("/book-appointment", { 
                  state: { fromPatientInsights, patientId } 
                })}
                className="flex items-center gap-2 billing-body text-foreground hover:text-primary transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="font-semibold">Appointment</span>
              </button>
            </div>

            <BookingSteps currentStep="payment" hideSteps={fromPatientInsights ? ["search", "registration"] : []} />
            
            <div className="w-[130px]" />
          </div>

          <div className="max-w-[1600px] mx-auto">
            
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 space-y-4">
                {/* Bill Documents Table */}
                <Card className="p-0 overflow-hidden">
                  <div className="px-6 py-4 bg-muted/30 border-b border-border">
                    <h2 className="billing-section-title">Bill Documents</h2>
                    <p className="billing-helper mt-1">Documents related to this visit</p>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent bg-muted/20">
                          <TableHead className="billing-label">Document No.</TableHead>
                          <TableHead className="billing-label">Document Name</TableHead>
                          <TableHead className="billing-label">Date & Time</TableHead>
                          <TableHead className="billing-label">Service</TableHead>
                          <TableHead className="billing-label text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* OP Consultation */}
                        <TableRow className="hover:bg-muted/30">
                          <TableCell>
                            <p className="billing-value text-primary">INV001</p>
                          </TableCell>
                          <TableCell>
                            <p className="billing-value">OP Consultation Invoice</p>
                          </TableCell>
                          <TableCell>
                            <p className="billing-body">20 Dec 2025</p>
                            <p className="billing-helper">10:45 AM</p>
                          </TableCell>
                          <TableCell>
                            <p className="billing-body">Cardiology OPD</p>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Printer className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        
                        {/* Laboratory */}
                        <TableRow className="hover:bg-muted/30">
                          <TableCell>
                            <p className="billing-value text-primary">INV002</p>
                          </TableCell>
                          <TableCell>
                            <p className="billing-value">Laboratory Invoice</p>
                          </TableCell>
                          <TableCell>
                            <p className="billing-body">20 Dec 2025</p>
                            <p className="billing-helper">11:30 AM</p>
                          </TableCell>
                          <TableCell>
                            <p className="billing-body">Clinical Biochemistry</p>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Printer className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        
                        {/* Radiology */}
                        <TableRow className="hover:bg-muted/30">
                          <TableCell>
                            <p className="billing-value text-primary">INV003</p>
                          </TableCell>
                          <TableCell>
                            <p className="billing-value">Radiology Invoice</p>
                          </TableCell>
                          <TableCell>
                            <p className="billing-body">20 Dec 2025</p>
                            <p className="billing-helper">12:15 PM</p>
                          </TableCell>
                          <TableCell>
                            <p className="billing-body">Radiology</p>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Printer className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        
                        {/* Services */}
                        <TableRow className="hover:bg-muted/30">
                          <TableCell>
                            <p className="billing-value text-primary">INV004</p>
                          </TableCell>
                          <TableCell>
                            <p className="billing-value">Services Invoice</p>
                          </TableCell>
                          <TableCell>
                            <p className="billing-body">20 Dec 2025</p>
                            <p className="billing-helper">01:00 PM</p>
                          </TableCell>
                          <TableCell>
                            <p className="billing-body">Nursing Services</p>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Printer className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </Card>
                
                {/* Actions below the card */}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>

              {/* Collect Payment */}
              <Card className="w-full lg:w-[420px] h-fit self-start overflow-hidden">
                {/* Header */}
                <div className="bg-primary px-5 py-4">
                  <h3 className="billing-section-title !text-white">Payment Settlement</h3>
                  <p className="billing-helper !text-white/70 mt-0.5">Invoice: INV009</p>
                </div>
                
                <div className="p-5 space-y-5">
                  {/* Bill Summary */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="billing-label">Gross Bill Amount</span>
                      <span className="billing-value">₹44,000.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="billing-label">Discount Applied</span>
                      <span className="billing-amount-muted">- ₹0.00</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-dashed border-border pt-3">
                      <span className="billing-section-title">Net Bill Amount</span>
                      <span className="billing-amount-primary">₹{billAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Advance/Deposit Section */}
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="billing-label">Patient Deposit</span>
                      </div>
                      <span className="billing-value text-blue-600">₹{advanceAmount.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 pt-1">
                      <Switch
                        id="use-advance"
                        checked={useAdvance}
                        onCheckedChange={setUseAdvance}
                      />
                      <label htmlFor="use-advance" className="billing-control-label text-muted-foreground cursor-pointer">
                        Adjust deposit against this bill
                      </label>
                    </div>
                    
                    {useAdvance && (
                      <div className="space-y-2 pt-2 border-t border-border">
                        <div className="flex justify-between">
                          <span className="billing-label">Deposit Used</span>
                          <span className="billing-amount-success">- ₹{usedAdvance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="billing-label">Remaining Deposit</span>
                          <span className="billing-value">₹{remainingBalance.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Amount Payable */}
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="billing-section-title">Amount to Collect</span>
                      <span className="billing-amount-primary text-primary">₹{payableAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Split Payment */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="billing-section-title">Split Payment</p>
                      <button
                        onClick={resetDistribution}
                        className="billing-link flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset
                      </button>
                    </div>
                    
                    {splitRows.map((row) => (
                      <div key={row.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 billing-label">₹</span>
                            <Input
                              type="number"
                              value={row.amount || ""}
                              onChange={(e) => updateRowAmount(row.id, parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="pl-7 h-11 billing-nums"
                              min={0}
                            />
                          </div>
                          <Select 
                            value={row.method} 
                            onValueChange={(value) => updateRowMethod(row.id, value as SplitRow['method'])}
                          >
                            <SelectTrigger className={`w-[130px] h-11 ${row.method === "card" || row.method === "upi" ? "border-primary bg-primary/5" : ""}`}>
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
                              className="h-11 w-11 flex items-center justify-center text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
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
                      className="billing-link flex items-center gap-1"
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
                          type="text"
                          defaultValue="Siva Karthikeyan"
                          className="h-9 billing-body"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="billing-label">Relation</Label>
                        <Select defaultValue="self">
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
                        defaultValue="+91 98765 43210"
                        className="h-9 billing-body"
                      />
                    </div>
                  </div>

                  {/* After Payment */}
                  <div className="space-y-3">
                    <span className="billing-label uppercase tracking-wide">After Payment</span>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Checkbox id="print" defaultChecked />
                        <Label htmlFor="print" className="billing-control-label cursor-pointer">Print Receipt</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="sms" defaultChecked />
                        <Label htmlFor="sms" className="billing-control-label cursor-pointer">SMS</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="email" />
                        <Label htmlFor="email" className="billing-control-label cursor-pointer">Email</Label>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="w-full h-11" 
                    onClick={handlePayNow}
                  >
                    Collect Payment
                  </Button>

                  {/* Footer Note */}
                  <p className="billing-caption text-center leading-relaxed">
                    By settling this bill, you confirm that payment has been received. 
                    A receipt will be generated automatically.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </main>


      {/* Payment Method Modal */}
      <PaymentMethodModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        patientId={patientId || "P001"}
        patientName="Siva Karthikeyan"
        mrn="GDID-009"
        orderId="INV009"
        amount={payableAmount * 100}
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
        patientName="Siva Karthikeyan"
        mrn="GDID-009"
        orderId="INV009"
        totalAmount={payableAmount * 100}
        purpose="settlement"
        steps={wizardSteps}
        onComplete={handleSplitWizardComplete}
        onCancel={() => setShowSplitWizard(false)}
      />

      {/* Cash Payment Modal */}
      <CashPaymentModal
        open={showCashModal}
        onOpenChange={setShowCashModal}
        patientName="Siva Karthikeyan"
        mrn="GDID-009"
        amount={payableAmount * 100}
        purpose="settlement"
        onSuccess={handleCashPaymentSuccess}
        onCancel={() => setShowCashModal(false)}
      />
    </PageContent>
    </div>
  );
};

export default Payment;
