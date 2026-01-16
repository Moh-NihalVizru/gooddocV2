import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarWidget } from "@/components/CalendarWidget";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PatientCell } from "@/components/overview/PatientCell";
import { appointmentRequests, AppointmentRequestRecord } from "@/data/overview.mock";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { PageContent } from "@/components/PageContent";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Calendar, Clock, Stethoscope, MapPin, FileText, Hash, Search, MoreHorizontal, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

// Mock data for Laboratory tab - appointment requests for lab tests
interface LaboratoryRecord {
  id: string;
  orderId: string;
  patient: string;
  gdid: string;
  ageSex: string;
  contact: string;
  email: string;
  testType: string;
  orderedBy: string;
  department: string;
  preferredDate: string;
  preferredTime: string;
  visitType: "In-patient" | "Home";
}

const laboratoryData: LaboratoryRecord[] = [
  { id: "LAB001", orderId: "ORD001", patient: "Ravi Sharma", gdid: "001", ageSex: "45 | M", contact: "9876543210", email: "ravi.sharma@email.com", testType: "CBC001", orderedBy: "Dr. Rajesh Kumar", department: "Biochemistry", preferredDate: "21 Dec 2025", preferredTime: "09:30 AM", visitType: "Home" },
  { id: "LAB002", orderId: "ORD002", patient: "Priya Menon", gdid: "002", ageSex: "32 | F", contact: "9876543211", email: "priya.menon@email.com", testType: "LIP001", orderedBy: "Priya Menon", department: "Biochemistry", preferredDate: "21 Dec 2025", preferredTime: "10:00 AM", visitType: "In-patient" },
  { id: "LAB003", orderId: "ORD003", patient: "Anil Kapoor", gdid: "003", ageSex: "58 | M", contact: "9876543212", email: "anil.kapoor@email.com", testType: "LFT001", orderedBy: "Dr. Anita Singh", department: "Biochemistry", preferredDate: "21 Dec 2025", preferredTime: "10:30 AM", visitType: "Home" },
  { id: "LAB004", orderId: "ORD004", patient: "Sunita Rao", gdid: "004", ageSex: "41 | F", contact: "9876543213", email: "sunita.rao@email.com", testType: "KFT001", orderedBy: "Sunita Rao", department: "Biochemistry", preferredDate: "21 Dec 2025", preferredTime: "11:00 AM", visitType: "In-patient" },
  { id: "LAB005", orderId: "ORD005", patient: "Mohan Iyer", gdid: "005", ageSex: "65 | M", contact: "9876543214", email: "mohan.iyer@email.com", testType: "THY001", orderedBy: "Dr. Prakash Shah", department: "Endocrinology", preferredDate: "21 Dec 2025", preferredTime: "11:30 AM", visitType: "Home" },
  { id: "LAB006", orderId: "ORD006", patient: "Kavitha Nair", gdid: "006", ageSex: "29 | F", contact: "9876543215", email: "kavitha.nair@email.com", testType: "HBA001", orderedBy: "Kavitha Nair", department: "Diabetes", preferredDate: "21 Dec 2025", preferredTime: "02:00 PM", visitType: "Home" },
  { id: "LAB007", orderId: "ORD007", patient: "Vikram Singh", gdid: "007", ageSex: "52 | M", contact: "9876543216", email: "vikram.singh@email.com", testType: "URI001", orderedBy: "Dr. Arun Bhat", department: "Urology", preferredDate: "21 Dec 2025", preferredTime: "02:30 PM", visitType: "In-patient" },
  { id: "LAB008", orderId: "ORD008", patient: "Deepa Krishnan", gdid: "008", ageSex: "38 | F", contact: "9876543217", email: "deepa.k@email.com", testType: "VIT001", orderedBy: "Deepa Krishnan", department: "Biochemistry", preferredDate: "21 Dec 2025", preferredTime: "03:00 PM", visitType: "In-patient" },
  { id: "LAB009", orderId: "ORD009", patient: "Rajendra Prasad", gdid: "009", ageSex: "60 | M", contact: "9876543218", email: "raj.prasad@email.com", testType: "VIT002", orderedBy: "Dr. Meera Nair", department: "Biochemistry", preferredDate: "22 Dec 2025", preferredTime: "09:00 AM", visitType: "Home" },
  { id: "LAB010", orderId: "ORD010", patient: "Lakshmi Devi", gdid: "010", ageSex: "48 | F", contact: "9876543219", email: "lakshmi.d@email.com", testType: "IRO001", orderedBy: "Lakshmi Devi", department: "Hematology", preferredDate: "22 Dec 2025", preferredTime: "09:30 AM", visitType: "Home" },
];

