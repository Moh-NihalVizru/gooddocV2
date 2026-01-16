import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { PageContent } from "@/components/PageContent";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Users,
  Bed,
  Clock,
  Search,
  Calendar
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parseISO } from "date-fns";

// Mock department data
const DEPARTMENTS_DATA: Record<string, {
  id: string;
  name: string;
  description: string;
  headDoctor: { id: string; name: string };
  contact: { phone: string; email: string };
  locations: string[];
  metrics: {
    doctorsCount: number;
    outpatientCount: number;
    inpatientCount: number;
    bedOccupancy: number;
    avgWaitTime: number;
  };
}> = {
  cardiology: {
    id: "cardiology",
    name: "Cardiology",
    description: "Department specializing in diagnosis and treatment of heart and cardiovascular system disorders.",
    headDoctor: { id: "d1e2f3a4-b5c6-7890-def0-123456789abc", name: "Dr. Priya Sharma" },
    contact: { phone: "+91 98XXX XXXXX", email: "cardiology@gooddoc.app" },
    locations: ["Main Clinic - Floor 2", "Cardiac Care Unit"],
    metrics: { doctorsCount: 8, outpatientCount: 45, inpatientCount: 12, bedOccupancy: 85, avgWaitTime: 25 }
  },
  orthopedics: {
    id: "orthopedics",
    name: "Orthopedics",
    description: "Department focused on musculoskeletal system including bones, joints, ligaments, tendons, and muscles.",
    headDoctor: { id: "f3a4b5c6-d7e8-9012-f012-3456789abcde", name: "Dr. Aisha Khan" },
    contact: { phone: "+91 98XXX XXXXX", email: "orthopedics@gooddoc.app" },
    locations: ["Main Clinic - Floor 3", "Surgery Wing"],
    metrics: { doctorsCount: 6, outpatientCount: 38, inpatientCount: 8, bedOccupancy: 72, avgWaitTime: 30 }
  },
  neurology: {
    id: "neurology",
    name: "Neurology",
    description: "Department specializing in disorders of the nervous system including brain, spinal cord, and peripheral nerves.",
    headDoctor: { id: "a1b2c3d4-e5f6-7890-abcd-ef0123456789", name: "Dr. Meera Reddy" },
    contact: { phone: "+91 98XXX XXXXX", email: "neurology@gooddoc.app" },
    locations: ["Main Clinic - Floor 4"],
    metrics: { doctorsCount: 5, outpatientCount: 28, inpatientCount: 6, bedOccupancy: 68, avgWaitTime: 35 }
  },
  "general-medicine": {
    id: "general-medicine",
    name: "General Medicine",
    description: "Primary care department handling general health issues and preventive care.",
    headDoctor: { id: "7d3701be-8aad-4521-866f-3d2188061d04", name: "Dr. Vikram Singh" },
    contact: { phone: "+91 98XXX XXXXX", email: "general@gooddoc.app" },
    locations: ["Main Clinic - Floor 1", "OPD Block A"],
    metrics: { doctorsCount: 10, outpatientCount: 85, inpatientCount: 4, bedOccupancy: 45, avgWaitTime: 20 }
  },
  endocrinology: {
    id: "endocrinology",
    name: "Endocrinology",
    description: "Department specializing in hormonal disorders including diabetes, thyroid conditions, and metabolic diseases.",
    headDoctor: { id: "e2f3a4b5-c6d7-8901-ef01-23456789abcd", name: "Dr. Rahul Mehta" },
    contact: { phone: "+91 98XXX XXXXX", email: "endocrinology@gooddoc.app" },
    locations: ["Main Clinic - Floor 2"],
    metrics: { doctorsCount: 4, outpatientCount: 32, inpatientCount: 3, bedOccupancy: 55, avgWaitTime: 28 }
  },
  pediatrics: {
    id: "pediatrics",
    name: "Pediatrics",
    description: "Department dedicated to medical care of infants, children, and adolescents.",
    headDoctor: { id: "b2c3d4e5-f6a7-8901-bcde-f0123456789a", name: "Dr. Kavitha Menon" },
    contact: { phone: "+91 98XXX XXXXX", email: "pediatrics@gooddoc.app" },
    locations: ["Pediatric Wing - Floor 1"],
    metrics: { doctorsCount: 7, outpatientCount: 52, inpatientCount: 10, bedOccupancy: 78, avgWaitTime: 22 }
  },
};

