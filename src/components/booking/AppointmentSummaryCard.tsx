import { Card } from "@/components/ui/card";
import { Trash2, Calendar, User, Building2, CalendarDays, Stethoscope } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/pricingEngine";
import { LineItemPriceEditor } from "@/components/pricing/LineItemPriceEditor";
import { LineItem } from "@/types/pricing";
import { DynamicConsultationData } from "@/components/DynamicConsultationBookingForm";
import { LaboratoryData } from "@/components/LaboratoryBookingForm";
import { IPDAdmissionData } from "@/components/IPDAdmissionBookingForm";
import { CartItem, Totals } from "@/types/booking/ipAdmission";

interface AppointmentSummaryCardProps {
  // Patient info
  patientName: string;
  patientId: string;
  patientAgeSex: string;
  visitId?: string;
  
  // Selected types
  selectedTypes: string[];
  
  // Data
  consultationData: DynamicConsultationData | null;
  laboratoryData: LaboratoryData | null;
  ipdAdmissionData: IPDAdmissionData | null;
  servicesCart: CartItem[];
  
  // Pricing
  pricing: {
    lineItems: LineItem[];
    totals: { subtotal: number; roundOff: number; netPayable: number; globalDiscountValue?: number };
    updateLineItemPrice: (id: string, newPrice: number, reason?: string) => void;
    applyLineDiscount: (id: string, type: 'flat' | 'percent', value: number, reason?: string) => void;
    waiveOffItem: (id: string, reason: string) => void;
  };
  servicesTotals: Totals;
  
  // Actions
  onRemoveConsultation: () => void;
  onRemoveLaboratory: () => void;
  onRemoveIPDAdmission: () => void;
  onRemoveLabTest: (testId: string) => void;
  onRemoveLabPackage: (pkgId: string) => void;
  onRemoveRadiologyTest: (testId: string) => void;
  onRemoveService: (itemId: string) => void;
  onClearServices: () => void;
  onOpenModal: (item: LineItem) => void;
}

