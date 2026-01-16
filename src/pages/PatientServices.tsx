import { useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { 
  ChevronLeft, Search, Plus, Minus, Trash2, Receipt, User, 
  Stethoscope, FlaskConical, ScanLine, Pill, HeartPulse, BedDouble, 
  UserRound, Package, Clock, FileText, AlertCircle, CheckCircle2,
  ClipboardList, Square, CheckSquare, ShoppingCart, ArrowRightLeft, CalendarDays
} from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { PageContent } from "@/components/PageContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useServicesCart } from "@/hooks/useServicesCart";
import { searchServices, SERVICE_CATEGORIES, getSubCategories, getServicesByCategory } from "@/data/services.mock";
import { getPendingServicesForPatient, PendingService } from "@/data/pending-services.mock";
import { getPendingBedChargesForPatient } from "@/data/pending-bed-charges.mock";
import { getTransferHistoryForPatient } from "@/data/transfer-history.mock";
import { BedChargePending } from "@/types/bed-charge";
import { ServiceCategory, ServiceItem } from "@/types/booking/ipAdmission";
import { useDebounce } from "@/hooks/useDebounce";
import { RoomBedTab } from "@/components/services/RoomBedTab";
import { cn } from "@/lib/utils";
import { format, setHours, setMinutes } from "date-fns";

const formatPrice = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Procedure': return Stethoscope;
    case 'Lab': return FlaskConical;
    case 'Radiology': return ScanLine;
    case 'Pharmacy': return Pill;
    case 'Nursing': return HeartPulse;
    case 'Room': return BedDouble;
    case 'Consultation': return UserRound;
    default: return Package;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Procedure': return 'bg-blue-500/10 text-blue-600 border-blue-200';
    case 'Lab': return 'bg-purple-500/10 text-purple-600 border-purple-200';
    case 'Radiology': return 'bg-amber-500/10 text-amber-600 border-amber-200';
    case 'Pharmacy': return 'bg-green-500/10 text-green-600 border-green-200';
    case 'Nursing': return 'bg-pink-500/10 text-pink-600 border-pink-200';
    case 'Room': return 'bg-cyan-500/10 text-cyan-600 border-cyan-200';
    case 'Consultation': return 'bg-indigo-500/10 text-indigo-600 border-indigo-200';
    default: return 'bg-muted text-muted-foreground';
  }
};

type ViewMode = 'pending' | 'catalog';

