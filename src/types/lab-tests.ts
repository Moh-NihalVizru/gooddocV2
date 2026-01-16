// Lab Test Definition Types - New Schema

export type TestKind = "numeric" | "categorical" | "calculated";
export type FlagType = "N" | "H" | "L" | "C";
export type Sex = "M" | "F" | "any";

export interface UnitDefinition {
  code: string;
  toSI: number; // Conversion factor to SI unit
  decimals: number;
}

export interface AgeRange {
  minY: number;
  maxY: number;
}

export interface ReferenceRange {
  sex: Sex;
  age: AgeRange;
  lowSI: number | null;
  highSI: number | null;
}

export interface CriticalRange {
  lowSI: number | null;
  highSI: number | null;
}

export interface TestDefinition {
  id: string;
  displayName: string;
  loinc: string;
  kind: TestKind;
  defaultUnit: string;
  units: UnitDefinition[];
  referenceRanges: ReferenceRange[];
  criticalRanges: CriticalRange[];
  panels: string[];
  synonyms: string[];
  minSI?: number;
  maxSI?: number;
  notes?: string;
  // For categorical tests
  options?: string[];
  defaultOption?: string;
  // For calculated tests
  dependencies?: string[];
  formula?: string;
}

export interface PanelDefinition {
  id: string;
  name: string;
}

export interface TestResult {
  id: string;
  testId: string;
  patientId: string;
  encounterId: string;
  value: string;
  unit: string;
  valueSI: number | null;
  collectedAt: string;
  flag: FlagType;
  priorValue: string | null;
  priorValueSI: number | null;
  deltaPct: number | null;
  notes?: string;
  isCalculated?: boolean;
}

export interface PatientContext {
  age: number;
  sex: Sex;
}

export interface TestsCatalog {
  version: string;
  panels: PanelDefinition[];
  tests: TestDefinition[];
}
