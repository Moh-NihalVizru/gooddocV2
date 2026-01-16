import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Patient } from "@/types/patient360";
import { labTests } from "@/data/patient360.mock";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { LabOrder } from "@/types/patient360";

interface LabOrdersStepProps {
  patient: Patient;
  onBack: () => void;
  onNext: (order?: LabOrder) => void;
}

// Combined list of all tests (lab + radiology)
const allTests = [
  { code: "CBC", name: "Complete Blood Count (CBC)", price: 350, type: "Lab" },
  { code: "LFT", name: "Liver Function Test (LFT)", price: 650, type: "Lab" },
  { code: "KFT", name: "Kidney Function Test (KFT)", price: 550, type: "Lab" },
  { code: "LIPID", name: "Lipid Profile", price: 450, type: "Lab" },
  { code: "HBA1C", name: "HbA1c (Glycated Hemoglobin)", price: 400, type: "Lab" },
  { code: "FBS", name: "Fasting Blood Sugar", price: 150, type: "Lab" },
  { code: "THYROID", name: "Thyroid Profile (T3, T4, TSH)", price: 550, type: "Lab" },
  { code: "URIC", name: "Uric Acid", price: 200, type: "Lab" },
  { code: "VITD", name: "Vitamin D", price: 850, type: "Lab" },
  { code: "VITB12", name: "Vitamin B12", price: 650, type: "Lab" },
  { code: "CRP", name: "C-Reactive Protein (CRP)", price: 450, type: "Lab" },
  { code: "ESR", name: "ESR (Erythrocyte Sedimentation Rate)", price: 150, type: "Lab" },
  { code: "ECG", name: "ECG (Electrocardiogram)", price: 300, type: "Radiology" },
  { code: "ECHO", name: "2D Echocardiography", price: 1800, type: "Radiology" },
  { code: "XRAY", name: "Chest X-Ray", price: 350, type: "Radiology" },
  { code: "USG", name: "Ultrasound Abdomen", price: 800, type: "Radiology" },
  { code: "MRI", name: "MRI Brain", price: 6500, type: "Radiology" },
  { code: "CT", name: "CT Scan Chest", price: 4500, type: "Radiology" },
];

export function LabOrdersStep({ patient, onBack, onNext }: LabOrdersStepProps) {
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTests = allTests.filter(test =>
    test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleTest = (code: string) => {
    setSelectedTests((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const selectedTestObjects = allTests.filter((test) =>
    selectedTests.includes(test.code)
  );

  const subtotal = selectedTestObjects.reduce((sum, test) => sum + test.price, 0);

  const handleSaveAndContinue = () => {
    const order: LabOrder = {
      id: Date.now().toString(),
      patientId: patient.id,
      mode: "In-Clinic",
      type: "Laboratory",
      tests: selectedTestObjects.map(test => ({ code: test.code, name: test.name, price: test.price })),
      scheduledAt: new Date().toISOString(),
      status: "Pending",
      totals: { subtotal, cgst: 0, sgst: 0, net: subtotal, currency: "INR" }
    };
    onNext(order);
  };

  const handleSkip = () => {
    onNext();
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Recommended Tests</h3>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Tests List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredTests.map((test) => {
                const isSelected = selectedTests.includes(test.code);
                return (
                  <div
                    key={test.code}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:border-primary",
                      isSelected ? "border-primary bg-primary/5" : "border-border"
                    )}
                    onClick={() => toggleTest(test.code)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleTest(test.code)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">{test.name}</p>
                        <p className="text-xs text-muted-foreground">{test.type}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <Button variant="ghost" onClick={onBack}>
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSkip}>Skip</Button>
              <Button onClick={handleSaveAndContinue} disabled={selectedTests.length === 0}>
                Save & Continue
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <Card className="p-6 sticky top-24">
          <h3 className="text-sm font-semibold text-foreground mb-4">Order Summary</h3>
          
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

          {selectedTestObjects.length > 0 ? (
            <div className="space-y-2">
              {selectedTestObjects.map((test) => (
                <div key={test.code} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-sm text-foreground">{test.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select tests from the list</p>
          )}
        </Card>
      </div>
    </div>
  );
}
