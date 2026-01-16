import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScheduleBlock {
  start: string;
  end: string;
  locationId?: string;
  mode?: string;
  duration?: number;
  buffer?: number;
  capacity?: number;
}

interface DaySchedule {
  day: number;
  blocks: ScheduleBlock[];
}

interface TimeBlock {
  start: Date;
  end: Date;
  mode: string;
  locationId?: string;
  capacity: number;
  duration: number;
  buffer: number;
}

interface TimeSlot {
  id: string;
  start: string;
  end: string;
  mode: string;
  locationId?: string;
  locationName?: string;
  capacityRemaining: number;
  status: string;
}

interface DayAvailability {
  date: string;
  status: string;
  slots: TimeSlot[];
  nextAvailable?: string;
  leaveInfo?: { reason?: string; endDate: string };
}

// Date utility functions
function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

function isBefore(a: Date, b: Date): boolean {
  return a.getTime() < b.getTime();
}

function isAfter(a: Date, b: Date): boolean {
  return a.getTime() > b.getTime();
}

function formatDate(date: Date, fmt: string): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (fmt === 'yyyy-MM-dd') {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
  return date.toISOString();
}

function parseTimeToDate(timeStr: string, baseDate: Date): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const d = new Date(baseDate);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

// Expand weekly template
function expandWeeklyTemplate(
  weekPattern: DaySchedule[],
  startDate: Date,
  endDate: Date,
  defaultDuration: number,
  defaultBuffer: number
): TimeBlock[] {
  const blocks: TimeBlock[] = [];
  let currentDate = startOfDay(startDate);

  while (isBefore(currentDate, endOfDay(endDate))) {
    const dayOfWeek = currentDate.getDay();
    const daySchedule = weekPattern.find((d) => d.day === dayOfWeek);

    if (daySchedule) {
      for (const block of daySchedule.blocks) {
        const startTime = parseTimeToDate(block.start, currentDate);
        const endTime = parseTimeToDate(block.end, currentDate);

        blocks.push({
          start: startTime,
          end: endTime,
          mode: block.mode || "in_person",
          locationId: block.locationId,
          capacity: block.capacity || 1,
          duration: block.duration || defaultDuration,
          buffer: block.buffer !== undefined ? block.buffer : defaultBuffer,
        });
      }
    }

    currentDate = addDays(currentDate, 1);
  }

  return blocks;
}

// Apply exceptions
function applyExceptions(
  baseBlocks: TimeBlock[],
  exceptions: any[],
  startDate: Date,
  endDate: Date,
  defaultDuration: number,
  defaultBuffer: number
): TimeBlock[] {
  let blocks = [...baseBlocks];

  for (const exception of exceptions) {
    const exceptionDate = new Date(exception.exception_date + "T00:00:00");

    if (isBefore(exceptionDate, startDate) || isAfter(exceptionDate, endDate)) {
      continue;
    }

    if (exception.exception_type === "add") {
      const startTime = parseTimeToDate(exception.start_time, exceptionDate);
      const endTime = parseTimeToDate(exception.end_time, exceptionDate);

      blocks.push({
        start: startTime,
        end: endTime,
        mode: exception.mode || "in_person",
        locationId: exception.location_id,
        capacity: exception.capacity || 1,
        duration: exception.duration || defaultDuration,
        buffer: exception.buffer !== undefined ? exception.buffer : defaultBuffer,
      });
    } else if (exception.exception_type === "block") {
      const blockStart = parseTimeToDate(exception.start_time, exceptionDate);
      const blockEnd = parseTimeToDate(exception.end_time, exceptionDate);

      blocks = blocks.filter((b) => {
        const overlaps = isBefore(b.start, blockEnd) && isAfter(b.end, blockStart);
        return !overlaps;
      });
    }
  }

  return blocks;
}

