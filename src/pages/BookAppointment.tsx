import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { ChevronLeft, Calendar, FlaskConical, Bed, Trash2 } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { PageContent } from "@/components/PageContent";
import { BookingSteps } from "@/components/BookingSteps";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DynamicConsultationBookingForm, DynamicConsultationData } from "@/components/DynamicConsultationBookingForm";
import { LaboratoryBookingForm, LaboratoryData } from "@/components/LaboratoryBookingForm";
import { IPDAdmissionBookingForm, IPDAdmissionData } from "@/components/IPDAdmissionBookingForm";
import { LineItemPriceEditor } from "@/components/pricing/LineItemPriceEditor";
import { AdjustPriceModal } from "@/components/pricing/AdjustPriceModal";
import { GlobalDiscountControls } from "@/components/pricing/GlobalDiscountControls";
import { StickyFooterBar } from "@/components/pricing/StickyFooterBar";
import { BookingStickyFooter } from "@/components/booking/BookingStickyFooter";
import { ConfirmationModal } from "@/components/booking/ConfirmationModal";
import { AppointmentSummaryCard } from "@/components/booking/AppointmentSummaryCard";
import { usePricingState } from "@/hooks/usePricingState";
import { LineItem } from "@/types/pricing";
import { formatCurrency } from "@/lib/pricingEngine";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { CartItem, Totals } from "@/types/booking/ipAdmission";
import { calcLineTotal } from "@/utils/billing/totals";

const allAppointmentTypes = [
  { icon: Calendar, label: "OP Consultation", value: "consultation" },
  { icon: Bed, label: "IP Admission", value: "ipd" },
  { icon: FlaskConical, label: "Diagnostics", value: "laboratory" },
];

