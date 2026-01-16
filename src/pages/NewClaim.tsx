import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Save, Check, AlertCircle } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ClaimStepPatientPolicy } from "@/components/insurance/claim-steps/ClaimStepPatientPolicy";
import { ClaimStepEncounter } from "@/components/insurance/claim-steps/ClaimStepEncounter";
import { ClaimStepServices } from "@/components/insurance/claim-steps/ClaimStepServices";
import { ClaimStepDocuments } from "@/components/insurance/claim-steps/ClaimStepDocuments";
import { ClaimStepPaymentBanking } from "@/components/insurance/claim-steps/ClaimStepPaymentBanking";
import { ClaimStepReview } from "@/components/insurance/claim-steps/ClaimStepReview";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, name: "Patient & Policy", component: ClaimStepPatientPolicy },
  { id: 2, name: "Encounter", component: ClaimStepEncounter },
  { id: 3, name: "Services", component: ClaimStepServices },
  { id: 4, name: "Documents", component: ClaimStepDocuments },
  { id: 5, name: "Payment & Banking", component: ClaimStepPaymentBanking },
  { id: 6, name: "Review & Submit", component: ClaimStepReview },
];

const NewClaim = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [claimData, setClaimData] = useState<any>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [hasAttemptedNext, setHasAttemptedNext] = useState(false);

  // Autosave every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleSaveDraft();
    }, 5000);

    return () => clearInterval(interval);
  }, [claimData]);

  const handleSaveDraft = () => {
    // Save to localStorage or API
    localStorage.setItem("draftClaim", JSON.stringify(claimData));
    setLastSaved(new Date());
  };

  const handleNext = () => {
    // Show warnings but don't block navigation
    const errors = validateCurrentStep();
    setValidationErrors(errors);
    setHasAttemptedNext(false);
    
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      handleSaveDraft();
    }
  };

  const handleBack = () => {
    setValidationErrors([]);
    setHasAttemptedNext(false);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = (): string[] => {
    const errors: string[] = [];
    
    switch (currentStep) {
      case 1:
        if (!claimData.patient) errors.push("Patient is required");
        if (!claimData.payer && !claimData.policy) errors.push("Payer or Policy is required");
        break;
      case 2:
        if (!claimData.encounter?.dateOfService) errors.push("Date of Service is required");
        if (!claimData.encounter?.diagnosis) errors.push("Diagnosis is required");
        break;
      case 3:
        if (!claimData.services || claimData.services.length === 0) {
          errors.push("At least one service is required");
        }
        break;
      case 4:
        if (claimData.claimType === "Reimbursement") {
          const hasInvoice = claimData.documents?.some((d: any) => d.tag === "Bill/Invoice");
          const hasKYC = claimData.documents?.some((d: any) => d.tag === "KYC");
          if (!hasInvoice) errors.push("Bill/Invoice document is required for Reimbursement");
          if (!hasKYC) errors.push("KYC document is required for Reimbursement");
        }
        if (claimData.claimType === "Cashless" && !claimData.encounter?.preauthNo) {
          errors.push("Pre-authorization number is required for Cashless claims");
        }
        break;
      case 5:
        if (claimData.claimType === "Reimbursement" && !claimData.bankDetails) {
          errors.push("Bank details are required for Reimbursement");
        }
        break;
    }
    
    return errors;
  };

  const handleSubmit = () => {
    const allErrors: string[] = [];
    for (let step = 1; step <= STEPS.length; step++) {
      const tempStep = currentStep;
      setCurrentStep(step);
      const errors = validateCurrentStep();
      allErrors.push(...errors);
      setCurrentStep(tempStep);
    }

    if (allErrors.length > 0) {
      toast({
        title: "Validation Failed",
        description: "Please fix all errors before submitting",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Claim Submitted",
      description: "Your claim has been submitted for review",
    });
    navigate("/patient-insights/1/insurance");
  };

  const CurrentStepComponent = STEPS[currentStep - 1].component;
  const progress = (currentStep / STEPS.length) * 100;

  const { isCollapsed } = useSidebarContext();

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      
      <div className={cn("flex-1 transition-all duration-300", isCollapsed ? "ml-[60px]" : "ml-[220px]")}>
        <AppHeader breadcrumbs={["Insurance", "Claims", "New Claim"]} />
        
        <main className="p-6 pb-32">
          {/* Back Button */}
          <button
            onClick={() => navigate("/patient-insights/1/insurance")}
            className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors mb-6"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="font-semibold">Back to Claims</span>
          </button>

          {/* Header with Autosave */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-lg font-semibold text-foreground">New Claim</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Complete all steps to submit your insurance claim
              </p>
            </div>
            {lastSaved && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-green-600" />
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              </div>
            )}
          </div>

          {/* Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center relative">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        currentStep > step.id
                          ? "bg-green-600 text-white"
                          : currentStep === step.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                    </div>
                    <span className="text-xs mt-2 text-center max-w-[100px]">{step.name}</span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className="flex-1 h-[2px] bg-muted mx-2 relative top-[-16px]">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: currentStep > step.id ? "100%" : "0%" }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Validation Warnings - Non-blocking */}
          {validationErrors.length > 0 && currentStep < STEPS.length && (
            <Card className="p-4 mb-6 border-yellow-500 bg-yellow-500/10">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-600 mb-2">
                    Incomplete fields (optional warnings):
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-600">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {/* Step Content */}
          <CurrentStepComponent
            data={claimData}
            onChange={setClaimData}
            errors={validationErrors}
          />
        </main>

        {/* Sticky Footer */}
        <div className={cn("fixed bottom-0 right-0 bg-background border-t border-border p-4 shadow-lg z-10 transition-all duration-300", isCollapsed ? "left-[60px]" : "left-[220px]")}>
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
                Back
              </Button>
              <Button variant="outline" onClick={handleSaveDraft} className="gap-2">
                <Save className="h-4 w-4" />
                Save as Draft
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {STEPS.length}
              </span>
              {currentStep < STEPS.length ? (
                <Button onClick={handleNext}>Next</Button>
              ) : (
                <Button onClick={handleSubmit} className="gap-2">
                  <Check className="h-4 w-4" />
                  Submit Claim
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewClaim;
