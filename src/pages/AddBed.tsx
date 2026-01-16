import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { PageContent } from "@/components/PageContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, Save, BedDouble } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Step = 1 | 2;

const FLOORS = [
  { id: "F1", name: "Ground Floor" },
  { id: "F2", name: "First Floor" },
  { id: "F3", name: "Second Floor" },
  { id: "F4", name: "Third Floor" },
  { id: "F5", name: "Fourth Floor" },
];

const WARDS = [
  { id: "ER", name: "Emergency", floor: "F1" },
  { id: "OBS", name: "Observation", floor: "F1" },
  { id: "ICU", name: "Intensive Care Unit", floor: "F2" },
  { id: "HDU", name: "High Dependency Unit", floor: "F2" },
  { id: "WARD-A", name: "General Ward A", floor: "F3" },
  { id: "WARD-B", name: "General Ward B", floor: "F3" },
  { id: "PVT", name: "Private Rooms", floor: "F4" },
  { id: "ISO", name: "Isolation Ward", floor: "F4" },
  { id: "SURG", name: "Surgical Ward", floor: "F5" },
  { id: "ORTHO", name: "Orthopedics", floor: "F5" },
];

const BED_TYPES = [
  { id: "ICU", name: "ICU", description: "Intensive Care Unit bed with full monitoring" },
  { id: "HDU", name: "HDU", description: "High Dependency Unit bed" },
  { id: "Ward", name: "General Ward", description: "Standard ward bed" },
  { id: "Private", name: "Private Room", description: "Single occupancy private room" },
  { id: "Isolation", name: "Isolation", description: "Negative pressure isolation bed" },
];

const AMENITIES = [
  { id: "O2", name: "Oxygen Supply" },
  { id: "Ventilator", name: "Ventilator" },
  { id: "Monitor", name: "Patient Monitor" },
  { id: "IV Pump", name: "IV Pump" },
  { id: "Suction", name: "Suction Unit" },
  { id: "Negative Pressure", name: "Negative Pressure" },
  { id: "AC", name: "Air Conditioning" },
  { id: "TV", name: "Television" },
  { id: "Attached Bath", name: "Attached Bathroom" },
];

