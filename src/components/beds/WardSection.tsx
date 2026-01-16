import { WardInfo, BedMapItem } from '@/data/bed-map.mock';
import { BedTile } from './BedTile';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface WardSectionProps {
  ward: WardInfo;
  selectedBeds: Set<string>;
  onBedClick: (bed: BedMapItem) => void;
  onBedRightClick?: (bed: BedMapItem, e: React.MouseEvent) => void;
}

export function WardSection({ 
  ward, 
  selectedBeds, 
  onBedClick,
  onBedRightClick 
}: WardSectionProps) {
  const occupancyPercent = Math.round((ward.occupiedBeds / ward.totalBeds) * 100);
  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;
  
  // Group beds into rows with aisle gaps
  const bedsPerRow = 6;
  const rows: BedMapItem[][] = [];
  for (let i = 0; i < ward.beds.length; i += bedsPerRow) {
    rows.push(ward.beds.slice(i, i + bedsPerRow));
  }
  
  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
      {/* Ward Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-foreground">
            {ward.name}
          </h3>
          <span className="text-xs text-muted-foreground">
            {formatPrice(ward.pricePerDay)}/day
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {ward.occupiedBeds}/{ward.totalBeds} occupied
          </span>
        </div>
        
        {/* Occupancy bar */}
        <div className="flex items-center gap-2 w-24">
          <Progress 
            value={occupancyPercent} 
            className={cn(
              'h-1.5',
              occupancyPercent > 85 && '[&>div]:bg-red-500',
              occupancyPercent > 70 && occupancyPercent <= 85 && '[&>div]:bg-amber-500',
              occupancyPercent <= 70 && '[&>div]:bg-emerald-500'
            )}
          />
          <span className="text-[10px] font-medium text-muted-foreground w-8">
            {occupancyPercent}%
          </span>
        </div>
      </div>
      
      {/* Bed Grid - Theater style with increased spacing */}
      <div className="space-y-5">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex items-center gap-4">
            {/* Row label */}
            <span className="w-4 text-[10px] font-medium text-muted-foreground text-right">
              {String.fromCharCode(65 + rowIdx)}
            </span>
            
            {/* Beds with aisle gap in the middle */}
            <div className="flex items-center gap-4">
              {row.slice(0, 3).map((bed) => (
                <BedTile
                  key={bed.id}
                  bed={bed}
                  isSelected={selectedBeds.has(bed.id)}
                  onClick={() => onBedClick(bed)}
                  onRightClick={(e) => onBedRightClick?.(bed, e)}
                />
              ))}
              
              {/* Aisle gap */}
              {row.length > 3 && (
                <div className="w-8" aria-hidden="true" />
              )}
              
              {row.slice(3).map((bed) => (
                <BedTile
                  key={bed.id}
                  bed={bed}
                  isSelected={selectedBeds.has(bed.id)}
                  onClick={() => onBedClick(bed)}
                  onRightClick={(e) => onBedRightClick?.(bed, e)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
