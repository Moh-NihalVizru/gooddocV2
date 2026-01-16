import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Patient, Vitals, ClinicalNote } from "@/types/patient360";
import { VitalsCard } from "../VitalsCard";

interface WriteNotesStepProps {
  patient: Patient;
  vitals?: Vitals;
  onNext: (note?: ClinicalNote) => void;
}

export function WriteNotesStep({ patient, vitals, onNext }: WriteNotesStepProps) {
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [hpi, setHpi] = useState("");

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-3 space-y-6">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-6">Write patient clinical notes</p>

          <div className="space-y-6">
            <div>
              <Label htmlFor="chiefComplaint" className="text-sm font-medium">
                Chief Complaint
              </Label>
              <Textarea
                id="chiefComplaint"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="Enter chief complaint"
                className="mt-2 min-h-[120px]"
              />
            </div>

            <div>
              <Label htmlFor="hpi" className="text-sm font-medium">
                History of Present Illness (HPI)
              </Label>
              <Textarea
                id="hpi"
                value={hpi}
                onChange={(e) => setHpi(e.target.value)}
                placeholder="Describe the history of present illness"
                className="mt-2 min-h-[120px]"
              />
            </div>

          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => onNext()}>Skip, Fill later</Button>
            <Button onClick={() => {
              const note: ClinicalNote = {
                id: Date.now().toString(),
                patientId: patient.id,
                createdBy: "current-user",
                createdAt: new Date().toISOString(),
                chiefComplaint,
                hpi,
                status: "Draft"
              };
              onNext(note);
            }}>Save & Continue</Button>
          </div>
        </Card>
      </div>

      <div>
        <VitalsCard vitals={vitals} />
      </div>
    </div>
  );
}
