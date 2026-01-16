import { useState } from "react";
import { Patient, Vitals, ClinicalNote, Prescription, LabOrder } from "@/types/patient360";
import { WriteNotesStep } from "./steps/WriteNotesStep";
import { PrescriptionsStep } from "./steps/PrescriptionsStep";
import { LabOrdersStep } from "./steps/LabOrdersStep";
import { OrderSummaryStep } from "./steps/OrderSummaryStep";
import { cn } from "@/lib/utils";

interface ClinicalNotesStepperProps {
  patient: Patient;
  vitals?: Vitals;
}

export function ClinicalNotesStepper({ patient, vitals }: ClinicalNotesStepperProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [clinicalNote, setClinicalNote] = useState<ClinicalNote | undefined>();
  const [prescription, setPrescription] = useState<Prescription | undefined>();
  const [labOrder, setLabOrder] = useState<LabOrder | undefined>();

  const steps = [
    { number: 1, label: "Write Notes" },
    { number: 2, label: "Prescriptions" },
    { number: 3, label: "Lab Orders" },
    { number: 4, label: "Summary" }
  ];

  return (
    <div>
      <div>
        {currentStep === 1 && (
          <WriteNotesStep
            patient={patient}
            vitals={vitals}
            onNext={(note) => {
              setClinicalNote(note);
              setCurrentStep(2);
            }}
          />
        )}
        {currentStep === 2 && (
          <PrescriptionsStep
            patient={patient}
            onBack={() => setCurrentStep(1)}
            onNext={(rx) => {
              setPrescription(rx);
              setCurrentStep(3);
            }}
          />
        )}
        {currentStep === 3 && (
          <LabOrdersStep
            patient={patient}
            onBack={() => setCurrentStep(2)}
            onNext={(order) => {
              setLabOrder(order);
              setCurrentStep(4);
            }}
          />
        )}
        {currentStep === 4 && (
          <OrderSummaryStep
            patient={patient}
            clinicalNote={clinicalNote}
            prescription={prescription}
            labOrder={labOrder}
            onBack={() => setCurrentStep(3)}
          />
        )}
      </div>
    </div>
  );
}
