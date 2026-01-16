import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Patient, ClinicalNote, Prescription, LabOrder } from "@/types/patient360";
import { Pill, FlaskConical, Stethoscope, Clock, Calendar, Printer, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface OrderSummaryStepProps {
  patient: Patient;
  clinicalNote?: ClinicalNote;
  prescription?: Prescription;
  labOrder?: LabOrder;
  onBack: () => void;
}

export function OrderSummaryStep({ 
  patient, 
  clinicalNote, 
  prescription, 
  labOrder,
  onBack 
}: OrderSummaryStepProps) {
  const age = Math.floor(
    (new Date().getTime() - new Date(patient.dob).getTime()) / 
    (365.25 * 24 * 60 * 60 * 1000)
  );

  const hasContent = clinicalNote || (prescription && prescription.items.length > 0) || (labOrder && labOrder.tests.length > 0);

  const handleSubmit = () => {
    const actions: string[] = [];
    
    if (clinicalNote) {
      actions.push("Clinical notes recorded");
    }
    if (prescription && prescription.items.length > 0) {
      actions.push(`${prescription.items.length} medication${prescription.items.length > 1 ? 's' : ''} sent to pharmacy`);
    }
    if (labOrder && labOrder.tests.length > 0) {
      actions.push(`${labOrder.tests.length} lab test${labOrder.tests.length > 1 ? 's' : ''} ordered`);
    }

    toast({
      title: "Patient Visit Completed",
      description: (
        <div className="mt-2 space-y-1.5">
          {actions.map((action, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{action}</span>
            </div>
          ))}
        </div>
      ),
    });
  };

  return (
    <div className="space-y-6">
      {/* Patient Info Header */}
      <Card className="p-5 bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {patient.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{patient.name}</h3>
              <p className="text-small text-muted-foreground">
                {patient.gdid} • {age} yrs • {patient.sex === 'M' ? 'Male' : patient.sex === 'F' ? 'Female' : 'Other'}
              </p>
            </div>
          </div>
          <div className="text-right text-small text-muted-foreground">
            <p>{patient.phone}</p>
            <p>{patient.email}</p>
          </div>
        </div>
      </Card>

      {!hasContent && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No clinical data recorded for this visit.</p>
        </Card>
      )}

      {/* Clinical Notes */}
      {clinicalNote && (
        <Card className="overflow-hidden">
          <div className="bg-primary/5 px-5 py-3 border-b border-border flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-primary" />
            <h4 className="text-label font-semibold text-foreground">Clinical Notes</h4>
            <Badge variant="outline" className="ml-auto text-xs">
              {clinicalNote.status}
            </Badge>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Chief Complaint</p>
                  <p className="text-small text-foreground bg-muted/30 rounded-md p-3">
                    {clinicalNote.chiefComplaint || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">History of Present Illness</p>
                  <p className="text-small text-foreground bg-muted/30 rounded-md p-3 min-h-[60px]">
                    {clinicalNote.hpi || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Prescriptions */}
      {prescription && prescription.items.length > 0 && (
        <Card className="overflow-hidden">
          <div className="bg-emerald-500/10 px-5 py-3 border-b border-border flex items-center gap-2">
            <Pill className="w-4 h-4 text-emerald-600" />
            <h4 className="text-label font-semibold text-foreground">Medications</h4>
            <Badge className="ml-auto bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/30">
              {prescription.items.length} {prescription.items.length === 1 ? 'item' : 'items'}
            </Badge>
          </div>
          <div className="divide-y divide-border">
            {prescription.items.map((item, index) => (
              <div key={index} className="p-4 hover:bg-muted/20 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-semibold text-emerald-600 shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-small text-muted-foreground">
                        {item.strength && <span>{item.strength}</span>}
                        {item.form && <span> • {item.form}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-small">
                      {item.dosage && (
                        <Badge variant="secondary" className="font-normal">
                          {item.dosage}
                        </Badge>
                      )}
                      {item.frequency && (
                        <Badge variant="outline" className="font-normal">
                          {item.frequency}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-2 ml-11 flex items-center gap-4 text-xs text-muted-foreground">
                  {item.timing && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.timing}
                    </span>
                  )}
                  {item.durationDays && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {item.durationDays} days
                    </span>
                  )}
                  {item.notes && (
                    <span className="text-amber-600">Note: {item.notes}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Lab / Radiology Orders */}
      {labOrder && labOrder.tests.length > 0 && (
        <Card className="overflow-hidden">
          <div className="bg-blue-500/10 px-5 py-3 border-b border-border flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-blue-600" />
            <h4 className="text-label font-semibold text-foreground">Diagnostics Orders</h4>
            <Badge className="ml-auto bg-blue-500/20 text-blue-700 hover:bg-blue-500/30">
              {labOrder.tests.length} {labOrder.tests.length === 1 ? 'test' : 'tests'}
            </Badge>
          </div>
          <div className="p-4">
            <div className="space-y-2 mb-4">
              {labOrder.tests.map((test, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center text-xs font-medium text-blue-600">
                      {index + 1}
                    </div>
                    <span className="text-small font-medium text-foreground">{test.name}</span>
                  </div>
                  <span className="text-small font-semibold text-foreground">₹{test.price.toLocaleString()}</span>
                </div>
              ))}
            </div>
            
            {/* Totals */}
            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex items-center justify-between text-small">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">₹{labOrder.totals.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-small">
                <span className="text-muted-foreground">CGST (9%)</span>
                <span className="text-foreground">₹{labOrder.totals.cgst.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-small">
                <span className="text-muted-foreground">SGST (9%)</span>
                <span className="text-foreground">₹{labOrder.totals.sgst.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="font-semibold text-foreground">Net Payable</span>
                <span className="text-lg font-bold text-primary">₹{Math.round(labOrder.totals.net).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