// Subtract leaves
function subtractLeaves(blocks: TimeBlock[], leaves: any[]): TimeBlock[] {
  const activeLeaves = leaves.filter((l) => l.status === "active");

  return blocks.filter((block) => {
    for (const leave of activeLeaves) {
      const leaveStart = new Date(leave.start_datetime);
      const leaveEnd = new Date(leave.end_datetime);

      if (isBefore(block.start, leaveEnd) && isAfter(block.end, leaveStart)) {
        return false;
      }
    }
    return true;
  });
}

// Subtract holidays
function subtractHolidays(blocks: TimeBlock[], holidays: any[]): TimeBlock[] {
  const blockingHolidays = holidays.filter((h) => h.block_bookings);

  return blocks.filter((block) => {
    const blockDate = formatDate(block.start, "yyyy-MM-dd");

    for (const holiday of blockingHolidays) {
      if (holiday.holiday_date === blockDate) {
        if (!holiday.location_id || holiday.location_id === block.locationId) {
          return false;
        }
      }
    }
    return true;
  });
}

// Generate slots from blocks
function generateSlotsFromBlocks(
  blocks: TimeBlock[],
  appointments: any[],
  minLeadTime: number,
  maxFutureDays: number,
  appointmentDuration?: number,
  appointmentBuffer?: number,
  locations?: any[]
): TimeSlot[] {
  const now = new Date();
  const minStartTime = addMinutes(now, minLeadTime);
  const maxEndTime = addDays(now, maxFutureDays);
  const slots: TimeSlot[] = [];

  const locationMap = new Map(locations?.map((l) => [l.id, l.name]) || []);

  for (const block of blocks) {
    const duration = appointmentDuration || block.duration;
    const buffer = appointmentBuffer !== undefined ? appointmentBuffer : block.buffer;
    const slotInterval = duration + buffer;

    let slotStart = new Date(block.start);

    while (
      isBefore(addMinutes(slotStart, duration), block.end) ||
      addMinutes(slotStart, duration).getTime() === block.end.getTime()
    ) {
      const slotEnd = addMinutes(slotStart, duration);

      if (isBefore(slotStart, minStartTime)) {
        slotStart = addMinutes(slotStart, slotInterval);
        continue;
      }

      if (isAfter(slotStart, maxEndTime)) {
        break;
      }

      const hasConflict = appointments.some((appt) => {
        if (appt.status === "cancelled" || appt.status === "no_show") {
          return false;
        }
        const apptStart = new Date(appt.start_time);
        const apptEnd = new Date(appt.end_time);
        return isBefore(slotStart, apptEnd) && isAfter(slotEnd, apptStart);
      });

      if (!hasConflict) {
        const slotId = `${formatDate(slotStart, "yyyy-MM-dd")}T${slotStart.getHours().toString().padStart(2, "0")}:${slotStart.getMinutes().toString().padStart(2, "0")}_${block.locationId || "default"}`;

        slots.push({
          id: slotId,
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          mode: block.mode,
          locationId: block.locationId,
          locationName: block.locationId ? locationMap.get(block.locationId) : undefined,
          capacityRemaining: block.capacity,
          status: "available",
        });
      }

      slotStart = addMinutes(slotStart, slotInterval);
    }
  }

  return slots;
}

