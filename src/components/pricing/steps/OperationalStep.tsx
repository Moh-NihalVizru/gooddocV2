import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { PricingItemFormData } from "@/types/pricing-item";

export function OperationalStep() {
  const {
    register,
    watch,
    setValue,
  } = useFormContext<PricingItemFormData>();

  const requiresDoctorOrder = watch("requiresDoctorOrder");
  const availability = watch("availability");

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-sm font-semibold mb-4">Operational Details</h3>

        <div className="space-y-6">
          {/* Turnaround Time */}
          <div>
            <Label htmlFor="turnaroundTime">Turnaround Time</Label>
            <Input
              id="turnaroundTime"
              {...register("turnaroundTime")}
              placeholder="e.g., 24 hours, 2-3 days, Same day"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Expected time to complete or deliver this service
            </p>
          </div>

          {/* Requires Doctor Order */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="requiresDoctorOrder">Requires Doctor Order?</Label>
              <p className="text-xs text-muted-foreground">
                Does this service require a doctor's prescription or order?
              </p>
            </div>
            <Switch
              id="requiresDoctorOrder"
              checked={requiresDoctorOrder}
              onCheckedChange={(checked) => setValue("requiresDoctorOrder", checked)}
            />
          </div>

          {/* Availability */}
          <div>
            <Label htmlFor="availability">Availability Status</Label>
            <Select
              value={availability}
              onValueChange={(value) => setValue("availability", value as any)}
            >
              <SelectTrigger id="availability" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="In Stock">In Stock / Available</SelectItem>
                <SelectItem value="Out of Stock">Out of Stock / Unavailable</SelectItem>
                <SelectItem value="N/A">Not Applicable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* SLA Notes */}
          <div>
            <Label htmlFor="slaNote">SLA / Service Level Notes</Label>
            <Textarea
              id="slaNote"
              {...register("slaNote")}
              placeholder="Any service level agreements or commitments (e.g., Report within 6 hours, Appointment required)"
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Prep Instructions */}
          <div>
            <Label htmlFor="prepInstructions">Preparation Instructions</Label>
            <Textarea
              id="prepInstructions"
              {...register("prepInstructions")}
              placeholder="Patient preparation or pre-procedure instructions (e.g., Fasting required, Bring previous reports)"
              className="mt-1"
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Instructions for patients or staff before the service
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-muted/50">
        <h4 className="text-sm font-medium mb-2">Quick Tips</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Turnaround time helps set patient expectations</li>
          <li>• Mark services requiring orders to prevent scheduling errors</li>
          <li>• Clear preparation instructions improve service quality</li>
          <li>• SLA notes are visible to staff for service delivery</li>
        </ul>
      </Card>
    </div>
  );
}