// ID alias mapping to handle various formats
const DEPARTMENT_ID_ALIASES: Record<string, string> = {
  cardio: "cardiology",
  ortho: "orthopedics",
  neuro: "neurology",
  general: "general-medicine",
  "general medicine": "general-medicine",
  generalmedicine: "general-medicine",
  endo: "endocrinology",
  peds: "pediatrics",
  pedia: "pediatrics",
};

function resolveDepartmentId(id: string | undefined): string | undefined {
  if (!id) return undefined;
  const normalized = id.toLowerCase().replace(/\s+/g, '-');
  if (DEPARTMENTS_DATA[normalized]) return normalized;
  if (DEPARTMENT_ID_ALIASES[normalized]) return DEPARTMENT_ID_ALIASES[normalized];
  // Try partial match
  const keys = Object.keys(DEPARTMENTS_DATA);
  const match = keys.find(k => k.includes(normalized) || normalized.includes(k));
  return match || undefined;
}

// Mock doctors for department
const mockDepartmentDoctors = [
  { id: "DOC-001", name: "Dr. Priya Sharma", degrees: "MBBS, MD, DM", specialty: "Interventional Cardiology", avatar: null, availability: "Today 10:30 AM", languages: ["English", "Hindi"], nextSlot: "2025-12-17T10:30:00" },
  { id: "DOC-002", name: "Dr. Rajesh Kumar", degrees: "MBBS, MD", specialty: "Cardiac Imaging", avatar: null, availability: "Today 2:00 PM", languages: ["English", "Hindi", "Tamil"], nextSlot: "2025-12-17T14:00:00" },
  { id: "DOC-003", name: "Dr. Anita Desai", degrees: "MBBS, MD", specialty: "Electrophysiology", avatar: null, availability: "Tomorrow 9:00 AM", languages: ["English", "Marathi"], nextSlot: "2025-12-18T09:00:00" },
  { id: "DOC-004", name: "Dr. Sanjay Gupta", degrees: "MBBS, DNB", specialty: "Heart Failure", avatar: null, availability: "Tomorrow 11:00 AM", languages: ["English", "Hindi"], nextSlot: "2025-12-18T11:00:00" },
];

// Mock patients for department
const mockDepartmentPatients = [
  { id: "P-001", name: "Sarah Johnson", age: 45, gender: "F", status: "Outpatient", attendingDoctor: "Dr. Priya Sharma", room: null, acuity: "Low", lastVisit: "2025-12-17" },
  { id: "P-002", name: "Michael Chen", age: 38, gender: "M", status: "Outpatient", attendingDoctor: "Dr. Rajesh Kumar", room: null, acuity: "Medium", lastVisit: "2025-12-17" },
  { id: "P-003", name: "Priya Sharma", age: 52, gender: "F", status: "Inpatient", attendingDoctor: "Dr. Anita Desai", room: "CCU-101", acuity: "High", lastVisit: "2025-12-15" },
  { id: "P-004", name: "Amit Patel", age: 60, gender: "M", status: "Inpatient", attendingDoctor: "Dr. Priya Sharma", room: "CCU-102", acuity: "Critical", lastVisit: "2025-12-14" },
  { id: "P-005", name: "Lakshmi Iyer", age: 35, gender: "F", status: "Outpatient", attendingDoctor: "Dr. Sanjay Gupta", room: null, acuity: "Low", lastVisit: "2025-12-17" },
];

// Mock resources
const mockResources = [
  { id: "R-001", name: "CCU-101", type: "Bed", status: "Occupied", patient: "Priya Sharma" },
  { id: "R-002", name: "CCU-102", type: "Bed", status: "Occupied", patient: "Amit Patel" },
  { id: "R-003", name: "CCU-103", type: "Bed", status: "Available", patient: null },
  { id: "R-004", name: "CCU-104", type: "Bed", status: "Cleaning", patient: null },
  { id: "R-005", name: "Echo Machine 1", type: "Equipment", status: "Available", patient: null },
  { id: "R-006", name: "Echo Machine 2", type: "Equipment", status: "In Use", patient: "Michael Chen" },
  { id: "R-007", name: "Stress Test Room", type: "Room", status: "Available", patient: null },
];

const acuityStyles: Record<string, string> = {
  Low: "bg-green-100 text-green-700",
  Medium: "bg-amber-100 text-amber-700",
  High: "bg-orange-100 text-orange-700",
  Critical: "bg-red-100 text-red-700",
};

const statusStyles: Record<string, string> = {
  Outpatient: "bg-blue-100 text-blue-700",
  Inpatient: "bg-purple-100 text-purple-700",
};

