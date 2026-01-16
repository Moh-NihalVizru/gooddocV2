import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ClaimStepEncounterProps {
  data: any;
  onChange: (data: any) => void;
  errors: string[];
}

export function ClaimStepEncounter({ data, onChange, errors }: ClaimStepEncounterProps) {
  const updateEncounter = (field: string, value: any) => {
    onChange({
      ...data,
      encounter: {
        ...data.encounter,
        [field]: value
      }
    });
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-6">Encounter Details</h2>
      
      <div className="space-y-6">
        {/* Care Setting */}
        <div>
          <Label htmlFor="careSetting">Care Setting *</Label>
          <Select
            value={data.encounter?.careSetting}
            onValueChange={(value) => updateEncounter("careSetting", value)}
          >
            <SelectTrigger id="careSetting" className="mt-2">
              <SelectValue placeholder="Select care setting" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPD">OPD (Outpatient)</SelectItem>
              <SelectItem value="IPD">IPD (Inpatient)</SelectItem>
              <SelectItem value="Day Care">Day Care</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date of Service */}
        <div>
          <Label htmlFor="dateOfService">Date of Service *</Label>
          <Input
            id="dateOfService"
            type="date"
            className="mt-2"
            value={data.encounter?.dateOfService || ""}
            onChange={(e) => updateEncounter("dateOfService", e.target.value)}
          />
        </div>

        {/* Facility */}
        <div>
          <Label htmlFor="facility">Facility *</Label>
          <Input
            id="facility"
            placeholder="e.g., GoodDoc Hospital"
            className="mt-2"
            value={data.encounter?.facility || ""}
            onChange={(e) => updateEncounter("facility", e.target.value)}
          />
        </div>

        {/* Doctor */}
        <div>
          <Label htmlFor="doctor">Treating Doctor *</Label>
          <Input
            id="doctor"
            placeholder="e.g., Dr. John Doe"
            className="mt-2"
            value={data.encounter?.doctor || ""}
            onChange={(e) => updateEncounter("doctor", e.target.value)}
          />
        </div>

        {/* Pre-auth No (for Cashless) */}
        {data.claimType === "Cashless" && (
          <div>
            <Label htmlFor="preauthNo">Pre-authorization Number *</Label>
            <Input
              id="preauthNo"
              placeholder="e.g., PA-2025-1234"
              className="mt-2"
              value={data.encounter?.preauthNo || ""}
              onChange={(e) => updateEncounter("preauthNo", e.target.value)}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Required for cashless claims
            </p>
          </div>
        )}

        {/* Diagnosis */}
        <div>
          <Label htmlFor="diagnosis">Diagnosis *</Label>
          <Textarea
            id="diagnosis"
            placeholder="Enter primary diagnosis"
            className="mt-2"
            rows={3}
            value={data.encounter?.diagnosis || ""}
            onChange={(e) => updateEncounter("diagnosis", e.target.value)}
          />
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            placeholder="Any additional information"
            className="mt-2"
            rows={3}
            value={data.encounter?.notes || ""}
            onChange={(e) => updateEncounter("notes", e.target.value)}
          />
        </div>
      </div>
    </Card>
  );
}
