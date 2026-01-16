import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { PageContent } from "@/components/PageContent";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  ChevronRight,
  HeartPulse,
  BrainCircuit,
  Accessibility,
  Pill,
  Smile,
  Stethoscope,
  Users,
  BedDouble,
  Clock,
  Building2,
  Phone,
  MoreVertical,
  Eye,
  Edit,
  Settings,
  UserPlus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DEPARTMENTS = [
  {
    id: "cardiology",
    name: "Cardiology",
    description: "Heart & Cardiovascular Care",
    headDoctor: "Dr. Priya Sharma",
    headDoctorPhone: "+91 98765 43210",
    icon: HeartPulse,
    iconBg: "bg-rose-100 dark:bg-rose-900/50",
    iconColor: "text-rose-600 dark:text-rose-400",
    doctorsCount: 8,
    outpatientCount: 145,
    inpatientCount: 23,
    avgWaitTime: 18,
    location: "Block A, Floor 2",
    opHours: "8:00 AM - 6:00 PM",
    status: "active" as const,
  },
  {
    id: "orthopedics",
    name: "Orthopedics",
    description: "Bones, Joints & Musculoskeletal",
    headDoctor: "Dr. Aisha Khan",
    headDoctorPhone: "+91 98765 43211",
    icon: Accessibility,
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
    iconColor: "text-amber-600 dark:text-amber-400",
    doctorsCount: 6,
    outpatientCount: 98,
    inpatientCount: 15,
    avgWaitTime: 22,
    location: "Block B, Floor 1",
    opHours: "9:00 AM - 5:00 PM",
    status: "active" as const,
  },
  {
    id: "neurology",
    name: "Neurology",
    description: "Brain & Nervous System",
    headDoctor: "Dr. Meera Reddy",
    headDoctorPhone: "+91 98765 43212",
    icon: BrainCircuit,
    iconBg: "bg-violet-100 dark:bg-violet-900/50",
    iconColor: "text-violet-600 dark:text-violet-400",
    doctorsCount: 5,
    outpatientCount: 67,
    inpatientCount: 8,
    avgWaitTime: 25,
    location: "Block A, Floor 3",
    opHours: "8:30 AM - 4:30 PM",
    status: "active" as const,
  },
  {
    id: "general-medicine",
    name: "General Medicine",
    description: "Primary & Internal Medicine",
    headDoctor: "Dr. Vikram Singh",
    headDoctorPhone: "+91 98765 43213",
    icon: Stethoscope,
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    iconColor: "text-blue-600 dark:text-blue-400",
    doctorsCount: 12,
    outpatientCount: 234,
    inpatientCount: 45,
    avgWaitTime: 15,
    location: "Block A, Ground Floor",
    opHours: "24/7",
    status: "active" as const,
  },
  {
    id: "endocrinology",
    name: "Endocrinology",
    description: "Diabetes & Hormonal Disorders",
    headDoctor: "Dr. Rahul Mehta",
    headDoctorPhone: "+91 98765 43214",
    icon: Pill,
    iconBg: "bg-teal-100 dark:bg-teal-900/50",
    iconColor: "text-teal-600 dark:text-teal-400",
    doctorsCount: 4,
    outpatientCount: 89,
    inpatientCount: 5,
    avgWaitTime: 20,
    location: "Block C, Floor 1",
    opHours: "9:00 AM - 4:00 PM",
    status: "active" as const,
  },
  {
    id: "pediatrics",
    name: "Pediatrics",
    description: "Child & Adolescent Care",
    headDoctor: "Dr. Kavitha Menon",
    headDoctorPhone: "+91 98765 43215",
    icon: Smile,
    iconBg: "bg-pink-100 dark:bg-pink-900/50",
    iconColor: "text-pink-600 dark:text-pink-400",
    doctorsCount: 7,
    outpatientCount: 156,
    inpatientCount: 18,
    avgWaitTime: 12,
    location: "Block D, Floor 1",
    opHours: "8:00 AM - 8:00 PM",
    status: "active" as const,
  },
];

