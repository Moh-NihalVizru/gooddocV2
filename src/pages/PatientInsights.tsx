import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { PageContent } from "@/components/PageContent";
import { Button } from "@/components/ui/button";
import { PatientChip } from "@/components/patient-insights/PatientChip";
import { BillingSummaryCards } from "@/components/patient-insights/BillingSummaryCards";
import { VisitDetailsTabs } from "@/components/patient-insights/VisitDetailsTabs";
import { VisitProvider, useVisit, VisitOption } from "@/contexts/VisitContext";
import { Visit } from "@/components/patient-insights/VisitListItem";

// Mock visits data
const mockVisits: Visit[] = [
  {
    id: "visit-1",
    visitId: "V25-001",
    datetime: new Date(2025, 7, 5, 17, 30),
    type: "Consultation",
    status: "Completed",
    location: "OPD Clinic 3",
    doctor: "Dr. Meera Nair – Cardiology",
    items: [
      {
        type: "Consultation",
        datetime: "05 Aug 2025 | 05:30 PM",
        doctor: "Dr. Meera Nair – Cardiology",
        visitId: "V25-001",
        provider: "Dr. Sarah Khan",
        department: "Internal Medicine",
        opdClinic: "OPD Clinic 3",
        prescriptions: [
          "Azithromycin 500 mg OD × 3 days",
          "Paracetamol 500 mg Q6h PRN",
          "Dextromethorphan syrup 10 mL HS × 5 days",
          "Azithromycin 500 mg OD × 3 days",
        ],
        findings: "Patient presents with symptoms suggestive of upper respiratory tract infection. Mild throat congestion and cough noted, with low-grade fever. No signs of respiratory distress or chest involvement. Overall condition stable.",
      },
    ],
  },
  {
    id: "visit-2",
    visitId: "V25-002",
    datetime: new Date(2025, 7, 5, 14, 15),
    type: "Laboratory",
    status: "Completed",
    location: "Central Diagnostic Lab",
    doctor: "Dr. Ravi Menon – Pathology",
    items: [
      {
        type: "Laboratory",
        datetime: "05 Aug 2025 | 02:15 PM",
        doctor: "Dr. Ravi Menon – Pathology",
        visitId: "V25-002",
        provider: "Central Diagnostic Lab",
        department: "Laboratory Services",
        testsOrdered: [
          "Complete Blood Count (CBC)",
          "C-Reactive Protein (CRP)",
        ],
        findings: "Blood samples collected for infection markers. CRP levels slightly elevated, consistent with acute infection. WBC count within acceptable range.",
      },
    ],
  },
  {
    id: "visit-3",
    visitId: "V25-003",
    datetime: new Date(2025, 7, 5, 15, 0),
    type: "Radiology",
    status: "Completed",
    location: "Imaging Suite 2",
    doctor: "Dr. Anjali Verma – Radiology",
    items: [
      {
        type: "Radiology",
        datetime: "05 Aug 2025 | 03:00 PM",
        doctor: "Dr. Anjali Verma – Radiology",
        visitId: "V25-003",
        provider: "Imaging Suite 2",
        department: "Radiology",
        investigations: [
          "Chest X-ray (PA View)",
          "Ultrasound Abdomen",
        ],
        findings: "Chest X-ray shows clear lung fields with no evidence of consolidation. Ultrasound abdomen reveals mild fatty liver changes. No structural abnormalities detected. Reports shared with referring physician for correlation.",
      },
    ],
  },
  {
    id: "visit-4",
    visitId: "V25-004",
    datetime: new Date(2025, 7, 7, 11, 0),
    type: "IPD Admission",
    status: "Active",
    location: "Inpatient Wing A",
    doctor: "Dr. Karthik Reddy – General Medicine",
    emergencyContact: "+91 98765 12345",
    items: [
      {
        type: "IPD Admission",
        datetime: "07 Aug 2025 | 11:00 AM",
        doctor: "Dr. Karthik Reddy – General Medicine",
        admissionId: "V25-004",
        admittingDiagnosis: "Acute Gastroenteritis",
        roomType: "Private Room – 204",
        provider: "Inpatient Wing A",
        department: "General Medicine",
        findings: "Patient admitted for IV fluid therapy and symptomatic management. Vital signs stable; mild dehydration noted on admission. Responding well to treatment. Daily monitoring of electrolytes and hydration status advised.",
      },
      {
        type: "Laboratory",
        datetime: "07 Aug 2025 | 01:00 PM",
        doctor: "Dr. Ravi Menon – Pathology",
        visitId: "V25-004",
        provider: "Central Diagnostic Lab",
        department: "Laboratory Services",
        testsOrdered: [
          "Electrolyte Panel",
          "Kidney Function Test",
        ],
        findings: "Electrolyte levels monitored for IV therapy adjustment. Sodium and potassium levels within normal range.",
      },
      {
        type: "Radiology",
        datetime: "07 Aug 2025 | 02:30 PM",
        doctor: "Dr. Anjali Verma – Radiology",
        visitId: "V25-004",
        provider: "Imaging Suite 2",
        department: "Radiology",
        investigations: [
          "Abdominal Ultrasound",
        ],
        findings: "Ultrasound shows no signs of acute pathology. Bowel loops appear normal with no obstruction.",
      },
    ],
  },
];

