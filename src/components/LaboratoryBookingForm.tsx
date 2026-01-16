import { useState, useEffect } from "react";
import { Check, Minus, Search, FlaskConical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import { DiagnosticsSlotPicker } from "@/components/booking/DiagnosticsSlotPicker";

export interface LabTest {
  id: string;
  name: string;
  category: string;
  price: number;
}

export interface RadiologyTest {
  id: string;
  name: string;
  category: string;
  price: number;
}

export interface HealthPackage {
  id: string;
  name: string;
  includes: string;
  price: number;
}

export interface LaboratoryData {
  mode: "laboratory" | "radiology";
  selectedTests: LabTest[];
  selectedPackages: HealthPackage[];
  selectedRadiologyTests?: RadiologyTest[];
  laboratoryDate: Date;
  laboratoryTime: string;
  radiologyDate: Date;
  radiologyTime: string;
}

interface LaboratoryBookingFormProps {
  onRemove?: () => void;
  onUpdate: (data: LaboratoryData) => void;
  initialData?: LaboratoryData;
  hideMode?: boolean;
}

const healthPackages: HealthPackage[] = [
  {
    id: "1",
    name: "Executive Health Checkup",
    includes: "CBC, ESR, Lipid Profile, LFT, KFT, Thyroid Profile (T3, T4, TSH), HbA1c, Urine Routine, Chest X-Ray",
    price: 3499,
  },
  {
    id: "2",
    name: "Comprehensive Metabolic Panel",
    includes: "Glucose Fasting, BUN, Creatinine, Electrolytes (Na, K, Cl), Calcium, Total Protein, Albumin, Bilirubin, ALP, AST, ALT",
    price: 1299,
  },
  {
    id: "3",
    name: "Cardiac Risk Profile",
    includes: "Lipid Profile, hs-CRP, Homocysteine, Lipoprotein(a), Apolipoprotein A1/B, HbA1c",
    price: 2499,
  },
  {
    id: "4",
    name: "Thyroid Function Panel",
    includes: "T3, T4, TSH, Free T3, Free T4, Anti-TPO Antibodies",
    price: 1199,
  },
  {
    id: "5",
    name: "Diabetes Screening Panel",
    includes: "Fasting Glucose, Post-Prandial Glucose, HbA1c, Fructosamine, Insulin Fasting, HOMA-IR",
    price: 1599,
  },
  {
    id: "6",
    name: "Anemia Profile",
    includes: "CBC, Reticulocyte Count, Iron Studies (Serum Iron, TIBC, Ferritin), Vitamin B12, Folate",
    price: 1899,
  },
];

const individualTests: LabTest[] = [
  { id: "1", name: "Complete Blood Count (CBC) with ESR", category: "Hematology", price: 350 },
  { id: "2", name: "Hemoglobin A1c (HbA1c)", category: "Diabetes", price: 450 },
  { id: "3", name: "Lipid Profile (Cholesterol, HDL, LDL, Triglycerides, VLDL)", category: "Cardiac", price: 550 },
  { id: "4", name: "Liver Function Test (LFT) - 11 Parameters", category: "Hepatic", price: 650 },
  { id: "5", name: "Kidney Function Test (KFT/RFT)", category: "Renal", price: 550 },
  { id: "6", name: "Thyroid Stimulating Hormone (TSH)", category: "Endocrine", price: 350 },
  { id: "7", name: "Fasting Blood Glucose", category: "Diabetes", price: 100 },
  { id: "8", name: "Post-Prandial Blood Glucose (PPBS)", category: "Diabetes", price: 100 },
  { id: "9", name: "Urine Routine & Microscopy", category: "Urinalysis", price: 150 },
  { id: "10", name: "Serum Creatinine", category: "Renal", price: 200 },
  { id: "11", name: "Blood Urea Nitrogen (BUN)", category: "Renal", price: 180 },
  { id: "12", name: "Serum Uric Acid", category: "Metabolic", price: 200 },
  { id: "13", name: "Vitamin D (25-OH)", category: "Vitamins", price: 1200 },
  { id: "14", name: "Vitamin B12", category: "Vitamins", price: 750 },
  { id: "15", name: "Iron Studies (Serum Iron, TIBC, Ferritin)", category: "Hematology", price: 850 },
  { id: "16", name: "C-Reactive Protein (CRP) Quantitative", category: "Inflammation", price: 450 },
  { id: "17", name: "Erythrocyte Sedimentation Rate (ESR)", category: "Hematology", price: 100 },
  { id: "18", name: "Prothrombin Time (PT/INR)", category: "Coagulation", price: 350 },
  { id: "19", name: "Activated Partial Thromboplastin Time (aPTT)", category: "Coagulation", price: 400 },
  { id: "20", name: "Serum Electrolytes (Na, K, Cl)", category: "Metabolic", price: 450 },
];

const radiologyTests: RadiologyTest[] = [
  { id: "r1", name: "X-Ray Chest PA View", category: "X-Ray", price: 350 },
  { id: "r2", name: "X-Ray Chest Lateral View", category: "X-Ray", price: 350 },
  { id: "r3", name: "X-Ray Cervical Spine AP/Lateral", category: "X-Ray", price: 500 },
  { id: "r4", name: "X-Ray Lumbar Spine AP/Lateral", category: "X-Ray", price: 550 },
  { id: "r5", name: "X-Ray Abdomen (KUB)", category: "X-Ray", price: 400 },
  { id: "r6", name: "X-Ray Pelvis AP", category: "X-Ray", price: 400 },
  { id: "r7", name: "X-Ray Knee Joint (Both)", category: "X-Ray", price: 600 },
  { id: "r8", name: "X-Ray Shoulder Joint", category: "X-Ray", price: 400 },
  { id: "r9", name: "USG Abdomen & Pelvis", category: "Ultrasound", price: 1200 },
  { id: "r10", name: "USG Whole Abdomen", category: "Ultrasound", price: 1000 },
  { id: "r11", name: "USG Thyroid", category: "Ultrasound", price: 800 },
  { id: "r12", name: "USG KUB (Kidney, Ureter, Bladder)", category: "Ultrasound", price: 900 },
  { id: "r13", name: "2D Echocardiography", category: "Cardiac Imaging", price: 1800 },
  { id: "r14", name: "ECG (12-Lead)", category: "Cardiac Imaging", price: 200 },
  { id: "r15", name: "TMT (Treadmill Test)", category: "Cardiac Imaging", price: 1500 },
  { id: "r16", name: "Doppler - Carotid Arteries", category: "Vascular", price: 2000 },
];


export const LaboratoryBookingForm = ({ onRemove, onUpdate, initialData, hideMode = false }: LaboratoryBookingFormProps) => {
  const [mode, setMode] = useState<"laboratory" | "radiology">(initialData?.mode || "laboratory");
  const [labTestType, setLabTestType] = useState<"health-packages" | "individual-tests">(
    initialData?.selectedTests && initialData.selectedTests.length > 0 ? "individual-tests" : "health-packages"
  );
  const [selectedTests, setSelectedTests] = useState<LabTest[]>(initialData?.selectedTests || []);
  const [selectedPackages, setSelectedPackages] = useState<HealthPackage[]>(initialData?.selectedPackages || []);
  const [selectedRadiologyTests, setSelectedRadiologyTests] = useState<RadiologyTest[]>(initialData?.selectedRadiologyTests || []);
  const [laboratoryDate, setLaboratoryDate] = useState<Date>(initialData?.laboratoryDate || new Date());
  const [laboratoryTime, setLaboratoryTime] = useState(initialData?.laboratoryTime || "");
  const [radiologyDate, setRadiologyDate] = useState<Date>(initialData?.radiologyDate || new Date());
  const [radiologyTime, setRadiologyTime] = useState(initialData?.radiologyTime || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Sync state with initialData when it changes (for pre-filling from request data)
  useEffect(() => {
    if (initialData && !isInitialized) {
      if (initialData.mode) setMode(initialData.mode);
      if (initialData.selectedTests && initialData.selectedTests.length > 0) {
        setSelectedTests(initialData.selectedTests);
        setLabTestType("individual-tests");
      }
      if (initialData.selectedPackages) setSelectedPackages(initialData.selectedPackages);
      if (initialData.selectedRadiologyTests) setSelectedRadiologyTests(initialData.selectedRadiologyTests);
      if (initialData.laboratoryDate) setLaboratoryDate(initialData.laboratoryDate);
      if (initialData.laboratoryTime) setLaboratoryTime(initialData.laboratoryTime);
      if (initialData.radiologyDate) setRadiologyDate(initialData.radiologyDate);
      if (initialData.radiologyTime) setRadiologyTime(initialData.radiologyTime);
      setIsInitialized(true);
    }
  }, [initialData, isInitialized]);

  const handleModeChange = (newMode: "laboratory" | "radiology") => {
    setMode(newMode);
    onUpdate({ mode: newMode, selectedTests, selectedPackages, selectedRadiologyTests, laboratoryDate, laboratoryTime, radiologyDate, radiologyTime });
  };

  const handleTestToggle = (test: LabTest) => {
    const isSelected = selectedTests.some(t => t.id === test.id);
    const newTests = isSelected
      ? selectedTests.filter(t => t.id !== test.id)
      : [...selectedTests, test];
    setSelectedTests(newTests);
    onUpdate({ mode, selectedTests: newTests, selectedPackages, selectedRadiologyTests, laboratoryDate, laboratoryTime, radiologyDate, radiologyTime });
  };

  const handleRadiologyTestToggle = (test: RadiologyTest) => {
    const isSelected = selectedRadiologyTests.some(t => t.id === test.id);
    const newTests = isSelected
      ? selectedRadiologyTests.filter(t => t.id !== test.id)
      : [...selectedRadiologyTests, test];
    setSelectedRadiologyTests(newTests);
    onUpdate({ mode, selectedTests, selectedPackages, selectedRadiologyTests: newTests, laboratoryDate, laboratoryTime, radiologyDate, radiologyTime });
  };

  const handlePackageToggle = (pkg: HealthPackage) => {
    const isSelected = selectedPackages.some(p => p.id === pkg.id);
    const newPackages = isSelected
      ? selectedPackages.filter(p => p.id !== pkg.id)
      : [...selectedPackages, pkg];
    setSelectedPackages(newPackages);
    onUpdate({ mode, selectedTests, selectedPackages: newPackages, selectedRadiologyTests, laboratoryDate, laboratoryTime, radiologyDate, radiologyTime });
  };

  const handleLaboratoryTimeSelect = (time: string) => {
    setLaboratoryTime(time);
    onUpdate({ mode, selectedTests, selectedPackages, selectedRadiologyTests, laboratoryDate, laboratoryTime: time, radiologyDate, radiologyTime });
  };

  const handleLaboratoryDateSelect = (newDate: Date) => {
    setLaboratoryDate(newDate);
    onUpdate({ mode, selectedTests, selectedPackages, selectedRadiologyTests, laboratoryDate: newDate, laboratoryTime, radiologyDate, radiologyTime });
  };

  const handleRadiologyTimeSelect = (time: string) => {
    setRadiologyTime(time);
    onUpdate({ mode, selectedTests, selectedPackages, selectedRadiologyTests, laboratoryDate, laboratoryTime, radiologyDate, radiologyTime: time });
  };

  const handleRadiologyDateSelect = (newDate: Date) => {
    setRadiologyDate(newDate);
    onUpdate({ mode, selectedTests, selectedPackages, selectedRadiologyTests, laboratoryDate, laboratoryTime, radiologyDate: newDate, radiologyTime });
  };

  const filteredPackages = healthPackages.filter(pkg => 
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.includes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTests = individualTests.filter(test =>
    test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRadiologyTests = radiologyTests.filter(test =>
    test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 dark:bg-blue-700 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <FlaskConical className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">{hideMode ? "Laboratory" : "Diagnostics"}</h3>
            <p className="text-xs text-white/70">Lab Tests & Radiology</p>
          </div>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-white/70 hover:text-white transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <div className="p-5 space-y-5">
        {/* Diagnostics Type Toggle - Only show when not hideMode */}
        {!hideMode && (
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Diagnostics Type
            </label>
            <Tabs value={mode} onValueChange={(v) => handleModeChange(v as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="laboratory">Laboratory</TabsTrigger>
                <TabsTrigger value="radiology">Radiology</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* Lab Tests Content */}
        {mode === "laboratory" && (
          <div>
            {/* Search and Inline Tabs */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search lab tests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-1 p-1 bg-muted rounded-lg">
                <button
                  onClick={() => setLabTestType("health-packages")}
                  className={cn(
                    "px-3 py-1.5 text-sm font-normal rounded-md transition-colors",
                    labTestType === "health-packages" 
                      ? "bg-white text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Health Packages
                </button>
                <button
                  onClick={() => setLabTestType("individual-tests")}
                  className={cn(
                    "px-3 py-1.5 text-sm font-normal rounded-md transition-colors",
                    labTestType === "individual-tests" 
                      ? "bg-white text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Individual Tests
                </button>
              </div>
            </div>
            
            <Tabs value={labTestType} onValueChange={(v) => setLabTestType(v as any)}>
              <TabsContent value="health-packages" className="space-y-3 mt-0">
              {filteredPackages.map((pkg) => {
                const isSelected = selectedPackages.some(p => p.id === pkg.id);
                return (
                  <Card
                    key={pkg.id}
                    className={cn(
                      "p-4 cursor-pointer transition-all hover:border-primary",
                      isSelected && "border-primary bg-primary/5"
                    )}
                    onClick={() => handlePackageToggle(pkg)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-primary">{pkg.name}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Includes: {pkg.includes}
                        </p>
                        <p className="text-sm font-semibold text-foreground">{formatCurrency(pkg.price)}</p>
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-3",
                        isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                      )}>
                        {isSelected ? <Check className="w-3 h-3 text-primary-foreground" /> : <Minus className="w-3 h-3 text-muted-foreground" />}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="individual-tests" className="grid grid-cols-2 gap-3">
              {filteredTests.map((test) => {
                const isSelected = selectedTests.some(t => t.id === test.id);
                return (
                  <Card
                    key={test.id}
                    className={cn(
                      "p-4 cursor-pointer transition-all hover:border-primary",
                      isSelected && "border-primary bg-primary/5"
                    )}
                    onClick={() => handleTestToggle(test)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-primary flex-1 pr-2">{test.name}</h4>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                        isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                      )}>
                        {isSelected ? <Check className="w-3 h-3 text-primary-foreground" /> : <Minus className="w-3 h-3 text-muted-foreground" />}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{test.category}</p>
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(test.price)}</p>
                  </Card>
                );
              })}
            </TabsContent>
          </Tabs>
          </div>
        )}

        {/* Radiology Tests Content */}
        {mode === "radiology" && (
          <div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search radiology tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {filteredRadiologyTests.map((test) => {
                const isSelected = selectedRadiologyTests.some(t => t.id === test.id);
                return (
                  <Card
                    key={test.id}
                    className={cn(
                      "p-4 cursor-pointer transition-all hover:border-primary",
                      isSelected && "border-primary bg-primary/5"
                    )}
                    onClick={() => handleRadiologyTestToggle(test)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-primary flex-1 pr-2">{test.name}</h4>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                        isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                      )}>
                        {isSelected ? <Check className="w-3 h-3 text-primary-foreground" /> : <Minus className="w-3 h-3 text-muted-foreground" />}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{test.category}</p>
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(test.price)}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Date & Time for Laboratory */}
        {mode === "laboratory" && (selectedTests.length > 0 || selectedPackages.length > 0) && (
          <DiagnosticsSlotPicker
            selectedDate={laboratoryDate}
            selectedTime={laboratoryTime}
            onDateSelect={handleLaboratoryDateSelect}
            onTimeSelect={handleLaboratoryTimeSelect}
            label="Laboratory Date & Time"
            locationName="Main Lab"
          />
        )}

        {/* Date & Time for Radiology */}
        {mode === "radiology" && selectedRadiologyTests.length > 0 && (
          <DiagnosticsSlotPicker
            selectedDate={radiologyDate}
            selectedTime={radiologyTime}
            onDateSelect={handleRadiologyDateSelect}
            onTimeSelect={handleRadiologyTimeSelect}
            label="Radiology Date & Time"
            locationName="Radiology Center"
          />
        )}
      </div>
    </Card>
  );
};
