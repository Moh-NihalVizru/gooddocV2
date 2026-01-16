import {
  TestDefinition,
  TestResult,
  FlagType,
  PatientContext,
  ReferenceRange,
  UnitDefinition,
} from "@/types/lab-tests";
import { getTestDefinition } from "@/data/tests-catalog";

/**
 * Convert a value from one unit to SI (canonical) units
 */
export function convertToSI(
  value: number,
  unit: string,
  testDef: TestDefinition
): number {
  const unitDef = testDef.units.find((u) => u.code === unit);
  if (!unitDef) return value;
  return value * unitDef.toSI;
}

/**
 * Convert a value from SI to display unit
 */
export function convertFromSI(
  valueSI: number,
  unit: string,
  testDef: TestDefinition
): number {
  const unitDef = testDef.units.find((u) => u.code === unit);
  if (!unitDef || unitDef.toSI === 0) return valueSI;
  return valueSI / unitDef.toSI;
}

/**
 * Get the appropriate reference range for patient context
 */
export function getApplicableRefRange(
  testDef: TestDefinition,
  patient: PatientContext
): ReferenceRange | null {
  // Find most specific match (sex + age)
  for (const range of testDef.referenceRanges) {
    const sexMatch = range.sex === "any" || range.sex === patient.sex;
    const ageMatch =
      patient.age >= range.age.minY && patient.age < range.age.maxY;
    if (sexMatch && ageMatch) {
      return range;
    }
  }
  // Fallback to first range
  return testDef.referenceRanges[0] || null;
}

/**
 * Format reference range for display in given unit
 */
export function formatRefRange(
  testDef: TestDefinition,
  patient: PatientContext,
  displayUnit: string
): string {
  const range = getApplicableRefRange(testDef, patient);
  if (!range) return "—";

  const unitDef = testDef.units.find((u) => u.code === displayUnit);
  const decimals = unitDef?.decimals ?? 1;

  const lowDisplay =
    range.lowSI !== null
      ? convertFromSI(range.lowSI, displayUnit, testDef).toFixed(decimals)
      : null;
  const highDisplay =
    range.highSI !== null
      ? convertFromSI(range.highSI, displayUnit, testDef).toFixed(decimals)
      : null;

  if (lowDisplay === null && highDisplay !== null) {
    return `< ${highDisplay}`;
  }
  if (lowDisplay !== null && highDisplay === null) {
    return `> ${lowDisplay}`;
  }
  if (lowDisplay !== null && highDisplay !== null) {
    return `${lowDisplay} - ${highDisplay}`;
  }
  return "—";
}

/**
 * Calculate flag based on value and reference/critical ranges
 */
export function calculateFlag(
  valueSI: number | null,
  testDef: TestDefinition,
  patient: PatientContext
): FlagType {
  if (valueSI === null || isNaN(valueSI)) return "N";

  // Check critical ranges first
  for (const crit of testDef.criticalRanges) {
    if (crit.highSI !== null && valueSI >= crit.highSI) return "C";
    if (crit.lowSI !== null && valueSI <= crit.lowSI) return "C";
  }

  // Check reference ranges
  const refRange = getApplicableRefRange(testDef, patient);
  if (refRange) {
    if (refRange.highSI !== null && valueSI > refRange.highSI) return "H";
    if (refRange.lowSI !== null && valueSI < refRange.lowSI) return "L";
  }

  return "N";
}

/**
 * Calculate delta percentage from prior value
 */
export function calculateDelta(
  currentSI: number | null,
  priorSI: number | null
): number | null {
  if (
    currentSI === null ||
    priorSI === null ||
    priorSI === 0 ||
    isNaN(currentSI) ||
    isNaN(priorSI)
  ) {
    return null;
  }
  return Math.round(((currentSI - priorSI) / priorSI) * 100);
}

/**
 * Get unit definition
 */
export function getUnitDef(
  testDef: TestDefinition,
  unitCode: string
): UnitDefinition | undefined {
  return testDef.units.find((u) => u.code === unitCode);
}

/**
 * Format value with proper decimals for unit
 */
export function formatValue(
  value: number,
  testDef: TestDefinition,
  unit: string
): string {
  const unitDef = getUnitDef(testDef, unit);
  const decimals = unitDef?.decimals ?? 2;
  return value.toFixed(decimals);
}

// ============= Calculated Test Formulas =============

interface CalcContext {
  results: Map<string, number>; // testId -> valueSI
  patient: PatientContext;
}

type CalcFormula = (ctx: CalcContext) => number | null;

const formulas: Record<string, CalcFormula> = {
  // CK-MB Index = (CK-MB / CK_total) * 100
  ck_mb_index: (ctx) => {
    const ckMb = ctx.results.get("ck_mb");
    const ckTotal = ctx.results.get("ck_total");
    if (ckMb === undefined || ckTotal === undefined || ckTotal === 0)
      return null;
    return (ckMb / ckTotal) * 100;
  },

  // Anion Gap = Na - (Cl + CO2)
  anion_gap: (ctx) => {
    const na = ctx.results.get("sodium");
    const cl = ctx.results.get("chloride");
    const co2 = ctx.results.get("co2_bicarb");
    if (na === undefined || cl === undefined || co2 === undefined) return null;
    return na - (cl + co2);
  },

  // eGFR CKD-EPI 2021 (simplified without race)
  ckd_epi_2021: (ctx) => {
    const creat = ctx.results.get("creatinine");
    if (creat === undefined || creat <= 0) return null;

    const age = ctx.patient.age;
    const isFemale = ctx.patient.sex === "F";

    // CKD-EPI 2021 equation constants
    const kappa = isFemale ? 0.7 : 0.9;
    const alpha = isFemale ? -0.241 : -0.302;
    const multiplier = isFemale ? 1.012 : 1.0;

    const minRatio = Math.min(creat / kappa, 1);
    const maxRatio = Math.max(creat / kappa, 1);

    const egfr =
      142 *
      Math.pow(minRatio, alpha) *
      Math.pow(maxRatio, -1.2) *
      Math.pow(0.9938, age) *
      multiplier;

    return Math.round(egfr);
  },
};

/**
 * Calculate value for a calculated test
 */
export function computeCalculatedValue(
  testDef: TestDefinition,
  allResults: Map<string, number>,
  patient: PatientContext
): number | null {
  if (testDef.kind !== "calculated" || !testDef.formula) return null;

  const formula = formulas[testDef.formula];
  if (!formula) {
    console.warn(`Unknown formula: ${testDef.formula}`);
    return null;
  }

  return formula({ results: allResults, patient });
}

/**
 * Check if all dependencies are satisfied for a calculated test
 */
export function hasDependencies(
  testDef: TestDefinition,
  availableTestIds: Set<string>
): boolean {
  if (!testDef.dependencies) return true;
  return testDef.dependencies.every(
    (dep) => availableTestIds.has(dep) || dep.endsWith("?")
  );
}

/**
 * Parse a numeric value from string
 */
export function parseNumericValue(value: string): number | null {
  const cleaned = value.replace(/[<>≤≥]/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}