export function AppointmentSummaryCard({
  patientName,
  patientId,
  patientAgeSex,
  visitId,
  selectedTypes,
  consultationData,
  laboratoryData,
  ipdAdmissionData,
  servicesCart,
  pricing,
  servicesTotals,
  onRemoveConsultation,
  onRemoveLaboratory,
  onRemoveIPDAdmission,
  onRemoveLabTest,
  onRemoveLabPackage,
  onRemoveRadiologyTest,
  onRemoveService,
  onClearServices,
  onOpenModal,
}: AppointmentSummaryCardProps) {
  const totalAmount = pricing.totals.netPayable + servicesTotals.netPayable;
  const itemCount = pricing.lineItems.length + servicesCart.length;

  return (
    <Card className="w-full lg:w-[420px] h-fit shrink-0 overflow-hidden">
      {/* Header */}
      <div className="bg-primary px-5 py-4">
        <h3 className="text-base font-semibold text-primary-foreground">Appointment Summary</h3>
        <p className="text-xs text-primary-foreground/70 mt-0.5">
          {visitId ? `Visit: ${visitId}` : `${itemCount} item${itemCount !== 1 ? 's' : ''} selected`}
        </p>
      </div>

      <div className="p-5 space-y-4">
        {/* Patient Info */}
        <div className="pb-4 border-b border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Patient</p>
          <p className="text-sm font-semibold text-foreground">{patientName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {patientId} • {patientAgeSex}
          </p>
        </div>

        {selectedTypes.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm font-medium text-muted-foreground">No appointments selected</p>
            <p className="text-xs text-muted-foreground mt-1">Choose appointment types to get started</p>
          </div>
        ) : (
          <>
            {/* Appointment Types */}
            {[...selectedTypes].reverse().map((type) => {
              if (type === "laboratory" && laboratoryData) {
                const hasLabTests = laboratoryData.selectedTests.length > 0 || laboratoryData.selectedPackages.length > 0;
                const hasRadiologyTests = laboratoryData.selectedRadiologyTests && laboratoryData.selectedRadiologyTests.length > 0;
                
                return (
                  <div key="laboratory-radiology" className="space-y-4">
                    {/* Laboratory Section */}
                    {hasLabTests && (
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-sm font-semibold text-foreground">Laboratory</span>
                          </div>
                          <button
                            onClick={onRemoveLaboratory}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <CalendarDays className="w-3.5 h-3.5" />
                            <span>{format(laboratoryData.laboratoryDate, "dd MMM yyyy")} • {laboratoryData.laboratoryTime}</span>
                          </div>

                          <div className="space-y-1.5 pt-2 border-t border-border/50 mt-2">
                            {laboratoryData.selectedTests.map((test) => {
                              const lineItem = pricing.lineItems.find(li => li.id === `lab-test-${test.id}`);
                              return (
                                <div key={test.id} className="flex justify-between items-center gap-2 group">
                                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                    <p className="text-foreground truncate">{test.name}</p>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); onRemoveLabTest(test.id); }}
                                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                  {lineItem && (
                                    <LineItemPriceEditor
                                      item={lineItem}
                                      onPriceUpdate={pricing.updateLineItemPrice}
                                      onDiscountApply={pricing.applyLineDiscount}
                                      onWaiveOff={pricing.waiveOffItem}
                                      onOpenModal={() => onOpenModal(lineItem)}
                                    />
                                  )}
                                </div>
                              );
                            })}

                            {laboratoryData.selectedPackages.map((pkg) => {
                              const lineItem = pricing.lineItems.find(li => li.id === `lab-pkg-${pkg.id}`);
                              return (
                                <div key={pkg.id} className="flex justify-between items-center gap-2 group">
                                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                    <p className="text-foreground truncate">{pkg.name}</p>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); onRemoveLabPackage(pkg.id); }}
                                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                  {lineItem && (
                                    <LineItemPriceEditor
                                      item={lineItem}
                                      onPriceUpdate={pricing.updateLineItemPrice}
                                      onDiscountApply={pricing.applyLineDiscount}
                                      onWaiveOff={pricing.waiveOffItem}
                                      onOpenModal={() => onOpenModal(lineItem)}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Radiology Section */}
                    {hasRadiologyTests && (
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            <span className="text-sm font-semibold text-foreground">Radiology</span>
                          </div>
                          <button
                            onClick={onRemoveLaboratory}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <CalendarDays className="w-3.5 h-3.5" />
                            <span>{format(laboratoryData.radiologyDate, "dd MMM yyyy")} • {laboratoryData.radiologyTime}</span>
                          </div>

                          <div className="space-y-1.5 pt-2 border-t border-border/50 mt-2">
                            {laboratoryData.selectedRadiologyTests?.map((test) => {
                              const lineItem = pricing.lineItems.find(li => li.id === `rad-test-${test.id}`);
                              return (
                                <div key={test.id} className="flex justify-between items-center gap-2 group">
                                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                    <p className="text-foreground truncate">{test.name}</p>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); onRemoveRadiologyTest(test.id); }}
                                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                  {lineItem && (
                                    <LineItemPriceEditor
                                      item={lineItem}
                                      onPriceUpdate={pricing.updateLineItemPrice}
                                      onDiscountApply={pricing.applyLineDiscount}
                                      onWaiveOff={pricing.waiveOffItem}
                                      onOpenModal={() => onOpenModal(lineItem)}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              if (type === "consultation" && consultationData) {
                const lineItem = pricing.lineItems.find(li => li.id === 'consultation-1');
                return (
                  <div key="consultation" className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm font-semibold text-foreground">Consultation</span>
                      </div>
                      <button
                        onClick={onRemoveConsultation}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="w-3.5 h-3.5" />
                        <span>
                          {consultationData.selectedSlot 
                            ? `${format(new Date(consultationData.selectedSlot.start), "dd MMM yyyy")} • ${format(new Date(consultationData.selectedSlot.start), "h:mm a")}`
                            : "Time not selected"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>{consultationData.doctorName || "Any available doctor"}</span>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-border/50 mt-2">
                        <p className="text-foreground">Consultation Fee</p>
                        {lineItem ? (
                          <LineItemPriceEditor
                            item={lineItem}
                            onPriceUpdate={pricing.updateLineItemPrice}
                            onDiscountApply={pricing.applyLineDiscount}
                            onWaiveOff={pricing.waiveOffItem}
                            onOpenModal={() => onOpenModal(lineItem)}
                          />
                        ) : <p className="text-foreground font-semibold">₹1,000</p>}
                      </div>
                    </div>
                  </div>
                );
              }

              if (type === "ipd" && ipdAdmissionData) {
                const lineItem = pricing.lineItems.find(li => li.id === 'ipd-admission-1');
                return (
                  <div key="ipd" className="space-y-4">
                    <div className="bg-muted/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                          <span className="text-sm font-semibold text-foreground">IPD Admission</span>
                        </div>
                        <button
                          onClick={onRemoveIPDAdmission}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{format(ipdAdmissionData.date, "dd MMM yyyy")} • {ipdAdmissionData.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{ipdAdmissionData.attendingDoctor}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          <span>{ipdAdmissionData.ward} • {ipdAdmissionData.bed}</span>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-border/50 mt-2">
                          <p className="text-foreground">Admission Charge</p>
                          {lineItem ? (
                            <LineItemPriceEditor
                              item={lineItem}
                              onPriceUpdate={pricing.updateLineItemPrice}
                              onDiscountApply={pricing.applyLineDiscount}
                              onWaiveOff={pricing.waiveOffItem}
                              onOpenModal={() => onOpenModal(lineItem)}
                            />
                          ) : <p className="text-foreground font-semibold">₹5,000</p>}
                        </div>
                      </div>
                    </div>

                    {/* Services & Procedures */}
                    {servicesCart.length > 0 && (
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                            <span className="text-sm font-semibold text-foreground">Services & Procedures</span>
                          </div>
                          <button
                            onClick={onClearServices}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-1.5 text-xs">
                          {servicesCart.map((item) => {
                            const lineItem = pricing.lineItems.find(li => li.id === `service-${item.itemId}`);
                            return (
                              <div key={item.itemId} className="flex justify-between items-center gap-2 group">
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                  <p className="text-foreground truncate">{item.name}</p>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onRemoveService(item.itemId); }}
                                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                                {lineItem && (
                                  <LineItemPriceEditor
                                    item={lineItem}
                                    onPriceUpdate={pricing.updateLineItemPrice}
                                    onDiscountApply={pricing.applyLineDiscount}
                                    onWaiveOff={pricing.waiveOffItem}
                                    onOpenModal={() => onOpenModal(lineItem)}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return null;
            })}

            {/* Totals Section */}
            <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-4 mt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(pricing.totals.subtotal + servicesTotals.subtotal)}</span>
                </div>
                {(pricing.totals.globalDiscountValue ?? 0) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-medium text-green-600">- {formatCurrency(pricing.totals.globalDiscountValue ?? 0)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-primary/20">
                  <span className="font-semibold">Net Payable</span>
                  <span className="text-xl font-bold text-primary">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
