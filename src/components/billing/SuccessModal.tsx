import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2, Printer } from "lucide-react";

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  summary: React.ReactNode;
  onPrintReceipt?: () => void;
}

export function SuccessModal({
  open,
  onClose,
  title,
  summary,
  onPrintReceipt,
}: SuccessModalProps) {
  const [printingStatus, setPrintingStatus] = useState<"printing" | "success" | "done">("printing");
  const [sendSMS, setSendSMS] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);

  useEffect(() => {
    if (open) {
      setPrintingStatus("printing");
      const timer1 = setTimeout(() => {
        setPrintingStatus("success");
        const timer2 = setTimeout(() => {
          setPrintingStatus("done");
        }, 2000);
        return () => clearTimeout(timer2);
      }, 2000);
      return () => clearTimeout(timer1);
    }
  }, [open]);

  const handlePrint = () => {
    onPrintReceipt?.();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {printingStatus === "printing" && (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                Processing...
              </>
            )}
            {printingStatus === "success" && (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                {title}
              </>
            )}
            {printingStatus === "done" && (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Success!
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {printingStatus === "done" && (
            <>
              <div className="p-4 bg-muted/30 rounded-lg space-y-2 text-sm">
                {summary}
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Send Receipt</Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="send-sms"
                    checked={sendSMS}
                    onCheckedChange={(checked) => setSendSMS(checked as boolean)}
                  />
                  <Label htmlFor="send-sms" className="text-sm cursor-pointer">
                    Send via SMS
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="send-email"
                    checked={sendEmail}
                    onCheckedChange={(checked) => setSendEmail(checked as boolean)}
                  />
                  <Label htmlFor="send-email" className="text-sm cursor-pointer">
                    Send via Email
                  </Label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handlePrint}
                  className="flex-1 gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print Receipt
                </Button>
                <Button onClick={onClose} className="flex-1">
                  Done
                </Button>
              </div>
            </>
          )}

          {printingStatus !== "done" && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
