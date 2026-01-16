import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PatientSearchFormProps {
  onSearch: (searchType: string, searchValue: string) => void;
}

export function PatientSearchForm({ onSearch }: PatientSearchFormProps) {
  const [searchType, setSearchType] = useState("mobile");
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = () => {
    if (searchValue.trim()) {
      onSearch(searchType, searchValue);
    }
  };

  const getInputLabel = () => {
    switch (searchType) {
      case "mobile":
        return "Mobile number";
      case "name":
        return "Patient Name";
      case "gdid":
        return "GDID";
      default:
        return "Search";
    }
  };

  const getPlaceholder = () => {
    switch (searchType) {
      case "mobile":
        return "Enter mobile number";
      case "name":
        return "Enter patient name";
      case "gdid":
        return "Enter GDID";
      default:
        return "Enter search term";
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-primary">Search Patient</h2>
        
        <div className="flex items-center gap-4">
          <Label className="text-sm text-muted-foreground">Search by</Label>
          <RadioGroup value={searchType} onValueChange={setSearchType} className="flex gap-6">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mobile" id="mobile" />
              <Label htmlFor="mobile" className="text-sm cursor-pointer">
                Mobile Number
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="name" id="name" />
              <Label htmlFor="name" className="text-sm cursor-pointer">
                Patient Name
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="gdid" id="gdid" />
              <Label htmlFor="gdid" className="text-sm cursor-pointer">
                GDID
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
      
      <div className="space-y-4">

        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="search-input" className="text-sm text-muted-foreground mb-2 block">
              {getInputLabel()}
            </Label>
            <Input
              id="search-input"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={getPlaceholder()}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleSearch} className="gap-2">
              <Search className="w-4 h-4" />
              Find Patient
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
