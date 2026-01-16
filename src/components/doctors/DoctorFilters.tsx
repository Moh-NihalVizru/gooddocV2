import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Search } from "lucide-react";

interface DoctorFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function DoctorFilters({ 
  search, 
  onSearchChange
}: DoctorFiltersProps) {
  const [filters, setFilters] = useState<string[]>([]);

  const addFilter = (filter: string) => {
    if (!filters.includes(filter)) {
      setFilters([...filters, filter]);
    }
  };

  const removeFilter = (filter: string) => {
    setFilters(filters.filter(f => f !== filter));
  };

  const clearAllFilters = () => {
    setFilters([]);
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
      <Select onValueChange={(val) => addFilter(`Department: ${val}`)}>
        <SelectTrigger className="w-[120px] h-9 text-xs">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent className="bg-popover z-50">
          <SelectItem value="cardiology">Cardiology</SelectItem>
          <SelectItem value="endocrinology">Endocrinology</SelectItem>
          <SelectItem value="orthopedics">Orthopedics</SelectItem>
          <SelectItem value="neurology">Neurology</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={(val) => addFilter(`Specialty: ${val}`)}>
        <SelectTrigger className="w-[120px] h-9 text-xs">
          <SelectValue placeholder="Specialty" />
        </SelectTrigger>
        <SelectContent className="bg-popover z-50">
          <SelectItem value="interventional">Interventional Cardiology</SelectItem>
          <SelectItem value="diabetes">Diabetes & Metabolism</SelectItem>
          <SelectItem value="joint">Joint Replacement</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={(val) => addFilter(`Availability: ${val}`)}>
        <SelectTrigger className="w-[110px] h-9 text-xs">
          <SelectValue placeholder="Availability" />
        </SelectTrigger>
        <SelectContent className="bg-popover z-50">
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="next-3-days">Next 3 days</SelectItem>
          <SelectItem value="on-leave">On leave</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={(val) => addFilter(`Status: ${val}`)}>
        <SelectTrigger className="w-[100px] h-9 text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent className="bg-popover z-50">
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
        </SelectContent>
        </Select>

        {/* Applied Filters as badges */}
        {filters.length > 0 && (
          <>
            {filters.map((filter, i) => (
              <Badge key={i} variant="secondary" className="gap-1 pr-1 h-9 px-3">
                {filter}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removeFilter(filter)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-9 text-xs"
            >
              Clear
            </Button>
          </>
        )}
      </div>

      {/* Search bar - Right side */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search doctors..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 w-[200px] pl-9 text-sm"
        />
      </div>
    </div>
  );
}
