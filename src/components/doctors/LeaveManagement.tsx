import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Plus, CalendarIcon, Trash2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Leave, LeaveType } from "@/types/scheduling";
import { format, parseISO, isBefore, isAfter, startOfDay, endOfDay, addDays } from "date-fns";
import { cn } from "@/lib/utils";

interface LeaveManagementProps {
  doctorId: string;
  doctorName: string;
  leaves: Leave[];
  onCreateLeave: (leave: Omit<Leave, 'id' | 'status'>) => Promise<void>;
  onCancelLeave: (leaveId: string) => Promise<void>;
}

interface LeaveFormData {
  leaveType: LeaveType;
  startDate: Date | undefined;
  endDate: Date | undefined;
  startTime: string;
  endTime: string;
  reason: string;
  keepExistingBookings: boolean;
}

const DEFAULT_FORM: LeaveFormData = {
  leaveType: "full_day",
  startDate: undefined,
  endDate: undefined,
  startTime: "09:00",
  endTime: "17:00",
  reason: "",
  keepExistingBookings: false,
};

export function LeaveManagement({
  doctorId,
  doctorName,
  leaves,
  onCreateLeave,
  onCancelLeave,
}: LeaveManagementProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [form, setForm] = useState<LeaveFormData>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const upcomingLeaves = leaves.filter(l => {
    const endDate = parseISO(l.end_datetime);
    return l.status === 'active' && isAfter(endDate, new Date());
  }).sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime());

  const pastLeaves = leaves.filter(l => {
    const endDate = parseISO(l.end_datetime);
    return l.status === 'active' && isBefore(endDate, new Date());
  });

  const handleSubmit = async () => {
    if (!form.startDate) {
      toast({ title: "Please select a start date", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      let startDateTime: Date;
      let endDateTime: Date;

      if (form.leaveType === "full_day") {
        startDateTime = startOfDay(form.startDate);
        endDateTime = endOfDay(form.endDate || form.startDate);
      } else {
        // Partial day
        const [startHour, startMin] = form.startTime.split(':').map(Number);
        const [endHour, endMin] = form.endTime.split(':').map(Number);
        startDateTime = new Date(form.startDate);
        startDateTime.setHours(startHour, startMin, 0, 0);
        endDateTime = new Date(form.startDate);
        endDateTime.setHours(endHour, endMin, 0, 0);
      }

      await onCreateLeave({
        doctor_id: doctorId,
        start_datetime: startDateTime.toISOString(),
        end_datetime: endDateTime.toISOString(),
        leave_type: form.leaveType,
        reason: form.reason || null,
        keep_existing_bookings: form.keepExistingBookings,
      });

      toast({ title: "Leave added successfully" });
      setShowAddDialog(false);
      setForm(DEFAULT_FORM);
    } catch (error) {
      toast({ title: "Failed to add leave", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (leaveId: string) => {
    setCancelingId(leaveId);
    try {
      await onCancelLeave(leaveId);
      toast({ title: "Leave cancelled" });
    } catch (error) {
      toast({ title: "Failed to cancel leave", variant: "destructive" });
    } finally {
      setCancelingId(null);
    }
  };

  const formatLeaveDate = (leave: Leave) => {
    const start = parseISO(leave.start_datetime);
    const end = parseISO(leave.end_datetime);

    if (leave.leave_type === "partial_day") {
      return `${format(start, "MMM d, yyyy")} ${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;
    }

    if (format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd")) {
      return format(start, "MMM d, yyyy");
    }

    return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
  };

  const getLeaveTypeBadge = (type: LeaveType) => {
    if (type === "partial_day") {
      return <Badge variant="outline">Partial Day</Badge>;
    }
    return <Badge variant="secondary">Full Day</Badge>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Leave Management</CardTitle>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Leave
        </Button>
      </CardHeader>
      <CardContent>
        {/* Upcoming Leaves */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Upcoming Leaves</h4>
          {upcomingLeaves.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No upcoming leaves scheduled</p>
          ) : (
            <div className="space-y-2">
              {upcomingLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">{formatLeaveDate(leave)}</div>
                      {leave.reason && (
                        <div className="text-xs text-muted-foreground">{leave.reason}</div>
                      )}
                    </div>
                    {getLeaveTypeBadge(leave.leave_type)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancel(leave.id)}
                    disabled={cancelingId === leave.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Past Leaves */}
          {pastLeaves.length > 0 && (
            <>
              <h4 className="text-sm font-medium text-muted-foreground mt-6">Past Leaves</h4>
              <div className="space-y-2 opacity-60">
                {pastLeaves.slice(0, 5).map((leave) => (
                  <div
                    key={leave.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm">{formatLeaveDate(leave)}</div>
                        {leave.reason && (
                          <div className="text-xs text-muted-foreground">{leave.reason}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>

      {/* Add Leave Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Leave for {doctorName}</DialogTitle>
            <DialogDescription>
              Schedule time off. Existing appointments may need to be rescheduled.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Leave Type</Label>
              <Select
                value={form.leaveType}
                onValueChange={(v) => setForm({ ...form, leaveType: v as LeaveType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_day">Full Day(s)</SelectItem>
                  <SelectItem value="partial_day">Partial Day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !form.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.startDate ? format(form.startDate, "MMM d, yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={form.startDate}
                      onSelect={(d) => setForm({ ...form, startDate: d })}
                      disabled={(date) => isBefore(date, startOfDay(new Date()))}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {form.leaveType === "full_day" && (
                <div>
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !form.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.endDate ? format(form.endDate, "MMM d, yyyy") : "Same day"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={form.endDate}
                        onSelect={(d) => setForm({ ...form, endDate: d })}
                        disabled={(date) => form.startDate ? isBefore(date, form.startDate) : true}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>

            {form.leaveType === "partial_day" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>From Time</Label>
                  <Input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label>To Time</Label>
                  <Input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div>
              <Label>Reason (optional)</Label>
              <Textarea
                placeholder="e.g., Personal leave, Conference, Vacation"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div>
                <Label className="cursor-pointer">Keep Existing Bookings</Label>
                <p className="text-xs text-muted-foreground">
                  If enabled, existing appointments will require manual reassignment
                </p>
              </div>
              <Switch
                checked={form.keepExistingBookings}
                onCheckedChange={(c) => setForm({ ...form, keepExistingBookings: c })}
              />
            </div>

            {!form.keepExistingBookings && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p className="text-xs">
                  Existing appointments during this leave will be auto-cancelled and patients will be notified.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving || !form.startDate}>
              {saving ? "Adding..." : "Add Leave"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