const PatientServices = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromPage = searchParams.get("from");
  
  const [viewMode, setViewMode] = useState<ViewMode>('catalog');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");
  const [selectedPendingIds, setSelectedPendingIds] = useState<Set<string>>(new Set());
  const [isGeneratingBill, setIsGeneratingBill] = useState(false);
  const { cart, totals, globalDiscountAmt, addToCart, updateQty, updateDiscount, updateAddedAt, removeFromCart, updateGlobalDiscount } = useServicesCart();
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Mock patient data
  const patient = {
    name: "Harish Kalyan",
    gdid: "GDID-001",
    age: 44,
    gender: "Male",
    admissionDate: "18 Dec 2025",
    ward: "Cardiology Ward",
    bed: "Bed 12A",
    doctor: "Dr. Arun Kumar",
  };

  // Get pending services and bed charges
  const pendingServices = useMemo(() => {
    return getPendingServicesForPatient(patientId || '');
  }, [patientId]);

  // Get pending bed charges from transfers
  const pendingBedCharges = useMemo(() => {
    return getPendingBedChargesForPatient(patientId || '');
  }, [patientId]);

  // Combined pending items count
  const totalPendingCount = pendingServices.length + pendingBedCharges.length;

  // Get transfer count for Room category
  const transferHistory = useMemo(() => {
    return getTransferHistoryForPatient(patientId || '');
  }, [patientId]);
  const transferCount = transferHistory.length;
  const subCategories = useMemo(() => {
    if (selectedCategory === "all") return [];
    return getSubCategories(selectedCategory);
  }, [selectedCategory]);
  
  const results = useMemo(() => {
    const categoryFilter = selectedCategory === "all" ? [] : [selectedCategory];
    let filtered = searchServices(debouncedSearch, categoryFilter);
    
    if (selectedSubCategory !== "all" && selectedSubCategory) {
      filtered = filtered.filter(s => s.subCategory === selectedSubCategory);
    }
    
    return filtered;
  }, [debouncedSearch, selectedCategory, selectedSubCategory]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubCategory("all");
  };

  const handleGenerateBill = async () => {
    setIsGeneratingBill(true);
    console.log("Generate bill for:", cart);
    // Simulate bill generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsGeneratingBill(false);
    navigate(`/patient-insights/${patientId}?tab=collect-payment`);
  };

  const handleBack = () => {
    navigate(`/patient-insights/${patientId}${fromPage ? `?from=${fromPage}` : ''}`);
  };

  const isInCart = (serviceId: string) => cart.some(item => item.itemId === serviceId);
  const getCartItem = (serviceId: string) => cart.find(item => item.itemId === serviceId);

  // Pending services selection handlers
  const togglePendingSelection = (id: string) => {
    setSelectedPendingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllPending = () => {
    const allIds = [
      ...pendingServices.map(s => s.id),
      ...pendingBedCharges.map(bc => bc.id)
    ];
    if (selectedPendingIds.size === allIds.length) {
      setSelectedPendingIds(new Set());
    } else {
      setSelectedPendingIds(new Set(allIds));
    }
  };

  const addSelectedToCart = () => {
    // Add pending services
    pendingServices
      .filter(ps => selectedPendingIds.has(ps.id))
      .forEach(ps => {
        // Add with quantity from pending service
        for (let i = 0; i < ps.quantity; i++) {
          if (!isInCart(ps.service.id) || i > 0) {
            addToCart(ps.service);
          } else {
            const cartItem = getCartItem(ps.service.id);
            if (cartItem) {
              updateQty(cartItem.itemId, cartItem.qty + 1);
            }
          }
        }
      });
    
    // Add bed charges as Room services
    pendingBedCharges
      .filter(bc => selectedPendingIds.has(bc.id))
      .forEach(bc => {
        const bedService: ServiceItem = {
          id: bc.id,
          code: `BED-${bc.fromBedName}`,
          name: `Bed Charges - ${bc.fromBedName} (${bc.daysStayed} days)`,
          category: 'Room',
          subCategory: 'Bed Transfer',
          price: bc.totalAmount,
          taxPct: bc.taxPct,
          description: `${bc.fromUnitName} • ${bc.fromRoomName} • ₹${bc.fromTariff.toLocaleString('en-IN')}/day × ${bc.daysStayed} days`,
        };
        addToCart(bedService);
      });
    
    setSelectedPendingIds(new Set());
  };

  const allSelected = totalPendingCount > 0 && selectedPendingIds.size === totalPendingCount;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar />
      
      <PageContent className="flex flex-col overflow-hidden">
        <AppHeader breadcrumbs={["Patient Services", "Add Services"]} />
        
        {/* Compact Header */}
        <div className="h-[72px] bg-background border-b border-border flex-shrink-0 flex items-center px-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="font-semibold">Back to Patient</span>
          </button>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - View Mode & Category Sidebar */}
          <div className="w-[220px] border-r border-border bg-muted/30 flex flex-col">
            {/* View Mode Toggle */}
            <div className="px-3 py-2 border-b border-border flex flex-col gap-1">
              <div className="flex gap-1 bg-muted rounded-lg p-1 w-full">
                <button
                  onClick={() => setViewMode('catalog')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium transition-colors",
                    viewMode === 'catalog'
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Package className="w-3.5 h-3.5" />
                  Catalog
                </button>
                <button
                  onClick={() => setViewMode('pending')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium transition-colors",
                    viewMode === 'pending'
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  Pending
                  {totalPendingCount > 0 && (
                    <Badge variant="destructive" className="h-4 px-1 text-[10px]">
                      {totalPendingCount}
                    </Badge>
                  )}
                </button>
              </div>
            </div>

            {viewMode === 'catalog' && (
              <>
                <div className="p-3 border-b border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categories</p>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => handleCategoryChange("all")}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        selectedCategory === "all" 
                          ? "bg-primary text-primary-foreground" 
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <Package className="w-4 h-4" />
                      All Services
                    </button>
                    {SERVICE_CATEGORIES
                      .filter((cat) => !['Lab', 'Radiology', 'Pharmacy'].includes(cat.id))
                      .map((cat) => {
                      const Icon = getCategoryIcon(cat.id);
                      // For Room category, show transfer count in red; otherwise show service count
                      const isRoom = cat.id === 'Room';
                      const count = isRoom ? transferCount : getServicesByCategory(cat.id).length;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryChange(cat.id)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            selectedCategory === cat.id 
                              ? "bg-primary text-primary-foreground" 
                              : "text-foreground hover:bg-muted"
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="flex-1 text-left">{cat.name}</span>
                          <span className={cn(
                            "text-xs px-1.5 py-0.5 rounded font-semibold",
                            isRoom 
                              ? "bg-red-100 text-red-600"
                              : selectedCategory === cat.id 
                                ? "bg-primary-foreground/20 text-primary-foreground" 
                                : "bg-muted text-muted-foreground"
                          )}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </>
            )}

            {viewMode === 'pending' && (
              <div className="flex-1 flex flex-col p-3">
                <p className="text-xs text-muted-foreground mb-2">
                  Services performed by nursing staff that need to be billed.
                </p>
                <div className="mt-auto pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => setViewMode('catalog')}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add from Catalog
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Center - Services List */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Show Room & Bed transfer history when Room category is selected */}
            {viewMode === 'catalog' && selectedCategory === 'Room' ? (
              <RoomBedTab
                patientId={patientId || ''}
                onAddToCart={addToCart}
                isInCart={isInCart}
              />
            ) : viewMode === 'pending' ? (
              <>
                {/* Pending Services Header */}
                <div className="h-[75px] px-4 border-b border-border bg-background flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={selectAllPending}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {allSelected ? (
                        <CheckSquare className="w-4 h-4 text-primary" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                      <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
                    </button>
                    {selectedPendingIds.size > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {selectedPendingIds.size} selected
                      </Badge>
                    )}
                  </div>
                  {selectedPendingIds.size > 0 && (
                    <Button size="sm" onClick={addSelectedToCart} className="gap-1.5">
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Add to Bill ({selectedPendingIds.size})
                    </Button>
                  )}
                </div>

                {/* Pending Services List */}
                <ScrollArea className="flex-1">
                  {totalPendingCount === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <CheckCircle2 className="w-12 h-12 text-green-500/50 mb-3" />
                      <p className="text-sm font-medium text-foreground">No pending services</p>
                      <p className="text-xs text-muted-foreground mt-1">All services have been billed</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => setViewMode('catalog')}
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add Services from Catalog
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {/* Pending Services Section */}
                      {pendingServices.length > 0 && (
                        <>
                          {pendingServices.map((ps) => {
                            const isSelected = selectedPendingIds.has(ps.id);
                            const Icon = getCategoryIcon(ps.service.category);
                            const inCart = isInCart(ps.service.id);
                            
                            return (
                              <div 
                                key={ps.id}
                                onClick={() => togglePendingSelection(ps.id)}
                                className={cn(
                                  "flex items-start gap-4 px-4 py-4 cursor-pointer transition-colors",
                                  isSelected ? "bg-primary/5" : "hover:bg-muted/50",
                                  inCart && "opacity-60"
                                )}
                              >
                                {/* Checkbox */}
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => togglePendingSelection(ps.id)}
                                  className="mt-1"
                                />
                                
                                {/* Service Icon */}
                                <div className={cn(
                                  "w-10 h-10 rounded-lg flex items-center justify-center border flex-shrink-0",
                                  getCategoryColor(ps.service.category)
                                )}>
                                  <Icon className="w-5 h-5" />
                                </div>
                                
                                {/* Service Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-foreground">{ps.service.name}</p>
                                    {ps.quantity > 1 && (
                                      <Badge variant="outline" className="text-xs">
                                        ×{ps.quantity}
                                      </Badge>
                                    )}
                                    {inCart && (
                                      <Badge variant="secondary" className="text-xs">
                                        In Cart
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                      {ps.service.code}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{ps.service.subCategory}</span>
                                  </div>
                                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {format(new Date(ps.performedAt), 'dd MMM, HH:mm')}
                                    </span>
                                    <span>•</span>
                                    <span>{ps.performedBy}</span>
                                  </div>
                                  {ps.notes && (
                                    <p className="text-xs text-muted-foreground mt-1 italic">"{ps.notes}"</p>
                                  )}
                                </div>
                                
                              {/* Price */}
                                <div className="text-right flex-shrink-0">
                                  <p className="text-sm font-bold text-foreground">
                                    {formatPrice(ps.service.price * ps.quantity)}
                                  </p>
                                  {ps.quantity > 1 && (
                                    <p className="text-xs text-muted-foreground">
                                      {formatPrice(ps.service.price)} × {ps.quantity}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </>
            ) : (
              <>
                {/* Catalog: Search & Sub-category Filters */}
                <div className="p-4 space-y-3 border-b border-border flex-shrink-0 bg-background">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by service name, code, or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-10"
                    />
                  </div>
                  
                  {/* Sub-category Pills */}
                  {subCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={selectedSubCategory === "all" ? "default" : "outline"}
                        className="cursor-pointer transition-colors"
                        onClick={() => setSelectedSubCategory("all")}
                      >
                        All
                      </Badge>
                      {subCategories.map((sub) => (
                        <Badge
                          key={sub}
                          variant={selectedSubCategory === sub ? "default" : "outline"}
                          className="cursor-pointer transition-colors"
                          onClick={() => setSelectedSubCategory(sub)}
                        >
                          {sub}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Results Header */}
                <div className="px-4 py-2 border-b border-border bg-muted/30 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Showing <span className="font-medium text-foreground">{results.length}</span> services
                    {selectedCategory !== "all" && (
                      <> in <span className="font-medium text-foreground">{selectedCategory}</span></>
                    )}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    Prices as of today
                  </div>
                </div>

                {/* Results List */}
                <ScrollArea className="flex-1">
                  {results.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <AlertCircle className="w-12 h-12 text-muted-foreground/50 mb-3" />
                      <p className="text-sm font-medium text-foreground">No services found</p>
                      <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filter</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {results.map((service) => {
                        const inCart = isInCart(service.id);
                        const cartItem = getCartItem(service.id);
                        const Icon = getCategoryIcon(service.category);
                        
                        return (
                          <div 
                            key={service.id} 
                            className={cn(
                              "flex items-center gap-4 px-4 py-3 transition-colors",
                              inCart ? "bg-primary/5" : "hover:bg-muted/50"
                            )}
                          >
                            {/* Service Icon */}
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center border",
                              getCategoryColor(service.category)
                            )}>
                              <Icon className="w-5 h-5" />
                            </div>
                            
                            {/* Service Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-foreground truncate">{service.name}</p>
                                {inCart && (
                                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                  {service.code}
                                </span>
                                {service.subCategory && (
                                  <span className="text-xs text-muted-foreground">{service.subCategory}</span>
                                )}
                              </div>
                              {service.description && (
                                <p className="text-xs text-muted-foreground mt-1 truncate">{service.description}</p>
                              )}
                            </div>
                            
                            {/* Price & Actions */}
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm font-bold text-foreground">{formatPrice(service.price)}</p>
                              </div>
                              
                              {inCart && cartItem ? (
                                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={() => {
                                      if (cartItem.qty === 1) {
                                        removeFromCart(cartItem.itemId);
                                      } else {
                                        updateQty(cartItem.itemId, cartItem.qty - 1);
                                      }
                                    }}
                                  >
                                    {cartItem.qty === 1 ? <Trash2 className="w-3.5 h-3.5 text-destructive" /> : <Minus className="w-3.5 h-3.5" />}
                                  </Button>
                                  <span className="text-sm font-semibold w-8 text-center">{cartItem.qty}</span>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={() => updateQty(cartItem.itemId, cartItem.qty + 1)}
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => addToCart(service)}
                                  className="h-8 gap-1"
                                >
                                  <Plus className="w-4 h-4" />
                                  Add
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </>
            )}
          </div>
          
          {/* Right Side - Order Summary */}
          <div className="w-[450px] border-l border-border flex flex-col bg-card">
            {/* Header */}
            <div className="p-4 border-b border-border bg-primary">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-primary-foreground">Order Summary</h3>
                  <p className="text-xs text-primary-foreground/80 mt-0.5">{cart.length} item(s) • {patient.gdid}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
            </div>
            
            {/* Cart Items */}
            <ScrollArea className="flex-1">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                    <FileText className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-foreground">No services added</p>
                  <p className="text-xs text-muted-foreground mt-1">Select services from the catalog to add them to the bill</p>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {cart.map((item) => {
                    const Icon = getCategoryIcon(item.category);
                    const addedDate = new Date(item.addedAt);
                    const lineTotal = item.unitPrice * item.qty * (1 - (item.discountPct || 0) / 100);
                    return (
                      <Card key={item.itemId} className="shadow-sm border-border">
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded flex items-center justify-center flex-shrink-0 border",
                              getCategoryColor(item.category)
                            )}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{item.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <p className="text-xs text-muted-foreground">{item.code}</p>
                                    <span className="text-muted-foreground">•</span>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                                          <CalendarDays className="w-3 h-3" />
                                          {format(addedDate, 'dd MMM, HH:mm')}
                                        </button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                          mode="single"
                                          selected={addedDate}
                                          onSelect={(date) => {
                                            if (date) {
                                              // Preserve the original time
                                              const newDate = setMinutes(setHours(date, addedDate.getHours()), addedDate.getMinutes());
                                              updateAddedAt(item.itemId, newDate.toISOString());
                                            }
                                          }}
                                          initialFocus
                                          className="p-3 pointer-events-auto"
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 text-muted-foreground hover:text-destructive flex-shrink-0"
                                  onClick={() => removeFromCart(item.itemId)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                              
                              {/* Qty controls and discount */}
                              <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                                <div className="flex items-center gap-3">
                                  {/* Quantity */}
                                  <div className="flex items-center gap-1 bg-muted rounded p-0.5">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6"
                                      onClick={() => updateQty(item.itemId, item.qty - 1)}
                                      disabled={item.qty <= 1}
                                    >
                                      <Minus className="w-3 h-3" />
                                    </Button>
                                    <span className="text-xs font-medium w-6 text-center">{item.qty}</span>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6"
                                      onClick={() => updateQty(item.itemId, item.qty + 1)}
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                  </div>
                                  
                                  {/* Discount */}
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-muted-foreground">Disc:</span>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      defaultValue={item.discountPct || 0}
                                      onBlur={(e) => {
                                        const val = parseFloat(e.target.value);
                                        if (!isNaN(val) && val >= 0 && val <= 100) {
                                          updateDiscount(item.itemId, val);
                                        }
                                      }}
                                      className="h-6 w-12 px-1.5 text-xs text-center"
                                    />
                                    <span className="text-xs text-muted-foreground">%</span>
                                  </div>
                                </div>
                                
                                {/* Price */}
                                <div className="text-right">
                                  <span className="text-sm font-semibold">
                                    {formatPrice(lineTotal)}
                                  </span>
                                  {(item.qty > 1 || (item.discountPct && item.discountPct > 0)) && (
                                    <p className="text-xs text-muted-foreground">
                                      {formatPrice(item.unitPrice)} × {item.qty}
                                      {item.discountPct && item.discountPct > 0 && (
                                        <span className="text-green-600 ml-1">-{item.discountPct}%</span>
                                      )}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
            
            {/* Totals & Actions */}
            <div className="p-4 border-t border-border bg-background">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">₹</span>
                    <Input
                      type="number"
                      min="0"
                      max={totals.subtotal}
                      value={globalDiscountAmt || ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val >= 0) {
                          updateGlobalDiscount(Math.min(val, totals.subtotal));
                        } else if (e.target.value === '') {
                          updateGlobalDiscount(0);
                        }
                      }}
                      className="h-6 w-20 px-1.5 text-xs text-right"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="flex justify-between pt-3 border-t border-border">
                  <span className="text-base font-semibold">Total Amount</span>
                  <span className="text-lg font-bold text-primary">{formatPrice(totals.subtotal - totals.discountTotal)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button 
                  className="w-full h-11" 
                  size="lg"
                  disabled={cart.length === 0 || isGeneratingBill}
                  onClick={handleGenerateBill}
                >
                  {isGeneratingBill ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Generating Bill...
                    </>
                  ) : (
                    <>
                      <Receipt className="w-4 h-4 mr-2" />
                      Generate Bill
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    </div>
  );
};

export default PatientServices;