// Mock data for Scheduled tab - combined outpatient and laboratory scheduled appointments
interface ScheduledAppointment {
  id: string;
  appointmentId: string;
  patient: string;
  gdid: string;
  ageSex: string;
  contact: string;
  email: string;
  appointmentFor: "Outpatient" | "Laboratory";
  scheduledDate: string;
  scheduledTime: string;
  doctorOrTest: string;
  testCode?: string;
  department: string;
  visitType: string;
  requestId?: string;
  orderId?: string;
}

const scheduledAppointments: ScheduledAppointment[] = [
  { id: "1", appointmentId: "APT001", patient: "Ravi Sharma", gdid: "001", ageSex: "45 | M", contact: "9876543210", email: "ravi.sharma@email.com", appointmentFor: "Outpatient", scheduledDate: "21 Dec 2025", scheduledTime: "09:00 AM", doctorOrTest: "Dr. Meera Nair", department: "Cardiology", visitType: "First Visit", requestId: "REQ001" },
  { id: "2", appointmentId: "APT002", patient: "Priya Menon", gdid: "002", ageSex: "32 | F", contact: "9876543211", email: "priya.menon@email.com", appointmentFor: "Laboratory", scheduledDate: "21 Dec 2025", scheduledTime: "09:30 AM", doctorOrTest: "LIP001", testCode: "LIP001", department: "Biochemistry", visitType: "Home", orderId: "ORD001" },
  { id: "3", appointmentId: "APT003", patient: "Anil Kapoor", gdid: "003", ageSex: "58 | M", contact: "9876543212", email: "anil.kapoor@email.com", appointmentFor: "Outpatient", scheduledDate: "21 Dec 2025", scheduledTime: "10:00 AM", doctorOrTest: "Dr. Anita Singh", department: "Neurology", visitType: "Follow up", requestId: "REQ002" },
  { id: "4", appointmentId: "APT004", patient: "Sunita Rao", gdid: "004", ageSex: "41 | F", contact: "9876543213", email: "sunita.rao@email.com", appointmentFor: "Laboratory", scheduledDate: "21 Dec 2025", scheduledTime: "10:30 AM", doctorOrTest: "KFT001", testCode: "KFT001", department: "Biochemistry", visitType: "In-patient", orderId: "ORD002" },
  { id: "5", appointmentId: "APT005", patient: "Mohan Iyer", gdid: "005", ageSex: "65 | M", contact: "9876543214", email: "mohan.iyer@email.com", appointmentFor: "Outpatient", scheduledDate: "21 Dec 2025", scheduledTime: "11:00 AM", doctorOrTest: "Dr. Prakash Shah", department: "ENT", visitType: "First Visit", requestId: "REQ003" },
  { id: "6", appointmentId: "APT006", patient: "Kavitha Nair", gdid: "006", ageSex: "29 | F", contact: "9876543215", email: "kavitha.nair@email.com", appointmentFor: "Laboratory", scheduledDate: "21 Dec 2025", scheduledTime: "11:30 AM", doctorOrTest: "HBA001", testCode: "HBA001", department: "Diabetes", visitType: "Home", orderId: "ORD003" },
  { id: "7", appointmentId: "APT007", patient: "Vikram Singh", gdid: "007", ageSex: "52 | M", contact: "9876543216", email: "vikram.singh@email.com", appointmentFor: "Outpatient", scheduledDate: "21 Dec 2025", scheduledTime: "02:00 PM", doctorOrTest: "Dr. Arun Bhat", department: "Gastroenterology", visitType: "Follow up", requestId: "REQ004" },
  { id: "8", appointmentId: "APT008", patient: "Deepa Krishnan", gdid: "008", ageSex: "38 | F", contact: "9876543217", email: "deepa.k@email.com", appointmentFor: "Laboratory", scheduledDate: "21 Dec 2025", scheduledTime: "02:30 PM", doctorOrTest: "VIT001", testCode: "VIT001", department: "Biochemistry", visitType: "In-patient", orderId: "ORD004" },
  { id: "9", appointmentId: "APT009", patient: "Rajendra Prasad", gdid: "009", ageSex: "60 | M", contact: "9876543218", email: "raj.prasad@email.com", appointmentFor: "Outpatient", scheduledDate: "21 Dec 2025", scheduledTime: "03:00 PM", doctorOrTest: "Dr. Meera Nair", department: "Cardiology", visitType: "Follow up", requestId: "REQ005" },
  { id: "10", appointmentId: "APT010", patient: "Lakshmi Devi", gdid: "010", ageSex: "48 | F", contact: "9876543219", email: "lakshmi.d@email.com", appointmentFor: "Laboratory", scheduledDate: "21 Dec 2025", scheduledTime: "03:30 PM", doctorOrTest: "IRO001", testCode: "IRO001", department: "Hematology", visitType: "Home", orderId: "ORD005" },
];

