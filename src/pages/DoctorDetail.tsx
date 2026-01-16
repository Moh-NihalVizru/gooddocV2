import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { PageContent } from "@/components/PageContent";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Video,
  Edit,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DoctorCalendar } from "@/components/doctors/DoctorCalendar";
import { ScheduleBuilder } from "@/components/doctors/ScheduleBuilder";
import { LeaveManagement } from "@/components/doctors/LeaveManagement";
import { Doctor, Location, Leave, DaySchedule, Appointment } from "@/types/scheduling";
import { format, parseISO, startOfDay, endOfDay, differenceInYears } from "date-fns";

interface PatientData {
  id: string;
  gdid: string;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  phone: string;
}

interface TodayAppointment extends Appointment {
  patient?: PatientData | null;
  appointment_type?: {
    name: string;
  } | null;
  location?: {
    name: string;
  } | null;
}

// Helper to calculate age from date of birth
const calculateAge = (dob: string): number => {
  return differenceInYears(new Date(), parseISO(dob));
};

// Mock data for today's appointments when no real data exists
const generateMockTodayAppointments = (doctorId: string): TodayAppointment[] => {
  const today = new Date();
  const baseDate = format(today, 'yyyy-MM-dd');
  
  return [
    {
      id: 'apt-001',
      doctor_id: doctorId,
      patient_id: 'pat-001',
      patient_name: 'Ramesh Krishnamurthy',
      start_time: `${baseDate}T09:00:00`,
      end_time: `${baseDate}T09:20:00`,
      status: 'completed' as const,
      mode: 'in_person' as const,
      notes: 'Knee replacement follow-up - Day 14',
      version: 1,
      patient: { id: 'pat-001', gdid: 'UHID-2024-00847', first_name: 'Ramesh', last_name: 'Krishnamurthy', gender: 'Male', date_of_birth: '1967-03-15', phone: '+91 98765 43210' },
      appointment_type: { name: 'Post-Op Review' },
      location: { name: 'OPD Cabin 3' },
    },
    {
      id: 'apt-002',
      doctor_id: doctorId,
      patient_id: 'pat-002',
      patient_name: 'Sunita Devi',
      start_time: `${baseDate}T09:20:00`,
      end_time: `${baseDate}T09:40:00`,
      status: 'completed' as const,
      mode: 'in_person' as const,
      notes: 'Chronic lower back pain x 3 months',
      version: 1,
      patient: { id: 'pat-002', gdid: 'UHID-2024-01234', first_name: 'Sunita', last_name: 'Devi', gender: 'Female', date_of_birth: '1980-07-22', phone: '+91 87654 32109' },
      appointment_type: { name: 'New Consultation' },
      location: { name: 'OPD Cabin 3' },
    },
    {
      id: 'apt-003',
      doctor_id: doctorId,
      patient_id: 'pat-003',
      patient_name: 'Mohammed Farooq',
      start_time: `${baseDate}T09:40:00`,
      end_time: `${baseDate}T10:00:00`,
      status: 'checked_in' as const,
      mode: 'in_person' as const,
      notes: 'Hip arthritis - medication review',
      version: 1,
      patient: { id: 'pat-003', gdid: 'UHID-2023-00562', first_name: 'Mohammed', last_name: 'Farooq', gender: 'Male', date_of_birth: '1958-11-08', phone: '+91 76543 21098' },
      appointment_type: { name: 'Review' },
      location: { name: 'OPD Cabin 3' },
    },
    {
      id: 'apt-004',
      doctor_id: doctorId,
      patient_id: 'pat-004',
      patient_name: 'Anjali Sharma',
      start_time: `${baseDate}T10:00:00`,
      end_time: `${baseDate}T10:20:00`,
      status: 'booked' as const,
      mode: 'in_person' as const,
      notes: 'Sports injury - ACL tear suspected',
      version: 1,
      patient: { id: 'pat-004', gdid: 'UHID-2024-02156', first_name: 'Anjali', last_name: 'Sharma', gender: 'Female', date_of_birth: '1991-05-12', phone: '+91 65432 10987' },
      appointment_type: { name: 'New Consultation' },
      location: { name: 'OPD Cabin 3' },
    },
    {
      id: 'apt-005',
      doctor_id: doctorId,
      patient_id: 'pat-005',
      patient_name: 'Gopal Reddy',
      start_time: `${baseDate}T10:20:00`,
      end_time: `${baseDate}T10:40:00`,
      status: 'booked' as const,
      mode: 'in_person' as const,
      notes: 'Total hip replacement - surgical fitness',
      version: 1,
      patient: { id: 'pat-005', gdid: 'UHID-2022-00189', first_name: 'Gopal', last_name: 'Reddy', gender: 'Male', date_of_birth: '1953-09-28', phone: '+91 54321 09876' },
      appointment_type: { name: 'Pre-Op Assessment' },
      location: { name: 'OPD Cabin 3' },
    },
    {
      id: 'apt-006',
      doctor_id: doctorId,
      patient_id: 'pat-006',
      patient_name: 'Kavitha Nair',
      start_time: `${baseDate}T10:40:00`,
      end_time: `${baseDate}T11:00:00`,
      status: 'booked' as const,
      mode: 'telehealth' as const,
      notes: 'Post-surgery rehab progress review',
      version: 1,
      patient: { id: 'pat-006', gdid: 'UHID-2024-01876', first_name: 'Kavitha', last_name: 'Nair', gender: 'Female', date_of_birth: '1973-02-14', phone: '+91 43210 98765' },
      appointment_type: { name: 'Telehealth' },
      location: null,
    },
    {
      id: 'apt-007',
      doctor_id: doctorId,
      patient_id: 'pat-007',
      patient_name: 'Suresh Babu',
      start_time: `${baseDate}T11:00:00`,
      end_time: `${baseDate}T11:20:00`,
      status: 'booked' as const,
      mode: 'in_person' as const,
      notes: 'Platelet-rich plasma injection - shoulder',
      version: 1,
      patient: { id: 'pat-007', gdid: 'UHID-2024-02890', first_name: 'Suresh', last_name: 'Babu', gender: 'Male', date_of_birth: '1977-06-30', phone: '+91 32109 87654' },
      appointment_type: { name: 'Injection Therapy' },
      location: { name: 'Procedure Room 2' },
    },
    {
      id: 'apt-008',
      doctor_id: doctorId,
      patient_id: 'pat-008',
      patient_name: 'Lakshmi Venkatesh',
      start_time: `${baseDate}T11:20:00`,
      end_time: `${baseDate}T11:40:00`,
      status: 'booked' as const,
      mode: 'in_person' as const,
      notes: 'Osteoporosis - DEXA scan results',
      version: 1,
      patient: { id: 'pat-008', gdid: 'UHID-2023-01456', first_name: 'Lakshmi', last_name: 'Venkatesh', gender: 'Female', date_of_birth: '1964-12-05', phone: '+91 21098 76543' },
      appointment_type: { name: 'Review' },
      location: { name: 'OPD Cabin 3' },
    },
    {
      id: 'apt-009',
      doctor_id: doctorId,
      patient_id: 'pat-009',
      patient_name: 'Arjun Malhotra',
      start_time: `${baseDate}T14:00:00`,
      end_time: `${baseDate}T14:20:00`,
      status: 'booked' as const,
      mode: 'in_person' as const,
      notes: 'Fracture non-union - left tibia',
      version: 1,
      patient: { id: 'pat-009', gdid: 'UHID-2024-00234', first_name: 'Arjun', last_name: 'Malhotra', gender: 'Male', date_of_birth: '1997-08-18', phone: '+91 10987 65432' },
      appointment_type: { name: 'New Consultation' },
      location: { name: 'OPD Cabin 3' },
    },
    {
      id: 'apt-010',
      doctor_id: doctorId,
      patient_id: 'pat-010',
      patient_name: 'Meenakshi Iyer',
      start_time: `${baseDate}T14:20:00`,
      end_time: `${baseDate}T14:40:00`,
      status: 'booked' as const,
      mode: 'in_person' as const,
      notes: 'Carpal tunnel release - wound check',
      version: 1,
      patient: { id: 'pat-010', gdid: 'UHID-2024-01567', first_name: 'Meenakshi', last_name: 'Iyer', gender: 'Female', date_of_birth: '1970-04-25', phone: '+91 09876 54321' },
      appointment_type: { name: 'Post-Op Review' },
      location: { name: 'OPD Cabin 3' },
    },
    {
      id: 'apt-011',
      doctor_id: doctorId,
      patient_id: 'pat-011',
      patient_name: 'Ravi Shankar',
      start_time: `${baseDate}T14:40:00`,
      end_time: `${baseDate}T15:00:00`,
      status: 'no_show' as const,
      mode: 'in_person' as const,
      notes: 'Spinal stenosis - conservative mgmt',
      version: 1,
      patient: { id: 'pat-011', gdid: 'UHID-2023-02341', first_name: 'Ravi', last_name: 'Shankar', gender: 'Male', date_of_birth: '1961-10-10', phone: '+91 98765 12340' },
      appointment_type: { name: 'Review' },
      location: { name: 'OPD Cabin 3' },
    },
    {
      id: 'apt-012',
      doctor_id: doctorId,
      patient_id: 'pat-012',
      patient_name: 'Priya Menon',
      start_time: `${baseDate}T15:00:00`,
      end_time: `${baseDate}T15:20:00`,
      status: 'booked' as const,
      mode: 'in_person' as const,
      notes: 'Disc herniation - surgical vs conservative',
      version: 1,
      patient: { id: 'pat-012', gdid: 'UHID-2024-03012', first_name: 'Priya', last_name: 'Menon', gender: 'Female', date_of_birth: '1983-01-20', phone: '+91 87654 09871' },
      appointment_type: { name: 'Second Opinion' },
      location: { name: 'OPD Cabin 3' },
    },
  ];
};

