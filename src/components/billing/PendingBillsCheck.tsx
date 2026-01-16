import { useState } from "react";
import { AlertTriangle, CheckCircle2, Receipt, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// Format currency for display
const formatCurrency = (amount: number) => {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

interface PendingInvoice {
  invoiceNo: string;
  serviceCode: string;
  date: string;
  time: string;
  service: string;
  doctor: string;
  department: string;
  amount: number;
  paid: number;
  balance: number;
  status: "Unpaid" | "Partial" | "Paid";
}

interface PendingBillsCheckProps {
  patientName: string;
  mrn: string;
  admissionId: string;
  onProceedToDischarge: () => void;
  onCollectPayment?: () => void;
  allBillsPaid?: boolean;
}

const PendingBillsCheck = ({
  patientName,
  mrn,
  admissionId,
  onProceedToDischarge,
  onCollectPayment,
  allBillsPaid = false,
}: PendingBillsCheckProps) => {
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - In real app, this would come from an API
  const pendingInvoices: PendingInvoice[] = [
    {
      invoiceNo: "INV236",
      serviceCode: "CONS-CARD-001",
      date: "20-Dec-2025",
      time: "09:00",
      service: "Cardiology Consultation",
      doctor: "Dr. Meera Nair",
      department: "Cardiology",
      amount: 2500,
      paid: 0,
      balance: 2500,
      status: "Unpaid",
    },
    {
      invoiceNo: "INV237",
      serviceCode: "DIAG-ECG-001",
      date: "20-Dec-2025",
      time: "10:30",
      service: "ECG Test",
      doctor: "Dr. Meera Nair",
      department: "Diagnostics",
      amount: 800,
      paid: 400,
      balance: 400,
      status: "Partial",
    },
    {
      invoiceNo: "INV238",
      serviceCode: "LAB-BIO-003",
      date: "20-Dec-2025",
      time: "11:00",
      service: "Laboratory - Lipid Profile",
      doctor: "Dr. Meera Nair",
      department: "Laboratory",
      amount: 650,
      paid: 0,
      balance: 650,
      status: "Unpaid",
    },
  ];

  const totalAmount = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = pendingInvoices.reduce((sum, inv) => sum + inv.paid, 0);
  const totalBalance = pendingInvoices.reduce((sum, inv) => sum + inv.balance, 0);

  const handleProceed = () => {
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
      onProceedToDischarge();
    }, 1500);
  };

  if (allBillsPaid) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">All Bills Cleared</h2>
            <p className="text-muted-foreground">
              All outstanding bills for this admission have been settled. You can proceed to discharge.
            </p>
          </div>
          <div className="bg-muted/30 rounded-lg p-4 text-sm">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Patient</span>
              <span className="font-medium">{patientName}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">MRN</span>
              <span className="font-medium">{mrn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Admission ID</span>
              <span className="font-medium">{admissionId}</span>
            </div>
          </div>
          <Button 
            onClick={handleProceed} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading Discharge Summary...
              </>
            ) : (
              "Proceed to Discharge"
            )}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Pending Bills</h2>
          <p className="text-muted-foreground">
            There are outstanding bills that need to be cleared before proceeding with discharge.
          </p>
        </div>

        {/* Patient Info */}
        <div className="bg-muted/30 rounded-lg p-4 text-sm text-left">
          <div className="flex justify-between mb-2">
            <span className="text-muted-foreground">Patient</span>
            <span className="font-medium">{patientName}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-muted-foreground">MRN</span>
            <span className="font-medium">{mrn}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Admission ID</span>
            <span className="font-medium">{admissionId}</span>
          </div>
        </div>

        {/* Pending Invoices Table */}
        <div className="border border-border rounded-lg overflow-hidden text-left">
          <div className="bg-muted/50 px-4 py-3 flex items-center gap-2 border-b border-border">
            <Receipt className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">Outstanding Invoices</span>
          </div>
          
          {/* Table Header */}
          <div className="grid grid-cols-[180px_1fr_100px_100px_100px_80px] gap-6 px-4 py-2 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <div>Invoice No.</div>
            <div>Service / Doctor</div>
            <div className="text-right">Amount</div>
            <div className="text-right">Paid</div>
            <div className="text-right">Balance</div>
            <div className="text-center">Status</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-border">
            {pendingInvoices.map((invoice, index) => (
              <div key={index} className="grid grid-cols-[180px_1fr_100px_100px_100px_80px] gap-6 px-4 py-3 items-center">
                <div>
                  <p className="text-sm font-medium text-foreground">{invoice.invoiceNo}</p>
                  <p className="text-xs text-muted-foreground">{invoice.serviceCode}</p>
                  <p className="text-xs text-muted-foreground mt-1">{invoice.date} • {invoice.time}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{invoice.service}</p>
                  <p className="text-xs text-muted-foreground">{invoice.doctor} • {invoice.department}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-foreground">{formatCurrency(invoice.amount)}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-muted-foreground">
                    {invoice.paid > 0 ? formatCurrency(invoice.paid) : "—"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-foreground">{formatCurrency(invoice.balance)}</span>
                </div>
                <div className="text-center">
                  <Badge 
                    variant="secondary" 
                    className={
                      invoice.status === "Unpaid" 
                        ? "bg-red-500/10 text-red-600 border-red-500/30" 
                        : invoice.status === "Partial"
                        ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                        : "bg-green-500/10 text-green-600 border-green-500/30"
                    }
                  >
                    {invoice.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Total Row */}
          <div className="grid grid-cols-[180px_1fr_100px_100px_100px_80px] gap-6 px-4 py-3 bg-primary/5 border-t border-border items-center">
            <div className="col-span-2 text-right">
              <span className="font-semibold text-foreground">Total:</span>
            </div>
            <div className="text-right">
              <span className="font-semibold text-foreground">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="text-right">
              <span className="font-semibold text-muted-foreground">{formatCurrency(totalPaid)}</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-primary">{formatCurrency(totalBalance)}</span>
            </div>
            <div></div>
          </div>
        </div>

        {/* Warning Message */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-left">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <strong>Note:</strong> Please clear all pending bills before proceeding with the discharge process. 
            You can collect payments from the patient or process insurance claims.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCollectPayment}>
            Collect Payment
          </Button>
          <Button 
            className="flex-1" 
            onClick={handleProceed}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading Discharge Summary...
              </>
            ) : (
              "Proceed to Discharge"
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PendingBillsCheck;
