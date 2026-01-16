# Lab Tests Catalog - Adding New Tests

This document explains how to add new lab tests to the system.

## Quick Start

To add a new test, add a `TestDefinition` object to `src/data/tests-catalog.ts`.

## Test Definition Schema

### Numeric Test (most common)

```typescript
{
  id: "test_slug",                    // Unique slug ID
  displayName: "Test Display Name",   // Human-readable name
  loinc: "12345-6",                   // LOINC code (optional but recommended)
  kind: "numeric",                    // Test type
  defaultUnit: "mg/dL",               // Default display unit
  units: [                            // Available units with SI conversion
    { code: "mg/dL", toSI: 1, decimals: 1 },
    { code: "mmol/L", toSI: 0.0555, decimals: 2 }
  ],
  referenceRanges: [                  // Reference ranges by age/sex
    { sex: "any", age: { minY: 0, maxY: 200 }, lowSI: 70, highSI: 99 }
  ],
  criticalRanges: [                   // Critical thresholds
    { lowSI: 50, highSI: 500 }
  ],
  panels: ["cmp"],                    // Panel membership
  synonyms: ["Blood Sugar", "Glu"],   // Search synonyms
  notes: "Fasting reference shown."   // Optional notes
}
```

### Categorical Test

```typescript
{
  id: "urine_blood",
  displayName: "Urine Blood",
  loinc: "5794-3",
  kind: "categorical",
  defaultUnit: "",
  units: [],
  referenceRanges: [],
  criticalRanges: [],
  panels: ["ua"],
  synonyms: [],
  options: ["Negative", "Trace", "+", "++", "+++"],
  defaultOption: "Negative"
}
```

### Calculated Test

```typescript
{
  id: "egfr",
  displayName: "eGFR (calc)",
  loinc: "48643-1",
  kind: "calculated",
  defaultUnit: "mL/min/1.73m²",
  units: [{ code: "mL/min/1.73m²", toSI: 1, decimals: 0 }],
  referenceRanges: [
    { sex: "any", age: { minY: 18, maxY: 200 }, lowSI: 60, highSI: null }
  ],
  criticalRanges: [{ lowSI: 15, highSI: null }],
  panels: ["cmp"],
  synonyms: ["GFR"],
  dependencies: ["creatinine"],      // Tests this depends on
  formula: "ckd_epi_2021"            // Formula name in labResultsEngine.ts
}
```

## Adding a New Panel

Add to `panelsCatalog` in `src/data/tests-catalog.ts`:

```typescript
{ id: "lipid", name: "Lipid Panel" }
```

## Adding a New Calculation Formula

Add to `formulas` in `src/lib/labResultsEngine.ts`:

```typescript
formulas["new_formula"] = (ctx) => {
  const a = ctx.results.get("test_a");
  const b = ctx.results.get("test_b");
  if (a === undefined || b === undefined) return null;
  return a + b; // Your formula
};
```

## Key Files

- `src/types/lab-tests.ts` - Type definitions
- `src/data/tests-catalog.ts` - Test definitions catalog
- `src/lib/labResultsEngine.ts` - Flag/delta/conversion logic
- `src/hooks/useLabResults.ts` - React hook for state management
- `src/components/lab-results/` - UI components

## Reference Range Logic

Reference ranges are matched by:
1. Patient sex ("M", "F", or "any")
2. Patient age (within minY-maxY range)

The most specific match is used. Values are stored in SI units and converted for display.

## Flag Logic

```
If value >= critical.highSI → C (Critical)
If value <= critical.lowSI → C (Critical)
If value > refRange.highSI → H (High)
If value < refRange.lowSI → L (Low)
Otherwise → N (Normal)
```

## Delta Calculation

```
deltaPct = round(((currentSI - priorSI) / priorSI) * 100)
```

Returns null if no prior value or prior value is 0.
