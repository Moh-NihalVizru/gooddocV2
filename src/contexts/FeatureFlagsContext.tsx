import React, { createContext, useContext, useState } from 'react';
import { FeatureFlags } from '@/types/pricing';

// Default feature flags (all enabled for demonstration)
const defaultFlags: FeatureFlags = {
  priceEdit_inline: true,
  priceEdit_modal: false,
  priceEdit_lock: false, // Start unlocked for easier demo
  priceEdit_quickActions: true,
  globalDiscount_summary: true,
  globalDiscount_stickyBar: true,
  globalDiscount_wizard: false, // Advanced feature, disabled by default
  approval_required_below_floor: true,
};

interface FeatureFlagsContextType {
  flags: FeatureFlags;
  updateFlag: (key: keyof FeatureFlags, value: boolean) => void;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

export function FeatureFlagsProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlags>(defaultFlags);

  const updateFlag = (key: keyof FeatureFlags, value: boolean) => {
    setFlags((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <FeatureFlagsContext.Provider value={{ flags, updateFlag }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagsProvider');
  }
  return context;
}
