export interface RefRange {
  text: string;
  unit: string;
  low: number | null;
  high: number | null;
  inclusive: boolean;
}

export interface Critical {
  low: number | null;
  high: number | null;
}

export interface Calculation {
  formula: string;
  dependsOn: string[];
  notes: string;
}

export interface LabTest {
  id: string;
  panelId: string;
  name: string;
  loinc: string;
  specimen: string;
  resultType: "numeric" | "enum" | "text";
  defaultUnit: string;
  unitOptions: string[];
  decimals: number;
  refRange: RefRange;
  critical: Critical;
  isCalculated: boolean;
  calc: Calculation | null;
  tags: string[];
}

export interface Panel {
  id: string;
  name: string;
}

export interface LabTestsCatalog {
  version: string;
  panels: Panel[];
  flagLegend: Record<string, string>;
  flagLogic: string;
  deltaLogic: string;
  tests: LabTest[];
}

export const labTestsCatalog: LabTestsCatalog = {
  "version": "1.0",
  "panels": [
    { "id": "cardiac", "name": "Cardiac Panel" },
    { "id": "cbc", "name": "CBC" },
    { "id": "cmp", "name": "CMP" }
  ],
  "flagLegend": { "N": "Normal", "L": "Low", "H": "High", "C": "Critical" },
  "flagLogic": "If critical.high != null and value >= critical.high => C; else if critical.low != null and value <= critical.low => C; else if refRange.high != null and value > refRange.high => H; else if refRange.low != null and value < refRange.low => L; else => N",
  "deltaLogic": "If priorValue != null and priorValue != 0 then deltaPct = round(((value - priorValue)/priorValue) * 100) else null",
  "tests": [
    {
      "id": "troponin_i",
      "panelId": "cardiac",
      "name": "Troponin I",
      "loinc": "10839-9",
      "specimen": "Plasma/Serum",
      "resultType": "numeric",
      "defaultUnit": "ng/mL",
      "unitOptions": ["ng/mL"],
      "decimals": 2,
      "refRange": { "text": "< 0.04", "unit": "ng/mL", "low": null, "high": 0.04, "inclusive": false },
      "critical": { "low": null, "high": 0.40 },
      "isCalculated": false,
      "calc": null,
      "tags": ["cardiac", "ACS"]
    },
    {
      "id": "troponin_t",
      "panelId": "cardiac",
      "name": "Troponin T",
      "loinc": "6598-7",
      "specimen": "Plasma/Serum",
      "resultType": "numeric",
      "defaultUnit": "ng/mL",
      "unitOptions": ["ng/mL"],
      "decimals": 3,
      "refRange": { "text": "< 0.01", "unit": "ng/mL", "low": null, "high": 0.01, "inclusive": false },
      "critical": { "low": null, "high": 0.10 },
      "isCalculated": false,
      "calc": null,
      "tags": ["cardiac", "ACS"]
    },
    {
      "id": "ck_total",
      "panelId": "cardiac",
      "name": "Creatine Kinase (CK), Total",
      "loinc": "2157-6",
      "specimen": "Serum",
      "resultType": "numeric",
      "defaultUnit": "U/L",
      "unitOptions": ["U/L"],
      "decimals": 0,
      "refRange": { "text": "30 - 200", "unit": "U/L", "low": 30, "high": 200, "inclusive": true },
      "critical": { "low": null, "high": 2000 },
      "isCalculated": false,
      "calc": null,
      "tags": ["cardiac", "muscle"]
    },
    {
      "id": "ck_mb",
      "panelId": "cardiac",
      "name": "CK-MB (Mass)",
      "loinc": "13969-1",
      "specimen": "Serum",
      "resultType": "numeric",
      "defaultUnit": "ng/mL",
      "unitOptions": ["ng/mL"],
      "decimals": 1,
      "refRange": { "text": "0.0 - 5.0", "unit": "ng/mL", "low": 0, "high": 5.0, "inclusive": true },
      "critical": { "low": null, "high": 10.0 },
      "isCalculated": false,
      "calc": null,
      "tags": ["cardiac"]
    },
    {
      "id": "ck_mb_index",
      "panelId": "cardiac",
      "name": "CK-MB Index (calc)",
      "loinc": "",
      "specimen": "Serum",
      "resultType": "numeric",
      "defaultUnit": "%",
      "unitOptions": ["%"],
      "decimals": 1,
      "refRange": { "text": "0.0 - 3.0", "unit": "%", "low": 0.0, "high": 3.0, "inclusive": true },
      "critical": { "low": null, "high": 5.0 },
      "isCalculated": true,
      "calc": {
        "formula": "CK-MB Index = (CK-MB / CK_total) * 100",
        "dependsOn": ["ck_mb", "ck_total"],
        "notes": "Index >3% suggests cardiac source"
      },
      "tags": ["cardiac", "calculated"]
    },
    {
      "id": "bnp",
      "panelId": "cardiac",
      "name": "BNP",
      "loinc": "30934-4",
      "specimen": "Plasma",
      "resultType": "numeric",
      "defaultUnit": "pg/mL",
      "unitOptions": ["pg/mL"],
      "decimals": 0,
      "refRange": { "text": "< 100", "unit": "pg/mL", "low": null, "high": 100, "inclusive": false },
      "critical": { "low": null, "high": 400 },
      "isCalculated": false,
      "calc": null,
      "tags": ["cardiac", "HF"]
    },
    {
      "id": "ntprobnp",
      "panelId": "cardiac",
      "name": "NT-proBNP",
      "loinc": "33762-6",
      "specimen": "Plasma",
      "resultType": "numeric",
      "defaultUnit": "pg/mL",
      "unitOptions": ["pg/mL"],
      "decimals": 0,
      "refRange": { "text": "< 125 (<75y) or < 450 (≥75y)", "unit": "pg/mL", "low": null, "high": 125, "inclusive": false },
      "critical": { "low": null, "high": 1800 },
      "isCalculated": false,
      "calc": null,
      "tags": ["cardiac", "HF"]
    },
    {
      "id": "d_dimer",
      "panelId": "cardiac",
      "name": "D-dimer (FEU)",
      "loinc": "48065-7",
      "specimen": "Plasma",
      "resultType": "numeric",
      "defaultUnit": "µg/mL FEU",
      "unitOptions": ["µg/mL FEU"],
      "decimals": 2,
      "refRange": { "text": "< 0.50", "unit": "µg/mL FEU", "low": null, "high": 0.50, "inclusive": false },
      "critical": { "low": null, "high": 2.0 },
      "isCalculated": false,
      "calc": null,
      "tags": ["coagulation", "cardiac"]
    },
    {
      "id": "hs_crp",
      "panelId": "cardiac",
      "name": "hs-CRP",
      "loinc": "30522-7",
      "specimen": "Serum",
      "resultType": "numeric",
      "defaultUnit": "mg/L",
      "unitOptions": ["mg/L"],
      "decimals": 2,
      "refRange": { "text": "0.0 - 3.0", "unit": "mg/L", "low": 0.0, "high": 3.0, "inclusive": true },
      "critical": { "low": null, "high": 10.0 },
      "isCalculated": false,
      "calc": null,
      "tags": ["inflammation", "cardiac"]
    },
    {
      "id": "ldh",
      "panelId": "cardiac",
      "name": "LDH",
      "loinc": "14804-9",
      "specimen": "Serum",
      "resultType": "numeric",
      "defaultUnit": "U/L",
      "unitOptions": ["U/L"],
      "decimals": 0,
      "refRange": { "text": "125 - 243", "unit": "U/L", "low": 125, "high": 243, "inclusive": true },
      "critical": { "low": null, "high": 500 },
      "isCalculated": false,
      "calc": null,
      "tags": ["tissue_injury"]
    },
    {
      "id": "wbc",
      "panelId": "cbc",
      "name": "WBC Count",
      "loinc": "6690-2",
      "specimen": "Whole blood",
      "resultType": "numeric",
      "defaultUnit": "10^3/µL",
      "unitOptions": ["10^3/µL", "10^9/L"],
      "decimals": 1,
      "refRange": { "text": "4.5 - 11.0", "unit": "10^3/µL", "low": 4.5, "high": 11.0, "inclusive": true },
      "critical": { "low": 1.0, "high": 50.0 },
      "isCalculated": false,
      "calc": null,
      "tags": ["cbc"]
    },
    {
      "id": "rbc",
      "panelId": "cbc",
      "name": "RBC Count",
      "loinc": "789-8",
      "specimen": "Whole blood",
      "resultType": "numeric",
      "defaultUnit": "10^6/µL",
      "unitOptions": ["10^6/µL", "10^12/L"],
      "decimals": 2,
      "refRange": { "text": "4.20 - 5.90", "unit": "10^6/µL", "low": 4.2, "high": 5.9, "inclusive": true },
      "critical": { "low": 2.5, "high": 7.5 },
      "isCalculated": false,
      "calc": null,
      "tags": ["cbc"]
    },
    {
      "id": "hemoglobin",
      "panelId": "cbc",
      "name": "Hemoglobin",
      "loinc": "718-7",
      "specimen": "Whole blood",
      "resultType": "numeric",
      "defaultUnit": "g/dL",
      "unitOptions": ["g/dL"],
      "decimals": 1,
      "refRange": { "text": "12.0 - 16.0", "unit": "g/dL", "low": 12.0, "high": 16.0, "inclusive": true },
      "critical": { "low": 7.0, "high": 20.0 },
      "isCalculated": false,
      "calc": null,
      "tags": ["cbc"]
    },
    {
      "id": "hematocrit",
      "panelId": "cbc",
      "name": "Hematocrit",
      "loinc": "4544-3",
      "specimen": "Whole blood",
      "resultType": "numeric",
      "defaultUnit": "%",
      "unitOptions": ["%"],
      "decimals": 1,
      "refRange": { "text": "36 - 46", "unit": "%", "low": 36, "high": 46, "inclusive": true },
      "critical": { "low": 21, "high": 60 },
      "isCalculated": false,
      "calc": null,
      "tags": ["cbc"]
    },
    {
      "id": "mcv",
      "panelId": "cbc",
      "name": "MCV",
      "loinc": "787-2",
      "specimen": "Whole blood",
      "resultType": "numeric",
      "defaultUnit": "fL",
      "unitOptions": ["fL"],
      "decimals": 1,
      "refRange": { "text": "80 - 100", "unit": "fL", "low": 80, "high": 100, "inclusive": true },
      "critical": { "low": 60, "high": 120 },
      "isCalculated": false,
      "calc": null,
      "tags": ["cbc", "rbc_indices"]
    },
    {
      "id": "mch",
      "panelId": "cbc",
      "name": "MCH",
      "loinc": "785-6",
      "specimen": "Whole blood",
      "resultType": "numeric",
      "defaultUnit": "pg",
      "unitOptions": ["pg"],
      "decimals": 1,
      "refRange": { "text": "27 - 33", "unit": "pg", "low": 27, "high": 33, "inclusive": true },
      "critical": { "low": null, "high": null },
      "isCalculated": false,
      "calc": null,
      "tags": ["cbc", "rbc_indices"]
    },
    {
      "id": "mchc",
      "panelId": "cbc",
      "name": "MCHC",
      "loinc": "786-4",
      "specimen": "Whole blood",
      "resultType": "numeric",
      "defaultUnit": "g/dL",
      "unitOptions": ["g/dL"],
      "decimals": 1,
      "refRange": { "text": "32 - 36", "unit": "g/dL", "low": 32, "high": 36, "inclusive": true },
      "critical": { "low": null, "high": null },
      "isCalculated": false,
      "calc": null,
      "tags": ["cbc", "rbc_indices"]
    },
    {
      "id": "rdw",
      "panelId": "cbc",
      "name": "RDW",
      "loinc": "788-0",
      "specimen": "Whole blood",
      "resultType": "numeric",
      "defaultUnit": "%",
      "unitOptions": ["%"],
      "decimals": 1,
      "refRange": { "text": "11.5 - 14.5", "unit": "%", "low": 11.5, "high": 14.5, "inclusive": true },
      "critical": { "low": null, "high": 25.0 },
      "isCalculated": false,
      "calc": null,
      "tags": ["cbc", "rbc_indices"]
    },
    {
      "id": "platelets",
      "panelId": "cbc",
      "name": "Platelet Count",
      "loinc": "777-3",
      "specimen": "Whole blood",
      "resultType": "numeric",
      "defaultUnit": "10^3/µL",
      "unitOptions": ["10^3/µL", "10^9/L"],
      "decimals": 0,
      "refRange": { "text": "150 - 400", "unit": "10^3/µL", "low": 150, "high": 400, "inclusive": true },
      "critical": { "low": 50, "high": 1000 },
      "isCalculated": false,
      "calc": null,
      "tags": ["cbc"]
    },
    {
      "id": "mpv",
      "panelId": "cbc",
      "name": "MPV",
      "loinc": "32623-1",
      "specimen": "Whole blood",
      "resultType": "numeric",
      "defaultUnit": "fL",
      "unitOptions": ["fL"],
      "decimals": 1,
      "refRange": { "text": "7.4 - 10.4", "unit": "fL", "low": 7.4, "high": 10.4, "inclusive": true },
      "critical": { "low": null, "high": null },
      "isCalculated": false,
      "calc": null,
      "tags": ["cbc"]
    },
    {
      "id": "neutrophils_percent",
      "panelId": "cbc",
      "name": "Neutrophils %",
      "loinc": "770-8",
      "specimen": "Whole blood",
      "resultType": "numeric",
      "defaultUnit": "%",
      "unitOptions": ["%"],
      "decimals": 0,
      "refRange": { "text": "40 - 70", "unit": "%", "low": 40, "high": 70, "inclusive": true },
      "critical": { "low": 10, "high": 95 },
      "isCalculated": false,
      "calc": null,
      "tags": ["cbc", "differential"]
    },
    {
      "id": "lymphocytes_percent",
      "panelId": "cbc",
      "name": "Lymphocytes %",
      "loinc": "736-9",
      "specimen": "Whole blood",
      "resultType": "numeric",
      "defaultUnit": "%",
      "unitOptions": ["%"],
      "decimals": 0,
      "refRange": { "text": "20 - 40", "unit": "%", "low": 20, "high": 40, "inclusive": true },
      "critical": { "low": 5, "high": 80 },
      "isCalculated": false,
      "calc": null,
      "tags": ["cbc", "differential"]
    },
    {
      "id": "neutrophils_abs",
      "panelId": "cbc",
      "name": "Neutrophils Absolute",
      "loinc": "751-8",
      "specimen": "Whole blood",
      "resultType": "numeric",
      "defaultUnit": "10^3/µL",
      "unitOptions": ["10^3/µL", "10^9/L"],
      "decimals": 2,
      "refRange": { "text": "1.8 - 7.0", "unit": "10^3/µL", "low": 1.8, "high": 7.0, "inclusive": true },
      "critical": { "low": 0.5, "high": 20.0 },
      "isCalculated": false,
      "calc": null,
      "tags": ["cbc", "differential"]
    },
    {
      "id": "lymphocytes_abs",
      "panelId": "cbc",
      "name": "Lymphocytes Absolute",
      "loinc": "731-0",
      "specimen": "Whole blood",
      "resultType": "numeric",
      "defaultUnit": "10^3/µL",
      "unitOptions": ["10^3/µL", "10^9/L"],
      "decimals": 2,
      "refRange": { "text": "1.0 - 3.2", "unit": "10^3/µL", "low": 1.0, "high": 3.2, "inclusive": true },
      "critical": { "low": 0.2, "high": 10.0 },
      "isCalculated": false,
      "calc": null,
      "tags": ["cbc", "differential"]
    },
    {
      "id": "sodium",
      "panelId": "cmp",
      "name": "Sodium",
      "loinc": "2951-2",
      "specimen": "Serum/Plasma",
      "resultType": "numeric",
      "defaultUnit": "mmol/L",
      "unitOptions": ["mmol/L"],
      "decimals": 0,
      "refRange": { "text": "136 - 145", "unit": "mmol/L", "low": 136, "high": 145, "inclusive": true },
      "critical": { "low": 120, "high": 160 },
      "isCalculated": false,
      "calc": null,
      "tags": ["electrolyte", "cmp"]
    },
    {
      "id": "potassium",
      "panelId": "cmp",
      "name": "Potassium",
      "loinc": "2823-3",
      "specimen": "Serum/Plasma",
      "resultType": "numeric",
      "defaultUnit": "mmol/L",
      "unitOptions": ["mmol/L"],
      "decimals": 1,
      "refRange": { "text": "3.5 - 5.0", "unit": "mmol/L", "low": 3.5, "high": 5.0, "inclusive": true },
      "critical": { "low": 2.5, "high": 6.5 },
      "isCalculated": false,
      "calc": null,
      "tags": ["electrolyte", "cmp"]
    },
    {
      "id": "chloride",
      "panelId": "cmp",
      "name": "Chloride",
      "loinc": "2075-0",
      "specimen": "Serum/Plasma",
      "resultType": "numeric",
      "defaultUnit": "mmol/L",
      "unitOptions": ["mmol/L"],
      "decimals": 0,
      "refRange": { "text": "98 - 107", "unit": "mmol/L", "low": 98, "high": 107, "inclusive": true },
      "critical": { "low": 80, "high": 120 },
      "isCalculated": false,
      "calc": null,
      "tags": ["electrolyte", "cmp"]
    },
    {
      "id": "co2_bicarb",
      "panelId": "cmp",
      "name": "CO2 (Bicarbonate)",
      "loinc": "2028-9",
      "specimen": "Serum/Plasma",
      "resultType": "numeric",
      "defaultUnit": "mmol/L",
      "unitOptions": ["mmol/L"],
      "decimals": 0,
      "refRange": { "text": "22 - 29", "unit": "mmol/L", "low": 22, "high": 29, "inclusive": true },
      "critical": { "low": 10, "high": 40 },
      "isCalculated": false,
      "calc": null,
      "tags": ["electrolyte", "cmp", "acid_base"]
    },
    {
      "id": "anion_gap",
      "panelId": "cmp",
      "name": "Anion Gap (calc)",
      "loinc": "",
      "specimen": "Serum/Plasma",
      "resultType": "numeric",
      "defaultUnit": "mmol/L",
      "unitOptions": ["mmol/L"],
      "decimals": 0,
      "refRange": { "text": "8 - 16", "unit": "mmol/L", "low": 8, "high": 16, "inclusive": true },
      "critical": { "low": null, "high": 25 },
      "isCalculated": true,
      "calc": { "formula": "AG = Na - (Cl + CO2)", "dependsOn": ["sodium", "chloride", "co2_bicarb"], "notes": "Common formula without K" },
      "tags": ["calculated", "acid_base", "cmp"]
    },
    {
      "id": "glucose",
      "panelId": "cmp",
      "name": "Glucose",
      "loinc": "2345-7",
      "specimen": "Plasma/Serum",
      "resultType": "numeric",
      "defaultUnit": "mg/dL",
      "unitOptions": ["mg/dL", "mmol/L"],
      "decimals": 0,
      "refRange": { "text": "70 - 99 (fasting)", "unit": "mg/dL", "low": 70, "high": 99, "inclusive": true },
      "critical": { "low": 50, "high": 500 },
      "isCalculated": false,
      "calc": null,
      "tags": ["cmp", "diabetes"]
    },
    {
      "id": "bun",
      "panelId": "cmp",
      "name": "BUN",
      "loinc": "3094-0",
      "specimen": "Serum/Plasma",
      "resultType": "numeric",
      "defaultUnit": "mg/dL",
      "unitOptions": ["mg/dL"],
      "decimals": 0,
      "refRange": { "text": "7 - 20", "unit": "mg/dL", "low": 7, "high": 20, "inclusive": true },
      "critical": { "low": null, "high": 100 },
      "isCalculated": false,
      "calc": null,
      "tags": ["renal", "cmp"]
    },
    {
      "id": "creatinine",
      "panelId": "cmp",
      "name": "Creatinine",
      "loinc": "2160-0",
      "specimen": "Serum/Plasma",
      "resultType": "numeric",
      "defaultUnit": "mg/dL",
      "unitOptions": ["mg/dL", "µmol/L"],
      "decimals": 1,
      "refRange": { "text": "0.6 - 1.2", "unit": "mg/dL", "low": 0.6, "high": 1.2, "inclusive": true },
      "critical": { "low": null, "high": 6.0 },
      "isCalculated": false,
      "calc": null,
      "tags": ["renal", "cmp"]
    },
    {
      "id": "egfr",
      "panelId": "cmp",
      "name": "eGFR (calc, CKD-EPI 2021)",
      "loinc": "48643-1",
      "specimen": "Serum",
      "resultType": "numeric",
      "defaultUnit": "mL/min/1.73m²",
      "unitOptions": ["mL/min/1.73m²"],
      "decimals": 0,
      "refRange": { "text": "> 60", "unit": "mL/min/1.73m²", "low": 60, "high": null, "inclusive": false },
      "critical": { "low": 15, "high": null },
      "isCalculated": true,
      "calc": {
        "formula": "CKD-EPI 2021 creatinine-only equation (no race). Requires age (years), sex, and serum creatinine (mg/dL).",
        "dependsOn": ["creatinine"],
        "notes": "Implement per NKF 2021 guidance; display '> 60' when above threshold."
      },
      "tags": ["renal", "calculated", "cmp"]
    },
    {
      "id": "calcium",
      "panelId": "cmp",
      "name": "Calcium",
      "loinc": "17861-6",
      "specimen": "Serum",
      "resultType": "numeric",
      "defaultUnit": "mg/dL",
      "unitOptions": ["mg/dL", "mmol/L"],
      "decimals": 1,
      "refRange": { "text": "8.6 - 10.2", "unit": "mg/dL", "low": 8.6, "high": 10.2, "inclusive": true },
      "critical": { "low": 6.5, "high": 13.0 },
      "isCalculated": false,
      "calc": null,
      "tags": ["cmp", "electrolyte"]
    },
    {
      "id": "total_protein",
      "panelId": "cmp",
      "name": "Total Protein",
      "loinc": "2885-2",
      "specimen": "Serum",
      "resultType": "numeric",
      "defaultUnit": "g/dL",
      "unitOptions": ["g/dL"],
      "decimals": 1,
      "refRange": { "text": "6.0 - 8.3", "unit": "g/dL", "low": 6.0, "high": 8.3, "inclusive": true },
      "critical": { "low": 4.0, "high": 10.0 },
      "isCalculated": false,
      "calc": null,
      "tags": ["cmp", "liver"]
    },
    {
      "id": "albumin",
      "panelId": "cmp",
      "name": "Albumin",
      "loinc": "1751-7",
      "specimen": "Serum",
      "resultType": "numeric",
      "defaultUnit": "g/dL",
      "unitOptions": ["g/dL"],
      "decimals": 1,
      "refRange": { "text": "3.5 - 5.0", "unit": "g/dL", "low": 3.5, "high": 5.0, "inclusive": true },
      "critical": { "low": 2.0, "high": 6.5 },
      "isCalculated": false,
      "calc": null,
      "tags": ["cmp", "liver", "renal"]
    },
    {
      "id": "globulin",
      "panelId": "cmp",
      "name": "Globulin (calc)",
      "loinc": "",
      "specimen": "Serum",
      "resultType": "numeric",
      "defaultUnit": "g/dL",
      "unitOptions": ["g/dL"],
      "decimals": 1,
      "refRange": { "text": "2.0 - 3.5", "unit": "g/dL", "low": 2.0, "high": 3.5, "inclusive": true },
      "critical": { "low": 1.0, "high": 6.0 },
      "isCalculated": true,
      "calc": { "formula": "Globulin = Total Protein - Albumin", "dependsOn": ["total_protein", "albumin"], "notes": "" },
      "tags": ["cmp", "calculated"]
    },
    {
      "id": "ag_ratio",
      "panelId": "cmp",
      "name": "A/G Ratio (calc)",
      "loinc": "1759-0",
      "specimen": "Serum",
      "resultType": "numeric",
      "defaultUnit": "ratio",
      "unitOptions": ["ratio"],
      "decimals": 2,
      "refRange": { "text": "1.0 - 2.2", "unit": "ratio", "low": 1.0, "high": 2.2, "inclusive": true },
      "critical": { "low": 0.5, "high": 3.5 },
      "isCalculated": true,
      "calc": { "formula": "A/G = Albumin / Globulin", "dependsOn": ["albumin", "globulin"], "notes": "" },
      "tags": ["cmp", "calculated"]
    },
    {
      "id": "ast",
      "panelId": "cmp",
      "name": "AST",
      "loinc": "1920-8",
      "specimen": "Serum",
      "resultType": "numeric",
      "defaultUnit": "U/L",
      "unitOptions": ["U/L"],
      "decimals": 0,
      "refRange": { "text": "10 - 40", "unit": "U/L", "low": 10, "high": 40, "inclusive": true },
      "critical": { "low": null, "high": 1000 },
      "isCalculated": false,
      "calc": null,
      "tags": ["liver", "cmp"]
    },
    {
      "id": "alt",
      "panelId": "cmp",
      "name": "ALT",
      "loinc": "1742-6",
      "specimen": "Serum",
      "resultType": "numeric",
      "defaultUnit": "U/L",
      "unitOptions": ["U/L"],
      "decimals": 0,
      "refRange": { "text": "7 - 56", "unit": "U/L", "low": 7, "high": 56, "inclusive": true },
      "critical": { "low": null, "high": 1000 },
      "isCalculated": false,
      "calc": null,
      "tags": ["liver", "cmp"]
    },
    {
      "id": "alk_phos",
      "panelId": "cmp",
      "name": "Alkaline Phosphatase",
      "loinc": "6768-6",
      "specimen": "Serum",
      "resultType": "numeric",
      "defaultUnit": "U/L",
      "unitOptions": ["U/L"],
      "decimals": 0,
      "refRange": { "text": "44 - 147", "unit": "U/L", "low": 44, "high": 147, "inclusive": true },
      "critical": { "low": null, "high": 1000 },
      "isCalculated": false,
      "calc": null,
      "tags": ["liver", "cmp"]
    },
    {
      "id": "bilirubin_total",
      "panelId": "cmp",
      "name": "Bilirubin, Total",
      "loinc": "1975-2",
      "specimen": "Serum",
      "resultType": "numeric",
      "defaultUnit": "mg/dL",
      "unitOptions": ["mg/dL", "µmol/L"],
      "decimals": 1,
      "refRange": { "text": "0.2 - 1.2", "unit": "mg/dL", "low": 0.2, "high": 1.2, "inclusive": true },
      "critical": { "low": null, "high": 20.0 },
      "isCalculated": false,
      "calc": null,
      "tags": ["liver", "cmp"]
    },
    {
      "id": "bilirubin_direct",
      "panelId": "cmp",
      "name": "Bilirubin, Direct",
      "loinc": "1968-7",
      "specimen": "Serum",
      "resultType": "numeric",
      "defaultUnit": "mg/dL",
      "unitOptions": ["mg/dL", "µmol/L"],
      "decimals": 1,
      "refRange": { "text": "0.0 - 0.3", "unit": "mg/dL", "low": 0.0, "high": 0.3, "inclusive": true },
      "critical": { "low": null, "high": 5.0 },
      "isCalculated": false,
      "calc": null,
      "tags": ["liver", "cmp"]
    },
    {
      "id": "osmolality_calc",
      "panelId": "cmp",
      "name": "Osmolality (calc)",
      "loinc": "",
      "specimen": "Serum",
      "resultType": "numeric",
      "defaultUnit": "mOsm/kg",
      "unitOptions": ["mOsm/kg"],
      "decimals": 0,
      "refRange": { "text": "275 - 295", "unit": "mOsm/kg", "low": 275, "high": 295, "inclusive": true },
      "critical": { "low": 250, "high": 330 },
      "isCalculated": true,
      "calc": {
        "formula": "Osm = 2*Na + Glucose/18 + BUN/2.8",
        "dependsOn": ["sodium", "glucose", "bun"],
        "notes": "All inputs in customary units (mmol/L for Na; mg/dL for glucose, BUN)"
      },
      "tags": ["cmp", "calculated"]
    },
    {
      "id": "magnesium",
      "panelId": "cmp",
      "name": "Magnesium",
      "loinc": "19123-9",
      "specimen": "Serum",
      "resultType": "numeric",
      "defaultUnit": "mg/dL",
      "unitOptions": ["mg/dL", "mmol/L"],
      "decimals": 1,
      "refRange": { "text": "1.6 - 2.6", "unit": "mg/dL", "low": 1.6, "high": 2.6, "inclusive": true },
      "critical": { "low": 1.0, "high": 4.5 },
      "isCalculated": false,
      "calc": null,
      "tags": ["electrolyte", "cmp"]
    },
    {
      "id": "phosphorus",
      "panelId": "cmp",
      "name": "Phosphorus",
      "loinc": "2777-1",
      "specimen": "Serum",
      "resultType": "numeric",
      "defaultUnit": "mg/dL",
      "unitOptions": ["mg/dL", "mmol/L"],
      "decimals": 1,
      "refRange": { "text": "2.5 - 4.5", "unit": "mg/dL", "low": 2.5, "high": 4.5, "inclusive": true },
      "critical": { "low": 1.0, "high": 8.0 },
      "isCalculated": false,
      "calc": null,
      "tags": ["electrolyte", "cmp"]
    },
    {
      "id": "uric_acid",
      "panelId": "cmp",
      "name": "Uric Acid",
      "loinc": "3084-1",
      "specimen": "Serum",
      "resultType": "numeric",
      "defaultUnit": "mg/dL",
      "unitOptions": ["mg/dL", "µmol/L"],
      "decimals": 1,
      "refRange": { "text": "3.4 - 7.0", "unit": "mg/dL", "low": 3.4, "high": 7.0, "inclusive": true },
      "critical": { "low": null, "high": 12.0 },
      "isCalculated": false,
      "calc": null,
      "tags": ["renal", "metabolic", "cmp"]
    }
  ]
};

// Utility functions for flag and delta logic
export function calculateFlag(value: number, test: LabTest): "N" | "L" | "H" | "C" {
  const { critical, refRange } = test;
  
  if (critical.high !== null && value >= critical.high) return "C";
  if (critical.low !== null && value <= critical.low) return "C";
  if (refRange.high !== null && value > refRange.high) return "H";
  if (refRange.low !== null && value < refRange.low) return "L";
  return "N";
}

export function calculateDelta(value: number, priorValue: number | null): number | null {
  if (priorValue === null || priorValue === 0) return null;
  return Math.round(((value - priorValue) / priorValue) * 100);
}

export function getTestsByPanel(panelId: string): LabTest[] {
  return labTestsCatalog.tests.filter(test => test.panelId === panelId);
}

export function getTestById(testId: string): LabTest | undefined {
  return labTestsCatalog.tests.find(test => test.id === testId);
}