// Group slots by day
function groupSlotsByDay(
  slots: TimeSlot[],
  startDate: Date,
  endDate: Date,
  leaves: any[]
): DayAvailability[] {
  const days: DayAvailability[] = [];
  let currentDate = startOfDay(startDate);

  while (isBefore(currentDate, endOfDay(endDate))) {
    const dateStr = formatDate(currentDate, "yyyy-MM-dd");
    const daySlots = slots.filter((s) => s.start.startsWith(dateStr));

    const activeLeave = leaves.find((l) => {
      if (l.status !== "active") return false;
      const leaveStart = new Date(l.start_datetime);
      const leaveEnd = new Date(l.end_datetime);
      return isBefore(currentDate, leaveEnd) && isAfter(endOfDay(currentDate), leaveStart);
    });

    let status: string;
    if (activeLeave) {
      status = "leave";
    } else if (daySlots.length === 0) {
      status = "unavailable";
    } else {
      status = "available";
    }

    const dayAvailability: DayAvailability = {
      date: dateStr,
      status,
      slots: daySlots,
    };

    if (activeLeave) {
      dayAvailability.leaveInfo = {
        reason: activeLeave.reason,
        endDate: formatDate(new Date(activeLeave.end_datetime), "yyyy-MM-dd"),
      };
    }

    if (daySlots.length > 0) {
      dayAvailability.nextAvailable = daySlots[0].start;
    }

    days.push(dayAvailability);
    currentDate = addDays(currentDate, 1);
  }

  return days;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const doctorId = url.searchParams.get("doctorId");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const mode = url.searchParams.get("mode");
    const locationId = url.searchParams.get("locationId");

    if (!doctorId || !from || !to) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: doctorId, from, to" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Fetching availability for doctor ${doctorId} from ${from} to ${to}`);

    // Fetch doctor
    const { data: doctor, error: doctorError } = await supabase
      .from("doctors")
      .select("*")
      .eq("id", doctorId)
      .single();

    if (doctorError || !doctor) {
      console.error("Doctor not found:", doctorError);
      return new Response(
        JSON.stringify({ error: "Doctor not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch schedule template
    const { data: templates, error: templateError } = await supabase
      .from("schedule_templates")
      .select("*")
      .eq("doctor_id", doctorId)
      .eq("is_active", true)
      .limit(1);

    if (templateError) {
      console.error("Template fetch error:", templateError);
    }

    const template = templates?.[0];
    const weekPattern: DaySchedule[] = template?.week_pattern || [];

    // Fetch exceptions
    const { data: exceptions } = await supabase
      .from("schedule_exceptions")
      .select("*")
      .eq("doctor_id", doctorId)
      .gte("exception_date", from)
      .lte("exception_date", to);

    // Fetch leaves
    const { data: leaves } = await supabase
      .from("leaves")
      .select("*")
      .eq("doctor_id", doctorId)
      .eq("status", "active")
      .lte("start_datetime", to + "T23:59:59")
      .gte("end_datetime", from + "T00:00:00");

    // Fetch holidays
    const { data: holidays } = await supabase
      .from("holidays")
      .select("*")
      .gte("holiday_date", from)
      .lte("holiday_date", to);

    // Fetch existing appointments
    const { data: appointments } = await supabase
      .from("appointments")
      .select("*")
      .eq("doctor_id", doctorId)
      .gte("start_time", from + "T00:00:00")
      .lte("end_time", to + "T23:59:59")
      .in("status", ["held", "booked", "checked_in"]);

    // Fetch locations
    const { data: locations } = await supabase.from("locations").select("*");

    const startDate = new Date(from);
    const endDate = new Date(to);

    // Generate slots
    let blocks = expandWeeklyTemplate(
      weekPattern,
      startDate,
      endDate,
      doctor.default_duration,
      doctor.default_buffer
    );

    blocks = applyExceptions(
      blocks,
      exceptions || [],
      startDate,
      endDate,
      doctor.default_duration,
      doctor.default_buffer
    );

    blocks = subtractLeaves(blocks, leaves || []);
    blocks = subtractHolidays(blocks, holidays || []);

    // Filter by mode
    if (mode && mode !== "both") {
      blocks = blocks.filter((b) => b.mode === mode || b.mode === "both");
    }

    // Filter by location
    if (locationId) {
      blocks = blocks.filter((b) => b.locationId === locationId);
    }

    const slots = generateSlotsFromBlocks(
      blocks,
      appointments || [],
      doctor.min_lead_time,
      doctor.max_future_days,
      undefined,
      undefined,
      locations || []
    );

    const days = groupSlotsByDay(slots, startDate, endDate, leaves || []);

    // Find next available
    let nextAvailable: string | undefined;
    for (const day of days) {
      if (day.slots.length > 0) {
        nextAvailable = day.slots[0].start;
        break;
      }
    }

    const response = {
      doctorId: doctor.id,
      doctorName: doctor.name,
      timezone: doctor.timezone,
      days,
      nextAvailable,
    };

    console.log(`Generated ${slots.length} slots for doctor ${doctorId}`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating availability:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
