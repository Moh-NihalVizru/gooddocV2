import { useSearchParams, useNavigate } from "react-router-dom";
import { User, ExternalLink, Plus } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { PageContent } from "@/components/PageContent";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockPatientsByPhone } from "@/data/header-search.mock";

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

export default function PatientSearch() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  
  const patient = mockPatientsByPhone[query];
  const hasResults = !!patient;

  const handleGoTo360 = () => {
    if (patient) {
      navigate(`/patient360/${patient.gdid}?from=search`);
    }
  };

  const handleOptionClick = (option: string) => {
    if (!patient) return;
    const gdid = patient.gdid;
    const searchQuery = query;
    switch (option) {
      case "Add amount":
        navigate(`/patient-insights/${gdid}/payments?action=advance&from=search&q=${searchQuery}`);
        break;
      case "Book appointment":
        navigate(`/book-appointment?patientId=${gdid}&from=search&q=${searchQuery}`);
        break;
      case "Discharge":
        navigate(`/patient-insights/${gdid}/discharge?from=search&q=${searchQuery}`);
        break;
      case "Payments":
        navigate(`/patient-insights/${gdid}/payments?from=search&q=${searchQuery}`);
        break;
      default:
        break;
    }
  };

  const isIP = patient?.type === "IP";

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <PageContent className="flex-1 flex flex-col">
        <AppHeader breadcrumbs={[{ label: "Patients", onClick: () => navigate("/patients") }, "Search Results"]} />
        <div className="p-4 flex-1">

          {hasResults ? (
            <Card className="p-6 w-full">
              {/* Header */}
              <div className="flex items-start justify-between mb-6 pb-5 border-b border-border">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground text-xl">{patient.name}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      GDID–{patient.gdid} • {patient.age} • {patient.gender}
                    </p>
                    <Badge variant="secondary" className="text-xs font-normal mt-2">
                      {isIP ? `Inpatient since ${patient.lastActivityShort.replace("In IP since ", "")}` : patient.lastActivityShort}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={handleGoTo360}>
                  Open 360° record <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Content Grid - 4 columns */}
              <div className="grid grid-cols-4 gap-4">
                {isIP ? (
                  <>
                    {/* Care & Bed */}
                    <div className="space-y-3">
                      <h4 className="text-label font-semibold text-foreground uppercase tracking-wide">Care & Bed</h4>
                      <div className="bg-muted/40 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Primary doctor</span>
                          <span className="font-medium text-foreground">{patient.ipInfo.doctor}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Ward / Bed</span>
                          <span className="font-medium text-foreground">{patient.ipInfo.ward} • {patient.ipInfo.bed}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Emergency contact</span>
                          {patient.ipInfo.emergencyContact ? (
                            <span className="font-medium text-foreground">{patient.ipInfo.emergencyContact}</span>
                          ) : (
                            <Button variant="link" size="sm" className="text-primary p-0 h-auto text-xs font-medium">
                              + Add
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Orders & Reports */}
                    <div className="space-y-3">
                      <h4 className="text-label font-semibold text-foreground uppercase tracking-wide">Orders & Reports</h4>
                      <div className="bg-muted/40 rounded-lg p-4">
                        <div className="space-y-2.5">
                          {patient.pending?.length > 0 ? (
                            patient.pending.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <span className="text-foreground">{item.item}</span>
                                <StatusChip status={item.status} />
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No reports yet</p>
                          )}
                        </div>
                        <Button variant="link" size="sm" className="text-primary p-0 mt-3 text-xs gap-1 font-medium">
                          <Plus className="w-3 h-3" /> Add report
                        </Button>
                      </div>
                    </div>

                    {/* Billing Summary */}
                    <div className="space-y-3">
                      <h4 className="text-label font-semibold text-foreground uppercase tracking-wide">Billing Summary</h4>
                      <div className="bg-muted/40 rounded-lg p-4">
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Billed to date</span>
                            <span className="font-medium text-foreground">{patient.pendingAmount.bills}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Advance received</span>
                            <span className="font-medium text-foreground">{patient.pendingAmount.advance}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm pt-2.5 border-t border-border">
                            <span className="font-medium text-foreground">Due now</span>
                            <span className="font-semibold text-lg text-foreground">{patient.pendingAmount.outstanding}</span>
                          </div>
                        </div>
                        <Button variant="link" size="sm" className="text-primary p-0 mt-3 text-xs font-medium">
                          View details →
                        </Button>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-3">
                      <h4 className="text-label font-semibold text-foreground uppercase tracking-wide">Quick Actions</h4>
                      <div className="bg-muted/40 rounded-lg p-4 flex flex-col gap-2">
                        {patient.options.map((opt: string, idx: number) => (
                          <Button 
                            key={idx} 
                            variant={idx === 0 ? "default" : "outline"} 
                            size="sm" 
                            className="text-sm w-full"
                            onClick={() => handleOptionClick(opt)}
                          >
                            {opt}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Visit History */}
                    <div className="space-y-3">
                      <h4 className="text-label font-semibold text-foreground uppercase tracking-wide">Visit History</h4>
                      <div className="bg-muted/40 rounded-lg p-4">
                        <p className="text-sm text-foreground">{patient.lastActivityShort}</p>
                        <Button variant="link" size="sm" className="text-primary p-0 mt-3 text-xs gap-1 font-medium">
                          <Plus className="w-3 h-3" /> Add item to visit
                        </Button>
                      </div>
                    </div>

                    {/* Reports */}
                    <div className="space-y-3">
                      <h4 className="text-label font-semibold text-foreground uppercase tracking-wide">Reports</h4>
                      <div className="bg-muted/40 rounded-lg p-4">
                        {patient.pendingReports ? (
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
                    </div>

                    {/* Billing Summary */}
                    <div className="space-y-3">
                      <h4 className="text-label font-semibold text-foreground uppercase tracking-wide">Billing Summary</h4>
                      <div className="bg-muted/40 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">No pending amount</p>
                        <Button variant="link" size="sm" className="text-primary p-0 mt-3 text-xs gap-1 font-medium">
                          <Plus className="w-3 h-3" /> Add pending amount
                        </Button>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-3">
                      <h4 className="text-label font-semibold text-foreground uppercase tracking-wide">Quick Actions</h4>
                      <div className="bg-muted/40 rounded-lg p-4 flex flex-col gap-2">
                        {patient.options.map((opt: string, idx: number) => (
                          <Button 
                            key={idx} 
                            variant={idx === 0 ? "default" : "outline"} 
                            size="sm" 
                            className="text-sm w-full"
                            onClick={() => handleOptionClick(opt)}
                          >
                            {opt}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <h3 className="text-lg font-medium text-foreground mb-2">No results for "{query}"</h3>
              <p className="text-sm text-muted-foreground mb-4">Try a different phone number or check the spelling</p>
              <Button variant="outline" onClick={() => navigate("/patients")}>
                Browse all patients
              </Button>
            </Card>
          )}
        </div>
      </PageContent>
    </div>
  );
}
