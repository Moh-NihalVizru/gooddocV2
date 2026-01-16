import { BedMapItem } from '@/data/bed-map.mock';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Phone, 
  Calendar, 
  Stethoscope, 
  ArrowRightLeft, 
  Unlock,
  AlertTriangle 
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface OccupiedBedSheetProps {
  bed: BedMapItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransfer?: () => void;
  onRelease?: () => void;
}

const acuityColors = {
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  High: 'bg-orange-50 text-orange-700 border-orange-200',
  Critical: 'bg-red-50 text-red-700 border-red-200',
};

export function OccupiedBedSheet({
  bed,
  open,
  onOpenChange,
  onTransfer,
  onRelease,
}: OccupiedBedSheetProps) {
  if (!bed || !bed.occupant) return null;

  const { occupant } = bed;
  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;
  const admittedDate = new Date(occupant.since);
  const stayDuration = formatDistanceToNow(admittedDate, { addSuffix: false });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[450px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <User className="w-4 h-4 text-red-600" />
            </div>
            <span>Occupied Bed Details</span>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Bed Info */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">
                Bed {bed.bedNumber}
              </span>
              <Badge variant="destructive" className="text-xs">
                Occupied
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{bed.floorName}</span>
              <span>•</span>
              <span>{bed.wardName}</span>
              <span>•</span>
              <span>{bed.type}</span>
            </div>
            <div className="text-sm font-medium">
              {formatPrice(bed.pricePerDay)}/day
            </div>
          </div>

          <Separator />

          {/* Patient Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Patient Information
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-primary">
                    {occupant.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-semibold">{occupant.name}</p>
                  <p className="text-sm text-muted-foreground">{occupant.mrn}</p>
                </div>
              </div>

              {/* Acuity */}
              {occupant.acuity && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Acuity:</span>
                  <Badge 
                    variant="outline" 
                    className={acuityColors[occupant.acuity]}
                  >
                    {occupant.acuity}
                  </Badge>
                </div>
              )}

              {/* Diagnosis */}
              {occupant.diagnosis && (
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Diagnosis:</span>
                  <span className="text-sm font-medium">{occupant.diagnosis}</span>
                </div>
              )}

              {/* Attending Doctor */}
              {occupant.attendingDoctor && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Attending:</span>
                  <span className="text-sm font-medium">{occupant.attendingDoctor}</span>
                </div>
              )}

              {/* Admission Date */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Admitted:</span>
                <span className="text-sm font-medium">
                  {format(admittedDate, 'dd MMM yyyy, HH:mm')}
                </span>
              </div>

              {/* Length of Stay */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-700">
                  <span className="font-semibold">{stayDuration}</span> stay so far
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Amenities */}
          {bed.amenities.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Amenities
              </h4>
              <div className="flex flex-wrap gap-2">
                {bed.amenities.map((amenity) => (
                  <Badge key={amenity} variant="secondary" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={onTransfer}
            >
              <ArrowRightLeft className="w-4 h-4" />
              Transfer
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={onRelease}
            >
              <Unlock className="w-4 h-4" />
              Discharge
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
