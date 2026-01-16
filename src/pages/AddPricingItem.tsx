import { ChevronLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { PageContent } from "@/components/PageContent";
import { AddItemForm } from "@/components/pricing/AddItemForm";
import { PricingItem } from "@/types/pricing-catalog";

export default function AddPricingItem() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get edit item from navigation state
  const editItem = (location.state as { editItem?: PricingItem })?.editItem;
  const isEditMode = !!editItem;

  // Transform PricingItem to form data format
  const initialData = editItem ? {
    name: editItem.name,
    category: editItem.category,
    department: editItem.department,
    description: editItem.description,
    patientDescription: editItem.description,
    codes: editItem.codes,
    unit: editItem.unit as "day" | "each" | "package" | "procedure" | "session" | "test",
    visibility: editItem.visibility,
    status: editItem.status,
    pricing: {
      currency: editItem.pricing.currency,
      cost: editItem.pricing.cost / 100, // Convert from paise to rupees
      basePrice: editItem.pricing.basePrice / 100,
      markupPct: editItem.pricing.markupPct,
      discountPct: editItem.pricing.discountPct,
      taxPct: editItem.pricing.taxPct,
      netPrice: editItem.pricing.netPrice / 100,
    },
    requiresDoctorOrder: editItem.requiresDoctorOrder,
    availability: editItem.availability,
    turnaroundTime: editItem.turnaroundTime,
    slaNote: editItem.slaNote,
    prepInstructions: editItem.prepInstructions,
    tags: editItem.tags,
    branchOverrides: editItem.branchOverrides,
  } : undefined;

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <PageContent>
        <AppHeader breadcrumbs={["Pricing Catalog", isEditMode ? "Edit Item" : "Add Item"]} />

        <main className="p-6 pb-6">
          <div className="max-w-5xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => navigate("/pricing-catalog")}
              className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors mb-6"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="font-semibold">Back to Catalog</span>
            </button>


            {/* Form */}
            <AddItemForm mode={isEditMode ? "edit" : "create"} initialData={initialData} />
          </div>
        </main>
      </PageContent>
    </div>
  );
}