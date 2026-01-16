import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Download, 
  Upload, 
  Printer, 
  Search,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Edit,
  Copy,
  Trash2,
  Eye,
  MoreVertical,
  Tag,
  X,
} from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { PageContent } from "@/components/PageContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { MOCK_PRICING_ITEMS } from "@/data/pricing-catalog.mock";
import { PricingItem, PricingCategory, PricingStatus } from "@/types/pricing-catalog";
import { formatINR } from "@/utils/currency";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";

const PricingCatalog = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<PricingCategory | "All">("All");
  const [statusFilter, setStatusFilter] = useState<PricingStatus | "All">("All");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("name");
  const [viewItem, setViewItem] = useState<PricingItem | null>(null);
  const [items, setItems] = useState<PricingItem[]>(MOCK_PRICING_ITEMS);

  const handleViewDetails = (item: PricingItem) => {
    setViewItem(item);
  };

  const handleEdit = (item: PricingItem) => {
    navigate(`/pricing-catalog/new`, { state: { editItem: item } });
  };

  const handleDuplicate = (item: PricingItem) => {
    const duplicatedItem: PricingItem = {
      ...item,
      id: `${item.id}-copy-${Date.now()}`,
      name: `${item.name} (Copy)`,
      codes: {
        ...item.codes,
        internal: `${item.codes.internal}-COPY`,
      },
      status: "Draft" as PricingStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setItems((prev) => [duplicatedItem, ...prev]);
    toast.success(`"${item.name}" duplicated successfully`);
  };

  const handleDelete = (item: PricingItem) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    toast.success(`"${item.name}" deleted successfully`);
  };

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let filtered = [...items];

    // Search filter
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.codes.internal.toLowerCase().includes(query) ||
          item.department.toLowerCase().includes(query) ||
          item.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (categoryFilter !== "All") {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "category":
          return a.category.localeCompare(b.category);
        case "price-asc":
          return a.pricing.netPrice - b.pricing.netPrice;
        case "price-desc":
          return b.pricing.netPrice - a.pricing.netPrice;
        case "updated":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [items, debouncedSearch, categoryFilter, statusFilter, sortBy]);

  const toggleItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const toggleAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map((item) => item.id));
    }
  };

  const getStatusColor = (status: PricingStatus) => {
    switch (status) {
      case "Published":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Draft":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "Archived":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default:
        return "";
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <PageContent>
        <AppHeader breadcrumbs={["Pricing Catalog"]} />

        <main className="p-6">
          {/* Header */}
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-foreground">Pricing Catalog</h1>
              <div className="flex gap-3">
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button onClick={() => navigate("/pricing-catalog/new")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>
          </Card>

          {/* Filters Bar */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, code, or tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Category Filter */}
              <Select
                value={categoryFilter}
                onValueChange={(value) => setCategoryFilter(value as PricingCategory | "All")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="Lab Test">Lab Test</SelectItem>
                  <SelectItem value="Doctor Fee">Doctor Fee</SelectItem>
                  <SelectItem value="Procedure">Procedure</SelectItem>
                  <SelectItem value="Imaging">Imaging</SelectItem>
                  <SelectItem value="Room">Room</SelectItem>
                  <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="Package">Package</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as PricingStatus | "All")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {selectedItems.length > 0 && (
                <>
                  <span className="text-primary font-medium">
                    {selectedItems.length} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs ml-2"
                  >
                    Bulk Update
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Table */}
          {filteredItems.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                <h3 className="text-lg font-semibold mb-2">No items found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery || categoryFilter !== "All" || statusFilter !== "All"
                    ? "Try adjusting your filters"
                    : "Get started by adding your first pricing item"}
                </p>
                {!searchQuery && categoryFilter === "All" && statusFilter === "All" && (
                  <Button className="gap-2" onClick={() => navigate("/pricing-catalog/new")}>
                    <Plus className="h-4 w-4" />
                    Add First Item
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left text-xs font-medium text-muted-foreground p-3 uppercase">
                        ITEM NAME
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground p-3 uppercase">
                        CATEGORY
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground p-3 uppercase">
                        DEPARTMENT
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground p-3 uppercase">
                        CODE
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground p-3 uppercase">
                        UNIT
                      </th>
                      <th className="text-right text-xs font-medium text-muted-foreground p-3 uppercase">
                        BASE PRICE
                      </th>
                      <th className="text-right text-xs font-medium text-muted-foreground p-3 uppercase">
                        NET PRICE
                      </th>
                      <th className="text-center text-xs font-medium text-muted-foreground p-3 uppercase">
                        STATUS
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground p-3 uppercase">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="border-t hover:bg-muted/20 transition-colors">
                        <td className="p-3">
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {item.description}
                          </div>
                        </td>
                        <td className="p-3 text-sm">{item.category}</td>
                        <td className="p-3 text-sm">{item.department}</td>
                        <td className="p-3">
                          <div className="text-sm font-mono">{item.codes.internal}</div>
                          {item.codes.cpt && (
                            <div className="text-xs text-muted-foreground">
                              CPT: {item.codes.cpt}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-sm capitalize">{item.unit}</td>
                        <td className="p-3 text-right text-sm font-medium">
                          {formatINR(item.pricing.basePrice)}
                        </td>
                        <td className="p-3 text-right text-sm font-semibold">
                          {formatINR(item.pricing.netPrice)}
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="outline" className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-background z-50">
                              <DropdownMenuItem 
                                className="gap-2 cursor-pointer"
                                onClick={() => handleViewDetails(item)}
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="gap-2 cursor-pointer"
                                onClick={() => handleEdit(item)}
                              >
                                <Edit className="h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="gap-2 cursor-pointer"
                                onClick={() => handleDuplicate(item)}
                              >
                                <Copy className="h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="gap-2 text-destructive cursor-pointer"
                                onClick={() => handleDelete(item)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </main>

        {/* View Details Dialog */}
        <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {viewItem?.name}
                {viewItem && (
                  <Badge variant="outline" className={getStatusColor(viewItem.status)}>
                    {viewItem.status}
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            
            {viewItem && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="text-sm font-medium">{viewItem.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Department</p>
                    <p className="text-sm font-medium">{viewItem.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Unit</p>
                    <p className="text-sm font-medium capitalize">{viewItem.unit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Availability</p>
                    <p className="text-sm font-medium">{viewItem.availability}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{viewItem.description}</p>
                </div>

                {/* Codes */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Codes</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="font-mono">
                      Internal: {viewItem.codes.internal}
                    </Badge>
                    {viewItem.codes.cpt && (
                      <Badge variant="secondary" className="font-mono">
                        CPT: {viewItem.codes.cpt}
                      </Badge>
                    )}
                    {viewItem.codes.icd && (
                      <Badge variant="secondary" className="font-mono">
                        ICD: {viewItem.codes.icd}
                      </Badge>
                    )}
                    {viewItem.codes.hcpcs && (
                      <Badge variant="secondary" className="font-mono">
                        HCPCS: {viewItem.codes.hcpcs}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Pricing Details</p>
                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">Cost</p>
                      <p className="text-sm font-medium">{formatINR(viewItem.pricing.cost)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Base Price</p>
                      <p className="text-sm font-medium">{formatINR(viewItem.pricing.basePrice)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Net Price</p>
                      <p className="text-sm font-semibold text-primary">{formatINR(viewItem.pricing.netPrice)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Markup</p>
                      <p className="text-sm font-medium">{viewItem.pricing.markupPct}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Discount</p>
                      <p className="text-sm font-medium">{viewItem.pricing.discountPct}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tax</p>
                      <p className="text-sm font-medium">{viewItem.pricing.taxPct}%</p>
                    </div>
                  </div>
                </div>

                {/* Tier Pricing */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Tier Pricing</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 border rounded-lg">
                      <p className="text-xs text-muted-foreground">Cash</p>
                      <p className="text-sm font-semibold">{formatINR(viewItem.pricing.tiers.cash)}</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-xs text-muted-foreground">Insurance</p>
                      <p className="text-sm font-semibold">{formatINR(viewItem.pricing.tiers.insurance)}</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-xs text-muted-foreground">Corporate</p>
                      <p className="text-sm font-semibold">{formatINR(viewItem.pricing.tiers.corporate)}</p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {viewItem.tags.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {viewItem.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setViewItem(null)}>
                    Close
                  </Button>
                  <Button onClick={() => {
                    setViewItem(null);
                    handleEdit(viewItem);
                  }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Item
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </PageContent>
    </div>
  );
};

export default PricingCatalog;
