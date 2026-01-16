import { useState, useMemo } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { PageContent } from "@/components/PageContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, User, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { CalendarWidget } from "@/components/CalendarWidget";

interface DiagnosticOrder {
  id: string;
  type: "laboratory" | "radiology";
  patient: {
    name: string;
    gdid: string;
    age: number;
    sex: string;
    phone: string;
  };
  workorderId: string;
  orderDate: string;
  orderTime: string;
  status: string;
  waitingForApproval: string;
  approvedBy: string;
  price: number;
  departments: {
    name: string;
    tests: string[];
  }[];
}

const mockOrders: DiagnosticOrder[] = [
  {
    id: "OR-LL-10342",
    type: "laboratory",
    patient: {
      name: "Harish Kalyan",
      gdid: "GD2028",
      age: 35,
      sex: "M",
      phone: "+91 98xxxx210",
    },
    workorderId: "GD2028",
    orderDate: "08-12-2025",
    orderTime: "11:52:23",
    status: "Pending",
    waitingForApproval: "-",
    approvedBy: "Dr. Arjun Reddy",
    price: 756.00,
    departments: [
      {
        name: "Biochemistry",
        tests: ["ST Order Test", "Liver Function Test (LFT)", "Overall Test", "24-Hour Urine BUN"]
      }
    ]
  },
  {
    id: "OR-LL-10367",
    type: "laboratory",
    patient: {
      name: "Rohan Mehta",
      gdid: "GD2035",
      age: 62,
      sex: "M",
      phone: "+91 98xxxx345",
    },
    workorderId: "GD2035",
    orderDate: "08-12-2025",
    orderTime: "10:30:15",
    status: "Pending",
    waitingForApproval: "Dr. Sharma",
    approvedBy: "Dr. Sharma",
    price: 1250.00,
    departments: [
      {
        name: "Biochemistry",
        tests: ["HbA1c", "Lipid Panel", "Fasting Glucose"]
      },
      {
        name: "Hematology",
        tests: ["CBC with Diff"]
      }
    ]
  },
  {
    id: "OR-RD-55421",
    type: "radiology",
    patient: {
      name: "Kavya Iyer",
      gdid: "GD2042",
      age: 28,
      sex: "F",
      phone: "+91 98xxxx567",
    },
    workorderId: "GD2042",
    orderDate: "08-12-2025",
    orderTime: "09:45:00",
    status: "For Review",
    waitingForApproval: "-",
    approvedBy: "Dr. Patel",
    price: 3500.00,
    departments: [
      {
        name: "Radiology",
        tests: ["CT Chest with contrast"]
      }
    ]
  },
  {
    id: "OR-RD-55438",
    type: "radiology",
    patient: {
      name: "Arnav Rao",
      gdid: "GD2048",
      age: 45,
      sex: "M",
      phone: "+91 98xxxx789",
    },
    workorderId: "GD2048",
    orderDate: "08-12-2025",
    orderTime: "14:30:00",
    status: "Completed",
    waitingForApproval: "-",
    approvedBy: "Dr. Kumar",
    price: 8500.00,
    departments: [
      {
        name: "Radiology",
        tests: ["MRI Brain w/o contrast"]
      }
    ]
  },
  {
    id: "OR-LL-10389",
    type: "laboratory",
    patient: {
      name: "Priya Desai",
      gdid: "GD2055",
      age: 52,
      sex: "F",
      phone: "+91 98xxxx432",
    },
    workorderId: "GD2055",
    orderDate: "08-12-2025",
    orderTime: "13:00:00",
    status: "Pending",
    waitingForApproval: "Dr. Singh",
    approvedBy: "-",
    price: 450.00,
    departments: [
      {
        name: "Microbiology",
        tests: ["Urinalysis", "Urine Culture"]
      }
    ]
  }
];

