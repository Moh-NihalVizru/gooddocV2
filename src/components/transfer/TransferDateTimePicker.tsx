import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TransferDateTimePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  label?: string;
  testId?: string;
}

export function TransferDateTimePicker({
  value,
  onChange,
  minDate,
  label = "Transfer Date & Time",
  testId = "transfer-datetime"
}: TransferDateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get current date with time for default
  const now = new Date();
  const selectedDate = value || now;
  
  // Extract time parts
  const hours = selectedDate.getHours();
  const minutes = selectedDate.getMinutes();

  // Generate time options
  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  const minuteOptions = [0, 15, 30, 45];

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const newDate = new Date(date);
      newDate.setHours(hours, minutes, 0, 0);
      onChange(newDate);
    }
  };

  const handleHourChange = (hour: string) => {
    const newDate = new Date(selectedDate);
    newDate.setHours(parseInt(hour), minutes, 0, 0);
    onChange(newDate);
  };

  const handleMinuteChange = (minute: string) => {
    const newDate = new Date(selectedDate);
    newDate.setHours(hours, parseInt(minute), 0, 0);
    onChange(newDate);
  };

  const setToNow = () => {
    onChange(new Date());
  };

  // Check if selected time is in the future
  const isScheduled = selectedDate > now;

  // Validate against min date
  const isValidDate = !minDate || selectedDate >= minDate;

  return (
    <div className="space-y-2" data-testid={testId}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          {label}
        </Label>
        <Badge
          variant="outline"
          className={cn(
            "text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors",
            !isScheduled && "bg-primary/10 text-primary"
          )}
          onClick={setToNow}
        >
          Now
        </Badge>
      </div>
      
      <div className="flex gap-2">
        {/* Date Picker */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "flex-1 justify-start text-left font-normal h-10",
                !value && "text-muted-foreground",
                !isValidDate && "border-destructive"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedDate, "dd MMM yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                handleDateChange(date);
                setIsOpen(false);
              }}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        {/* Hour Select */}
        <Select value={hours.toString()} onValueChange={handleHourChange}>
          <SelectTrigger className="w-20 h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {hourOptions.map((h) => (
              <SelectItem key={h} value={h.toString()}>
                {h.toString().padStart(2, '0')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="flex items-center text-muted-foreground">:</span>

        {/* Minute Select */}
        <Select value={(Math.floor(minutes / 15) * 15).toString()} onValueChange={handleMinuteChange}>
          <SelectTrigger className="w-20 h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {minuteOptions.map((m) => (
              <SelectItem key={m} value={m.toString()}>
                {m.toString().padStart(2, '0')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status indicators */}
      <div className="flex items-center gap-2">
        {isScheduled ? (
          <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-600 border-amber-200">
            Scheduled for future
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600 border-green-200">
            Immediate transfer
          </Badge>
        )}
        {!isValidDate && minDate && (
          <Badge variant="destructive" className="text-xs">
            Cannot be before {format(minDate, "dd MMM yyyy, HH:mm")}
          </Badge>
        )}
      </div>
    </div>
  );
}