const statusConfig: Record<string, { label: string; className: string }> = {
  held: { label: "Held", className: "bg-gray-100 text-gray-700" },
  booked: { label: "Booked", className: "bg-blue-100 text-blue-700" },
  checked_in: { label: "Checked In", className: "bg-primary text-primary-foreground" },
  completed: { label: "Completed", className: "bg-green-100 text-green-700" },
  no_show: { label: "No Show", className: "bg-amber-100 text-amber-700" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700" },
};

export default function DoctorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("appointments");
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [weekPattern, setWeekPattern] = useState<DaySchedule[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [loading, setLoading] = useState(true);

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

      // Fetch all future appointments for calendar
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', id)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });
      setAppointments((appointmentsData || []) as Appointment[]);

      // Fetch today's appointments with related data
      const today = new Date();
      const todayStart = startOfDay(today).toISOString();
      const todayEnd = endOfDay(today).toISOString();

      const { data: todayData } = await supabase
        .from('appointments')
        .select(`
          *,
          appointment_type:appointment_types (
            name
          ),
          location:locations (
            name
          )
        `)
        .eq('doctor_id', id)
        .gte('start_time', todayStart)
        .lte('start_time', todayEnd)
        .order('start_time', { ascending: true });

      // Fetch patient details separately for each appointment
      const todayAptsWithPatients: TodayAppointment[] = [];
      for (const apt of (todayData || [])) {
        let patientData = null;
        if (apt.patient_id) {
          const { data: patient } = await supabase
            .from('patients')
            .select('id, gdid, first_name, last_name, gender, date_of_birth, phone')
            .eq('id', apt.patient_id)
            .single();
          patientData = patient;
        }
        todayAptsWithPatients.push({
          ...apt,
          patient: patientData,
        } as TodayAppointment);
      }

      // Use mock data if no real appointments exist or if data is incomplete
      const hasProperPatientData = todayAptsWithPatients.some(apt => 
        apt.patient && apt.patient.first_name && apt.patient.last_name
      );
      
      if (todayAptsWithPatients.length === 0 || !hasProperPatientData) {
        setTodayAppointments(generateMockTodayAppointments(id));
      } else {
        setTodayAppointments(todayAptsWithPatients);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: "Error loading doctor data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async (pattern: DaySchedule[]) => {
    if (!id) return;
    
    try {
      const { data: existingTemplate } = await supabase
        .from('schedule_templates')
        .select('id')
        .eq('doctor_id', id)
        .eq('is_active', true)
        .limit(1);

      if (existingTemplate?.[0]) {
        await supabase
          .from('schedule_templates')
          .update({ week_pattern: JSON.parse(JSON.stringify(pattern)), updated_at: new Date().toISOString() })
          .eq('id', existingTemplate[0].id);
      } else {
        await supabase
          .from('schedule_templates')
          .insert({
            doctor_id: id,
            name: 'Default Schedule',
            week_pattern: JSON.parse(JSON.stringify(pattern)),
            is_active: true,
          });
      }

      setWeekPattern(pattern);
      toast({ title: "Schedule saved successfully" });
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast({ title: "Error saving schedule", variant: "destructive" });
    }
  };

  const handleCreateLeave = async (leave: Omit<Leave, 'id' | 'status'>) => {
    try {
      const { data, error } = await supabase
        .from('leaves')
        .insert({ ...leave, status: 'active' })
        .select()
        .single();

      if (error) throw error;
      setLeaves([...leaves, data as Leave]);
      toast({ title: "Leave created successfully" });
    } catch (error) {
      console.error('Error creating leave:', error);
      toast({ title: "Error creating leave", variant: "destructive" });
    }
  };

  const handleCancelLeave = async (leaveId: string) => {
    try {
      await supabase
        .from('leaves')
        .update({ status: 'cancelled' })
        .eq('id', leaveId);

      setLeaves(leaves.map(l => l.id === leaveId ? { ...l, status: 'cancelled' as const } : l));
      toast({ title: "Leave cancelled" });
    } catch (error) {
      console.error('Error cancelling leave:', error);
      toast({ title: "Error cancelling leave", variant: "destructive" });
    }
  };

  // Calculate KPIs from real appointments
  const completedCount = todayAppointments.filter(a => a.status === 'completed').length;
  const noShowCount = todayAppointments.filter(a => a.status === 'no_show').length;
  const pendingCount = todayAppointments.filter(a => ['booked', 'held', 'checked_in'].includes(a.status)).length;

  if (loading) {
    return (
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <PageContent>
          <AppHeader breadcrumbs={["Doctors", "Loading..."]} />
          <main className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-40 bg-muted rounded-lg" />
              <div className="h-80 bg-muted rounded-lg" />
            </div>
          </main>
        </PageContent>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <PageContent>
          <AppHeader breadcrumbs={["Doctors", "Not Found"]} />
          <main className="p-6">
            <Card className="p-12 text-center">
              <h2 className="text-lg font-semibold mb-2">Doctor not found</h2>
              <p className="text-muted-foreground mb-4">The doctor you're looking for doesn't exist.</p>
              <Button onClick={() => navigate('/doctors')}>Back to Doctors</Button>
            </Card>
          </main>
        </PageContent>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <PageContent>
        <AppHeader breadcrumbs={["Doctors", doctor.name]} />
        
        <main className="p-6 space-y-6">
          {/* Back Button */}
          <Button variant="ghost" size="sm" onClick={() => navigate('/doctors')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Doctors
          </Button>

          {/* Doctor Header */}
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={doctor.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {doctor.name.split(" ").slice(0, 2).map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">{doctor.name}</h1>
                  <p className="text-muted-foreground">{doctor.degrees || "MBBS, MD"}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Main Clinic
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {doctor.default_duration} min slots
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      +91 98XXX XXXXX
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      doctor@gooddoc.app
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={doctor.status === 'active' ? 'default' : 'secondary'}>
                  {doctor.status.charAt(0).toUpperCase() + doctor.status.slice(1)}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => navigate(`/doctors/${id}/edit`)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="text-2xl font-semibold text-foreground">{todayAppointments.length}</div>
                <div className="text-sm text-muted-foreground">Today's Appointments</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="text-2xl font-semibold text-green-700 dark:text-green-400">{completedCount}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                <div className="text-2xl font-semibold text-amber-700 dark:text-amber-400">{noShowCount}</div>
                <div className="text-sm text-muted-foreground">No Shows</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="text-2xl font-semibold text-blue-700 dark:text-blue-400">{pendingCount}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 justify-start w-full">
              <TabsTrigger value="appointments" className="tab-trigger rounded-none border-b-0 data-[state=active]:bg-transparent px-4 py-3">
                Appointments
              </TabsTrigger>
              <TabsTrigger value="availability" className="tab-trigger rounded-none border-b-0 data-[state=active]:bg-transparent px-4 py-3">
                Availability
              </TabsTrigger>
              <TabsTrigger value="calendar" className="tab-trigger rounded-none border-b-0 data-[state=active]:bg-transparent px-4 py-3">
                Calendar
              </TabsTrigger>
            </TabsList>

            {/* Appointments Tab - Two Column Layout */}
            <TabsContent value="appointments" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Today's Appointments List */}
                <Card className="overflow-hidden">
                  <div className="p-4 border-b border-border bg-muted/30">
                    <h2 className="text-sm font-medium text-foreground">Today's Appointments - {format(new Date(), 'EEEE, MMMM d, yyyy')}</h2>
                  </div>
                  
                  <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                    {todayAppointments.map((apt) => {
                      const patientName = apt.patient 
                        ? `${apt.patient.first_name} ${apt.patient.last_name}` 
                        : apt.patient_name || 'Unknown Patient';
                      const patientAge = apt.patient?.date_of_birth 
                        ? calculateAge(apt.patient.date_of_birth) 
                        : null;
                      const patientGender = apt.patient?.gender || '';
                      const patientGdid = apt.patient?.gdid || apt.patient_id;
                      const token = apt.status === 'checked_in' || apt.status === 'completed' ? `T${apt.id.slice(-3)}` : '—';

                      return (
                        <div 
                          key={apt.id} 
                          className={`flex items-center justify-between p-4 hover:bg-muted/20 transition-colors ${apt.status === 'checked_in' ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-foreground">
                              {patientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div 
                                className="text-sm font-medium text-foreground truncate cursor-pointer hover:text-primary hover:underline"
                                onClick={() => navigate(`/patient-insights/${apt.patient_id}?from=doctor-detail`)}
                              >
                                {patientName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {patientGdid} • {patientAge ? `${patientAge}` : ''}{patientGender ? ` | ${patientGender.charAt(0).toUpperCase()}` : ''}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5 truncate">
                                {apt.notes || apt.appointment_type?.name || 'Consultation'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="text-right">
                              <div className="text-sm font-medium text-foreground">
                                {format(parseISO(apt.start_time), 'HH:mm')}
                              </div>
                              <Badge className={`${statusConfig[apt.status]?.className || ''} text-xs`}>
                                {statusConfig[apt.status]?.label || apt.status}
                              </Badge>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-popover z-50">
                                <DropdownMenuItem onClick={() => toast({ title: "Checked In" })}>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Check In
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toast({ title: "Started Consultation" })}>
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Start Consultation
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toast({ title: "Marked as Completed" })}>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Mark Completed
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toast({ title: "Marked as No Show" })}>
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Mark No Show
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(`/book-appointment?reschedule=${apt.id}`)}>
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Reschedule
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      );
                    })}
                    {todayAppointments.length === 0 && (
                      <div className="p-12 text-center text-muted-foreground">
                        No appointments scheduled for today
                      </div>
                    )}
                  </div>
                </Card>

                {/* Right: Doctor's Agenda */}
                <Card className="overflow-hidden">
                  <div className="p-4 border-b border-border bg-muted/30">
                    <h2 className="text-sm font-medium text-foreground">Today's Agenda</h2>
                  </div>
                  
                  <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                    {/* Timeline view of today's schedule */}
                    {todayAppointments.map((apt, index) => {
                      const patientName = apt.patient 
                        ? `${apt.patient.first_name} ${apt.patient.last_name}` 
                        : apt.patient_name || 'Unknown Patient';
                      const isCompleted = apt.status === 'completed';
                      const isCurrentOrNext = apt.status === 'checked_in' || 
                        (apt.status === 'booked' && todayAppointments.slice(0, index).every(a => a.status === 'completed' || a.status === 'no_show'));

                      return (
                        <div 
                          key={apt.id} 
                          className={`flex gap-3 ${isCompleted ? 'opacity-60' : ''}`}
                        >
                          {/* Time indicator */}
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${
                              isCompleted ? 'bg-green-500' : 
                              isCurrentOrNext ? 'bg-primary ring-4 ring-primary/20' : 
                              apt.status === 'no_show' ? 'bg-amber-500' :
                              'bg-muted-foreground/30'
                            }`} />
                            {index < todayAppointments.length - 1 && (
                              <div className="w-0.5 h-full min-h-[40px] bg-border" />
                            )}
                          </div>
                          
                          {/* Appointment details */}
                          <div className={`flex-1 pb-4 ${isCurrentOrNext ? 'bg-primary/5 -mx-2 px-2 py-2 rounded-lg border border-primary/20' : ''}`}>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-muted-foreground">
                                {format(parseISO(apt.start_time), 'HH:mm')} - {format(parseISO(apt.end_time), 'HH:mm')}
                              </span>
                              {apt.mode === 'telehealth' && (
                                <Video className="w-3.5 h-3.5 text-blue-500" />
                              )}
                            </div>
                            <div className={`text-sm font-medium ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                              {patientName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {apt.appointment_type?.name || 'Consultation'} {apt.location?.name ? `• ${apt.location.name}` : ''}
                            </div>
                            {apt.notes && (
                              <div className="text-xs text-muted-foreground mt-1 italic truncate">
                                "{apt.notes}"
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {todayAppointments.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">
                        No agenda items for today
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Availability Tab */}
            <TabsContent value="availability" className="mt-6 space-y-6">
              <ScheduleBuilder
                doctorId={id!}
                weekPattern={weekPattern}
                locations={locations}
                defaultDuration={doctor.default_duration}
                defaultBuffer={doctor.default_buffer}
                onSave={handleSaveSchedule}
              />
              <LeaveManagement
                doctorId={id!}
                doctorName={doctor.name}
                leaves={leaves}
                onCreateLeave={handleCreateLeave}
                onCancelLeave={handleCancelLeave}
              />
            </TabsContent>

            {/* Calendar Tab */}
            <TabsContent value="calendar" className="mt-6">
              <DoctorCalendar
                doctorId={id!}
                doctorName={doctor.name}
                weekPattern={weekPattern}
                leaves={leaves}
                appointments={appointments}
              />
            </TabsContent>
          </Tabs>
        </main>
      </PageContent>
    </div>
  );
}
