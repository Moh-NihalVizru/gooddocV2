import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Printer } from "lucide-react";
import { VisitSummary } from "@/types/patient360";

interface MedicalHistoryTimelineProps {
  visits: VisitSummary[];
}

export function MedicalHistoryTimeline({ visits }: MedicalHistoryTimelineProps) {

  if (visits.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No prior visits found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {visits.map((visit) => {
        return (
          <Card key={visit.appointmentId} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {new Date(visit.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric"
                    })}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    • {visit.location}
                  </span>
                  {visit.doctorName && (
                    <span className="text-sm text-muted-foreground">
                      • {visit.doctorName}
                    </span>
                  )}
                  <span className="text-sm text-muted-foreground">
                    • {visit.appointmentId}
                  </span>
                </div>
                {visit.reason && (
                  <p className="text-sm text-foreground mb-2">{visit.reason}</p>
                )}
                {visit.diagnoses && visit.diagnoses.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {visit.diagnoses.map((diagnosis, idx) => (
                      <Badge key={idx} variant="secondary">
                        {diagnosis}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Open Visit
                </Button>
                <Button variant="ghost" size="sm">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
                {visit.vitals && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Vitals</h4>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      {visit.vitals.bpSystolic && visit.vitals.bpDiastolic && (
                        <div>
                          <span className="text-muted-foreground">BP: </span>
                          <span className="text-foreground">
                            {visit.vitals.bpSystolic}/{visit.vitals.bpDiastolic} mmHg
                          </span>
                        </div>
                      )}
                      {visit.vitals.heartRate && (
                        <div>
                          <span className="text-muted-foreground">HR: </span>
                          <span className="text-foreground">{visit.vitals.heartRate} bpm</span>
                        </div>
                      )}
                      {visit.vitals.temperatureC && (
                        <div>
                          <span className="text-muted-foreground">Temp: </span>
                          <span className="text-foreground">{visit.vitals.temperatureC}°C</span>
                        </div>
                      )}
                      {visit.vitals.spo2 && (
                        <div>
                          <span className="text-muted-foreground">SpO₂: </span>
                          <span className="text-foreground">{visit.vitals.spo2}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {visit.plan && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Plan</h4>
                    <p className="text-sm text-foreground">{visit.plan}</p>
                  </div>
                )}

                {visit.prescriptions && visit.prescriptions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">
                      Prescribed Medicines
                    </h4>
                    <div className="space-y-2">
                      {visit.prescriptions.map((rx) => (
                        <div key={rx.id} className="text-sm">
                          <span className="text-foreground font-medium">{rx.name}</span>
                          {rx.strength && (
                            <span className="text-muted-foreground ml-2">{rx.strength}</span>
                          )}
                          {rx.frequency && (
                            <span className="text-muted-foreground ml-2">• {rx.frequency}</span>
                          )}
                          {rx.durationDays && (
                            <span className="text-muted-foreground ml-2">
                              • {rx.durationDays} days
                            </span>
                          )}
                          {rx.notes && (
                            <div className="text-muted-foreground text-xs mt-1">{rx.notes}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {visit.documents && visit.documents.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Attachments</h4>
                    <div className="flex flex-wrap gap-2">
                      {visit.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md text-sm"
                        >
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="text-foreground font-medium">{doc.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {doc.sizeKB} KB • Uploaded by {doc.uploadedBy}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
          </Card>
        );
      })}
    </div>
  );
}
