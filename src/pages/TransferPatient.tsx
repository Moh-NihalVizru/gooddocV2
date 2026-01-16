import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, MapPin, User } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { PageContent } from "@/components/PageContent";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TransferDetailsStep } from "@/components/transfer/steps/TransferDetailsStep";
import { TransferRequest, Bed, TransferTimelineEvent } from "@/types/transfer";
import { createBedChargeFromTransfer } from "@/data/pending-bed-charges.mock";

const TransferPatient = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromPage = searchParams.get("from");
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBed, setSelectedBed] = useState<Bed | undefined>();

  // Mock patient data
  const patient = {
    name: "Harish Kalyan",
    gdid: "001",
    age: 44,
    gender: "Male",
    mrn: "MRN0100000",
    currentLocation: {
      unitId: "unit-ward-a",
      unitName: "Ward A",
      roomId: "room-wa-102",
      roomName: "Room 102",
      bedId: "bed-wa-3",
      bedName: "WA-102-1",
    },
    currentTariff: 3500,
    admissionStatus: "Admitted",
    admissionDate: "2025-12-18T10:00:00", // Added for bed charge calculation
  };

  const [transferData, setTransferData] = useState<Partial<TransferRequest>>({
    patientId: patientId,
    patientName: patient.name,
    fromLocation: patient.currentLocation,
    transferType: undefined,
    priority: "routine",
    reason: undefined,
    scheduleType: "now",
    notes: "",
    orderingClinician: "",
    insurancePreAuthRequired: false,
    checklist: [],
    attachments: [],
    status: "draft",
    timeline: [],
  });

  // Update insurance requirement when transfer type changes
  useEffect(() => {
    if (transferData.transferType) {
      setTransferData((prev) => ({
        ...prev,
        insurancePreAuthRequired: transferData.transferType === "ward_to_icu",
      }));
    }
  }, [transferData.transferType]);

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("Auto-saving draft...", transferData);
    }, 2000);
    return () => clearTimeout(timer);
  }, [transferData]);

  const handleDataChange = (updates: Partial<TransferRequest>) => {
    setTransferData((prev) => ({ ...prev, ...updates }));
  };

  const handleSelectBed = (bed: Bed) => {
    setSelectedBed(bed);
    toast({
      title: `Bed ${bed.bedName} selected`,
      description: `${bed.unitName} • ${bed.roomName}`,
    });
  };

  const handleConfirm = async () => {
    if (!selectedBed) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const transferId = `TR-${Date.now().toString().slice(-6)}`;
    const isScheduledForFuture = transferData.scheduledAt && transferData.scheduledAt > new Date();
    
    // Create bed charge entry for the old bed based on days stayed
    createBedChargeFromTransfer(
      patientId || '',
      patient.currentLocation.bedId,
      patient.currentLocation.bedName,
      patient.currentLocation.roomName,
      patient.currentLocation.unitName,
      patient.currentTariff,
      selectedBed.id,
      selectedBed.bedName,
      selectedBed.roomName,
      selectedBed.unitName,
      selectedBed.tariff,
      patient.admissionDate,
      transferId
    );
    
    toast({
      title: isScheduledForFuture ? "Transfer scheduled" : "Transfer completed",
      description: isScheduledForFuture 
        ? `Transfer ID: ${transferId}. Scheduled for ${transferData.scheduledAt?.toLocaleString()}.`
        : `Transfer ID: ${transferId}. Bed charges added to pending services.`,
    });
    
    // Navigate back to patient insights
    navigate(`/patient-insights/${patientId}${fromPage ? `?from=${fromPage}` : ""}`);
  };

  const handleCancel = () => {
    navigate(`/patient-insights/${patientId}${fromPage ? `?from=${fromPage}` : ""}`);
  };

  const canProceed = () => {
    return transferData.reason && transferData.orderingClinician && !!selectedBed;
  };

  const breadcrumbConfig: Record<string, { label: string; path: string }> = {
    "patients": { label: "Patients", path: "/patients" },
    "appointments": { label: "Appointments", path: "/" },
    "op-patients": { label: "OP Patients", path: "/patients/op" },
    "ip-patients": { label: "IP Patients", path: "/patients/ip" },
  };

  const currentBreadcrumb = breadcrumbConfig[fromPage || ""] || { label: "Appointments", path: "/" };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar />
      
      <PageContent className="flex flex-col overflow-hidden">
        <AppHeader breadcrumbs={[
          { label: currentBreadcrumb.label, onClick: () => navigate(currentBreadcrumb.path) },
          { label: "Patient Insight", onClick: () => navigate(`/patient-insights/${patientId}${fromPage ? `?from=${fromPage}` : ""}`) },
          "Transfer Patient"
        ]} />
        
        {/* Fixed Header */}
        <div className="h-[72px] bg-background border-b border-border flex-shrink-0 flex items-center px-6">
          {/* Back Button */}
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="font-semibold">Back to Patient</span>
          </button>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 min-h-0">
          <div className="max-w-3xl mx-auto">
            <TransferDetailsStep
              data={transferData}
              onChange={handleDataChange}
              currentTariff={patient.currentTariff}
              fromLocation={patient.currentLocation}
              onSelectBed={handleSelectBed}
              admissionDate={patient.admissionDate}
            />
          </div>
        </main>

        {/* Footer Navigation */}
        <div className="border-t border-border bg-background px-6 py-4 flex-shrink-0">
          <div className="flex justify-between max-w-3xl mx-auto">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!canProceed() || isSubmitting}
            >
              {isSubmitting ? "Confirming..." : "Confirm Transfer"}
            </Button>
          </div>
        </div>
      </PageContent>
    </div>
  );
};

export default TransferPatient;