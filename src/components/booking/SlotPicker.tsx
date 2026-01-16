import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Video, MapPin, AlertCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDoctorAvailability } from "@/hooks/useDoctorAvailability";
import { TimeSlot, DayAvailability, ScheduleMode } from "@/types/scheduling";
import { format, parseISO, addDays, isBefore, startOfDay } from "date-fns";

interface SlotPickerProps {
  doctorId: string;
  doctorName: string;
  mode?: ScheduleMode;
  onSlotSelect: (slot: TimeSlot) => void;
  selectedSlot?: TimeSlot | null;
}

export function SlotPicker({ doctorId, doctorName, mode, onSlotSelect, selectedSlot }: SlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const { getAvailability } = useDoctorAvailability();

  useEffect(() => {
    fetchAvailability();
  }, [doctorId, mode]);

  const fetchAvailability = async () => {
    setLoading(true);
    const today = new Date();
    const endDate = addDays(today, 30);
    
    const result = await getAvailability(doctorId, today, endDate, { mode });
    if (result) {
      setAvailability(result.days);
    }
    setLoading(false);
  };

  const selectedDayData = useMemo(() => {
    if (!selectedDate) return null;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return availability.find(d => d.date === dateStr);
  }, [selectedDate, availability]);

  const disabledDays = useMemo(() => {
    return (date: Date) => {
      if (isBefore(date, startOfDay(new Date()))) return true;
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayData = availability.find(d => d.date === dateStr);
      return !dayData || dayData.status === 'unavailable' || dayData.status === 'leave';
    };
  }, [availability]);

  const groupSlotsByPeriod = (slots: TimeSlot[]) => {
    const morning: TimeSlot[] = [];
    const afternoon: TimeSlot[] = [];
    const evening: TimeSlot[] = [];

    slots.forEach(slot => {
      const hour = parseISO(slot.start).getHours();
      if (hour < 12) morning.push(slot);
      else if (hour < 17) afternoon.push(slot);
      else evening.push(slot);
    });

    return { morning, afternoon, evening };
  };

  const periods = selectedDayData ? groupSlotsByPeriod(selectedDayData.slots) : null;

  const nextAvailableSlot = useMemo(() => {
    for (const day of availability) {
      if (day.slots.length > 0 && day.status === 'available') {
        return { date: day.date, slot: day.slots[0] };
      }
    }
    return null;
  }, [availability]);

  const handleJumpToNext = () => {
    if (nextAvailableSlot) {
      setSelectedDate(parseISO(nextAvailableSlot.date + 'T00:00:00'));
    }
  };

  return (
    <div className="space-y-4">
      {/* Date Picker */}
      <div>
        <label className="text-sm font-medium mb-2 block">Select Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={disabledDays}
              modifiers={{ available: (date) => !disabledDays(date) }}
              modifiersClassNames={{ available: "bg-green-50 dark:bg-green-900/20" }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Leave Banner */}
      {selectedDayData?.status === 'leave' && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
              {doctorName} is unavailable on this date
            </p>
            {nextAvailableSlot && (
              <p className="text-xs text-orange-600 dark:text-orange-400">
                Next available: {format(parseISO(nextAvailableSlot.slot.start), "EEE, MMM d 'at' h:mm a")}
              </p>
            )}
          </div>
          {nextAvailableSlot && (
            <Button size="sm" variant="outline" onClick={handleJumpToNext}>
              Jump <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      )}

      {/* Time Slots */}
      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Loading available slots...</p>
      ) : selectedDayData?.status === 'available' && periods ? (
        <div className="space-y-4">
          {periods.morning.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Morning</h4>
              <div className="flex flex-wrap gap-2">
                {periods.morning.map(slot => (
                  <SlotChip key={slot.id} slot={slot} selected={selectedSlot?.id === slot.id} onClick={() => onSlotSelect(slot)} />
                ))}
              </div>
            </div>
          )}
          {periods.afternoon.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Afternoon</h4>
              <div className="flex flex-wrap gap-2">
                {periods.afternoon.map(slot => (
                  <SlotChip key={slot.id} slot={slot} selected={selectedSlot?.id === slot.id} onClick={() => onSlotSelect(slot)} />
                ))}
              </div>
            </div>
          )}
          {periods.evening.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Evening</h4>
              <div className="flex flex-wrap gap-2">
                {periods.evening.map(slot => (
                  <SlotChip key={slot.id} slot={slot} selected={selectedSlot?.id === slot.id} onClick={() => onSlotSelect(slot)} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : selectedDayData?.status === 'unavailable' ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-2">No slots available for this day</p>
          {nextAvailableSlot && (
            <Button variant="link" onClick={handleJumpToNext}>
              See next available: {format(parseISO(nextAvailableSlot.slot.start), "EEE, MMM d")}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}

function SlotChip({ slot, selected, onClick }: { slot: TimeSlot; selected: boolean; onClick: () => void }) {
  const time = format(parseISO(slot.start), "h:mm a");
  
  return (
    <Button
      variant={selected ? "default" : "outline"}
      size="sm"
      className={cn("gap-1", selected && "ring-2 ring-primary ring-offset-2")}
      onClick={onClick}
    >
      {slot.mode === 'telehealth' ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
      {time}
    </Button>
  );
}
