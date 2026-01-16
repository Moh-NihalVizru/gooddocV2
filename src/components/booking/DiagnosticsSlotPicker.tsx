import { useState, useMemo, useCallback } from "react";
import { format, addDays, startOfDay, isSameDay, isToday, isBefore } from "date-fns";
import { Calendar as CalendarIcon, RefreshCw, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DiagnosticsSlot {
  id: string;
  time: string;
  displayTime: string;
  period: "Morning" | "Afternoon" | "Evening";
}

interface DiagnosticsSlotPickerProps {
  selectedDate: Date;
  selectedTime: string | null;
  onDateSelect: (date: Date) => void;
  onTimeSelect: (time: string) => void;
  label?: string;
  locationName?: string;
}

// Generate slots from 9 AM to 9 PM with 30-minute intervals
const generateDiagnosticsSlots = (): DiagnosticsSlot[] => {
  const slots: DiagnosticsSlot[] = [];
  
  for (let hour = 9; hour < 21; hour++) {
    for (let minute of [0, 30]) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayHour = hour > 12 ? hour - 12 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayTime = `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
      
      let period: "Morning" | "Afternoon" | "Evening";
      if (hour < 12) {
        period = "Morning";
      } else if (hour < 17) {
        period = "Afternoon";
      } else {
        period = "Evening";
      }
      
      slots.push({
        id: timeStr,
        time: timeStr,
        displayTime,
        period
      });
    }
  }
  
  return slots;
};

const allSlots = generateDiagnosticsSlots();

export function DiagnosticsSlotPicker({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  label = "Date & Time",
  locationName = "Main Lab"
}: DiagnosticsSlotPickerProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Get available slots for the selected date
  const availableSlots = useMemo(() => {
    const now = new Date();
    
    // If selected date is today, filter out past times
    if (isToday(selectedDate)) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      return allSlots.filter(slot => {
        const [slotHour, slotMinute] = slot.time.split(':').map(Number);
        if (slotHour > currentHour) return true;
        if (slotHour === currentHour && slotMinute > currentMinute + 30) return true;
        return false;
      });
    }
    
    return allSlots;
  }, [selectedDate]);

  // Group slots by period
  const groupedSlots = useMemo(() => {
    const groups: Record<string, DiagnosticsSlot[]> = {
      Morning: [],
      Afternoon: [],
      Evening: []
    };
    
    availableSlots.forEach(slot => {
      groups[slot.period].push(slot);
    });
    
    return groups;
  }, [availableSlots]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateSelect(date);
      setCalendarOpen(false);
    }
  };

  // Disable past dates
  const disabledDays = useCallback((date: Date) => {
    return isBefore(startOfDay(date), startOfDay(new Date()));
  }, []);

  return (
    <div className="space-y-4">
      {/* Header with label and date picker */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <div className="flex items-center gap-2">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span className="font-medium">{format(selectedDate, "MMM d, yyyy")}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-popover border shadow-lg z-50" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={disabledDays}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Today indicator */}
      {isToday(selectedDate) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Today</span>
        </div>
      )}

      {/* Time slots grouped by period */}
      <div className="space-y-4">
        {Object.entries(groupedSlots).map(([period, slots]) => {
          if (slots.length === 0) return null;
          
          return (
            <div key={period}>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">{period}</h4>
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => {
                  const isSelected = selectedTime === slot.time;
                  
                  return (
                    <Button
                      key={slot.id}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "h-8 px-3",
                        isSelected && "ring-2 ring-primary ring-offset-2"
                      )}
                      onClick={() => onTimeSelect(slot.time)}
                    >
                      <span className="font-medium">{slot.displayTime}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {availableSlots.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg bg-muted/30">
          <Clock className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No available slots for today</p>
          <Button
            variant="link"
            size="sm"
            className="mt-2"
            onClick={() => onDateSelect(addDays(new Date(), 1))}
          >
            View tomorrow's slots
          </Button>
        </div>
      )}
    </div>
  );
}