const resourceStatusStyles: Record<string, string> = {
  Available: "bg-green-100 text-green-700",
  Occupied: "bg-blue-100 text-blue-700",
  "In Use": "bg-blue-100 text-blue-700",
  Cleaning: "bg-amber-100 text-amber-700",
  Reserved: "bg-purple-100 text-purple-700",
};

export default function DepartmentDetail() {
  const { departmentId } = useParams<{ departmentId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("doctors");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [patientStatusFilter, setPatientStatusFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  const resolvedId = resolveDepartmentId(departmentId);
  const department = resolvedId ? DEPARTMENTS_DATA[resolvedId] : null;

  if (!department) {
    return (
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <PageContent>
          <AppHeader breadcrumbs={["Departments", "Not Found"]} />
          <main className="p-6">
            <Card className="p-12 text-center">
              <h2 className="text-lg font-semibold mb-2">Department not found</h2>
              <p className="text-muted-foreground mb-4">The department you're looking for doesn't exist.</p>
              <Button onClick={() => navigate('/overview')}>Back to Overview</Button>
            </Card>
          </main>
        </PageContent>
      </div>
    );
  }

  const filteredDoctors = mockDepartmentDoctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
                          doc.specialty.toLowerCase().includes(doctorSearch.toLowerCase());
    const matchesAvailability = availabilityFilter === "all" || 
                                (availabilityFilter === "today" && doc.availability.includes("Today")) ||
                                (availabilityFilter === "tomorrow" && doc.availability.includes("Tomorrow"));
    return matchesSearch && matchesAvailability;
  });

  const filteredPatients = mockDepartmentPatients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
                          patient.id.toLowerCase().includes(patientSearch.toLowerCase());
    const matchesStatus = patientStatusFilter === "all" || patient.status === patientStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <PageContent>
        <AppHeader breadcrumbs={["Departments", department.name]} />
        
        <main className="p-6 space-y-6">
          {/* Back Button */}
          <Button variant="ghost" size="sm" onClick={() => navigate('/overview')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Overview
          </Button>

          {/* Department Header */}
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-semibold text-foreground">{department.name}</h1>
                <p className="text-muted-foreground mt-1 max-w-2xl">{department.description}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <span 
                    className="flex items-center gap-1 cursor-pointer hover:text-primary"
                    onClick={() => navigate(`/doctors/${department.headDoctor.id}`)}
                  >
                    <Users className="w-4 h-4" />
                    Head: <span className="hover:underline">{department.headDoctor.name}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {department.locations.join(", ")}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {department.contact.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {department.contact.email}
                  </span>
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-5 gap-4 mt-6">
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="text-2xl font-semibold text-foreground">{department.metrics.doctorsCount}</div>
                <div className="text-sm text-muted-foreground">Doctors</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="text-2xl font-semibold text-blue-700 dark:text-blue-400">{department.metrics.outpatientCount}</div>
                <div className="text-sm text-muted-foreground">Outpatients Today</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <div className="text-2xl font-semibold text-purple-700 dark:text-purple-400">{department.metrics.inpatientCount}</div>
                <div className="text-sm text-muted-foreground">Inpatients</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="text-2xl font-semibold text-green-700 dark:text-green-400">{department.metrics.bedOccupancy}%</div>
                <div className="text-sm text-muted-foreground">Bed Occupancy</div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                <div className="text-2xl font-semibold text-amber-700 dark:text-amber-400">{department.metrics.avgWaitTime} min</div>
                <div className="text-sm text-muted-foreground">Avg Wait Time</div>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 justify-start w-full">
              <TabsTrigger value="doctors" className="tab-trigger rounded-none border-b-0 data-[state=active]:bg-transparent px-4 py-3">
                Doctors
              </TabsTrigger>
              <TabsTrigger value="patients" className="tab-trigger rounded-none border-b-0 data-[state=active]:bg-transparent px-4 py-3">
                Patients
              </TabsTrigger>
              <TabsTrigger value="schedule" className="tab-trigger rounded-none border-b-0 data-[state=active]:bg-transparent px-4 py-3">
                Schedule
              </TabsTrigger>
              <TabsTrigger value="resources" className="tab-trigger rounded-none border-b-0 data-[state=active]:bg-transparent px-4 py-3">
                Resources
              </TabsTrigger>
            </TabsList>

            {/* Doctors Tab */}
            <TabsContent value="doctors" className="mt-6">
              <Card className="overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                  <h2 className="text-sm font-medium text-foreground">Doctor Roster ({filteredDoctors.length})</h2>
                  <div className="flex items-center gap-3">
                    <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                      <SelectTrigger className="w-[150px] h-9">
                        <SelectValue placeholder="Availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Availability</SelectItem>
                        <SelectItem value="today">Available Today</SelectItem>
                        <SelectItem value="tomorrow">Available Tomorrow</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search doctors..."
                        value={doctorSearch}
                        onChange={(e) => setDoctorSearch(e.target.value)}
                        className="pl-10 h-9"
                      />
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {filteredDoctors.map((doctor) => (
                    <div key={doctor.id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                      <div 
                        className="flex items-center gap-4 cursor-pointer"
                        onClick={() => navigate(`/doctors/${doctor.id}`)}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {doctor.name.split(" ").slice(1, 3).map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium text-foreground hover:underline">{doctor.name}</div>
                          <div className="text-xs text-muted-foreground">{doctor.specialty} • {doctor.degrees}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Languages</div>
                          <div className="text-sm text-foreground">{doctor.languages.join(", ")}</div>
                        </div>
                        <div className="text-right min-w-[120px]">
                          <div className="text-xs text-muted-foreground">Next Available</div>
                          <Badge variant={doctor.availability.includes("Today") ? "default" : "secondary"} className="mt-1">
                            {doctor.availability}
                          </Badge>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/book-appointment?doctorId=${doctor.id}&department=${departmentId}`);
                          }}
                        >
                          Book
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredDoctors.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                      No doctors found matching your criteria
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Patients Tab */}
            <TabsContent value="patients" className="mt-6">
              <Card className="overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                  <h2 className="text-sm font-medium text-foreground">Current Patients ({filteredPatients.length})</h2>
                  <div className="flex items-center gap-3">
                    <Select value={patientStatusFilter} onValueChange={setPatientStatusFilter}>
                      <SelectTrigger className="w-[140px] h-9">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Outpatient">Outpatient</SelectItem>
                        <SelectItem value="Inpatient">Inpatient</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search patients..."
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                        className="pl-10 h-9"
                      />
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {filteredPatients.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                      <div 
                        className="flex items-center gap-4 cursor-pointer"
                        onClick={() => navigate(`/patient-insights/${patient.id}?from=department`)}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={patient.gender === 'F' ? 'bg-pink-500 text-white' : 'bg-primary text-primary-foreground'}>
                            {patient.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium text-foreground hover:underline">{patient.name}</div>
                          <div className="text-xs text-muted-foreground">{patient.id} • {patient.age} | {patient.gender}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right min-w-[120px]">
                          <div className="text-xs text-muted-foreground">Attending Doctor</div>
                          <div className="text-sm text-foreground">{patient.attendingDoctor}</div>
                        </div>
                        {patient.room && (
                          <div className="text-right min-w-[80px]">
                            <div className="text-xs text-muted-foreground">Room</div>
                            <div className="text-sm text-foreground">{patient.room}</div>
                          </div>
                        )}
                        <Badge className={statusStyles[patient.status]}>{patient.status}</Badge>
                        <Badge className={acuityStyles[patient.acuity]}>{patient.acuity}</Badge>
                      </div>
                    </div>
                  ))}
                  {filteredPatients.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                      No patients found matching your criteria
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="mt-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-medium text-foreground">Department Schedule</h2>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      View Calendar
                    </Button>
                  </div>
                </div>
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Department schedule aggregation coming soon</p>
                  <p className="text-sm mt-2">View individual doctor schedules from the Doctors tab</p>
                </div>
              </Card>
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="mt-6">
              <Card className="overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30">
                  <h2 className="text-sm font-medium text-foreground">Department Resources</h2>
                </div>
                <div className="divide-y divide-border">
                  {mockResources.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          resource.type === 'Bed' ? 'bg-blue-100 text-blue-700' :
                          resource.type === 'Equipment' ? 'bg-purple-100 text-purple-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {resource.type === 'Bed' ? <Bed className="w-5 h-5" /> : 
                           resource.type === 'Equipment' ? <Clock className="w-5 h-5" /> :
                           <MapPin className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{resource.name}</div>
                          <div className="text-xs text-muted-foreground">{resource.type}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {resource.patient && (
                          <span 
                            className="text-sm text-foreground cursor-pointer hover:text-primary hover:underline"
                            onClick={() => navigate(`/patient-insights/${resource.patient?.split(' ')[0]}?from=department`)}
                          >
                            {resource.patient}
                          </span>
                        )}
                        <Badge className={resourceStatusStyles[resource.status]}>{resource.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </PageContent>
    </div>
  );
}
