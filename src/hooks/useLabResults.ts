import { useState, useCallback, useMemo } from "react";
import {
  TestDefinition,
  TestResult,
  FlagType,
  PatientContext,
} from "@/types/lab-tests";
import {
  getTestsByPanel,
  getTestDefinition,
  searchTests,
} from "@/data/tests-catalog";
import {
  convertToSI,
  calculateFlag,
  calculateDelta,
  computeCalculatedValue,
  parseNumericValue,
  formatRefRange,
} from "@/lib/labResultsEngine";

export interface LabResultRow {
  id: string;
  testId: string;
  testDef: TestDefinition;
  value: string;
  unit: string;
  valueSI: number | null;
  flag: FlagType;
  priorValue: string | null;
  priorValueSI: number | null;
  deltaPct: number | null;
  refRangeText: string;
  isDirty: boolean;
}

interface UseLabResultsProps {
  patient: PatientContext;
  initialResults?: Partial<TestResult>[];
}

export function useLabResults({ patient, initialResults = [] }: UseLabResultsProps) {
  // Active test rows
  const [rows, setRows] = useState<LabResultRow[]>(() => {
    return initialResults
      .map((r) => {
        const testDef = getTestDefinition(r.testId || "");
        if (!testDef) return null;

        const unit = r.unit || testDef.defaultUnit;
        const numValue = r.value ? parseNumericValue(r.value) : null;
        const valueSI =
          numValue !== null ? convertToSI(numValue, unit, testDef) : null;
        const priorNumValue = r.priorValue
          ? parseNumericValue(r.priorValue)
          : null;
        const priorValueSI =
          priorNumValue !== null
            ? convertToSI(priorNumValue, unit, testDef)
            : null;

        return {
          id: r.id || `row-${r.testId}`,
          testId: r.testId || "",
          testDef,
          value: r.value || "",
          unit,
          valueSI,
          flag: calculateFlag(valueSI, testDef, patient),
          priorValue: r.priorValue || null,
          priorValueSI,
          deltaPct: calculateDelta(valueSI, priorValueSI),
          refRangeText: formatRefRange(testDef, patient, unit),
          isDirty: false,
        } as LabResultRow;
      })
      .filter((r): r is LabResultRow => r !== null);
  });

  // Get all SI values for calculated fields
  const allSIValues = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((r) => {
      if (r.valueSI !== null) {
        map.set(r.testId, r.valueSI);
      }
    });
    return map;
  }, [rows]);

  // Update a row's value
  const updateValue = useCallback(
    (rowId: string, newValue: string) => {
      setRows((prev) =>
        prev.map((row) => {
          if (row.id !== rowId) return row;

          const numValue = parseNumericValue(newValue);
          const valueSI =
            numValue !== null
              ? convertToSI(numValue, row.unit, row.testDef)
              : null;

          return {
            ...row,
            value: newValue,
            valueSI,
            flag: calculateFlag(valueSI, row.testDef, patient),
            deltaPct: calculateDelta(valueSI, row.priorValueSI),
            isDirty: true,
          };
        })
      );
    },
    [patient]
  );

  // Update a row's unit (with value conversion)
  const updateUnit = useCallback(
    (rowId: string, newUnit: string) => {
      setRows((prev) =>
        prev.map((row) => {
          if (row.id !== rowId) return row;

          // Keep SI value the same, just update display
          const numValue = parseNumericValue(row.value);
          const valueSI =
            numValue !== null
              ? convertToSI(numValue, row.unit, row.testDef)
              : null;

          return {
            ...row,
            unit: newUnit,
            refRangeText: formatRefRange(row.testDef, patient, newUnit),
            isDirty: true,
          };
        })
      );
    },
    [patient]
  );

  // Add a new test row
  const addTest = useCallback(
    (testId: string) => {
      const testDef = getTestDefinition(testId);
      if (!testDef) return;

      // Check if already exists
      if (rows.some((r) => r.testId === testId)) return;

      const newRow: LabResultRow = {
        id: `row-${testId}-${Date.now()}`,
        testId,
        testDef,
        value: "",
        unit: testDef.defaultUnit,
        valueSI: null,
        flag: "N",
        priorValue: null,
        priorValueSI: null,
        deltaPct: null,
        refRangeText: formatRefRange(testDef, patient, testDef.defaultUnit),
        isDirty: true,
      };

      setRows((prev) => [...prev, newRow]);
    },
    [rows, patient]
  );

  // Remove a test row
  const removeTest = useCallback((rowId: string) => {
    setRows((prev) => prev.filter((r) => r.id !== rowId));
  }, []);

  // Recalculate all calculated fields
  const recalculateAll = useCallback(() => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.testDef.kind !== "calculated") return row;

        const computedSI = computeCalculatedValue(
          row.testDef,
          allSIValues,
          patient
        );
        if (computedSI === null) return row;

        const unitDef = row.testDef.units.find((u) => u.code === row.unit);
        const displayValue =
          unitDef && unitDef.toSI !== 0
            ? (computedSI / unitDef.toSI).toFixed(unitDef.decimals)
            : computedSI.toFixed(0);

        return {
          ...row,
          value: displayValue,
          valueSI: computedSI,
          flag: calculateFlag(computedSI, row.testDef, patient),
          deltaPct: calculateDelta(computedSI, row.priorValueSI),
        };
      })
    );
  }, [allSIValues, patient]);

  // Filter rows by panel
  const getRowsByPanel = useCallback(
    (panelId: string) => {
      if (panelId === "all") return rows;
      return rows.filter((r) => r.testDef.panels.includes(panelId));
    },
    [rows]
  );

  // Get available tests not yet added
  const getAvailableTests = useCallback(
    (panelId: string) => {
      const panelTests = getTestsByPanel(panelId);
      const existingIds = new Set(rows.map((r) => r.testId));
      return panelTests.filter((t) => !existingIds.has(t.id));
    },
    [rows]
  );

  // Search available tests
  const searchAvailableTests = useCallback(
    (query: string) => {
      const results = searchTests(query);
      const existingIds = new Set(rows.map((r) => r.testId));
      return results.filter((t) => !existingIds.has(t.id));
    },
    [rows]
  );

  // Check for critical values
  const hasCriticalValues = useMemo(() => {
    return rows.some((r) => r.flag === "C");
  }, [rows]);

  // Get dirty rows
  const dirtyRows = useMemo(() => {
    return rows.filter((r) => r.isDirty);
  }, [rows]);

  // Mark all as saved
  const markAllSaved = useCallback(() => {
    setRows((prev) => prev.map((r) => ({ ...r, isDirty: false })));
  }, []);

  return {
    rows,
    updateValue,
    updateUnit,
    addTest,
    removeTest,
    recalculateAll,
    getRowsByPanel,
    getAvailableTests,
    searchAvailableTests,
    hasCriticalValues,
    dirtyRows,
    markAllSaved,
  };
}
