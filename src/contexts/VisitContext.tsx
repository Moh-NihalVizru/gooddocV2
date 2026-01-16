import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export interface VisitOption {
  id: string;
  visitId: string;
  datetime: Date;
  doctor?: string;
  department?: string;
  status: string;
  type: string;
  isActive: boolean;
}

interface VisitContextType {
  selectedVisitId: string | null;
  setSelectedVisitId: (id: string) => void;
  visits: VisitOption[];
  setVisits: (visits: VisitOption[]) => void;
  selectedVisit: VisitOption | null;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const VisitContext = createContext<VisitContextType | undefined>(undefined);

export function VisitProvider({ children }: { children: React.ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [visits, setVisits] = useState<VisitOption[]>([]);
  const [selectedVisitId, setSelectedVisitIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Sync URL to state on mount and when visits change
  useEffect(() => {
    if (visits.length === 0 || initialized) return;

    const urlVisitId = searchParams.get("visitId");
    const activeVisit = visits.find((v) => v.isActive);
    const mostRecentVisit = [...visits].sort(
      (a, b) => b.datetime.getTime() - a.datetime.getTime()
    )[0];

    let targetVisit: VisitOption | undefined;

    if (urlVisitId) {
      targetVisit = visits.find((v) => v.visitId === urlVisitId);
      if (!targetVisit) {
        toast.info("Visit not found, showing active visit");
        targetVisit = activeVisit || mostRecentVisit;
      }
    } else {
      targetVisit = activeVisit || mostRecentVisit;
    }

    if (targetVisit) {
      setSelectedVisitIdState(targetVisit.visitId);
      // Update URL without adding to history
      const newParams = new URLSearchParams(searchParams);
      newParams.set("visitId", targetVisit.visitId);
      setSearchParams(newParams, { replace: true });
    }

    setInitialized(true);
  }, [visits, searchParams, setSearchParams, initialized]);

  // Update URL when selection changes (after initialization)
  const setSelectedVisitId = useCallback(
    (visitId: string) => {
      // Allow "all" as a special value
      if (visitId === "all") {
        setSelectedVisitIdState("all");
        const newParams = new URLSearchParams(searchParams);
        newParams.set("visitId", "all");
        setSearchParams(newParams, { replace: true });
        return;
      }

      const visit = visits.find((v) => v.visitId === visitId);
      if (!visit) {
        toast.error("Visit not available");
        return;
      }

      setSelectedVisitIdState(visitId);
      const newParams = new URLSearchParams(searchParams);
      newParams.set("visitId", visitId);
      setSearchParams(newParams, { replace: true });
    },
    [visits, searchParams, setSearchParams]
  );

  const selectedVisit = visits.find((v) => v.visitId === selectedVisitId) || null;

  return (
    <VisitContext.Provider
      value={{
        selectedVisitId,
        setSelectedVisitId,
        visits,
        setVisits,
        selectedVisit,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </VisitContext.Provider>
  );
}

export function useVisit() {
  const context = useContext(VisitContext);
  if (context === undefined) {
    throw new Error("useVisit must be used within a VisitProvider");
  }
  return context;
}
