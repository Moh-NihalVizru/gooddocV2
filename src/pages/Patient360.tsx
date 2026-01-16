import { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { PageContent } from "@/components/PageContent";
import { PatientHeader } from "@/components/patient360/PatientHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ClinicalNotesStepper } from "@/components/patient360/ClinicalNotesStepper";
import { MedicalHistoryTimeline } from "@/components/patient360/MedicalHistoryTimeline";
import { PatientDetailsPanel } from "@/components/patient360/PatientDetailsPanel";
import { mockPatients, mockVitals, mockVisitHistory } from "@/data/patient360.mock";

export default function Patient360() {
  const { gdid } = useParams<{ gdid: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const defaultView = searchParams.get("view") || "clinical-notes";
  const fromPage = searchParams.get("from");
  
  const [activeTab, setActiveTab] = useState(defaultView);
  
  const breadcrumbs = fromPage === "patients" 
    ? [{ label: "Patients", onClick: () => navigate("/patients") }, "Patient 360"] 
    : [{ label: "Outpatient", onClick: () => navigate("/outpatient") }, "Patient 360"];

  const patient = mockPatients.find((p) => p.gdid === gdid);
  const vitals = patient ? mockVitals[patient.id] : undefined;
  const visitHistory = patient ? mockVisitHistory[patient.id] || [] : [];

  if (!patient) {
    return (
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <PageContent>
          <AppHeader breadcrumbs={breadcrumbs} />
          <main className="p-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Patient not found</p>
            </div>
          </main>
        </PageContent>
      </div>
    );
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ view: value });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <PageContent>
        <AppHeader breadcrumbs={breadcrumbs} />
        <main>
          <PatientHeader patient={patient} vitals={vitals} />
          
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 justify-start mb-6">
                <TabsTrigger value="clinical-notes" className="tab-trigger rounded-none border-b-0 data-[state=active]:bg-transparent px-4 py-3">
                  Clinical Notes
                </TabsTrigger>
                <TabsTrigger value="medical-history" className="tab-trigger rounded-none border-b-0 data-[state=active]:bg-transparent px-4 py-3">
                  Medical History
                </TabsTrigger>
                <TabsTrigger value="patient-details" className="tab-trigger rounded-none border-b-0 data-[state=active]:bg-transparent px-4 py-3">
                  Patient Details
                </TabsTrigger>
              </TabsList>

              <TabsContent value="clinical-notes">
                <ClinicalNotesStepper patient={patient} vitals={vitals} />
              </TabsContent>

              <TabsContent value="medical-history">
                <MedicalHistoryTimeline visits={visitHistory} />
              </TabsContent>

              <TabsContent value="patient-details">
                <PatientDetailsPanel patient={patient} vitals={vitals} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </PageContent>
    </div>
  );
}
