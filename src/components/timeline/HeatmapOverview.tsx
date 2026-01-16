import { useState, useMemo } from "react";
import { ChevronDown, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, parseISO, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, getDay, subDays, startOfMonth, getMonth } from "date-fns";
import { EventType, TimelineEvent } from "@/types/timeline";
import { cn } from "@/lib/utils";

interface DailyCount {
  date: string;
  total: number;
  byType: Record<EventType, number>;
  byStatus: Record<string, number>;
}

interface HeatmapOverviewProps {
  events: TimelineEvent[];
  startDate: string;
  endDate: string;
  onDateClick: (date: string) => void;
  onDateRangeSelect: (startDate: string, endDate: string) => void;
}

type HeatmapMode = "density" | "byType" | "status";
type HeatmapPalette = "primary" | "blues" | "purples" | "greyscale";

const COLOR_PALETTES = {
  primary: ["hsl(var(--primary) / 0.1)", "hsl(var(--primary) / 0.3)", "hsl(var(--primary) / 0.5)", "hsl(var(--primary) / 0.7)", "hsl(var(--primary))"],
  blues: ["#EFF6FF", "#BFDBFE", "#93C5FD", "#3B82F6", "#1D4ED8"],
  purples: ["#F5F3FF", "#DDD6FE", "#C4B5FD", "#8B5CF6", "#6D28D9"],
  greyscale: ["#F1F5F9", "#CBD5E1", "#94A3B8", "#475569", "#1E293B"],
};

const TYPE_COLORS: Record<EventType, string> = {
  Admission: "#3B82F6",
  Laboratory: "#8B5CF6",
  Medication: "#10B981",
  Radiology: "#06B6D4",
  Consultation: "#6366F1",
  Procedure: "#F59E0B",
  Observation: "#64748B",
  Discharge: "#22C55E",
};

