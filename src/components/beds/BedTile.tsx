import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { BedMapItem, BedStatus } from '@/data/bed-map.mock';
import { Check } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';

interface BedTileProps {
  bed: BedMapItem;
  isSelected: boolean;
  onClick: () => void;
  onRightClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

// Very light green for available, very light red for occupied
const getStatusStyles = (status: BedStatus, isSelected: boolean) => {
  if (isSelected) {
    return 'bg-emerald-200 border-emerald-500';
  }
  
  switch (status) {
    case 'occupied':
      return 'bg-red-50 border-red-200';
    case 'reserved':
      return 'bg-amber-50 border-amber-200';
    case 'maintenance':
      return 'bg-gray-100 border-gray-300 opacity-50';
    default: // available
      return 'bg-emerald-50 border-emerald-200 hover:border-emerald-400';
  }
};

export const BedTile = forwardRef<HTMLButtonElement, BedTileProps>(
  ({ bed, isSelected, onClick, onRightClick, disabled }, ref) => {
    const isDisabled = disabled || bed.status === 'maintenance';
    
    const formatPrice = (price: number) => 
      `₹${price.toLocaleString('en-IN')}`;
    
    const getTooltipContent = () => {
      const lines = [
        `Bed ${bed.bedNumber} — ${bed.wardName}`,
        `${bed.type} • ${formatPrice(bed.pricePerDay)}/day`,
        `Status: ${bed.status.charAt(0).toUpperCase() + bed.status.slice(1)}`,
      ];
      
      if (bed.amenities.length > 0) {
        lines.push(`Amenities: ${bed.amenities.join(', ')}`);
      }
      
      if (bed.lastCleanedAt) {
        lines.push(`Last cleaned: ${formatDistanceToNow(new Date(bed.lastCleanedAt), { addSuffix: true })}`);
      }
      
      if (bed.occupant) {
        lines.push(`Patient: ${bed.occupant.name}`);
        if (bed.occupant.diagnosis) {
          lines.push(`Diagnosis: ${bed.occupant.diagnosis}`);
        }
      }
      
      if (bed.notes) {
        lines.push(`Note: ${bed.notes}`);
      }
      
      return lines;
    };

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            ref={ref}
            onClick={onClick}
            onContextMenu={onRightClick}
            disabled={isDisabled}
            aria-pressed={isSelected}
            aria-label={`Bed ${bed.bedNumber}, ${bed.wardName}, ${bed.floorName}, ${bed.type}, ${formatPrice(bed.pricePerDay)} per day, ${bed.status}`}
            className={cn(
              'relative w-10 h-10 md:w-11 md:h-11 rounded-lg border transition-all duration-200 ease-out',
              'flex items-center justify-center',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2',
              'text-gray-700',
              getStatusStyles(bed.status, isSelected),
              isDisabled && 'cursor-not-allowed',
              !isDisabled && 'cursor-pointer',
            )}
          >
            {/* Bed number only - clean and minimal */}
            <span className="text-xs font-medium leading-none">
              {bed.bedNumber.slice(-2)}
            </span>
            
            {/* Selected checkmark overlay */}
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
              </div>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-xs p-3 space-y-1"
        >
          {getTooltipContent().map((line, i) => (
            <p key={i} className={cn(
              'text-xs',
              i === 0 && 'font-semibold text-sm'
            )}>
              {line}
            </p>
          ))}
        </TooltipContent>
      </Tooltip>
    );
  }
);

BedTile.displayName = 'BedTile';
