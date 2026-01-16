// Types for Lab Diagnostics AI responses

export type DiagnosticStatus = "ok" | "attention" | "block";
export type HighlightLevel = "none" | "yellow" | "red";
export type BannerType = "warning" | "info" | "critical";
export type ChecklistStatus = "ok" | "needs_attention" | "pending";
export type ActionType = "repeat_run" | "recollect" | "alert_physician" | "reflex_order" | "convert_units" | "compute_egfr";

export interface DiagnosticsSummary {
  status: DiagnosticStatus;
  reasons: string[];
}

export interface TestDelta {
  pctChange: number | null;
  flag: boolean;
}

export interface TestCritical {
  isCritical: boolean;
  policyRef: string | null;
}

export interface TestAction {
  type: ActionType;
  detail: string;
}

export interface TestUI {
  badge: "H" | "L" | "C" | "N";
  highlight: HighlightLevel;
  tooltip: string;
}

export interface PerTestDiagnostics {
  testId: string;
  flags: string[];
  delta: TestDelta;
  critical: TestCritical;
  issues: string[];
  actions: TestAction[];
  ui: TestUI;
}

export interface DerivedValue {
  name: string;
  value: number | null;
  unit: string;
  status: "computed" | "blocked";
  reasonIfBlocked: string | null;
}

export interface ReflexSuggestion {
  testId: string;
  reason: string;
}

export interface CriticalAlert {
  testId: string;
  value: number;
  policyRef: string;
  recommendedAction: string;
}

export interface ChecklistItem {
  item: string;
  status: ChecklistStatus;
}

export interface PageBanner {
  type: BannerType;
  text: string;
}

export interface UIDirectives {
  pageBanners: PageBanner[];
  autoFocus: { section: "Critical" | "All Tests" | "Narratives" };
  blockRelease: boolean;
}

export interface AuditInfo {
  generatedAt: string;
  engine: {
    rulesVersion: string;
    model: string;
  };
}

export interface LabDiagnosticsResponse {
  summary: DiagnosticsSummary;
  perTest: PerTestDiagnostics[];
  derived: DerivedValue[];
  reflexSuggestions: ReflexSuggestion[];
  criticalAlerts: CriticalAlert[];
  narrativeDraft: string;
  commentsDraft: string;
  validationChecklist: ChecklistItem[];
  uiDirectives: UIDirectives;
  audit: AuditInfo;
}

// Request payload types
export interface LabDiagnosticsContext {
  userRole: "tech" | "pathologist";
  facilityPolicies?: Record<string, unknown>;
  testCatalog?: Record<string, unknown>;
  referenceRanges?: Record<string, unknown>;
  mappingConfig?: Record<string, unknown>;
}

export interface LabDiagnosticsPatient {
  mrn: string;
  age: number;
  sex: "F" | "M" | "Other";
  allergies?: string[];
  diagnosticHints?: Record<string, unknown>;
}

export interface LabDiagnosticsSpecimen {
  type: string;
  collectionTime: string;
  receivedTime: string;
  analyzerId?: string;
  hilIndices?: {
    hemolysis: number;
    lipemia: number;
    icterus: number;
  };
  flags?: string[];
}

export interface LabDiagnosticsTest {
  testId: string;
  name: string;
  loinc: string;
  value: number | string | null;
  unit: string;
  refRange: {
    low: number | null;
    high: number | null;
    text: string;
  };
  critical?: {
    low: number | null;
    high: number | null;
  };
  prior?: {
    value: number | null;
    time: string;
  };
  deltaCheckRuleId?: string;
  instrumentFlags?: string[];
  status: "final" | "prelim" | "repeat" | "invalid";
  notes?: string;
}

export interface LabDiagnosticsQC {
  status: "pass" | "fail";
  details: {
    lastQC: string;
    lot: string;
    calibration: "ok" | "due" | "failed";
    analyzerStatus: "ok" | "warning" | "error";
  };
}

export interface LabDiagnosticsOrder {
  orderId: string;
  encounterId: string;
  physician: string;
  specimen: LabDiagnosticsSpecimen;
  panels: string[];
  tests: LabDiagnosticsTest[];
  qc: LabDiagnosticsQC;
}

export interface LabDiagnosticsPayload {
  context: LabDiagnosticsContext;
  patient: LabDiagnosticsPatient;
  order: LabDiagnosticsOrder;
}