export function HeatmapOverview({
  events,
  startDate,
  endDate,
  onDateClick,
  onDateRangeSelect,
}: HeatmapOverviewProps) {
  const [mode, setMode] = useState<HeatmapMode>("density");
  const [palette, setPalette] = useState<HeatmapPalette>("primary");
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<string | null>(null);

  // Calculate daily counts
  const dailyCounts = useMemo(() => {
    const counts: Record<string, DailyCount> = {};
    
    // Initialize all days in range
    const days = eachDayOfInterval({
      start: parseISO(startDate),
      end: parseISO(endDate),
    });

    days.forEach(day => {
      const dateStr = format(day, "yyyy-MM-dd");
      counts[dateStr] = {
        date: dateStr,
        total: 0,
        byType: {
          Admission: 0,
          Laboratory: 0,
          Medication: 0,
          Radiology: 0,
          Consultation: 0,
          Procedure: 0,
          Observation: 0,
          Discharge: 0,
        },
        byStatus: {
          Completed: 0,
          Resulted: 0,
          Administered: 0,
          Scheduled: 0,
          Planned: 0,
        },
      };
    });

    // Count events
    events.forEach(event => {
      if (counts[event.date]) {
        counts[event.date].total++;
        counts[event.date].byType[event.type]++;
        counts[event.date].byStatus[event.status]++;
      }
    });

    return counts;
  }, [events, startDate, endDate]);

  // Generate grid structure for calendar year (Jan 1 - Dec 31)
  const gridStructure = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const start = new Date(currentYear, 0, 1); // Jan 1
    const end = new Date(currentYear, 11, 31); // Dec 31
    
    const gridStart = startOfWeek(start, { weekStartsOn: 1 }); // Monday
    const gridEnd = endOfWeek(end, { weekStartsOn: 1 });
    
    const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];

    allDays.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === allDays.length - 1) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });

    return weeks;
  }, []);

  // Generate month labels for the grid
  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    const currentYear = new Date().getFullYear();

    gridStructure.forEach((week, weekIndex) => {
      const firstDay = week[0];
      const month = getMonth(firstDay);
      const year = firstDay.getFullYear();
      
      // Only show months from current year
      if (year === currentYear && month !== lastMonth) {
        labels.push({
          month: format(firstDay, "MMM"),
          weekIndex,
        });
        lastMonth = month;
      }
    });

    return labels;
  }, [gridStructure]);

  // Get color for a cell based on mode and palette
  const getCellColor = (dateStr: string): string => {
    const count = dailyCounts[dateStr];
    if (!count) return "#E5E7EB"; // Out of range

    if (mode === "density") {
      const colors = COLOR_PALETTES[palette];
      if (count.total === 0) return colors[0];
      if (count.total <= 2) return colors[1];
      if (count.total <= 5) return colors[2];
      if (count.total <= 10) return colors[3];
      return colors[4];
    }

    if (mode === "byType") {
      // Find dominant type
      let maxType: EventType = "Admission";
      let maxCount = 0;
      Object.entries(count.byType).forEach(([type, cnt]) => {
        if (cnt > maxCount) {
          maxCount = cnt;
          maxType = type as EventType;
        }
      });
      
      if (maxCount === 0) return "#E5E7EB";
      return TYPE_COLORS[maxType];
    }

    // Status mode
    const completed = count.byStatus.Completed + count.byStatus.Resulted + count.byStatus.Administered;
    const scheduled = count.byStatus.Scheduled + count.byStatus.Planned;
    if (completed > scheduled) return "#10B981"; // Green
    if (scheduled > completed) return "#3B82F6"; // Blue
    if (count.total > 0) return "#F59E0B"; // Amber for mixed
    return "#E5E7EB";
  };

  // Get tooltip content
  const getTooltipContent = (dateStr: string) => {
    const count = dailyCounts[dateStr];
    if (!count || count.total === 0) {
      return (
        <div className="text-xs">
          <div className="font-medium">{format(parseISO(dateStr), "EEE, MMM d")}</div>
          <div className="text-muted-foreground">No events</div>
        </div>
      );
    }

    // Get top 2 event types
    const topTypes = Object.entries(count.byType)
      .filter(([_, cnt]) => cnt > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2);

    return (
      <div className="text-xs space-y-1">
        <div className="font-medium">{format(parseISO(dateStr), "EEE, MMM d")}</div>
        <div className="font-medium">{count.total} events</div>
        {topTypes.map(([type, cnt]) => (
          <div key={type} className="text-muted-foreground">
            {type} {cnt}
          </div>
        ))}
        <div className="text-primary text-[10px] mt-1">Click to view day</div>
      </div>
    );
  };

  const handleCellClick = (dateStr: string) => {
    onDateClick(dateStr);
  };

  const handleCellMouseDown = (dateStr: string) => {
    setDragStart(dateStr);
  };

  const handleCellMouseUp = (dateStr: string) => {
    if (dragStart && dragStart !== dateStr) {
      onDateRangeSelect(dragStart, dateStr);
    }
    setDragStart(null);
  };

  const today = format(new Date(), "yyyy-MM-dd");

  if (isCollapsed) {
    return (
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="px-6 py-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Activity Overview</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(false)}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-10 bg-background border-b border-border">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-foreground">Activity Overview</h3>
            
            {/* Mode Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs">
                  {mode === "density" && "Density"}
                  {mode === "byType" && "By Type"}
                  {mode === "status" && "Status Mix"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setMode("density")}>
                  Density
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setMode("byType")}>
                  By Type
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setMode("status")}>
                  Status Mix
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Palette Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="px-2">
                  <Palette className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setPalette("primary")}>
                  Primary
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPalette("blues")}>
                  Blues
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPalette("purples")}>
                  Purples
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPalette("greyscale")}>
                  Greyscale
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-3">
            {/* Legend */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Appointments</span>
              <div className="flex gap-1">
                {COLOR_PALETTES[palette].map((color, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-sm border border-border"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(true)}
            >
              <ChevronDown className="h-4 w-4 rotate-180" />
            </Button>
          </div>
        </div>

        {/* Heatmap Grid */}
        <TooltipProvider delayDuration={100}>
          <div className="flex gap-1">
            {/* Grid */}
            <div className="flex-1 overflow-x-auto">
              {/* Month labels */}
              <div className="flex mb-1 h-4">
                {monthLabels.map((label, index) => {
                  const nextLabelIndex = monthLabels[index + 1]?.weekIndex || gridStructure.length;
                  const monthWidth = (nextLabelIndex - label.weekIndex) * 16; // 15px cell + 1px gap
                  
                  return (
                    <div
                      key={index}
                      className="text-[10px] text-muted-foreground font-medium"
                      style={{ 
                        width: `${monthWidth}px`,
                        textAlign: 'left'
                      }}
                    >
                      {label.month}
                    </div>
                  );
                })}
              </div>
              
              <div className="flex gap-1">
                {gridStructure.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day, dayIndex) => {
                      const dateStr = format(day, "yyyy-MM-dd");
                      const isInRange = dailyCounts[dateStr] !== undefined;
                      const isToday = dateStr === today;
                      const color = getCellColor(dateStr);

                      return (
                        <Tooltip key={dayIndex}>
                          <TooltipTrigger asChild>
                            <button
                              className={cn(
                                "w-3 h-3 rounded-sm transition-all",
                                isToday && "ring-2 ring-primary ring-offset-1",
                                !isInRange && "opacity-30",
                                "hover:ring-2 hover:ring-foreground/20"
                              )}
                              style={{ backgroundColor: color }}
                              onClick={() => isInRange && handleCellClick(dateStr)}
                              onMouseDown={() => isInRange && handleCellMouseDown(dateStr)}
                              onMouseUp={() => isInRange && handleCellMouseUp(dateStr)}
                              onMouseEnter={() => setHoveredDate(dateStr)}
                              onMouseLeave={() => setHoveredDate(null)}
                              disabled={!isInRange}
                            />
                          </TooltipTrigger>
                          {isInRange && (
                            <TooltipContent side="top">
                              {getTooltipContent(dateStr)}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}
