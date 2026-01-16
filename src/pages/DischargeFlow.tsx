import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, Receipt, FileText, Save } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { PageContent } from "@/components/PageContent";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { toast } from "sonner";
import PendingBillStep from "@/components/discharge/PendingBillStep";
import DischargeSummaryStep from "@/components/discharge/DischargeSummaryStep";
import { DischargeConfirmationModal } from "@/components/discharge/DischargeConfirmationModal";
import {
  SAMPLE_PENDING_BILLS,
  SAMPLE_PATIENT_SNAPSHOT,
  DEFAULT_DISCHARGE_CONFIG,
} from "@/data/discharge-flow.mock";
import { PendingBill, StepStatus } from "@/types/discharge-flow";

type Step = 1 | 2;

const steps = [
  { step: 1 as Step, label: "Pending Bill", icon: Receipt },
  { step: 2 as Step, label: "Discharge Summary", icon: FileText },
];

const getStepStatusText = (status: StepStatus) => {
  const config = {
    pending: { label: "Pending", color: "text-muted-foreground" },
    in_progress: { label: "In Progress", color: "text-blue-600" },
    cleared: { label: "Cleared", color: "text-green-600" },
    finalized: { label: "Finalized", color: "text-primary" },
  };
  return config[status];
};

export default function DischargeFlow() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [searchParams] = useSearchParams();
  const { isCollapsed } = useSidebarContext();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [bills, setBills] = useState<PendingBill[]>(SAMPLE_PENDING_BILLS);
  const [stepStatuses, setStepStatuses] = useState<Record<Step, StepStatus>>({
    1: "in_progress",
    2: "pending",
  });
  const [isDirty, setIsDirty] = useState(false);
  const [showDischargeModal, setShowDischargeModal] = useState(false);

  const patient = SAMPLE_PATIENT_SNAPSHOT;
  const config = DEFAULT_DISCHARGE_CONFIG;

  // Autosave every 10 seconds
  useEffect(() => {
    if (!isDirty) return;
    const timer = setInterval(() => {
      toast.success("Draft saved automatically");
      setIsDirty(false);
    }, 10000);
    return () => clearInterval(timer);
  }, [isDirty]);

  const handleBillsUpdated = (updatedBills: PendingBill[]) => {
    setBills(updatedBills);
    setIsDirty(true);
    
    const totalOutstanding = updatedBills.reduce((sum, b) => sum + b.outstandingAmount, 0);
    if (totalOutstanding === 0) {
      setStepStatuses((prev) => ({ ...prev, 1: "cleared" }));
      toast.success("All bills cleared!");
    }
  };

  const handleStepChange = (step: Step) => {
    if (step > currentStep && stepStatuses[currentStep] === "pending") {
      toast.error("Please complete the current step first");
      return;
    }
    setCurrentStep(step);
    if (stepStatuses[step] === "pending") {
      setStepStatuses((prev) => ({ ...prev, [step]: "in_progress" }));
    }
  };

  const handleBack = () => {
    navigate(`/patient-insights/${patientId}?from=ip-patients`);
  };

  const totalOutstanding = bills.reduce((sum, b) => sum + b.outstandingAmount, 0);

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      
      <PageContent>
        <AppHeader breadcrumbs={["Patients", patient.name, "Discharge"]} />

        {/* Patient Snapshot Bar with Stepper */}
        <div className="h-20 bg-card border-b border-border flex items-center justify-between px-6">
          {/* Left - Back Button */}
          <button onClick={handleBack} className="flex items-center gap-2 text-sm text-foreground hover:text-primary shrink-0">
            <ChevronLeft className="w-4 h-4" />
            <span className="font-medium">Back to Patient</span>
          </button>

          {/* Center - Stepper */}
          <div className="flex items-center gap-4">
            {steps.map((s, index) => {
              const Icon = s.icon;
              const isActive = s.step === currentStep;
              const status = stepStatuses[s.step];
              const statusInfo = getStepStatusText(status);

              return (
                <div key={s.step} className="flex items-center gap-4">
                  <button
                    onClick={() => handleStepChange(s.step)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all w-[220px]",
                      isActive && "bg-primary/10 border border-primary/30",
                      !isActive && "hover:bg-muted/50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0",
                        isActive && "bg-primary text-primary-foreground",
                        status === "cleared" && !isActive && "bg-green-500 text-white",
                        status === "finalized" && "bg-primary text-primary-foreground",
                        !isActive && status === "pending" && "bg-muted text-muted-foreground",
                        !isActive && status === "in_progress" && "bg-blue-500/10 text-blue-600 border border-blue-500/30"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col items-start gap-0.5">
                      <span className={cn("text-sm font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>
                        {s.label}
                      </span>
                      <span className={cn("text-xs", statusInfo.color)}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </button>
                  {index < steps.length - 1 && (
                    <div className={cn("w-16 h-0.5 rounded-full", status === "cleared" || status === "finalized" ? "bg-green-500" : "bg-border")} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-4 shrink-0">
            {isDirty && (
              <Button variant="outline" size="sm" onClick={() => { toast.success("Draft saved"); setIsDirty(false); }}>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
            )}
            <Button 
              className="h-9"
              onClick={() => setShowDischargeModal(true)}
            >
              Proceed to Discharge
            </Button>
          </div>
        </div>

        {/* Discharge Confirmation Modal */}
        <DischargeConfirmationModal
          open={showDischargeModal}
          onOpenChange={setShowDischargeModal}
          onConfirm={() => {
            setStepStatuses(p => ({...p, 2: "finalized"}));
            toast.success("Patient discharged successfully!");
            setTimeout(() => navigate(`/patient-insights/${patientId}?from=ip-patients`), 1500);
          }}
          patientName={patient.name}
          mrn={patient.mrn}
          encounterId="V25-004"
        />

        {/* Step Content */}
        <main className="p-6">
          {currentStep === 1 && (
            <PendingBillStep
              bills={bills}
              patientName={patient.name}
              mrn={patient.mrn}
              encounterId="E-98765"
              stepStatus={stepStatuses[1]}
              onBillsUpdated={handleBillsUpdated}
              onStepComplete={() => handleStepChange(2)}
              requireBillingClearance={config.requireBillingClearanceToFinalize}
            />
          )}
          {currentStep === 2 && (
            <DischargeSummaryStep
              stepStatus={stepStatuses[2]}
              onFinalize={() => { setStepStatuses(p => ({...p, 2: "finalized"})); }}
              requireBillingClearance={config.requireBillingClearanceToFinalize}
              totalOutstanding={totalOutstanding}
            />
          )}
        </main>
      </PageContent>
    </div>
  );
}
