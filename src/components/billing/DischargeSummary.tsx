import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  User, 
  Calendar, 
  Pill, 
  ClipboardList, 
  Clock,
  Phone,
  Heart
} from "lucide-react";
import bainesLogo from "@/assets/baines-logo-english.svg";

interface DischargeSummaryProps {
  patientName?: string;
  mrn?: string;
  age?: string;
  gender?: string;
}

const DischargeSummary = ({ 
  patientName = "Harish Kalyan",
  mrn = "GDID-001",
  age = "44 Years",
  gender = "Male"
}: DischargeSummaryProps) => {
  const timelineEventsLeft = [
    { event: "Patient Admitted", date: "18/12/2025, 10:30 AM" },
    { event: "Cardiac Catheterization", date: "18/12/2025, 02:00 PM" },
    { event: "Echocardiography", date: "19/12/2025, 11:30 AM" },
    { event: "CT Coronary Angiography", date: "21/12/2025, 10:00 AM" },
  ];

  const timelineEventsRight = [
    { event: "Initial Assessment", date: "18/12/2025, 11:00 AM" },
    { event: "Cardiologist Consultation", date: "19/12/2025, 09:00 AM" },
    { event: "Lab Tests", date: "20/12/2025, 08:00 AM" },
    { event: "Patient Discharged", date: "22/12/2025, 02:45 PM", isDischarge: true },
  ];

  const medications = [
    { name: "Aspirin 75mg", frequency: "Once daily", duration: "Lifelong", qty: "1 tablet" },
    { name: "Atorvastatin 40mg", frequency: "At night", duration: "Lifelong", qty: "1 tablet" },
    { name: "Metoprolol 50mg", frequency: "Twice daily", duration: "3 months", qty: "1 tablet" },
    { name: "Clopidogrel 75mg", frequency: "Once daily", duration: "1 year", qty: "1 tablet" },
  ];

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Hospital Header */}
      <div className="bg-primary/5 border-b border-border p-6">
        <div className="flex items-center justify-between">
          <img src={bainesLogo} alt="Baines International Healthcare" className="h-10" />
          <div className="text-right text-sm text-muted-foreground">
            <p>123 Healthcare Avenue, Medical District, Chennai - 600001</p>
            <div className="flex items-center justify-end gap-4 mt-1">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                +91 44 2345 6789
              </span>
              <span>GSTIN: 33XXXXX1234X1Z5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="px-6 py-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">IP Discharge Summary</h2>
          <Badge variant="secondary" className="font-mono">ADM-2025-0142</Badge>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Patient & Admission Info Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Patient Information */}
          <Card className="p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Patient Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Patient Name</p>
                <p className="font-semibold text-foreground">{patientName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">UHID</p>
                <p className="font-semibold text-foreground">{mrn}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Age / Gender</p>
                <p className="font-semibold text-foreground">{age} / {gender}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Blood Group</p>
                <p className="font-semibold text-foreground">B+</p>
              </div>
            </div>
          </Card>

          {/* Admission Details */}
          <Card className="p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Admission Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Admission</p>
                <p className="font-semibold text-primary">18/12/2025, 10:30 AM</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Discharge</p>
                <p className="font-semibold text-foreground">22/12/2025, 02:45 PM</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Length of Stay</p>
                <p className="font-semibold text-primary">4 Days</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Ward</p>
                <p className="font-semibold text-foreground">Deluxe Room - 302</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Diagnosis & Visit Timeline */}
        <div className="grid grid-cols-2 gap-6">
          {/* Diagnosis */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Diagnosis</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Primary</p>
                <p className="font-medium text-foreground">Unstable Angina (ICD-10: I20.0)</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-2">Secondary</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="font-normal">Hypertension (I10)</Badge>
                  <Badge variant="secondary" className="font-normal">Type 2 Diabetes Mellitus (E11.9)</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Visit Timeline */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Visit Timeline</h3>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {/* Left Column */}
              <div className="space-y-2">
                {timelineEventsLeft.map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-foreground leading-tight">{item.event}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Right Column */}
              <div className="space-y-2">
                {timelineEventsRight.map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.isDischarge ? 'bg-green-500' : 'bg-primary'}`} />
                    <div>
                      <p className="font-medium text-sm text-foreground leading-tight">{item.event}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Discharge Medications & Follow-up Instructions */}
        <div className="grid grid-cols-2 gap-6">
          {/* Discharge Medications */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Pill className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Discharge Medications</h3>
            </div>
            <div className="space-y-3">
              {medications.map((med, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="font-medium text-foreground">{med.name}</p>
                    <p className="text-xs text-muted-foreground">{med.frequency} • {med.duration}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{med.qty}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Follow-up & Instructions */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Follow-up & Instructions</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next Visit</span>
                <span className="font-medium">29/12/2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Doctor</span>
                <span className="font-medium">Dr. Arun Kumar</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Condition</span>
                <Badge className="bg-green-500/10 text-green-600 border-green-500/30">Stable</Badge>
              </div>
              <div className="pt-3 mt-3 border-t border-border">
                <p className="text-xs uppercase tracking-wide text-red-600 font-medium mb-1">Emergency</p>
                <p className="text-muted-foreground text-sm">Return immediately if chest pain, breathlessness, or palpitations occur</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Signature Section */}
        <Card className="p-5">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Prepared by</p>
              <p className="font-semibold mt-1">Dr. Priya Sharma</p>
              <p className="text-sm text-muted-foreground">Resident Doctor</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Reviewed by</p>
              <p className="font-semibold mt-1">Dr. Arun Kumar</p>
              <p className="text-sm text-muted-foreground">Consultant Cardiologist</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Discharge Date</p>
              <p className="font-semibold mt-1">22/12/2025, 02:45 PM</p>
              <p className="text-sm text-muted-foreground">Summary ID: DS-2025-0142</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DischargeSummary;
