import { useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { PageContent } from "@/components/PageContent";
import { BookingSteps } from "@/components/BookingSteps";
import { PatientSearchForm } from "@/components/PatientSearchForm";
import { PatientResultsList } from "@/components/PatientResultsList";
import { Button } from "@/components/ui/button";
import { generateVisitId } from "@/utils/visitId";

// Mock data
const mockPatients = [
  {
    id: "1",
    name: "Harish Kalyan",
    gdid: "GDID - 001",
    age: 35,
    gender: "M",
  },
  {
    id: "2",
    name: "Sneha Reddy",
    gdid: "GDID - 004",
    age: 28,
    gender: "F",
  },
];

const NewAppointment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState<typeof mockPatients>([]);
  
  const fromSearch = searchParams.get("from") === "search";
  const patientSearchQuery = searchParams.get("q") || "";
  const patientIdFromSearch = searchParams.get("patientId");

  // When coming from Overview "IP Admission" button, we persist the flow type
  const flowType = location.state?.flowType; // "ip-admission"

  const handleBack = () => {
    if (fromSearch && patientSearchQuery) {
      navigate(`/patients/search?q=${patientSearchQuery}`);
    } else {
      navigate("/");
    }
  };

  const handleSearch = (searchType: string, searchValue: string) => {
    // Mock search - in real app, this would call an API
    setSearchResults(mockPatients);
  };

  const handleBookAppointment = (patientId: string) => {
    const patient = mockPatients.find(p => p.id === patientId);
    // Generate visit ID for new appointments (not from patient insights)
    const visitId = generateVisitId();
    navigate("/book-appointment", { state: { patient, visitId, fromSearch, patientSearchQuery, flowType } });
  };

  const handleCreateNewRegistration = () => {
    navigate("/registration");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      
      <PageContent>
        <AppHeader breadcrumbs={fromSearch ? [{ label: "Search Results", onClick: handleBack }, "Book Appointment"] : [{ label: "Overview", onClick: () => navigate("/") }, "New Appointment"]} />
        
        <main className="p-6">
          <div className="flex items-center justify-between h-10 mb-12">
            <div className="w-[130px]">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="font-semibold">{fromSearch ? "Search Results" : "Overview"}</span>
              </button>
            </div>

            <BookingSteps currentStep="search" />
            
            <div className="w-[130px]" />
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <PatientSearchForm onSearch={handleSearch} />
            
            <PatientResultsList
              patients={searchResults}
              onBookAppointment={handleBookAppointment}
              flowType={flowType}
            />

            {searchResults.length > 0 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Select a patient or create a new registration.
                </p>
                <Button onClick={handleCreateNewRegistration}>
                  Create New Registration
                </Button>
              </div>
            )}
          </div>
        </main>
      </PageContent>
    </div>
  );
};

export default NewAppointment;
