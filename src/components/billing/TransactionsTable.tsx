import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionRow, TransactionType, PaymentMethod } from "@/types/billing";
import { formatINR } from "@/utils/currency";
import { Download, FileText, Search } from "lucide-react";

interface TransactionsTableProps {
  transactions: TransactionRow[];
  title?: string;
  showFilters?: boolean;
  onDownloadStatement?: () => void;
}

export function TransactionsTable({
  transactions,
  title = "Transaction History",
  showFilters = true,
  onDownloadStatement,
}: TransactionsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.party.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || txn.type === typeFilter;
    const matchesMethod = methodFilter === "all" || txn.method === methodFilter;
    const matchesStatus = statusFilter === "all" || txn.status === statusFilter;

    return matchesSearch && matchesType && matchesMethod && matchesStatus;
  });

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {onDownloadStatement && (
          <Button variant="outline" size="sm" onClick={onDownloadStatement} className="gap-2">
            <Download className="h-4 w-4" />
            Download Statement
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID or party"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="payment">Payment</SelectItem>
              <SelectItem value="advance">Advance</SelectItem>
              <SelectItem value="refund">Refund</SelectItem>
            </SelectContent>
          </Select>
          <Select value={methodFilter} onValueChange={(v) => setMethodFilter(v as any)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="insurance">Insurance</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Success">Success</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left text-xs font-medium text-muted-foreground p-4 uppercase">TRANSACTION ID</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4 uppercase">DATE</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4 uppercase">TYPE</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4 uppercase">CATEGORY</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4 uppercase">SERVICE/REASON</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4 uppercase">METHOD</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4 uppercase">PARTY</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4 uppercase">AMOUNT</th>
              <th className="text-center text-xs font-medium text-muted-foreground p-4 uppercase">STATUS</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4 uppercase">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="bg-background">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-8 text-center text-sm text-muted-foreground">
                  No transactions found
                </td>
              </tr>
            ) : (
              filteredTransactions.map((txn) => (
                <tr key={txn.id} className="border-t hover:bg-muted/20 transition-colors">
                  <td className="p-4 text-sm">{txn.id}</td>
                  <td className="p-4 text-sm">{txn.date}</td>
                  <td className="p-4 text-sm capitalize">{txn.type}</td>
                  <td className="p-4 text-sm">{txn.category}</td>
                  <td className="p-4 text-sm">{txn.serviceOrReason}</td>
                  <td className="p-4 text-sm capitalize">{txn.method}</td>
                  <td className="p-4 text-sm">{txn.party}</td>
                  <td className="p-4 text-sm">
                    <span className={txn.amount >= 0 ? "text-emerald-600" : "text-red-600"}>
                      {txn.amount >= 0 ? "+" : "-"}
                      {formatINR(Math.abs(txn.amount))}
                    </span>
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
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