type TabType = "outpatient" | "laboratory" | "scheduled";

const AppointmentRequests = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("outpatient");
  const [selectedRequest, setSelectedRequest] = useState<AppointmentRequestRecord | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [visitTypeFilter, setVisitTypeFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const getVisitTypeLabel = (visitType: string): string => {
    return visitType === "Follow-up" ? "Follow up" : "First Visit";
  };

  const getVisitTypeBadgeStyle = (visitType: string): string => {
    return visitType === "Follow-up" 
      ? "bg-blue-100 text-blue-700" 
      : "bg-green-100 text-green-700";
  };

  const handleViewSummary = (row: AppointmentRequestRecord) => {
    setSelectedRequest(row);
    setShowSummary(true);
  };

  const getTabCount = () => {
    switch (activeTab) {
      case "outpatient": return appointmentRequests.length;
      case "laboratory": return laboratoryData.length;
      case "scheduled": return scheduledAppointments.length;
    }
  };

  const totalPages = Math.ceil(getTabCount() / pageSize);

  const renderOutpatientTable = () => {
    const paginatedData = appointmentRequests.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    
    return (
      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead style={{ width: "220px", minWidth: "220px" }}>Patient Info</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Preferred Date/Time</TableHead>
            <TableHead>Request ID</TableHead>
            <TableHead>Preferred Doctor</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Visit Type</TableHead>
            <TableHead style={{ width: "140px" }}></TableHead>
            <TableHead style={{ width: "80px" }}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((row, index) => {
            const requestId = `REQ${String(index + 1).padStart(3, '0')}`;
            const gdidNumber = String((currentPage - 1) * pageSize + index).padStart(3, '0');
            return (
              <TableRow 
                key={row.requestId} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/book-appointment?type=consultation`, {
                  state: {
                    requestData: {
                      type: 'outpatient',
                      requestId,
                      patient: row.patient,
                      gdid: gdidNumber,
                      ageSex: row.ageSex,
                      contact: row.contact,
                      email: row.email,
                      preferredDate: row.preferredDate,
                      preferredTime: row.preferredTime,
                      preferredDoctor: row.preferredProvider,
                      department: row.department,
                      visitType: row.visitType,
                    }
                  }
                })}
              >
                <TableCell style={{ width: "220px", minWidth: "220px" }}>
                  <PatientCell name={row.patient} gdid={row.requestId} ageSex={row.ageSex} patientId={row.requestId} fromPage="scheduled" />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{row.contact}</span>
                    <span className="text-muted-foreground text-xs">{row.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{row.preferredTime}</span>
                    <span className="text-muted-foreground text-xs">{row.preferredDate}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{requestId}</TableCell>
                <TableCell>{row.preferredProvider || "Any"}</TableCell>
                <TableCell>{row.department}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getVisitTypeBadgeStyle(row.visitType)}>
                    {getVisitTypeLabel(row.visitType)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/book-appointment?type=consultation`, {
                        state: {
                          requestData: {
                            type: 'outpatient',
                            requestId,
                            patient: row.patient,
                            gdid: gdidNumber,
                            ageSex: row.ageSex,
                            contact: row.contact,
                            email: row.email,
                            preferredDate: row.preferredDate,
                            preferredTime: row.preferredTime,
                            preferredDoctor: row.preferredProvider,
                            department: row.department,
                            visitType: row.visitType,
                          }
                        }
                      });
                    }}
                  >
                    Schedule Now
                  </Button>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border shadow-md z-50">
                      <DropdownMenuItem onClick={() => navigate(`/patient-insights/${gdidNumber}?from=scheduled`)}>Patient Insight</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewSummary(row)}>View Summary</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  const renderLaboratoryTable = () => (
    <Table className="w-full table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead style={{ width: "220px", minWidth: "220px" }}>Patient Info</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Order ID</TableHead>
          <TableHead>Test Type</TableHead>
          <TableHead>Ordered By</TableHead>
          <TableHead>Preferred Date/Time</TableHead>
          <TableHead>Visit Type</TableHead>
          <TableHead style={{ width: "140px" }}></TableHead>
          <TableHead style={{ width: "80px" }}>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {laboratoryData.map((row) => (
          <TableRow key={row.id} className="cursor-pointer hover:bg-muted/50">
            <TableCell style={{ width: "220px", minWidth: "220px" }}>
              <PatientCell name={row.patient} gdid={row.gdid} ageSex={row.ageSex} patientId={row.gdid} fromPage="scheduled" />
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span>{row.contact}</span>
                <span className="text-muted-foreground text-xs">{row.email}</span>
              </div>
            </TableCell>
            <TableCell className="text-sm">{row.orderId}</TableCell>
            <TableCell>{row.testType}</TableCell>
            <TableCell>{row.orderedBy}</TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span>{row.preferredTime}</span>
                <span className="text-muted-foreground text-xs">{row.preferredDate}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={row.visitType === "In-patient" ? "bg-purple-100 text-purple-700" : "bg-teal-100 text-teal-700"}>
                {row.visitType}
              </Badge>
            </TableCell>
            <TableCell>
              <Button 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/book-appointment?type=laboratory`, {
                    state: {
                      requestData: {
                        type: 'laboratory',
                        orderId: row.orderId,
                        patient: row.patient,
                        gdid: row.gdid,
                        ageSex: row.ageSex,
                        contact: row.contact,
                        email: row.email,
                        testType: row.testType,
                        orderedBy: row.orderedBy,
                        preferredDate: row.preferredDate,
                        preferredTime: row.preferredTime,
                        visitType: row.visitType,
                      }
                    }
                  });
                }}
              >
                Schedule Now
              </Button>
            </TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover border shadow-md z-50">
                  <DropdownMenuItem onClick={() => navigate(`/patient-insights/${row.gdid}?from=scheduled`)}>Patient Insight</DropdownMenuItem>
                  <DropdownMenuItem>View Summary</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderScheduledTable = () => (
    <Table className="w-full table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead style={{ width: "220px", minWidth: "220px" }}>Patient Info</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Appointment ID</TableHead>
          <TableHead>Scheduled Date/Time</TableHead>
          <TableHead>Doctor / Test</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Visit Type</TableHead>
          <TableHead>Appointment For</TableHead>
          <TableHead style={{ width: "80px" }}>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {scheduledAppointments.map((row) => (
          <TableRow key={row.id} className="cursor-pointer hover:bg-muted/50">
            <TableCell style={{ width: "220px", minWidth: "220px" }}>
              <PatientCell name={row.patient} gdid={row.gdid} ageSex={row.ageSex} patientId={row.gdid} fromPage="scheduled" />
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span>{row.contact}</span>
                <span className="text-muted-foreground text-xs">{row.email}</span>
              </div>
            </TableCell>
            <TableCell className="text-sm">{row.appointmentId}</TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span>{row.scheduledTime}</span>
                <span className="text-muted-foreground text-xs">{row.scheduledDate}</span>
              </div>
            </TableCell>
            <TableCell>
              {row.appointmentFor === "Laboratory" ? (
                <span className="font-medium">{row.testCode}</span>
              ) : (
                <span>{row.doctorOrTest}</span>
              )}
            </TableCell>
            <TableCell>{row.department}</TableCell>
            <TableCell>{row.visitType}</TableCell>
            <TableCell>
              <Badge variant="outline" className={row.appointmentFor === "Outpatient" ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"}>
                {row.appointmentFor}
              </Badge>
            </TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover border shadow-md z-50">
                  <DropdownMenuItem onClick={() => navigate(`/patient-insights/${row.gdid}?from=scheduled`)}>Patient Insight</DropdownMenuItem>
                  <DropdownMenuItem>View Summary</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      
      <PageContent>
        <AppHeader breadcrumbs={["Overview", "Appointment Requests"]} />
        
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
                  aria-label="Back to Overview"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-h3 font-semibold text-foreground">Appointment Requests</h1>
              </div>
              <CalendarWidget pageKey="scheduled-today" />
            </div>
          </Card>

          {/* Controls Row with Tabs, Filters and Search */}
          <div className="flex items-center justify-between mb-4">
            {/* Left: Tabs */}
            <div className="flex items-center border-b">
              <button
                onClick={() => { setActiveTab("outpatient"); setCurrentPage(1); }}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "outpatient" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Outpatient
              </button>
              <button
                onClick={() => { setActiveTab("laboratory"); setCurrentPage(1); }}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "laboratory" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Laboratory
              </button>
              <button
                onClick={() => { setActiveTab("scheduled"); setCurrentPage(1); }}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "scheduled" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Scheduled
              </button>
            </div>

            {/* Right: Filters and Search */}
            <div className="flex items-center gap-3">
              <Select value={visitTypeFilter} onValueChange={setVisitTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Visit Type" />
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-md z-50">
                  <SelectItem value="all">All Visit Type</SelectItem>
                  <SelectItem value="First Visit">First Visit</SelectItem>
                  <SelectItem value="Follow-up">Follow up</SelectItem>
                </SelectContent>
              </Select>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-md z-50">
                  <SelectItem value="all">All Department</SelectItem>
                  <SelectItem value="Cardiology">Cardiology</SelectItem>
                  <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="Neurology">Neurology</SelectItem>
                  <SelectItem value="General Medicine">General Medicine</SelectItem>
                </SelectContent>
              </Select>

              {/* Search */}
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Request ID, patient name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <Card className="overflow-x-auto">
            <div className="min-w-full">
              {activeTab === "outpatient" && renderOutpatientTable()}
              {activeTab === "laboratory" && renderLaboratoryTable()}
              {activeTab === "scheduled" && renderScheduledTable()}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-small text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to{" "}
                {Math.min(currentPage * pageSize, getTabCount())} of {getTabCount()} results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-small text-muted-foreground px-2">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </main>
      </PageContent>

      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Appointment Summary</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              {/* Patient Info */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedRequest.ageSex.includes('F') ? 'bg-pink-100' : 'bg-blue-100'}`}>
                  <User className={`w-5 h-5 ${selectedRequest.ageSex.includes('F') ? 'text-pink-600' : 'text-blue-600'}`} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{selectedRequest.patient}</p>
                  <p className="text-sm text-muted-foreground">GDID - {selectedRequest.requestId.slice(-3)} • {selectedRequest.ageSex}</p>
                </div>
                <Badge className={`ml-auto ${selectedRequest.status === "New" ? "bg-amber-100 text-amber-700" : selectedRequest.status === "Pending" ? "bg-blue-100 text-blue-700" : selectedRequest.status === "Scheduled" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {selectedRequest.status === "New" ? "Pending Check-in" : selectedRequest.status}
                </Badge>
              </div>

              {/* Visit Details */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Visit ID</p>
                      <p className="text-sm font-medium">V25-{selectedRequest.requestId.slice(-3)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Appointment Time</p>
                      <p className="text-sm font-medium">{selectedRequest.preferredDate} {selectedRequest.preferredTime}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Check-in Time</p>
                      <p className="text-sm font-medium">Not checked in</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Token/Queue No.</p>
                      <p className="text-sm font-medium">Not assigned</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Stethoscope className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Doctor</p>
                      <p className="text-sm font-medium">{selectedRequest.preferredProvider || "Any"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Department</p>
                      <p className="text-sm font-medium">{selectedRequest.department}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical Information */}
              <div className="p-3 border rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Clinical Information</p>
                <p className="text-sm text-muted-foreground italic">No clinical information available.</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentRequests;
