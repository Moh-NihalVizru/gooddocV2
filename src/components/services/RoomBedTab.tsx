import { useState, useMemo } from "react";
import { format } from "date-fns";
import { 
  Search, Clock, Building2, 
  BedDouble, AlertTriangle, Info, Filter, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { 
  getTransferHistoryForPatient, 
  TransferHistoryRecord, 
  TransferStatus,
  calculateDuration,
  calculateCharge
} from "@/data/transfer-history.mock";
import { ServiceItem } from "@/types/booking/ipAdmission";
import { cn } from "@/lib/utils";

interface RoomBedTabProps {
  patientId: string;
  onAddToCart: (service: ServiceItem) => void;
  isInCart: (serviceId: string) => boolean;
}

const formatPrice = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

const getStatusBadge = (status: TransferStatus) => {
  switch (status) {
    case 'completed':
      return <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-200">Completed</Badge>;
    case 'ongoing':
      return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-200">Ongoing</Badge>;
    case 'scheduled':
      return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-200">Scheduled</Badge>;
    default:
      return null;
  }
};

const getLocationTypeColor = (type: 'ward' | 'icu' | 'private' | null) => {
  switch (type) {
    case 'icu':
      return 'text-red-600 bg-red-500/10';
    case 'private':
      return 'text-purple-600 bg-purple-500/10';
    case 'ward':
    default:
      return 'text-blue-600 bg-blue-500/10';
  }
};

export function RoomBedTab({ patientId, onAddToCart, isInCart }: RoomBedTabProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Get transfer history
  const allTransfers = useMemo(() => {
    return getTransferHistoryForPatient(patientId);
  }, [patientId]);

  // Apply filters
  const filteredTransfers = useMemo(() => {
    let result = allTransfers;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.toLocationName.toLowerCase().includes(query) ||
        t.toBedNumber.toLowerCase().includes(query) ||
        (t.fromLocationName?.toLowerCase().includes(query)) ||
        (t.fromBedNumber?.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(t => t.status === statusFilter);
    }

    return result;
  }, [allTransfers, searchQuery, statusFilter]);

  const handleAddToCart = (transfer: TransferHistoryRecord) => {
    const charge = calculateCharge(transfer.startAt, transfer.endAt, transfer.dailyRate);
    
    if (!charge) {
      toast({
        title: "Cannot add charge",
        description: "Unable to calculate charge for this transfer.",
        variant: "destructive"
      });
      return;
    }

    const duration = calculateDuration(transfer.startAt, transfer.endAt);
    const days = Math.ceil((new Date(transfer.endAt || new Date()).getTime() - new Date(transfer.startAt).getTime()) / (1000 * 60 * 60 * 24));

    const service: ServiceItem = {
      id: `room-bed-${transfer.id}`,
      code: transfer.chargeCode || `BED-${transfer.toBedNumber}`,
      name: `${transfer.toLocationName} - ${transfer.toBedNumber} (${Math.max(1, days)} ${days === 1 ? 'day' : 'days'})`,
      category: 'Room',
      subCategory: transfer.toLocationType === 'icu' ? 'ICU' : transfer.toLocationType === 'private' ? 'Private Room' : 'Ward',
      price: charge,
      taxPct: 12,
      description: `${format(new Date(transfer.startAt), 'dd MMM HH:mm')} → ${transfer.endAt ? format(new Date(transfer.endAt), 'dd MMM HH:mm') : 'Ongoing'} • ${formatPrice(transfer.dailyRate)}/day`
    };

    onAddToCart(service);

    toast({
      title: "Room/bed charge added to cart",
      description: `${transfer.toLocationName} - ${transfer.toBedNumber}`,
    });
  };

  const canAddToCart = (transfer: TransferHistoryRecord): boolean => {
    // Can add if we have start time and either end time or ongoing
    if (!transfer.startAt) return false;
    if (!transfer.dailyRate) return false;
    // Check for valid time range
    if (transfer.endAt && new Date(transfer.endAt) < new Date(transfer.startAt)) return false;
    return true;
  };

  return (
    <div className="flex flex-col h-full" data-testid="room-bed-table">
      {/* Filters Header */}
      <div className="p-4 border-b border-border bg-background space-y-3">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by location or bed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9">
              <Filter className="w-3.5 h-3.5 mr-2" />
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range - placeholder */}
          <Button variant="outline" size="sm" className="h-9" data-testid="room-bed-filter-date-range">
            <Clock className="w-3.5 h-3.5 mr-2" />
            Current Admission
          </Button>
        </div>

      </div>

      {/* Results count */}
      <div className="text-xs text-muted-foreground py-2 px-4 border-y border-border bg-muted/30">
        Showing <span className="font-medium text-foreground">{filteredTransfers.length}</span> of {allTransfers.length} transfers
      </div>

      {/* Table */}
      <ScrollArea className="flex-1">
        {filteredTransfers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-8">
            <BedDouble className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-foreground">No transfers yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Patient room/bed history will appear here
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>To Location</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Last Billed</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Charge</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.map((transfer, index) => {
                const inCart = isInCart(`room-bed-${transfer.id}`);
                const charge = calculateCharge(transfer.startAt, transfer.endAt, transfer.dailyRate);
                const duration = calculateDuration(transfer.startAt, transfer.endAt);
                const canAdd = canAddToCart(transfer);

                return (
                  <TableRow 
                    key={transfer.id}
                    className={cn(inCart && "bg-primary/5")}
                  >
                    {/* To Location with Bed below */}
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium">{transfer.toLocationName}</div>
                        <div className="text-xs text-muted-foreground">{transfer.toBedNumber}</div>
                      </div>
                    </TableCell>

                    {/* Start */}
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(transfer.startAt), 'dd-MMM-yyyy')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(transfer.startAt), 'HH:mm')}
                      </div>
                    </TableCell>

                    {/* End */}
                    <TableCell>
                      {transfer.endAt ? (
                        <>
                          <div className="text-sm">
                            {format(new Date(transfer.endAt), 'dd-MMM-yyyy')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(transfer.endAt), 'HH:mm')}
                          </div>
                        </>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                          Ongoing
                        </Badge>
                      )}
                    </TableCell>

                    {/* Last Billed */}
                    <TableCell>
                      {transfer.lastBilledAt ? (
                        <>
                          <div className="text-sm">
                            {format(new Date(transfer.lastBilledAt), 'dd-MMM-yyyy')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(transfer.lastBilledAt), 'HH:mm')}
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Duration */}
                    <TableCell>
                      <span className="text-sm font-medium">{duration}</span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {getStatusBadge(transfer.status)}
                    </TableCell>

                    {/* Charge */}
                    <TableCell className="text-right">
                      {charge !== null ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-sm font-semibold cursor-help">
                                {formatPrice(charge)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{formatPrice(transfer.dailyRate)}/day × {duration}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-muted-foreground cursor-help flex items-center justify-end gap-1">
                                <Info className="w-3 h-3" />
                                —
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Charge calculated at checkout</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </TableCell>

                    {/* Action */}
                    <TableCell className="text-center">
                      {inCart ? (
                        <Badge variant="secondary" className="text-xs">
                          In Cart
                        </Badge>
                      ) : canAdd ? (
                        <Button
                          size="sm"
                          className="h-8 gap-1"
                          onClick={() => handleAddToCart(transfer)}
                          data-testid={`room-bed-add-to-cart-${transfer.id}`}
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </Button>
                      ) : (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1"
                                disabled
                              >
                                <AlertTriangle className="w-3 h-3" />
                                Unavailable
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Missing rate or invalid time range</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </ScrollArea>
    </div>
  );
}
