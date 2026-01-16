import { useState } from "react";
import { Plus, Download, FileDown, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { formatINR } from "@/utils/currency";

// Mock data
const mockPolicies = [
  {
    id: "1",
    policyNo: "SH-1234567890",
    patient: { name: "John Doe", phone: "+91 98765 43210" },
    payer: { name: "Star Health Insurance" },
    plan: "Silver",
    network: "In-Network",
    validFrom: "2025-01-01",
    validTo: "2025-12-31",
    status: "Active",
    sumInsured: 50000000, // ₹5,00,000 in paise
  },
  {
    id: "2",
    policyNo: "HDFC-99887766",
    patient: { name: "Priya Shah", phone: "+91 98765 43211" },
    payer: { name: "HDFC ERGO" },
    plan: "Gold",
    network: "Out-of-Network",
    validFrom: "2025-04-01",
    validTo: "2026-03-31",
    status: "Active",
    sumInsured: 75000000, // ₹7,50,000 in paise
  },
];

export function PoliciesTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [networkFilter, setNetworkFilter] = useState("All");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Expired":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "Inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by policy no, patient, or payer..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Expiring">Expiring Soon</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={networkFilter} onValueChange={setNetworkFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Networks</SelectItem>
              <SelectItem value="In-Network">In-Network</SelectItem>
              <SelectItem value="Out-of-Network">Out-of-Network</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Import CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <FileDown className="h-4 w-4" />
            Export
          </Button>
          <Button
            size="sm"
            className="gap-2"
            onClick={() => toast({ title: "New Policy", description: "Opening policy form" })}
          >
            <Plus className="h-4 w-4" />
            New Policy
          </Button>
        </div>
      </div>

      {/* Policies Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Policy No</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Payer</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Network</TableHead>
              <TableHead>Valid From</TableHead>
              <TableHead>Valid To</TableHead>
              <TableHead>Sum Insured</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPolicies.map((policy) => (
              <TableRow key={policy.id}>
                <TableCell className="text-sm">{policy.policyNo}</TableCell>
                <TableCell>
                  <div>
                    <div className="text-sm">{policy.patient.name}</div>
                    <div className="text-sm text-muted-foreground">{policy.patient.phone}</div>
                  </div>
                </TableCell>
                <TableCell>{policy.payer.name}</TableCell>
                <TableCell>{policy.plan}</TableCell>
                <TableCell>
                  <Badge variant="outline">{policy.network}</Badge>
                </TableCell>
                <TableCell>
                  {new Date(policy.validFrom).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </TableCell>
                <TableCell>
                  {new Date(policy.validTo).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </TableCell>
                <TableCell>{formatINR(policy.sumInsured)}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(policy.status)}>
                    {policy.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm">View</Button>
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm">Set Primary</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
