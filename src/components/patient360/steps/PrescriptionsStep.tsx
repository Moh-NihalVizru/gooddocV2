import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Plus, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { Patient, PrescriptionItem, Prescription } from "@/types/patient360";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PrescriptionsStepProps {
  patient: Patient;
  onBack: () => void;
  onNext: (prescription?: Prescription) => void;
}

const MEDICATIONS = [
  "Paracetamol", "Ibuprofen", "Amoxicillin", "Azithromycin", "Ciprofloxacin",
  "Metformin", "Amlodipine", "Atorvastatin", "Omeprazole", "Pantoprazole",
  "Cetirizine", "Montelukast", "Salbutamol", "Levothyroxine", "Aspirin",
  "Metoprolol", "Losartan", "Lisinopril", "Gabapentin", "Prednisone",
  "Clopidogrel", "Warfarin", "Diclofenac", "Naproxen", "Tramadol"
];

function MedicationCombobox({ value, onSelect }: { value: string; onSelect: (value: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10 font-normal"
        >
          {value || "Search medication..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search medication..." />
          <CommandList>
            <CommandEmpty>No medication found.</CommandEmpty>
            <CommandGroup>
              {MEDICATIONS.map((med) => (
                <CommandItem
                  key={med}
                  value={med}
                  onSelect={() => {
                    onSelect(med);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === med ? "opacity-100" : "opacity-0")} />
                  {med}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function PrescriptionsStep({ patient, onBack, onNext }: PrescriptionsStepProps) {
  const { toast } = useToast();
  const [medications, setMedications] = useState<Partial<PrescriptionItem>[]>([
    { id: "1", name: "", frequency: "OD", durationDays: 7, timing: "Morning & Night" }
  ]);

  const addMedication = () => {
    setMedications([
      ...medications,
      { id: Date.now().toString(), name: "", frequency: "OD", durationDays: 7, timing: "Morning & Night" }
    ]);
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter((med) => med.id !== id));
  };

  const updateMedication = (id: string, field: keyof PrescriptionItem, value: any) => {
    setMedications(
      medications.map((med) => (med.id === id ? { ...med, [field]: value } : med))
    );
  };

  const handleSave = () => {
    if (patient.alerts?.allergies && patient.alerts.allergies.length > 0) {
      toast({
        title: "Allergy Alert",
        description: `Patient has allergies: ${patient.alerts.allergies.join(", ")}. Please review medications carefully.`,
        variant: "destructive"
      });
    }
    const prescription: Prescription = {
      id: Date.now().toString(),
      patientId: patient.id,
      items: medications.filter(m => m.name && m.id).map(m => ({
        id: m.id!,
        name: m.name!,
        form: m.form,
        strength: m.strength,
        dosage: m.dosage,
        route: m.route,
        frequency: m.frequency,
        timing: m.timing,
        durationDays: m.durationDays,
        notes: m.notes
      })),
      createdAt: new Date().toISOString(),
      createdBy: "current-user",
      status: "Draft"
    };
    onNext(prescription);
  };

  const handleSkip = () => {
    onNext();
  };

  const completedMedications = medications.filter(med => med.name && med.strength && med.dosage);

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-3">
        <Card className="p-6">
          <div className="space-y-4">
            {medications.map((med, index) => (
              <div
                key={med.id}
                className="grid grid-cols-12 gap-3"
              >
                <div className="col-span-3">
                  <MedicationCombobox
                    value={med.name || ""}
                    onSelect={(value) => updateMedication(med.id!, "name", value)}
                  />
                </div>
                <div className="col-span-2">
                  <Select
                    value={med.strength}
                    onValueChange={(value) => updateMedication(med.id!, "strength", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Strength" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5mg">5mg</SelectItem>
                      <SelectItem value="10mg">10mg</SelectItem>
                      <SelectItem value="25mg">25mg</SelectItem>
                      <SelectItem value="50mg">50mg</SelectItem>
                      <SelectItem value="100mg">100mg</SelectItem>
                      <SelectItem value="250mg">250mg</SelectItem>
                      <SelectItem value="500mg">500mg</SelectItem>
                      <SelectItem value="1000mg">1000mg</SelectItem>
                      <SelectItem value="5ml">5ml</SelectItem>
                      <SelectItem value="10ml">10ml</SelectItem>
                      <SelectItem value="15ml">15ml</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1">
                  <Select
                    value={med.dosage}
                    onValueChange={(value) => updateMedication(med.id!, "dosage", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Dosage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1/2 tablet">1/2</SelectItem>
                      <SelectItem value="1 tablet">1</SelectItem>
                      <SelectItem value="2 tablets">2</SelectItem>
                      <SelectItem value="3 tablets">3</SelectItem>
                      <SelectItem value="1 capsule">1 cap</SelectItem>
                      <SelectItem value="2 capsules">2 cap</SelectItem>
                      <SelectItem value="5ml">5ml</SelectItem>
                      <SelectItem value="10ml">10ml</SelectItem>
                      <SelectItem value="15ml">15ml</SelectItem>
                      <SelectItem value="1 puff">1 puff</SelectItem>
                      <SelectItem value="2 puffs">2 puff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Select
                    value={med.timing}
                    onValueChange={(value) => updateMedication(med.id!, "timing", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Timing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Morning">Morning</SelectItem>
                      <SelectItem value="Afternoon">Afternoon</SelectItem>
                      <SelectItem value="Evening">Evening</SelectItem>
                      <SelectItem value="Night">Night</SelectItem>
                      <SelectItem value="Morning & Night">Morning & Night</SelectItem>
                      <SelectItem value="Morning, Afternoon & Night">Morning, Afternoon & Night</SelectItem>
                      <SelectItem value="Before Meals">Before Meals</SelectItem>
                      <SelectItem value="After Meals">After Meals</SelectItem>
                      <SelectItem value="With Meals">With Meals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Select
                    value={med.frequency}
                    onValueChange={(value) => updateMedication(med.id!, "frequency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OD">OD</SelectItem>
                      <SelectItem value="BD">BD</SelectItem>
                      <SelectItem value="TID">TID</SelectItem>
                      <SelectItem value="QID">QID</SelectItem>
                      <SelectItem value="HS">HS</SelectItem>
                      <SelectItem value="PRN">PRN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1">
                  <Select
                    value={med.durationDays?.toString()}
                    onValueChange={(value) =>
                      updateMedication(med.id!, "durationDays", parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3d</SelectItem>
                      <SelectItem value="5">5d</SelectItem>
                      <SelectItem value="7">7d</SelectItem>
                      <SelectItem value="14">14d</SelectItem>
                      <SelectItem value="30">30d</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1 flex items-center justify-end">
                  {medications.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMedication(med.id!)}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  )}
                </div>
                {med.notes !== undefined && (
                  <div className="col-span-12">
                    <Input
                      placeholder="Notes / PRN instructions"
                      value={med.notes}
                      onChange={(e) => updateMedication(med.id!, "notes", e.target.value)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mt-4"
            onClick={addMedication}
          >
            <Plus className="w-4 h-4" />
            Add More Medicines
          </button>

          <div className="flex items-center justify-between mt-6">
            <Button variant="ghost" onClick={onBack}>
              Back
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleSkip}>Skip, Fill later</Button>
              <Button onClick={handleSave}>Save & Continue</Button>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <Card className="p-6 sticky top-24">
          <h3 className="text-sm font-semibold text-foreground mb-4">Prescription Summary</h3>
          
          <div className="space-y-3 mb-4 pb-4 border-b border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Patient</p>
              <p className="text-sm font-medium text-foreground">{patient.name}</p>
              <p className="text-xs text-muted-foreground">
                GDID - {patient.gdid} • {Math.floor(
                  (new Date().getTime() - new Date(patient.dob).getTime()) / 
                  (365.25 * 24 * 60 * 60 * 1000)
                )} | {patient.sex}
              </p>
            </div>
          </div>

          {completedMedications.length > 0 ? (
            <div className="space-y-2">
              {completedMedications.map((med) => (
                <div key={med.id} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-sm text-foreground">{med.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select medications from the list</p>
          )}
        </Card>
      </div>
    </div>
  );
}
