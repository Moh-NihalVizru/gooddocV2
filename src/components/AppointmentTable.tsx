import { useState } from "react";
import { User, UserRound, Phone, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TokenGenerationCard } from "./TokenGenerationCard";
import {
  AlertDialog,
  AlertDialogContent,
} from "@/components/ui/alert-dialog";
import {
  UnifiedAppointment,
  AppointmentType,
  getDoctorLabel,
  getDepartmentLabel,
  getDoctorValue,
  getDepartmentValue,
  categoryToType,
} from "@/types/appointment";

interface LegacyAppointment {
  id: string;
  date: string;
  category: string;
  patient: {
    name: string;
    id: string;
    age: number;
    gender: string;
    phone: string;
    email: string;
  };
  summary: string;
  specialty: string;
  department: string;
  doctor: string;
  serviceType: string;
  token: string;
  time: string;
  // New fields for provider roles
  referringDoctor?: { id: string; name: string; external?: boolean } | null;
  consultingDoctor?: { id: string; name: string } | null;
  performingDepartment?: { id: string; name: string } | null;
  reportingClinician?: { id: string; name: string } | null;
}

const allAppointments: LegacyAppointment[] = [
  // Outpatient Care
  {
    id: "1",
    date: "05 AUG 2025",
    category: "outpatient-care",
    patient: {
      name: "Harish Kalyan",
      id: "GDID - 001",
      age: 35,
      gender: "M",
      phone: "+91 98765 43210",
      email: "9876543210@gooddoc.app",
    },
    summary: "Patient complains of 2 days fever with tiredness. No other symptoms reported. Requesting general consultation for evaluation.",
    specialty: "Cardiology",
    department: "Cardiology",
    doctor: "Dr. Meera Nair",
    consultingDoctor: { id: "DR-001", name: "Dr. Meera Nair" },
    serviceType: "Consultation",
    token: "T-015",
    time: "10:30 AM",
  },
  {
    id: "5",
    date: "05 AUG 2025",
    category: "outpatient-care",
    patient: {
      name: "Priya Sharma",
      id: "GDID - 006",
      age: 42,
      gender: "F",
      phone: "+91 98765 43211",
      email: "9876543211@gooddoc.app",
    },
    summary: "Follow-up consultation for diabetes management. Patient has been on medication for 2 years. Blood sugar levels to be reviewed.",
    specialty: "Endocrinology",
    department: "Endocrinology",
    doctor: "Dr. Rajesh Kumar",
    consultingDoctor: { id: "DR-002", name: "Dr. Rajesh Kumar" },
    serviceType: "Follow-up",
    token: "T-016",
    time: "11:00 AM",
  },
  {
    id: "6",
    date: "05 AUG 2025",
    category: "outpatient-care",
    patient: {
      name: "Arun Patel",
      id: "GDID - 007",
      age: 55,
      gender: "M",
      phone: "+91 98765 43212",
      email: "9876543212@gooddoc.app",
    },
    summary: "Chronic back pain for 3 months, needs physiotherapy consultation. Previous treatments have not been effective.",
    specialty: "Orthopedics",
    department: "Orthopedics",
    doctor: "Dr. Anita Singh",
    consultingDoctor: { id: "DR-003", name: "Dr. Anita Singh" },
    serviceType: "Consultation",
    token: "T-017",
    time: "11:30 AM",
  },
  {
    id: "7",
    date: "05 AUG 2025",
    category: "outpatient-care",
    patient: {
      name: "Kavya Iyer",
      id: "GDID - 008",
      age: 29,
      gender: "F",
      phone: "+91 98765 43213",
      email: "9876543213@gooddoc.app",
    },
    summary: "Skin rash and allergic reaction appearing on arms and back. Started 3 days ago after changing detergent.",
    specialty: "Dermatology",
    department: "Dermatology",
    doctor: "Dr. Sunil Reddy",
    consultingDoctor: { id: "DR-004", name: "Dr. Sunil Reddy" },
    serviceType: "Consultation",
    token: "T-018",
    time: "12:00 PM",
  },
  // Inpatient Care
  {
    id: "2",
    date: "05 AUG 2025",
    category: "inpatient-care",
    patient: {
      name: "Sneha Reddy",
      id: "GDID - 004",
      age: 28,
      gender: "F",
      phone: "+91 98765 43210",
      email: "9876543210@gooddoc.app",
    },
    summary: "Scheduled cataract surgery. Pre-operative assessment completed. Patient cleared for surgery.",
    specialty: "Ophthalmology",
    department: "Ophthalmology",
    doctor: "Dr. A. Joseph",
    consultingDoctor: { id: "DR-005", name: "Dr. A. Joseph" },
    serviceType: "Surgery",
    token: "T-015",
    time: "10:30 AM",
  },
  {
    id: "8",
    date: "05 AUG 2025",
    category: "inpatient-care",
    patient: {
      name: "Ramesh Gupta",
      id: "GDID - 009",
      age: 60,
      gender: "M",
      phone: "+91 98765 43214",
      email: "9876543214@gooddoc.app",
    },
    summary: "Post-operative care - Hip replacement surgery completed yesterday. Monitoring recovery progress.",
    specialty: "Orthopedics Ward",
    department: "Orthopedics",
    doctor: "Dr. Prakash Nair",
    consultingDoctor: { id: "DR-006", name: "Dr. Prakash Nair" },
    serviceType: "Post-Op Care",
    token: "T-019",
    time: "09:00 AM",
  },
  {
    id: "9",
    date: "05 AUG 2025",
    category: "inpatient-care",
    patient: {
      name: "Lakshmi Venkat",
      id: "GDID - 010",
      age: 45,
      gender: "F",
      phone: "+91 98765 43215",
      email: "9876543215@gooddoc.app",
    },
    summary: "Recovery from pneumonia, on IV antibiotics. Condition improving steadily over past 48 hours.",
    specialty: "General Medicine",
    department: "General Medicine",
    doctor: "Dr. Meera Nair",
    consultingDoctor: { id: "DR-001", name: "Dr. Meera Nair" },
    serviceType: "Admission",
    token: "T-020",
    time: "02:00 PM",
  },
  {
    id: "10",
    date: "05 AUG 2025",
    category: "inpatient-care",
    patient: {
      name: "Sanjay Kumar",
      id: "GDID - 011",
      age: 52,
      gender: "M",
      phone: "+91 98765 43216",
      email: "9876543216@gooddoc.app",
    },
    summary: "Cardiac monitoring post angioplasty. Two stents placed. Vital signs stable.",
    specialty: "Cardiology Ward",
    department: "Cardiology",
    doctor: "Dr. Rajesh Kumar",
    consultingDoctor: { id: "DR-002", name: "Dr. Rajesh Kumar" },
    serviceType: "Post-Op Care",
    token: "T-021",
    time: "03:30 PM",
  },
  // Diagnostics - with proper provider roles
  {
    id: "3",
    date: "05 AUG 2025",
    category: "diagnostics",
    patient: {
      name: "Divya Menon",
      id: "GDID - 002",
      age: 30,
      gender: "F",
      phone: "+91 98765 43210",
      email: "9876543210@gooddoc.app",
    },
    summary: "Chest pain – referred for ECG. Doctor suspects possible cardiac abnormality. Urgent assessment required.",
    specialty: "ECG Room 2",
    department: "Cardiology",
    doctor: "Dr. Meera Nair", // Legacy field
    referringDoctor: { id: "DR-001", name: "Dr. Meera Nair" },
    performingDepartment: { id: "DEPT-CARDIO-DIAG", name: "Cardiology Diagnostics Unit" },
    serviceType: "ECG",
    token: "T-015",
    time: "10:30 AM",
  },
  {
    id: "11",
    date: "05 AUG 2025",
    category: "diagnostics",
    patient: {
      name: "Mohan Krishna",
      id: "GDID - 012",
      age: 38,
      gender: "M",
      phone: "+91 98765 43217",
      email: "9876543217@gooddoc.app",
    },
    summary: "Abdominal ultrasound for suspected gallstones. Patient reports recurring pain after meals.",
    specialty: "Ultrasound Room 1",
    department: "Radiology",
    doctor: "Dr. Anita Singh", // Legacy field
    referringDoctor: { id: "DR-003", name: "Dr. Anita Singh" },
    performingDepartment: { id: "DEPT-RAD", name: "Radiology Dept" },
    serviceType: "Ultrasound",
    token: "T-022",
    time: "01:00 PM",
  },
  {
    id: "12",
    date: "05 AUG 2025",
    category: "diagnostics",
    patient: {
      name: "Anjali Desai",
      id: "GDID - 013",
      age: 33,
      gender: "F",
      phone: "+91 98765 43218",
      email: "9876543218@gooddoc.app",
    },
    summary: "MRI scan for persistent headaches lasting over 2 weeks. CT scan was inconclusive. Neurologist referral.",
    specialty: "MRI Lab",
    department: "Radiology",
    doctor: "Radiology Dept", // Legacy - no referring doctor
    referringDoctor: null, // Self-requested
    performingDepartment: { id: "DEPT-RAD", name: "Radiology Dept" },
    reportingClinician: null, // Unassigned until verified
    serviceType: "MRI",
    token: "T-023",
    time: "02:30 PM",
  },
  {
    id: "13",
    date: "05 AUG 2025",
    category: "diagnostics",
    patient: {
      name: "Ravi Bhat",
      id: "GDID - 014",
      age: 47,
      gender: "M",
      phone: "+91 98765 43219",
      email: "9876543219@gooddoc.app",
    },
    summary: "Blood tests - Complete Blood Count and Lipid Profile. Annual health checkup requirement.",
    specialty: "Lab Room 3",
    department: "Laboratory",
    doctor: "Laboratory Dept", // Legacy
    referringDoctor: null, // Self-requested
    performingDepartment: { id: "DEPT-LAB", name: "Laboratory Dept" },
    serviceType: "CBC, Lipid Profile",
    token: "T-024",
    time: "09:30 AM",
  },
  // Emergency
  {
    id: "4",
    date: "05 AUG 2025",
    category: "emergency",
    patient: {
      name: "Vikram Singh",
      id: "GDID - 005",
      age: 40,
      gender: "M",
      phone: "+91 98765 43210",
      email: "9876543210@gooddoc.app",
    },
    summary: "Accident injury – bleeding in leg. Road traffic accident victim brought in by ambulance.",
    specialty: "Emergency Surgery Team",
    department: "Emergency",
    doctor: "ICU",
    consultingDoctor: { id: "ICU", name: "ICU Team" },
    serviceType: "Emergency",
    token: "T-015",
    time: "10:30 AM",
  },
  {
    id: "14",
    date: "05 AUG 2025",
    category: "emergency",
    patient: {
      name: "Meena Pillai",
      id: "GDID - 015",
      age: 65,
      gender: "F",
      phone: "+91 98765 43220",
      email: "9876543220@gooddoc.app",
    },
    summary: "Severe chest pain, suspected heart attack. ECG shows ST elevation. Urgent intervention needed.",
    specialty: "Emergency Cardiology",
    department: "Emergency",
    doctor: "Dr. Meera Nair",
    consultingDoctor: { id: "DR-001", name: "Dr. Meera Nair" },
    serviceType: "Emergency",
    token: "T-025",
    time: "08:15 AM",
  },
  {
    id: "15",
    date: "05 AUG 2025",
    category: "emergency",
    patient: {
      name: "Suresh Nambiar",
      id: "GDID - 016",
      age: 48,
      gender: "M",
      phone: "+91 98765 43221",
      email: "9876543221@gooddoc.app",
    },
    summary: "High fever and seizures, needs immediate attention. No prior history of epilepsy. Possible infection.",
    specialty: "Emergency Neurology",
    department: "Emergency",
    doctor: "ICU",
    consultingDoctor: { id: "ICU", name: "ICU Team" },
    serviceType: "Emergency",
    token: "T-026",
    time: "07:45 AM",
  },
  {
    id: "16",
    date: "05 AUG 2025",
    category: "emergency",
    patient: {
      name: "Deepa Thomas",
      id: "GDID - 017",
      age: 31,
      gender: "F",
      phone: "+91 98765 43222",
      email: "9876543222@gooddoc.app",
    },
    summary: "Severe allergic reaction to medication. Anaphylaxis symptoms present. Adrenaline administered.",
    specialty: "Emergency Medicine",
    department: "Emergency",
    doctor: "Dr. Sunil Reddy",
    consultingDoctor: { id: "DR-004", name: "Dr. Sunil Reddy" },
    serviceType: "Emergency",
    token: "T-027",
    time: "11:45 AM",
  },
];

