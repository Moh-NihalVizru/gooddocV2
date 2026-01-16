import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { PageContent } from "@/components/PageContent";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreVertical, Edit, Calendar, Ban, CheckCircle, PlusCircle, ChevronRight, Users, UserCheck, Clock, Stethoscope } from "lucide-react";
import { CalendarWidget } from "@/components/CalendarWidget";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { DoctorFilters } from "@/components/doctors/DoctorFilters";
import { supabase } from "@/integrations/supabase/client";
import { useDoctorAvailability } from "@/hooks/useDoctorAvailability";
import { format, parseISO, addDays } from "date-fns";


interface DoctorRow {
  id: string;
  name: string;
  degrees?: string;
  department_id?: string;
  specialty_id?: string;
  avatar_url?: string;
  default_duration: number;
  default_buffer: number;
  status: string;
  timezone: string;
}

interface DoctorDisplay {
  id: string;
  displayName: string;
  degrees: string;
  department: string;
  specialty: string;
  avatar?: string;
  availability: string;
  availabilityStatus: 'today' | 'tomorrow' | 'this_week' | 'on_leave' | 'no_schedule';
  nextAvailableTime?: string;
  leaveUntil?: string;
  locations: string[];
  duration: number;
  fee: number;
  status: "active" | "inactive" | "pending";
}

const DEPARTMENT_MAP: Record<string, string> = {
  cardiology: "Cardiology",
  endocrinology: "Endocrinology",
  orthopedics: "Orthopedics",
  neurology: "Neurology",
  general: "General Medicine",
  pediatrics: "Pediatrics",
};

const SPECIALTY_MAP: Record<string, string> = {
  interventional: "Interventional Cardiology",
  diabetes: "Diabetes & Metabolism",
  joint: "Joint Replacement",
  spine: "Spine Surgery",
};


