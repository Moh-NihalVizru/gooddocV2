import { Visit } from "../VisitListItem";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Printer } from "lucide-react";
import { formatINR } from "@/utils/currency";
import { getInvoicesForVisit, type Invoice } from "@/data/billing.mock";

interface InvoicesTabProps {
  selectedVisit: Visit | null;
}

// Format invoice number to shorter format (INV - XXXX)
const formatInvoiceNo = (invoiceNo: string): string => {
  const match = invoiceNo.match(/(\d{4})$/);
  return match ? `INV - ${match[1]}` : invoiceNo;
};

const getStatusBadge = (status: Invoice["status"]) => {
  switch (status) {
    case "Paid":
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Paid</Badge>;
    case "Partial":
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">Partial</Badge>;
    case "Unpaid":
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">Unpaid</Badge>;
  }
};

export function InvoicesTab({ selectedVisit }: InvoicesTabProps) {
  if (!selectedVisit) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Select a visit to view bills.
        </p>
      </div>
    );
  }

  const visitInvoices = getInvoicesForVisit(selectedVisit.visitId);

  if (visitInvoices.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No bills found for this visit.
        </p>
      </div>
    );
  }

  // Calculate totals
  const totals = visitInvoices.reduce(
    (acc, inv) => ({
      total: acc.total + inv.totalAmount,
      paid: acc.paid + inv.paidAmount,
      balance: acc.balance + inv.balance,
    }),
    { total: 0, paid: 0, balance: 0 }
  );

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-[14px] font-semibold text-foreground">Visit Bills</h3>
      
      <div className="border rounded-lg overflow-hidden bg-white dark:bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
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
              {visitInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3">
                    <p className="text-sm text-foreground">{formatInvoiceNo(invoice.invoiceNo)}</p>
                    <p className="text-xs text-muted-foreground">{invoice.serviceCode}</p>
                  </td>
                  <td className="p-3">
                    <p className="text-sm text-foreground">{invoice.date}</p>
                    <p className="text-xs text-muted-foreground">{invoice.time}</p>
                  </td>
                  <td className="p-3">
                    <p className="text-sm text-foreground">{invoice.service}</p>
                    <p className="text-xs text-muted-foreground">{invoice.doctor} • {invoice.department}</p>
                  </td>
                  <td className="p-3 text-right">
                    <p className="text-sm text-foreground">{formatINR(invoice.totalAmount)}</p>
                    {invoice.originalAmount !== invoice.totalAmount && (
                      <p className="text-xs text-muted-foreground line-through">{formatINR(invoice.originalAmount)}</p>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <p className={`text-sm font-medium ${invoice.paidAmount > 0 ? "text-emerald-600" : "text-muted-foreground"}`}>
                      {invoice.paidAmount > 0 ? formatINR(invoice.paidAmount) : "—"}
                    </p>
                  </td>
                  <td className="p-3 text-right">
                    <p className={`text-sm font-medium ${invoice.balance > 0 ? "text-red-600" : "text-muted-foreground"}`}>
                      {invoice.balance > 0 ? formatINR(invoice.balance) : "—"}
                    </p>
                  </td>
                  <td className="p-3 text-center">
                    {getStatusBadge(invoice.status)}
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
            <tfoot className="bg-muted/40 border-t-2">
              <tr>
                <td colSpan={3} className="p-3 text-right">
                  <span className="text-sm font-semibold text-foreground">Total:</span>
                </td>
                <td className="p-3 text-right">
                  <span className="text-sm font-semibold text-foreground">{formatINR(totals.total)}</span>
                </td>
                <td className="p-3 text-right">
                  <span className="text-sm font-semibold text-emerald-600">{formatINR(totals.paid)}</span>
                </td>
                <td className="p-3 text-right">
                  <span className="text-sm font-semibold text-red-600">{formatINR(totals.balance)}</span>
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
