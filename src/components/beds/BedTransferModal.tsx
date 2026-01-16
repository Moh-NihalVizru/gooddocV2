import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, User } from 'lucide-react';
import { TransferDateTimePicker } from '@/components/transfer/TransferDateTimePicker';
import { BedMapItem } from '@/data/bed-map.mock';
import { reasonLabels } from '@/data/transfer.mock';
import { toast } from 'sonner';

interface BedTransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBed?: BedMapItem;
}

// Mock IP patients list
const mockIPPatients = [
  { id: 'MRN0100001', gdid: '001', name: 'Harish Kalyan', age: 44, gender: 'Male', ward: 'Ward A', room: 'Room 102', bed: 'WA-102-1', tariff: 3500 },
  { id: 'MRN0100002', gdid: '002', name: 'Priya Sharma', age: 32, gender: 'Female', ward: 'Ward B', room: 'Room 201', bed: 'WB-201-2', tariff: 3000 },
  { id: 'MRN0100003', gdid: '003', name: 'Rajesh Kumar', age: 56, gender: 'Male', ward: 'ICU', room: 'ICU Bay 1', bed: 'IC-02', tariff: 15000 },
  { id: 'MRN0100004', gdid: '004', name: 'Anjali Menon', age: 28, gender: 'Female', ward: 'Step-Down Unit', room: 'SD Bay 1', bed: 'SD-02', tariff: 8000 },
  { id: 'MRN0100005', gdid: '005', name: 'Suresh Nair', age: 61, gender: 'Male', ward: 'Private Wing', room: 'Suite 402', bed: 'PW-402', tariff: 12000 },
  { id: 'MRN0100006', gdid: '006', name: 'Lakshmi Devi', age: 72, gender: 'Female', ward: 'Ward A', room: 'Room 105', bed: 'WA-105-2', tariff: 3500 },
  { id: 'MRN0100007', gdid: '007', name: 'Vikram Singh', age: 38, gender: 'Male', ward: 'Ward B', room: 'Room 203', bed: 'WB-203-1', tariff: 3000 },
  { id: 'MRN0100008', gdid: '008', name: 'Meena Kumari', age: 55, gender: 'Female', ward: 'ICU', room: 'ICU Bay 2', bed: 'IC-04', tariff: 15000 },
  { id: 'MRN0100009', gdid: '009', name: 'Arjun Reddy', age: 29, gender: 'Male', ward: 'Emergency', room: 'ER Bay 3', bed: 'ER-06', tariff: 2500 },
  { id: 'MRN0100010', gdid: '010', name: 'Kavitha Rao', age: 48, gender: 'Female', ward: 'Private Wing', room: 'Suite 405', bed: 'PW-405', tariff: 12000 },
  { id: 'MRN0100011', gdid: '011', name: 'Mohammed Ali', age: 65, gender: 'Male', ward: 'Ward A', room: 'Room 108', bed: 'WA-108-1', tariff: 3500 },
  { id: 'MRN0100012', gdid: '012', name: 'Sunita Patel', age: 41, gender: 'Female', ward: 'Step-Down Unit', room: 'SD Bay 2', bed: 'SD-04', tariff: 8000 },
];

export function BedTransferModal({ open, onOpenChange, selectedBed }: BedTransferModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<typeof mockIPPatients[0] | null>(null);
  const [reason, setReason] = useState<string>('');
  const [transferDateTime, setTransferDateTime] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setSelectedPatient(null);
      setReason('');
      setNotes('');
      setTransferDateTime(new Date());
    }
  }, [open]);

  // Filter patients based on search (show all if no search query)
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return mockIPPatients;
    const query = searchQuery.toLowerCase();
    return mockIPPatients.filter(
      p => p.name.toLowerCase().includes(query) || 
           p.gdid.includes(query) || 
           p.id.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handlePatientSelect = (patient: typeof mockIPPatients[0]) => {
    setSelectedPatient(patient);
    setSearchQuery('');
  };

  const handleConfirm = () => {
    if (!selectedPatient) {
      toast.error('Please select a patient');
      return;
    }
    if (!selectedBed) {
      toast.error('No destination bed selected');
      return;
    }
    if (!reason) {
      toast.error('Please select a reason for transfer');
      return;
    }

    toast.success(`Transfer initiated for ${selectedPatient.name} to ${selectedBed.bedNumber}`);
    
    // Reset and close
    setSelectedPatient(null);
    setReason('');
    setNotes('');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedPatient(null);
    setSearchQuery('');
    setReason('');
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Bed Transfer</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Patient Search */}
          {!selectedPatient ? (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Search IP Patient</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, GDID, or MRN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              {/* Patient List */}
              <div className="border rounded-lg divide-y max-h-64 overflow-y-auto bg-card">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => handlePatientSelect(patient)}
                      className="w-full p-3 text-left hover:bg-muted/50 transition-colors flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{patient.name}</div>
                        <div className="text-xs text-muted-foreground">
                          GDID–{patient.gdid} • {patient.age}y • {patient.gender}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                        {patient.ward} • {patient.bed}
                      </Badge>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No patients found
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Transfer Location */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">Transfer Location</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* From */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">From</Label>
                    <div className="p-3 bg-muted/50 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{selectedPatient.name}</div>
                          <div className="text-xs text-muted-foreground">GDID–{selectedPatient.gdid}</div>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="font-medium">{selectedPatient.ward}</div>
                        <div className="text-muted-foreground">{selectedPatient.room}</div>
                        <div className="text-muted-foreground">{selectedPatient.bed}</div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Tariff: ₹{selectedPatient.tariff.toLocaleString('en-IN')}/day
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 h-7 text-xs text-primary p-0"
                        onClick={() => setSelectedPatient(null)}
                      >
                        Change patient
                      </Button>
                    </div>
                  </div>

                  {/* To - Pre-filled from selectedBed */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">To</Label>
                    {selectedBed ? (
                      <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="space-y-1 text-sm">
                          <div className="font-medium">{selectedBed.wardName}</div>
                          <div className="text-muted-foreground">{selectedBed.roomNumber}</div>
                          <div className="text-muted-foreground">{selectedBed.bedNumber}</div>
                          <div className="text-xs text-muted-foreground mt-2">
                            Tariff: ₹{selectedBed.pricePerDay.toLocaleString('en-IN')}/day
                          </div>
                        </div>
                        <Badge variant="secondary" className="mt-2 text-xs bg-emerald-50 text-emerald-700">
                          {selectedBed.type}
                        </Badge>
                      </div>
                    ) : (
                      <div className="p-3 bg-muted/30 rounded-lg border border-dashed">
                        <div className="text-sm text-muted-foreground">No bed selected</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Transfer Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">Transfer Details</h3>
                
                {/* Ordering Clinician - Read only for now */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Ordering Clinician</Label>
                  <div className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg border">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Dr. Meera Nair</div>
                      <div className="text-xs text-muted-foreground">Internal Medicine</div>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Reason for Transfer</Label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {Object.entries(reasonLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date & Time */}
                <TransferDateTimePicker
                  value={transferDateTime}
                  onChange={setTransferDateTime}
                  label="Transfer Date & Time"
                />

                {/* Notes */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Additional Notes</Label>
                  <Textarea
                    placeholder="Add any additional notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="resize-none h-20"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedPatient || !selectedBed}>
            Confirm Transfer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
