import { useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { PageContent } from "@/components/PageContent";
import { VisitHeader } from "@/components/timeline/VisitHeader";
import { HeatmapOverview } from "@/components/timeline/HeatmapOverview";
import { TimelineView } from "@/components/timeline/TimelineView";
import { PatientJourney } from "@/types/timeline";

const PatientTimeline = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const visitId = location.state?.visitId || "V25-004";

  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const timelineRef = useRef<{ scrollToDate: (date: string) => void }>(null);

  // Mock data from requirements
  const journeyData: PatientJourney = {
    visitId: visitId,
    status: "active",
    admissionDate: "2025-11-01",
    dischargeDate: null,
    patient: {
      name: "John Doe",
      mrn: "MRN-883920",
      age: 64,
      sex: "M",
    },
    events: [
      {
        id: "e1",
        date: "2025-11-01",
        time: "09:32",
        type: "Admission",
        title: "ER → Ward 3B",
        dept: "Admission",
        status: "Completed",
      },
      {
        id: "e2",
        date: "2025-11-02",
        time: "08:10",
        type: "Laboratory",
        title: "CBC + CMP",
        dept: "Lab",
        status: "Completed",
      },
      {
        id: "e3",
        date: "2025-11-02",
        time: "14:15",
        type: "Medication",
        title: "Ceftriaxone 1 g IV",
        dept: "Pharmacy",
        status: "Completed",
      },
      {
        id: "e4",
        date: "2025-11-03",
        time: "10:00",
        type: "Radiology",
        title: "Chest X‑ray",
        dept: "Radiology",
        status: "Completed",
      },
      {
        id: "e5",
        date: "2025-11-04",
        time: "16:00",
        type: "Observation",
        title: "Discharge planning meeting",
        dept: "Ward 3B",
        status: "Scheduled",
      },
    ],
  };

  const endDate = journeyData.dischargeDate || new Date().toISOString().split('T')[0];

  const handleDateClick = (date: string) => {
    // Scroll timeline to this date
    const dayElement = document.querySelector(`[data-date="${date}"]`);
    if (dayElement) {
      dayElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const handleDateRangeSelect = (startDate: string, endDate: string) => {
    // Set timeline viewport to this range
    const startElement = document.querySelector(`[data-date="${startDate}"]`);
    if (startElement) {
      startElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar />
      
      <PageContent className="flex flex-col overflow-hidden">
        <AppHeader breadcrumbs={["Appointments", "Patient Insights", "Timeline"]} />
        
        {/* Back Button */}
        <div className="px-6 py-6">
          <button
            onClick={() => navigate(`/patient-insights/${patientId}`)}
            className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="font-semibold">Patient Insights</span>
          </button>
        </div>

        {/* Visit Header */}
        <VisitHeader
          visitId={journeyData.visitId}
          status={journeyData.status}
          patient={journeyData.patient}
          onFilter={() => console.log("Filter clicked")}
          onAddEvent={() => console.log("Add event clicked")}
          onMarkDischarged={() => console.log("Mark discharged clicked")}
          onExport={() => console.log("Export clicked")}
        />

        {/* Heatmap Overview */}
        <HeatmapOverview
          events={journeyData.events}
          startDate={journeyData.admissionDate}
          endDate={endDate}
          onDateClick={handleDateClick}
          onDateRangeSelect={handleDateRangeSelect}
        />

        {/* Timeline */}
        <main className="flex-1 overflow-hidden">
          <TimelineView
            events={journeyData.events}
            startDate={journeyData.admissionDate}
            endDate={endDate}
            activeFilters={activeFilters}
            onFilterChange={setActiveFilters}
          />
        </main>
      </PageContent>
    </div>
  );
};

export default PatientTimeline;
