import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  LabDiagnosticsPayload, 
  LabDiagnosticsResponse,
  LabDiagnosticsTest,
  PerTestDiagnostics
} from "@/types/lab-diagnostics-ai";
import { LabResultRow } from "./useLabResults";
import { PatientContext, TestDefinition } from "@/types/lab-tests";
import { formatRefRange } from "@/lib/labResultsEngine";

interface UseLabDiagnosticsAIProps {
  orderId: string;
  patient: PatientContext & { mrn: string };
  physician: string;
  panels: string[];
}

interface UseLabDiagnosticsAIReturn {
  analyze: (rows: LabResultRow[], testDefinitions: Map<string, TestDefinition>) => Promise<void>;
  response: LabDiagnosticsResponse | null;
  isAnalyzing: boolean;
  error: string | null;
  getTestDiagnostics: (testId: string) => PerTestDiagnostics | undefined;
  clearResponse: () => void;
}

export function useLabDiagnosticsAI({
  orderId,
  patient,
  physician,
  panels,
}: UseLabDiagnosticsAIProps): UseLabDiagnosticsAIReturn {
  const [response, setResponse] = useState<LabDiagnosticsResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildPayload = useCallback(
    (rows: LabResultRow[], testDefinitions: Map<string, TestDefinition>): LabDiagnosticsPayload => {
      // Convert rows to the API format
      const tests: LabDiagnosticsTest[] = rows.map((row) => {
        const testDef = testDefinitions.get(row.testId);
        const refRangeText = testDef 
          ? formatRefRange(testDef, patient, row.unit) 
          : "—";
        
        // Parse reference range text to get low/high
        let refLow: number | null = null;
        let refHigh: number | null = null;
        
        if (refRangeText.includes("-")) {
          const parts = refRangeText.split("-").map((p) => parseFloat(p.trim()));
          if (parts.length === 2) {
            refLow = isNaN(parts[0]) ? null : parts[0];
            refHigh = isNaN(parts[1]) ? null : parts[1];
          }
        } else if (refRangeText.startsWith("<")) {
          refHigh = parseFloat(refRangeText.replace("<", "").trim());
        } else if (refRangeText.startsWith(">")) {
          refLow = parseFloat(refRangeText.replace(">", "").trim());
        }

        return {
          testId: row.testId,
          name: row.testDef.displayName,
          loinc: testDef?.loinc || row.testDef.loinc,
          value: row.valueSI,
          unit: row.unit,
          refRange: {
            low: refLow,
            high: refHigh,
            text: refRangeText,
          },
          prior: row.priorValueSI !== null
            ? { value: row.priorValueSI, time: new Date().toISOString() }
            : undefined,
          instrumentFlags: [],
          status: "prelim" as const,
        };
      });

      return {
        context: {
          userRole: "tech",
        },
        patient: {
          mrn: patient.mrn,
          age: patient.age,
          sex: patient.sex === "M" ? "M" : patient.sex === "F" ? "F" : "Other",
        },
        order: {
          orderId,
          encounterId: orderId,
          physician,
          specimen: {
            type: "Serum",
            collectionTime: new Date().toISOString(),
            receivedTime: new Date().toISOString(),
          },
          panels,
          tests,
          qc: {
            status: "pass",
            details: {
              lastQC: new Date().toISOString(),
              lot: "LOT-2024-001",
              calibration: "ok",
              analyzerStatus: "ok",
            },
          },
        },
      };
    },
    [orderId, patient, physician, panels]
  );

  const analyze = useCallback(
    async (rows: LabResultRow[], testDefinitions: Map<string, TestDefinition>) => {
      setIsAnalyzing(true);
      setError(null);

      try {
        const payload = buildPayload(rows, testDefinitions);

        const { data, error: fnError } = await supabase.functions.invoke(
          "lab-diagnostics-ai",
          { body: payload }
        );

        if (fnError) {
          throw new Error(fnError.message);
        }

        if (data?.error) {
          throw new Error(data.error);
        }

        setResponse(data as LabDiagnosticsResponse);
      } catch (err) {
        console.error("Lab diagnostics AI error:", err);
        setError(err instanceof Error ? err.message : "Failed to analyze results");
      } finally {
        setIsAnalyzing(false);
      }
    },
    [buildPayload]
  );

  const getTestDiagnostics = useCallback(
    (testId: string): PerTestDiagnostics | undefined => {
      return response?.perTest.find((t) => t.testId === testId);
    },
    [response]
  );

  const clearResponse = useCallback(() => {
    setResponse(null);
    setError(null);
  }, []);

  return {
    analyze,
    response,
    isAnalyzing,
    error,
    getTestDiagnostics,
    clearResponse,
  };
}
