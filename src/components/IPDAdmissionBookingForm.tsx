import { useState, useEffect, useMemo } from "react";
import { Bed, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ServicesPanel } from "@/components/booking/ServicesPanel";
import { useServicesCart } from "@/hooks/useServicesCart";
import { AdmissionTab } from "@/types/booking/ipAdmission";
import { DoctorSelector } from "@/components/booking/DoctorSelector";
import { DynamicSlotPicker } from "@/components/booking/DynamicSlotPicker";
import { useSchedulingData } from "@/hooks/useSchedulingData";
import { useDoctorAvailability } from "@/hooks/useDoctorAvailability";
import { TimeSlot } from "@/types/scheduling";

export interface IPDAdmissionData {
  department: string;
  attendingDoctor: string;
  ward: string;
  bed: string;
  reasonForAdmission: string;
  date: Date;
  time: string;
  emergencyContactName: string;
  relationship: string;
  contactNumber: string;
  address: string;
}

interface IPDAdmissionBookingFormProps {
  onRemove: () => void;
  onUpdate: (data: IPDAdmissionData) => void;
  onServicesChange?: (cart: any[], totals: any) => void;
}

export const IPDAdmissionBookingForm = ({ onRemove, onUpdate, onServicesChange }: IPDAdmissionBookingFormProps) => {
  const [activeTab, setActiveTab] = useState<AdmissionTab>("Admission");
  const [department, setDepartment] = useState("general-medicine");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [ward, setWard] = useState("General Ward - 01A");
  const [bed, setBed] = useState("Bed - 35A");
  const [reasonForAdmission, setReasonForAdmission] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [summaries, setSummaries] = useState<import('@/types/scheduling').DoctorAvailabilitySummary[]>([]);
  
  // Fetch doctors from database
  const { doctors, loading: doctorsLoading } = useSchedulingData();
  
  // Filter doctors by department
  const filteredDoctors = useMemo(() => {
    if (!department) return doctors;
    return doctors.filter(d => d.department_id === department);
  }, [doctors, department]);
  
  // Get availability summaries for doctors
  const { getDoctorsSummary, loading: availabilityLoading } = useDoctorAvailability();
  
  // Fetch summaries when doctors change
  useEffect(() => {
    if (filteredDoctors.length > 0) {
      getDoctorsSummary(filteredDoctors.map(d => d.id)).then(setSummaries);
    }
  }, [filteredDoctors, getDoctorsSummary]);
  
  // Get selected doctor name for update
  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);
  const attendingDoctor = selectedDoctor?.name || "";
  
  // Services cart
  const servicesCart = useServicesCart(5000); // baseCharge of 5000 for admission
  
  // Notify parent of services changes
  useEffect(() => {
    if (onServicesChange) {
      onServicesChange(servicesCart.cart, servicesCart.totals);
    }
  }, [servicesCart.cart, servicesCart.totals, onServicesChange]);

  const selectedTime = selectedSlot?.start ? new Date(selectedSlot.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : "";

  const handleDepartmentChange = (value: string) => {
    setDepartment(value);
    setSelectedDoctorId(null); // Reset doctor when department changes
    onUpdate({ department: value, attendingDoctor: "", ward, bed, reasonForAdmission, date, time: selectedTime, emergencyContactName, relationship, contactNumber, address });
  };

  const handleDoctorSelect = (doctorId: string | null) => {
    setSelectedDoctorId(doctorId);
    const doctor = doctors.find(d => d.id === doctorId);
    onUpdate({ department, attendingDoctor: doctor?.name || "", ward, bed, reasonForAdmission, date, time: selectedTime, emergencyContactName, relationship, contactNumber, address });
  };

  const handleWardChange = (value: string) => {
    setWard(value);
    onUpdate({ department, attendingDoctor, ward: value, bed, reasonForAdmission, date, time: selectedTime, emergencyContactName, relationship, contactNumber, address });
  };

  const handleBedChange = (value: string) => {
    setBed(value);
    onUpdate({ department, attendingDoctor, ward, bed: value, reasonForAdmission, date, time: selectedTime, emergencyContactName, relationship, contactNumber, address });
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReasonForAdmission(e.target.value);
    onUpdate({ department, attendingDoctor, ward, bed, reasonForAdmission: e.target.value, date, time: selectedTime, emergencyContactName, relationship, contactNumber, address });
  };

  const handleSlotSelect = (slot: TimeSlot | null) => {
    setSelectedSlot(slot);
    if (slot) {
      const slotDate = new Date(slot.start);
      const slotTime = slotDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      setDate(slotDate);
      onUpdate({ department, attendingDoctor, ward, bed, reasonForAdmission, date: slotDate, time: slotTime, emergencyContactName, relationship, contactNumber, address });
    }
  };

  const handleDateChange = (newDate: Date) => {
    setDate(newDate);
    setSelectedSlot(null); // Reset slot when date changes
  };

  const handleEmergencyContactNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmergencyContactName(e.target.value);
    onUpdate({ department, attendingDoctor, ward, bed, reasonForAdmission, date, time: selectedTime, emergencyContactName: e.target.value, relationship, contactNumber, address });
  };

  const handleRelationshipChange = (value: string) => {
    setRelationship(value);
    onUpdate({ department, attendingDoctor, ward, bed, reasonForAdmission, date, time: selectedTime, emergencyContactName, relationship: value, contactNumber, address });
  };

  const handleContactNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactNumber(e.target.value);
    onUpdate({ department, attendingDoctor, ward, bed, reasonForAdmission, date, time: selectedTime, emergencyContactName, relationship, contactNumber: e.target.value, address });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAddress(e.target.value);
    onUpdate({ department, attendingDoctor, ward, bed, reasonForAdmission, date, time: selectedTime, emergencyContactName, relationship, contactNumber, address: e.target.value });
  };

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="bg-orange-600 dark:bg-orange-700 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bed className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">IPD Admission</h3>
            <p className="text-xs text-white/70">In-Patient Admission & Services</p>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="text-white/70 hover:text-white transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-5 space-y-5">
        {/* IP Admission & Services Tabs */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
            Select Section
          </label>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AdmissionTab)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="Admission">IP Admission</TabsTrigger>
              <TabsTrigger value="Services">Services</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {activeTab === "Admission" ? (
          <div className="space-y-5">
            {/* Department and Attending Doctor */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Department
            </label>
            <Select value={department} onValueChange={handleDepartmentChange}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General Medicine">General Medicine</SelectItem>
                <SelectItem value="Cardiology">Cardiology</SelectItem>
                <SelectItem value="Neurology">Neurology</SelectItem>
                <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                <SelectItem value="Pediatrics">Pediatrics</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Attending Doctor
            </label>
            <DoctorSelector
              doctors={filteredDoctors}
              summaries={summaries}
              selectedDoctorId={selectedDoctorId}
              onSelect={handleDoctorSelect}
              departmentId={department}
              loading={doctorsLoading || availabilityLoading}
            />
          </div>
        </div>

        {/* Ward and Bed */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Select Ward
            </label>
            <Select value={ward} onValueChange={handleWardChange}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select ward" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General Ward - 01A">General Ward - 01A</SelectItem>
                <SelectItem value="General Ward - 01B">General Ward - 01B</SelectItem>
                <SelectItem value="Private Ward - 02A">Private Ward - 02A</SelectItem>
                <SelectItem value="ICU - 03A">ICU - 03A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Select Bed
            </label>
            <Select value={bed} onValueChange={handleBedChange}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select bed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bed - 35A">Bed - 35A</SelectItem>
                <SelectItem value="Bed - 35B">Bed - 35B</SelectItem>
                <SelectItem value="Bed - 36A">Bed - 36A</SelectItem>
                <SelectItem value="Bed - 36B">Bed - 36B</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Emergency Contact Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Emergency Contact Name
            </label>
            <Input
              className="h-10"
              placeholder="John Doe"
              value={emergencyContactName}
              onChange={handleEmergencyContactNameChange}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Relationship
            </label>
            <Select value={relationship} onValueChange={handleRelationshipChange}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Spouse">Spouse</SelectItem>
                <SelectItem value="Parent">Parent</SelectItem>
                <SelectItem value="Child">Child</SelectItem>
                <SelectItem value="Sibling">Sibling</SelectItem>
                <SelectItem value="Friend">Friend</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Contact Number
            </label>
            <Input
              className="h-10"
              placeholder="+91 98765 43210"
              value={contactNumber}
              onChange={handleContactNumberChange}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Address
            </label>
            <Input
              className="h-10"
              placeholder="House No, Street, City"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onBlur={() => onUpdate({ department, attendingDoctor, ward, bed, reasonForAdmission, date, time: selectedTime, emergencyContactName, relationship, contactNumber, address })}
            />
          </div>
        </div>

        {/* Reason for Admission */}
        <div>
          <label className="text-sm font-medium text-foreground mb-3 block">
            Reason for Admission
          </label>
          <Textarea
            placeholder="Write reason for admission"
            value={reasonForAdmission}
            onChange={handleReasonChange}
            className="min-h-[100px]"
          />
        </div>

        {/* Date & Time */}
        {selectedDoctorId && (
          <DynamicSlotPicker
            doctorId={selectedDoctorId}
            doctorName={selectedDoctor?.name || ""}
            selectedSlot={selectedSlot}
            onSlotSelect={handleSlotSelect}
            mode="in_person"
          />
        )}
        
        {!selectedDoctorId && (
          <div className="p-4 border rounded-md bg-muted/30 text-center">
            <p className="text-sm text-muted-foreground">Please select a doctor to see available time slots</p>
          </div>
        )}
          </div>
        ) : (
          // Services Tab
          <ServicesPanel
            cart={servicesCart.cart}
            onAddToCart={servicesCart.addToCart}
            onUpdateQty={servicesCart.updateQty}
            onUpdateDiscount={servicesCart.updateDiscount}
            onRemoveFromCart={servicesCart.removeFromCart}
          />
        )}
      </div>
    </Card>
  );
};
