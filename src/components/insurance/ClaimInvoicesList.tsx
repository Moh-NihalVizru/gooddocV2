import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Printer } from "lucide-react";
import { formatINR } from "@/utils/currency";

// Mock invoices data
const MOCK_INVOICES = [
  {
    id: "INV-2025-001",
    date: "15 Jun 2025",
    service: "Consultation",
    totalAmount: 150000,
    partiallyPaid: 0,
    balance: 150000,
    status: "Pending",
  },
  {
    id: "INV-2025-002",
    date: "20 May 2025",
    service: "Laboratory",
    totalAmount: 65000,
    partiallyPaid: 0,
    balance: 65000,
    status: "Pending",
  },
  {
    id: "INV-2025-003",
    date: "10 Apr 2025",
    service: "Imaging",
    totalAmount: 120000,
    partiallyPaid: 0,
    balance: 120000,
    status: "Pending",
  },
];

export function ClaimInvoicesList() {
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);

  const toggleInvoice = (invoiceId: string) => {
    setSelectedInvoices((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const toggleAll = () => {
    if (selectedInvoices.length === MOCK_INVOICES.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(MOCK_INVOICES.map((inv) => inv.id));
    }
  };

  const allSelected = MOCK_INVOICES.length > 0 && selectedInvoices.length === MOCK_INVOICES.length;

  return (
    <Card className="overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold text-foreground">Payment Collection</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left text-sm font-medium text-muted-foreground p-4 w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all invoices"
                />
              </th>
              <th className="text-left text-sm font-medium text-muted-foreground p-4">Invoice No</th>
              <th className="text-left text-sm font-medium text-muted-foreground p-4">Date</th>
              <th className="text-left text-sm font-medium text-muted-foreground p-4">Service</th>
              <th className="text-left text-sm font-medium text-muted-foreground p-4">Total Amount</th>
              <th className="text-left text-sm font-medium text-muted-foreground p-4">Partially Paid</th>
              <th className="text-left text-sm font-medium text-muted-foreground p-4">Balance</th>
              <th className="text-left text-sm font-medium text-muted-foreground p-4">Status</th>
              <th className="text-left text-sm font-medium text-muted-foreground p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-background">
            {MOCK_INVOICES.map((invoice) => (
              <tr key={invoice.id} className="border-t hover:bg-muted/20 transition-colors">
                <td className="p-4">
                  <Checkbox
                    checked={selectedInvoices.includes(invoice.id)}
                    onCheckedChange={() => toggleInvoice(invoice.id)}
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
                <td className="p-4 text-sm">
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
    </Card>
  );
}
