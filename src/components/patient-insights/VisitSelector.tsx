import { useState, useMemo, useCallback, useEffect } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useVisit, VisitOption } from "@/contexts/VisitContext";
import { useDebounce } from "@/hooks/useDebounce";

const statusColors: Record<string, string> = {
  Active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  Completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Scheduled: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  "In Progress": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  Cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

interface VisitSelectorProps {
  variant?: "default" | "light";
}

export function VisitSelector({ variant = "default" }: VisitSelectorProps) {
  const { visits, selectedVisitId, setSelectedVisitId, selectedVisit, isLoading } = useVisit();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 250);
  const isLight = variant === "light";

  // Filter visits based on debounced search
  const filteredVisits = useMemo(() => {
    if (!debouncedSearch) return visits;
    
    const search = debouncedSearch.toLowerCase();
    return visits.filter((visit) => {
      const visitIdMatch = visit.visitId.toLowerCase().includes(search);
      const doctorMatch = visit.doctor?.toLowerCase().includes(search);
      const dateMatch = format(visit.datetime, "dd-MMM-yyyy").toLowerCase().includes(search);
      const typeMatch = visit.type.toLowerCase().includes(search);
      return visitIdMatch || doctorMatch || dateMatch || typeMatch;
    });
  }, [visits, debouncedSearch]);

  // Sort visits: active first, then by date descending
  const sortedVisits = useMemo(() => {
    return [...filteredVisits].sort((a, b) => {
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      return b.datetime.getTime() - a.datetime.getTime();
    });
  }, [filteredVisits]);

  const handleSelect = useCallback(
    (visitId: string) => {
      setSelectedVisitId(visitId);
      setOpen(false);
      setSearchValue("");
    },
    [setSelectedVisitId]
  );

  // Announce selection changes for screen readers
  useEffect(() => {
    if (selectedVisit) {
      const announcement = `Selected visit ${selectedVisit.visitId}`;
      const liveRegion = document.getElementById("visit-selector-live");
      if (liveRegion) {
        liveRegion.textContent = announcement;
      }
    }
  }, [selectedVisit]);

  if (isLoading) {
    return (
      <div className={`h-9 w-[280px] animate-pulse rounded-md ${isLight ? "bg-white/20" : "bg-muted"}`} />
    );
  }

  return (
    <div className="flex items-center">
      {/* Screen reader live region */}
      <div id="visit-selector-live" className="sr-only" aria-live="polite" />
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select visit"
            aria-haspopup="listbox"
            className={cn(
              "justify-between h-9 px-3 text-xs",
              isLight && "bg-white/10 border-0 text-white hover:bg-white/20"
            )}
          >
            {selectedVisitId === "all" ? (
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-medium">All Visits</span>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-[10px] px-1.5 py-0 h-4",
                    isLight ? "bg-blue-500/80 text-white border-0" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  )}
                >
                  {visits.length}
                </Badge>
              </div>
            ) : selectedVisit ? (
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-mono font-medium">{selectedVisit.visitId}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {format(selectedVisit.datetime, "dd-MMM-yyyy")}
                </span>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-[10px] px-1.5 py-0 h-4",
                    statusColors[selectedVisit.status]
                  )}
                >
                  {selectedVisit.status}
                </Badge>
              </div>
            ) : (
              <span className="text-muted-foreground">Select visit...</span>
            )}
            <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[380px] p-0 bg-popover" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search by Visit ID, doctor, or date..."
              value={searchValue}
              onValueChange={setSearchValue}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>No visits found.</CommandEmpty>
              <CommandGroup>
                {/* All Visits Option */}
                <CommandItem
                  value="all"
                  onSelect={() => handleSelect("all")}
                  className="flex items-start gap-3 py-2.5 px-3 cursor-pointer border-b border-border mb-1"
                >
                  <Check
                    className={cn(
                      "h-4 w-4 mt-0.5 shrink-0",
                      selectedVisitId === "all" ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">All Visits</span>
                      <Badge 
                        variant="secondary" 
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs px-1.5 py-0"
                      >
                        {visits.length} visits
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Show appointments and data from all visits
                    </div>
                  </div>
                </CommandItem>
                {sortedVisits.map((visit) => (
                  <CommandItem
                    key={visit.id}
                    value={visit.visitId}
                    onSelect={() => handleSelect(visit.visitId)}
                    className="flex items-start gap-3 py-2.5 px-3 cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 mt-0.5 shrink-0",
                        selectedVisitId === visit.visitId ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-sm">
                          {visit.visitId}
                        </span>
                        {visit.isActive && (
                          <Badge 
                            variant="secondary" 
                            className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs px-1.5 py-0"
                          >
                            Active
                          </Badge>
                        )}
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs px-1.5 py-0", statusColors[visit.status])}
                        >
                          {visit.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{format(visit.datetime, "dd MMM yyyy, hh:mm a")}</span>
                        {visit.doctor && (
                          <>
                            <span>•</span>
                            <span className="truncate">{visit.doctor}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
