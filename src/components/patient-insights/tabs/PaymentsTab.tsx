import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Printer, CreditCard, Banknote, Building2, Smartphone, FileText } from "lucide-react";
import { Visit } from "../VisitListItem";
import { formatINR } from "@/utils/currency";
import { getTransactionsForVisit, getInvoicesForVisit, type Transaction, type PaymentMethod, type Invoice } from "@/data/billing.mock";

interface PaymentsTabProps {
  selectedVisit: Visit | null;
}

const getStatusBadge = (status: Transaction["status"]) => {
  switch (status) {
    case "Success":
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Success</Badge>;
    case "Pending":
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">Pending</Badge>;
    case "Failed":
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">Failed</Badge>;
    case "Refunded":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">Refunded</Badge>;
    default:
      return <Badge variant="outline" className="text-xs">{status}</Badge>;
  }
};

const getMethodIcon = (method: PaymentMethod) => {
  switch (method) {
    case "Card":
      return <CreditCard className="h-3.5 w-3.5" />;
    case "Cash":
      return <Banknote className="h-3.5 w-3.5" />;
    case "UPI":
      return <Smartphone className="h-3.5 w-3.5" />;
    case "Insurance":
      return <Building2 className="h-3.5 w-3.5" />;
    case "NEFT":
      return <Building2 className="h-3.5 w-3.5" />;
    case "Cheque":
      return <FileText className="h-3.5 w-3.5" />;
    default:
      return null;
  }
};

const getTypeBadge = (type: Transaction["type"]) => {
  switch (type) {
    case "Bill":
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">Bill</Badge>;
    case "Advance":
      return <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 text-xs">Advance</Badge>;
    case "Refund":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">Refund</Badge>;
    default:
      return <Badge variant="outline" className="text-xs">{type}</Badge>;
  }
};

// Format receipt number to shorter format (RCP - XXXX)
const formatReceiptNo = (receiptNo: string): string => {
  const match = receiptNo.match(/(\d{4})$/);
  return match ? `RCP - ${match[1]}` : receiptNo;
};

// Get service details from invoice numbers
const getServiceDetails = (invoiceNos: string[], invoices: Invoice[]): { service: string; doctor: string; department: string }[] => {
  return invoiceNos.map(invNo => {
    const invoice = invoices.find(inv => inv.invoiceNo === invNo);
    if (invoice) {
      return { service: invoice.service, doctor: invoice.doctor, department: invoice.department };
    }
    return { service: "", doctor: "", department: "" };
  }).filter(detail => detail.service);
};

export function PaymentsTab({ selectedVisit }: PaymentsTabProps) {
  if (!selectedVisit) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Select a visit to view payment history.
        </p>
      </div>
    );
  }

  const visitTransactions = getTransactionsForVisit(selectedVisit.visitId);
  const visitInvoices = getInvoicesForVisit(selectedVisit.visitId);

  if (visitTransactions.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No payment transactions found for this visit.
        </p>
      </div>
    );
  }

  // Calculate total
  const totalPaid = visitTransactions
    .filter((txn) => txn.status === "Success")
    .reduce((sum, txn) => sum + txn.amount, 0);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-foreground">Visit Transactions</h3>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Download Statement
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white dark:bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left text-xs font-medium text-muted-foreground p-3 whitespace-nowrap uppercase">RECEIPT NO.</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3 whitespace-nowrap uppercase">DATE & TIME</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3 whitespace-nowrap uppercase">INVOICE</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3 whitespace-nowrap uppercase">SERVICE / DOCTOR</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3 whitespace-nowrap uppercase">TYPE</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3 whitespace-nowrap uppercase">PAYMENT MODE</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-3 whitespace-nowrap uppercase">AMOUNT</th>
                <th className="text-center text-xs font-medium text-muted-foreground p-3 whitespace-nowrap uppercase">STATUS</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3 whitespace-nowrap uppercase">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visitTransactions.map((txn) => {
                const serviceDetails = getServiceDetails(txn.invoiceNos, visitInvoices);
                return (
                  <tr key={txn.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 text-left">
                      <p className="text-sm text-foreground">{formatReceiptNo(txn.receiptNo)}</p>
                    </td>
                    <td className="p-3 text-left">
                      <p className="text-sm text-foreground">{txn.date}</p>
                      <p className="text-xs text-muted-foreground">{txn.time}</p>
                    </td>
                    <td className="p-3 text-left">
                      {txn.invoiceNos.length === 0 ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : txn.invoiceNos.length === 1 ? (
                        <p className="text-sm text-foreground">{txn.invoiceNos[0]}</p>
                      ) : (
                        <p className="text-sm text-foreground">
                          {txn.invoiceNos[0]} <span className="text-xs text-muted-foreground">+{txn.invoiceNos.length - 1}</span>
                        </p>
                      )}
                    </td>
                    <td className="p-3 text-left">
                      {txn.type === "Advance" ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : serviceDetails.length === 0 ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : serviceDetails.length === 1 ? (
                        <div>
                          <p className="text-sm text-foreground">{serviceDetails[0].service}</p>
                          <p className="text-xs text-muted-foreground">{serviceDetails[0].doctor} • {serviceDetails[0].department}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-foreground">{serviceDetails[0].service}</p>
                          <p className="text-xs text-muted-foreground">
                            {serviceDetails[0].doctor} • {serviceDetails[0].department}
                            <span className="text-primary ml-1.5">+{serviceDetails.length - 1} more</span>
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-left">
                      {getTypeBadge(txn.type)}
                    </td>
                    <td className="p-3 text-left">
                      {txn.methods && txn.methods.length > 0 ? (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/40 rounded-md w-fit">
                          {txn.methods.map((method, idx) => (
                            <span key={idx} className="flex items-center gap-1">
                              {getMethodIcon(method)}
                              <span className="text-xs text-foreground">{method}</span>
                              {idx < txn.methods.length - 1 && <span className="text-xs text-muted-foreground">,</span>}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <p className={`text-sm ${txn.type === "Refund" ? "text-blue-600" : "text-emerald-600"}`}>
                        {txn.type === "Refund" ? "-" : ""}{formatINR(txn.amount)}
                      </p>
                    </td>
                    <td className="p-3 text-center">
                      {getStatusBadge(txn.status)}
                    </td>
                    <td className="p-3 text-left">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                          <Printer className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-muted/50 border-t border-border">
              <tr>
                <td colSpan={6} className="p-3 text-right">
                  <span className="text-xs text-muted-foreground">Total ({visitTransactions.filter(t => t.status === "Success").length} {visitTransactions.filter(t => t.status === "Success").length === 1 ? 'Transaction' : 'Transactions'})</span>
                </td>
                <td className="p-3 text-right">
                  <p className="text-xs text-muted-foreground">Collected</p>
                  <span className="billing-amount-success">{formatINR(totalPaid)}</span>
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
