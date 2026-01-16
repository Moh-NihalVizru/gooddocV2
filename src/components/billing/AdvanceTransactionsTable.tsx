import { Download, Printer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TransactionRow } from "@/types/billing";
import { formatINR } from "@/utils/currency";

interface AdvanceTransactionsTableProps {
  transactions: TransactionRow[];
}

export function AdvanceTransactionsTable({
  transactions,
}: AdvanceTransactionsTableProps) {
  if (transactions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">No advance transactions found</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Advance Transactions</h2>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left text-xs font-medium text-muted-foreground p-4 uppercase">RECEIPT NO.</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4 uppercase">DATE & TIME</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4 uppercase">REASON</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4 uppercase">NAME</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4 uppercase">METHOD</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4 uppercase">AMOUNT</th>
              <th className="text-center text-xs font-medium text-muted-foreground p-4 uppercase">STATUS</th>
              <th className="text-center text-xs font-medium text-muted-foreground p-4 uppercase">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="bg-background">
            {transactions.map((txn) => (
              <tr key={txn.id} className="border-t hover:bg-muted/20 transition-colors">
                <td className="p-4 text-sm">{txn.id}</td>
                <td className="p-4 text-sm">{txn.date}</td>
                <td className="p-4 text-sm">{txn.serviceOrReason}</td>
                <td className="p-4 text-sm">{txn.party}</td>
                <td className="p-4 text-sm text-emerald-600">
                  {txn.amount >= 0 ? "+" : ""}
                  {formatINR(Math.abs(txn.amount))}
                </td>
                <td className="p-4 text-sm text-center">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                      txn.status === "Success"
                        ? "bg-green-100 text-green-800"
                        : txn.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {txn.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="text-muted-foreground hover:text-foreground">
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="text-muted-foreground hover:text-foreground">
                      <Printer className="h-4 w-4" />
                    </button>
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
