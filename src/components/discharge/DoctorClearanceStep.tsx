import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  Pill, 
  Calendar,
  FileText,
  Plus,
  Trash2,
  Check,
  X,
  ArrowRight,
  Heart,
  Thermometer,
  Droplets,
  Search,
  AlertTriangle,
  Skull,
  LogOut,
  Building2,
  Home,
  Ambulance,
  ShoppingCart,
  Package,
  Clock,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  DoctorClearance, 
  StepStatus, 
  ClinicalChecklist,
  MedicationReconciliationItem,
  ConditionAtDischarge,
  DischargeDestination,
  MedicationAction,
  DischargeReason,
  DISCHARGE_REASON_CONFIG
} from "@/types/discharge-flow";
import { SAMPLE_DOCTOR_CLEARANCE } from "@/data/discharge-flow.mock";
import { 
  MEDICATIONS_CATALOG, 
  MEDICATION_CATEGORIES,
  MedicationCatalogItem,
  MedicationCategory,
  STRENGTH_OPTIONS,
  DOSAGE_OPTIONS,
  FREQUENCY_OPTIONS,
  DURATION_OPTIONS,
  ROUTE_OPTIONS
} from "@/data/medications-catalog.mock";

interface DoctorClearanceStepProps {
  stepStatus: StepStatus;
  onStepComplete: () => void;
}

const checklistItems: { key: keyof ClinicalChecklist; label: string }[] = [
  { key: "stableVitals", label: "Vitals stable for discharge" },
  { key: "afebrile", label: "Afebrile (>24 hours)" },
  { key: "painControlled", label: "Pain adequately controlled" },
  { key: "oxygenBaseline", label: "Oxygen at baseline/room air" },
  { key: "toleratingDiet", label: "Tolerating oral diet" },
  { key: "mobilitySafe", label: "Mobility/ambulation safe" },
  { key: "anticoagPlan", label: "Anticoagulation plan documented" },
  { key: "ivRemovedOrPlan", label: "IV access removed/plan documented" },
  { key: "drainsSafe", label: "Drains/devices safe for discharge" },
  { key: "criticalLabsReviewed", label: "Critical labs reviewed" },
  { key: "imagingReviewed", label: "Imaging results reviewed" },
  { key: "returnPrecautionsGiven", label: "Return precautions provided" },
];

const getDischargeReasonIcon = (reason: DischargeReason) => {
  switch (reason) {
    case 'death':
    case 'brought_dead':
      return Skull;
    case 'lama':
    case 'dama':
    case 'absconded':
      return LogOut;
    case 'referred_higher_center':
    case 'transferred_other_hospital':
      return Ambulance;
    case 'palliative_home':
      return Home;
    default:
      return CheckCircle2;
  }
};

