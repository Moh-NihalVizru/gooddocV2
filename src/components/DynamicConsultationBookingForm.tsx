import { useState, useEffect, useMemo } from "react";
import { Calendar as CalendarIcon, Users, Stethoscope, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { DoctorSelector } from "@/components/booking/DoctorSelector";
import { DynamicSlotPicker } from "@/components/booking/DynamicSlotPicker";
import { useSchedulingData } from "@/hooks/useSchedulingData";
import { useDoctorAvailability } from "@/hooks/useDoctorAvailability";
import { TimeSlot, ScheduleMode, Doctor, DoctorAvailabilitySummary } from "@/types/scheduling";
import { cn } from "@/lib/utils";

interface DynamicConsultationBookingFormProps {
  onRemove?: () => void;
  onUpdate: (data: DynamicConsultationData) => void;
  initialData?: DynamicConsultationData;
  onAddAnother?: () => void;
}

export interface DynamicConsultationData {
  mode: ScheduleMode;
  type: string;
  department: string;
  doctorId: string | null;
  doctorName: string;
  clinicalInfo: string;
  selectedSlot: TimeSlot | null;
  holdId: string | null;
}

// Mock departments - in real app, fetch from API
const departments = [
  { id: "cardiology", name: "Cardiology" },
  { id: "orthopedics", name: "Orthopedics" },
  { id: "endocrinology", name: "Endocrinology" },
  { id: "neurology", name: "Neurology" },
  { id: "pediatrics", name: "Pediatrics" },
];

const consultationTypes = [
  { id: "first_visit", name: "First Visit", duration: 30 },
  { id: "follow_up", name: "Follow-up", duration: 15 },
  { id: "emergency", name: "Emergency", duration: 20 },
  { id: "second_opinion", name: "Second Opinion", duration: 45 },
];

export function DynamicConsultationBookingForm({ onRemove, onUpdate, initialData, onAddAnother }: DynamicConsultationBookingFormProps) {
  const [mode, setMode] = useState<ScheduleMode>(initialData?.mode || "in_person");
  const [consultationType, setConsultationType] = useState(initialData?.type || "first_visit");
  const [department, setDepartment] = useState(initialData?.department || "");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(initialData?.doctorId || null);
  const [clinicalInfo, setClinicalInfo] = useState(initialData?.clinicalInfo || "");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(initialData?.selectedSlot || null);
  const [holdId, setHoldId] = useState<string | null>(initialData?.holdId || null);
  const [doctorSummaries, setDoctorSummaries] = useState<DoctorAvailabilitySummary[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const { doctors, loading: dataLoading } = useSchedulingData();
  const { getDoctorsSummary, loading: summaryLoading } = useDoctorAvailability();

  // Sync state with initialData when it changes (for pre-filling from request data)
  useEffect(() => {
    if (initialData && !isInitialized) {
      if (initialData.mode) setMode(initialData.mode);
      if (initialData.type) setConsultationType(initialData.type);
      if (initialData.department) setDepartment(initialData.department);
      if (initialData.doctorId) setSelectedDoctorId(initialData.doctorId);
      if (initialData.clinicalInfo) setClinicalInfo(initialData.clinicalInfo);
      if (initialData.selectedSlot) setSelectedSlot(initialData.selectedSlot);
      if (initialData.holdId) setHoldId(initialData.holdId);
      setIsInitialized(true);
    }
  }, [initialData, isInitialized]);

  // Fetch doctor summaries when doctors or filters change
  useEffect(() => {
    if (doctors.length > 0) {
      fetchDoctorSummaries();
    }
  }, [doctors, mode, department]);

  const fetchDoctorSummaries = async () => {
    const filteredDoctors = department 
      ? doctors.filter(d => d.department_id === department)
      : doctors;
    
    const doctorIds = filteredDoctors.map(d => d.id);
    const summaries = await getDoctorsSummary(doctorIds, { mode });
    setDoctorSummaries(summaries);
  };

  // Get filtered doctors based on department
  const filteredDoctors = useMemo(() => {
    if (!department) return doctors;
    return doctors.filter(d => d.department_id === department);
  }, [doctors, department]);

  // Get selected doctor details
  const selectedDoctor = useMemo(() => {
    if (!selectedDoctorId) return null;
    return doctors.find(d => d.id === selectedDoctorId);
  }, [doctors, selectedDoctorId]);

  // Get consultation type duration
  const selectedTypeDuration = useMemo(() => {
    const type = consultationTypes.find(t => t.id === consultationType);
    return type?.duration || 20;
  }, [consultationType]);

  // Update parent whenever any field changes
  useEffect(() => {
    onUpdate({
      mode,
      type: consultationType,
      department,
      doctorId: selectedDoctorId,
      doctorName: selectedDoctor?.name || "Any available doctor",
      clinicalInfo,
      selectedSlot,
      holdId,
    });
  }, [mode, consultationType, department, selectedDoctorId, selectedDoctor, clinicalInfo, selectedSlot, holdId]);

  const handleModeChange = (newMode: string) => {
    const scheduleMode = newMode === "in-person" ? "in_person" : "telehealth";
    setMode(scheduleMode);
    // Clear slot selection when mode changes
    setSelectedSlot(null);
    setHoldId(null);
  };

  const handleDepartmentChange = (value: string) => {
    setDepartment(value);
    // Reset doctor when department changes
    setSelectedDoctorId(null);
    setSelectedSlot(null);
    setHoldId(null);
  };

  const handleDoctorSelect = (doctorId: string | null) => {
    setSelectedDoctorId(doctorId);
    // Clear slot selection when doctor changes
    setSelectedSlot(null);
    setHoldId(null);
  };

  const handleSlotSelect = (slot: TimeSlot | null, newHoldId?: string) => {
    setSelectedSlot(slot);
    setHoldId(newHoldId || null);
  };

  const handleSwitchDoctor = () => {
    setSelectedDoctorId(null);
    setSelectedSlot(null);
    setHoldId(null);
  };

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="bg-green-600 dark:bg-green-700 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Consultation</h3>
            <p className="text-xs text-white/70">OP Appointment Booking</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onAddAnother && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddAnother}
              className="text-white/80 hover:text-white hover:bg-white/10 text-xs gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Appointment
            </Button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="text-white/70 hover:text-white transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="p-5 space-y-5">

      {/* Consultation Type and Department */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-3">
            Consultation Type
          </label>
          <Select value={consultationType} onValueChange={setConsultationType}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {consultationTypes.map(type => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name} ({type.duration} min)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-3">
            Department/Specialty
          </label>
          <Select value={department} onValueChange={handleDepartmentChange}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Doctor */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-3">
          Doctor
        </label>
        {dataLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <DoctorSelector
            doctors={filteredDoctors}
            summaries={doctorSummaries}
            selectedDoctorId={selectedDoctorId}
            onSelect={handleDoctorSelect}
            mode={mode}
            departmentId={department}
            loading={summaryLoading}
          />
        )}
      </div>

      {/* Clinical Information */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-3">
          Clinical Information
        </label>
        <Textarea
          placeholder="Write patient clinical information, symptoms, or reason for visit..."
          value={clinicalInfo}
          onChange={(e) => setClinicalInfo(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      {/* Date & Time Slot Picker */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-foreground">Date & Time</label>
          {selectedDoctor && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSwitchDoctor}
              className="text-xs text-muted-foreground"
            >
              <Users className="h-3 w-3 mr-1" />
              See other doctors
            </Button>
          )}
        </div>

        {selectedDoctorId ? (
          <DynamicSlotPicker
            doctorId={selectedDoctorId}
            doctorName={selectedDoctor?.name || "Doctor"}
            mode={mode}
            onSlotSelect={handleSlotSelect}
            selectedSlot={selectedSlot}
            appointmentDuration={selectedTypeDuration}
          />
        ) : (
          <div className="border rounded-lg p-8 text-center bg-muted/30">
            <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground mb-1">
              Select a doctor to see available times
            </p>
            <p className="text-xs text-muted-foreground">
              Choose a specific doctor or select "Any available doctor" for the earliest slot
            </p>
          </div>
        )}
      </div>
      </div>
    </Card>
  );
}
