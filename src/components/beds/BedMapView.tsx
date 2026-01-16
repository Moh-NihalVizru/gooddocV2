import { useState, useMemo, useCallback } from 'react';
import { BedMapItem, FloorInfo, bedMapData, bedStats, allBeds } from '@/data/bed-map.mock';
import { WardSection } from './WardSection';
import { BedLegend } from './BedLegend';
import { BedStatsChips } from './BedStatsChips';
import { BedSummaryPanel } from './BedSummaryPanel';
import { OccupiedBedSheet } from './OccupiedBedSheet';
import { BedTransferModal } from './BedTransferModal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, Download, Printer } from 'lucide-react';
import { toast } from 'sonner';

interface BedMapViewProps {
  searchQuery?: string;
  floorFilter?: string;
  wardFilter?: string;
  statusFilter?: string;
  typeFilter?: string;
}

export function BedMapView({
  searchQuery = '',
  floorFilter = 'all',
  wardFilter = 'all',
  statusFilter = 'all',
  typeFilter = 'all',
}: BedMapViewProps) {
  const [selectedBedIds, setSelectedBedIds] = useState<Set<string>>(new Set());
  const [activeFloor, setActiveFloor] = useState<string>(bedMapData[0]?.id || 'F1');
  const [occupiedBed, setOccupiedBed] = useState<BedMapItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  // Filter floors based on filters
  const filteredFloors = useMemo(() => {
    return bedMapData.map(floor => ({
      ...floor,
      wards: floor.wards.map(ward => ({
        ...ward,
        beds: ward.beds.filter(bed => {
          // Only show available and occupied beds
          if (bed.status !== 'available' && bed.status !== 'occupied') return false;
          
          // Search filter
          if (localSearch) {
            const query = localSearch.toLowerCase();
            const matchesBed = bed.bedNumber.toLowerCase().includes(query);
            const matchesWard = bed.wardName.toLowerCase().includes(query);
            const matchesPatient = bed.occupant?.name.toLowerCase().includes(query);
            if (!matchesBed && !matchesWard && !matchesPatient) return false;
          }
          
          // Status filter
          if (statusFilter !== 'all' && bed.status !== statusFilter) return false;
          
          // Type filter
          if (typeFilter !== 'all' && bed.type !== typeFilter) return false;
          
          return true;
        }),
      })).filter(ward => {
        // Ward filter
        if (wardFilter !== 'all' && ward.id !== `${floor.id}-${wardFilter}`) return false;
        return ward.beds.length > 0;
      }),
    })).filter(floor => {
      // Floor filter
      if (floorFilter !== 'all' && floor.id !== floorFilter) return false;
      return floor.wards.length > 0;
    });
  }, [localSearch, floorFilter, wardFilter, statusFilter, typeFilter]);

  // Get current floor data
  const currentFloor = filteredFloors.find(f => f.id === activeFloor) || filteredFloors[0];

  // Handle bed click
  const handleBedClick = useCallback((bed: BedMapItem) => {
    if (bed.status === 'occupied') {
      setOccupiedBed(bed);
      setSheetOpen(true);
      return;
    }
    
    if (bed.status === 'maintenance') {
      return; // Disabled
    }
    
    setSelectedBedIds(prev => {
      const next = new Set(prev);
      if (next.has(bed.id)) {
        next.delete(bed.id);
      } else {
        next.add(bed.id);
      }
      return next;
    });
  }, []);

  // Get selected beds
  const selectedBeds = useMemo(() => {
    return allBeds.filter(bed => selectedBedIds.has(bed.id));
  }, [selectedBedIds]);

  // Stats for filtered view
  const filteredStats = useMemo(() => {
    const beds = filteredFloors.flatMap(f => f.wards.flatMap(w => w.beds));
    return {
      total: beds.length,
      available: beds.filter(b => b.status === 'available').length,
      occupied: beds.filter(b => b.status === 'occupied').length,
      reserved: beds.filter(b => b.status === 'reserved').length,
    };
  }, [filteredFloors]);

  // Actions
  const handleClear = () => setSelectedBedIds(new Set());
  
  const handleAssign = () => {
    toast.success(`Assign patient to ${selectedBeds.length} bed(s)`);
    handleClear();
  };
  
  const handleReserve = () => {
    toast.success(`Reserved ${selectedBeds.length} bed(s)`);
    handleClear();
  };

  const handleTransfer = () => {
    setTransferModalOpen(true);
    setSheetOpen(false);
  };

  const handleRelease = () => {
    toast.success('Bed released');
    setSheetOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Floor Tabs with Legend on right */}
      <Tabs value={activeFloor} onValueChange={setActiveFloor}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList className="h-auto p-1 gap-1 flex-wrap justify-start">
            {bedMapData.map((floor) => {
              const floorData = filteredFloors.find(f => f.id === floor.id);
              const bedCount = floorData?.wards.reduce((sum, w) => sum + w.beds.length, 0) || 0;
              
              return (
                <TabsTrigger
                  key={floor.id}
                  value={floor.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
                  disabled={bedCount === 0}
                >
                  <span className="font-medium">{floor.id}</span>
                  <span className="ml-1.5 text-xs opacity-75">
                    {floor.name}
                  </span>
                  {bedCount > 0 && (
                    <span className="ml-2 text-[10px] bg-white/20 px-1.5 py-0.5 rounded">
                      {bedCount}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          {/* Legend on right */}
          <BedLegend />
        </div>

        {/* Floor Content */}
        {bedMapData.map((floor) => (
          <TabsContent key={floor.id} value={floor.id} className="mt-4">
            {filteredFloors.find(f => f.id === floor.id)?.wards.length ? (
              <div className="space-y-4">
                {filteredFloors.find(f => f.id === floor.id)?.wards.map((ward) => (
                  <WardSection
                    key={ward.id}
                    ward={ward}
                    selectedBeds={selectedBedIds}
                    onBedClick={handleBedClick}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">No beds match your filters</p>
                <Button 
                  variant="link" 
                  className="mt-2"
                  onClick={() => setLocalSearch('')}
                >
                  Clear search
                </Button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Bottom Summary Panel */}
      <BedSummaryPanel
        selectedBeds={selectedBeds}
        onClear={handleClear}
        onTransfer={handleTransfer}
      />

      {/* Occupied Bed Sheet */}
      <OccupiedBedSheet
        bed={occupiedBed}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onTransfer={handleTransfer}
        onRelease={handleRelease}
      />

      {/* Bed Transfer Modal */}
      <BedTransferModal
        open={transferModalOpen}
        onOpenChange={setTransferModalOpen}
        selectedBed={selectedBeds[0]}
      />

      {/* Spacer for bottom panel */}
      {selectedBeds.length > 0 && <div className="h-16" />}
    </div>
  );
}
