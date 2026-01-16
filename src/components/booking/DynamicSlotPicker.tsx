import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  CalendarIcon, Video, MapPin, AlertCircle, ChevronRight, 
  Clock, Loader2, Users, RefreshCw 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDoctorAvailability } from "@/hooks/useDoctorAvailability";
import { useSlotHold } from "@/hooks/useSlotHold";
import { TimeSlot, DayAvailability, ScheduleMode, AvailabilityResponse } from "@/types/scheduling";
import { format, parseISO, addDays, isBefore, startOfDay, isToday, isTomorrow, startOfWeek, endOfWeek } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface DynamicSlotPickerProps {
  doctorId: string;
  doctorName: string;
  mode?: ScheduleMode;
  onSlotSelect: (slot: TimeSlot | null, holdId?: string) => void;
  selectedSlot?: TimeSlot | null;
  appointmentDuration?: number;
  locationId?: string;
}

export function DynamicSlotPicker({ 
  doctorId, 
  doctorName, 
  mode, 
  onSlotSelect, 
  selectedSlot,
  appointmentDuration,
  locationId,
}: DynamicSlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  const { getAvailability } = useDoctorAvailability();
  const { 
    holdState, 
    loading: holdLoading, 
    holdSlot, 
    releaseHold, 
    isHolding 
  } = useSlotHold({
    holdDurationSeconds: 90,
    onExpired: () => {
      toast({
        title: "Slot hold expired",
        description: "Your reserved slot has been released. Please select another time.",
        variant: "destructive",
      });
      onSlotSelect(null);
    }
  });

  // Fetch availability when doctor, mode, or week changes
  useEffect(() => {
    fetchAvailability();
  }, [doctorId, mode, weekStart, locationId]);

  // Auto-select first available date when availability loads
  useEffect(() => {
    if (availability && !selectedDate) {
      const firstAvailable = availability.days.find(d => 
        d.status === 'available' && d.slots.length > 0
      );
      if (firstAvailable) {
        setSelectedDate(parseISO(firstAvailable.date + 'T00:00:00'));
      }
    }
  }, [availability, selectedDate]);

  const fetchAvailability = async () => {
    setLoading(true);
    const from = weekStart;
    const to = addDays(weekStart, 30); // Fetch 30 days ahead
    
    const result = await getAvailability(doctorId, from, to, { mode, locationId });
    if (result) {
      setAvailability(result);
    }
    setLoading(false);
  };

  const selectedDayData = useMemo(() => {
    if (!selectedDate || !availability) return null;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return availability.days.find(d => d.date === dateStr);
  }, [selectedDate, availability]);

  const disabledDays = useMemo(() => {
    if (!availability) return () => true;
    
    return (date: Date) => {
      if (isBefore(date, startOfDay(new Date()))) return true;
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayData = availability.days.find(d => d.date === dateStr);
      if (!dayData) return true;
      return dayData.status === 'unavailable' || 
             (dayData.status === 'leave') ||
             (dayData.status === 'available' && dayData.slots.length === 0);
    };
  }, [availability]);

  const groupSlotsByPeriod = useCallback((slots: TimeSlot[]) => {
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
  }, []);

  const periods = selectedDayData?.status === 'available' 
    ? groupSlotsByPeriod(selectedDayData.slots) 
    : null;

  const nextAvailableSlot = useMemo(() => {
    if (!availability) return null;
    for (const day of availability.days) {
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

  const handleSlotClick = async (slot: TimeSlot) => {
    // If clicking the same slot that's already held, do nothing
    if (holdState.slot?.id === slot.id) return;

    // Release existing hold if any
    if (isHolding) {
      await releaseHold();
    }

    // Place a new hold
    const result = await holdSlot(doctorId, slot);
    
    if (result.success) {
      onSlotSelect(slot, result.holdId);
      toast({
        title: "Slot reserved",
        description: `You have 90 seconds to complete your booking.`,
      });
    } else {
      toast({
        title: "Slot unavailable",
        description: result.error || "This slot is no longer available.",
        variant: "destructive",
      });
      // Refresh availability to show updated slots
      fetchAvailability();
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Release hold when changing dates
      if (isHolding) {
        releaseHold();
        onSlotSelect(null);
      }
      setSelectedDate(date);
    }
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEEE");
  };

  // Get current leave info if applicable
  const currentLeaveInfo = selectedDayData?.status === 'leave' ? selectedDayData.leaveInfo : null;

  return (
    <div className="space-y-4">
      {/* Date Picker with availability indicators */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Select Date</label>
          {isHolding && (
            <Badge variant="outline" className="gap-1 animate-pulse">
              <Clock className="h-3 w-3" />
              {holdState.remainingSeconds}s remaining
            </Badge>
          )}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CalendarIcon className="mr-2 h-4 w-4" />
              )}
              {selectedDate ? (
                <>
                  <span className="font-medium mr-2">{getDateLabel(selectedDate)}</span>
                  <span className="text-muted-foreground">{format(selectedDate, "MMM d, yyyy")}</span>
                </>
              ) : (
                "Pick a date"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={disabledDays}
              modifiers={{ 
                available: (date) => !disabledDays(date),
                leave: (date) => {
                  if (!availability) return false;
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const dayData = availability.days.find(d => d.date === dateStr);
                  return dayData?.status === 'leave';
                }
              }}
              modifiersClassNames={{ 
                available: "bg-green-50 dark:bg-green-900/20 font-medium",
                leave: "bg-orange-50 dark:bg-orange-900/20 text-orange-600"
              }}
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Leave Banner */}
      {currentLeaveInfo && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
          <AlertCircle className="h-5 w-5 text-orange-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
              {doctorName} is on leave
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-400">
              {currentLeaveInfo.reason && `${currentLeaveInfo.reason} • `}
              Until {format(parseISO(currentLeaveInfo.endDate), "MMMM d, yyyy")}
            </p>
            {nextAvailableSlot && (
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Next available: {format(parseISO(nextAvailableSlot.slot.start), "EEE, MMM d 'at' h:mm a")}
              </p>
            )}
          </div>
          {nextAvailableSlot && (
            <Button size="sm" variant="outline" onClick={handleJumpToNext} className="shrink-0">
              Jump <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      )}

      {/* Time Slots */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading available slots...</span>
        </div>
      ) : selectedDayData?.status === 'available' && periods ? (
        <div className="space-y-4">
          {periods.morning.length > 0 && (
            <SlotGroup 
              title="Morning" 
              slots={periods.morning} 
              selectedSlot={selectedSlot}
              heldSlot={holdState.slot}
              holdLoading={holdLoading}
              onSlotClick={handleSlotClick}
            />
          )}
          {periods.afternoon.length > 0 && (
            <SlotGroup 
              title="Afternoon" 
              slots={periods.afternoon} 
              selectedSlot={selectedSlot}
              heldSlot={holdState.slot}
              holdLoading={holdLoading}
              onSlotClick={handleSlotClick}
            />
          )}
          {periods.evening.length > 0 && (
            <SlotGroup 
              title="Evening" 
              slots={periods.evening} 
              selectedSlot={selectedSlot}
              heldSlot={holdState.slot}
              holdLoading={holdLoading}
              onSlotClick={handleSlotClick}
            />
          )}
          
          {periods.morning.length === 0 && periods.afternoon.length === 0 && periods.evening.length === 0 && (
            <EmptyState 
              message="No slots available for this day"
              nextAvailable={nextAvailableSlot}
              onJumpToNext={handleJumpToNext}
            />
          )}
        </div>
      ) : selectedDayData?.status === 'unavailable' || (selectedDayData?.status === 'available' && selectedDayData.slots.length === 0) ? (
        <EmptyState 
          message="No slots available for this day"
          nextAvailable={nextAvailableSlot}
          onJumpToNext={handleJumpToNext}
        />
      ) : !selectedDate ? (
        <div className="text-center py-8 text-muted-foreground">
          <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select a date to view available time slots</p>
        </div>
      ) : null}

      {/* Refresh button */}
      <div className="flex justify-end">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={fetchAvailability}
          disabled={loading}
          className="text-xs text-muted-foreground"
        >
          <RefreshCw className={cn("h-3 w-3 mr-1", loading && "animate-spin")} />
          Refresh availability
        </Button>
      </div>
    </div>
  );
}

function SlotGroup({ 
  title, 
  slots, 
  selectedSlot, 
  heldSlot,
  holdLoading,
  onSlotClick 
}: { 
  title: string; 
  slots: TimeSlot[]; 
  selectedSlot?: TimeSlot | null;
  heldSlot: TimeSlot | null;
  holdLoading: boolean;
  onSlotClick: (slot: TimeSlot) => void;
}) {
  return (
    <div>
      <h4 className="text-xs font-medium text-muted-foreground mb-2">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {slots.map(slot => (
          <SlotChip 
            key={slot.id} 
            slot={slot} 
            selected={selectedSlot?.id === slot.id}
            held={heldSlot?.id === slot.id}
            loading={holdLoading && heldSlot?.id === slot.id}
            onClick={() => onSlotClick(slot)} 
          />
        ))}
      </div>
    </div>
  );
}

function SlotChip({ 
  slot, 
  selected, 
  held,
  loading,
  onClick 
}: { 
  slot: TimeSlot; 
  selected: boolean; 
  held: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  const time = format(parseISO(slot.start), "h:mm a");
  const isDisabled = slot.status === 'booked' || slot.capacityRemaining === 0;
  
  return (
    <Button
      variant={selected ? "default" : held ? "secondary" : "outline"}
      size="sm"
      className={cn(
        "gap-1.5 transition-all",
        selected && "ring-2 ring-primary ring-offset-2",
        held && !selected && "border-primary/50",
        isDisabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={onClick}
      disabled={isDisabled || loading}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : slot.mode === 'telehealth' ? (
        <Video className="h-3 w-3" />
      ) : (
        <MapPin className="h-3 w-3" />
      )}
      {time}
      {slot.locationName && slot.mode === 'in_person' && (
        <span className="text-[10px] text-muted-foreground ml-1 hidden sm:inline">
          {slot.locationName}
        </span>
      )}
    </Button>
  );
}

function EmptyState({ 
  message, 
  nextAvailable, 
  onJumpToNext 
}: { 
  message: string; 
  nextAvailable: { date: string; slot: TimeSlot } | null;
  onJumpToNext: () => void;
}) {
  return (
    <div className="text-center py-8 border rounded-lg bg-muted/30">
      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
      <p className="text-sm text-muted-foreground mb-3">{message}</p>
      {nextAvailable && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Next available: {format(parseISO(nextAvailable.slot.start), "EEEE, MMMM d 'at' h:mm a")}
          </p>
          <Button variant="outline" size="sm" onClick={onJumpToNext}>
            Jump to next available <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
