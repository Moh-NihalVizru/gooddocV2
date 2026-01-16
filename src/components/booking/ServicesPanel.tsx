import { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ServiceItem, CartItem, ServiceCategory } from "@/types/booking/ipAdmission";
import { searchServices } from "@/data/services.mock";
import { ServiceRow } from "./ServiceRow";
import { CartItemInline } from "./CartItemInline";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDebounce } from "@/hooks/useDebounce";

interface ServicesPanelProps {
  cart: CartItem[];
  onAddToCart: (service: ServiceItem) => void;
  onUpdateQty: (itemId: string, qty: number) => void;
  onUpdateDiscount: (itemId: string, discountPct: number) => void;
  onRemoveFromCart: (itemId: string) => void;
}

const CATEGORIES: ServiceCategory[] = ['Procedure', 'Nursing', 'Pharmacy', 'Lab', 'Room'];

export function ServicesPanel({
  cart,
  onAddToCart,
  onUpdateQty,
  onUpdateDiscount,
  onRemoveFromCart,
}: ServicesPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  const results = useMemo(() => 
    searchServices(debouncedSearch, selectedCategories),
    [debouncedSearch, selectedCategories]
  );
  
  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }, []);
  
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search services/procedures by name or code…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      
      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <Badge
            key={category}
            variant={selectedCategories.includes(category) ? "default" : "outline"}
            className="cursor-pointer transition-colors"
            onClick={() => toggleCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>
      
      {/* Results */}
      <div className="border rounded-lg">
        <ScrollArea className="h-[450px]">
          {results.length === 0 ? (
            <div className="flex items-center justify-center h-[450px] text-sm text-muted-foreground">
              No services found
            </div>
          ) : (
            <div className="divide-y">
              {results.map((service) => (
                <ServiceRow
                  key={service.id}
                  service={service}
                  onAdd={onAddToCart}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
