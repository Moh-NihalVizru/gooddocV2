import { useState } from "react";
import { X, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ConsultationBookingFormProps {
  onRemove?: () => void;
  onUpdate: (data: ConsultationData) => void;
}

export interface ConsultationData {
  mode: "in-person" | "telehealth";
  type: string;
  department: string;
  doctor: string;
  clinicalInfo: string;
  date: Date;
  time: string;
}

const timeSlots = [
  "00:00", "00:30", "01:00", "01:30", "02:00", "02:30",
  "03:00", "03:30", "04:00", "04:30", "05:00", "05:30",
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", 
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
  "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"
];

export function ConsultationBookingForm({ onRemove, onUpdate }: ConsultationBookingFormProps) {
  const [mode, setMode] = useState<"in-person" | "telehealth">("in-person");
  const [consultationType, setConsultationType] = useState("First Visit");
  const [department, setDepartment] = useState("Cardiology");
  const [doctor, setDoctor] = useState("Dr. Meera Nair – Cardiology");
  const [clinicalInfo, setClinicalInfo] = useState("");
  const [date, setDate] = useState<Date>(new Date(2025, 7, 5)); // 05/08/2025
  const [selectedTime, setSelectedTime] = useState("07:30");

  const handleUpdate = () => {
    onUpdate({
      mode,
      type: consultationType,
      department,
      doctor,
      clinicalInfo,
      date,
      time: selectedTime,
    });
  };

  // Update parent whenever any field changes
  const handleChange = (field: string, value: any) => {
    const updates: any = {
      mode,
      type: consultationType,
      department,
      doctor,
      clinicalInfo,
      date,
      time: selectedTime,
    };

    switch (field) {
      case "mode":
        setMode(value);
        updates.mode = value;
        break;
      case "type":
        setConsultationType(value);
        updates.type = value;
        break;
      case "department":
        setDepartment(value);
        updates.department = value;
        break;
      case "doctor":
        setDoctor(value);
        updates.doctor = value;
        break;
      case "clinicalInfo":
        setClinicalInfo(value);
        updates.clinicalInfo = value;
        break;
      case "date":
        setDate(value);
        updates.date = value;
        break;
      case "time":
        setSelectedTime(value);
        updates.time = value;
        break;
    }

    onUpdate(updates);
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Consultation</h3>
        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-primary"
          >
            Remove
          </Button>
        )}
      </div>

      {/* Mode of Consultation */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-3">
              Mode of Consultation
            </label>
            <Tabs value={mode} onValueChange={(v) => handleChange("mode", v as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="in-person">In-Person</TabsTrigger>
                <TabsTrigger value="telehealth">Telehealth</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-3">
              Consultation Type
            </label>
            <Select value={consultationType} onValueChange={(value) => handleChange("type", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="First Visit">First Visit</SelectItem>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Department and Doctor */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-3">
            Department/Specialty
          </label>
          <Select value={department} onValueChange={(value) => handleChange("department", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cardiology">Cardiology</SelectItem>
              <SelectItem value="Neurology">Neurology</SelectItem>
              <SelectItem value="Orthopedics">Orthopedics</SelectItem>
              <SelectItem value="Pediatrics">Pediatrics</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-3">
            Doctor
          </label>
          <Select value={doctor} onValueChange={(value) => handleChange("doctor", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Dr. Meera Nair – Cardiology">Dr. Meera Nair – Cardiology</SelectItem>
              <SelectItem value="Dr. Rajesh Kumar – Cardiology">Dr. Rajesh Kumar – Cardiology</SelectItem>
              <SelectItem value="Dr. Priya Singh – Neurology">Dr. Priya Singh – Neurology</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clinical Information */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-3">
          Clinical Information
        </label>
        <Textarea
          placeholder="Write patient clinical information"
          value={clinicalInfo}
          onChange={(e) => handleChange("clinicalInfo", e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      {/* Date & Time */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-foreground">Date & Time</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="text-foreground">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "dd/MM/yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && handleChange("date", newDate)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-10 gap-2 p-4 border rounded-md">
          {timeSlots.map((time) => (
            <Button
              key={time}
              variant={selectedTime === time ? "default" : "outline"}
              size="sm"
              className="h-9 text-xs"
              onClick={() => handleChange("time", time)}
            >
              {time}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}
