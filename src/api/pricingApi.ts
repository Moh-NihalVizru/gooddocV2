import { useMutation, useQuery } from "@tanstack/react-query";
import { PricingItemFormData } from "@/types/pricing-item";

// Mock data
const MOCK_DEPARTMENTS = [
  "Cardiology",
  "Pathology",
  "Radiology",
  "General Medicine",
  "Surgery",
  "Orthopedics",
  "Pediatrics",
  "Preventive Care",
  "Critical Care",
];

const MOCK_BRANCHES = [
  { id: "branch-001", name: "Main Hospital" },
  { id: "branch-002", name: "Branch A" },
  { id: "branch-003", name: "Branch B" },
];

const MOCK_CATEGORIES = [
  "Lab Test",
  "Doctor Fee",
  "Procedure",
  "Imaging",
  "Room",
  "Pharmacy",
  "Package",
];

// Store used codes in memory
const usedInternalCodes = new Set(["LAB-0001", "DOC-0001", "PROC-0001"]);

/**
 * Get list of departments
 */
export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      return MOCK_DEPARTMENTS;
    },
  });
}

/**
 * Get list of branches
 */
export function useBranches() {
  return useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return MOCK_BRANCHES;
    },
  });
}

/**
 * Get list of categories
 */
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return MOCK_CATEGORIES;
    },
  });
}

/**
 * Check if internal code is unique
 */
export async function checkInternalCodeUnique(code: string): Promise<{ unique: boolean }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const upperCode = code.toUpperCase().trim();
  const isUnique = !usedInternalCodes.has(upperCode);
  
  return { unique: isUnique };
}

/**
 * Create new pricing item
 */
export function useCreatePricingItem() {
  return useMutation({
    mutationFn: async (data: PricingItemFormData): Promise<PricingItemFormData & { id: string }> => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Add the internal code to used codes
      usedInternalCodes.add(data.codes.internal);
      
      // Mock response with generated ID
      return {
        ...data,
        id: `price-${Date.now()}`,
      };
    },
  });
}

/**
 * Update existing pricing item
 */
export function useUpdatePricingItem() {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: PricingItemFormData;
    }): Promise<PricingItemFormData & { id: string }> => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      return {
        ...data,
        id,
      };
    },
  });
}
