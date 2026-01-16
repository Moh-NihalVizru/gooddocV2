import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Appointment = Tables<'appointments'>;
type AppointmentInsert = TablesInsert<'appointments'>;
type AppointmentUpdate = TablesUpdate<'appointments'>;

type AppointmentStatus = 'held' | 'booked' | 'checked_in' | 'completed' | 'no_show' | 'cancelled';

interface AppointmentFilters {
  doctorId?: string;
  patientId?: string;
  status?: AppointmentStatus[];
  startDate?: string;
  endDate?: string;
}

export function useRealtimeAppointments(filters?: AppointmentFilters) {
  return useQuery({
    queryKey: ["appointments", filters],
    queryFn: async (): Promise<Appointment[]> => {
      let query = supabase
        .from("appointments")
        .select("*")
        .order("start_time", { ascending: true });

      if (filters?.doctorId) {
        query = query.eq("doctor_id", filters.doctorId);
      }
      if (filters?.patientId) {
        query = query.eq("patient_id", filters.patientId);
      }
      if (filters?.status && filters.status.length > 0) {
        query = query.in("status", filters.status);
      }
      if (filters?.startDate) {
        query = query.gte("start_time", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte("end_time", filters.endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching appointments:", error);
        throw error;
      }

      return data;
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function useRealtimeAppointment(id: string | undefined) {
  return useQuery({
    queryKey: ["appointment", id],
    queryFn: async (): Promise<Appointment | null> => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching appointment:", error);
        throw error;
      }

      return data;
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function useOptimisticCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointment: AppointmentInsert) => {
      const { data, error } = await supabase
        .from("appointments")
        .insert([appointment])
        .select()
        .single();

      if (error) {
        console.error("Error creating appointment:", error);
        throw error;
      }

      return data;
    },
    onMutate: async (newAppointment) => {
      await queryClient.cancelQueries({ queryKey: ["appointments"] });
      
      const previousAppointments = queryClient.getQueryData<Appointment[]>(["appointments"]);

      // Optimistic appointment
      const optimisticAppointment: Appointment = {
        id: `temp-${Date.now()}`,
        doctor_id: newAppointment.doctor_id,
        patient_id: newAppointment.patient_id,
        patient_name: newAppointment.patient_name || null,
        start_time: newAppointment.start_time,
        end_time: newAppointment.end_time,
        mode: newAppointment.mode || 'in_person',
        status: newAppointment.status || 'booked',
        notes: newAppointment.notes || null,
        location_id: newAppointment.location_id || null,
        appointment_type_id: newAppointment.appointment_type_id || null,
        source: newAppointment.source || 'front_desk',
        created_by: newAppointment.created_by || null,
        hold_expires_at: newAppointment.hold_expires_at || null,
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Update all appointment queries
      queryClient.setQueriesData<Appointment[]>(
        { queryKey: ["appointments"] },
        (old) => old ? [optimisticAppointment, ...old] : [optimisticAppointment]
      );

      return { previousAppointments };
    },
    onError: (error, _newAppointment, context) => {
      if (context?.previousAppointments) {
        queryClient.setQueryData(["appointments"], context.previousAppointments);
      }
      
      toast({
        title: "Error creating appointment",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Appointment created",
        description: "Appointment has been scheduled successfully.",
      });
    },
  });
}

export function useOptimisticUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: AppointmentUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("appointments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating appointment:", error);
        throw error;
      }

      return data;
    },
    onMutate: async (updatedAppointment) => {
      await queryClient.cancelQueries({ queryKey: ["appointments"] });
      await queryClient.cancelQueries({ queryKey: ["appointment", updatedAppointment.id] });

      const previousAppointments = queryClient.getQueryData<Appointment[]>(["appointments"]);
      const previousAppointment = queryClient.getQueryData<Appointment>(["appointment", updatedAppointment.id]);

      // Optimistic update
      queryClient.setQueriesData<Appointment[]>(
        { queryKey: ["appointments"] },
        (old) => old?.map(apt => 
          apt.id === updatedAppointment.id 
            ? { ...apt, ...updatedAppointment, updated_at: new Date().toISOString() } 
            : apt
        )
      );

      if (previousAppointment) {
        queryClient.setQueryData<Appointment>(
          ["appointment", updatedAppointment.id],
          { ...previousAppointment, ...updatedAppointment, updated_at: new Date().toISOString() }
        );
      }

      return { previousAppointments, previousAppointment };
    },
    onError: (error, updatedAppointment, context) => {
      if (context?.previousAppointments) {
        queryClient.setQueryData(["appointments"], context.previousAppointments);
      }
      if (context?.previousAppointment) {
        queryClient.setQueryData(["appointment", updatedAppointment.id], context.previousAppointment);
      }
      
      toast({
        title: "Error updating appointment",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Appointment updated",
        description: "Changes saved successfully.",
      });
    },
  });
}

export function useOptimisticCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("appointments")
        .update({ status: 'cancelled' as const })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error cancelling appointment:", error);
        throw error;
      }

      return data;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["appointments"] });

      const previousAppointments = queryClient.getQueryData<Appointment[]>(["appointments"]);

      // Optimistic update
      queryClient.setQueriesData<Appointment[]>(
        { queryKey: ["appointments"] },
        (old) => old?.map(apt => 
          apt.id === id 
            ? { ...apt, status: 'cancelled' as const, updated_at: new Date().toISOString() } 
            : apt
        )
      );

      return { previousAppointments };
    },
    onError: (error, _id, context) => {
      if (context?.previousAppointments) {
        queryClient.setQueryData(["appointments"], context.previousAppointments);
      }
      
      toast({
        title: "Error cancelling appointment",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Appointment cancelled",
        description: "The appointment has been cancelled.",
      });
    },
  });
}
