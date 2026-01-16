import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Search, User, UserRound } from "lucide-react";
import { useState } from "react";

interface ClaimStepPatientPolicyProps {
  data: any;
  onChange: (data: any) => void;
  errors: string[];
}

export function ClaimStepPatientPolicy({ data, onChange, errors }: ClaimStepPatientPolicyProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Mock patient data
  const mockPatients = [
    { id: "p1", name: "Harish Kalyan", age: 44, gender: "M", mrn: "GDID-001", phone: "+91 98765 43210" },
    { id: "p2", name: "Priya Shah", age: 32, gender: "F", mrn: "GDID-002", phone: "+91 98765 43211" },
    { id: "p3", name: "Rajesh Kumar", age: 56, gender: "M", mrn: "GDID-003", phone: "+91 98765 43212" },
  ];

  const filteredPatients = searchQuery.length >= 2
    ? mockPatients.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.mrn.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectPatient = (patient: typeof mockPatients[0]) => {
    onChange({
      ...data,
      patient: {
        id: patient.id,
        name: patient.name,
        phone: patient.phone
      }
    });
    setSearchQuery(patient.name);
    setIsSearchOpen(false);
  };

  const handleAddNewPatient = () => {
    // For now, use the search query as name
    onChange({
      ...data,
      patient: {
        id: "new-" + Date.now(),
        name: searchQuery,
        phone: ""
      }
    });
    setIsSearchOpen(false);
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-6">Patient & Policy Information</h2>
      
      <div className="space-y-6">
        {/* Patient Search */}
        <div>
          <Label htmlFor="patient">Patient *</Label>
          <div className="flex gap-2 mt-2">
            <Popover open={isSearchOpen && searchQuery.length >= 2} onOpenChange={setIsSearchOpen}>
              <PopoverTrigger asChild>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="patient"
                    placeholder="Search patient by name or ID (min 2 chars)"
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearchOpen(e.target.value.length >= 2);
                    }}
                    onFocus={() => setIsSearchOpen(searchQuery.length >= 2)}
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <div className="max-h-[300px] overflow-y-auto">
                  {filteredPatients.length > 0 ? (
                    <>
                      {filteredPatients.map((patient) => (
                        <button
                          key={patient.id}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                          onClick={() => handleSelectPatient(patient)}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            patient.gender.toLowerCase().startsWith('f') 
                              ? 'bg-pink-500' 
                              : 'bg-primary'
                          }`}>
                            {patient.gender.toLowerCase().startsWith('f') ? (
                              <UserRound className="h-5 w-5 text-primary-foreground" />
                            ) : (
                              <User className="h-5 w-5 text-primary-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {patient.mrn} • {patient.age} | {patient.gender}
                            </div>
                          </div>
                        </button>
                      ))}
                      <div className="border-t border-border">
                        <button
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                          onClick={handleAddNewPatient}
                        >
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                            <Plus className="h-5 w-5 text-primary-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">Add new patient</div>
                            <div className="text-sm text-muted-foreground">
                              Create "{searchQuery}"
                            </div>
                          </div>
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                      onClick={handleAddNewPatient}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <Plus className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Add new patient</div>
                        <div className="text-sm text-muted-foreground">
                          Create "{searchQuery}"
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="icon" onClick={handleAddNewPatient}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {data.patient && (
            <div className="mt-2 p-3 bg-muted rounded-md">
              <div className="font-medium">{data.patient.name}</div>
              <div className="text-sm text-muted-foreground">{data.patient.phone}</div>
            </div>
          )}
        </div>

        {/* Claim Type */}
        <div>
          <Label htmlFor="claimType">Claim Type *</Label>
          <Select
            value={data.claimType}
            onValueChange={(value) => onChange({ ...data, claimType: value })}
          >
            <SelectTrigger id="claimType" className="mt-2">
              <SelectValue placeholder="Select claim type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cashless">Cashless</SelectItem>
              <SelectItem value="Reimbursement">Reimbursement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Policy Selector */}
        <div>
          <Label htmlFor="policy">Policy Number</Label>
          <div className="flex gap-2 mt-2">
            <Select
              value={data.policy?.policyNo}
              onValueChange={(value) => {
                // Mock policy data
                onChange({
                  ...data,
                  policy: {
                    policyNo: value,
                    subscriberName: data.patient?.name || "",
                    relationship: "Self",
                    network: "In-Network",
                    validFrom: "2025-01-01",
                    validTo: "2025-12-31"
                  },
                  payer: {
                    id: "payer1",
                    name: "Star Health Insurance"
                  }
                });
              }}
            >
              <SelectTrigger id="policy" className="flex-1">
                <SelectValue placeholder="Select policy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SH-1234567890">SH-1234567890 - Star Health</SelectItem>
                <SelectItem value="HDFC-99887766">HDFC-99887766 - HDFC ERGO</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {data.policy && (
            <div className="mt-2 p-3 bg-muted rounded-md space-y-1">
              <div className="font-medium">{data.policy.policyNo}</div>
              <div className="text-sm text-muted-foreground">
                Valid: {new Date(data.policy.validFrom).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} - {new Date(data.policy.validTo).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
              <div className="text-sm text-muted-foreground">Network: {data.policy.network}</div>
            </div>
          )}
        </div>

        {/* Payer (if no policy) */}
        {!data.policy && (
          <div>
            <Label htmlFor="payer">Payer/Insurer *</Label>
            <Select
              value={data.payer?.id}
              onValueChange={(value) => {
                onChange({
                  ...data,
                  payer: {
                    id: value,
                    name: value === "payer1" ? "Star Health Insurance" : "HDFC ERGO"
                  }
                });
              }}
            >
              <SelectTrigger id="payer" className="mt-2">
                <SelectValue placeholder="Select payer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payer1">Star Health Insurance</SelectItem>
                <SelectItem value="payer2">HDFC ERGO</SelectItem>
                <SelectItem value="payer3">MediAssist TPA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </Card>
  );
}
