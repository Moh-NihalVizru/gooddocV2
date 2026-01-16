import { useState, useEffect, useMemo } from "react";
import { Check, ChevronsUpDown, Clock, AlertCircle, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Doctor, DoctorAvailabilitySummary, ScheduleMode } from "@/types/scheduling";
import { format, parseISO } from "date-fns";

interface DoctorSelectorProps {
  doctors: Doctor[];
  summaries: DoctorAvailabilitySummary[];
  selectedDoctorId: string | null;
  onSelect: (doctorId: string | null) => void;
  mode?: ScheduleMode;
  departmentId?: string;
  loading?: boolean;
}

export function DoctorSelector({
  doctors,
  summaries,
  selectedDoctorId,
  onSelect,
  mode,
  departmentId,
  loading,
}: DoctorSelectorProps) {
  const [open, setOpen] = useState(false);

  // Filter doctors by department if specified
  const filteredDoctors = useMemo(() => {
    if (!departmentId) return doctors;
    return doctors.filter(d => d.department_id === departmentId);
  }, [doctors, departmentId]);

  const selectedDoctor = filteredDoctors.find(d => d.id === selectedDoctorId);
  const selectedSummary = summaries.find(s => s.doctorId === selectedDoctorId);

  const getAvailabilityLabel = (summary: DoctorAvailabilitySummary | undefined) => {
    if (!summary) return null;
    
    switch (summary.availabilityStatus) {
      case 'today':
        return { label: 'Today', variant: 'default' as const, time: summary.nextAvailable };
      case 'tomorrow':
        return { label: 'Tomorrow', variant: 'secondary' as const, time: summary.nextAvailable };
      case 'this_week':
        return { label: format(parseISO(summary.nextAvailable!), 'EEE'), variant: 'outline' as const, time: summary.nextAvailable };
      case 'on_leave':
        return { label: `Back ${format(parseISO(summary.leaveUntil!), 'MMM d')}`, variant: 'destructive' as const };
      case 'no_schedule':
        return { label: 'No availability', variant: 'outline' as const };
      default:
        return null;
    }
  };

  const formatNextTime = (isoString: string | undefined) => {
    if (!isoString) return '';
    return format(parseISO(isoString), 'h:mm a');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10"
          disabled={loading}
        >
          <div className="flex items-center gap-2 truncate">
            <UserRound className="h-4 w-4 text-muted-foreground shrink-0" />
            {selectedDoctor ? (
              <span className="font-normal text-foreground truncate">{selectedDoctor.name}</span>
            ) : (
              <span className="text-muted-foreground font-normal">Select a doctor...</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 bg-popover border shadow-lg z-50" align="start">
        <Command className="bg-popover">
          <CommandList className="bg-popover max-h-[300px]">
            <CommandGroup>
              {/* Any Doctor option */}
              <CommandItem
                value="any"
                onSelect={() => {
                  onSelect(null);
                  setOpen(false);
                }}
                className="py-3 cursor-pointer hover:bg-accent"
              >
                <div className="flex items-center gap-3 flex-1">
                  <UserRound className="h-4 w-4 text-foreground" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Any available doctor</p>
                    <p className="text-xs text-foreground">
                      First available across all doctors
                    </p>
                  </div>
                </div>
                <Check className={cn("h-4 w-4 text-foreground", !selectedDoctorId ? "opacity-100" : "opacity-0")} />
              </CommandItem>
              
              {/* Individual doctors */}
              {filteredDoctors.map((doctor) => {
                const summary = summaries.find(s => s.doctorId === doctor.id);
                const availability = getAvailabilityLabel(summary);
                
                return (
                  <CommandItem
                    key={doctor.id}
                    value={doctor.name}
                    onSelect={() => {
                      onSelect(doctor.id);
                      setOpen(false);
                    }}
                    className="py-3 cursor-pointer hover:bg-accent"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <UserRound className="h-4 w-4 text-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground truncate">{doctor.name}</p>
                          {availability && (
                            <Badge variant={availability.variant} className="text-[10px] px-1.5 py-0 shrink-0">
                              {availability.label}
                              {availability.time && ` ${formatNextTime(availability.time)}`}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-foreground truncate">
                          {doctor.degrees || doctor.specialty_id}
                        </p>
                      </div>
                    </div>
                    <Check className={cn("h-4 w-4 text-foreground", selectedDoctorId === doctor.id ? "opacity-100" : "opacity-0")} />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