export default function DoctorClearanceStep({ stepStatus, onStepComplete }: DoctorClearanceStepProps) {
  const [data, setData] = useState<DoctorClearance>(SAMPLE_DOCTOR_CLEARANCE);
  const [activeTab, setActiveTab] = useState("clinical");
  const [medSearch, setMedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MedicationCategory | "all">("all");
  const [selectedMedForEdit, setSelectedMedForEdit] = useState<string | null>(null);
  
  // Get current discharge reason config
  const dischargeReason = data.clinicalStatus.dischargeReason || 'improved';
  const reasonConfig = DISCHARGE_REASON_CONFIG[dischargeReason];
  
  const checklist = data.clinicalStatus.checklist;
  const completedChecks = Object.values(checklist).filter(Boolean).length;
  const totalChecks = checklistItems.length;
  const checklistProgress = Math.round((completedChecks / totalChecks) * 100);

  // Determine if checklist is required based on discharge reason
  const checklistRequired = reasonConfig.requiresChecklist;
  const medsRequired = reasonConfig.requiresMedications;
  const followUpRequired = reasonConfig.requiresFollowUp;

  // Filter medications from catalog
  const filteredCatalogMeds = useMemo(() => {
    return MEDICATIONS_CATALOG.filter(med => {
      const matchesSearch = medSearch === "" || 
        med.name.toLowerCase().includes(medSearch.toLowerCase()) ||
        med.genericName.toLowerCase().includes(medSearch.toLowerCase()) ||
        med.brandName.toLowerCase().includes(medSearch.toLowerCase()) ||
        med.tags.some(tag => tag.toLowerCase().includes(medSearch.toLowerCase()));
      
      const matchesCategory = selectedCategory === "all" || med.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [medSearch, selectedCategory]);

  const handleDischargeReasonChange = (value: DischargeReason) => {
    setData(prev => ({
      ...prev,
      clinicalStatus: {
        ...prev.clinicalStatus,
        dischargeReason: value
      }
    }));
  };

  const handleChecklistChange = (key: keyof ClinicalChecklist, checked: boolean) => {
    setData(prev => ({
      ...prev,
      clinicalStatus: {
        ...prev.clinicalStatus,
        checklist: {
          ...prev.clinicalStatus.checklist,
          [key]: checked
        }
      }
    }));
  };

  const handleConditionChange = (value: ConditionAtDischarge) => {
    setData(prev => ({
      ...prev,
      clinicalStatus: {
        ...prev.clinicalStatus,
        conditionAtDischarge: value
      }
    }));
  };

  const handleDestinationChange = (value: DischargeDestination) => {
    setData(prev => ({
      ...prev,
      clinicalStatus: {
        ...prev.clinicalStatus,
        destination: value
      }
    }));
  };

  const handleAddMedicationFromCatalog = (catalogMed: MedicationCatalogItem) => {
    const medication: MedicationReconciliationItem = {
      medId: `med-${Date.now()}`,
      name: catalogMed.name,
      genericName: catalogMed.genericName,
      brandName: catalogMed.brandName,
      drugCode: catalogMed.drugCode,
      action: "Start" as MedicationAction,
      strength: catalogMed.defaultStrength,
      form: catalogMed.form,
      dose: catalogMed.defaultDose,
      route: catalogMed.route,
      frequency: catalogMed.defaultFrequency,
      duration: catalogMed.defaultDuration,
      instructions: "",
    };

    setData(prev => ({
      ...prev,
      medicationReconciliation: {
        ...prev.medicationReconciliation,
        items: [...prev.medicationReconciliation.items, medication]
      }
    }));
  };

  const handleDeleteMedication = (medId: string) => {
    setData(prev => ({
      ...prev,
      medicationReconciliation: {
        ...prev.medicationReconciliation,
        items: prev.medicationReconciliation.items.filter(m => m.medId !== medId)
      }
    }));
  };

  const handleUpdateMedication = (medId: string, field: keyof MedicationReconciliationItem, value: string) => {
    setData(prev => ({
      ...prev,
      medicationReconciliation: {
        ...prev.medicationReconciliation,
        items: prev.medicationReconciliation.items.map(m => 
          m.medId === medId ? { ...m, [field]: value } : m
        )
      }
    }));
  };

  // Calculate if sign-off is allowed based on discharge reason requirements
  const canSignOff = useMemo(() => {
    if (!data.signoff.confirmFitForDischarge) return false;
    if (checklistRequired && checklistProgress < 100) return false;
    return true;
  }, [data.signoff.confirmFitForDischarge, checklistRequired, checklistProgress]);

  const handleSignoff = () => {
    setData(prev => ({
      ...prev,
      signoff: {
        ...prev.signoff,
        confirmFitForDischarge: true,
        eSign: {
          byUserId: "user-001",
          signedAt: new Date().toISOString()
        }
      }
    }));
    onStepComplete();
  };

  const vitals = data.clinicalStatus.vitalsSnapshot;
  const labs = data.clinicalStatus.labsSummary || [];
  const medications = data.medicationReconciliation.items;

  // Check if a medication is already in the prescription
  const isMedicationInCart = (catalogMedId: string) => {
    const catalogMed = MEDICATIONS_CATALOG.find(m => m.id === catalogMedId);
    if (!catalogMed) return false;
    return medications.some(m => m.name === catalogMed.name);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card className={cn("border-border", !checklistRequired && "opacity-50")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Clinical Checklist</p>
                <p className="text-2xl font-bold text-foreground">
                  {checklistRequired ? `${completedChecks}/${totalChecks}` : "N/A"}
                </p>
              </div>
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                !checklistRequired ? "bg-muted" : checklistProgress === 100 ? "bg-green-500/10" : "bg-amber-500/10"
              )}>
                {!checklistRequired ? (
                  <X className="w-6 h-6 text-muted-foreground" />
                ) : checklistProgress === 100 ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                )}
              </div>
            </div>
            {checklistRequired && (
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all", checklistProgress === 100 ? "bg-green-500" : "bg-amber-500")}
                  style={{ width: `${checklistProgress}%` }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={cn("border-border", !medsRequired && "opacity-50")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Medications</p>
                <p className="text-2xl font-bold text-foreground">
                  {medsRequired ? medications.length : "N/A"}
                </p>
              </div>
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", medsRequired ? "bg-primary/10" : "bg-muted")}>
                <Pill className={cn("w-6 h-6", medsRequired ? "text-primary" : "text-muted-foreground")} />
              </div>
            </div>
            {medsRequired && (
              <p className="text-xs text-muted-foreground mt-2">
                {medications.filter(m => m.action === "Start").length} new, {medications.filter(m => m.action === "Stop").length} stopped
              </p>
            )}
          </CardContent>
        </Card>

        <Card className={cn("border-border", !followUpRequired && "opacity-50")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Follow-up</p>
                <p className="text-lg font-bold text-foreground">
                  {followUpRequired ? (data.followUps.followUpDate || "Not set") : "N/A"}
                </p>
              </div>
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", followUpRequired ? "bg-blue-500/10" : "bg-muted")}>
                <Calendar className={cn("w-6 h-6", followUpRequired ? "text-blue-600" : "text-muted-foreground")} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Condition</p>
                <p className="text-xl font-bold text-green-600">{data.clinicalStatus.conditionAtDischarge}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Destination: {data.clinicalStatus.destination}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Card className="border-border">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="pb-0 border-b border-border">
            <TabsList className="bg-transparent p-0 h-auto gap-0">
              <TabsTrigger 
                value="clinical" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                <Activity className="w-4 h-4 mr-2" />
                Clinical Status
              </TabsTrigger>
              <TabsTrigger 
                value="medications" 
                className={cn(
                  "rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3",
                  !medsRequired && "opacity-50"
                )}
                disabled={!medsRequired}
              >
                <Pill className="w-4 h-4 mr-2" />
                Medications ({medications.length})
              </TabsTrigger>
              <TabsTrigger 
                value="followups" 
                className={cn(
                  "rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3",
                  !followUpRequired && "opacity-50"
                )}
                disabled={!followUpRequired}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Follow-up
              </TabsTrigger>
              <TabsTrigger 
                value="notes" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                <FileText className="w-4 h-4 mr-2" />
                Notes
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="p-0">
            {/* Clinical Status Tab */}
            <TabsContent value="clinical" className="mt-0 p-6 space-y-6">
              {/* Discharge Reason Selector */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Discharge Reason</h3>
                <Select value={dischargeReason} onValueChange={handleDischargeReasonChange}>
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="treatment_completed">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Treatment Completed
                      </div>
                    </SelectItem>
                    <SelectItem value="improved">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Condition Improved
                      </div>
                    </SelectItem>
                    <SelectItem value="not_improved">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        Not Improved
                      </div>
                    </SelectItem>
                    <SelectItem value="referred_higher_center">
                      <div className="flex items-center gap-2">
                        <Ambulance className="w-4 h-4 text-blue-600" />
                        Referred to Higher Center
                      </div>
                    </SelectItem>
                    <SelectItem value="transferred_other_hospital">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        Transferred to Other Hospital
                      </div>
                    </SelectItem>
                    <SelectItem value="lama">
                      <div className="flex items-center gap-2">
                        <LogOut className="w-4 h-4 text-red-600" />
                        Left Against Medical Advice (LAMA)
                      </div>
                    </SelectItem>
                    <SelectItem value="dama">
                      <div className="flex items-center gap-2">
                        <LogOut className="w-4 h-4 text-red-600" />
                        Discharge Against Medical Advice (DAMA)
                      </div>
                    </SelectItem>
                    <SelectItem value="absconded">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        Absconded
                      </div>
                    </SelectItem>
                    <SelectItem value="death">
                      <div className="flex items-center gap-2">
                        <Skull className="w-4 h-4 text-gray-600" />
                        Death
                      </div>
                    </SelectItem>
                    <SelectItem value="brought_dead">
                      <div className="flex items-center gap-2">
                        <Skull className="w-4 h-4 text-gray-600" />
                        Brought Dead
                      </div>
                    </SelectItem>
                    <SelectItem value="palliative_home">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-purple-600" />
                        Palliative/Terminal Care at Home
                      </div>
                    </SelectItem>
                    <SelectItem value="other">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-600" />
                        Other
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Discharge Reason Notes */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Discharge Notes</h3>
                <Textarea
                  placeholder={`Notes for ${reasonConfig.label}...`}
                  value={data.clinicalStatus.dischargeReasonNotes || ""}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    clinicalStatus: { ...prev.clinicalStatus, dischargeReasonNotes: e.target.value }
                  }))}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Discharge Readiness Checklist */}
                {checklistRequired ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Discharge Readiness Checklist</h3>
                    <div className="space-y-2">
                      {checklistItems.map(item => (
                        <div key={item.key} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                          <Checkbox 
                            id={item.key}
                            checked={checklist[item.key] === true}
                            onCheckedChange={(checked) => handleChecklistChange(item.key, checked as boolean)}
                          />
                          <label htmlFor={item.key} className="text-sm cursor-pointer flex-1">
                            {item.label}
                          </label>
                          {checklist[item.key] && <Check className="w-4 h-4 text-green-600" />}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Checklist Not Required</h3>
                    <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
                      <p className="text-sm text-muted-foreground">
                        Clinical checklist is not required for <span className="font-medium">{reasonConfig.label}</span> discharges.
                      </p>
                    </div>
                  </div>
                )}

                {/* Vitals & Status */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Latest Vitals</h3>
                  {vitals && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                          <Heart className="w-3 h-3" /> Blood Pressure
                        </div>
                        <p className="font-semibold text-foreground">{vitals.bp} mmHg</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                          <Activity className="w-3 h-3" /> Pulse
                        </div>
                        <p className="font-semibold text-foreground">{vitals.pulse} bpm</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                          <Thermometer className="w-3 h-3" /> Temperature
                        </div>
                        <p className="font-semibold text-foreground">{vitals.temp}°F</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                          <Droplets className="w-3 h-3" /> SpO2
                        </div>
                        <p className="font-semibold text-foreground">{vitals.spo2}%</p>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground">Discharge Details</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Condition at Discharge</label>
                        <Select value={data.clinicalStatus.conditionAtDischarge} onValueChange={handleConditionChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Stable">Stable</SelectItem>
                            <SelectItem value="Improved">Improved</SelectItem>
                            <SelectItem value="Unchanged">Unchanged</SelectItem>
                            <SelectItem value="Guarded">Guarded</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Discharge Destination</label>
                        <Select value={data.clinicalStatus.destination} onValueChange={handleDestinationChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Home">Home</SelectItem>
                            <SelectItem value="Rehab">Rehab Facility</SelectItem>
                            <SelectItem value="SNF">Skilled Nursing Facility</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground">Recent Labs</h3>
                    <div className="space-y-2">
                      {labs.map((lab, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            {lab.critical && <AlertCircle className="w-4 h-4 text-red-500" />}
                            <span className="text-sm font-medium">{lab.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{lab.value}</p>
                            <p className="text-xs text-muted-foreground">{lab.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Medications Tab - Patient Services Style Layout */}
            <TabsContent value="medications" className="mt-0">
              <div className="flex h-[600px]">

                {/* Center - Medications List */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Search Header */}
                  <div className="p-4 border-b border-border bg-background">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search medications..."
                        value={medSearch}
                        onChange={(e) => setMedSearch(e.target.value)}
                        className="pl-9 bg-background h-9"
                      />
                    </div>
                  </div>

                  {/* Medication List */}
                  <ScrollArea className="flex-1">
                    {filteredCatalogMeds.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <Package className="w-12 h-12 text-muted-foreground/50 mb-3" />
                        <p className="text-sm font-medium text-foreground">No medications found</p>
                        <p className="text-xs text-muted-foreground mt-1">Try a different search term or category</p>
                      </div>
                    ) : (
                      <div className="p-3 space-y-2">
                        {filteredCatalogMeds.map(med => {
                          const isInCart = isMedicationInCart(med.id);
                          return (
                            <div 
                              key={med.id}
                              className={cn(
                                "flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer group",
                                isInCart 
                                  ? "bg-green-500/5 border-green-500/30" 
                                  : "bg-card border-border hover:border-primary/40 hover:shadow-sm"
                              )}
                              onClick={() => !isInCart && handleAddMedicationFromCatalog(med)}
                            >
                              {/* Main Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-sm text-foreground">{med.name}</h4>
                                  <Badge className="text-[10px] font-mono px-1.5 py-0 shrink-0 bg-primary/10 text-primary border-0">
                                    {med.defaultStrength}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                  {med.genericName} • {med.brandName}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                                    {med.category}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">•</span>
                                  <span className="text-[10px] text-muted-foreground">{med.form}</span>
                                </div>
                              </div>

                              {/* Add Button / Added State */}
                              {isInCart ? (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 shrink-0">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span className="text-xs font-medium">Added</span>
                                </div>
                              ) : (
                                <Button 
                                  size="sm" 
                                  className="h-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 gap-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddMedicationFromCatalog(med);
                                  }}
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  Add
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </div>

                {/* Right Side - Prescription Cart */}
                <div className="w-[480px] border-l border-border flex flex-col bg-background">
                  {/* Cart Header */}
                  <div className="p-4 border-b border-border bg-primary">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-primary-foreground">Discharge Prescription</h3>
                        <p className="text-xs text-primary-foreground/80">{medications.length} medications</p>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 text-primary-foreground" />
                      </div>
                    </div>
                  </div>

                  {/* Cart Items */}
                  <ScrollArea className="flex-1">
                    <div className="p-3 space-y-2">
                      {medications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <Pill className="w-10 h-10 text-muted-foreground/40 mb-3" />
                          <p className="text-sm font-medium text-foreground">No medications added</p>
                          <p className="text-xs text-muted-foreground mt-1">Select medications from the list</p>
                        </div>
                      ) : (
                        medications.map((med, index) => (
                          <div key={med.medId} className="rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                            {/* Med Header */}
                            <div className="flex items-start justify-between gap-2 p-3 pb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                  {index + 1}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm text-foreground">{med.name}</h4>
                                  <p className="text-[11px] text-muted-foreground">{med.genericName} • {med.form}</p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteMedication(med.medId)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>

                            {/* Quick Edit Fields */}
                            <div className="px-3 pb-3 grid grid-cols-4 gap-2">
                              <div>
                                <label className="text-[10px] text-muted-foreground font-medium mb-1 block">Strength</label>
                                <Select 
                                  value={med.strength || ""} 
                                  onValueChange={(v) => handleUpdateMedication(med.medId, 'strength', v)}
                                >
                                  <SelectTrigger className="h-8 text-xs bg-muted/50">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {STRENGTH_OPTIONS.map(opt => (
                                      <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-[10px] text-muted-foreground font-medium mb-1 block">Dosage</label>
                                <Select 
                                  value={med.dose} 
                                  onValueChange={(v) => handleUpdateMedication(med.medId, 'dose', v)}
                                >
                                  <SelectTrigger className="h-8 text-xs bg-muted/50">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {DOSAGE_OPTIONS.map(opt => (
                                      <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-[10px] text-muted-foreground font-medium mb-1 block">Frequency</label>
                                <Select 
                                  value={med.frequency} 
                                  onValueChange={(v) => handleUpdateMedication(med.medId, 'frequency', v)}
                                >
                                  <SelectTrigger className="h-8 text-xs bg-muted/50">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {FREQUENCY_OPTIONS.map(opt => (
                                      <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-[10px] text-muted-foreground font-medium mb-1 block">Duration</label>
                                <Select 
                                  value={med.duration} 
                                  onValueChange={(v) => handleUpdateMedication(med.medId, 'duration', v)}
                                >
                                  <SelectTrigger className="h-8 text-xs bg-muted/50">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {DURATION_OPTIONS.map(opt => (
                                      <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Footer with Route & ATC */}
                            <div className="flex items-center justify-between gap-2 px-3 py-2 bg-muted/30 rounded-b-xl border-t border-border">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-[10px] font-medium">
                                  {med.route}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground">Route</span>
                              </div>
                              {med.drugCode && (
                                <span className="text-[10px] text-muted-foreground font-mono bg-background px-2 py-0.5 rounded">
                                  ATC: {med.drugCode}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>

                  {/* Cart Footer Summary */}
                  {medications.length > 0 && (
                    <div className="p-3 border-t border-border bg-muted/30">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Medications</span>
                        <span className="font-semibold">{medications.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                        <span>New medications</span>
                        <span>{medications.filter(m => m.action === "Start").length}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Continued</span>
                        <span>{medications.filter(m => m.action === "Continue").length}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Follow-up Tab */}
            <TabsContent value="followups" className="mt-0 p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Recommended Follow-up Date</label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Suggest when the patient should return for follow-up.
                  </p>
                  <input
                    type="date"
                    value={data.followUps.followUpDate || ""}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      followUps: { ...prev.followUps, followUpDate: e.target.value }
                    }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  {data.followUps.followUpDate && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Recommendation:</span> Patient should schedule a follow-up on{" "}
                        <span className="font-semibold text-primary">
                          {new Date(data.followUps.followUpDate).toLocaleDateString("en-IN", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        Patient will be advised to contact the front desk to book this appointment.
                      </p>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Reason for Follow-up</label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Specify the purpose of the follow-up visit.
                  </p>
                  <Textarea
                    placeholder="e.g., Review blood test results, wound check, medication adjustment..."
                    value={data.followUps.followUpReason || ""}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      followUps: { ...prev.followUps, followUpReason: e.target.value }
                    }))}
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="mt-0 p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Doctor's Notes</label>
                <Textarea 
                  value={data.notesAttachments.doctorNote}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    notesAttachments: { ...prev.notesAttachments, doctorNote: e.target.value }
                  }))}
                  rows={6}
                  className="resize-none"
                />
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Sign-off Section */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Checkbox 
                id="confirm-discharge"
                checked={data.signoff.confirmFitForDischarge}
                onCheckedChange={(checked) => setData(prev => ({
                  ...prev,
                  signoff: { ...prev.signoff, confirmFitForDischarge: checked as boolean }
                }))}
              />
              <label htmlFor="confirm-discharge" className="text-sm font-medium cursor-pointer">
                {reasonConfig.confirmationText}
              </label>
            </div>
            <Button 
              onClick={handleSignoff}
              disabled={!canSignOff}
              className="gap-2"
            >
              Sign & Clear
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          {checklistRequired && checklistProgress < 100 && (
            <p className="text-sm text-amber-600 mt-2">
              Complete all checklist items to proceed with sign-off
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
