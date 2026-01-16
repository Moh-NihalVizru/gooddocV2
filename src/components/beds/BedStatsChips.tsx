import { cn } from '@/lib/utils';

interface BedStatsChipsProps {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
}

export function BedStatsChips({ total, available, occupied, reserved }: BedStatsChipsProps) {
  const stats = [
    { label: 'Available', value: available, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'Occupied', value: occupied, className: 'bg-red-50 text-red-700 border-red-200' },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            'px-2.5 py-1 rounded-full text-xs font-medium border',
            stat.className
          )}
        >
          <span className="font-semibold">{stat.value}</span>
          <span className="ml-1 opacity-75">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
