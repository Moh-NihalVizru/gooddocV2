import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Doctor = Tables<'doctors'>;
type DoctorInsert = TablesInsert<'doctors'>;
type DoctorUpdate = TablesUpdate<'doctors'>;

export function useRealtimeDoctors(status?: string) {
  return useQuery({
    queryKey: ["doctors", status],
    queryFn: async (): Promise<Doctor[]> => {
      let query = supabase
        .from("doctors")
        .select("*")
        .order("name", { ascending: true });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching doctors:", error);
        throw error;
      }

      return data;
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function useRealtimeDoctor(id: string | undefined) {
  return useQuery({
    queryKey: ["doctor", id],
    queryFn: async (): Promise<Doctor | null> => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching doctor:", error);
        throw error;
      }

      return data;
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function useOptimisticCreateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (doctor: DoctorInsert) => {
      const { data, error } = await supabase
        .from("doctors")
        .insert([doctor])
        .select()
        .single();

      if (error) {
        console.error("Error creating doctor:", error);
        throw error;
      }

      return data;
    },
    onMutate: async (newDoctor) => {
      await queryClient.cancelQueries({ queryKey: ["doctors"] });
      
      const previousDoctors = queryClient.getQueryData<Doctor[]>(["doctors"]);

      const optimisticDoctor: Doctor = {
        id: `temp-${Date.now()}`,
        name: newDoctor.name,
        department_id: newDoctor.department_id || null,
        specialty_id: newDoctor.specialty_id || null,
        degrees: newDoctor.degrees || null,
        avatar_url: newDoctor.avatar_url || null,
        timezone: newDoctor.timezone || 'Asia/Kolkata',
        status: newDoctor.status || 'active',
        default_duration: newDoctor.default_duration || 20,
        default_buffer: newDoctor.default_buffer || 5,
        min_lead_time: newDoctor.min_lead_time || 120,
        max_future_days: newDoctor.max_future_days || 90,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueriesData<Doctor[]>(
        { queryKey: ["doctors"] },
        (old) => old ? [...old, optimisticDoctor].sort((a, b) => a.name.localeCompare(b.name)) : [optimisticDoctor]
      );

      return { previousDoctors };
    },
    onError: (error, _newDoctor, context) => {
      if (context?.previousDoctors) {
        queryClient.setQueryData(["doctors"], context.previousDoctors);
      }
      
      toast({
        title: "Error creating doctor",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Doctor created",
        description: "Doctor profile has been created successfully.",
      });
    },
  });
}

export function useOptimisticUpdateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: DoctorUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("doctors")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating doctor:", error);
        throw error;
      }

      return data;
    },
    onMutate: async (updatedDoctor) => {
      await queryClient.cancelQueries({ queryKey: ["doctors"] });
      await queryClient.cancelQueries({ queryKey: ["doctor", updatedDoctor.id] });

      const previousDoctors = queryClient.getQueryData<Doctor[]>(["doctors"]);
      const previousDoctor = queryClient.getQueryData<Doctor>(["doctor", updatedDoctor.id]);

      queryClient.setQueriesData<Doctor[]>(
        { queryKey: ["doctors"] },
        (old) => old?.map(doc => 
          doc.id === updatedDoctor.id 
            ? { ...doc, ...updatedDoctor, updated_at: new Date().toISOString() } 
            : doc
        )
      );

      if (previousDoctor) {
        queryClient.setQueryData<Doctor>(
          ["doctor", updatedDoctor.id],
          { ...previousDoctor, ...updatedDoctor, updated_at: new Date().toISOString() }
        );
      }

      return { previousDoctors, previousDoctor };
    },
    onError: (error, updatedDoctor, context) => {
      if (context?.previousDoctors) {
        queryClient.setQueryData(["doctors"], context.previousDoctors);
      }
      if (context?.previousDoctor) {
        queryClient.setQueryData(["doctor", updatedDoctor.id], context.previousDoctor);
      }
      
      toast({
        title: "Error updating doctor",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Doctor updated",
        description: "Changes saved successfully.",
      });
    },
  });
}

// Leaves hooks with realtime
type Leave = Tables<'leaves'>;
type LeaveInsert = TablesInsert<'leaves'>;

export function useRealtimeLeaves(doctorId?: string) {
  return useQuery({
    queryKey: ["leaves", doctorId],
    queryFn: async (): Promise<Leave[]> => {
      let query = supabase
        .from("leaves")
        .select("*")
        .eq("status", "active")
        .order("start_datetime", { ascending: true });

      if (doctorId) {
        query = query.eq("doctor_id", doctorId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching leaves:", error);
        throw error;
      }

      return data;
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function useOptimisticCreateLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leave: LeaveInsert) => {
      const { data, error } = await supabase
        .from("leaves")
        .insert([leave])
        .select()
        .single();

      if (error) {
        console.error("Error creating leave:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      
      toast({
        title: "Leave created",
        description: "Leave has been scheduled successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating leave",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
