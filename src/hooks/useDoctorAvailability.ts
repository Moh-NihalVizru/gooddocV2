import { useState, useCallback } from 'react';
import { AvailabilityResponse, DoctorAvailabilitySummary, ScheduleMode } from '@/types/scheduling';
import { format, addDays } from 'date-fns';

interface UseAvailabilityOptions {
  mode?: ScheduleMode;
  locationId?: string;
}

export function useDoctorAvailability() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAvailability = useCallback(async (
    doctorId: string,
    from: Date,
    to: Date,
    options?: UseAvailabilityOptions
  ): Promise<AvailabilityResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {
        doctorId,
        from: format(from, 'yyyy-MM-dd'),
        to: format(to, 'yyyy-MM-dd'),
      };

      if (options?.mode) {
        params.mode = options.mode;
      }
      if (options?.locationId) {
        params.locationId = options.locationId;
      }

      // Use fetch directly with query params
      const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/doctor-availability`);
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch availability');
      }

      const availabilityData = await response.json();
      setLoading(false);
      return availabilityData as AvailabilityResponse;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setLoading(false);
      return null;
    }
  }, []);

  const getDoctorsSummary = useCallback(async (
    doctorIds: string[],
    options?: UseAvailabilityOptions
  ): Promise<DoctorAvailabilitySummary[]> => {
    setLoading(true);
    setError(null);

    try {
      const today = new Date();
      const weekEnd = addDays(today, 7);

      const summaries = await Promise.all(
        doctorIds.map(async (doctorId) => {
          const availability = await getAvailability(doctorId, today, weekEnd, options);
          
          if (!availability) {
            return null;
          }

          // Determine availability status
          const todayStr = format(today, 'yyyy-MM-dd');
          const tomorrowStr = format(addDays(today, 1), 'yyyy-MM-dd');

          let availabilityStatus: DoctorAvailabilitySummary['availabilityStatus'] = 'no_schedule';
          let nextAvailable = availability.nextAvailable;
          let leaveUntil: string | undefined;

          // Check for current leave
          const todayData = availability.days.find(d => d.date === todayStr);
          if (todayData?.status === 'leave' && todayData.leaveInfo) {
            availabilityStatus = 'on_leave';
            leaveUntil = todayData.leaveInfo.endDate;
          } else if (todayData?.slots && todayData.slots.length > 0) {
            availabilityStatus = 'today';
          } else {
            const tomorrowData = availability.days.find(d => d.date === tomorrowStr);
            if (tomorrowData?.slots && tomorrowData.slots.length > 0) {
              availabilityStatus = 'tomorrow';
            } else if (nextAvailable) {
              availabilityStatus = 'this_week';
            }
          }

          return {
            doctorId,
            doctorName: availability.doctorName,
            availabilityStatus,
            nextAvailable,
            leaveUntil,
          } as DoctorAvailabilitySummary;
        })
      );

      setLoading(false);
      return summaries.filter((s): s is DoctorAvailabilitySummary => s !== null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setLoading(false);
      return [];
    }
  }, [getAvailability]);

  return {
    loading,
    error,
    getAvailability,
    getDoctorsSummary,
  };
}
