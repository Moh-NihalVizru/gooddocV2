import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ClaimStatus, ServiceType } from "@/types/insurance";

interface ClaimFiltersProps {
  onSearchChange: (search: string) => void;
  onStatusChange: (status: ClaimStatus | "All") => void;
  onServiceTypeChange: (serviceType: ServiceType | "All") => void;
  onClearFilters: () => void;
}

export function ClaimFilters({
  onSearchChange,
  onStatusChange,
  onServiceTypeChange,
  onClearFilters,
}: ClaimFiltersProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ClaimStatus | "All">("All");
  const [serviceType, setServiceType] = useState<ServiceType | "All">("All");

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange(value);
  };

  const handleStatusChange = (value: ClaimStatus | "All") => {
    setStatus(value);
    onStatusChange(value);
  };

  const handleServiceTypeChange = (value: ServiceType | "All") => {
    setServiceType(value);
    onServiceTypeChange(value);
  };

  const handleClear = () => {
    setSearch("");
    setStatus("All");
    setServiceType("All");
    onClearFilters();
  };

  const hasActiveFilters = search || status !== "All" || serviceType !== "All";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by claim no, patient, or policy..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Submitted">Submitted</SelectItem>
            <SelectItem value="In Review">In Review</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Partially Paid">Partially Paid</SelectItem>
            <SelectItem value="Denied">Denied</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
            <SelectItem value="Needs Info">Needs Info</SelectItem>
          </SelectContent>
        </Select>

        <Select value={serviceType} onValueChange={handleServiceTypeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Service Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Services</SelectItem>
            <SelectItem value="Consultation">Consultation</SelectItem>
            <SelectItem value="Laboratory">Laboratory</SelectItem>
            <SelectItem value="Imaging">Imaging</SelectItem>
            <SelectItem value="Procedure">Procedure</SelectItem>
            <SelectItem value="Pharmacy">Pharmacy</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Quick Status Filters */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Quick filter:</span>
        <Badge
          variant={status === "All" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => handleStatusChange("All")}
        >
          All
        </Badge>
        <Badge
          variant={status === "Draft" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => handleStatusChange("Draft")}
        >
          Draft
        </Badge>
        <Badge
          variant={status === "In Review" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => handleStatusChange("In Review")}
        >
          In Review
        </Badge>
        <Badge
          variant={status === "Paid" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => handleStatusChange("Paid")}
        >
          Paid
        </Badge>
        <Badge
          variant={status === "Denied" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => handleStatusChange("Denied")}
        >
          Denied
        </Badge>
      </div>
    </div>
  );
}
