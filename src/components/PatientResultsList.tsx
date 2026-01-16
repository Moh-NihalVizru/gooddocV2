import { User, UserRound, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Patient {
  id: string;
  name: string;
  gdid: string;
  age: number;
  gender: string;
}

interface PatientResultsListProps {
  patients: Patient[];
  onBookAppointment: (patientId: string) => void;
  flowType?: string;
}

export function PatientResultsList({ patients, onBookAppointment, flowType }: PatientResultsListProps) {
  const isIPAdmission = flowType === "ip-admission";
  if (patients.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Patients Results</h3>
      </div>
      
      <div className="divide-y divide-border">
        {patients.map((patient) => (
          <div
            key={patient.id}
            className="px-6 py-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                patient.gender.toLowerCase().startsWith('f') 
                  ? 'bg-pink-500' 
                  : 'bg-primary'
              }`}>
                {patient.gender.toLowerCase().startsWith('f') ? (
                  <UserRound className="w-5 h-5 text-primary-foreground" />
                ) : (
                  <User className="w-5 h-5 text-primary-foreground" />
                )}
              </div>
              <div>
                <div className="font-medium text-foreground">{patient.name}</div>
                <div className="text-sm text-muted-foreground">
                  {patient.gdid} • {patient.age} | {patient.gender}
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              onClick={() => onBookAppointment(patient.id)}
              className={`gap-2 ${isIPAdmission ? 'text-[#16a34a] hover:text-[#16a34a] hover:bg-[#16a34a]/10' : 'text-primary hover:text-primary hover:bg-primary/10'}`}
            >
              {isIPAdmission ? "IP Admission" : "Book Appointment"}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
