import { useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { PageContent } from "@/components/PageContent";
import { BookingSteps } from "@/components/BookingSteps";
import { PatientSearchForm } from "@/components/PatientSearchForm";
import { PatientResultsList } from "@/components/PatientResultsList";
import { Button } from "@/components/ui/button";
import { generateVisitId } from "@/utils/visitId";
import { postToWorkflow } from "@/services/apiService";
import { authService } from "@/services/authService";
import { toast } from "sonner";

interface Patient {
  id: string;
  name: string;
  gdid: string;
  age: number;
  gender: string;
}

const API_ENDPOINT = "gdv2appointmentcreation6971bb5f38470";

const NewAppointment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fromSearch = searchParams.get("from") === "search";
  const patientSearchQuery = searchParams.get("q") || "";

  // When coming from Overview "IP Admission" button, we persist the flow type
  const flowType = location.state?.flowType; // "ip-admission"

  const handleBack = () => {
    if (fromSearch && patientSearchQuery) {
      navigate(`/patients/search?q=${patientSearchQuery}`);
    } else {
      navigate("/");
    }
  };

  const handleSearch = async (searchType: string, searchValue: string) => {
    let userEmail = localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail");
    let userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");

    if (!userEmail || !userId) {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        userEmail = currentUser.email || undefined;
        userId = currentUser.id?.toString() || undefined;
      }
    }

    if (!userEmail || !userId) {
      toast.error("User authentication required. Please login again.");
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        action: "getPatientList",
        email: userEmail,
        userId,
        searchParam: searchValue,
      };

      const { data, error } = await postToWorkflow<any>(API_ENDPOINT, payload);

      if (error) throw new Error(error);

      if (data && data[0] && data[0].Patients) {
        const patientsRaw = JSON.parse(data[0].Patients);
        const mappedData: Patient[] = patientsRaw.map((p: any) => ({
          id: p.Patient_GDID?.toString() || "",
          name: `${p.Name} ${p.Surname}`.trim(),
          gdid: `GDID - ${p.Patient_GDID}`,
          age: p.Age || 0,
          gender: p.Gender || "M",
        }));
        setSearchResults(mappedData);
        if (mappedData.length === 0) {
          toast.info("No patients found matching your search.");
        }
      } else {
        setSearchResults([]);
        toast.info("No patients found matching your search.");
      }
    } catch (err: any) {
      console.error("Failed to search patients:", err);
      toast.error(err.message || "Failed to search patients");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookAppointment = (patientId: string) => {
    const patient = searchResults.find(p => p.id === patientId);
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

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Searching for patients...</p>
              </div>
            ) : (
              <PatientResultsList
                patients={searchResults}
                onBookAppointment={handleBookAppointment}
                flowType={flowType}
              />
            )}

            {!isLoading && searchResults.length > 0 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Select a patient or create a new registration.
                </p>
                <Button onClick={handleCreateNewRegistration}>
                  Create New Registration
                </Button>
              </div>
            )}

            {!isLoading && searchResults.length === 0 && patientSearchQuery && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No patients found.</p>
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
