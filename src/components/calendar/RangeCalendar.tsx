import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronLeft, ChevronRight, CalendarIcon, X } from "lucide-react";
import { format, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, isToday as checkIsToday, addMonths } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { formatDate, formatRange, getRelativeDateLabel } from "@/lib/dateUtils";

type Preset = {
  label: string;
  getValue: () => Date | DateRange;
  isRange: boolean;
};

interface RangeCalendarProps {
  mode?: "single" | "range";
  value?: Date | DateRange;
  onChange?: (value: Date | DateRange | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  locale?: "en-GB" | "en-US" | "en-IN";
  showPresets?: boolean;
  className?: string;
}

const presets: Preset[] = [
  {
    label: "Today",
    getValue: () => new Date(),
    isRange: false,
  },
  {
    label: "Tomorrow",
    getValue: () => addDays(new Date(), 1),
    isRange: false,
  },
  {
    label: "This Week",
    getValue: () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 1 }),
      to: endOfWeek(new Date(), { weekStartsOn: 1 }),
    }),
    isRange: true,
  },
  {
    label: "Next Week",
    getValue: () => {
      const nextWeekStart = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 7);
      return {
        from: nextWeekStart,
        to: endOfWeek(nextWeekStart, { weekStartsOn: 1 }),
      };
    },
    isRange: true,
  },
  {
    label: "This Month",
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
    isRange: true,
  },
];

export function RangeCalendar({
  mode = "single",
  value,
  onChange,
  minDate,
  maxDate = addMonths(new Date(), 12),
  disabledDates = [],
  locale = "en-GB",
  showPresets = true,
  className,
}: RangeCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRangeMode, setIsRangeMode] = useState(mode === "range");
  const [internalDate, setInternalDate] = useState<Date>(
    value instanceof Date ? value : (value as DateRange)?.from || new Date()
  );
  const [internalRange, setInternalRange] = useState<DateRange | undefined>(
    value && !(value instanceof Date) ? (value as DateRange) : { from: new Date(), to: undefined }
  );

  const handleSingleDateSelect = (date: Date | undefined) => {
    if (date) {
      setInternalDate(date);
      onChange?.(date);
      setIsOpen(false);
    }
  };

  const handleRangeSelect = (range: DateRange | undefined) => {
    setInternalRange(range);
    if (range?.from && range?.to) {
      onChange?.(range);
    }
  };

  const handlePresetClick = (preset: Preset) => {
    const presetValue = preset.getValue();
    if (preset.isRange) {
      setIsRangeMode(true);
      const range = presetValue as DateRange;
      setInternalRange(range);
      onChange?.(range);
    } else {
      setIsRangeMode(false);
      const date = presetValue as Date;
      setInternalDate(date);
      onChange?.(date);
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    if (isRangeMode) {
      setInternalRange({ from: undefined, to: undefined });
      onChange?.(undefined);
    } else {
      onChange?.(undefined);
    }
  };

  const handleApply = () => {
    if (isRangeMode && internalRange?.from && internalRange?.to) {
      onChange?.(internalRange);
    }
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (isRangeMode && internalRange?.from && internalRange?.to) {
      return formatRange(internalRange.from, internalRange.to, locale);
    }
    if (isRangeMode && internalRange?.from) {
      return `${format(internalRange.from, "dd MMM")} — Select end`;
    }
    return formatDate(internalDate, locale);
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return disabledDates.some((d) => isSameDay(d, date));
  };

  const calendarClassNames = {
    months: "flex flex-col sm:flex-row gap-4",
    month: "space-y-3",
    caption: "flex justify-center pt-1 relative items-center h-10",
    caption_label: "text-sm font-semibold text-foreground",
    nav: "flex items-center gap-1",
    nav_button: cn(
      "h-8 w-8 bg-transparent p-0 opacity-60 hover:opacity-100",
      "hover:bg-muted rounded-lg transition-all",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    ),
    nav_button_previous: "absolute left-1",
    nav_button_next: "absolute right-1",
    table: "w-full border-collapse",
    head_row: "flex",
    head_cell: "text-muted-foreground rounded-md w-9 font-medium text-xs",
    row: "flex w-full mt-1",
    cell: cn(
      "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
      "[&:has([aria-selected])]:bg-primary/10 rounded-lg"
    ),
    day: cn(
      "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
      "hover:bg-muted rounded-lg transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    ),
    day_selected: cn(
      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
      "focus:bg-primary focus:text-primary-foreground rounded-full"
    ),
    day_today: "ring-2 ring-primary/30 font-semibold",
    day_outside: "text-muted-foreground opacity-40",
    day_disabled: "text-muted-foreground opacity-30 cursor-not-allowed",
    day_range_middle: "aria-selected:bg-primary/15 aria-selected:text-foreground rounded-none",
    day_range_start: "rounded-l-full",
    day_range_end: "rounded-r-full",
    day_hidden: "invisible",
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "min-w-[200px] justify-between gap-2 h-10",
            "border-border/60 hover:border-border hover:bg-muted/50",
            "shadow-sm transition-all",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">{getDisplayText()}</span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-auto p-0 shadow-lg border-border/60" 
        align="start"
        sideOffset={8}
      >
        {/* Header with range toggle */}
        <div className="flex items-center justify-between gap-4 p-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Label htmlFor="range-toggle" className="text-sm font-medium cursor-pointer">
              Date Range
            </Label>
            <Switch
              id="range-toggle"
              checked={isRangeMode}
              onCheckedChange={(checked) => {
                setIsRangeMode(checked);
                if (!checked) {
                  setInternalRange({ from: undefined, to: undefined });
                }
              }}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>

        {/* Presets row */}
        {showPresets && (
          <div className="flex flex-wrap gap-1.5 p-3 border-b border-border/60 bg-muted/30">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                onClick={() => handlePresetClick(preset)}
                className={cn(
                  "h-7 px-2.5 text-xs font-medium",
                  "border-border/50 hover:bg-background hover:border-primary/50",
                  "transition-colors"
                )}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        )}

        {/* Calendar(s) */}
        <div className="p-3">
          {isRangeMode ? (
            <Calendar
              mode="range"
              selected={internalRange}
              onSelect={handleRangeSelect}
              numberOfMonths={2}
              disabled={isDateDisabled}
              initialFocus
              className="pointer-events-auto"
              classNames={calendarClassNames}
            />
          ) : (
            <Calendar
              mode="single"
              selected={internalDate}
              onSelect={handleSingleDateSelect}
              disabled={isDateDisabled}
              initialFocus
              className="pointer-events-auto"
              classNames={calendarClassNames}
            />
          )}
        </div>

        {/* Footer actions for range mode */}
        {isRangeMode && (
          <div className="flex items-center justify-between gap-2 p-3 border-t border-border/60 bg-muted/20">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
                disabled={!internalRange?.from || !internalRange?.to}
                className="bg-primary hover:bg-primary/90"
              >
                Apply
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
