/**
 * Slot Generation Algorithm
 * 
 * Generates available time slots for a doctor based on:
 * 1. Recurring weekly schedule templates
 * 2. One-off exceptions (additions or blocks)
 * 3. Leaves (subtract from availability)
 * 4. Holidays (subtract from availability)
 * 5. Existing appointments (subtract from availability)
 */

import { 
  DaySchedule, 
  ScheduleBlock, 
  ScheduleException, 
  Leave, 
  Holiday,
  Appointment,
  TimeSlot,
  DayAvailability,
  ScheduleMode
} from '@/types/scheduling';
import { format, parseISO, addMinutes, isAfter, isBefore, startOfDay, endOfDay, getDay, parse, addDays } from 'date-fns';

interface TimeBlock {
  start: Date;
  end: Date;
  mode: ScheduleMode;
  locationId?: string;
  capacity: number;
  duration: number;
  buffer: number;
}

interface SlotGeneratorContext {
  doctorId: string;
  timezone: string;
  defaultDuration: number;
  defaultBuffer: number;
  minLeadTime: number; // minutes
  maxFutureDays: number;
  weekPattern: DaySchedule[];
  exceptions: ScheduleException[];
  leaves: Leave[];
  holidays: Holiday[];
  appointments: Appointment[];
  appointmentTypeDuration?: number;
  appointmentTypeBuffer?: number;
  filterMode?: ScheduleMode;
  filterLocationId?: string;
}

/**
 * Expand weekly template into concrete time blocks for a date range
 */
