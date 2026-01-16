import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { PageContent } from "@/components/PageContent";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CalendarWidget } from "@/components/CalendarWidget";
import { User, UserRound, Phone, Mail, Search } from "lucide-react";
import { mockAppointments } from "@/data/patient360.mock";
import { Appointment } from "@/types/patient360";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function OutpatientAppointments() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "scheduled";
  
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [providerFilter, setProviderFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [vitalsFilter, setVitalsFilter] = useState("all");
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

  // Get unique doctors and departments for filter options
  const filterOptions = useMemo(() => {
    const doctors = [...new Set(mockAppointments.map(apt => apt.doctorName).filter(Boolean))];
    const departments = [...new Set(mockAppointments.map(apt => apt.department).filter(Boolean))];
    return { doctors, departments };
  }, []);

  const filterAppointments = (appointments: Appointment[]) => {
    return appointments.filter((apt) => {
      const matchesSearch = !searchQuery || 
        apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.gdid.includes(searchQuery) ||
        apt.chiefComplaint?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.type.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesProvider = providerFilter === "all" || apt.doctorName === providerFilter;
      const matchesDepartment = departmentFilter === "all" || apt.department === departmentFilter;
      const matchesVitals = vitalsFilter === "all" || 
        (vitalsFilter === "completed" && apt.vitalsPreview) ||
        (vitalsFilter === "pending" && !apt.vitalsPreview);
      
      return matchesSearch && matchesProvider && matchesDepartment && matchesVitals;
    });
  };

  const scheduledAppointments = filterAppointments(
    mockAppointments.filter(
      (apt) => apt.status === "Scheduled" || apt.status === "InProgress"
    )
  );
  
  const visitedAppointments = filterAppointments(
    mockAppointments.filter(
      (apt) => apt.status === "Visited"
    )
  );

  const handlePatient360Click = (appointment: Appointment) => {
    navigate(`/patients/${appointment.gdid}/360`);
  };

  const gridClasses = "grid grid-cols-[1.5fr_1.5fr_1fr_1fr_0.8fr_0.7fr_1fr_0.7fr] gap-4 px-4 py-4 w-full";

  const renderAppointmentCard = (appointment: Appointment) => {
    const isExpanded = expandedRows.has(appointment.id);
    
    return (
      <div key={appointment.id} className="border-b border-border last:border-b-0">
        {/* Main Row */}
        <div 
          className={`${gridClasses} items-center hover:bg-muted/20 transition-colors cursor-pointer`}
          onClick={() => toggleRowExpansion(appointment.id)}
        >
          {/* Patient Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              appointment.sex?.toLowerCase().startsWith('f') 
                ? 'bg-pink-500' 
                : 'bg-primary'
            }`}>
              {appointment.sex?.toLowerCase().startsWith('f') ? (
                <UserRound className="w-5 h-5 text-primary-foreground" />
              ) : (
                <User className="w-5 h-5 text-primary-foreground" />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {appointment.patientName}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                GDID - {appointment.gdid} • {appointment.age} | {appointment.sex}
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-foreground">
              <Phone className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{appointment.phone || "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{appointment.email || "—"}</span>
            </div>
          </div>

          {/* Consulting Doctor */}
          <div className="text-sm text-foreground min-w-0 truncate">
            {appointment.doctorName || "—"}
          </div>

          {/* Department */}
          <div className="text-sm text-foreground min-w-0 truncate">
            {appointment.department || "—"}
          </div>

          {/* Consultation Type */}
          <div className="text-sm text-foreground min-w-0 truncate">
            {appointment.type === "New" ? "First Visit" : "Follow-up"}
          </div>

          {/* Vitals Status */}
          <div>
            <Badge 
              className={
                appointment.vitalsPreview 
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
              }
            >
              {appointment.vitalsPreview ? "Completed" : "Pending"}
            </Badge>
          </div>

          {/* Token & Time */}
          <div className="text-sm text-foreground whitespace-nowrap">
            {appointment.token} | {appointment.time} AM
          </div>

          {/* Action - Patient 360 */}
          <div className="flex justify-start" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="default"
              size="sm"
              onClick={() => handlePatient360Click(appointment)}
            >
              Patient 360
            </Button>
          </div>
        </div>

        {/* Appointment Summary Row - Collapsible with Animation */}
        <div 
          className={`overflow-hidden transition-all duration-300 ease-out ${
            isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {appointment.chiefComplaint && (
            <div className="px-4 pb-4 pt-0">
              <div className="border-t border-border pt-4">
                <div className="space-y-1">
                  <div className="text-[12px] font-medium text-muted-foreground">Appointment Summary</div>
                  <div className="text-sm text-foreground">{appointment.chiefComplaint}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <PageContent>
        <AppHeader breadcrumbs={["Outpatient"]} />
        <main className="p-6">
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-foreground">Today's Appointments</h1>
              <CalendarWidget pageKey="appointment-request" />
            </div>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 justify-start">
                <TabsTrigger
                  value="scheduled"
                  className="tab-trigger rounded-none border-b-0 data-[state=active]:bg-transparent px-4 py-3"
                >
                  Scheduled
                </TabsTrigger>
                <TabsTrigger
                  value="visited"
                  className="tab-trigger rounded-none border-b-0 data-[state=active]:bg-transparent px-4 py-3"
                >
                  Visited
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-3">
                <Select value={providerFilter} onValueChange={setProviderFilter}>
                  <SelectTrigger className="w-[160px] h-9">
                    <SelectValue placeholder="All Providers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Providers</SelectItem>
                    {filterOptions.doctors.map((doctor) => (
                      <SelectItem key={doctor} value={doctor!}>{doctor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-[160px] h-9">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {filterOptions.departments.map((dept) => (
                      <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={vitalsFilter} onValueChange={setVitalsFilter}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Vitals Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vitals</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient name, GDID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9"
                  />
                </div>
              </div>
            </div>

            <TabsContent value="scheduled">
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className={`${gridClasses} border-b border-border bg-muted/30`}>
                  <div className="text-xs font-medium text-muted-foreground uppercase">PATIENT INFO</div>
                  <div className="text-xs font-medium text-muted-foreground uppercase">CONTACT DETAILS</div>
                  <div className="text-xs font-medium text-muted-foreground uppercase">CONSULTING DOCTOR</div>
                  <div className="text-xs font-medium text-muted-foreground uppercase">DEPARTMENT</div>
                  <div className="text-xs font-medium text-muted-foreground uppercase">CONSULTATION TYPE</div>
                  <div className="text-xs font-medium text-muted-foreground uppercase">VITALS STATUS</div>
                  <div className="text-xs font-medium text-muted-foreground uppercase">TOKEN & TIME</div>
                  <div className="text-xs font-medium text-muted-foreground uppercase">ACTION</div>
                </div>
                {scheduledAppointments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    {searchQuery ? "No appointments found matching your search" : "No scheduled appointments for today"}
                  </div>
                ) : (
                  scheduledAppointments.map(renderAppointmentCard)
                )}
              </div>
            </TabsContent>

            <TabsContent value="visited">
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className={`${gridClasses} border-b border-border bg-muted/30`}>
                  <div className="text-xs font-medium text-muted-foreground uppercase">PATIENT INFO</div>
                  <div className="text-xs font-medium text-muted-foreground uppercase">CONTACT DETAILS</div>
                  <div className="text-xs font-medium text-muted-foreground uppercase">CONSULTING DOCTOR</div>
                  <div className="text-xs font-medium text-muted-foreground uppercase">DEPARTMENT</div>
                  <div className="text-xs font-medium text-muted-foreground uppercase">CONSULTATION TYPE</div>
                  <div className="text-xs font-medium text-muted-foreground uppercase">VITALS STATUS</div>
                  <div className="text-xs font-medium text-muted-foreground uppercase">TOKEN & TIME</div>
                  <div className="text-xs font-medium text-muted-foreground uppercase">ACTION</div>
                </div>
                {visitedAppointments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    {searchQuery ? "No appointments found matching your search" : "No visited appointments yet"}
                  </div>
                ) : (
                  visitedAppointments.map(renderAppointmentCard)
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </PageContent>
    </div>
  );
}
