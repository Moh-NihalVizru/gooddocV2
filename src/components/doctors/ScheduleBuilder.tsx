import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Copy, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { DaySchedule, ScheduleBlock, ScheduleMode, Location } from "@/types/scheduling";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_ABBREVS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface ScheduleBuilderProps {
  doctorId: string;
  weekPattern: DaySchedule[];
  locations: Location[];
  defaultDuration: number;
  defaultBuffer: number;
  onSave: (weekPattern: DaySchedule[]) => Promise<void>;
}

interface BlockFormData {
  start: string;
  end: string;
  locationId: string;
  mode: ScheduleMode;
  duration: number;
  buffer: number;
  capacity: number;
}

const DEFAULT_BLOCK: BlockFormData = {
  start: "09:00",
  end: "13:00",
  locationId: "",
  mode: "in_person",
  duration: 20,
  buffer: 5,
  capacity: 1,
};

export function ScheduleBuilder({
  doctorId,
  weekPattern,
  locations,
  defaultDuration,
  defaultBuffer,
  onSave,
}: ScheduleBuilderProps) {
  const [schedule, setSchedule] = useState<DaySchedule[]>(weekPattern);
  const [editingBlock, setEditingBlock] = useState<{ day: number; blockIndex: number } | null>(null);
  const [blockForm, setBlockForm] = useState<BlockFormData>({ ...DEFAULT_BLOCK, duration: defaultDuration, buffer: defaultBuffer });
  const [addingToDay, setAddingToDay] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setSchedule(weekPattern);
  }, [weekPattern]);

  const getDayBlocks = (day: number): ScheduleBlock[] => {
    const daySchedule = schedule.find(d => d.day === day);
    return daySchedule?.blocks || [];
  };

  const handleAddBlock = (day: number) => {
    const defaultLocation = locations.find(l => l.type === 'in_person');
    setBlockForm({
      ...DEFAULT_BLOCK,
      duration: defaultDuration,
      buffer: defaultBuffer,
      locationId: defaultLocation?.id || "",
    });
    setAddingToDay(day);
  };

  const handleEditBlock = (day: number, blockIndex: number) => {
    const blocks = getDayBlocks(day);
    const block = blocks[blockIndex];
    setBlockForm({
      start: block.start,
      end: block.end,
      locationId: block.locationId || "",
      mode: block.mode || "in_person",
      duration: block.duration || defaultDuration,
      buffer: block.buffer ?? defaultBuffer,
      capacity: block.capacity || 1,
    });
    setEditingBlock({ day, blockIndex });
  };

  const handleDeleteBlock = (day: number, blockIndex: number) => {
    setSchedule(prev => {
      const newSchedule = [...prev];
      const dayIndex = newSchedule.findIndex(d => d.day === day);
      if (dayIndex >= 0) {
        newSchedule[dayIndex] = {
          ...newSchedule[dayIndex],
          blocks: newSchedule[dayIndex].blocks.filter((_, i) => i !== blockIndex),
        };
        // Remove day if no blocks left
        if (newSchedule[dayIndex].blocks.length === 0) {
          return newSchedule.filter(d => d.day !== day);
        }
      }
      return newSchedule;
    });
  };

  const handleSaveBlock = () => {
    const newBlock: ScheduleBlock = {
      start: blockForm.start,
      end: blockForm.end,
      locationId: blockForm.locationId || undefined,
      mode: blockForm.mode,
      duration: blockForm.duration,
      buffer: blockForm.buffer,
      capacity: blockForm.capacity,
    };

    if (addingToDay !== null) {
      setSchedule(prev => {
        const dayIndex = prev.findIndex(d => d.day === addingToDay);
        if (dayIndex >= 0) {
          const updated = [...prev];
          updated[dayIndex] = {
            ...updated[dayIndex],
            blocks: [...updated[dayIndex].blocks, newBlock].sort((a, b) => a.start.localeCompare(b.start)),
          };
          return updated;
        }
        return [...prev, { day: addingToDay, blocks: [newBlock] }].sort((a, b) => a.day - b.day);
      });
      setAddingToDay(null);
    } else if (editingBlock) {
      setSchedule(prev => {
        const newSchedule = [...prev];
        const dayIndex = newSchedule.findIndex(d => d.day === editingBlock.day);
        if (dayIndex >= 0) {
          newSchedule[dayIndex] = {
            ...newSchedule[dayIndex],
            blocks: newSchedule[dayIndex].blocks.map((b, i) =>
              i === editingBlock.blockIndex ? newBlock : b
            ).sort((a, b) => a.start.localeCompare(b.start)),
          };
        }
        return newSchedule;
      });
      setEditingBlock(null);
    }
  };

  const handleCopyDay = (fromDay: number, toDay: number) => {
    const blocks = getDayBlocks(fromDay);
    if (blocks.length === 0) return;

    setSchedule(prev => {
      const filtered = prev.filter(d => d.day !== toDay);
      return [...filtered, { day: toDay, blocks: [...blocks] }].sort((a, b) => a.day - b.day);
    });
    toast({ title: `Copied ${DAY_ABBREVS[fromDay]} schedule to ${DAY_ABBREVS[toDay]}` });
  };

  const handleSaveSchedule = async () => {
    setSaving(true);
    try {
      await onSave(schedule);
      toast({ title: "Schedule saved successfully" });
    } catch (error) {
      toast({ title: "Failed to save schedule", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const getLocationName = (locationId?: string) => {
    if (!locationId) return "Any";
    return locations.find(l => l.id === locationId)?.name || "Unknown";
  };

  const getModeLabel = (mode?: ScheduleMode) => {
    if (mode === "telehealth") return "Telehealth";
    if (mode === "both") return "Both";
    return "In-person";
  };

  const getModeColor = (mode?: ScheduleMode) => {
    if (mode === "telehealth") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    if (mode === "both") return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Weekly Schedule</CardTitle>
        <Button onClick={handleSaveSchedule} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Schedule"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Week Grid */}
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((day, dayIndex) => (
              <div key={dayIndex} className="min-h-[200px]">
                <div className="text-sm font-medium text-center mb-2 pb-2 border-b">
                  {DAY_ABBREVS[dayIndex]}
                </div>
                <div className="space-y-2">
                  {getDayBlocks(dayIndex).map((block, blockIndex) => (
                    <div
                      key={blockIndex}
                      className={`p-2 rounded-md border cursor-pointer hover:shadow-sm transition-shadow ${getModeColor(block.mode)}`}
                      onClick={() => handleEditBlock(dayIndex, blockIndex)}
                    >
                      <div className="text-xs font-medium">
                        {block.start} - {block.end}
                      </div>
                      <div className="text-xs opacity-75 mt-1">
                        {getLocationName(block.locationId)}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 mt-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBlock(dayIndex, blockIndex);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-8 border-dashed border"
                    onClick={() => handleAddBlock(dayIndex)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Copy Actions */}
          <div className="flex items-center gap-2 pt-4 border-t">
            <span className="text-sm text-muted-foreground">Quick copy:</span>
            <Button variant="outline" size="sm" onClick={() => {
              const monday = getDayBlocks(1);
              if (monday.length > 0) {
                [2, 3, 4, 5].forEach(day => handleCopyDay(1, day));
              }
            }}>
              Mon → Weekdays
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Block Edit Dialog */}
      <Dialog open={addingToDay !== null || editingBlock !== null} onOpenChange={() => {
        setAddingToDay(null);
        setEditingBlock(null);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingBlock ? "Edit Time Block" : `Add Block - ${addingToDay !== null ? DAYS[addingToDay] : ""}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={blockForm.start}
                  onChange={(e) => setBlockForm({ ...blockForm, start: e.target.value })}
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={blockForm.end}
                  onChange={(e) => setBlockForm({ ...blockForm, end: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Location</Label>
              <Select
                value={blockForm.locationId}
                onValueChange={(v) => setBlockForm({ ...blockForm, locationId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Mode</Label>
              <Select
                value={blockForm.mode}
                onValueChange={(v) => setBlockForm({ ...blockForm, mode: v as ScheduleMode })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_person">In-person</SelectItem>
                  <SelectItem value="telehealth">Telehealth</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Options */}
            <div className="flex items-center gap-2">
              <Switch checked={showAdvanced} onCheckedChange={setShowAdvanced} />
              <Label className="cursor-pointer" onClick={() => setShowAdvanced(!showAdvanced)}>
                Advanced Options
              </Label>
            </div>

            {showAdvanced && (
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Duration (min)</Label>
                    <Input
                      type="number"
                      value={blockForm.duration}
                      onChange={(e) => setBlockForm({ ...blockForm, duration: parseInt(e.target.value) || 20 })}
                    />
                  </div>
                  <div>
                    <Label>Buffer (min)</Label>
                    <Input
                      type="number"
                      value={blockForm.buffer}
                      onChange={(e) => setBlockForm({ ...blockForm, buffer: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Patients per Slot (Capacity)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={blockForm.capacity}
                    onChange={(e) => setBlockForm({ ...blockForm, capacity: parseInt(e.target.value) || 1 })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Number of patients that can be booked for the same time slot
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAddingToDay(null);
              setEditingBlock(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveBlock}>
              {editingBlock ? "Update" : "Add Block"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
