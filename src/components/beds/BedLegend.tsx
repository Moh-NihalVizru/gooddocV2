import { cn } from '@/lib/utils';

interface LegendItem {
  status: string;
  label: string;
  bgClass: string;
  borderClass: string;
}

const legendItems: LegendItem[] = [
  { status: 'available', label: 'Available', bgClass: 'bg-emerald-50', borderClass: 'border-emerald-300' },
  { status: 'occupied', label: 'Occupied', bgClass: 'bg-red-50', borderClass: 'border-red-300' },
];

export function BedLegend() {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      {legendItems.map((item) => (
        <div key={item.status} className="flex items-center gap-1.5">
          <div 
            className={cn(
              'w-4 h-4 rounded border-2',
              item.bgClass,
              item.borderClass
            )} 
          />
          <span className="text-xs text-muted-foreground">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
