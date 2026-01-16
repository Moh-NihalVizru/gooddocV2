import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { VisitListItem, Visit } from "./VisitListItem";

interface VisitsListProps {
  visits: Visit[];
  selectedVisitId: string | null;
  onVisitSelect: (visitId: string) => void;
}

export function VisitsList({ visits, selectedVisitId, onVisitSelect }: VisitsListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVisits = useMemo(() => {
    return visits.filter((visit) => {
      return (
        visit.visitId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        visit.doctor?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [visits, searchQuery]);


  return (
    <div className="h-full flex flex-col">
      <div className="px-8 py-4 border-b border-border bg-background sticky top-0 z-10">
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search visit ID or doctor"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

      </div>

      {/* Visits List */}
      <div className="flex-1 overflow-y-auto px-8 py-4 space-y-2">
        {filteredVisits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">
              No visits found. Adjust filters or clear search.
            </p>
          </div>
        ) : (
          filteredVisits.map((visit) => (
            <VisitListItem
              key={visit.id}
              visit={visit}
              isSelected={selectedVisitId === visit.id}
              onClick={() => onVisitSelect(visit.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
