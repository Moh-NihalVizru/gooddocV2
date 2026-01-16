import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  appointmentDetails: {
    patientName?: string;
    appointmentType?: string;
    date?: string;
    time?: string;
    provider?: string;
    location?: string;
    mode?: string;
    tests?: string[];
    prepNotes?: string;
  };
}

export function ConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  appointmentDetails,
}: ConfirmationModalProps) {
  const {
    patientName,
    appointmentType,
    date,
    time,
    provider,
    location,
    mode,
    tests,
    prepNotes,
  } = appointmentDetails;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send confirmation to patient?</DialogTitle>
          <DialogDescription>
            Review the appointment details before sending a confirmation request to the
            patient.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {patientName && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Patient</p>
              <p className="text-base text-foreground">{patientName}</p>
            </div>
          )}

          <Separator />

          {appointmentType && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Appointment Type
              </p>
              <p className="text-base text-foreground capitalize">{appointmentType}</p>
            </div>
          )}

          {(date || time) && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date & Time</p>
              <p className="text-base text-foreground">
                {date}
                {time && ` at ${time}`}
              </p>
            </div>
          )}

          {provider && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Provider</p>
              <p className="text-base text-foreground">{provider}</p>
            </div>
          )}

          {mode && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Mode</p>
              <p className="text-base text-foreground">{mode}</p>
            </div>
          )}

          {location && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Location</p>
              <p className="text-base text-foreground">{location}</p>
            </div>
          )}

          {tests && tests.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tests</p>
              <ul className="list-disc list-inside text-base text-foreground">
                {tests.map((test, index) => (
                  <li key={index}>{test}</li>
                ))}
              </ul>
            </div>
          )}

          {prepNotes && (
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Preparation Notes
              </p>
              <p className="text-sm text-foreground">{prepNotes}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Send request to patient</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
