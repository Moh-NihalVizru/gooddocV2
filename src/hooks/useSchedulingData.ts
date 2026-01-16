import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Doctor, 
  Location, 
  ScheduleTemplate, 
  Leave, 
  ScheduleException,
  AppointmentType 
} from '@/types/scheduling';

export function useSchedulingData() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [doctorsRes, locationsRes, typesRes] = await Promise.all([
        supabase.from('doctors').select('*').order('name'),
        supabase.from('locations').select('*').eq('is_active', true),
        supabase.from('appointment_types').select('*').eq('is_active', true),
      ]);

      if (doctorsRes.error) throw doctorsRes.error;
      if (locationsRes.error) throw locationsRes.error;
      if (typesRes.error) throw typesRes.error;

      setDoctors(doctorsRes.data as Doctor[]);
      setLocations(locationsRes.data as Location[]);
      setAppointmentTypes(typesRes.data as AppointmentType[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getDoctorSchedule = async (doctorId: string): Promise<ScheduleTemplate | undefined> => {
    const { data, error } = await supabase
      .from('schedule_templates')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('is_active', true)
      .limit(1);

    if (error) throw error;
    if (!data?.[0]) return undefined;
    
    const row = data[0];
    return {
      ...row,
      week_pattern: row.week_pattern as unknown as ScheduleTemplate['week_pattern'],
    };
  };

  const getDoctorLeaves = async (doctorId: string, from?: Date, to?: Date) => {
    let query = supabase
      .from('leaves')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('status', 'active')
      .order('start_datetime', { ascending: true });

    if (from) {
      query = query.gte('end_datetime', from.toISOString());
    }
    if (to) {
      query = query.lte('start_datetime', to.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Leave[];
  };

  const getDoctorExceptions = async (doctorId: string, from?: Date, to?: Date) => {
    let query = supabase
      .from('schedule_exceptions')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('exception_date', { ascending: true });

    if (from) {
      query = query.gte('exception_date', from.toISOString().split('T')[0]);
    }
    if (to) {
      query = query.lte('exception_date', to.toISOString().split('T')[0]);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as ScheduleException[];
  };

  const createLeave = async (leave: Omit<Leave, 'id' | 'status'>) => {
    const { data, error } = await supabase
      .from('leaves')
      .insert({
        ...leave,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;
    return data as Leave;
  };

  const cancelLeave = async (leaveId: string) => {
    const { error } = await supabase
      .from('leaves')
      .update({ status: 'cancelled' })
      .eq('id', leaveId);

    if (error) throw error;
  };

  const saveScheduleTemplate = async (
    doctorId: string,
    weekPattern: ScheduleTemplate['week_pattern'],
    name = 'Default'
  ) => {
    // Check if template exists
    const existing = await getDoctorSchedule(doctorId);
    const patternJson = JSON.parse(JSON.stringify(weekPattern));

    if (existing) {
      const { error } = await supabase
        .from('schedule_templates')
        .update({ week_pattern: patternJson, updated_at: new Date().toISOString() })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('schedule_templates')
        .insert([{
          doctor_id: doctorId,
          name,
          week_pattern: patternJson,
          is_active: true,
        }]);

      if (error) throw error;
    }
  };

  const createException = async (exception: Omit<ScheduleException, 'id'>) => {
    const exceptionData = {
      doctor_id: exception.doctor_id,
      exception_date: exception.exception_date,
      start_time: exception.start_time,
      end_time: exception.end_time,
      exception_type: exception.exception_type,
      location_id: exception.location_id,
      mode: exception.mode,
      duration: exception.duration,
      buffer: exception.buffer,
      capacity: exception.capacity,
      notes: exception.notes,
    };
    
    const { data, error } = await supabase
      .from('schedule_exceptions')
      .insert([exceptionData])
      .select()
      .single();

    if (error) throw error;
    return data as ScheduleException;
  };

  const deleteException = async (exceptionId: string) => {
    const { error } = await supabase
      .from('schedule_exceptions')
      .delete()
      .eq('id', exceptionId);

    if (error) throw error;
  };

  return {
    doctors,
    locations,
    appointmentTypes,
    loading,
    error,
    refetch: fetchData,
    getDoctorSchedule,
    getDoctorLeaves,
    getDoctorExceptions,
    createLeave,
    cancelLeave,
    saveScheduleTemplate,
    createException,
    deleteException,
  };
}
