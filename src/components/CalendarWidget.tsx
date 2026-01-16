import { useState, useCallback } from "react";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameMonth } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { PageKey, getPageSubtext } from "@/lib/pageSubtextConfig";

interface CalendarWidgetProps {
  pageKey?: PageKey;
  selectedDate?: Date;
  selectedRange?: DateRange;
  onDateChange?: (date: Date) => void;
  onRangeChange?: (range: DateRange | undefined) => void;
  showSubtext?: boolean;
  className?: string;
}

const presets = [
  { label: "Today", getValue: () => new Date(), isRange: false },
  { label: "Tomorrow", getValue: () => addDays(new Date(), 1), isRange: false },
  { label: "This Week", getValue: () => ({ from: startOfWeek(new Date(), { weekStartsOn: 1 }), to: endOfWeek(new Date(), { weekStartsOn: 1 }) }), isRange: true },
  { label: "This Month", getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }), isRange: true },
];

/**
 * Format date as "EEE | dd MMM yyyy" (e.g., "Tue | 06 Jan 2026")
 */
function formatDateHeader(date: Date): string {
  return `${format(date, "EEE")} | ${format(date, "dd MMM yyyy")}`;
}

/**
 * Format range with smart month compression
 */
function formatRangeHeader(from: Date, to: Date): string {
  const startDay = format(from, "EEE dd");
  const endDay = format(to, "EEE dd");
  const endMonthYear = format(to, "MMM yyyy");
  
  if (isSameMonth(from, to)) {
    return `${startDay} — ${endDay} ${endMonthYear}`;
  }
  
  const startMonth = format(from, "MMM");
  return `${startDay} ${startMonth} — ${endDay} ${endMonthYear}`;
}

export function CalendarWidget({
  pageKey = "default",
  selectedDate: controlledDate,
  selectedRange: controlledRange,
  onDateChange,
  onRangeChange,
  showSubtext = true,
  className,
}: CalendarWidgetProps) {
  const [internalDate, setInternalDate] = useState<Date>(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [isRangeMode, setIsRangeMode] = useState(false);
  const [internalRange, setInternalRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: undefined,
  });

  // Use controlled or internal state
  const selectedDate = controlledDate ?? internalDate;
  const dateRange = controlledRange ?? internalRange;

  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (date) {
      if (controlledDate === undefined) {
        setInternalDate(date);
      }
      onDateChange?.(date);
      setIsOpen(false);
    }
  }, [controlledDate, onDateChange]);

  const handleRangeSelect = useCallback((range: DateRange | undefined) => {
    if (controlledRange === undefined) {
      setInternalRange(range);
    }
    onRangeChange?.(range);
  }, [controlledRange, onRangeChange]);

  const handlePresetClick = (preset: typeof presets[0]) => {
    const value = preset.getValue();
    if (preset.isRange) {
      setIsRangeMode(true);
      handleRangeSelect(value as DateRange);
    } else {
      setIsRangeMode(false);
      handleDateSelect(value as Date);
    }
  };

  const handleClear = () => {
    setInternalRange({ from: undefined, to: undefined });
    onRangeChange?.(undefined);
  };

  const handleApply = () => {
    if (dateRange?.from && dateRange?.to) {
      onRangeChange?.(dateRange);
    }
    setIsOpen(false);
  };

  // Get the formatted display text
  const getDisplayText = () => {
    if (isRangeMode && dateRange?.from && dateRange?.to) {
      return formatRangeHeader(dateRange.from, dateRange.to);
    }
    if (isRangeMode && dateRange?.from) {
      return `${format(dateRange.from, "EEE dd MMM")} — Select end`;
    }
    return formatDateHeader(selectedDate);
  };

  // Get dynamic subtext based on page and date
  const subtext = showSubtext
    ? getPageSubtext({
        pageKey,
        selectedDate: isRangeMode ? null : selectedDate,
        selectedRange: isRangeMode
          ? { from: dateRange?.from ?? null, to: dateRange?.to ?? null }
          : undefined,
      })
    : null;

  const calendarClassNames = {
    months: "flex flex-col sm:flex-row gap-4",
    month: "space-y-3",
    caption: "flex justify-center pt-1 relative items-center h-10",
    caption_label: "text-sm font-semibold text-foreground",
    nav: "flex items-center gap-1",
    nav_button: cn(
      "h-8 w-8 bg-transparent p-0 opacity-60 hover:opacity-100",
      "hover:bg-muted rounded-lg transition-all",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
    <div className={cn("flex items-center gap-3", className)}>

      {/* Date Header: "Tue | 06 Jan 2026" with subtext */}
      <div className="flex flex-col gap-0.5 min-w-[180px]">
        <h2 className="text-[15px] font-semibold text-foreground tracking-tight">
          {getDisplayText()}
        </h2>
        {subtext && (
          <p className="text-xs text-muted-foreground leading-tight">
            {subtext}
          </p>
        )}
      </div>

      {/* Calendar Dropdown */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
            className="h-9 w-9 shrink-0 border-border/60 hover:border-border"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-auto p-0 shadow-lg border-border/60" 
          align="end"
          sideOffset={8}
        >
          {/* Range toggle header */}
          <div className="flex items-center justify-between gap-4 p-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Label htmlFor="range-mode" className="text-sm font-medium cursor-pointer">
                Date Range
              </Label>
              <Switch
                id="range-mode"
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

          {/* Presets */}
          <div className="flex flex-wrap gap-1.5 p-3 border-b border-border/60 bg-muted/30">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                onClick={() => handlePresetClick(preset)}
                className="h-7 px-2.5 text-xs font-medium border-border/50 hover:bg-background hover:border-primary/50"
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Calendar */}
          <div className="p-3">
            {isRangeMode ? (
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={handleRangeSelect}
                numberOfMonths={2}
                initialFocus
                className="pointer-events-auto"
                classNames={calendarClassNames}
              />
            ) : (
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
                className="pointer-events-auto"
                classNames={calendarClassNames}
              />
            )}
          </div>

          {/* Footer for range mode */}
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
                  disabled={!dateRange?.from || !dateRange?.to}
                  className="bg-primary hover:bg-primary/90"
                >
                  Apply
                </Button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
