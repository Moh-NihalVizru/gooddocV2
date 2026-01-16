import { useState, useMemo } from "react";
import { Search, BedDouble } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Bed } from "@/types/transfer";
import { BedCard } from "../BedCard";
import { mockBeds, mockUnits, featureLabels } from "@/data/transfer.mock";
import { useToast } from "@/hooks/use-toast";

interface DestinationBedStepProps {
  selectedBed?: Bed;
  onSelectBed: (bed: Bed) => void;
  onHoldBed: (bed: Bed) => void;
  patientGender: string;
  patientAgeGroup: 'pediatric' | 'adult';
}

export function DestinationBedStep({ 
  selectedBed, 
  onSelectBed, 
  onHoldBed,
  patientGender,
  patientAgeGroup 
}: DestinationBedStepProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("available");
  const [detailBed, setDetailBed] = useState<Bed | null>(null);

  const filteredBeds = useMemo(() => {
    return mockBeds.filter((bed) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!bed.bedName.toLowerCase().includes(query) && 
            !bed.roomName.toLowerCase().includes(query) &&
            !bed.unitName.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Unit filter
      if (selectedUnit !== "all" && bed.unitId !== selectedUnit) {
        return false;
      }

      // Status filter
      if (selectedStatus !== "all" && bed.status !== selectedStatus) {
        return false;
      }

      // Gender compatibility
      if (bed.genderRestriction !== 'any') {
        const patientGenderLower = patientGender.toLowerCase();
        if (bed.genderRestriction !== patientGenderLower) return false;
      }

      // Age group compatibility
      if (bed.ageGroup !== 'any' && bed.ageGroup !== patientAgeGroup) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedUnit, selectedStatus, patientGender, patientAgeGroup]);

  const bedsByUnit = useMemo(() => {
    const grouped: Record<string, Bed[]> = {};
    filteredBeds.forEach((bed) => {
      if (!grouped[bed.unitId]) {
        grouped[bed.unitId] = [];
      }
      grouped[bed.unitId].push(bed);
    });
    return grouped;
  }, [filteredBeds]);

  const handleHoldBed = (bed: Bed) => {
    onHoldBed(bed);
    toast({
      title: `Bed ${bed.bedName} held for 15 minutes`,
      description: "We'll remind you before it expires.",
    });
  };

  const availableCount = filteredBeds.filter(b => b.status === 'available').length;
  const totalFiltered = filteredBeds.length;

  return (
    <div className="space-y-4">
      {/* Toolbar - Filters and Search */}
      <div className="flex items-center gap-3">
        <Select value={selectedUnit} onValueChange={setSelectedUnit}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="All Units" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Units</SelectItem>
            {mockUnits.map((unit) => (
              <SelectItem key={unit.id} value={unit.id}>
                {unit.name} ({unit.availableBeds}/{unit.totalBeds})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[150px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
            <SelectItem value="cleaning">Cleaning</SelectItem>
            <SelectItem value="hold">On Hold</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search beds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
          {availableCount} Available
        </Badge>
        <span className="text-sm text-muted-foreground">
          of {totalFiltered} beds shown
        </span>
      </div>

      {/* Bed Grid */}
      {filteredBeds.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BedDouble className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-medium text-foreground mb-1">No beds found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Try adjusting your filters or expand your search
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              setSelectedUnit("all");
              setSelectedStatus("all");
            }}>
              Clear all filters
            </Button>
            <Button variant="outline" size="sm">
              Join Waitlist
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredBeds.map((bed) => {
            const isSelected = selectedBed?.id === bed.id;
            
            // If this bed is selected, don't wrap in Sheet
            if (isSelected) {
              return (
                <BedCard
                  key={bed.id}
                  bed={bed}
                  isSelected={true}
                  onSelect={onSelectBed}
                  onHold={handleHoldBed}
                  onCancel={() => onSelectBed(undefined as any)}
                />
              );
            }
            
            return (
              <Sheet key={bed.id}>
                <SheetTrigger asChild>
                  <div onClick={() => setDetailBed(bed)}>
                    <BedCard
                      bed={bed}
                      isSelected={false}
                      onSelect={onSelectBed}
                      onHold={handleHoldBed}
                    />
                  </div>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Bed Details</SheetTitle>
                  </SheetHeader>
                  {detailBed && (
                    <div className="mt-6 space-y-6">
                      <div>
                        <h3 className="text-2xl font-bold">{detailBed.bedName}</h3>
                        <p className="text-muted-foreground">
                          {detailBed.unitName} • {detailBed.roomName}
                        </p>
                      </div>


                      <div className="space-y-3">
                        <h4 className="font-medium">Restrictions</h4>
                        <div className="text-sm space-y-1">
                          <p>Gender: {detailBed.genderRestriction === 'any' ? 'Any' : detailBed.genderRestriction}</p>
                          <p>Age Group: {detailBed.ageGroup === 'any' ? 'Any' : detailBed.ageGroup}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium">Tariff</h4>
                        <p className="text-2xl font-bold">₹{detailBed.tariff.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/day</span></p>
                      </div>

                      {detailBed.status === 'available' && (
                        <div className="flex gap-2 pt-4">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleHoldBed(detailBed)}
                          >
                            Hold for 15m
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={() => {
                              onSelectBed(detailBed);
                              setDetailBed(null);
                            }}
                          >
                            Select Bed
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            );
          })}
        </div>
      )}
    </div>
  );
}