export default function DoctorsList() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState<DoctorDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorDisplay | null>(null);
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [availableDate, setAvailableDate] = useState<Date | undefined>(undefined);
  
  const { getAvailability } = useDoctorAvailability();

  // Fetch doctors from database
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const { data: doctorsData, error } = await supabase
        .from('doctors')
        .select('*')
        .order('name');

      if (error) throw error;

      // First, map basic doctor data without availability
      const basicDoctors: DoctorDisplay[] = (doctorsData as DoctorRow[]).map((doc) => {
        const department = DEPARTMENT_MAP[doc.department_id || ''] || doc.department_id || 'General';
        const ward = department === 'Cardiology' ? 'Ward A' :
                     department === 'Orthopedics' ? 'Ward B' :
                     department === 'Neurology' ? 'Ward C' :
                     department === 'Pediatrics' ? 'Ward D' :
                     department === 'Endocrinology' ? 'Ward E' :
                     'Ward F';
        
        return {
          id: doc.id,
          displayName: doc.name,
          degrees: doc.degrees || '',
          department,
          specialty: SPECIALTY_MAP[doc.specialty_id || ''] || doc.specialty_id || '',
          avatar: doc.avatar_url,
          availability: 'Loading...',
          availabilityStatus: 'no_schedule' as const,
          nextAvailableTime: undefined,
          leaveUntil: undefined,
          locations: [ward, department],
          duration: doc.default_duration,
          fee: 1500,
          status: doc.status as DoctorDisplay['status'],
        };
      });

      // Set doctors immediately so UI shows
      setDoctors(basicDoctors);
      setLoading(false);

      // Then fetch availability in background
      const today = new Date();
      const weekEnd = addDays(today, 7);

      for (const doc of doctorsData as DoctorRow[]) {
        try {
          const availability = await getAvailability(doc.id, today, weekEnd);
          
          if (availability) {
            const todayStr = format(today, 'yyyy-MM-dd');
            const tomorrowStr = format(addDays(today, 1), 'yyyy-MM-dd');
            
            let availabilityText = "No schedule";
            let availabilityStatus: DoctorDisplay['availabilityStatus'] = 'no_schedule';
            let nextAvailableTime: string | undefined;
            let leaveUntil: string | undefined;
            
            const todayData = availability.days.find(d => d.date === todayStr);
            if (todayData?.status === 'leave' && todayData.leaveInfo) {
              availabilityStatus = 'on_leave';
              leaveUntil = todayData.leaveInfo.endDate;
              availabilityText = `On leave until ${format(parseISO(leaveUntil + 'T00:00:00'), 'MMM d')}`;
            } else if (todayData?.slots && todayData.slots.length > 0) {
              availabilityStatus = 'today';
              nextAvailableTime = todayData.slots[0].start;
              availabilityText = `Today ${format(parseISO(nextAvailableTime), 'h:mm a')}`;
            } else {
              const tomorrowData = availability.days.find(d => d.date === tomorrowStr);
              if (tomorrowData?.slots && tomorrowData.slots.length > 0) {
                availabilityStatus = 'tomorrow';
                nextAvailableTime = tomorrowData.slots[0].start;
                availabilityText = `Tomorrow ${format(parseISO(nextAvailableTime), 'h:mm a')}`;
              } else if (availability.nextAvailable) {
                availabilityStatus = 'this_week';
                nextAvailableTime = availability.nextAvailable;
                availabilityText = format(parseISO(nextAvailableTime), 'EEE, MMM d h:mm a');
              }
            }

            // Update this doctor's availability
            setDoctors(prev => prev.map(d => 
              d.id === doc.id 
                ? { ...d, availability: availabilityText, availabilityStatus, nextAvailableTime, leaveUntil }
                : d
            ));
          } else {
            setDoctors(prev => prev.map(d => 
              d.id === doc.id 
                ? { ...d, availability: 'No schedule' }
                : d
            ));
          }
        } catch {
          setDoctors(prev => prev.map(d => 
            d.id === doc.id 
              ? { ...d, availability: 'No schedule' }
              : d
          ));
        }
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      toast({ title: "Error loading doctors", variant: "destructive" });
      setLoading(false);
    }
  };

  // Handle deep link with view parameter
  useEffect(() => {
    if (id && searchParams.get("view") === "overview") {
      const doctor = doctors.find((d) => d.id === id);
      if (doctor) {
        setSelectedDoctor(doctor);
        setViewDrawerOpen(true);
      }
    }
  }, [id, searchParams, doctors]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) {
        searchParams.set("search", search);
      } else {
        searchParams.delete("search");
      }
      setSearchParams(searchParams);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Filter doctors by search and available date
  const filteredDoctors = useMemo(() => {
    let result = doctors;
    
    // Filter by search
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(d => 
        d.displayName.toLowerCase().includes(lowerSearch) ||
        d.department.toLowerCase().includes(lowerSearch) ||
        d.specialty.toLowerCase().includes(lowerSearch)
      );
    }
    
    // Filter by available date
    if (availableDate) {
      const selectedDateStr = format(availableDate, 'yyyy-MM-dd');
      result = result.filter(d => {
        // Include if doctor has availability on or after selected date
        if (d.availabilityStatus === 'on_leave') {
          // Check if leave ends before selected date
          if (d.leaveUntil) {
            return d.leaveUntil < selectedDateStr;
          }
          return false;
        }
        if (d.nextAvailableTime) {
          const availableDateStr = d.nextAvailableTime.split('T')[0];
          return availableDateStr <= selectedDateStr;
        }
        // No schedule - exclude when filtering by date
        return d.availabilityStatus !== 'no_schedule';
      });
    }
    
    return result;
  }, [doctors, search, availableDate]);

  const handleView = (doctor: DoctorDisplay) => {
    setSelectedDoctor(doctor);
    setViewDrawerOpen(true);
  };

  const handleEdit = (doctorId: string) => {
    navigate(`/doctors/${doctorId}/edit`);
  };

  const handleViewCalendar = (doctorId: string) => {
    navigate(`/doctors/${doctorId}/calendar`);
  };

  const handleManageSchedule = (doctorId: string) => {
    navigate(`/doctors/${doctorId}/edit?step=availability`);
  };

  const handleAddLeave = (doctorId: string) => {
    navigate(`/doctors/${doctorId}/leave/new`);
  };

  const handleDeactivate = async () => {
    if (!selectedDoctor) return;
    setActionLoading(true);
    
    try {
      const { error } = await supabase
        .from('doctors')
        .update({ status: 'inactive' })
        .eq('id', selectedDoctor.id);

      if (error) throw error;

      setDoctors(doctors.map(d => 
        d.id === selectedDoctor.id ? { ...d, status: "inactive" as const } : d
      ));
      toast({ title: "Doctor deactivated." });
      setDeactivateDialogOpen(false);
      setSelectedDoctor(null);
    } catch {
      toast({ title: "Error deactivating doctor", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!selectedDoctor) return;
    setActionLoading(true);
    
    try {
      const { error } = await supabase
        .from('doctors')
        .update({ status: 'active' })
        .eq('id', selectedDoctor.id);

      if (error) throw error;

      setDoctors(doctors.map(d => 
        d.id === selectedDoctor.id ? { ...d, status: "active" as const } : d
      ));
      toast({ title: "Doctor activated." });
      setActivateDialogOpen(false);
      setSelectedDoctor(null);
    } catch {
      toast({ title: "Error activating doctor", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "inactive": return "secondary";
      case "pending": return "outline";
      default: return "default";
    }
  };

  const getAvailabilityBadge = (doctor: DoctorDisplay) => {
    switch (doctor.availabilityStatus) {
      case 'today':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Today {doctor.nextAvailableTime ? format(parseISO(doctor.nextAvailableTime), 'h:mm a') : ''}</Badge>;
      case 'tomorrow':
        return <Badge variant="secondary">Tomorrow {doctor.nextAvailableTime ? format(parseISO(doctor.nextAvailableTime), 'h:mm a') : ''}</Badge>;
      case 'this_week':
        return <Badge variant="outline">{doctor.nextAvailableTime ? format(parseISO(doctor.nextAvailableTime), 'EEE h:mm a') : 'This week'}</Badge>;
      case 'on_leave':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">On leave until {doctor.leaveUntil ? format(parseISO(doctor.leaveUntil + 'T00:00:00'), 'MMM d') : ''}</Badge>;
      case 'no_schedule':
      default:
        return <Badge variant="outline" className="text-muted-foreground">No schedule</Badge>;
    }
  };


  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <PageContent>
        <AppHeader breadcrumbs={["Doctors"]} />
        
        <main className="p-6">
          {/* Header */}
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-foreground">Doctors</h1>
              <div className="flex gap-3 items-center">
                <CalendarWidget />
                <Button onClick={() => navigate("/doctors/new")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Doctor
                </Button>
              </div>
            </div>
          </Card>

          {/* Filters */}
          <div className="mb-6">
            <DoctorFilters 
              search={search} 
              onSearchChange={setSearch}
            />
          </div>

          {/* Table */}
          {loading ? (
            <div className="bg-card rounded-lg border border-border p-12 text-center">
              <p className="text-muted-foreground">Loading doctors...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="bg-card rounded-lg border border-border p-12 text-center">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-medium mb-2">No doctors found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {search ? "Try a different search term" : "Get started by adding your first doctor"}
                </p>
                {!search && (
                  <Button onClick={() => navigate("/doctors/new")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Doctor
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-lg border border-border overflow-hidden w-full">
            <div className="grid grid-cols-[2fr_2fr_1.5fr_1.2fr_1.2fr_0.8fr_0.6fr] gap-4 px-4 py-4 border-b border-border bg-muted/30 w-full">
                <div className="text-xs font-medium text-muted-foreground uppercase">DOCTOR</div>
                <div className="text-xs font-medium text-muted-foreground uppercase">DEPARTMENT / SPECIALTY</div>
                <div className="text-xs font-medium text-muted-foreground uppercase">AVAILABILITY</div>
                <div className="text-xs font-medium text-muted-foreground uppercase">LOCATIONS</div>
                <div className="text-xs font-medium text-muted-foreground uppercase">FEE</div>
                <div className="text-xs font-medium text-muted-foreground uppercase text-center">STATUS</div>
                <div className="text-xs font-medium text-muted-foreground uppercase">ACTION</div>
              </div>

              {filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="grid grid-cols-[2fr_2fr_1.5fr_1.2fr_1.2fr_0.8fr_0.6fr] gap-4 px-4 py-4 items-center hover:bg-muted/20 transition-colors border-b border-border last:border-b-0 w-full">
                  <div 
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => navigate(`/doctors/${doctor.id}`)}
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={doctor.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {doctor.displayName.split(" ").slice(0, 2).map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium text-foreground hover:text-primary hover:underline">{doctor.displayName}</div>
                      <div className="text-xs text-muted-foreground">{doctor.degrees}</div>
                    </div>
                  </div>

                  <div>
                    <div 
                      className="text-sm font-medium text-foreground hover:text-primary hover:underline cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        const deptId = Object.entries(DEPARTMENT_MAP).find(([, name]) => name === doctor.department)?.[0] || doctor.department.toLowerCase().replace(/\s+/g, '-');
                        navigate(`/departments/${deptId}`);
                      }}
                    >
                      {doctor.department}
                    </div>
                    <div className="text-xs text-muted-foreground">{doctor.specialty}</div>
                  </div>

                  <div>{getAvailabilityBadge(doctor)}</div>

                  <div className="text-sm">
                    <div className="text-foreground">{doctor.locations[0]}</div>
                    <div className="text-xs text-muted-foreground">{doctor.locations[1]}</div>
                  </div>

                  <div className="text-sm text-foreground">₹{doctor.fee.toLocaleString('en-IN')}</div>

                  <div className="text-center">
                    <Badge variant={getStatusVariant(doctor.status)}>
                      {doctor.status.charAt(0).toUpperCase() + doctor.status.slice(1)}
                    </Badge>
                  </div>

                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(doctor)}>
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(doctor.id)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewCalendar(doctor.id)}>
                          <Calendar className="w-4 h-4 mr-2" />
                          View Calendar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleManageSchedule(doctor.id)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Schedule
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAddLeave(doctor.id)}>
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Add Leave
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {doctor.status === "active" ? (
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedDoctor(doctor);
                              setDeactivateDialogOpen(true);
                            }}
                            className="text-destructive"
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            Deactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedDoctor(doctor);
                              setActivateDialogOpen(true);
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Activate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </PageContent>

      {/* View Drawer */}
      <Sheet open={viewDrawerOpen} onOpenChange={setViewDrawerOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Doctor Overview</SheetTitle>
          </SheetHeader>
          {selectedDoctor && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedDoctor.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedDoctor.displayName.split(" ").slice(0, 2).map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedDoctor.displayName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedDoctor.degrees}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-1">Department</div>
                  <div className="text-sm text-muted-foreground">{selectedDoctor.department}</div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Specialty</div>
                  <div className="text-sm text-muted-foreground">{selectedDoctor.specialty}</div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Consultation Fee</div>
                  <div className="text-sm text-muted-foreground">₹{selectedDoctor.fee.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Next Availability</div>
                  <div>{getAvailabilityBadge(selectedDoctor)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Locations</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedDoctor.locations.join(", ")}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Status</div>
                  <Badge variant={getStatusVariant(selectedDoctor.status)}>
                    {selectedDoctor.status.charAt(0).toUpperCase() + selectedDoctor.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={() => handleEdit(selectedDoctor.id)} className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleViewCalendar(selectedDoctor.id)}
                  className="flex-1"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  View Calendar
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Deactivate Dialog */}
      <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {selectedDoctor?.displayName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will hide the doctor from new bookings. Existing appointments will remain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? "Deactivating..." : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activate Dialog */}
      <AlertDialog open={activateDialogOpen} onOpenChange={setActivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate {selectedDoctor?.displayName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will make the doctor available for new bookings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleActivate}
              disabled={actionLoading}
            >
              {actionLoading ? "Activating..." : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