function expandWeeklyTemplate(
  weekPattern: DaySchedule[],
  startDate: Date,
  endDate: Date,
  timezone: string,
  defaultDuration: number,
  defaultBuffer: number
): TimeBlock[] {
  const blocks: TimeBlock[] = [];
  let currentDate = startOfDay(startDate);

  while (isBefore(currentDate, endOfDay(endDate))) {
    const dayOfWeek = getDay(currentDate);
    const daySchedule = weekPattern.find(d => d.day === dayOfWeek);

    if (daySchedule) {
      for (const block of daySchedule.blocks) {
        const startTime = parse(block.start, 'HH:mm', currentDate);
        const endTime = parse(block.end, 'HH:mm', currentDate);

        blocks.push({
          start: startTime,
          end: endTime,
          mode: block.mode || 'in_person',
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

/**
 * Apply exceptions (additions and blocks) to base blocks
 */
function applyExceptions(
  baseBlocks: TimeBlock[],
  exceptions: ScheduleException[],
  startDate: Date,
  endDate: Date,
  defaultDuration: number,
  defaultBuffer: number
): TimeBlock[] {
  let blocks = [...baseBlocks];

  for (const exception of exceptions) {
    const exceptionDate = parseISO(exception.exception_date);
    
    if (isBefore(exceptionDate, startDate) || isAfter(exceptionDate, endDate)) {
      continue;
    }

    if (exception.exception_type === 'add') {
      // Add extra availability
      const startTime = parse(exception.start_time, 'HH:mm:ss', exceptionDate);
      const endTime = parse(exception.end_time, 'HH:mm:ss', exceptionDate);

      blocks.push({
        start: startTime,
        end: endTime,
        mode: exception.mode || 'in_person',
        locationId: exception.location_id,
        capacity: exception.capacity || 1,
        duration: exception.duration || defaultDuration,
        buffer: exception.buffer !== undefined ? exception.buffer : defaultBuffer,
      });
    } else if (exception.exception_type === 'block') {
      // Remove availability for this time range
      const blockStart = parse(exception.start_time, 'HH:mm:ss', exceptionDate);
      const blockEnd = parse(exception.end_time, 'HH:mm:ss', exceptionDate);

      blocks = blocks.filter(b => {
        // Check if this block overlaps with the exception
        const overlaps = isBefore(b.start, blockEnd) && isAfter(b.end, blockStart);
        return !overlaps;
      });
    }
  }

  return blocks;
}

/**
 * Subtract leave periods from blocks
 */
function subtractLeaves(blocks: TimeBlock[], leaves: Leave[]): TimeBlock[] {
  const activeLeaves = leaves.filter(l => l.status === 'active');
  
  return blocks.filter(block => {
    for (const leave of activeLeaves) {
      const leaveStart = parseISO(leave.start_datetime);
      const leaveEnd = parseISO(leave.end_datetime);

      // Check if block overlaps with leave
      if (isBefore(block.start, leaveEnd) && isAfter(block.end, leaveStart)) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Subtract holidays from blocks
 */
function subtractHolidays(blocks: TimeBlock[], holidays: Holiday[]): TimeBlock[] {
  const blockingHolidays = holidays.filter(h => h.block_bookings);

  return blocks.filter(block => {
    const blockDate = format(block.start, 'yyyy-MM-dd');
    
    for (const holiday of blockingHolidays) {
      if (holiday.holiday_date === blockDate) {
        // Check location match (null location_id means all locations)
        if (!holiday.location_id || holiday.location_id === block.locationId) {
          return false;
        }
      }
    }
    return true;
  });
}

/**
 * Generate individual time slots from blocks
 */
function generateSlotsFromBlocks(
  blocks: TimeBlock[],
  appointments: Appointment[],
  minLeadTime: number,
  maxFutureDays: number,
  appointmentDuration?: number,
  appointmentBuffer?: number
): TimeSlot[] {
  const now = new Date();
  const minStartTime = addMinutes(now, minLeadTime);
  const maxEndTime = addDays(now, maxFutureDays);
  const slots: TimeSlot[] = [];

  for (const block of blocks) {
    const duration = appointmentDuration || block.duration;
    const buffer = appointmentBuffer !== undefined ? appointmentBuffer : block.buffer;
    const slotInterval = duration + buffer;

    let slotStart = block.start;

    while (isBefore(addMinutes(slotStart, duration), block.end) || 
           addMinutes(slotStart, duration).getTime() === block.end.getTime()) {
      const slotEnd = addMinutes(slotStart, duration);

      // Check min lead time
      if (isBefore(slotStart, minStartTime)) {
        slotStart = addMinutes(slotStart, slotInterval);
        continue;
      }

      // Check max future window
      if (isAfter(slotStart, maxEndTime)) {
        break;
      }

      // Check for conflicts with existing appointments
      const hasConflict = appointments.some(appt => {
        if (appt.status === 'cancelled' || appt.status === 'no_show') {
          return false;
        }
        const apptStart = parseISO(appt.start_time);
        const apptEnd = parseISO(appt.end_time);
        return isBefore(slotStart, apptEnd) && isAfter(slotEnd, apptStart);
      });

      if (!hasConflict) {
        const slotId = `${format(slotStart, "yyyy-MM-dd'T'HH:mm")}_${block.locationId || 'default'}`;
        
        slots.push({
          id: slotId,
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          mode: block.mode,
          locationId: block.locationId,
          capacityRemaining: block.capacity,
          status: 'available',
        });
      }

      slotStart = addMinutes(slotStart, slotInterval);
    }
  }

  return slots;
}

/**
 * Main slot generation function
 */
export function generateSlots(ctx: SlotGeneratorContext, startDate: Date, endDate: Date): TimeSlot[] {
  // Step 1: Expand weekly template
  let blocks = expandWeeklyTemplate(
    ctx.weekPattern,
    startDate,
    endDate,
    ctx.timezone,
    ctx.defaultDuration,
    ctx.defaultBuffer
  );

  // Step 2: Apply exceptions
  blocks = applyExceptions(
    blocks,
    ctx.exceptions,
    startDate,
    endDate,
    ctx.defaultDuration,
    ctx.defaultBuffer
  );

  // Step 3: Subtract leaves
  blocks = subtractLeaves(blocks, ctx.leaves);

  // Step 4: Subtract holidays
  blocks = subtractHolidays(blocks, ctx.holidays);

  // Step 5: Filter by mode if specified
  if (ctx.filterMode && ctx.filterMode !== 'both') {
    blocks = blocks.filter(b => b.mode === ctx.filterMode || b.mode === 'both');
  }

  // Step 6: Filter by location if specified
  if (ctx.filterLocationId) {
    blocks = blocks.filter(b => b.locationId === ctx.filterLocationId);
  }

  // Step 7: Generate slots
  const slots = generateSlotsFromBlocks(
    blocks,
    ctx.appointments,
    ctx.minLeadTime,
    ctx.maxFutureDays,
    ctx.appointmentTypeDuration,
    ctx.appointmentTypeBuffer
  );

  return slots;
}

/**
 * Group slots by day
 */
export function groupSlotsByDay(
  slots: TimeSlot[],
  startDate: Date,
  endDate: Date,
  leaves: Leave[]
): DayAvailability[] {
  const days: DayAvailability[] = [];
  let currentDate = startOfDay(startDate);

  while (isBefore(currentDate, endOfDay(endDate))) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const daySlots = slots.filter(s => s.start.startsWith(dateStr));

    // Check if on leave
    const activeLeave = leaves.find(l => {
      if (l.status !== 'active') return false;
      const leaveStart = parseISO(l.start_datetime);
      const leaveEnd = parseISO(l.end_datetime);
      return isBefore(currentDate, leaveEnd) && isAfter(endOfDay(currentDate), leaveStart);
    });

    let status: DayAvailability['status'];
    if (activeLeave) {
      status = 'leave';
    } else if (daySlots.length === 0) {
      status = 'unavailable';
    } else {
      status = 'available';
    }

    const dayAvailability: DayAvailability = {
      date: dateStr,
      status,
      slots: daySlots,
    };

    if (activeLeave) {
      dayAvailability.leaveInfo = {
        reason: activeLeave.reason,
        endDate: format(parseISO(activeLeave.end_datetime), 'yyyy-MM-dd'),
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

/**
 * Get availability summary for a doctor
 */
export function getDoctorAvailabilitySummary(
  days: DayAvailability[],
  leaves: Leave[]
): { status: 'today' | 'tomorrow' | 'this_week' | 'on_leave' | 'no_schedule'; nextAvailable?: string; leaveUntil?: string } {
  const today = format(new Date(), 'yyyy-MM-dd');
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  // Check if currently on leave
  const currentLeave = leaves.find(l => {
    if (l.status !== 'active') return false;
    const leaveStart = parseISO(l.start_datetime);
    const leaveEnd = parseISO(l.end_datetime);
    const now = new Date();
    return isBefore(leaveStart, now) && isAfter(leaveEnd, now);
  });

  if (currentLeave) {
    return {
      status: 'on_leave',
      leaveUntil: format(parseISO(currentLeave.end_datetime), 'yyyy-MM-dd'),
    };
  }

  // Find next available slot
  for (const day of days) {
    if (day.slots.length > 0 && day.status === 'available') {
      const nextSlot = day.slots[0].start;
      
      if (day.date === today) {
        return { status: 'today', nextAvailable: nextSlot };
      } else if (day.date === tomorrow) {
        return { status: 'tomorrow', nextAvailable: nextSlot };
      } else {
        return { status: 'this_week', nextAvailable: nextSlot };
      }
    }
  }

  return { status: 'no_schedule' };
}
