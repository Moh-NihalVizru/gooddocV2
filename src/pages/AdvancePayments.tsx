import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { PageContent } from "@/components/PageContent";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Search, MoreVertical, User, UserRound } from "lucide-react";
import { formatINR } from "@/utils/currency";
import { Badge } from "@/components/ui/badge";
import { CalendarWidget } from "@/components/CalendarWidget";

interface AdvancePayment {
  id: string;
  patientId: string;
  patientName: string;
  ageSex: string;
  phone: string;
  amount: number; // paise
  paymentMethod: string;
  reason: string;
  collectedBy: string;
  date: string;
  time: string;
  receiptNo: string;
  status: "Available" | "Partially Used" | "Fully Used";
  usedAmount: number; // paise
}

const advancePaymentsData: AdvancePayment[] = [
  {
    id: "ADV-001",
    patientId: "P001",
    patientName: "Rajan Menon",
    ageSex: "52 | M",
    phone: "+91 9586489797",
    amount: 5000000, // ₹50,000
    paymentMethod: "UPI",
    reason: "Surgery - Cardiac Bypass",
    collectedBy: "Reception Desk",
    date: "18-Dec-2025",
    time: "09:30",
    receiptNo: "RCP001",
    status: "Partially Used",
    usedAmount: 2000000,
  },
  {
    id: "ADV-002",
    patientId: "P002",
    patientName: "Meena Menon",
    ageSex: "59 | F",
    phone: "+91 9059635205",
    amount: 7500000, // ₹75,000
    paymentMethod: "Card",
    reason: "IP Admission - Diabetes Management",
    collectedBy: "Billing Counter",
    date: "17-Dec-2025",
    time: "14:15",
    receiptNo: "RCP002",
    status: "Available",
    usedAmount: 0,
  },
  {
    id: "ADV-003",
    patientId: "P003",
    patientName: "Arjun Sharma",
    ageSex: "47 | M",
    phone: "+91 9993924564",
    amount: 3000000, // ₹30,000
    paymentMethod: "Cash",
    reason: "Diagnostic Tests Package",
    collectedBy: "Reception Desk",
    date: "17-Dec-2025",
    time: "11:00",
    receiptNo: "RCP003",
    status: "Fully Used",
    usedAmount: 3000000,
  },
  {
    id: "ADV-004",
    patientId: "P004",
    patientName: "Kavitha Rao",
    ageSex: "76 | F",
    phone: "+91 9848422281",
    amount: 10000000, // ₹1,00,000
    paymentMethod: "NEFT",
    reason: "Surgery - Hip Replacement",
    collectedBy: "Finance Office",
    date: "16-Dec-2025",
    time: "16:30",
    receiptNo: "RCP004",
    status: "Partially Used",
    usedAmount: 4500000,
  },
  {
    id: "ADV-005",
    patientId: "P005",
    patientName: "Sanjay Gupta",
    ageSex: "60 | M",
    phone: "+91 9618342642",
    amount: 2500000, // ₹25,000
    paymentMethod: "UPI",
    reason: "Chemotherapy Sessions",
    collectedBy: "Oncology Dept",
    date: "16-Dec-2025",
    time: "10:45",
    receiptNo: "RCP005",
    status: "Available",
    usedAmount: 0,
  },
  {
    id: "ADV-006",
    patientId: "P006",
    patientName: "Priya Nair",
    ageSex: "61 | F",
    phone: "+91 9625851287",
    amount: 4000000, // ₹40,000
    paymentMethod: "Card",
    reason: "Maternity Package",
    collectedBy: "Billing Counter",
    date: "15-Dec-2025",
    time: "13:20",
    receiptNo: "RCP006",
    status: "Partially Used",
    usedAmount: 1500000,
  },
  {
    id: "ADV-007",
    patientId: "P007",
    patientName: "Rahul Kumar",
    ageSex: "38 | M",
    phone: "+91 9772635641",
    amount: 1500000, // ₹15,000
    paymentMethod: "Cash",
    reason: "Dental Implants",
    collectedBy: "Dental Dept",
    date: "15-Dec-2025",
    time: "09:00",
    receiptNo: "RCP007",
    status: "Fully Used",
    usedAmount: 1500000,
  },
  {
    id: "ADV-008",
    patientId: "P008",
    patientName: "Sneha Reddy",
    ageSex: "18 | F",
    phone: "+91 9985505913",
    amount: 6000000, // ₹60,000
    paymentMethod: "UPI",
    reason: "Orthopedic Surgery",
    collectedBy: "Reception Desk",
    date: "14-Dec-2025",
    time: "15:45",
    receiptNo: "RCP008",
    status: "Available",
    usedAmount: 0,
  },
  {
    id: "ADV-009",
    patientId: "P009",
    patientName: "Vikram Singh",
    ageSex: "29 | M",
    phone: "+91 9241001414",
    amount: 3500000, // ₹35,000
    paymentMethod: "NEFT",
    reason: "Eye Surgery - Lasik",
    collectedBy: "Ophthalmology",
    date: "14-Dec-2025",
    time: "11:30",
    receiptNo: "RCP009",
    status: "Partially Used",
    usedAmount: 2000000,
  },
  {
    id: "ADV-010",
    patientId: "P010",
    patientName: "Anjali Desai",
    ageSex: "52 | F",
    phone: "+91 9770822687",
    amount: 4500000, // ₹45,000
    paymentMethod: "Card",
    reason: "Gastroenterology Treatment",
    collectedBy: "Billing Counter",
    date: "13-Dec-2025",
    time: "10:00",
    receiptNo: "RCP010",
    status: "Available",
    usedAmount: 0,
  },
  {
    id: "ADV-011",
    patientId: "P011",
    patientName: "Karthik Iyer",
    ageSex: "75 | M",
    phone: "+91 9520386539",
    amount: 8000000, // ₹80,000
    paymentMethod: "Cash",
    reason: "Cardiac Stent Procedure",
    collectedBy: "Finance Office",
    date: "12-Dec-2025",
    time: "14:00",
    receiptNo: "RCP011",
    status: "Partially Used",
    usedAmount: 5000000,
  },
  {
    id: "ADV-012",
    patientId: "P012",
    patientName: "Divya Pillai",
    ageSex: "21 | F",
    phone: "+91 9758912776",
    amount: 2000000, // ₹20,000
    paymentMethod: "UPI",
    reason: "Dermatology Treatment",
    collectedBy: "Skin Clinic",
    date: "12-Dec-2025",
    time: "16:15",
    receiptNo: "RCP012",
    status: "Fully Used",
    usedAmount: 2000000,
  },
];

