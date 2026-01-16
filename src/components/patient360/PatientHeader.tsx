import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Sparkles, Calendar, Clock, MapPin, User, Loader2 } from "lucide-react";
import { PatientChip } from "@/components/patient-insights/PatientChip";
import { Patient, Vitals } from "@/types/patient360";
import { supabase } from "@/integrations/supabase/client";

interface PatientHeaderProps {
  patient: Patient;
  vitals?: Vitals;
}

export function PatientHeader({ patient, vitals }: PatientHeaderProps) {
  const navigate = useNavigate();
  const [aiSummary, setAiSummary] = useState<string>("");
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  const age = Math.floor(
    (new Date().getTime() - new Date(patient.dob).getTime()) / 
    (365.25 * 24 * 60 * 60 * 1000)
  );

  // Mock appointment data - in real app, this would come from props or API
  const appointmentInfo = {
    date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    time: "10:30 AM",
    type: "Follow-up",
    mode: "In-Clinic",
    doctor: "Dr. Priya Sharma",
    department: "General Medicine",
    chiefComplaint: "Patient presents with recurring chest pain, described as a dull ache in the left side of the chest, worsening with physical exertion. Symptoms began two weeks ago and have gradually increased in frequency. No associated shortness of breath or palpitations noted."
  };

  useEffect(() => {
    const fetchAISummary = async () => {
      setIsLoadingSummary(true);
      try {
        const { data, error } = await supabase.functions.invoke('patient-ai-summary', {
          body: {
            patientName: patient.name,
            age,
            sex: patient.sex,
            allergies: patient.alerts?.allergies || [],
            conditions: patient.tags || [],
            chiefComplaint: appointmentInfo.chiefComplaint,
            vitals: vitals ? {
              bp: vitals.bpSystolic && vitals.bpDiastolic ? `${vitals.bpSystolic}/${vitals.bpDiastolic}` : null,
              heartRate: vitals.heartRate,
              spo2: vitals.spo2,
              temperature: vitals.temperatureC
            } : null
          }
        });

        if (error) throw error;
        setAiSummary(data?.summary || "");
      } catch (error) {
        console.error("Failed to fetch AI summary:", error);
        // Fallback summary
        setAiSummary(`${patient.name}, ${age}y ${patient.sex === 'M' ? 'male' : patient.sex === 'F' ? 'female' : ''} patient presenting for ${appointmentInfo.chiefComplaint.toLowerCase()}. ${patient.alerts?.allergies?.length ? `Known allergies: ${patient.alerts.allergies.join(', ')}.` : ''} ${patient.tags?.length ? `Active conditions: ${patient.tags.join(', ')}.` : ''} ${vitals?.bpSystolic ? `Current vitals show BP ${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg` : ''}`);
      } finally {
        setIsLoadingSummary(false);
      }
    };

    fetchAISummary();
  }, [patient, vitals, age]);

  return (
    <div className="bg-background border-b border-border flex-shrink-0">
      <div className="px-6 py-4">
        {/* Back Button */}
        <button
          onClick={() => navigate("/appointments/outpatient")}
          className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="font-semibold">Outpatient</span>
        </button>

        {/* Header Content - Patient Info + Appointment Box */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <PatientChip
            name={patient.name}
            gdid={patient.gdid}
            age={age}
            gender={patient.sex}
          />
          
          {/* Appointment Details Box */}
          <Card className="p-3 bg-muted/30 border-border">
            <h3 className="text-xs font-semibold text-foreground mb-2">Today's Appointment</h3>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Date</p>
                  <p className="text-xs font-medium text-foreground">{appointmentInfo.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Time</p>
                  <p className="text-xs font-medium text-foreground">{appointmentInfo.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Doctor</p>
                  <p className="text-xs font-medium text-foreground">{appointmentInfo.doctor}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Mode</p>
                  <p className="text-xs font-medium text-foreground">{appointmentInfo.mode}</p>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Badge variant="outline" className="text-[10px] h-5">{appointmentInfo.type}</Badge>
                <Badge variant="outline" className="text-[10px] h-5">{appointmentInfo.department}</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Chief Complaint + AI Summary Card */}
        <Card className="w-full p-4 bg-card border-border">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Chief Complaint */}
            <div className="flex-1">
              <div className="space-y-1">
                <div className="text-[12px] font-medium text-muted-foreground">Chief Complaint</div>
                <p className="text-sm text-foreground">{appointmentInfo.chiefComplaint}</p>
              </div>
            </div>

            {/* AI Summary */}
            <div className="lg:w-[400px] lg:border-l lg:border-border lg:pl-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">AI Summary</h3>
              </div>
              {isLoadingSummary ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Generating summary...</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {aiSummary}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
