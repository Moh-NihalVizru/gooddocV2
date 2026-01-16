import { User, ArrowRight, Plus, FileText, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface IPPatientData {
  type: "IP";
  name: string;
  gdid: string;
  age: string;
  gender: string;
  lastActivityShort: string;
  ipInfo: {
    doctor: string;
    ward: string;
    bed: string;
    emergencyContact: string;
  };
  pending: { item: string; status: string }[];
  pendingAmount: {
    outstanding: string;
    advance: string;
    bills: string;
    balance: string;
  };
  options: string[];
}

interface OPPatientData {
  type: "OP";
  name: string;
  gdid: string;
  age: string;
  gender: string;
  lastActivityShort: string;
  pendingReports: string;
  pendingAmountNote: string;
  options: string[];
}

type PatientData = IPPatientData | OPPatientData;

interface PatientSearchCardProps {
  patient: PatientData;
  onClose: () => void;
}

function StatusChip({ status }: { status: string }) {
  const statusLower = status.toLowerCase();
  if (statusLower === "paid") {
    return <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">Paid</Badge>;
  }
  if (statusLower === "pending") {
    return <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
  }
  if (statusLower === "overdue") {
    return <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">Overdue</Badge>;
  }
  return <Badge variant="outline" className="text-xs">{status}</Badge>;
}

export function PatientSearchCard({ patient, onClose }: PatientSearchCardProps) {
  const navigate = useNavigate();

  const handleGoTo360 = () => {
    navigate(`/patient360/${patient.gdid}?from=search`);
    onClose();
  };

  const handleOptionClick = (option: string) => {
    const gdid = patient.gdid;
    switch (option) {
      case "Add amount":
        navigate(`/payments/${gdid}?action=add`);
        break;
      case "Book appointment":
        navigate(`/new-appointment?patientId=${gdid}`);
        break;
      case "Discharge":
        navigate(`/discharge/${gdid}`);
        break;
      case "View payment history":
        navigate(`/payments/${gdid}`);
        break;
      case "Documents":
        navigate(`/patient360/${gdid}?tab=documents`);
        break;
      case "Insurance etc":
        navigate(`/patient-insights/${gdid}?tab=insurance`);
        break;
      default:
        break;
    }
    onClose();
  };

  const isIP = patient.type === "IP";

  return (
    <Card className="absolute top-full left-0 right-0 mt-2 mx-8 p-5 shadow-lg z-50 bg-card border border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-base">{patient.name}</h3>
            <p className="text-sm text-muted-foreground">
              GDID–{patient.gdid} • {patient.age} • {patient.gender}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-xs font-normal">
            {isIP ? `Inpatient since ${patient.lastActivityShort.replace("In IP since ", "")}` : patient.lastActivityShort}
          </Badge>
          <Button variant="link" size="sm" className="text-primary p-0 gap-1" onClick={handleGoTo360}>
            Open 360° record <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      {isIP ? (
        <IPPatientContent patient={patient as IPPatientData} onOptionClick={handleOptionClick} />
      ) : (
        <OPPatientContent patient={patient as OPPatientData} onOptionClick={handleOptionClick} />
      )}
    </Card>
  );
}

function IPPatientContent({ patient, onOptionClick }: { patient: IPPatientData; onOptionClick: (opt: string) => void }) {
  const hasEmergencyContact = patient.ipInfo.emergencyContact && patient.ipInfo.emergencyContact !== "Not added";

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Care & Bed */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-3">Care & bed</h4>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Primary doctor: </span>
            <span className="text-foreground">{patient.ipInfo.doctor}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Ward/Bed: </span>
            <span className="text-foreground">{patient.ipInfo.ward} • {patient.ipInfo.bed}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Emergency contact: </span>
            {hasEmergencyContact ? (
              <span className="text-foreground">{patient.ipInfo.emergencyContact}</span>
            ) : (
              <span className="text-muted-foreground">
                Not added{" "}
                <Button variant="link" size="sm" className="text-primary p-0 h-auto text-xs">
                  Add
                </Button>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Orders & Reports */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-3">Orders & reports</h4>
        <div className="space-y-2">
          {patient.pending.length > 0 ? (
            patient.pending.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{item.item}</span>
                <StatusChip status={item.status} />
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No reports yet</p>
          )}
        </div>
        <Button variant="link" size="sm" className="text-primary p-0 mt-3 text-xs gap-1">
          <Plus className="w-3 h-3" /> Add report
        </Button>
      </div>

      {/* Billing Summary */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-3">Billing summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Billed to date</span>
            <span className="font-medium text-foreground">{patient.pendingAmount.bills}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Advance received</span>
            <span className="font-medium text-foreground">{patient.pendingAmount.advance}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-border">
            <span className="text-muted-foreground font-medium">Due now</span>
            <span className="font-semibold text-foreground">{patient.pendingAmount.outstanding}</span>
          </div>
        </div>
        <Button variant="link" size="sm" className="text-primary p-0 mt-3 text-xs">
          View details
        </Button>
      </div>

      {/* Options */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-3">Options</h4>
        <div className="space-y-2">
          {patient.options.map((opt, idx) => (
            <Button 
              key={idx} 
              variant="outline" 
              size="sm" 
              className="w-full justify-start text-sm"
              onClick={() => onOptionClick(opt)}
            >
              {opt}
            </Button>
          ))}
        </div>
      </div>

      {/* Visit History */}
      <div className="col-span-4 mt-2 bg-muted/50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-foreground mb-1">Visit history</h4>
            <p className="text-sm text-muted-foreground">
              Admitted: {patient.lastActivityShort.replace("In IP since ", "")}
            </p>
          </div>
          <Button variant="link" size="sm" className="text-primary p-0 text-xs">
            View all visits
          </Button>
        </div>
      </div>
    </div>
  );
}

function OPPatientContent({ patient, onOptionClick }: { patient: OPPatientData; onOptionClick: (opt: string) => void }) {
  const hasPendingAmount = patient.pendingAmountNote && patient.pendingAmountNote !== "No pending amount";
  const hasPendingReport = patient.pendingReports && patient.pendingReports !== "No reports yet";

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Visit History */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-3">Visit history</h4>
        <p className="text-sm text-muted-foreground">{patient.lastActivityShort}</p>
        <Button variant="link" size="sm" className="text-primary p-0 mt-3 text-xs gap-1">
          <Plus className="w-3 h-3" /> Add item to visit
        </Button>
      </div>

      {/* Reports */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-3">Reports</h4>
        {hasPendingReport ? (
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground">Doctor's report</span>
            <StatusChip status="Pending" />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No reports yet</p>
        )}
        <Button variant="outline" size="sm" className="mt-3 text-xs">
          Book follow-up
        </Button>
      </div>

      {/* Billing Summary */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-3">Billing summary</h4>
        {hasPendingAmount ? (
          <p className="text-sm text-muted-foreground">{patient.pendingAmountNote}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No pending amount</p>
        )}
        <Button variant="link" size="sm" className="text-primary p-0 mt-3 text-xs gap-1">
          <Plus className="w-3 h-3" /> Add pending amount
        </Button>
      </div>

      {/* Options */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-3">Options</h4>
        <div className="space-y-2">
          {patient.options.map((opt, idx) => (
            <Button 
              key={idx} 
              variant="outline" 
              size="sm" 
              className="w-full justify-start text-sm"
              onClick={() => onOptionClick(opt)}
            >
              {opt === "View payment history" ? "Payments" : opt}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
