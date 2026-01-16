import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { DoctorCalendar } from "@/components/doctors/DoctorCalendar";
import { LeaveManagement } from "@/components/doctors/LeaveManagement";
import { supabase } from "@/integrations/supabase/client";
import { 
  Doctor, 
  DaySchedule,
  Leave, 
  Appointment 
} from "@/types/scheduling";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

export default function DoctorCalendarPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [weekPattern, setWeekPattern] = useState<DaySchedule[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLeavePanel, setShowLeavePanel] = useState(false);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);

    try {
      // Fetch doctor
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', id)
        .single();

      if (doctorError) throw doctorError;
      setDoctor(doctorData as Doctor);

      // Fetch schedule template
      const { data: templateData } = await supabase
        .from('schedule_templates')
        .select('*')
        .eq('doctor_id', id)
        .eq('is_active', true)
        .limit(1);

      if (templateData?.[0]) {
        setWeekPattern(templateData[0].week_pattern as unknown as DaySchedule[]);
      }

      // Fetch leaves
      const { data: leavesData } = await supabase
        .from('leaves')
        .select('*')
        .eq('doctor_id', id)
        .order('start_datetime', { ascending: true });
      setLeaves((leavesData || []) as Leave[]);

      // Fetch appointments
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', id)
        .order('start_time', { ascending: true });
      setAppointments((appointmentsData || []) as Appointment[]);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: "Error loading calendar data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLeave = async (leave: Omit<Leave, 'id' | 'status'>) => {
    try {
      const { data, error } = await supabase
        .from('leaves')
        .insert([{ ...leave, status: 'active' }])
        .select()
        .single();

      if (error) {
        console.error('Error creating leave:', error);
        throw error;
      }
      setLeaves(prev => [...prev, data as Leave].sort(
        (a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
      ));
      setShowLeavePanel(false);
    } catch (err) {
      console.error('Failed to create leave:', err);
      throw err;
    }
  };

  const handleCancelLeave = async (leaveId: string) => {
    const { error } = await supabase
      .from('leaves')
      .update({ status: 'cancelled' })
      .eq('id', leaveId);

    if (error) throw error;
    setLeaves(prev => prev.filter(l => l.id !== leaveId));
  };

  const { isCollapsed } = useSidebarContext();

  if (loading || !doctor) {
    return (
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className={cn("flex-1 transition-all duration-300", isCollapsed ? "ml-[60px]" : "ml-[220px]")}>
          <AppHeader breadcrumbs={["Doctors", "Calendar"]} />
          <main className="p-6">
            <p className="text-muted-foreground">{loading ? "Loading..." : "Doctor not found"}</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className={cn("flex-1 transition-all duration-300", isCollapsed ? "ml-[60px]" : "ml-[220px]")}>
        <AppHeader breadcrumbs={["Doctors", doctor.name, "Calendar"]} />
        
        <main className="p-6 h-[calc(100vh-80px)]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/doctors')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-lg font-semibold">{doctor.name}'s Calendar</h1>
            </div>
            <Button variant="outline" onClick={() => navigate(`/doctors/${id}/schedule`)}>
              <Settings className="h-4 w-4 mr-2" />
              Edit Schedule
            </Button>
          </div>

          {/* Calendar */}
          <DoctorCalendar
            doctorId={id!}
            doctorName={doctor.name}
            weekPattern={weekPattern}
            leaves={leaves}
            appointments={appointments}
            onAddLeave={() => setShowLeavePanel(true)}
          />
        </main>
      </div>

      {/* Leave Panel */}
      <Sheet open={showLeavePanel} onOpenChange={setShowLeavePanel}>
        <SheetContent className="w-[400px] sm:max-w-[400px]">
          <SheetHeader>
            <SheetTitle>Manage Leaves</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <LeaveManagement
              doctorId={id!}
              doctorName={doctor.name}
              leaves={leaves}
              onCreateLeave={handleCreateLeave}
              onCancelLeave={handleCancelLeave}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