export default function DepartmentsList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredDepartments = DEPARTMENTS.filter((dept) =>
    dept.name.toLowerCase().includes(search.toLowerCase()) ||
    dept.description.toLowerCase().includes(search.toLowerCase()) ||
    dept.headDoctor.toLowerCase().includes(search.toLowerCase())
  );

  const totalDoctors = DEPARTMENTS.reduce((sum, d) => sum + d.doctorsCount, 0);
  const totalOP = DEPARTMENTS.reduce((sum, d) => sum + d.outpatientCount, 0);
  const totalIP = DEPARTMENTS.reduce((sum, d) => sum + d.inpatientCount, 0);

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <PageContent>
        <AppHeader breadcrumbs={["Departments"]} />

        <main className="p-6 space-y-6">
          {/* Header Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-foreground">Departments</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {DEPARTMENTS.length} departments · {totalDoctors} doctors · {totalOP} OP today · {totalIP} IP admitted
                </p>
              </div>
              <div className="flex gap-3">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search departments..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-9"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage
                </Button>
              </div>
            </div>
          </Card>

          {/* Departments Table */}
          {filteredDepartments.length === 0 ? (
            <div className="bg-card rounded-lg border border-border p-12 text-center">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-medium mb-2">No departments found</h3>
                <p className="text-sm text-muted-foreground">
                  Try a different search term
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[2fr_1.5fr_1.2fr_1fr_1fr_0.8fr_0.5fr] gap-4 px-4 py-3 border-b border-border bg-muted/30">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Department</div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Head of Department</div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Location / Hours</div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Doctors</div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Patients Today</div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg Wait</div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide"></div>
              </div>

              {/* Table Rows */}
              {filteredDepartments.map((dept) => {
                const Icon = dept.icon;
                return (
                  <div
                    key={dept.id}
                    className="grid grid-cols-[2fr_1.5fr_1.2fr_1fr_1fr_0.8fr_0.5fr] gap-4 px-4 py-4 border-b border-border last:border-b-0 hover:bg-muted/30 cursor-pointer transition-colors group"
                    onClick={() => navigate(`/departments/${dept.id}`)}
                  >
                    {/* Department */}
                    <div className="flex items-center gap-3">
                      <div className={`${dept.iconBg} p-2.5 rounded-lg shrink-0`}>
                        <Icon className={`w-5 h-5 ${dept.iconColor}`} strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                            {dept.name}
                          </p>
                          <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{dept.description}</p>
                      </div>
                    </div>

                    {/* Head of Department */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium text-muted-foreground">
                          {dept.headDoctor.split(' ').slice(1).map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{dept.headDoctor}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span className="truncate">{dept.headDoctorPhone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Location / Hours */}
                    <div className="flex flex-col justify-center gap-1">
                      <div className="flex items-center gap-1.5 text-sm text-foreground">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{dept.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span className="truncate">{dept.opHours}</span>
                      </div>
                    </div>

                    {/* Doctors Count */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/30 px-2.5 py-1.5 rounded-md">
                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{dept.doctorsCount}</span>
                      </div>
                    </div>

                    {/* Patients Today */}
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">{dept.outpatientCount}</span>
                        <span className="text-[10px] text-muted-foreground">OP</span>
                      </div>
                      <div className="w-px h-6 bg-border" />
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">{dept.inpatientCount}</span>
                        <span className="text-[10px] text-muted-foreground">IP</span>
                      </div>
                    </div>

                    {/* Avg Wait Time */}
                    <div className="flex items-center">
                      <Badge 
                        variant="secondary" 
                        className={`font-medium ${
                          dept.avgWaitTime <= 15 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : dept.avgWaitTime <= 20 
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {dept.avgWaitTime} min
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => navigate(`/departments/${dept.id}`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Department
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add Doctor
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="w-4 h-4 mr-2" />
                            View All Doctors
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </PageContent>
    </div>
  );
}
