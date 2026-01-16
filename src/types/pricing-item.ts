import { z } from "zod";

export const PricingCategoryEnum = z.enum([
  "Lab Test",
  "Doctor Fee",
  "Procedure",
  "Imaging",
  "Room",
  "Pharmacy",
  "Package",
]);

export const PricingStatusEnum = z.enum(["Draft", "Published", "Archived"]);

export const UnitEnum = z.enum(["each", "test", "session", "day", "package", "procedure"]);

export const VisibilityEnum = z.enum(["admin", "staff", "portal"]);

export const CurrencyEnum = z.enum(["INR", "USD", "EUR"]);

export const CodesSchema = z.object({
  internal: z
    .string()
    .min(1, "Internal code is required")
    .transform((val) => val.toUpperCase().trim()),
  cpt: z.string().optional(),
  icd: z.string().optional(),
  hcpcs: z.string().optional(),
});

export const PriceTierSchema = z.object({
  cash: z.number().min(0).optional(),
  insurance: z.number().min(0).optional(),
  corporate: z.number().min(0).optional(),
});

export const BranchOverrideSchema = z.object({
  branchId: z.string().min(1, "Branch is required"),
  branchName: z.string().optional(),
  currency: z.string().optional(),
  basePrice: z.number().min(0, "Base price must be positive").optional(),
  taxPct: z
    .number()
    .min(0, "Tax must be positive")
    .max(100, "Tax cannot exceed 100%")
    .optional(),
  netPrice: z.number().min(0).optional(),
});

export const PricingDetailsSchema = z.object({
  currency: CurrencyEnum,
  cost: z.number().min(0, "Cost must be positive").optional(),
  basePrice: z.number().min(0.01, "Base price must be greater than 0"),
  markupPct: z
    .number()
    .min(0, "Markup must be positive")
    .max(100, "Markup cannot exceed 100%")
    .optional()
    .default(0),
  discountPct: z
    .number()
    .min(0, "Discount must be positive")
    .max(100, "Discount cannot exceed 100%")
    .optional()
    .default(0),
  taxPct: z
    .number()
    .min(0, "Tax must be positive")
    .max(100, "Tax cannot exceed 100%")
    .optional()
    .default(0),
  netPrice: z.number().min(0),
  tiers: PriceTierSchema.optional(),
  effectiveFrom: z.string().optional(),
  effectiveTo: z.string().nullable().optional(),
});

export const PricingItemSchema = z
  .object({
    // Step 1: Basics
    name: z.string().min(3, "Name must be at least 3 characters"),
    category: PricingCategoryEnum,
    department: z.string().min(1, "Department is required"),
    description: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    codes: CodesSchema,
    unit: UnitEnum,
    visibility: VisibilityEnum,
    patientDescription: z.string().optional(),

    // Step 2: Pricing
    pricing: PricingDetailsSchema,
    branchOverrides: z.array(BranchOverrideSchema).optional().default([]),
    autoCalcNet: z.boolean().optional().default(true),

    // Step 3: Operational
    turnaroundTime: z.string().optional(),
    requiresDoctorOrder: z.boolean().optional().default(false),
    availability: z.enum(["In Stock", "Out of Stock", "N/A"]).optional().default("In Stock"),
    slaNote: z.string().optional(),
    prepInstructions: z.string().optional(),

    // Metadata
    status: PricingStatusEnum.default("Draft"),
  })
  .refine(
    (data) => {
      if (data.visibility === "portal") {
        return data.patientDescription && data.patientDescription.length >= 20;
      }
      return true;
    },
    {
      message: "Patient-facing description must be at least 20 characters for portal visibility",
      path: ["patientDescription"],
    }
  )
  .refine(
    (data) => {
      if (data.pricing.effectiveFrom && data.pricing.effectiveTo) {
        return new Date(data.pricing.effectiveFrom) <= new Date(data.pricing.effectiveTo);
      }
      return true;
    },
    {
      message: "Effective From date must be before or equal to Effective To date",
      path: ["pricing", "effectiveTo"],
    }
  );

export type PricingItemFormData = z.infer<typeof PricingItemSchema>;
export type PricingCategory = z.infer<typeof PricingCategoryEnum>;
export type PricingStatus = z.infer<typeof PricingStatusEnum>;
export type Unit = z.infer<typeof UnitEnum>;
export type Visibility = z.infer<typeof VisibilityEnum>;
export type Currency = z.infer<typeof CurrencyEnum>;
export type Codes = z.infer<typeof CodesSchema>;
export type PriceTier = z.infer<typeof PriceTierSchema>;
export type BranchOverride = z.infer<typeof BranchOverrideSchema>;
export type PricingDetails = z.infer<typeof PricingDetailsSchema>;
