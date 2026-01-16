import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Plus, Video, MapPin } from "lucide-react";
import { 
  DaySchedule, 
  ScheduleBlock, 
  Leave, 
  Appointment, 
  TimeSlot,
  DayAvailability 
} from "@/types/scheduling";
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  eachDayOfInterval, 
  addDays, 
  addWeeks, 
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  isSameDay,
  isSameMonth,
  parseISO,
  isWithinInterval,
  getDay
} from "date-fns";

type CalendarView = "month" | "week" | "day";

interface DoctorCalendarProps {
  doctorId: string;
  doctorName: string;
  weekPattern: DaySchedule[];
  leaves: Leave[];
  appointments: Appointment[];
  availability?: DayAvailability[];
  onAddLeave?: () => void;
  onAddException?: () => void;
}

interface CalendarEvent {
  id: string;
  type: "shift" | "appointment" | "leave" | "blocked";
  title: string;
  start: Date;
  end: Date;
  mode?: "in_person" | "telehealth" | "both";
  status?: string;
  color: string;
}

export function DoctorCalendar({
  doctorId,
  doctorName,
  weekPattern,
  leaves,
  appointments,
  availability,
  onAddLeave,
  onAddException,
}: DoctorCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("week");

  const navigatePrev = () => {
    if (view === "month") setCurrentDate(subMonths(currentDate, 1));
    else if (view === "week") setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const navigateNext = () => {
    if (view === "month") setCurrentDate(addMonths(currentDate, 1));
    else if (view === "week") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const navigateToday = () => setCurrentDate(new Date());

  const dateRange = useMemo(() => {
    if (view === "month") {
      return eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentDate)),
        end: endOfWeek(endOfMonth(currentDate)),
      });
    } else if (view === "week") {
      return eachDayOfInterval({
        start: startOfWeek(currentDate),
        end: endOfWeek(currentDate),
      });
    }
    return [currentDate];
  }, [currentDate, view]);

  // Generate events from schedule, leaves, and appointments
  const events = useMemo(() => {
    const allEvents: CalendarEvent[] = [];

    // Add shift blocks
    dateRange.forEach(date => {
      const dayOfWeek = getDay(date);
      const daySchedule = weekPattern.find(d => d.day === dayOfWeek);
      
      if (daySchedule) {
        daySchedule.blocks.forEach((block, idx) => {
          const [startHour, startMin] = block.start.split(':').map(Number);
          const [endHour, endMin] = block.end.split(':').map(Number);
          
          const start = new Date(date);
          start.setHours(startHour, startMin, 0, 0);
          
          const end = new Date(date);
          end.setHours(endHour, endMin, 0, 0);

          allEvents.push({
            id: `shift-${format(date, 'yyyy-MM-dd')}-${idx}`,
            type: "shift",
            title: block.mode === "telehealth" ? "Telehealth" : "In-person",
            start,
            end,
            mode: block.mode,
            color: block.mode === "telehealth" 
              ? "bg-blue-100 border-blue-300 text-blue-800" 
              : "bg-green-100 border-green-300 text-green-800",
          });
        });
      }
    });

    // Add leaves
    leaves.filter(l => l.status === 'active').forEach(leave => {
      const start = parseISO(leave.start_datetime);
      const end = parseISO(leave.end_datetime);

      allEvents.push({
        id: `leave-${leave.id}`,
        type: "leave",
        title: leave.reason || "Leave",
        start,
        end,
        color: "bg-orange-100 border-orange-300 text-orange-800",
      });
    });

    // Add appointments
    appointments.forEach(appt => {
      if (appt.status === 'cancelled' || appt.status === 'no_show') return;

      const start = parseISO(appt.start_time);
      const end = parseISO(appt.end_time);

      allEvents.push({
        id: `appt-${appt.id}`,
        type: "appointment",
        title: appt.patient_name || "Appointment",
        start,
        end,
        mode: appt.mode,
        status: appt.status,
        color: appt.status === 'held' 
          ? "bg-yellow-100 border-yellow-300 text-yellow-800"
          : "bg-primary/20 border-primary text-primary",
      });
    });

    return allEvents;
  }, [dateRange, weekPattern, leaves, appointments]);

  const getEventsForDay = (date: Date) => {
    return events.filter(e => {
      return isSameDay(e.start, date) || 
        (e.type === 'leave' && isWithinInterval(date, { start: e.start, end: e.end }));
    });
  };

  const getEventsForHour = (date: Date, hour: number) => {
    return events.filter(e => {
      const eventDate = e.start;
      return isSameDay(eventDate, date) && eventDate.getHours() === hour;
    });
  };

  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM

  const getHeaderTitle = () => {
    if (view === "month") return format(currentDate, "MMMM yyyy");
    if (view === "week") {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    }
    return format(currentDate, "EEEE, MMMM d, yyyy");
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-4">
          <CardTitle className="text-lg">{doctorName}'s Calendar</CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={navigatePrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={navigateToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={navigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-sm font-medium">{getHeaderTitle()}</span>
        </div>

        <div className="flex items-center gap-2">
          <Select value={view} onValueChange={(v) => setView(v as CalendarView)}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
          {onAddLeave && (
            <Button variant="outline" size="sm" onClick={onAddLeave}>
              <Plus className="h-4 w-4 mr-1" />
              Leave
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Legend */}
        <div className="flex items-center gap-4 px-4 pb-3 border-b text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-200 border border-green-400" />
            <span>In-person</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-200 border border-blue-400" />
            <span>Telehealth</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-primary/30 border border-primary" />
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-yellow-200 border border-yellow-400" />
            <span>Held</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-orange-200 border border-orange-400" />
            <span>Leave</span>
          </div>
        </div>

        {/* Month View */}
        {view === "month" && (
          <div className="grid grid-cols-7">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground border-b">
                {day}
              </div>
            ))}
            {dateRange.map((date, idx) => {
              const dayEvents = getEventsForDay(date);
              const isToday = isSameDay(date, new Date());
              const isCurrentMonth = isSameMonth(date, currentDate);

              return (
                <div
                  key={idx}
                  className={`min-h-[100px] p-1 border-b border-r ${
                    !isCurrentMonth ? "bg-muted/30" : ""
                  }`}
                >
                  <div className={`text-xs font-medium mb-1 ${
                    isToday 
                      ? "bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center" 
                      : isCurrentMonth ? "" : "text-muted-foreground"
                  }`}>
                    {format(date, "d")}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs px-1 py-0.5 rounded truncate border ${event.color}`}
                      >
                        {event.type === 'shift' ? format(event.start, 'h:mm a') : event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground px-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Week View */}
        {view === "week" && (
          <div className="overflow-auto max-h-[600px]">
            <div className="grid grid-cols-8 sticky top-0 bg-background z-10 border-b">
              <div className="p-2 text-xs font-medium text-muted-foreground border-r" />
              {dateRange.map((date, idx) => {
                const isToday = isSameDay(date, new Date());
                return (
                  <div key={idx} className="p-2 text-center border-r">
                    <div className="text-xs text-muted-foreground">
                      {format(date, "EEE")}
                    </div>
                    <div className={`text-sm font-medium ${
                      isToday ? "bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center mx-auto" : ""
                    }`}>
                      {format(date, "d")}
                    </div>
                  </div>
                );
              })}
            </div>

            {hours.map(hour => (
              <div key={hour} className="grid grid-cols-8 min-h-[60px]">
                <div className="p-1 text-xs text-muted-foreground text-right pr-2 border-r">
                  {hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`}
                </div>
                {dateRange.map((date, dayIdx) => {
                  const hourEvents = getEventsForHour(date, hour);
                  return (
                    <div key={dayIdx} className="border-r border-b relative p-0.5">
                      {hourEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs px-1 py-0.5 rounded border mb-0.5 ${event.color}`}
                        >
                          <div className="flex items-center gap-1">
                            {event.mode === 'telehealth' && <Video className="h-3 w-3" />}
                            {event.mode === 'in_person' && <MapPin className="h-3 w-3" />}
                            <span className="truncate">{event.title}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Day View */}
        {view === "day" && (
          <div className="overflow-auto max-h-[600px]">
            {hours.map(hour => {
              const hourEvents = getEventsForHour(currentDate, hour);
              return (
                <div key={hour} className="flex min-h-[60px] border-b">
                  <div className="w-20 p-2 text-xs text-muted-foreground text-right border-r flex-shrink-0">
                    {hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? "12:00 PM" : `${hour}:00 AM`}
                  </div>
                  <div className="flex-1 p-1">
                    {hourEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`text-sm px-2 py-1 rounded border mb-1 ${event.color}`}
                      >
                        <div className="flex items-center gap-2">
                          {event.mode === 'telehealth' && <Video className="h-4 w-4" />}
                          {event.mode === 'in_person' && <MapPin className="h-4 w-4" />}
                          <span className="font-medium">{event.title}</span>
                          <span className="text-xs opacity-75">
                            {format(event.start, "h:mm a")} - {format(event.end, "h:mm a")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