// Convert Visit to VisitOption for context
function toVisitOption(visit: Visit): VisitOption {
  return {
    id: visit.id,
    visitId: visit.visitId,
    datetime: visit.datetime,
    doctor: visit.doctor,
    status: visit.status,
    type: visit.type,
    isActive: visit.status === "Active",
  };
}

const PatientInsightsContent = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromPage = searchParams.get("from");
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "appointments");
  
  // Update tab when URL query param changes
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  
  const { setVisits, selectedVisit: selectedVisitOption, selectedVisitId, setIsLoading } = useVisit();

  // Determine if this is an IP or OP patient based on the source page
  const isIPPatient = fromPage === "ip-patients" || fromPage === "discharged" || fromPage === "emergency" || fromPage === "transfers";

  // Mapping for breadcrumb navigation based on source page
  const breadcrumbConfig: Record<string, { label: string; path: string }> = {
    "patients": { label: "Patients", path: "/patients" },
    "appointments": { label: "Appointments", path: "/" },
    "op-patients": { label: "OP Patients", path: "/patients/op" },
    "ip-patients": { label: "IP Patients", path: "/patients/ip" },
    "discharged": { label: "Discharged", path: "/patients/discharged" },
    "emergency": { label: "Emergency Cases", path: "/er/cases" },
    "surgeries": { label: "Surgeries", path: "/or/surgeries" },
    "pharmacy": { label: "Medicine Orders", path: "/pharmacy" },
    "transfers": { label: "Transfers", path: "/patients/transfers" },
    "check-in": { label: "Check-In", path: "/patients/check-in" },
    "overview": { label: "Overview", path: "/" },
    "doctors-on-duty": { label: "Doctors On Duty", path: "/doctors/on-duty" },
    "scheduled-today": { label: "Scheduled Today", path: "/schedule/today" },
    "lab-pending": { label: "Lab Pending", path: "/lab/pending" },
    "radiology-queue": { label: "Radiology Queue", path: "/radiology/queue" },
    "diagnostics": { label: "Diagnostics", path: "/diagnostics" },
  };

  const currentBreadcrumb = breadcrumbConfig[fromPage || ""] || { label: "Overview", path: "/" };

  // Mock patient data
  const patient = {
    name: "Harish Kalyan",
    gdid: "001",
    title: "Mr",
    age: 44,
    gender: "Male",
    dob: "10/04/1980",
    mobile: "+91 98765 43210",
    email: "name@example.com",
    bloodGroup: "O+",
    address: "Anna Nagar",
    pincode: "012 345",
    state: "Tamil Nadu",
    city: "Chennai",
    country: "India",
    billAmount: "9,800",
    advanceAmount: "3,200",
    collectedAmount: "6,400",
    balanceAmount: "3,400",
    insuranceProvider: "Star Health Insurance",
    insurancePolicyNumber: "POL-2024-78456123",
    insuranceValidFrom: "01/01/2024",
    insuranceValidTo: "31/12/2024",
    primaryDoctor: "Dr. Meera Nair",
    primaryDoctorDepartment: "Cardiology",
  };

  // Load visits into context on mount
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const visitOptions = mockVisits.map(toVisitOption);
      setVisits(visitOptions);
      setIsLoading(false);
    }, 100);
  }, [setVisits, setIsLoading]);

  // Find the full visit object for the selected visit
  // When "all" is selected, pass null to show all data
  const selectedVisit = selectedVisitOption && selectedVisitId !== "all"
    ? mockVisits.find(v => v.visitId === selectedVisitOption.visitId) || null
    : null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar />
      
      <PageContent className="flex flex-col overflow-hidden">
        <AppHeader breadcrumbs={[
          { 
            label: currentBreadcrumb.label, 
            onClick: () => navigate(currentBreadcrumb.path) 
          }, 
          "Patient Insight"
        ]} />
        
        {/* Fixed Header with Patient Info and Actions */}
        <div className="bg-primary flex-shrink-0 shadow-lg">
          <div className="px-6 py-5">
            {/* Top Row: Patient Info + KPIs */}
            <div className="flex items-start justify-between">
              {/* Patient Info Section with Action Buttons */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-6">
                  <PatientChip
                    name={patient.name}
                    gdid={patient.gdid}
                    age={patient.age}
                    gender={patient.gender}
                    showBackButton
                    backPath={currentBreadcrumb.path}
                    variant="light"
                    patientType={isIPPatient ? "IP" : "OP"}
                  />
                  <div className="border-l border-white/20 pl-5">
                    <p className="text-xs text-white">+91 98765 43210</p>
                    <p className="text-xs text-white mt-0.5">name@example.com</p>
                  </div>
                  <div className="border-l border-white/20 pl-5">
                    <p className="text-xs text-white/60">Primary Doctor</p>
                    <p className="text-xs text-white mt-0.5">{patient.primaryDoctor} – {patient.primaryDoctorDepartment}</p>
                  </div>
                </div>
                
                {/* Action Buttons - Above Visit Selector */}
                <div className="flex gap-1.5 mt-5">
                  <Button 
                    size="sm"
                    className="bg-white text-primary hover:bg-white/90 h-8 px-3 text-sm font-medium"
                    onClick={() => navigate(`/patient-insights/${patientId}/services${fromPage ? `?from=${fromPage}` : ''}`)}
                  >
                    Add Services
                  </Button>
                  {isIPPatient ? (
                    <>
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="text-white/90 hover:bg-white/15 hover:text-white h-8 px-3 text-sm"
                        onClick={() => navigate("/book-appointment", {
                          state: { 
                            fromPatientInsights: true, 
                            patientId,
                            patient: {
                              id: patientId,
                              name: patient.name,
                              gdid: patient.gdid,
                              age: patient.age,
                              gender: patient.gender === "Male" ? "M" : "F",
                            },
                            fromPage,
                          }
                        })}
                      >
                        Book Appointment
                      </Button>
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="text-white/90 hover:bg-white/15 hover:text-white h-8 px-3 text-sm"
                        onClick={() => navigate(`/patient-insights/${patientId}/transfer${fromPage ? `?from=${fromPage}` : ''}`)}
                      >
                        Bed Transfer
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-white/90 hover:bg-white/15 hover:text-white h-8 px-3 text-sm"
                        onClick={() => navigate(`/patient-insights/${patientId}/payments`)}
                      >
                        Collect Advance
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-white/90 hover:bg-white/15 hover:text-white h-8 px-3 text-sm"
                        onClick={() => navigate(`/patients/${patientId}/encounters/${selectedVisit?.visitId || 'E-001'}/discharge`)}
                      >
                        Discharge
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="text-white/90 hover:bg-white/15 hover:text-white h-8 px-3 text-sm"
                        onClick={() => navigate("/book-appointment", {
                          state: { 
                            fromPatientInsights: true, 
                            patientId,
                            patient: {
                              id: patientId,
                              name: patient.name,
                              gdid: patient.gdid,
                              age: patient.age,
                              gender: patient.gender === "Male" ? "M" : "F",
                            },
                            fromPage,
                          }
                        })}
                      >
                        Book Appointment
                      </Button>
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="text-white/90 hover:bg-white/15 hover:text-white h-8 px-3 text-sm"
                        onClick={() => navigate("/book-appointment", {
                          state: { 
                            fromPatientInsights: true, 
                            patientId,
                            patient: {
                              id: patientId,
                              name: patient.name,
                              gdid: patient.gdid,
                              age: patient.age,
                              gender: patient.gender === "Male" ? "M" : "F",
                            },
                            fromPage,
                            flowType: "ip-admission",
                          }
                        })}
                      >
                        IP Admission
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-white/90 hover:bg-white/15 hover:text-white h-8 px-3 text-sm"
                        onClick={() => navigate(`/patient-insights/${patientId}/payments`)}
                      >
                        Collect Advance
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Right: Billing Summary Cards */}
              <BillingSummaryCards
                billedAmount="₹10,000"
                unbilledAmount="₹2,000"
                totalDue="₹12,000"
                advanceAmount="₹3,000"
                collectedAmount="₹8,000"
                balanceAmount="₹4,000"
                patientId={patientId}
                patientName={patient.name}
                admissionId={selectedVisit?.visitId || "ADM-2026-001"}
                variant="light"
              />
            </div>

          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden min-h-0">
          <VisitDetailsTabs
            selectedVisit={selectedVisit}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            patient={patient}
            isIPPatient={isIPPatient}
          />
        </main>
      </PageContent>
    </div>
  );
};

const PatientInsights = () => {
  return (
    <VisitProvider>
      <PatientInsightsContent />
    </VisitProvider>
  );
};

export default PatientInsights;