interface AppointmentTableProps {
  category?: string;
  searchQuery?: string;
  doctorFilter?: string;
  specialtyFilter?: string;
}

export function AppointmentTable({ 
  category = "outpatient-care",
  searchQuery = "",
  doctorFilter = "all",
  specialtyFilter = "all"
}: AppointmentTableProps) {
  const navigate = useNavigate();
  const [checkedInIds, setCheckedInIds] = useState<Set<string>>(new Set());
  const [tokenGeneratedIds, setTokenGeneratedIds] = useState<Set<string>>(new Set());
  const [activeTokenCard, setActiveTokenCard] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAppointmentId, setPendingAppointmentId] = useState<string | null>(null);
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
  
  // Determine if this is a diagnostics view
  const isDiagnosticsCategory = category === "diagnostics";
  const isOutpatientCare = category === "outpatient-care";
  const appointmentType: AppointmentType = categoryToType(category);
  
  const appointments = allAppointments.filter(apt => {
    const matchesCategory = apt.category === category;
    const matchesSearch = !searchQuery || 
      apt.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.summary.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Provider filter - search across all provider roles
    let matchesProvider = doctorFilter === "all";
    if (!matchesProvider) {
      const consultingMatch = apt.consultingDoctor?.name === doctorFilter;
      const referringMatch = apt.referringDoctor?.name === doctorFilter;
      const reportingMatch = apt.reportingClinician?.name === doctorFilter;
      const legacyMatch = apt.doctor === doctorFilter;
      matchesProvider = consultingMatch || referringMatch || reportingMatch || legacyMatch;
    }
    
    // Department filter - includes performing department
    let matchesDepartment = specialtyFilter === "all";
    if (!matchesDepartment) {
      const deptMatch = apt.department === specialtyFilter;
      const perfDeptMatch = apt.performingDepartment?.name === specialtyFilter;
      const specialtyMatch = apt.specialty === specialtyFilter;
      matchesDepartment = deptMatch || perfDeptMatch || specialtyMatch;
    }
    
    return matchesCategory && matchesSearch && matchesProvider && matchesDepartment;
  });
  
  const handleCheckInClick = (appointmentId: string) => {
    setPendingAppointmentId(appointmentId);
    setConfirmDialogOpen(true);
  };

  const handleConfirmCheckIn = () => {
    if (pendingAppointmentId) {
      setCheckedInIds(prev => new Set(prev).add(pendingAppointmentId));
      setActiveTokenCard(pendingAppointmentId);
      setPendingAppointmentId(null);
    }
    setConfirmDialogOpen(false);
  };

  const handleTokenGenerationComplete = (appointmentId: string) => {
    setTokenGeneratedIds(prev => new Set(prev).add(appointmentId));
    setActiveTokenCard(null);
  };

  // Helper to get the doctor/provider display value
  const getProviderDisplay = (apt: LegacyAppointment): string => {
    if (isDiagnosticsCategory) {
      if (apt.referringDoctor) {
        return apt.referringDoctor.external 
          ? `External: ${apt.referringDoctor.name}`
          : apt.referringDoctor.name;
      }
      return "Self";
    }
    return apt.consultingDoctor?.name || apt.doctor || "—";
  };

  // Helper to get the department display value
  const getDeptDisplay = (apt: LegacyAppointment): string => {
    if (isDiagnosticsCategory) {
      if (apt.performingDepartment?.name) {
        return apt.performingDepartment.name;
      }
      // Fallback based on service type
      if (apt.serviceType === "MRI" || apt.serviceType === "Ultrasound" || apt.serviceType === "X-Ray") {
        return "Radiology Team";
      }
      if (apt.department === "Laboratory" || apt.serviceType.includes("CBC") || apt.serviceType.includes("Lipid")) {
        return "Laboratory Team";
      }
      return apt.department || "—";
    }
    return apt.department || "—";
  };

  // Column headers - simplified
  const doctorColumnLabel = "Doctor";
  const deptColumnLabel = "Department";

  const gridClasses = isOutpatientCare 
    ? "grid grid-cols-[1.5fr_1.5fr_1fr_1fr_0.8fr_1fr_1.2fr] gap-4 px-4 w-full"
    : "grid grid-cols-[1.5fr_1.5fr_1.2fr_1.2fr_1fr_0.8fr] gap-4 px-4 w-full";

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden w-full">
      {/* Table Header */}
      <div className={`${gridClasses} py-4 border-b border-border bg-muted/30`}>
        <div className="text-xs font-medium text-muted-foreground text-left">Patient Info</div>
        <div className="text-xs font-medium text-muted-foreground text-left">Contact Details</div>
        <div className="text-xs font-medium text-muted-foreground text-left">{doctorColumnLabel}</div>
        <div className="text-xs font-medium text-muted-foreground text-left">{deptColumnLabel}</div>
        <div className="text-xs font-medium text-muted-foreground text-left">Service Type</div>
        {isOutpatientCare && (
          <div className="text-xs font-medium text-muted-foreground text-left">Token & Time</div>
        )}
        <div className="text-xs font-medium text-muted-foreground text-left">Action</div>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No appointments found
        </div>
      ) : (
        appointments.map((appointment) => (
          <div key={appointment.id} className="border-b border-border last:border-b-0">
            {/* Main Row */}
            <div 
              className={`${gridClasses} py-4 items-center hover:bg-muted/20 transition-colors cursor-pointer`}
              onClick={() => toggleRowExpansion(appointment.id)}
            >
              {/* Patient Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  appointment.patient.gender.toLowerCase().startsWith('f') 
                    ? 'bg-pink-500' 
                    : 'bg-primary'
                }`}>
                  {appointment.patient.gender.toLowerCase().startsWith('f') ? (
                    <UserRound className="w-5 h-5 text-primary-foreground" />
                  ) : (
                    <User className="w-5 h-5 text-primary-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {appointment.patient.name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {appointment.patient.id} • {appointment.patient.age} | {appointment.patient.gender}
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-foreground">
                  <Phone className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{appointment.patient.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground">
                  <Mail className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{appointment.patient.email}</span>
                </div>
              </div>

              {/* Doctor/Provider - Context-aware */}
              <div className="text-sm text-foreground min-w-0 truncate">
                {getProviderDisplay(appointment)}
              </div>

              {/* Department - Context-aware */}
              <div className="text-sm text-foreground min-w-0 truncate">
                {getDeptDisplay(appointment)}
              </div>

              {/* Service Type */}
              <div className="text-sm text-foreground min-w-0 truncate">
                {appointment.serviceType}
              </div>

              {/* Token & Time - Only for Outpatient */}
              {isOutpatientCare && (
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <Badge 
                    className={
                      tokenGeneratedIds.has(appointment.id) || checkedInIds.has(appointment.id)
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                    }
                  >
                    {tokenGeneratedIds.has(appointment.id) ? appointment.token : "Pending"}
                  </Badge>
                  <span className="text-sm text-foreground">{appointment.time}</span>
                </div>
              )}

              {/* Action */}
              <div className="flex justify-start gap-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  onClick={() => navigate(`/patient-insights/${appointment.patient.id.replace('GDID - ', '')}`)}
                  variant="default"
                  size="sm"
                >
                  Patient Insight
                </Button>
                {isOutpatientCare && (
                  <Button
                    onClick={() => handleCheckInClick(appointment.id)}
                    variant="outline"
                    size="sm"
                    disabled={checkedInIds.has(appointment.id)}
                  >
                    {checkedInIds.has(appointment.id) ? "Checked In" : "Check In"}
                  </Button>
                )}
              </div>
            </div>

            {/* Appointment Summary Row - Collapsible with Animation */}
            <div 
              className={`overflow-hidden transition-all duration-300 ease-out ${
                expandedRows.has(appointment.id) ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              {appointment.summary && (
                <div className="px-4 pb-4 pt-0">
                  <div className="border-t border-border pt-4">
                    <div className="space-y-1">
                      <div className="text-[12px] font-medium text-muted-foreground">Appointment Summary</div>
                      <div className="text-sm text-foreground">{appointment.summary}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))
      )}

      {activeTokenCard && (() => {
        const appointment = appointments.find(apt => apt.id === activeTokenCard);
        return appointment ? (
          <TokenGenerationCard
            token={appointment.token}
            patientName={appointment.patient.name}
            specialty={appointment.specialty}
            doctor={getProviderDisplay(appointment)}
            time={appointment.time}
            onComplete={() => handleTokenGenerationComplete(activeTokenCard)}
          />
        ) : null;
      })()}

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent className="w-[320px] p-0 gap-0 fixed bottom-6 right-6 top-auto left-auto translate-x-0 translate-y-0">
          <div className="p-4 space-y-3">
            <h3 className="text-base font-semibold text-foreground">Confirm to Generate Token</h3>
            
            {pendingAppointmentId && (() => {
              const appointment = appointments.find(apt => apt.id === pendingAppointmentId);
              return appointment ? (
                <>
                  <div className="text-center py-2">
                    <div className="text-2xl font-semibold text-primary">
                      Pending
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{appointment.patient.name}</div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{doctorColumnLabel}:</span>
                      <span className="text-foreground font-medium">{getProviderDisplay(appointment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{deptColumnLabel}:</span>
                      <span className="text-foreground font-medium">{getDeptDisplay(appointment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="text-foreground font-medium">{appointment.time}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button 
                      onClick={handleConfirmCheckIn} 
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Confirm Check In
                    </Button>
                  </div>
                </>
              ) : null;
            })()}
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
