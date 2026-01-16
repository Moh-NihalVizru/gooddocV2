import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Users, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlotInfo {
  startTime: string;
  endTime: string;
  status: "available" | "booked" | "blocked" | "completed";
  bookedCount: number;
  capacity: number;
}

interface DoctorSlotsPopoverProps {
  doctorName: string;
  totalSlots: number;
  completedSlots: number;
}

// Generate mock slots for a doctor
const generateMockSlots = (total: number, completed: number): SlotInfo[] => {
  const slots: SlotInfo[] = [];
  const capacity = 3;
  
  let hour = 8;
  let minute = 0;
  
  for (let i = 0; i < total; i++) {
    const startHour = hour;
    const startMinute = minute;
    
    // Advance by 30 minutes
    minute += 30;
    if (minute >= 60) {
      minute = 0;
      hour++;
    }
    
    const formatTime = (h: number, m: number) => {
      const period = h >= 12 ? "PM" : "AM";
      const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
      return `${displayHour}:${m.toString().padStart(2, "0")} ${period}`;
    };
    
    let status: SlotInfo["status"];
    let bookedCount: number;
    
    if (i < completed) {
      status = "completed";
      bookedCount = capacity;
    } else if (i < completed + Math.floor((total - completed) * 0.5)) {
      status = "booked";
      bookedCount = Math.floor(Math.random() * 2) + 2; // 2-3 booked
    } else if (i === total - 1 && total > 5) {
      status = "blocked";
      bookedCount = 0;
    } else {
      status = "available";
      bookedCount = Math.floor(Math.random() * 2); // 0-1 booked
    }
    
    slots.push({
      startTime: formatTime(startHour, startMinute),
      endTime: formatTime(hour, minute),
      status,
      bookedCount,
      capacity,
    });
  }
  
  return slots;
};

const statusConfig = {
  available: { 
    label: "Available", 
    className: "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-400",
    dotColor: "bg-green-500"
  },
  booked: { 
    label: "Booked", 
    className: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400",
    dotColor: "bg-blue-500"
  },
  blocked: { 
    label: "Blocked", 
    className: "bg-gray-50 border-gray-200 text-gray-500 dark:bg-gray-800/30 dark:border-gray-700 dark:text-gray-400",
    dotColor: "bg-gray-400"
  },
  completed: { 
    label: "Completed", 
    className: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400",
    dotColor: "bg-emerald-500"
  },
};

export function DoctorSlotsPopover({ 
  doctorName, 
  totalSlots, 
  completedSlots 
}: DoctorSlotsPopoverProps) {
  const [filter, setFilter] = useState<string>("all");
  const [isOpen, setIsOpen] = useState(false);
  
  const slots = useMemo(() => generateMockSlots(totalSlots, completedSlots), [totalSlots, completedSlots]);
  
  const filteredSlots = filter === "all" 
    ? slots 
    : slots.filter(slot => slot.status === filter);
  
  const slotCounts = useMemo(() => ({
    available: slots.filter(s => s.status === "available").length,
    booked: slots.filter(s => s.status === "booked").length,
    completed: slots.filter(s => s.status === "completed").length,
    blocked: slots.filter(s => s.status === "blocked").length,
  }), [slots]);

  // Split slots into two columns
  const midPoint = Math.ceil(filteredSlots.length / 2);
  const leftColumnSlots = filteredSlots.slice(0, midPoint);
  const rightColumnSlots = filteredSlots.slice(midPoint);

  const handleBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(true);
  };

  const SlotCard = ({ slot, index }: { slot: SlotInfo; index: number }) => (
    <div 
      key={index}
      className={cn(
        "flex items-center justify-between p-2.5 rounded-lg border transition-colors",
        statusConfig[slot.status].className
      )}
    >
      <div className="flex items-center gap-2">
        <div className={cn("w-2 h-2 rounded-full flex-shrink-0", statusConfig[slot.status].dotColor)} />
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-xs font-medium whitespace-nowrap">
            {slot.startTime} - {slot.endTime}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-1.5 text-xs">
        <Users className="w-3.5 h-3.5" />
        <span className="font-medium">{slot.bookedCount}/{slot.capacity}</span>
      </div>
    </div>
  );

  return (
    <>
      <Badge 
        className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer transition-colors"
        onClick={handleBadgeClick}
      >
        {completedSlots}/{totalSlots} Completed
      </Badge>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl p-0 gap-0" onClick={(e) => e.stopPropagation()}>
          <DialogHeader className="p-4 pb-3 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-base">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Today's Slots
              </DialogTitle>
              <span className="text-xs text-muted-foreground font-normal">{doctorName}</span>
            </div>
          </DialogHeader>
          
          {/* Summary chips and filter */}
          <div className="p-4 pt-3 pb-3 border-b bg-muted/10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800">
                  {slotCounts.available} Available
                </Badge>
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800">
                  {slotCounts.booked} Booked
                </Badge>
                <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
                  {slotCounts.completed} Completed
                </Badge>
                {slotCounts.blocked > 0 && (
                  <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700">
                    {slotCounts.blocked} Blocked
                  </Badge>
                )}
              </div>
              
              {/* Filter dropdown */}
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[160px] h-8 text-xs bg-background">
                  <SelectValue placeholder="Filter slots" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Slots ({slots.length})</SelectItem>
                  <SelectItem value="available">Available ({slotCounts.available})</SelectItem>
                  <SelectItem value="booked">Booked ({slotCounts.booked})</SelectItem>
                  <SelectItem value="completed">Completed ({slotCounts.completed})</SelectItem>
                  <SelectItem value="blocked">Blocked ({slotCounts.blocked})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Slots list - Two columns */}
          <div className="max-h-[350px] overflow-y-auto p-4">
            {filteredSlots.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No slots match the selected filter
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {/* Left column */}
                <div className="space-y-2">
                  {leftColumnSlots.map((slot, index) => (
                    <SlotCard key={index} slot={slot} index={index} />
                  ))}
                </div>
                
                {/* Right column */}
                <div className="space-y-2">
                  {rightColumnSlots.map((slot, index) => (
                    <SlotCard key={index + midPoint} slot={slot} index={index + midPoint} />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-3 border-t bg-muted/20">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}