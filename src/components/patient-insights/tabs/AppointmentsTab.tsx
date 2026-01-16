import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Visit } from "../VisitListItem";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Patient {
  name: string;
  gdid: string;
  age: number;
  gender: string;
}

interface AppointmentsTabProps {
  selectedVisit: Visit | null;
  patient: Patient;
}

interface Appointment {
  id: string;
  visitId: string;
  date: string;
  time: string;
  doctor: string;
  type: "Consultation" | "Laboratory" | "Radiology" | "Pharmacy" | "Procedure";
  status: "Completed" | "Scheduled" | "Checked-in" | "Cancelled" | "In Progress";
  tokenNo?: string;
  tokenTime?: string;
  orderedBy?: string;
}

// Mock appointments for the current patient
const getPatientAppointments = (gdid: string): Appointment[] => {
  return [
    {
      id: "apt-1",
      visitId: "V25-004",
      date: "20-Dec-2025",
      time: "10:00",
      doctor: "Dr. Meera Nair",
      type: "Consultation",
      status: "Scheduled",
    },
    {
      id: "apt-2",
      visitId: "V25-004",
      date: "20-Dec-2025",
      time: "10:30",
      doctor: "—",
      type: "Laboratory",
      status: "Scheduled",
      orderedBy: "Dr. Meera Nair",
    },
    {
      id: "apt-3",
      visitId: "V25-004",
      date: "20-Dec-2025",
      time: "11:00",
      doctor: "—",
      type: "Radiology",
      status: "Scheduled",
      orderedBy: "Dr. Meera Nair",
    },
    {
      id: "apt-4",
      visitId: "V25-002",
      date: "15-Dec-2025",
      time: "09:30",
      doctor: "Dr. Priya Menon",
      type: "Consultation",
      status: "Completed",
      tokenNo: "T042",
      tokenTime: "09:15",
    },
    {
      id: "apt-5",
      visitId: "V25-002",
      date: "15-Dec-2025",
      time: "10:00",
      doctor: "—",
      type: "Laboratory",
      status: "Completed",
      tokenNo: "L018",
      tokenTime: "09:55",
      orderedBy: "Dr. Priya Menon",
    },
    {
      id: "apt-6",
      visitId: "V25-001",
      date: "01-Dec-2025",
      time: "11:00",
      doctor: "Dr. Meera Nair",
      type: "Consultation",
      status: "Completed",
      tokenNo: "T018",
      tokenTime: "10:45",
    },
    {
      id: "apt-7",
      visitId: "V25-001",
      date: "01-Dec-2025",
      time: "11:30",
      doctor: "—",
      type: "Laboratory",
      status: "Completed",
      tokenNo: "L012",
      tokenTime: "11:25",
      orderedBy: "Dr. Meera Nair",
    },
    {
      id: "apt-8",
      visitId: "V24-089",
      date: "15-Nov-2025",
      time: "14:30",
      doctor: "Dr. Arun Kumar",
      type: "Consultation",
      status: "Completed",
      tokenNo: "T056",
      tokenTime: "14:20",
    },
    {
      id: "apt-9",
      visitId: "V24-089",
      date: "15-Nov-2025",
      time: "15:00",
      doctor: "—",
      type: "Radiology",
      status: "Completed",
      tokenNo: "R008",
      tokenTime: "14:55",
      orderedBy: "Dr. Arun Kumar",
    },
  ];
};

function getStatusBadgeVariant(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
    case "scheduled":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
    case "checked-in":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300";
    case "in progress":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
    default:
      return "bg-muted text-muted-foreground";
  }
}


export function AppointmentsTab({ selectedVisit, patient }: AppointmentsTabProps & { showAllVisits?: boolean }) {
  const allAppointments = getPatientAppointments(patient.gdid);
  
  // Filter appointments by selected visit ID (null means show all)
  const appointments = selectedVisit 
    ? allAppointments.filter(apt => apt.visitId === selectedVisit.visitId)
    : allAppointments;

  return (
    <div className="h-full overflow-auto">
      <div className="mb-6">
        <div className="px-6 pt-6">
          <h3 className="text-[14px] font-semibold text-foreground">
            {selectedVisit ? `Appointments for ${selectedVisit.visitId}` : 'All Appointments'}
          </h3>
        </div>
        
        <div className="border rounded-lg overflow-hidden mx-6 mt-4 bg-white dark:bg-card">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 uppercase">VISIT ID</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 uppercase">DATE</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 uppercase">TIME</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 uppercase">TYPE</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 uppercase">DOCTOR</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 uppercase">ORDERED BY</th>
                <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3 uppercase">STATUS</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 uppercase">TOKEN</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 uppercase">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-card">
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <tr key={appointment.id} className="border-t hover:bg-muted/20 transition-colors">
                    {/* Visit ID */}
                    <td className="px-4 py-3">
                      <p className="text-sm text-foreground">{appointment.visitId}</p>
                    </td>
                    
                    {/* Date */}
                    <td className="px-4 py-3">
                      <p className="text-sm text-foreground">{appointment.date}</p>
                    </td>
                    
                    {/* Time */}
                    <td className="px-4 py-3">
                      <p className="text-sm text-foreground">{appointment.time}</p>
                    </td>
                    
                    {/* Type */}
                    <td className="px-4 py-3">
                      <p className="text-sm text-foreground">{appointment.type}</p>
                    </td>
                    
                    {/* Doctor */}
                    <td className="px-4 py-3">
                      <p className="text-sm text-foreground">{appointment.doctor}</p>
                    </td>
                    
                    {/* Ordered By */}
                    <td className="px-4 py-3">
                      <p className="text-sm text-foreground">
                        {appointment.type === "Laboratory" || appointment.type === "Radiology" 
                          ? (appointment.orderedBy || "—") 
                          : "—"}
                      </p>
                    </td>
                    
                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <Badge className={getStatusBadgeVariant(appointment.status)} variant="secondary">
                        {appointment.status}
                      </Badge>
                    </td>
                    
                    {/* Token */}
                    <td className="px-4 py-3">
                      {appointment.tokenNo ? (
                        <div>
                          <p className="text-sm text-foreground">{appointment.tokenNo}</p>
                          <p className="text-xs text-muted-foreground">{appointment.tokenTime}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          {appointment.type === "Consultation" && (
                            <DropdownMenuItem>View Notes</DropdownMenuItem>
                          )}
                          {appointment.type === "Laboratory" && (
                            <DropdownMenuItem>View Results</DropdownMenuItem>
                          )}
                          {appointment.type === "Radiology" && (
                            <DropdownMenuItem>View Report</DropdownMenuItem>
                          )}
                          {appointment.status === "Scheduled" && (
                            <DropdownMenuItem>Check In</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center">
                    <p className="text-sm text-muted-foreground">No appointments</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer Summary */}
        <div className="mx-6 mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {appointments.length} appointments</span>
          <span>Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
}
