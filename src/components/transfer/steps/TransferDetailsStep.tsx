import { useEffect, useMemo } from "react";
import { MapPin, ArrowRight, BedDouble, User2, Building2, Stethoscope, FileText, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TransferRequest, TransferReason, BedLocation, Bed } from "@/types/transfer";
import { reasonLabels, mockUnits, mockBeds, featureLabels } from "@/data/transfer.mock";
import { TransferDateTimePicker } from "@/components/transfer/TransferDateTimePicker";
import { cn } from "@/lib/utils";

interface TransferDetailsStepProps {
  data: Partial<TransferRequest>;
  onChange: (data: Partial<TransferRequest>) => void;
  currentTariff: number;
  fromLocation: BedLocation;
  onSelectBed: (bed: Bed) => void;
  admissionDate?: string; // For min date validation
  lastTransferEndTime?: string; // For min date validation
}

const formatPrice = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

export function TransferDetailsStep({ 
  data, 
  onChange, 
  currentTariff, 
  fromLocation, 
  onSelectBed,
  admissionDate,
  lastTransferEndTime 
}: TransferDetailsStepProps) {
  // Auto-fill ordering clinician and transfer date
  useEffect(() => {
    if (!data.orderingClinician) {
      onChange({ orderingClinician: "Dr. Meera Nair" });
    }
    if (!data.scheduledAt) {
      onChange({ scheduledAt: new Date() });
    }
  }, []);

  // Calculate min date for transfer
  const minTransferDate = useMemo(() => {
    if (lastTransferEndTime) {
      return new Date(lastTransferEndTime);
    }
    if (admissionDate) {
      return new Date(admissionDate);
    }
    return undefined;
  }, [lastTransferEndTime, admissionDate]);

  // Get available units for destination
  const availableUnits = useMemo(() => {
    return mockUnits.filter(unit => unit.availableBeds > 0);
  }, []);

  // Get available beds for selected unit
  const availableBeds = useMemo(() => {
    if (!data.toLocation?.unitId) return [];
    return mockBeds.filter(
      bed => bed.unitId === data.toLocation?.unitId && bed.status === 'available'
    );
  }, [data.toLocation?.unitId]);

  // Get selected bed details
  const selectedBed = useMemo(() => {
    if (!data.toLocation?.bedId) return null;
    return mockBeds.find(b => b.id === data.toLocation?.bedId);
  }, [data.toLocation?.bedId]);

  // Calculate tariff difference
  const tariffDelta = selectedBed ? selectedBed.tariff - currentTariff : 0;

  const handleUnitChange = (unitId: string) => {
    const unit = mockUnits.find(u => u.id === unitId);
    if (unit) {
      onChange({
        toLocation: {
          unitId: unit.id,
          unitName: unit.name,
          roomId: "",
          roomName: "",
          bedId: "",
          bedName: "",
        },
      });
    }
  };

  const handleBedChange = (bedId: string) => {
    const bed = mockBeds.find(b => b.id === bedId);
    if (bed) {
      onChange({
        toLocation: {
          unitId: bed.unitId,
          unitName: bed.unitName,
          roomId: bed.roomId,
          roomName: bed.roomName,
          bedId: bed.id,
          bedName: bed.bedName,
        },
      });
      onSelectBed(bed);
    }
  };

  // Mock clinicians list
  const clinicians = [
    { id: "dr-meera", name: "Dr. Meera Nair", specialty: "Internal Medicine" },
    { id: "dr-arun", name: "Dr. Arun Sharma", specialty: "Cardiology" },
    { id: "dr-priya", name: "Dr. Priya Patel", specialty: "Pulmonology" },
    { id: "dr-rajesh", name: "Dr. Rajesh Kumar", specialty: "General Surgery" },
    { id: "dr-sunita", name: "Dr. Sunita Reddy", specialty: "Orthopedics" },
  ];

  return (
    <div className="space-y-6">
      {/* Transfer Location Section */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/50 px-5 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Transfer Location
          </h3>
        </div>
        
        <div className="p-5">
          <div className="grid grid-cols-2 gap-6 items-start">
            {/* From Location */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <BedDouble className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">From</p>
                  <p className="text-sm font-semibold text-foreground">{fromLocation.unitName}</p>
                </div>
              </div>
              <div className="ml-10 space-y-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-foreground">{fromLocation.roomName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BedDouble className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-foreground font-medium">{fromLocation.bedName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Tariff:</span>
                  <span className="font-semibold text-foreground">{formatPrice(currentTariff)}/day</span>
                </div>
              </div>
            </div>


            {/* To Location */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <BedDouble className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">To</p>
                  <p className="text-sm font-semibold text-foreground">
                    {data.toLocation?.unitName || "Select destination"}
                  </p>
                </div>
              </div>
              
              <div className="ml-10 space-y-3">
                {/* Ward Select */}
                <Select
                  value={data.toLocation?.unitId || ""}
                  onValueChange={handleUnitChange}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select Ward / Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        <div className="flex items-center justify-between gap-3">
                          <span>{unit.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {unit.availableBeds} beds
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Bed Select */}
                <Select
                  value={data.toLocation?.bedId || ""}
                  onValueChange={handleBedChange}
                  disabled={!data.toLocation?.unitId}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select Room & Bed" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBeds.map((bed) => (
                      <SelectItem key={bed.id} value={bed.id}>
                        <div className="flex items-center justify-between gap-3">
                          <span>{bed.roomName} • {bed.bedName}</span>
                          <span className="text-xs text-muted-foreground">{formatPrice(bed.tariff)}/day</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Selected Bed Details */}
                {selectedBed && (
                  <div className="p-3 bg-muted/50 rounded-lg border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">New Tariff</span>
                      <span className="text-sm font-semibold text-foreground">{formatPrice(selectedBed.tariff)}/day</span>
                    </div>
                    {tariffDelta !== 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Difference</span>
                        <span className={cn(
                          "text-sm font-semibold",
                          tariffDelta > 0 ? "text-amber-600" : "text-green-600"
                        )}>
                          {tariffDelta > 0 ? "+" : ""}{formatPrice(tariffDelta)}/day
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Details Section */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/50 px-5 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            Transfer Details
          </h3>
        </div>
        
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Ordering Clinician */}
            <div className="space-y-2">
              <Label htmlFor="orderingClinician" className="text-sm font-medium flex items-center gap-2">
                <User2 className="h-3.5 w-3.5 text-muted-foreground" />
                Ordering Clinician
              </Label>
              <Select
                value={data.orderingClinician || ""}
                onValueChange={(value) => onChange({ orderingClinician: value })}
              >
                <SelectTrigger id="orderingClinician" className="h-10">
                  <SelectValue placeholder="Select clinician" />
                </SelectTrigger>
                <SelectContent>
                  {clinicians.map((doc) => (
                    <SelectItem key={doc.id} value={doc.name}>
                      <div className="flex flex-col">
                        <span>{doc.name}</span>
                        <span className="text-xs text-muted-foreground">{doc.specialty}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                Reason for Transfer
              </Label>
              <Select
                value={data.reason}
                onValueChange={(value) => onChange({ reason: value as TransferReason })}
              >
                <SelectTrigger id="reason" className="h-10">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(reasonLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Transfer Date & Time */}
          <TransferDateTimePicker
            value={data.scheduledAt}
            onChange={(date) => onChange({ scheduledAt: date })}
            minDate={minTransferDate}
            testId="transfer-datetime"
          />

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              Additional Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Special instructions, clinical considerations, or handover notes..."
              value={data.notes || ""}
              onChange={(e) => onChange({ notes: e.target.value })}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>
      </div>

      {/* Pre-Transfer Checklist Preview */}
      {data.reason && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Pre-Transfer Requirements</p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                A checklist will be generated based on transfer type. Ensure patient vitals are stable, 
                transport is arranged, and receiving unit is notified before confirming.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
