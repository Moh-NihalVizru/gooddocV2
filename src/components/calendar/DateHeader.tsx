import { formatDate, formatRange } from "@/lib/dateUtils";
import { getPageSubtext, PageKey } from "@/lib/pageSubtextConfig";
import { cn } from "@/lib/utils";

interface DateHeaderProps {
  pageKey: PageKey;
  selectedDate: Date | null;
  selectedRange?: { from: Date | null; to: Date | null };
  locale?: "en-GB" | "en-US" | "en-IN";
  timezone?: string;
  className?: string;
  showSubtext?: boolean;
}

export function DateHeader({
  pageKey,
  selectedDate,
  selectedRange,
  locale = "en-GB",
  className,
  showSubtext = true,
}: DateHeaderProps) {
  const getDisplayText = () => {
    // Range mode with both dates
    if (selectedRange?.from && selectedRange?.to) {
      return formatRange(selectedRange.from, selectedRange.to, locale);
    }
    
    // Range mode with only start date
    if (selectedRange?.from && !selectedRange?.to) {
      return `${formatDate(selectedRange.from, locale)} — ...`;
    }
    
    // Single date mode
    if (selectedDate) {
      return formatDate(selectedDate, locale);
    }
    
    return "Select a date";
  };

  const subtext = showSubtext
    ? getPageSubtext({
        pageKey,
        selectedDate,
        selectedRange: selectedRange
          ? { from: selectedRange.from, to: selectedRange.to }
          : undefined,
      })
    : null;

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <h2 className="text-[15px] font-semibold text-foreground tracking-tight">
        {getDisplayText()}
      </h2>
      {subtext && (
        <p className="text-xs text-muted-foreground leading-tight">
          {subtext}
        </p>
      )}
    </div>
  );
}
