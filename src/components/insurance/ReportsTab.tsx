import { useState } from "react";
import { Download, FileDown, Calendar, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/utils/currency";

export function ReportsTab() {
  const [dateRange, setDateRange] = useState("90d");
  const [payerFilter, setPayerFilter] = useState("All");

  // Mock KPI data
  const kpis = {
    totalBilled: 1235000000, // ₹1,23,50,000
    insurancePaid: 897500000, // ₹89,75,000
    adjustments: 12500000, // ₹1,25,000
    balance: 325000000, // ₹32,50,000
    totalClaims: 156,
    submitted: 45,
    inReview: 12,
    paid: 89,
    denied: 7,
    partiallyPaid: 3,
    denialRate: 4.5,
    avgTAT: 6.2,
  };

  // Mock denials data
  const denials = [
    { claimNo: "CLM789", payer: "Star Health", reason: "Incomplete documentation", amount: 450000, daysSince: 15, attempts: 2 },
    { claimNo: "CLM754", payer: "HDFC ERGO", reason: "Pre-existing condition", amount: 280000, daysSince: 8, attempts: 1 },
    { claimNo: "CLM698", payer: "National Insurance", reason: "Out of network", amount: 325000, daysSince: 22, attempts: 3 },
  ];

  // Mock A/R aging data
  const arAging = [
    { range: "0-30 days", count: 45, amount: 1125000000 },
    { range: "31-60 days", count: 23, amount: 575000000 },
    { range: "61-90 days", count: 12, amount: 300000000 },
    { range: ">90 days", count: 8, amount: 200000000 },
  ];

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Select value={payerFilter} onValueChange={setPayerFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Payers</SelectItem>
              <SelectItem value="star">Star Health</SelectItem>
              <SelectItem value="hdfc">HDFC ERGO</SelectItem>
              <SelectItem value="mediassist">MediAssist</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <FileDown className="h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            Schedule Report
          </Button>
        </div>
      </div>

      {/* KPI Cards - Top Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Total Billed</div>
          <div className="text-2xl font-bold text-foreground">{formatINR(kpis.totalBilled)}</div>
          <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
            <TrendingUp className="h-4 w-4" />
            <span>+12% from last period</span>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Insurance Paid</div>
          <div className="text-2xl font-bold text-green-600">{formatINR(kpis.insurancePaid)}</div>
          <div className="text-sm text-muted-foreground mt-2">
            {((kpis.insurancePaid / kpis.totalBilled) * 100).toFixed(1)}% of billed
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Adjustments</div>
          <div className="text-2xl font-bold text-orange-600">{formatINR(kpis.adjustments)}</div>
          <div className="text-sm text-muted-foreground mt-2">
            {((kpis.adjustments / kpis.totalBilled) * 100).toFixed(1)}% of billed
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Balance</div>
          <div className="text-2xl font-bold text-foreground">{formatINR(kpis.balance)}</div>
          <div className="text-sm text-muted-foreground mt-2">
            {((kpis.balance / kpis.totalBilled) * 100).toFixed(1)}% outstanding
          </div>
        </Card>
      </div>

      {/* KPI Cards - Bottom Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Total Claims</div>
          <div className="text-2xl font-bold text-foreground">{kpis.totalClaims}</div>
          <div className="text-sm text-muted-foreground mt-2">
            {kpis.paid} Paid • {kpis.inReview} In Review
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Submitted</div>
          <div className="text-2xl font-bold text-blue-600">{kpis.submitted}</div>
          <div className="text-sm text-muted-foreground mt-2">Awaiting review</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Denial Rate</div>
          <div className="text-2xl font-bold text-red-600">{kpis.denialRate}%</div>
          <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
            <TrendingDown className="h-4 w-4" />
            <span>-2% from last period</span>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Avg TAT</div>
          <div className="text-2xl font-bold text-foreground">{kpis.avgTAT} days</div>
          <div className="text-sm text-muted-foreground mt-2">From submission to paid</div>
        </Card>
      </div>

      {/* Denials Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Denials</h3>
          <Button variant="outline" size="sm">View All</Button>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim No</TableHead>
                <TableHead>Payer</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Days Since Denial</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {denials.map((denial) => (
                <TableRow key={denial.claimNo}>
                  <TableCell className="text-sm">{denial.claimNo}</TableCell>
                  <TableCell className="text-sm">{denial.payer}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span>{denial.reason}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatINR(denial.amount)}</TableCell>
                  <TableCell>
                    <Badge variant={denial.daysSince > 20 ? "destructive" : "outline"}>
                      {denial.daysSince} days
                    </Badge>
                  </TableCell>
                  <TableCell>{denial.attempts}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Resubmit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* A/R Aging */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">A/R Aging</h3>
          <span className="text-sm text-muted-foreground">
            Total: {arAging.reduce((sum, bucket) => sum + bucket.count, 0)} claims • {formatINR(arAging.reduce((sum, bucket) => sum + bucket.amount, 0))}
          </span>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aging Period</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>% of Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {arAging.map((bucket) => {
                const total = arAging.reduce((sum, b) => sum + b.amount, 0);
                const percentage = ((bucket.amount / total) * 100).toFixed(1);
                return (
                  <TableRow key={bucket.range}>
                    <TableCell className="text-sm">{bucket.range}</TableCell>
                    <TableCell className="text-sm">{bucket.count}</TableCell>
                    <TableCell className="text-sm">{formatINR(bucket.amount)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm">{percentage}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
