import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { PageContent } from "@/components/PageContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ChevronDown, ChevronLeft, Plus, Trash2, Save, Upload, FileText, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Step = 1 | 2;

interface ScheduleBlock {
  start: string;
  end: string;
  location: string;
  mode: "in_person" | "telehealth" | "both";
  duration: number;
  capacity: number;
}

interface DaySchedule {
  day: number;
  blocks: ScheduleBlock[];
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_ABBREVS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MOCK_LOCATIONS = [
  { id: "main", name: "Main Clinic" },
  { id: "branch-a", name: "Branch A" },
  { id: "branch-b", name: "Branch B" },
];

export default function DoctorForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [advancedOpen1, setAdvancedOpen1] = useState(false);

  // Form state - Step 1
  const [displayName, setDisplayName] = useState("");
  const [department, setDepartment] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [degrees, setDegrees] = useState("");
  const [experience, setExperience] = useState("");
  const [languages, setLanguages] = useState("");
  const [acceptingPatients, setAcceptingPatients] = useState(true);
  const [licenseNo, setLicenseNo] = useState("");
  const [documents, setDocuments] = useState<{ name: string; type: string; size: number }[]>([]);

  // Form state - Step 2 (Schedule)
  const [weekPattern, setWeekPattern] = useState<DaySchedule[]>([]);
  const [editingBlock, setEditingBlock] = useState<{ day: number; blockIndex: number } | null>(null);
  const [addingToDay, setAddingToDay] = useState<number | null>(null);
  const [blockForm, setBlockForm] = useState<{ start: string; end: string; location: string; mode: "in_person" | "telehealth" | "both"; duration: number; capacity: number }>({ start: "09:00", end: "13:00", location: "main", mode: "in_person", duration: 30, capacity: 1 });

  // Form state - Fees
  const [fee, setFee] = useState("");
  const [telemedicineFee, setTelemedicineFee] = useState("");
  const [sameFee, setSameFee] = useState(true);

  // Handle step parameter from URL
  useEffect(() => {
    const step = searchParams.get("step");
    if (step === "availability") {
      setCurrentStep(2);
    }
  }, [searchParams]);

  const handleNext = () => {
    // Validation
    if (currentStep === 1) {
      if (!displayName || !department || !specialty || !email || !phone) {
        toast({ title: "Please fill all required fields", variant: "destructive" });
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 2) as Step);
  };

  // Schedule helper functions
  const getDayBlocks = (day: number): ScheduleBlock[] => {
    const daySchedule = weekPattern.find(d => d.day === day);
    return daySchedule?.blocks || [];
  };

  const handleAddBlock = (day: number) => {
    setBlockForm({ start: "09:00", end: "13:00", location: "main", mode: "in_person", duration: 30, capacity: 1 });
    setAddingToDay(day);
  };

  const handleEditBlock = (day: number, blockIndex: number) => {
    const blocks = getDayBlocks(day);
    const block = blocks[blockIndex];
    setBlockForm({
      start: block.start,
      end: block.end,
      location: block.location || "main",
      mode: block.mode || "in_person",
      duration: block.duration || 30,
      capacity: block.capacity || 1,
    });
    setEditingBlock({ day, blockIndex });
  };

  const handleDeleteBlock = (day: number, blockIndex: number) => {
    setWeekPattern(prev => {
      const newSchedule = [...prev];
      const dayIndex = newSchedule.findIndex(d => d.day === day);
      if (dayIndex >= 0) {
        newSchedule[dayIndex] = {
          ...newSchedule[dayIndex],
          blocks: newSchedule[dayIndex].blocks.filter((_, i) => i !== blockIndex),
        };
        if (newSchedule[dayIndex].blocks.length === 0) {
          return newSchedule.filter(d => d.day !== day);
        }
      }
      return newSchedule;
    });
  };

  const handleSaveBlock = () => {
    const newBlock: ScheduleBlock = {
      start: blockForm.start,
      end: blockForm.end,
      location: blockForm.location,
      mode: blockForm.mode,
      duration: blockForm.duration,
      capacity: blockForm.capacity,
    };

    if (addingToDay !== null) {
      setWeekPattern(prev => {
        const dayIndex = prev.findIndex(d => d.day === addingToDay);
        if (dayIndex >= 0) {
          const updated = [...prev];
          updated[dayIndex] = {
            ...updated[dayIndex],
            blocks: [...updated[dayIndex].blocks, newBlock].sort((a, b) => a.start.localeCompare(b.start)),
          };
          return updated;
        }
        return [...prev, { day: addingToDay, blocks: [newBlock] }].sort((a, b) => a.day - b.day);
      });
      setAddingToDay(null);
    } else if (editingBlock) {
      setWeekPattern(prev => {
        const newSchedule = [...prev];
        const dayIndex = newSchedule.findIndex(d => d.day === editingBlock.day);
        if (dayIndex >= 0) {
          newSchedule[dayIndex] = {
            ...newSchedule[dayIndex],
            blocks: newSchedule[dayIndex].blocks.map((b, i) =>
              i === editingBlock.blockIndex ? newBlock : b
            ).sort((a, b) => a.start.localeCompare(b.start)),
          };
        }
        return newSchedule;
      });
      setEditingBlock(null);
    }
  };

