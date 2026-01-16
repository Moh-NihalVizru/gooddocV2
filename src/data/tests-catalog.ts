import { TestDefinition, PanelDefinition, TestsCatalog } from "@/types/lab-tests";

export const panelsCatalog: PanelDefinition[] = [
  { id: "all", name: "All Tests" },
  { id: "cardiac", name: "Cardiac Panel" },
  { id: "cbc", name: "CBC" },
  { id: "cmp", name: "CMP" },
];

export const testsCatalog: TestDefinition[] = [
  // Cardiac Panel
  {
    id: "troponin_i",
    displayName: "Troponin I",
    loinc: "10839-9",
    kind: "numeric",
    defaultUnit: "ng/mL",
    units: [
      { code: "ng/mL", toSI: 1, decimals: 2 },
      { code: "µg/L", toSI: 1, decimals: 2 },
    ],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: null, highSI: 0.04 },
    ],
    criticalRanges: [{ lowSI: null, highSI: 0.40 }],
    panels: ["cardiac"],
    synonyms: ["TnI", "hs-TnI", "High-sensitivity Troponin I"],
    notes: "Use assay-specific cutoffs.",
  },
  {
    id: "troponin_t",
    displayName: "Troponin T",
    loinc: "6598-7",
    kind: "numeric",
    defaultUnit: "ng/mL",
    units: [
      { code: "ng/mL", toSI: 1, decimals: 3 },
      { code: "µg/L", toSI: 1, decimals: 3 },
    ],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: null, highSI: 0.01 },
    ],
    criticalRanges: [{ lowSI: null, highSI: 0.10 }],
    panels: ["cardiac"],
    synonyms: ["TnT", "hs-TnT"],
  },
  {
    id: "ck_total",
    displayName: "Creatine Kinase (CK), Total",
    loinc: "2157-6",
    kind: "numeric",
    defaultUnit: "U/L",
    units: [{ code: "U/L", toSI: 1, decimals: 0 }],
    referenceRanges: [
      { sex: "M", age: { minY: 0, maxY: 200 }, lowSI: 39, highSI: 308 },
      { sex: "F", age: { minY: 0, maxY: 200 }, lowSI: 26, highSI: 192 },
    ],
    criticalRanges: [{ lowSI: null, highSI: 2000 }],
    panels: ["cardiac"],
    synonyms: ["CK", "CPK"],
  },
  {
    id: "ck_mb",
    displayName: "CK-MB (Mass)",
    loinc: "13969-1",
    kind: "numeric",
    defaultUnit: "ng/mL",
    units: [{ code: "ng/mL", toSI: 1, decimals: 1 }],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: 0, highSI: 5.0 },
    ],
    criticalRanges: [{ lowSI: null, highSI: 10.0 }],
    panels: ["cardiac"],
    synonyms: ["CK-MB mass"],
  },
  {
    id: "ck_mb_index",
    displayName: "CK-MB Index (calc)",
    loinc: "",
    kind: "calculated",
    defaultUnit: "%",
    units: [{ code: "%", toSI: 1, decimals: 1 }],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: 0, highSI: 3.0 },
    ],
    criticalRanges: [{ lowSI: null, highSI: 5.0 }],
    panels: ["cardiac"],
    synonyms: [],
    dependencies: ["ck_mb", "ck_total"],
    formula: "ck_mb_index",
  },
  {
    id: "bnp",
    displayName: "BNP",
    loinc: "30934-4",
    kind: "numeric",
    defaultUnit: "pg/mL",
    units: [
      { code: "pg/mL", toSI: 1, decimals: 0 },
      { code: "ng/L", toSI: 1, decimals: 0 },
    ],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: null, highSI: 100 },
    ],
    criticalRanges: [{ lowSI: null, highSI: 400 }],
    panels: ["cardiac"],
    synonyms: ["Brain Natriuretic Peptide", "B-type Natriuretic Peptide"],
    notes: "Elevated in heart failure.",
  },
  {
    id: "ntprobnp",
    displayName: "NT-proBNP",
    loinc: "33762-6",
    kind: "numeric",
    defaultUnit: "pg/mL",
    units: [{ code: "pg/mL", toSI: 1, decimals: 0 }],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 75 }, lowSI: null, highSI: 125 },
      { sex: "any", age: { minY: 75, maxY: 200 }, lowSI: null, highSI: 450 },
    ],
    criticalRanges: [{ lowSI: null, highSI: 1800 }],
    panels: ["cardiac"],
    synonyms: ["N-terminal proBNP"],
  },
  {
    id: "d_dimer",
    displayName: "D-Dimer",
    loinc: "48065-7",
    kind: "numeric",
    defaultUnit: "µg/mL FEU",
    units: [
      { code: "µg/mL FEU", toSI: 1, decimals: 2 },
      { code: "ng/mL FEU", toSI: 0.001, decimals: 0 },
      { code: "mg/L FEU", toSI: 1, decimals: 2 },
    ],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 50 }, lowSI: null, highSI: 0.5 },
      { sex: "any", age: { minY: 50, maxY: 200 }, lowSI: null, highSI: 1.0 },
    ],
    criticalRanges: [{ lowSI: null, highSI: 2.0 }],
    panels: ["cardiac"],
    synonyms: ["Fibrin D-dimer", "FDP"],
  },
  {
    id: "hs_crp",
    displayName: "hs-CRP",
    loinc: "30522-7",
    kind: "numeric",
    defaultUnit: "mg/L",
    units: [{ code: "mg/L", toSI: 1, decimals: 2 }],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: null, highSI: 3.0 },
    ],
    criticalRanges: [{ lowSI: null, highSI: 10.0 }],
    panels: ["cardiac"],
    synonyms: ["High-sensitivity CRP", "C-Reactive Protein"],
  },
  {
    id: "ldh",
    displayName: "LDH",
    loinc: "14804-9",
    kind: "numeric",
    defaultUnit: "U/L",
    units: [{ code: "U/L", toSI: 1, decimals: 0 }],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: 125, highSI: 243 },
    ],
    criticalRanges: [{ lowSI: null, highSI: 500 }],
    panels: ["cardiac"],
    synonyms: ["Lactate Dehydrogenase"],
  },

  // CBC Panel
  {
    id: "wbc",
    displayName: "WBC Count",
    loinc: "6690-2",
    kind: "numeric",
    defaultUnit: "10^3/µL",
    units: [
      { code: "10^3/µL", toSI: 1, decimals: 1 },
      { code: "10^9/L", toSI: 1, decimals: 1 },
    ],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: 4.5, highSI: 11.0 },
    ],
    criticalRanges: [{ lowSI: 1.0, highSI: 50.0 }],
    panels: ["cbc"],
    synonyms: ["White Blood Cell", "Leukocytes"],
  },
  {
    id: "rbc",
    displayName: "RBC Count",
    loinc: "789-8",
    kind: "numeric",
    defaultUnit: "10^6/µL",
    units: [
      { code: "10^6/µL", toSI: 1, decimals: 2 },
      { code: "10^12/L", toSI: 1, decimals: 2 },
    ],
    referenceRanges: [
      { sex: "M", age: { minY: 0, maxY: 200 }, lowSI: 4.5, highSI: 5.9 },
      { sex: "F", age: { minY: 0, maxY: 200 }, lowSI: 4.0, highSI: 5.2 },
    ],
    criticalRanges: [{ lowSI: 2.5, highSI: 7.5 }],
    panels: ["cbc"],
    synonyms: ["Red Blood Cell", "Erythrocytes"],
  },
  {
    id: "hemoglobin",
    displayName: "Hemoglobin",
    loinc: "718-7",
    kind: "numeric",
    defaultUnit: "g/dL",
    units: [
      { code: "g/dL", toSI: 1, decimals: 1 },
      { code: "g/L", toSI: 0.1, decimals: 0 },
    ],
    referenceRanges: [
      { sex: "M", age: { minY: 0, maxY: 200 }, lowSI: 13.5, highSI: 17.5 },
      { sex: "F", age: { minY: 0, maxY: 200 }, lowSI: 12.0, highSI: 16.0 },
    ],
    criticalRanges: [{ lowSI: 7.0, highSI: 20.0 }],
    panels: ["cbc"],
    synonyms: ["Hgb", "Hb"],
  },
  {
    id: "hematocrit",
    displayName: "Hematocrit",
    loinc: "4544-3",
    kind: "numeric",
    defaultUnit: "%",
    units: [{ code: "%", toSI: 1, decimals: 1 }],
    referenceRanges: [
      { sex: "M", age: { minY: 0, maxY: 200 }, lowSI: 38.8, highSI: 50.0 },
      { sex: "F", age: { minY: 0, maxY: 200 }, lowSI: 34.9, highSI: 44.5 },
    ],
    criticalRanges: [{ lowSI: 21, highSI: 60 }],
    panels: ["cbc"],
    synonyms: ["Hct", "PCV"],
  },
  {
    id: "platelets",
    displayName: "Platelet Count",
    loinc: "777-3",
    kind: "numeric",
    defaultUnit: "10^3/µL",
    units: [
      { code: "10^3/µL", toSI: 1, decimals: 0 },
      { code: "10^9/L", toSI: 1, decimals: 0 },
    ],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: 150, highSI: 400 },
    ],
    criticalRanges: [{ lowSI: 50, highSI: 1000 }],
    panels: ["cbc"],
    synonyms: ["PLT", "Thrombocytes"],
  },
  {
    id: "mcv",
    displayName: "MCV",
    loinc: "787-2",
    kind: "numeric",
    defaultUnit: "fL",
    units: [{ code: "fL", toSI: 1, decimals: 1 }],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: 80, highSI: 100 },
    ],
    criticalRanges: [{ lowSI: 60, highSI: 120 }],
    panels: ["cbc"],
    synonyms: ["Mean Corpuscular Volume"],
  },
  {
    id: "mch",
    displayName: "MCH",
    loinc: "785-6",
    kind: "numeric",
    defaultUnit: "pg",
    units: [{ code: "pg", toSI: 1, decimals: 1 }],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: 27, highSI: 33 },
    ],
    criticalRanges: [],
    panels: ["cbc"],
    synonyms: ["Mean Corpuscular Hemoglobin"],
  },
  {
    id: "mchc",
    displayName: "MCHC",
    loinc: "786-4",
    kind: "numeric",
    defaultUnit: "g/dL",
    units: [{ code: "g/dL", toSI: 1, decimals: 1 }],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: 32, highSI: 36 },
    ],
    criticalRanges: [],
    panels: ["cbc"],
    synonyms: ["Mean Corpuscular Hemoglobin Concentration"],
  },
  {
    id: "rdw",
    displayName: "RDW",
    loinc: "788-0",
    kind: "numeric",
    defaultUnit: "%",
    units: [{ code: "%", toSI: 1, decimals: 1 }],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: 11.5, highSI: 14.5 },
    ],
    criticalRanges: [{ lowSI: null, highSI: 25.0 }],
    panels: ["cbc"],
    synonyms: ["Red Cell Distribution Width"],
  },
  {
    id: "mpv",
    displayName: "MPV",
    loinc: "32623-1",
    kind: "numeric",
    defaultUnit: "fL",
    units: [{ code: "fL", toSI: 1, decimals: 1 }],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: 7.4, highSI: 10.4 },
    ],
    criticalRanges: [],
    panels: ["cbc"],
    synonyms: ["Mean Platelet Volume"],
  },
  {
    id: "neutrophils_percent",
    displayName: "Neutrophils %",
    loinc: "770-8",
    kind: "numeric",
    defaultUnit: "%",
    units: [{ code: "%", toSI: 1, decimals: 0 }],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: 40, highSI: 70 },
    ],
    criticalRanges: [{ lowSI: 10, highSI: 95 }],
    panels: ["cbc"],
    synonyms: ["Segs", "Polys"],
  },
  {
    id: "lymphocytes_percent",
    displayName: "Lymphocytes %",
    loinc: "736-9",
    kind: "numeric",
    defaultUnit: "%",
    units: [{ code: "%", toSI: 1, decimals: 0 }],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: 20, highSI: 40 },
    ],
    criticalRanges: [{ lowSI: 5, highSI: 80 }],
    panels: ["cbc"],
    synonyms: ["Lymphs"],
  },

  // CMP Panel
  {
    id: "sodium",
    displayName: "Sodium",
    loinc: "2951-2",
    kind: "numeric",
    defaultUnit: "mmol/L",
    units: [
      { code: "mmol/L", toSI: 1, decimals: 0 },
      { code: "mEq/L", toSI: 1, decimals: 0 },
    ],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: 136, highSI: 145 },
    ],
    criticalRanges: [{ lowSI: 120, highSI: 160 }],
    panels: ["cmp"],
    synonyms: ["Na"],
  },
  {
    id: "potassium",
    displayName: "Potassium",
    loinc: "2823-3",
    kind: "numeric",
    defaultUnit: "mmol/L",
    units: [
      { code: "mmol/L", toSI: 1, decimals: 1 },
      { code: "mEq/L", toSI: 1, decimals: 1 },
    ],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: 3.5, highSI: 5.0 },
    ],
    criticalRanges: [{ lowSI: 2.5, highSI: 6.5 }],
    panels: ["cmp"],
    synonyms: ["K"],
  },
  {
    id: "chloride",
    displayName: "Chloride",
    loinc: "2075-0",
    kind: "numeric",
    defaultUnit: "mmol/L",
    units: [
      { code: "mmol/L", toSI: 1, decimals: 0 },
      { code: "mEq/L", toSI: 1, decimals: 0 },
    ],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: 98, highSI: 107 },
    ],
    criticalRanges: [{ lowSI: 80, highSI: 120 }],
    panels: ["cmp"],
    synonyms: ["Cl"],
  },
  {
    id: "co2_bicarb",
    displayName: "CO2 (Bicarbonate)",
    loinc: "2028-9",
    kind: "numeric",
    defaultUnit: "mmol/L",
    units: [
      { code: "mmol/L", toSI: 1, decimals: 0 },
      { code: "mEq/L", toSI: 1, decimals: 0 },
    ],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: 22, highSI: 29 },
    ],
    criticalRanges: [{ lowSI: 10, highSI: 40 }],
    panels: ["cmp"],
    synonyms: ["Bicarb", "HCO3"],
  },
  {
    id: "glucose",
    displayName: "Glucose",
    loinc: "2345-7",
    kind: "numeric",
    defaultUnit: "mg/dL",
    units: [
      { code: "mg/dL", toSI: 1, decimals: 0 },
      { code: "mmol/L", toSI: 0.0555, decimals: 1 },
    ],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: 70, highSI: 99 },
    ],
    criticalRanges: [{ lowSI: 50, highSI: 500 }],
    panels: ["cmp"],
    synonyms: ["Blood Sugar", "Glu", "FBS"],
    notes: "Fasting reference range shown.",
  },
  {
    id: "bun",
    displayName: "BUN",
    loinc: "3094-0",
    kind: "numeric",
    defaultUnit: "mg/dL",
    units: [
      { code: "mg/dL", toSI: 1, decimals: 0 },
      { code: "mmol/L", toSI: 0.357, decimals: 1 },
    ],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: 7, highSI: 20 },
    ],
    criticalRanges: [{ lowSI: null, highSI: 100 }],
    panels: ["cmp"],
    synonyms: ["Blood Urea Nitrogen", "Urea"],
  },
  {
    id: "creatinine",
    displayName: "Creatinine",
    loinc: "2160-0",
    kind: "numeric",
    defaultUnit: "mg/dL",
    units: [
      { code: "mg/dL", toSI: 1, decimals: 2 },
      { code: "µmol/L", toSI: 88.4, decimals: 0 },
    ],
    referenceRanges: [
      { sex: "M", age: { minY: 0, maxY: 200 }, lowSI: 0.7, highSI: 1.3 },
      { sex: "F", age: { minY: 0, maxY: 200 }, lowSI: 0.6, highSI: 1.1 },
    ],
    criticalRanges: [{ lowSI: null, highSI: 6.0 }],
    panels: ["cmp"],
    synonyms: ["Cr", "Creat"],
  },
  {
    id: "egfr",
    displayName: "eGFR (calc)",
    loinc: "48643-1",
    kind: "calculated",
    defaultUnit: "mL/min/1.73m²",
    units: [{ code: "mL/min/1.73m²", toSI: 1, decimals: 0 }],
    referenceRanges: [
      { sex: "any", age: { minY: 18, maxY: 200 }, lowSI: 60, highSI: null },
    ],
    criticalRanges: [{ lowSI: 15, highSI: null }],
    panels: ["cmp"],
    synonyms: ["GFR", "Glomerular Filtration Rate"],
    dependencies: ["creatinine"],
    formula: "ckd_epi_2021",
    notes: "CKD-EPI 2021 equation. Requires age, sex, creatinine.",
  },
  {
    id: "calcium",
    displayName: "Calcium",
    loinc: "17861-6",
    kind: "numeric",
    defaultUnit: "mg/dL",
    units: [
      { code: "mg/dL", toSI: 1, decimals: 1 },
      { code: "mmol/L", toSI: 0.25, decimals: 2 },
    ],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: 8.6, highSI: 10.2 },
    ],
    criticalRanges: [{ lowSI: 6.5, highSI: 13.0 }],
    panels: ["cmp"],
    synonyms: ["Ca"],
  },
  {
    id: "total_protein",
    displayName: "Total Protein",
    loinc: "2885-2",
    kind: "numeric",
    defaultUnit: "g/dL",
    units: [
      { code: "g/dL", toSI: 1, decimals: 1 },
      { code: "g/L", toSI: 10, decimals: 0 },
    ],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: 6.0, highSI: 8.3 },
    ],
    criticalRanges: [{ lowSI: 4.0, highSI: 10.0 }],
    panels: ["cmp"],
    synonyms: ["TP"],
  },
  {
    id: "albumin",
    displayName: "Albumin",
    loinc: "1751-7",
    kind: "numeric",
    defaultUnit: "g/dL",
    units: [
      { code: "g/dL", toSI: 1, decimals: 1 },
      { code: "g/L", toSI: 10, decimals: 0 },
    ],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: 3.5, highSI: 5.0 },
    ],
    criticalRanges: [{ lowSI: 2.0, highSI: 6.5 }],
    panels: ["cmp"],
    synonyms: ["Alb"],
  },
  {
    id: "ast",
    displayName: "AST",
    loinc: "1920-8",
    kind: "numeric",
    defaultUnit: "U/L",
    units: [{ code: "U/L", toSI: 1, decimals: 0 }],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: 10, highSI: 40 },
    ],
    criticalRanges: [{ lowSI: null, highSI: 1000 }],
    panels: ["cmp"],
    synonyms: ["SGOT", "Aspartate Aminotransferase"],
  },
  {
    id: "alt",
    displayName: "ALT",
    loinc: "1742-6",
    kind: "numeric",
    defaultUnit: "U/L",
    units: [{ code: "U/L", toSI: 1, decimals: 0 }],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: 7, highSI: 56 },
    ],
    criticalRanges: [{ lowSI: null, highSI: 1000 }],
    panels: ["cmp"],
    synonyms: ["SGPT", "Alanine Aminotransferase"],
  },
  {
    id: "alk_phos",
    displayName: "Alkaline Phosphatase",
    loinc: "6768-6",
    kind: "numeric",
    defaultUnit: "U/L",
    units: [{ code: "U/L", toSI: 1, decimals: 0 }],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: 44, highSI: 147 },
    ],
    criticalRanges: [{ lowSI: null, highSI: 1000 }],
    panels: ["cmp"],
    synonyms: ["ALP"],
  },
  {
    id: "bilirubin_total",
    displayName: "Bilirubin, Total",
    loinc: "1975-2",
    kind: "numeric",
    defaultUnit: "mg/dL",
    units: [
      { code: "mg/dL", toSI: 1, decimals: 1 },
      { code: "µmol/L", toSI: 17.1, decimals: 0 },
    ],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: 0.2, highSI: 1.2 },
    ],
    criticalRanges: [{ lowSI: null, highSI: 20.0 }],
    panels: ["cmp"],
    synonyms: ["T. Bili", "TB"],
  },
  {
    id: "anion_gap",
    displayName: "Anion Gap (calc)",
    loinc: "",
    kind: "calculated",
    defaultUnit: "mmol/L",
    units: [{ code: "mmol/L", toSI: 1, decimals: 0 }],
    referenceRanges: [
      { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: 8, highSI: 16 },
    ],
    criticalRanges: [{ lowSI: null, highSI: 25 }],
    panels: ["cmp"],
    synonyms: ["AG"],
    dependencies: ["sodium", "chloride", "co2_bicarb"],
    formula: "anion_gap",
  },
];

// Helper to get test by ID
export function getTestDefinition(id: string): TestDefinition | undefined {
  return testsCatalog.find((t) => t.id === id);
}

// Helper to get tests by panel
export function getTestsByPanel(panelId: string): TestDefinition[] {
  if (panelId === "all") return testsCatalog;
  return testsCatalog.filter((t) => t.panels.includes(panelId));
}

// Search tests by name, loinc, or synonyms
export function searchTests(query: string): TestDefinition[] {
  const q = query.toLowerCase().trim();
  if (!q) return testsCatalog;
  return testsCatalog.filter(
    (t) =>
      t.displayName.toLowerCase().includes(q) ||
      t.loinc.toLowerCase().includes(q) ||
      t.synonyms.some((s) => s.toLowerCase().includes(q))
  );
}

// Full catalog export
export const fullCatalog: TestsCatalog = {
  version: "2.0",
  panels: panelsCatalog,
  tests: testsCatalog,
};
