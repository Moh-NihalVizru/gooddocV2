import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ScheduleBuilder } from "@/components/doctors/ScheduleBuilder";
import { LeaveManagement } from "@/components/doctors/LeaveManagement";
import { DoctorCalendar } from "@/components/doctors/DoctorCalendar";
import { supabase } from "@/integrations/supabase/client";
import { 
  Doctor, 
  Location, 
  ScheduleTemplate, 
  Leave, 
  DaySchedule,
  Appointment 
} from "@/types/scheduling";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

export default function DoctorSchedulePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [weekPattern, setWeekPattern] = useState<DaySchedule[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("schedule");

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

      // Fetch locations
      const { data: locationsData } = await supabase
        .from('locations')
        .select('*')
        .eq('is_active', true);
      setLocations((locationsData || []) as Location[]);

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
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });
      setAppointments((appointmentsData || []) as Appointment[]);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: "Error loading schedule data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async (newPattern: DaySchedule[]) => {
    if (!id) return;

    try {
      // Check if template exists
      const { data: existing } = await supabase
        .from('schedule_templates')
        .select('id')
        .eq('doctor_id', id)
        .eq('is_active', true)
        .limit(1);

      const patternJson = JSON.parse(JSON.stringify(newPattern));

      if (existing?.[0]) {
        const { error } = await supabase
          .from('schedule_templates')
          .update({ week_pattern: patternJson })
          .eq('id', existing[0].id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('schedule_templates')
          .insert([{
            doctor_id: id,
            name: 'Default',
            week_pattern: patternJson,
            is_active: true,
          }]);
        if (error) throw error;
      }

      setWeekPattern(newPattern);
    } catch (error) {
      console.error('Error saving schedule:', error);
      throw error;
    }
  };

  const handleCreateLeave = async (leave: Omit<Leave, 'id' | 'status'>) => {
    const { data, error } = await supabase
      .from('leaves')
      .insert([{ ...leave, status: 'active' }])
      .select()
      .single();

    if (error) throw error;
    setLeaves(prev => [...prev, data as Leave].sort(
      (a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
    ));
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

  if (loading) {
    return (
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className={cn("flex-1 transition-all duration-300", isCollapsed ? "ml-[60px]" : "ml-[220px]")}>
          <AppHeader breadcrumbs={["Doctors", "Schedule"]} />
          <main className="p-6">
            <p className="text-muted-foreground">Loading...</p>
          </main>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className={cn("flex-1 transition-all duration-300", isCollapsed ? "ml-[60px]" : "ml-[220px]")}>
          <AppHeader breadcrumbs={["Doctors", "Schedule"]} />
          <main className="p-6">
            <p className="text-muted-foreground">Doctor not found</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className={cn("flex-1 transition-all duration-300", isCollapsed ? "ml-[60px]" : "ml-[220px]")}>
        <AppHeader breadcrumbs={["Doctors", doctor.name, "Schedule"]} />
        
        <main className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/doctors')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-12 w-12">
                <AvatarImage src={doctor.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {doctor.name.split(" ").slice(0, 2).map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-lg font-semibold">{doctor.name}</h1>
                <p className="text-sm text-muted-foreground">{doctor.degrees}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate(`/doctors/${id}/calendar`)}>
              <Calendar className="h-4 w-4 mr-2" />
              View Calendar
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
              <TabsTrigger value="leaves">Leaves</TabsTrigger>
              <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="schedule">
              <ScheduleBuilder
                doctorId={id!}
                weekPattern={weekPattern}
                locations={locations}
                defaultDuration={doctor.default_duration}
                defaultBuffer={doctor.default_buffer}
                onSave={handleSaveSchedule}
              />
            </TabsContent>

            <TabsContent value="leaves">
              <LeaveManagement
                doctorId={id!}
                doctorName={doctor.name}
                leaves={leaves}
                onCreateLeave={handleCreateLeave}
                onCancelLeave={handleCancelLeave}
              />
            </TabsContent>

            <TabsContent value="exceptions">
              <div className="p-6 bg-card rounded-lg border text-center">
                <h3 className="text-lg font-medium mb-2">Schedule Exceptions</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add one-off availability or block time for specific dates
                </p>
                <Button>
                  Add Exception
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="p-6 bg-card rounded-lg border">
                  <h3 className="font-medium mb-4">Default Appointment Settings</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span>{doctor.default_duration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Buffer</span>
                      <span>{doctor.default_buffer} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min Lead Time</span>
                      <span>{doctor.min_lead_time} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Future Booking</span>
                      <span>{doctor.max_future_days} days</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-card rounded-lg border">
                  <h3 className="font-medium mb-4">Timezone</h3>
                  <p className="text-sm text-muted-foreground">
                    {doctor.timezone}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
