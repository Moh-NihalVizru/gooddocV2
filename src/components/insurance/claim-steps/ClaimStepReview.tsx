import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, FileText, CreditCard } from "lucide-react";
import { formatINR } from "@/utils/currency";

interface ClaimStepReviewProps {
  data: any;
  onChange: (data: any) => void;
  errors: string[];
}

export function ClaimStepReview({ data, onChange, errors }: ClaimStepReviewProps) {
  const calculateTotals = () => {
    const services = data.services || [];
    const total = services.reduce((sum: number, s: any) => sum + (s.total || 0), 0);
    return total;
  };

  return (
    <div className="space-y-6">
      {/* Patient & Policy */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <span>Patient & Policy</span>
            <Badge variant="outline">Step 1</Badge>
          </h3>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground">Patient</Label>
            <p className="font-medium mt-1">{data.patient?.name || "—"}</p>
            <p className="text-sm text-muted-foreground">{data.patient?.phone || "—"}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Claim Type</Label>
            <p className="font-medium mt-1">{data.claimType || "—"}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Policy Number</Label>
            <p className="font-medium mt-1">{data.policy?.policyNo || "—"}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Payer</Label>
            <p className="font-medium mt-1">{data.payer?.name || "—"}</p>
          </div>
        </div>
      </Card>

      {/* Encounter */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <span>Encounter Details</span>
            <Badge variant="outline">Step 2</Badge>
          </h3>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground">Care Setting</Label>
            <p className="font-medium mt-1">{data.encounter?.careSetting || "—"}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Date of Service</Label>
            <p className="font-medium mt-1">
              {data.encounter?.dateOfService 
                ? new Date(data.encounter.dateOfService).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })
                : "—"}
            </p>
          </div>
          <div>
            <Label className="text-muted-foreground">Facility</Label>
            <p className="font-medium mt-1">{data.encounter?.facility || "—"}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Doctor</Label>
            <p className="font-medium mt-1">{data.encounter?.doctor || "—"}</p>
          </div>
          <div className="col-span-2">
            <Label className="text-muted-foreground">Diagnosis</Label>
            <p className="font-medium mt-1">{data.encounter?.diagnosis || "—"}</p>
          </div>
        </div>
      </Card>

      {/* Services */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <span>Services</span>
            <Badge variant="outline">Step 3</Badge>
          </h3>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-3">
          {data.services && data.services.length > 0 ? (
            <>
              {data.services.map((service: any, index: number) => (
                <div key={service.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">{service.description || "Unnamed Service"}</div>
                    <div className="text-sm text-muted-foreground">
                      {service.type} • {service.units} unit(s) • {service.code || "No code"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatINR(service.total)}</div>
                  </div>
                </div>
              ))}
              <Separator />
              <div className="flex items-center justify-between text-lg font-semibold pt-2">
                <span>Total Billed</span>
                <span>{formatINR(calculateTotals())}</span>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-center py-4">No services added</p>
          )}
        </div>
      </Card>

      {/* Documents */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <span>Documents</span>
            <Badge variant="outline">Step 4</Badge>
          </h3>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          {data.documents && data.documents.length > 0 ? (
            data.documents.map((doc: any) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="font-medium">{doc.name}</div>
                  <div className="text-sm text-muted-foreground">{doc.tag}</div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">No documents uploaded</p>
          )}
        </div>
      </Card>

      {/* Bank Details (if Reimbursement) */}
      {data.claimType === "Reimbursement" && data.bankDetails && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <span>Banking Details</span>
              <Badge variant="outline">Step 5</Badge>
            </h3>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Account Holder</Label>
              <p className="font-medium mt-1">{data.bankDetails.accountHolder || "—"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Bank</Label>
              <p className="font-medium mt-1">{data.bankDetails.bank || "—"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Account Number</Label>
              <p className="font-medium mt-1">{data.bankDetails.accountNo || "—"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">IFSC Code</Label>
              <p className="font-medium mt-1">{data.bankDetails.ifsc || "—"}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Digital Signature */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Digital Signature</h3>
        <div>
          <Label htmlFor="signature">Type your full name to sign *</Label>
          <Input
            id="signature"
            placeholder="Enter your full name"
            className="mt-2"
            value={data.signature || ""}
            onChange={(e) => onChange({ ...data, signature: e.target.value })}
          />
          <p className="text-sm text-muted-foreground mt-2">
            By signing, you certify that the information provided is accurate and complete
          </p>
        </div>
      </Card>
    </div>
  );
}