const statusStyles: Record<string, string> = {
  "Available": "bg-green-100 text-green-700",
  "Partially Used": "bg-amber-100 text-amber-700",
  "Fully Used": "bg-gray-100 text-gray-600",
};

const AdvancePayments = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  const totalAdvance = advancePaymentsData.reduce((sum, p) => sum + p.amount, 0);
  const totalUsed = advancePaymentsData.reduce((sum, p) => sum + p.usedAmount, 0);
  const totalAvailable = totalAdvance - totalUsed;

  const filteredData = advancePaymentsData.filter((payment) => {
    const matchesSearch =
      payment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    const matchesMethod = methodFilter === "all" || payment.paymentMethod === methodFilter;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const getGenderIcon = (ageSex: string) => {
    const gender = ageSex.split("|")[1]?.trim();
    if (gender === "F") {
      return <UserRound className="w-5 h-5 text-primary-foreground" />;
    }
    return <User className="w-5 h-5 text-primary-foreground" />;
  };

  const getGenderBg = (ageSex: string) => {
    const gender = ageSex.split("|")[1]?.trim();
    return gender === "F" ? "bg-pink-500" : "bg-primary";
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <PageContent>
        <AppHeader breadcrumbs={["Overview", "Advance Payments"]} />
        <main className="p-6">
          {/* Header */}
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/")}
                  className="h-9 w-9"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-h3 font-semibold text-foreground">Advance Payments</h1>
              </div>
              <CalendarWidget pageKey="advances" />
            </div>
          </Card>

          {/* Filters */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] h-9">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Partially Used">Partially Used</SelectItem>
                  <SelectItem value="Fully Used">Fully Used</SelectItem>
                </SelectContent>
              </Select>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-[160px] h-9">
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="NEFT">NEFT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, receipt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>

          {/* Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Receipt No.</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Used</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-center w-[120px]">Status</TableHead>
                  <TableHead className="w-[60px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getGenderBg(payment.ageSex)}`}>
                          {getGenderIcon(payment.ageSex)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{payment.patientName}</p>
                          <p className="text-xs text-muted-foreground">
                            GDID - {payment.patientId.replace("P", "").padStart(3, "0")} • {payment.ageSex}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-foreground">{payment.receiptNo}</p>
                      <p className="text-xs text-muted-foreground">{payment.collectedBy}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-foreground">{payment.time}</p>
                      <p className="text-xs text-muted-foreground">{payment.date}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-foreground">{payment.paymentMethod}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <p className="text-sm font-medium text-foreground">{formatINR(payment.amount)}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {payment.usedAmount > 0 ? formatINR(payment.usedAmount) : "—"}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <p className="text-sm font-medium text-green-600">
                        {formatINR(payment.amount - payment.usedAmount)}
                      </p>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`${statusStyles[payment.status]} text-xs min-w-[110px] justify-center whitespace-nowrap`}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/patient-insights/${payment.patientId}`)}>
                            Patient Insight
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            View Receipt
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Print Receipt
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {filteredData.length} of {advancePaymentsData.length} results
              </p>
            </div>
          </Card>
        </main>
      </PageContent>
    </div>
  );
};

export default AdvancePayments;