  const handleCopyMonToWeekdays = () => {
    const mondayBlocks = getDayBlocks(1);
    if (mondayBlocks.length === 0) {
      toast({ title: "No schedule on Monday to copy", variant: "destructive" });
      return;
    }
    setWeekPattern(prev => {
      let updated = prev.filter(d => ![2, 3, 4, 5].includes(d.day));
      [2, 3, 4, 5].forEach(day => {
        updated.push({ day, blocks: [...mondayBlocks] });
      });
      return updated.sort((a, b) => a.day - b.day);
    });
    toast({ title: "Copied Monday schedule to weekdays" });
  };

  const getLocationName = (locationId: string) => {
    return MOCK_LOCATIONS.find(l => l.id === locationId)?.name || "Unknown";
  };

  const getModeColor = (mode: string) => {
    if (mode === "telehealth") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    if (mode === "both") return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as Step);
  };

  const handleSaveDraft = () => {
    // Validation
    if (!displayName || !department || !specialty || !email || !phone || !fee) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    toast({ title: "Doctor saved as draft." });
    navigate("/doctors");
  };

  const handleSaveAndActivate = () => {
    // Validation
    if (!displayName || !department || !specialty || !email || !phone || !fee) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    if (!licenseNo) {
      toast({ title: "License is required to activate", variant: "destructive" });
      return;
    }
    toast({ title: "Doctor activated." });
    navigate("/doctors");
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <PageContent>
        <AppHeader breadcrumbs={["Doctors", id ? "Edit Doctor" : "Add New Doctor"]} />
        
        <main className="p-6 max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate("/doctors")}
            className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Doctors
          </button>

          {/* Stepper */}
          <div className="mb-8 flex items-center justify-center gap-4">
            {[1, 2].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step}
                </div>
                <span className="text-sm font-medium">
                  {step === 1 && "Basic Info"}
                  {step === 2 && "Availability & Fees"}
                </span>
                {step < 2 && (
                  <div className="w-12 h-[2px] bg-muted mx-2" />
                )}
              </div>
            ))}
          </div>

          <Card className="p-6">
            {/* Step 1 - Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-sm font-semibold">Basic Information</h2>
                
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="displayName">Display Name *</Label>
                    <Input
                      id="displayName"
                      placeholder="e.g., Dr. Meera Nair"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Display name appears to patients.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department">Department *</Label>
                      <Select value={department} onValueChange={setDepartment}>
                        <SelectTrigger id="department">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cardiology">Cardiology</SelectItem>
                          <SelectItem value="endocrinology">Endocrinology</SelectItem>
                          <SelectItem value="orthopedics">Orthopedics</SelectItem>
                          <SelectItem value="neurology">Neurology</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="specialty">Specialty *</Label>
                      <Select value={specialty} onValueChange={setSpecialty}>
                        <SelectTrigger id="specialty">
                          <SelectValue placeholder="Select specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="interventional">Interventional Cardiology</SelectItem>
                          <SelectItem value="diabetes">Diabetes & Metabolism</SelectItem>
                          <SelectItem value="joint">Joint Replacement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="doctor@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="licenseNo">License/Registration No.</Label>
                    <Input
                      id="licenseNo"
                      placeholder="MCI-XXXXXXX"
                      value={licenseNo}
                      onChange={(e) => setLicenseNo(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      License is required to activate.
                    </p>
                  </div>

                  {/* Documents Upload Section */}
                  <div className="space-y-3">
                    <Label>Documents</Label>
                    <p className="text-xs text-muted-foreground -mt-2">
                      Upload license certificate, ID proof, qualifications, etc.
                    </p>
                    
                    {/* Upload Area */}
                    <label
                      htmlFor="doc-upload"
                      className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </span>
                      <span className="text-xs text-muted-foreground">
                        PDF, JPG, PNG up to 10MB each
                      </span>
                      <input
                        id="doc-upload"
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files) {
                            const newDocs = Array.from(files).map((f) => ({
                              name: f.name,
                              type: f.type,
                              size: f.size,
                            }));
                            setDocuments((prev) => [...prev, ...newDocs]);
                          }
                          e.target.value = "";
                        }}
                      />
                    </label>

                    {/* Uploaded Files List */}
                    {documents.length > 0 && (
                      <div className="space-y-2">
                        {documents.map((doc, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(doc.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                setDocuments((prev) => prev.filter((_, i) => i !== idx))
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Advanced Options */}
                  <Collapsible open={advancedOpen1} onOpenChange={setAdvancedOpen1}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between">
                        Advanced Options
                        <ChevronDown className={`w-4 h-4 transition-transform ${advancedOpen1 ? "rotate-180" : ""}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="degrees">Degrees</Label>
                        <Input
                          id="degrees"
                          placeholder="e.g., MBBS, MD"
                          value={degrees}
                          onChange={(e) => setDegrees(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="experience">Experience (years)</Label>
                        <Input
                          id="experience"
                          type="number"
                          placeholder="e.g., 15"
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="languages">Languages</Label>
                        <Input
                          id="languages"
                          placeholder="e.g., English, Hindi, Tamil"
                          value={languages}
                          onChange={(e) => setLanguages(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="acceptingPatients">Accepting new patients</Label>
                        <Switch
                          id="acceptingPatients"
                          checked={acceptingPatients}
                          onCheckedChange={setAcceptingPatients}
                        />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
            )}

            {/* Step 2 - Schedule & Fees */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Weekly Schedule</h2>
                </div>

                {/* Week Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {DAYS.map((day, dayIndex) => (
                    <div key={dayIndex} className="min-h-[180px]">
                      <div className="text-sm font-medium text-center mb-2 pb-2 border-b">
                        {DAY_ABBREVS[dayIndex]}
                      </div>
                      <div className="space-y-2">
                        {getDayBlocks(dayIndex).map((block, blockIndex) => (
                          <div
                            key={blockIndex}
                            className={`p-2 rounded-md border cursor-pointer hover:shadow-sm transition-shadow ${getModeColor(block.mode)}`}
                            onClick={() => handleEditBlock(dayIndex, blockIndex)}
                          >
                            <div className="text-xs font-medium">
                              {block.start} - {block.end}
                            </div>
                            <div className="text-xs opacity-75 mt-1">
                              {getLocationName(block.location)}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 mt-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBlock(dayIndex, blockIndex);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full h-8 border-dashed border"
                          onClick={() => handleAddBlock(dayIndex)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Copy Actions */}
                <div className="flex items-center gap-2 pt-4 border-t">
                  <span className="text-sm text-muted-foreground">Quick copy:</span>
                  <Button variant="outline" size="sm" onClick={handleCopyMonToWeekdays}>
                    Mon → Weekdays
                  </Button>
                </div>

                {/* Fees Section */}
                <div className="pt-6 border-t space-y-4">
                  <h3 className="text-lg font-medium">Consultation Fees</h3>
                  
                  <div>
                    <Label htmlFor="fee">Fee (in-person) *</Label>
                    <Input
                      id="fee"
                      type="number"
                      placeholder="1,500"
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                    />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Checkbox
                        id="sameFee"
                        checked={sameFee}
                        onCheckedChange={(checked) => setSameFee(checked as boolean)}
                      />
                      <Label htmlFor="sameFee" className="font-normal cursor-pointer">
                        Telemedicine fee same as in-person
                      </Label>
                    </div>
                    {!sameFee && (
                      <div>
                        <Label htmlFor="telemedicineFee">Telemedicine Fee</Label>
                        <Input
                          id="telemedicineFee"
                          type="number"
                          placeholder="1,200"
                          value={telemedicineFee}
                          onChange={(e) => setTelemedicineFee(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Block Edit Dialog */}
            <Dialog open={addingToDay !== null || editingBlock !== null} onOpenChange={() => {
              setAddingToDay(null);
              setEditingBlock(null);
            }}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingBlock ? "Edit Time Block" : `Add Block - ${addingToDay !== null ? DAYS[addingToDay] : ""}`}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={blockForm.start}
                        onChange={(e) => setBlockForm({ ...blockForm, start: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={blockForm.end}
                        onChange={(e) => setBlockForm({ ...blockForm, end: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Location</Label>
                    <Select
                      value={blockForm.location}
                      onValueChange={(v) => setBlockForm({ ...blockForm, location: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_LOCATIONS.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Mode</Label>
                    <Select
                      value={blockForm.mode}
                      onValueChange={(v) => setBlockForm({ ...blockForm, mode: v as "in_person" | "telehealth" | "both" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_person">In-person</SelectItem>
                        <SelectItem value="telehealth">Telehealth</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Duration (min)</Label>
                      <Input
                        type="number"
                        min={5}
                        placeholder="30"
                        value={blockForm.duration}
                        onChange={(e) => setBlockForm({ ...blockForm, duration: parseInt(e.target.value) || 30 })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Default: 30 min per slot
                      </p>
                    </div>
                    <div>
                      <Label>Patients per Slot</Label>
                      <Input
                        type="number"
                        min={1}
                        value={blockForm.capacity}
                        onChange={(e) => setBlockForm({ ...blockForm, capacity: parseInt(e.target.value) || 1 })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Patients booked per time slot
                      </p>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setAddingToDay(null);
                    setEditingBlock(null);
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveBlock}>
                    {editingBlock ? "Update" : "Add Block"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
              {currentStep < 2 ? (
                <Button onClick={handleNext} className="ml-auto">
                  Next
                </Button>
              ) : (
                <div className="flex gap-3 ml-auto">
                  <Button variant="outline" onClick={handleSaveDraft}>
                    Save as Draft
                  </Button>
                  <Button onClick={handleSaveAndActivate}>
                    Save & Activate
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </main>
      </PageContent>
    </div>
  );
}
