import { BedMapItem } from '@/data/bed-map.mock';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ArrowRightLeft } from 'lucide-react';

interface BedSummaryPanelProps {
  selectedBeds: BedMapItem[];
  onClear: () => void;
  onTransfer?: () => void;
}

export function BedSummaryPanel({
  selectedBeds,
  onClear,
  onTransfer,
}: BedSummaryPanelProps) {
  if (selectedBeds.length === 0) return null;

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;
  const totalPerDay = selectedBeds.reduce((sum, bed) => sum + bed.pricePerDay, 0);
  
  const firstBed = selectedBeds[0];
  const isMultiple = selectedBeds.length > 1;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-sm border-t border-border shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Selected beds info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Bed chips */}
            <div className="flex items-center gap-2 flex-wrap">
              {selectedBeds.slice(0, 3).map((bed) => (
                <Badge
                  key={bed.id}
                  variant="secondary"
                  className="text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                >
                  {bed.floor} • {bed.wardName} • Bed {bed.bedNumber}
                </Badge>
              ))}
              {selectedBeds.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{selectedBeds.length - 3} more
                </Badge>
              )}
            </div>
            
            {/* Details for single selection */}
            {!isMultiple && (
              <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground border-l border-border pl-4 ml-2">
                <span>{firstBed.type}</span>
                <span>{firstBed.roomNumber}</span>
                <span className="font-medium text-foreground">
                  {formatPrice(firstBed.pricePerDay)}/day
                </span>
                {firstBed.amenities.length > 0 && (
                  <span className="text-xs">
                    {firstBed.amenities.join(', ')}
                  </span>
                )}
              </div>
            )}
            
            {/* Total for multiple */}
            {isMultiple && (
              <div className="hidden md:block text-sm font-medium text-foreground border-l border-border pl-4 ml-2">
                Total: {formatPrice(totalPerDay)}/day
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Primary action */}
            {onTransfer && (
              <Button 
                size="sm" 
                onClick={onTransfer}
                className="gap-1.5"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Bed Transfer</span>
                <span className="sm:hidden">Transfer</span>
              </Button>
            )}
            
            {/* Clear */}
            <Button
              size="sm"
              variant="ghost"
              onClick={onClear}
              className="text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
