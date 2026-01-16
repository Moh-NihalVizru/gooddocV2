import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Printer } from "lucide-react";
import { Visit } from "../VisitListItem";
import { formatINR } from "@/utils/currency";
import { getPendingInvoicesForVisit, type Invoice } from "@/data/billing.mock";
import { PaymentSettlementModal } from "@/components/payment/PaymentSettlementModal";

interface CollectPaymentTabProps {
  selectedVisit: Visit | null;
}

const getStatusBadge = (status: Invoice["status"]) => {
  switch (status) {
    case "Paid":
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Paid</Badge>;
    case "Partial":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">Partial</Badge>;
    case "Unpaid":
      return <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 text-xs">Unpaid</Badge>;
  }
};

export function CollectPaymentTab({ selectedVisit }: CollectPaymentTabProps) {
  const [selectedBillIds, setSelectedBillIds] = useState<string[]>([]);
  const [showSettlementModal, setShowSettlementModal] = useState(false);

  const visitBills = selectedVisit ? getPendingInvoicesForVisit(selectedVisit.visitId) : [];
  const selectedBills = visitBills.filter((bill) => selectedBillIds.includes(bill.id));

  if (!selectedVisit) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Select a visit to collect payment.
        </p>
      </div>
    );
  }

  const toggleBillSelection = (billId: string) => {
    setSelectedBillIds((prev) =>
      prev.includes(billId) ? prev.filter((id) => id !== billId) : [...prev, billId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedBillIds.length === visitBills.length) {
      setSelectedBillIds([]);
    } else {
      setSelectedBillIds(visitBills.map((bill) => bill.id));
    }
  };

  const handleProceed = () => {
    if (selectedBills.length > 0) {
      setShowSettlementModal(true);
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header with Proceed Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Payable Bills</h3>
        <Button 
          onClick={handleProceed}
          disabled={selectedBills.length === 0}
          size="sm"
        >
          Proceed Payment
        </Button>
      </div>

      {visitBills.length === 0 ? (
        <div className="p-8 text-center border rounded-lg bg-muted/20">
          <p className="text-sm text-muted-foreground">No pending bills for this visit.</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-white dark:bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-center text-xs font-medium text-muted-foreground p-3 w-10 uppercase">
                    <Checkbox
                      checked={selectedBillIds.length === visitBills.length && visitBills.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3 whitespace-nowrap uppercase">INVOICE NO.</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3 whitespace-nowrap uppercase">DATE & TIME</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3 whitespace-nowrap uppercase">SERVICE / DOCTOR</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-3 whitespace-nowrap uppercase">AMOUNT</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-3 whitespace-nowrap uppercase">PAID</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-3 whitespace-nowrap uppercase">BALANCE</th>
                  <th className="text-center text-xs font-medium text-muted-foreground p-3 whitespace-nowrap uppercase">STATUS</th>
                  <th className="text-center text-xs font-medium text-muted-foreground p-3 whitespace-nowrap uppercase">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {visitBills.map((bill) => (
                  <tr
                    key={bill.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="p-3 text-center">
                      <Checkbox
                        checked={selectedBillIds.includes(bill.id)}
                        onCheckedChange={() => toggleBillSelection(bill.id)}
                      />
                    </td>
                    <td className="p-3">
                      <p className="text-sm text-foreground">{bill.invoiceNo}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-sm">{bill.date}</p>
                      <p className="text-xs text-muted-foreground">{bill.time}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-sm">{bill.service}</p>
                      <p className="text-xs text-muted-foreground">{bill.doctor} • {bill.department}</p>
                    </td>
                    <td className="p-3 text-right">
                      <p className="text-sm">{formatINR(bill.totalAmount)}</p>
                      {bill.originalAmount !== bill.totalAmount && (
                        <p className="text-xs text-muted-foreground line-through">{formatINR(bill.originalAmount)}</p>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <p className={`text-sm ${bill.paidAmount > 0 ? "text-emerald-600" : "text-muted-foreground"}`}>
                        {bill.paidAmount > 0 ? formatINR(bill.paidAmount) : "—"}
                      </p>
                    </td>
                    <td className="p-3 text-right">
                      <p className="text-sm">{formatINR(bill.balance)}</p>
                    </td>
                    <td className="p-3 text-center">
                      {getStatusBadge(bill.status)}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                          <Printer className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/50 border-t border-border">
                <tr>
                  <td colSpan={4} className="p-3 text-right">
                    <span className="text-xs text-muted-foreground">Total ({visitBills.length} {visitBills.length === 1 ? 'Invoice' : 'Invoices'})</span>
                  </td>
                  <td className="p-3 text-right">
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <span className="text-sm text-foreground">{formatINR(visitBills.reduce((sum, b) => sum + b.totalAmount, 0))}</span>
                  </td>
                  <td className="p-3 text-right">
                    <p className="text-xs text-muted-foreground">Paid</p>
                    <span className="text-sm font-medium text-emerald-600">{formatINR(visitBills.reduce((sum, b) => sum + b.paidAmount, 0))}</span>
                  </td>
                  <td className="p-3 text-right">
                    <p className="text-xs text-muted-foreground">Balance</p>
                    <span className="text-sm font-medium text-red-600">{formatINR(visitBills.reduce((sum, b) => sum + b.balance, 0))}</span>
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Payment Settlement Modal */}
      <PaymentSettlementModal
        open={showSettlementModal}
        onOpenChange={setShowSettlementModal}
        selectedBills={selectedBills}
        visitId={selectedVisit.visitId}
        patientName={selectedVisit.doctor || "Patient"}
        patientId={selectedVisit.id || "P001"}
        onPaymentComplete={() => setSelectedBillIds([])}
      />
    </div>
  );
}
