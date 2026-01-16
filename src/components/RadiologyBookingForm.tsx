import { useState } from "react";
import { Check, Minus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import { DiagnosticsSlotPicker } from "@/components/booking/DiagnosticsSlotPicker";

export interface RadiologyTest {
  id: string;
  name: string;
  category: string;
  price: number;
}

export interface RadiologyData {
  radiologyType: string;
  ageGroup: "adults" | "kids";
  selectedTests: RadiologyTest[];
  date: Date;
  time: string;
}

interface RadiologyBookingFormProps {
  onRemove: () => void;
  onUpdate: (data: RadiologyData) => void;
}

const radiologyTests: RadiologyTest[] = [
  { id: "1", name: "Chest (PA View)", category: "Radiology", price: 500 },
  { id: "2", name: "Cervical Spine", category: "Radiology", price: 600 },
  { id: "3", name: "Lumbar Spine", category: "Radiology", price: 700 },
  { id: "4", name: "Abdomen (KUB)", category: "Radiology", price: 300 },
  { id: "5", name: "Hand / Wrist", category: "Radiology", price: 400 },
  { id: "6", name: "Knee Joint (Both)", category: "Radiology", price: 500 },
  { id: "7", name: "Chest (PA View)", category: "Radiology", price: 500 },
  { id: "8", name: "Cervical Spine", category: "Radiology", price: 600 },
];


export const RadiologyBookingForm = ({ onRemove, onUpdate }: RadiologyBookingFormProps) => {
  const [radiologyType, setRadiologyType] = useState("X-Ray");
  const [ageGroup, setAgeGroup] = useState<"adults" | "kids">("adults");
  const [selectedTests, setSelectedTests] = useState<RadiologyTest[]>([
    { id: "1", name: "Chest (PA View)", category: "Radiology", price: 500 },
    { id: "2", name: "Cervical Spine", category: "Radiology", price: 600 },
  ]);
  const [date, setDate] = useState<Date>(new Date(2025, 7, 5));
  const [selectedTime, setSelectedTime] = useState("07:30");
  const [searchQuery, setSearchQuery] = useState("");

  const handleRadiologyTypeChange = (value: string) => {
    setRadiologyType(value);
    onUpdate({ radiologyType: value, ageGroup, selectedTests, date, time: selectedTime });
  };

  const handleAgeGroupChange = (value: "adults" | "kids") => {
    setAgeGroup(value);
    onUpdate({ radiologyType, ageGroup: value, selectedTests, date, time: selectedTime });
  };

  const handleTestToggle = (test: RadiologyTest) => {
    const isSelected = selectedTests.some(t => t.id === test.id);
    const newTests = isSelected
      ? selectedTests.filter(t => t.id !== test.id)
      : [...selectedTests, test];
    setSelectedTests(newTests);
    onUpdate({ radiologyType, ageGroup, selectedTests: newTests, date, time: selectedTime });
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    onUpdate({ radiologyType, ageGroup, selectedTests, date, time });
  };

  const handleDateSelect = (newDate: Date) => {
    setDate(newDate);
    onUpdate({ radiologyType, ageGroup, selectedTests, date: newDate, time: selectedTime });
  };

  const filteredTests = radiologyTests.filter(test =>
    test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Radiology</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-primary"
        >
          Remove
        </Button>
      </div>

      <div className="space-y-6">
        {/* Radiology Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Radiology Type
            </label>
            <Select value={radiologyType} onValueChange={handleRadiologyTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="X-Ray">X-Ray</SelectItem>
                <SelectItem value="CT Scan">CT Scan</SelectItem>
                <SelectItem value="MRI">MRI</SelectItem>
                <SelectItem value="Ultrasound">Ultrasound</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Radiology
            </label>
            <Tabs value={ageGroup} onValueChange={(v) => handleAgeGroupChange(v as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="adults">Adults</TabsTrigger>
                <TabsTrigger value="kids">Kids</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Radiology Tests */}
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
          
          <Tabs value={ageGroup} onValueChange={(v) => handleAgeGroupChange(v as any)}>
            <TabsContent value="adults" className="grid grid-cols-2 gap-3 mt-0">
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

            <TabsContent value="kids" className="grid grid-cols-2 gap-3 mt-0">
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

        {/* Date & Time */}
        <DiagnosticsSlotPicker
          selectedDate={date}
          selectedTime={selectedTime}
          onDateSelect={handleDateSelect}
          onTimeSelect={handleTimeSelect}
          label="Radiology Date & Time"
          locationName="Radiology Center"
        />
      </div>
    </Card>
  );
};
