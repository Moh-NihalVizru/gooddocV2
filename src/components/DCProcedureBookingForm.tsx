import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface DCProcedureData {
  department: string;
  procedure: string;
  attendingDoctor: string;
  otRoom: string;
  reasonForProcedure: string;
  date: Date;
  time: string;
}

interface DCProcedureBookingFormProps {
  onRemove: () => void;
  onUpdate: (data: DCProcedureData) => void;
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

export const DCProcedureBookingForm = ({ onRemove, onUpdate }: DCProcedureBookingFormProps) => {
  const [department, setDepartment] = useState("General Surgery");
  const [procedure, setProcedure] = useState("Endoscopy");
  const [attendingDoctor, setAttendingDoctor] = useState("Dr. A. Joseph (Ophthalmology)");
  const [otRoom, setOtRoom] = useState("OT - 05A");
  const [reasonForProcedure, setReasonForProcedure] = useState("");
  const [date, setDate] = useState<Date>(new Date(2025, 7, 5));
  const [selectedTime, setSelectedTime] = useState("07:30");

  const handleDepartmentChange = (value: string) => {
    setDepartment(value);
    onUpdate({ department: value, procedure, attendingDoctor, otRoom, reasonForProcedure, date, time: selectedTime });
  };

  const handleProcedureChange = (value: string) => {
    setProcedure(value);
    onUpdate({ department, procedure: value, attendingDoctor, otRoom, reasonForProcedure, date, time: selectedTime });
  };

  const handleAttendingDoctorChange = (value: string) => {
    setAttendingDoctor(value);
    onUpdate({ department, procedure, attendingDoctor: value, otRoom, reasonForProcedure, date, time: selectedTime });
  };

  const handleOtRoomChange = (value: string) => {
    setOtRoom(value);
    onUpdate({ department, procedure, attendingDoctor, otRoom: value, reasonForProcedure, date, time: selectedTime });
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReasonForProcedure(e.target.value);
    onUpdate({ department, procedure, attendingDoctor, otRoom, reasonForProcedure: e.target.value, date, time: selectedTime });
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    onUpdate({ department, procedure, attendingDoctor, otRoom, reasonForProcedure, date, time });
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      onUpdate({ department, procedure, attendingDoctor, otRoom, reasonForProcedure, date: newDate, time: selectedTime });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Day-Care Procedure</h3>
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
        {/* Department and Procedure */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Department
            </label>
            <Select value={department} onValueChange={handleDepartmentChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General Surgery">General Surgery</SelectItem>
                <SelectItem value="Cardiology">Cardiology</SelectItem>
                <SelectItem value="Neurology">Neurology</SelectItem>
                <SelectItem value="Orthopedics">Orthopedics</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Procedure
            </label>
            <Select value={procedure} onValueChange={handleProcedureChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select procedure" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Endoscopy">Endoscopy</SelectItem>
                <SelectItem value="Colonoscopy">Colonoscopy</SelectItem>
                <SelectItem value="Cataract Surgery">Cataract Surgery</SelectItem>
                <SelectItem value="Minor Surgery">Minor Surgery</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Attending Doctor and OT/Procedure Room */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Attending Doctor
            </label>
            <Select value={attendingDoctor} onValueChange={handleAttendingDoctorChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dr. A. Joseph (Ophthalmology)">Dr. A. Joseph (Ophthalmology)</SelectItem>
                <SelectItem value="Dr. Meera Nair (Cardiology)">Dr. Meera Nair (Cardiology)</SelectItem>
                <SelectItem value="Dr. Rajesh Kumar (Neurology)">Dr. Rajesh Kumar (Neurology)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              OT/Procedure Room
            </label>
            <Select value={otRoom} onValueChange={handleOtRoomChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select room" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OT - 05A">OT - 05A</SelectItem>
                <SelectItem value="OT - 05B">OT - 05B</SelectItem>
                <SelectItem value="OT - 06A">OT - 06A</SelectItem>
                <SelectItem value="OT - 06B">OT - 06B</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reason for Procedure */}
        <div>
          <label className="text-sm font-medium text-foreground mb-3 block">
            Reason for Procedure
          </label>
          <Textarea
            placeholder="Write reason for Procedure"
            value={reasonForProcedure}
            onChange={handleReasonChange}
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
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={handleDateSelect} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-10 gap-2 p-4 border rounded-md">
            {timeSlots.map((time) => (
              <Button
                key={time}
                type="button"
                variant={selectedTime === time ? "default" : "outline"}
                size="sm"
                className="h-9 text-xs"
                onClick={() => handleTimeSelect(time)}
              >
                {time}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
