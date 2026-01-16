import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { Invoice } from "@/types/billing";
import { formatINR } from "@/utils/currency";

interface InvoicesTableProps {
  invoices: Invoice[];
  selectedInvoices: string[];
  onToggleInvoice: (invoiceId: string) => void;
  onToggleAll: () => void;
}

export function InvoicesTable({
  invoices,
  selectedInvoices,
  onToggleInvoice,
  onToggleAll,
}: InvoicesTableProps) {
  const allSelected = invoices.length > 0 && selectedInvoices.length === invoices.length;

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left text-xs font-medium text-muted-foreground p-4 w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onToggleAll}
                aria-label="Select all invoices"
              />
            </th>
            <th className="text-left text-xs font-medium text-muted-foreground p-4">Invoice No</th>
            <th className="text-left text-xs font-medium text-muted-foreground p-4">Date</th>
            <th className="text-left text-xs font-medium text-muted-foreground p-4">Service</th>
            <th className="text-left text-xs font-medium text-muted-foreground p-4">Total Amount</th>
            <th className="text-left text-xs font-medium text-muted-foreground p-4">Partially Paid</th>
            <th className="text-left text-xs font-medium text-muted-foreground p-4">Balance</th>
            <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
            <th className="text-left text-xs font-medium text-muted-foreground p-4">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-background">
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="border-t hover:bg-muted/20 transition-colors">
              <td className="p-4">
                <Checkbox
                  checked={selectedInvoices.includes(invoice.id)}
                  onCheckedChange={() => onToggleInvoice(invoice.id)}
                  aria-label={`Select invoice ${invoice.id}`}
                />
              </td>
              <td className="p-4 text-sm">{invoice.id}</td>
              <td className="p-4 text-sm">{invoice.date}</td>
              <td className="p-4 text-sm">{invoice.service}</td>
              <td className="p-4 text-sm">
                {formatINR(invoice.totalAmount)}
              </td>
              <td className="p-4 text-sm text-muted-foreground">
                {formatINR(invoice.partiallyPaid)}
              </td>
              <td className="p-4 text-sm text-foreground">
                {formatINR(invoice.balance)}
              </td>
              <td className="p-4 text-sm">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                    invoice.status === "Paid"
                      ? "bg-green-100 text-green-800"
                      : invoice.status === "Partially Paid"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {invoice.status}
                </span>
              </td>
              <td className="p-4">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Download invoice"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Print invoice"
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