const BookAppointment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Check if this is single-appointment mode from Inbox
  const appointmentId = searchParams.get("id");
  const appointmentType = searchParams.get("type");
  const fromPatients = searchParams.get("from") === "patients";
  const fromSearch = searchParams.get("from") === "search";
  const patientSearchQuery = searchParams.get("q") || "";
  const patientIdFromQuery = searchParams.get("patientId");
  const isSingleAppointmentMode = !!appointmentId && !!appointmentType;
  
  // Get request data from navigation state (from ScheduledToday page)
  const requestData = location.state?.requestData;
  const isFromScheduledRequests = !!requestData;
  
  const fromPatientInsights = location.state?.fromPatientInsights;
  const patientId = location.state?.patientId || patientIdFromQuery;
  const patientFromState = location.state?.patient;
  const fromPage = location.state?.fromPage; // e.g., "op-patients"
  const visitId = location.state?.visitId; // Visit ID for new appointments
  const flowType = location.state?.flowType; // "ip-admission" for IP Admission flow
  const isIPAdmissionFlow = flowType === "ip-admission";
  
  // Filter appointment types based on flow
  const appointmentTypes = allAppointmentTypes.filter((type) => {
    if (isIPAdmissionFlow) {
      return type.value === "ipd"; // Only show IP Admission
    }
    return type.value !== "ipd"; // Show OP Consultation and Diagnostics only
  });
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [consultationData, setConsultationData] = useState<DynamicConsultationData | null>(null);
  const [additionalConsultations, setAdditionalConsultations] = useState<{ id: string; data: DynamicConsultationData }[]>([]);
  const [laboratoryData, setLaboratoryData] = useState<LaboratoryData | null>(null);
  const [ipdAdmissionData, setIpdAdmissionData] = useState<IPDAdmissionData | null>(null);
  
  // Confirmation modal state
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  
  // Pricing state management
  const pricing = usePricingState();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItemForModal, setSelectedItemForModal] = useState<LineItem | null>(null);
  
  // Services cart state (for IPD)
  const [servicesCart, setServicesCart] = useState<CartItem[]>([]);
  const [servicesTotals, setServicesTotals] = useState<Totals>({
    subtotal: 0,
    discountTotal: 0,
    taxTotal: 0,
    netPayable: 0,
  });

  // Initialize with request data from ScheduledToday page
  useEffect(() => {
    if (isFromScheduledRequests && requestData) {
      if (requestData.type === 'outpatient') {
        setSelectedTypes(['consultation']);
        
        // Map visit type to consultation type
        const consultationTypeMap: Record<string, string> = {
          'First Visit': 'first_visit',
          'Follow-up': 'follow_up',
          'Follow up': 'follow_up',
        };
        
        // Map department name to ID
        const departmentMap: Record<string, string> = {
          'Cardiology': 'cardiology',
          'Orthopedics': 'orthopedics',
          'Endocrinology': 'endocrinology',
          'Neurology': 'neurology',
          'Pediatrics': 'pediatrics',
          'General Medicine': 'general_medicine',
          'ENT': 'ent',
          'Gastroenterology': 'gastroenterology',
        };
        
        setConsultationData({
          mode: "in_person",
          type: consultationTypeMap[requestData.visitType] || "first_visit",
          department: departmentMap[requestData.department] || "",
          doctorId: null,
          doctorName: requestData.preferredDoctor || "Any available doctor",
          clinicalInfo: "",
          selectedSlot: null,
          holdId: null,
        });
      } else if (requestData.type === 'laboratory') {
        setSelectedTypes(['laboratory']);
        
        // Find the test based on testType code
        const testCodeToTest: Record<string, { id: string; name: string; category: string; price: number }> = {
          'CBC001': { id: "1", name: "Complete Blood Count (CBC)", category: "Hematology", price: 200 },
          'LIP001': { id: "2", name: "Lipid Profile", category: "Biochemistry", price: 300 },
          'LFT001': { id: "3", name: "Liver Function Test (LFT)", category: "Biochemistry", price: 400 },
          'KFT001': { id: "4", name: "Kidney Function Test (KFT)", category: "Biochemistry", price: 350 },
          'THY001': { id: "5", name: "Thyroid Profile", category: "Endocrinology", price: 450 },
          'HBA001': { id: "6", name: "HbA1c", category: "Diabetes", price: 350 },
          'URI001': { id: "7", name: "Urinalysis", category: "Urology", price: 150 },
          'VIT001': { id: "8", name: "Vitamin D", category: "Biochemistry", price: 600 },
          'VIT002': { id: "9", name: "Vitamin B12", category: "Biochemistry", price: 500 },
          'IRO001': { id: "10", name: "Iron Studies", category: "Hematology", price: 400 },
        };
        
        const selectedTest = testCodeToTest[requestData.testType];
        
        setLaboratoryData({
          mode: "laboratory",
          selectedTests: selectedTest ? [selectedTest] : [],
          selectedPackages: [],
          selectedRadiologyTests: [],
          laboratoryDate: new Date(),
          laboratoryTime: "",
          radiologyDate: new Date(),
          radiologyTime: "",
        });
      }
    }
  }, [isFromScheduledRequests, requestData]);

  // Initialize with appointment type if in single-appointment mode (from Inbox)
  useEffect(() => {
    if (isSingleAppointmentMode && appointmentType && !isFromScheduledRequests) {
      const validType = appointmentType === "consultation" ? "consultation" : "laboratory";
      setSelectedTypes([validType]);
      
      // Initialize the data based on type
      if (validType === "consultation") {
        setConsultationData({
          mode: "in_person",
          type: "",
          department: "",
          doctorId: null,
          doctorName: "",
          clinicalInfo: "",
          selectedSlot: null,
          holdId: null,
        });
      } else if (validType === "laboratory") {
        setLaboratoryData({
          mode: "laboratory",
          selectedTests: [],
          selectedPackages: [],
          selectedRadiologyTests: [],
          laboratoryDate: new Date(),
          laboratoryTime: "",
          radiologyDate: new Date(),
          radiologyTime: "",
        });
      }
    }
  }, [isSingleAppointmentMode, appointmentType, isFromScheduledRequests]);

  // Initialize with IP Admission type if in IP Admission flow
  useEffect(() => {
    if (isIPAdmissionFlow && !selectedTypes.includes("ipd")) {
      setSelectedTypes(["ipd"]);
      setIpdAdmissionData({
        department: "General Medicine",
        attendingDoctor: "Dr. A. Joseph (Ophthalmology)",
        ward: "General Ward - 01A",
        bed: "Bed - 35A",
        reasonForAdmission: "",
        date: new Date(2025, 7, 5),
        time: "07:30",
        emergencyContactName: "",
        relationship: "",
        contactNumber: "",
        address: "",
      });
    }
  }, [isIPAdmissionFlow]);

  // Sync line items with selected services
  useEffect(() => {
    const items: LineItem[] = [];

    if (consultationData) {
      items.push({
        id: 'consultation-1',
        name: 'Consultation',
        category: 'Consultation',
        basePrice: 1000,
        isDiscountable: true,
        floorPrice: 500,
      });
    }

    if (laboratoryData) {
      if (laboratoryData.mode === "laboratory") {
        laboratoryData.selectedTests.forEach((test) => {
          items.push({
            id: `lab-test-${test.id}`,
            name: test.name,
            category: 'Laboratory',
            basePrice: test.price,
            isDiscountable: true,
            floorPrice: test.price * 0.5,
          });
        });
        laboratoryData.selectedPackages.forEach((pkg) => {
          items.push({
            id: `lab-pkg-${pkg.id}`,
            name: pkg.name,
            category: 'Laboratory Package',
            basePrice: pkg.price,
            isDiscountable: true,
            floorPrice: pkg.price * 0.5,
          });
        });
      } else if (laboratoryData.mode === "radiology" && laboratoryData.selectedRadiologyTests) {
        laboratoryData.selectedRadiologyTests.forEach((test) => {
          items.push({
            id: `rad-test-${test.id}`,
            name: test.name,
            category: 'Radiology',
            basePrice: test.price,
            isDiscountable: true,
            floorPrice: test.price * 0.5,
          });
        });
      }
    }

    if (ipdAdmissionData) {
      items.push({
        id: 'ipd-admission-1',
        name: 'IPD Admission',
        category: 'IPD',
        basePrice: 5000,
        isDiscountable: false, // Example: non-discountable
        floorPrice: 5000,
      });
    }

    // Add services from cart
    servicesCart.forEach((service) => {
      items.push({
        id: `service-${service.itemId}`,
        name: service.name,
        category: service.category,
        basePrice: service.unitPrice * service.qty,
        isDiscountable: true,
        floorPrice: service.unitPrice * service.qty * 0.5,
      });
    });

    // Update pricing state (but preserve existing overrides/discounts)
    const existingItems = pricing.lineItems;
    const updatedItems = items.map((item) => {
      const existing = existingItems.find((e) => e.id === item.id);
      return existing ? { ...item, ...existing } : item;
    });

    // Remove items that are no longer selected
    const itemIdsToKeep = new Set(items.map((i) => i.id));
    existingItems.forEach((item) => {
      if (!itemIdsToKeep.has(item.id)) {
        pricing.removeLineItem(item.id);
      }
    });

    // Add new items
    updatedItems.forEach((item) => {
      if (!existingItems.find((e) => e.id === item.id)) {
        pricing.addLineItem(item);
      }
    });
  }, [consultationData, laboratoryData, ipdAdmissionData, servicesCart]);

  const handleTypeClick = (type: string) => {
    // Toggle the type - add if not present, remove if already selected
    if (selectedTypes.includes(type)) {
      // Deselect: call the appropriate remove handler
      if (type === "consultation") handleRemoveConsultation();
      else if (type === "laboratory") handleRemoveLaboratory();
      else if (type === "ipd") handleRemoveIPDAdmission();
      return;
    }
    
    setSelectedTypes(prev => [...prev, type]);
    
    if (type === "consultation") {
      // Initialize with default data
      setConsultationData({
        mode: "in_person",
        type: "first_visit",
        department: "",
        doctorId: null,
        doctorName: "Any available doctor",
        clinicalInfo: "",
        selectedSlot: null,
        holdId: null,
      });
    } else if (type === "laboratory") {
      // Initialize with default data
      setLaboratoryData({
        mode: "laboratory",
        selectedTests: [
          { id: "1", name: "Complete Blood Count (CBC)", category: "Hematology", price: 200 },
          { id: "2", name: "Liver Function Test (LFT)", category: "Biochemistry", price: 400 },
        ],
        selectedPackages: [],
        selectedRadiologyTests: [],
        laboratoryDate: new Date(2025, 7, 5),
        laboratoryTime: "07:30",
        radiologyDate: new Date(2025, 7, 5),
        radiologyTime: "07:30",
      });
    } else if (type === "ipd") {
      // Initialize with default data
      setIpdAdmissionData({
        department: "General Medicine",
        attendingDoctor: "Dr. A. Joseph (Ophthalmology)",
        ward: "General Ward - 01A",
        bed: "Bed - 35A",
        reasonForAdmission: "",
        date: new Date(2025, 7, 5),
        time: "07:30",
        emergencyContactName: "",
        relationship: "",
        contactNumber: "",
        address: "",
      });
    }
  };

  const handleRemoveConsultation = () => {
    setSelectedTypes(prev => prev.filter(t => t !== "consultation"));
    setConsultationData(null);
  };

  const handleRemoveLaboratory = () => {
    setSelectedTypes(prev => prev.filter(t => t !== "laboratory"));
    setLaboratoryData(null);
  };

  const handleRemoveIPDAdmission = () => {
    setSelectedTypes(prev => prev.filter(t => t !== "ipd"));
    setIpdAdmissionData(null);
  };

  const handleConsultationUpdate = (data: DynamicConsultationData) => {
    setConsultationData(data);
  };

  const handleAddAnotherConsultation = () => {
    const newId = `consultation-${Date.now()}`;
    setAdditionalConsultations(prev => [...prev, {
      id: newId,
      data: {
        mode: "in_person",
        type: "first_visit",
        department: "",
        doctorId: null,
        doctorName: "Any available doctor",
        clinicalInfo: "",
        selectedSlot: null,
        holdId: null,
      }
    }]);
  };

  const handleAdditionalConsultationUpdate = (id: string, data: DynamicConsultationData) => {
    setAdditionalConsultations(prev => prev.map(c => c.id === id ? { ...c, data } : c));
  };

  const handleRemoveAdditionalConsultation = (id: string) => {
    setAdditionalConsultations(prev => prev.filter(c => c.id !== id));
  };

  const handleLaboratoryUpdate = (data: LaboratoryData) => {
    setLaboratoryData(data);
  };

  const handleIPDAdmissionUpdate = (data: IPDAdmissionData) => {
    setIpdAdmissionData(data);
  };
  
  const handleServicesChange = (cart: CartItem[], totals: Totals) => {
    setServicesCart(cart);
    setServicesTotals(totals);
  };
  
  const handleRemoveLabTest = (testId: string) => {
    if (!laboratoryData) return;
    setLaboratoryData({
      ...laboratoryData,
      selectedTests: laboratoryData.selectedTests.filter(t => t.id !== testId),
    });
  };
  
  const handleRemoveLabPackage = (pkgId: string) => {
    if (!laboratoryData) return;
    setLaboratoryData({
      ...laboratoryData,
      selectedPackages: laboratoryData.selectedPackages.filter(p => p.id !== pkgId),
    });
  };
  
  const handleRemoveRadiologyTest = (testId: string) => {
    if (!laboratoryData) return;
    setLaboratoryData({
      ...laboratoryData,
      selectedRadiologyTests: laboratoryData.selectedRadiologyTests?.filter(t => t.id !== testId) || [],
    });
  };
  
  const handleRemoveService = (itemId: string) => {
    setServicesCart(prev => prev.filter(item => item.itemId !== itemId));
  };
  
  const handleClearServices = () => {
    setServicesCart([]);
    setServicesTotals({ subtotal: 0, discountTotal: 0, taxTotal: 0, netPayable: 0 });
  };

  const handleOpenModal = (item: LineItem) => {
    setSelectedItemForModal(item);
    setModalOpen(true);
  };

  const handleApplyModalChanges = (updates: any) => {
    if (!selectedItemForModal) return;

    const { overridePrice, lineDiscountType, lineDiscountValue, reason, approver } = updates;

    if (overridePrice !== undefined) {
      pricing.updateLineItemPrice(selectedItemForModal.id, overridePrice, reason);
    }

    if (lineDiscountType && lineDiscountValue !== undefined) {
      pricing.applyLineDiscount(
        selectedItemForModal.id,
        lineDiscountType,
        lineDiscountValue,
        reason
      );
    }

    // TODO: Store approver info
    if (approver) {
      // Add audit log entry
      console.log('Approver:', approver);
    }

    toast({
      title: "Price updated",
      description: `${selectedItemForModal.name} price has been updated successfully.`,
    });
  };

  const handleApplyCoupon = () => {
    const result = pricing.applyCoupon(pricing.couponCode);
    toast({
      title: result.success ? "Coupon applied" : "Invalid coupon",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });
  };

  // Single-appointment mode handlers
  const handleAskConfirmation = () => {
    setConfirmationModalOpen(true);
  };

  const handleSendConfirmation = () => {
    setConfirmationModalOpen(false);
    toast({
      title: "Confirmation request sent",
      description: "The patient will receive a confirmation request shortly.",
    });
  };

  const handleSchedule = () => {
    // Validate required fields
    const isValid = validateAppointmentData();
    
    if (!isValid) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields before scheduling.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Appointment scheduled",
      description: "The appointment has been scheduled successfully.",
    });
    
    // Navigate to appointment details or back to inbox
    setTimeout(() => {
      navigate(isSingleAppointmentMode ? "/inbox" : "/");
    }, 1000);
  };

  const validateAppointmentData = () => {
    if (selectedTypes.includes("consultation") && consultationData) {
      return !!(
        consultationData.department &&
        consultationData.doctorId &&
        consultationData.selectedSlot
      );
    }
    
    if (selectedTypes.includes("laboratory") && laboratoryData) {
      const hasLab = laboratoryData.selectedTests.length > 0 || laboratoryData.selectedPackages.length > 0;
      const hasRadiology = laboratoryData.selectedRadiologyTests && laboratoryData.selectedRadiologyTests.length > 0;
      
      if (hasLab && (!laboratoryData.laboratoryDate || !laboratoryData.laboratoryTime)) return false;
      if (hasRadiology && (!laboratoryData.radiologyDate || !laboratoryData.radiologyTime)) return false;
      
      return hasLab || hasRadiology;
    }
    
    return false;
  };

  const getAppointmentDetails = () => {
    const details: any = {
      patientName: "Patient Name", // This should come from the appointment data
      appointmentType: selectedTypes[0] === "consultation" ? "Consultation" : "Laboratory",
    };

    if (consultationData) {
      details.provider = consultationData.doctorName;
      details.mode = consultationData.mode === "in_person" ? "In-person" : "Virtual";
      details.location = consultationData.mode === "in_person" ? "Main Clinic" : undefined;
      details.date = consultationData.selectedSlot ? format(new Date(consultationData.selectedSlot.start), "PPP") : undefined;
      details.time = consultationData.selectedSlot ? format(new Date(consultationData.selectedSlot.start), "h:mm a") : undefined;
    }

    if (laboratoryData) {
      const hasLab = laboratoryData.selectedTests.length > 0 || laboratoryData.selectedPackages.length > 0;
      const hasRadiology = laboratoryData.selectedRadiologyTests && laboratoryData.selectedRadiologyTests.length > 0;
      
      details.mode = hasLab ? "Laboratory" : "Radiology";
      details.tests = [
        ...laboratoryData.selectedTests.map(t => t.name),
        ...laboratoryData.selectedPackages.map(p => p.name),
        ...(laboratoryData.selectedRadiologyTests || []).map(t => t.name),
      ];
      details.date = hasLab ? 
        (laboratoryData.laboratoryDate ? format(laboratoryData.laboratoryDate, "PPP") : undefined) :
        (laboratoryData.radiologyDate ? format(laboratoryData.radiologyDate, "PPP") : undefined);
      details.time = hasLab ? laboratoryData.laboratoryTime : laboratoryData.radiologyTime;
      details.prepNotes = "Fasting may be required for certain tests. Please review instructions.";
    }

    return details;
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      
      <PageContent>
        <AppHeader breadcrumbs={
          fromPatientInsights 
            ? [{ label: fromPage === "op-patients" ? "OP Patients" : "Patient Insight", onClick: () => navigate(`/patient-insights/${patientId}${fromPage ? `?from=${fromPage}` : ''}`) }, "Book Appointment"]
            : fromSearch 
              ? [{ label: "Search Results", onClick: () => navigate(`/patients/search?q=${patientSearchQuery}`) }, "Book Appointment"] 
              : (fromPatients ? ["Patients", "Book Appointment"] : ["Appointments", "Appointment"])
        } />
        
        <main className="p-6 pb-32">
          <div className="flex items-center justify-between h-10 mb-12">
            <div className="w-[130px]">
              <button
                onClick={() => {
                  if (fromPatientInsights) {
                    navigate(`/patient-insights/${patientId}${fromPage ? `?from=${fromPage}` : ''}`);
                  } else if (fromSearch && patientSearchQuery) {
                    navigate(`/patients/search?q=${patientSearchQuery}`);
                  } else if (fromPatients) {
                    navigate("/patients");
                  } else if (isSingleAppointmentMode) {
                    navigate("/inbox");
                  } else if (isFromScheduledRequests) {
                    navigate("/schedule/today");
                  } else {
                    navigate("/registration");
                  }
                }}
                className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="font-semibold">
                  {fromPatientInsights ? "Patient Insight" : (fromSearch ? "Search Results" : (fromPatients ? "Patients" : (isSingleAppointmentMode ? "Inbox" : (isFromScheduledRequests ? "Appointments" : "Registration"))))}
                </span>
              </button>
            </div>

            {!isSingleAppointmentMode && !isFromScheduledRequests && (
              <BookingSteps currentStep="appointment" hideSteps={fromPatientInsights || fromPatients || fromSearch ? ["search", "registration"] : []} />
            )}
            
            <div className="w-[130px]" />
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
              {/* Main Content */}
              <div className="w-full lg:w-[951px] lg:max-w-[951px] space-y-6">
                {/* Appointment Type Buttons - Hide in single-appointment mode, scheduled requests flow, and IP admission flow */}
                {!isSingleAppointmentMode && !isFromScheduledRequests && !isIPAdmissionFlow && (
                  <div className="flex gap-3">{appointmentTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedTypes.includes(type.value);
                    return (
                      <Button
                        key={type.value}
                        variant="outline"
                        className={cn(
                          "group h-10 px-5 flex items-center gap-2.5 rounded-full transition-all duration-200 whitespace-nowrap font-medium",
                          isSelected 
                            ? "bg-[#2563EB] border-[#2563EB] text-white hover:bg-[#2563EB]/90 hover:border-[#2563EB]/90" 
                            : "bg-background border-border hover:border-[#2563EB]/50"
                        )}
                        onClick={() => handleTypeClick(type.value)}
                      >
                        <Icon className={cn(
                          "w-4 h-4 transition-colors", 
                          isSelected ? "text-white" : "text-[#2563EB] group-hover:text-[#2563EB]"
                        )} />
                        <span className={cn(
                          "text-sm transition-colors",
                          isSelected ? "text-white" : "text-foreground group-hover:text-[#2563EB]"
                        )}>{type.label}</span>
                      </Button>
                    );
                  })}</div>
                )}

                {/* Display all selected forms in reverse order (most recent at top) */}
                {selectedTypes.length === 0 ? (
                  <Card className="border-dashed min-h-[400px] flex flex-col items-center justify-center p-8">
                    <p className="text-sm font-medium text-muted-foreground mb-1">No Appointments</p>
                    <p className="text-xs text-muted-foreground">Booking appointments will appear here</p>
                  </Card>
                ) : (
                  <>
                    {[...selectedTypes].reverse().map((type) => {
                        if (type === "laboratory" && laboratoryData) {
                          return (
                            <LaboratoryBookingForm
                              key={`laboratory-${requestData?.orderId || 'default'}`}
                              onRemove={isSingleAppointmentMode || isFromScheduledRequests ? undefined : handleRemoveLaboratory}
                              onUpdate={handleLaboratoryUpdate}
                              initialData={laboratoryData}
                              hideMode={isSingleAppointmentMode || isFromScheduledRequests}
                            />
                          );
                        }
                        if (type === "consultation" && consultationData) {
                          return (
                            <div key="consultation-group" className="space-y-6">
                              <DynamicConsultationBookingForm
                                key={`consultation-${requestData?.requestId || 'default'}`}
                                onRemove={isSingleAppointmentMode || isFromScheduledRequests ? undefined : handleRemoveConsultation}
                                onUpdate={handleConsultationUpdate}
                                initialData={consultationData}
                                onAddAnother={isSingleAppointmentMode || isFromScheduledRequests ? undefined : handleAddAnotherConsultation}
                              />
                              {additionalConsultations.map((consultation) => (
                                <DynamicConsultationBookingForm
                                  key={consultation.id}
                                  onRemove={() => handleRemoveAdditionalConsultation(consultation.id)}
                                  onUpdate={(data) => handleAdditionalConsultationUpdate(consultation.id, data)}
                                  initialData={consultation.data}
                                />
                              ))}
                            </div>
                          );
                        }
                      if (type === "ipd" && ipdAdmissionData) {
                        return (
                          <IPDAdmissionBookingForm
                            key="ipd"
                            onRemove={handleRemoveIPDAdmission}
                            onUpdate={handleIPDAdmissionUpdate}
                            onServicesChange={handleServicesChange}
                          />
                        );
                      }
                      return null;
                    })}
                  </>
                )}

              </div>

              {/* Appointment Summary Sidebar - with top margin to align with content below buttons */}
              <div className={cn(!isSingleAppointmentMode && !isFromScheduledRequests && !isIPAdmissionFlow && "mt-[60px]")}>
                <AppointmentSummaryCard
                patientName={requestData?.patient || "Siva Karthikeyan"}
                patientId={`GDID - ${requestData?.gdid || "009"}`}
                patientAgeSex={requestData?.ageSex || "35 | M"}
                visitId={visitId}
                selectedTypes={selectedTypes}
                consultationData={consultationData}
                laboratoryData={laboratoryData}
                ipdAdmissionData={ipdAdmissionData}
                servicesCart={servicesCart}
                pricing={{
                  lineItems: pricing.lineItems,
                  totals: pricing.totals,
                  updateLineItemPrice: pricing.updateLineItemPrice,
                  applyLineDiscount: pricing.applyLineDiscount,
                  waiveOffItem: pricing.waiveOffItem,
                }}
                servicesTotals={servicesTotals}
                onRemoveConsultation={handleRemoveConsultation}
                onRemoveLaboratory={handleRemoveLaboratory}
                onRemoveIPDAdmission={handleRemoveIPDAdmission}
                onRemoveLabTest={handleRemoveLabTest}
                onRemoveLabPackage={handleRemoveLabPackage}
                onRemoveRadiologyTest={handleRemoveRadiologyTest}
                onRemoveService={handleRemoveService}
                onClearServices={handleClearServices}
                onOpenModal={handleOpenModal}
              />
              </div>
            </div>
          
          {/* Footer - Different for single vs multi-appointment mode */}
          {isSingleAppointmentMode ? (
            <BookingStickyFooter
              totals={{
                ...pricing.totals,
                netPayable: pricing.totals.netPayable + servicesTotals.netPayable,
              }}
              itemCount={pricing.lineItems.length + servicesCart.length}
              onAskConfirmation={handleAskConfirmation}
              onSchedule={handleSchedule}
              isScheduleDisabled={!validateAppointmentData()}
            />
          ) : (
            <StickyFooterBar
              totals={{
                ...pricing.totals,
                netPayable: pricing.totals.netPayable + servicesTotals.netPayable,
              }}
              itemCount={pricing.lineItems.length + servicesCart.length}
              singleConsultationMode={!!appointmentType && selectedTypes.length === 1 && (selectedTypes[0] === 'consultation' || selectedTypes[0] === 'laboratory')}
              onAskConfirmation={handleAskConfirmation}
              onScheduleNow={handleSchedule}
              isScheduleDisabled={!validateAppointmentData()}
              onGenerateInvoice={() => {
                const { subtotal, netPayable } = pricing.totals;
                const items = pricing.lineItems.map(item => {
                  let price = item.overridePrice ?? item.basePrice;
                  
                  // Apply line discount if present
                  if (item.lineDiscountAmount) {
                    price = price - item.lineDiscountAmount;
                  } else if (item.lineDiscountPercent) {
                    price = price - (price * item.lineDiscountPercent / 100);
                  }
                  
                  return {
                    name: item.name,
                    price: price,
                  };
                });
                
                // Add services to items
                const servicesItems = servicesCart.map(item => ({
                  name: item.name,
                  price: calcLineTotal(item),
                }));
                
                navigate("/payment", {
                  state: {
                    appointmentType: selectedTypes.join(", "),
                    items: [...items, ...servicesItems],
                    subtotal: subtotal + servicesTotals.subtotal,
                    total: netPayable + servicesTotals.netPayable,
                    date: format(new Date(), "dd/MM/yyyy"),
                    fromPatientInsights,
                    patientId
                  }
                });
              }}
            />
          )}
          
          {/* Adjust Price Modal */}
          {selectedItemForModal && (
            <AdjustPriceModal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              item={selectedItemForModal}
              onApply={handleApplyModalChanges}
              policy={{
                floorPrice: selectedItemForModal.floorPrice,
                discountThresholdPercent: pricing.policy.discountThresholdPercent,
              }}
            />
          )}
          
          {/* Confirmation Modal */}
          <ConfirmationModal
            open={confirmationModalOpen}
            onOpenChange={setConfirmationModalOpen}
            onConfirm={handleSendConfirmation}
            appointmentDetails={getAppointmentDetails()}
          />
        </main>
      </PageContent>
    </div>
  );
};

export default BookAppointment;
