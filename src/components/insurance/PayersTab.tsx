import { useState } from "react";
import { Plus, Download, FileDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

// Mock data
const mockPayers = [
  {
    id: "1",
    name: "Star Health Insurance",
    type: "Insurer",
    code: "STAR01",
    submission: "Portal",
    tat: 5,
    contact: "claims@starhealth.in",
    status: "Active",
  },
  {
    id: "2",
    name: "HDFC ERGO",
    type: "Insurer",
    code: "HDFC01",
    submission: "Email",
    tat: 7,
    contact: "claims@hdfcergo.com",
    status: "Active",
  },
  {
    id: "3",
    name: "MediAssist TPA",
    type: "TPA",
    code: "MEDI01",
    submission: "Portal",
    tat: 3,
    contact: "support@mediassist.in",
    status: "Active",
  },
];

export function PayersTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const getStatusColor = (status: string) => {
    return status === "Active"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
  };

  const getTypeColor = (type: string) => {
    return type === "Insurer"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or code..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="Insurer">Insurer</SelectItem>
              <SelectItem value="TPA">TPA</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <FileDown className="h-4 w-4" />
            Export
          </Button>
          <Button
            size="sm"
            className="gap-2"
            onClick={() => toast({ title: "New Payer", description: "Opening payer form" })}
          >
            <Plus className="h-4 w-4" />
            Add Payer
          </Button>
        </div>
      </div>

      {/* Payers Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payer Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Submission</TableHead>
              <TableHead>TAT (days)</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPayers.map((payer) => (
              <TableRow key={payer.id}>
                <TableCell className="text-sm">{payer.name}</TableCell>
                <TableCell>
                  <Badge className={getTypeColor(payer.type)}>{payer.type}</Badge>
                </TableCell>
                <TableCell className="text-sm">{payer.code}</TableCell>
                <TableCell>{payer.submission}</TableCell>
                <TableCell>{payer.tat} days</TableCell>
                <TableCell className="text-sm">{payer.contact}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(payer.status)}>{payer.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm">View</Button>
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm">Plans</Button>
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