export default function DiagnosticsWorklist() {
  const [selectedTab, setSelectedTab] = useState("laboratory");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [approvedByFilter, setApprovedByFilter] = useState("all");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Get unique departments and approvers for filter options
  const filterOptions = useMemo(() => {
    const departments = [...new Set(mockOrders.flatMap(order => order.departments.map(d => d.name)))];
    const approvers = [...new Set(mockOrders.map(order => order.approvedBy).filter(a => a !== "-"))];
    return { departments, approvers };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "for review": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filteredOrders = mockOrders.filter(order => {
    const matchesTab = (selectedTab === "laboratory" && order.type === "laboratory") ||
                       (selectedTab === "radiology" && order.type === "radiology");
    const matchesSearch = searchQuery === "" || 
                         order.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.patient.gdid.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.workorderId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesDepartment = departmentFilter === "all" || 
                              order.departments.some(d => d.name === departmentFilter);
    const matchesApprover = approvedByFilter === "all" || order.approvedBy === approvedByFilter;
    
    return matchesTab && matchesSearch && matchesStatus && matchesDepartment && matchesApprover;
  });

  const getTotalTests = (departments: DiagnosticOrder["departments"]) => {
    return departments.reduce((acc, dept) => acc + dept.tests.length, 0);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      
      <PageContent>
        <AppHeader breadcrumbs={["Diagnostics"]} />
        
        <main className="p-6">
          {/* Header with Calendar */}
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-foreground">Diagnostics</h1>
              <CalendarWidget pageKey="diagnostics" />
            </div>
          </Card>

          {/* Tabs and Filters */}
          <div className="flex items-center justify-between mb-6">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 justify-start">
                <TabsTrigger value="laboratory" className="tab-trigger rounded-none border-b-0 data-[state=active]:bg-transparent px-4 py-3">
                  Laboratory
                </TabsTrigger>
                <TabsTrigger value="radiology" className="tab-trigger rounded-none border-b-0 data-[state=active]:bg-transparent px-4 py-3">
                  Radiology
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-3 pb-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="For Review">For Review</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[150px] h-9">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {filterOptions.departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={approvedByFilter} onValueChange={setApprovedByFilter}>
                <SelectTrigger className="w-[150px] h-9">
                  <SelectValue placeholder="Approved By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Approvers</SelectItem>
                  {filterOptions.approvers.map((approver) => (
                    <SelectItem key={approver} value={approver}>{approver}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name, MRN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1fr_1fr_120px] gap-4 p-4 border-b border-border bg-muted/30">
              <div className="text-xs font-medium text-muted-foreground">Patient Info</div>
              <div className="text-xs font-medium text-muted-foreground">Workorder ID</div>
              <div className="text-xs font-medium text-muted-foreground">Order</div>
              <div className="text-xs font-medium text-muted-foreground">Status</div>
              <div className="text-xs font-medium text-muted-foreground">Waiting for Approval</div>
              <div className="text-xs font-medium text-muted-foreground">Approved by</div>
              <div className="text-xs font-medium text-muted-foreground">Price</div>
              <div className="text-xs font-medium text-muted-foreground">Action</div>
            </div>

            {filteredOrders.map((order) => (
              <div key={order.id} className="border-b border-border last:border-b-0">
                {/* Main Row */}
                <div 
                  className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1fr_1fr_120px] gap-4 p-4 items-center hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => toggleRowExpansion(order.id)}
                >
                  {/* Patient Info */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      order.patient.sex.toLowerCase().startsWith('f') 
                        ? 'bg-pink-500' 
                        : 'bg-primary'
                    }`}>
                      {order.patient.sex.toLowerCase().startsWith('f') ? (
                        <UserRound className="w-5 h-5 text-primary-foreground" />
                      ) : (
                        <User className="w-5 h-5 text-primary-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {order.patient.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        GDID - {order.patient.gdid.replace('GD', '')} • {order.patient.age} | {order.patient.sex}
                      </div>
                    </div>
                  </div>

                  {/* Workorder ID */}
                  <div className="text-sm text-foreground">
                    {order.workorderId}
                  </div>

                  {/* Order Date & Time */}
                  <div>
                    <div className="text-sm text-foreground">{order.orderDate}</div>
                    <div className="text-xs text-muted-foreground">{order.orderTime}</div>
                  </div>

                  {/* Status */}
                  <div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>

                  {/* Waiting for Approval */}
                  <div className="text-sm text-foreground">
                    {order.waitingForApproval}
                  </div>

                  {/* Approved by */}
                  <div className="text-sm text-foreground">
                    {order.approvedBy}
                  </div>

                  {/* Price */}
                  <div className="text-sm text-foreground">
                    ₹{order.price.toFixed(2)}
                  </div>

                  {/* Action */}
                  <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                    <Link to={`/diagnostics/${order.type === "laboratory" ? "lab" : order.type}/${order.id}`}>
                      <Button variant="default" size="sm">
                        Enter Results
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Departments & Tests Row - Collapsible with Animation */}
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    expandedRows.has(order.id) ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-4 pb-4 pt-0">
                    <div className="border-t border-border pt-4">
                      <div className="flex items-start gap-6 text-sm">
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground font-medium">Departments</span>
                          <div className="flex gap-2">
                            {order.departments.map((dept, idx) => (
                              <Badge key={idx} variant="secondary" className="bg-primary/10 text-primary font-normal">
                                {dept.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">All Tests ({getTotalTests(order.departments)})</span>
                          <div className="flex gap-4 text-foreground">
                            {order.departments.flatMap(dept => dept.tests).map((test, idx) => (
                              <span key={idx}>{test}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </PageContent>
    </div>
  );
}