export default function AddBed() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Step 1 - Location Details
  const [floor, setFloor] = useState("");
  const [ward, setWard] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [bedNumber, setBedNumber] = useState("");
  const [bedType, setBedType] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Step 2 - Pricing & Amenities
  const [pricePerDay, setPricePerDay] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [insuranceCovered, setInsuranceCovered] = useState(true);
  const [maxOccupancy, setMaxOccupancy] = useState("1");

  const filteredWards = WARDS.filter((w) => w.floor === floor);

  const handleAmenityToggle = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((a) => a !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!floor || !ward || !roomNumber || !bedNumber || !bedType) {
        toast({ title: "Please fill all required fields", variant: "destructive" });
        return;
      }
    }
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSaveDraft = () => {
    if (!floor || !ward || !roomNumber || !bedNumber || !bedType) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    toast({ title: "Bed saved as draft" });
    navigate("/patients/check-in");
  };

  const handleSaveAndActivate = () => {
    if (!floor || !ward || !roomNumber || !bedNumber || !bedType || !pricePerDay) {
      toast({ title: "Please fill all required fields including pricing", variant: "destructive" });
      return;
    }
    toast({ title: "Bed created and activated successfully" });
    navigate("/patients/check-in");
  };

  // Auto-suggest price based on bed type
  const handleBedTypeChange = (type: string) => {
    setBedType(type);
    const prices: Record<string, string> = {
      ICU: "15000",
      HDU: "10000",
      Ward: "2500",
      Private: "8000",
      Isolation: "6000",
    };
    if (!pricePerDay && prices[type]) {
      setPricePerDay(prices[type]);
    }
    // Auto-select amenities based on bed type
    const amenitiesByType: Record<string, string[]> = {
      ICU: ["O2", "Ventilator", "Monitor", "IV Pump", "Suction"],
      HDU: ["O2", "Monitor", "IV Pump"],
      Ward: ["O2"],
      Private: ["O2", "Monitor", "AC", "TV", "Attached Bath"],
      Isolation: ["O2", "Negative Pressure", "Monitor"],
    };
    if (amenitiesByType[type]) {
      setSelectedAmenities(amenitiesByType[type]);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <PageContent>
        <AppHeader breadcrumbs={["Beds Availability", "Add New Bed"]} />

        <main className="p-6 max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate("/patients/check-in")}
            className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Beds
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
                  {step === 1 && "Location & Type"}
                  {step === 2 && "Pricing & Amenities"}
                </span>
                {step < 2 && <div className="w-12 h-[2px] bg-muted mx-2" />}
              </div>
            ))}
          </div>

          <Card className="p-6">
            {/* Step 1 - Location & Type */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BedDouble className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Location & Type</h2>
                    <p className="text-sm text-muted-foreground">
                      Define where this bed is located and its type
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="floor">Floor *</Label>
                      <Select value={floor} onValueChange={(v) => { setFloor(v); setWard(""); }}>
                        <SelectTrigger id="floor">
                          <SelectValue placeholder="Select floor" />
                        </SelectTrigger>
                        <SelectContent>
                          {FLOORS.map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="ward">Ward/Unit *</Label>
                      <Select value={ward} onValueChange={setWard} disabled={!floor}>
                        <SelectTrigger id="ward">
                          <SelectValue placeholder={floor ? "Select ward" : "Select floor first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredWards.map((w) => (
                            <SelectItem key={w.id} value={w.id}>
                              {w.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="roomNumber">Room Number *</Label>
                      <Input
                        id="roomNumber"
                        placeholder="e.g., 101, A-12"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Physical room identifier
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="bedNumber">Bed Number *</Label>
                      <Input
                        id="bedNumber"
                        placeholder="e.g., 1, A, 01"
                        value={bedNumber}
                        onChange={(e) => setBedNumber(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Unique bed identifier within room
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bedType">Bed Type *</Label>
                    <Select value={bedType} onValueChange={handleBedTypeChange}>
                      <SelectTrigger id="bedType">
                        <SelectValue placeholder="Select bed type" />
                      </SelectTrigger>
                      <SelectContent>
                        {BED_TYPES.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            <div className="flex flex-col">
                              <span>{t.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {bedType && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {BED_TYPES.find((t) => t.id === bedType)?.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <Label htmlFor="isActive" className="font-medium">Bed Status</Label>
                      <p className="text-xs text-muted-foreground">
                        Active beds are available for patient allocation
                      </p>
                    </div>
                    <Switch
                      id="isActive"
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                  </div>
                </div>

                {/* Next Button */}
                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={handleNext}>
                    Continue to Pricing
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2 - Pricing & Amenities */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BedDouble className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Pricing & Amenities</h2>
                    <p className="text-sm text-muted-foreground">
                      Set pricing and available facilities for this bed
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pricePerDay">Price Per Day (₹) *</Label>
                      <Input
                        id="pricePerDay"
                        type="number"
                        placeholder="e.g., 5000"
                        value={pricePerDay}
                        onChange={(e) => setPricePerDay(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Base daily tariff for this bed
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="depositAmount">Deposit Amount (₹)</Label>
                      <Input
                        id="depositAmount"
                        type="number"
                        placeholder="e.g., 10000"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Required advance deposit
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxOccupancy">Max Occupancy</Label>
                      <Select value={maxOccupancy} onValueChange={setMaxOccupancy}>
                        <SelectTrigger id="maxOccupancy">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Patient</SelectItem>
                          <SelectItem value="2">2 Patients</SelectItem>
                          <SelectItem value="3">3 Patients</SelectItem>
                          <SelectItem value="4">4 Patients</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-3 pt-6">
                      <Checkbox
                        id="insuranceCovered"
                        checked={insuranceCovered}
                        onCheckedChange={(checked) => setInsuranceCovered(checked as boolean)}
                      />
                      <Label htmlFor="insuranceCovered" className="font-normal cursor-pointer">
                        Insurance covered
                      </Label>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-3 block">Amenities & Equipment</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {AMENITIES.map((amenity) => (
                        <div
                          key={amenity.id}
                          className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedAmenities.includes(amenity.id)
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => handleAmenityToggle(amenity.id)}
                        >
                          <Checkbox
                            checked={selectedAmenities.includes(amenity.id)}
                            onCheckedChange={() => handleAmenityToggle(amenity.id)}
                          />
                          <span className="text-sm">{amenity.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional notes about this bed..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Summary */}
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <h3 className="font-medium">Bed Summary</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Location:</div>
                      <div>{FLOORS.find(f => f.id === floor)?.name} → {WARDS.find(w => w.id === ward)?.name}</div>
                      <div className="text-muted-foreground">Room/Bed:</div>
                      <div>{roomNumber} / {bedNumber}</div>
                      <div className="text-muted-foreground">Type:</div>
                      <div>{BED_TYPES.find(t => t.id === bedType)?.name}</div>
                      <div className="text-muted-foreground">Daily Rate:</div>
                      <div className="font-medium">₹{Number(pricePerDay).toLocaleString()}</div>
                      <div className="text-muted-foreground">Amenities:</div>
                      <div>{selectedAmenities.length} selected</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleSaveDraft}>
                      <Save className="w-4 h-4 mr-2" />
                      Save as Draft
                    </Button>
                    <Button onClick={handleSaveAndActivate}>
                      Save & Activate
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </main>
      </PageContent>
    </div>
  );
}
