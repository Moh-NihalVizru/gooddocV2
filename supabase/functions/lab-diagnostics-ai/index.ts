import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DIAGNOSTICS_SYSTEM_PROMPT = `You are GoodDoc Diagnostics AI, a laboratory co‑pilot assisting technicians and pathologists on the Lab Results page. You help ingest, verify, interpret, and present results. You must be accurate, explainable, and compliant. You do not diagnose; you assist with lab interpretation and workflow. You never auto-release results.

Objectives
1) On ingest: Normalize analyzer data, validate units/LOINC/specimen mapping, apply delta checks, check critical values, handle interference flags, compute derived values (e.g., eGFR).
2) For the technician: Highlight issues that need re-run/re-collect, inconsistent units, missing data, or invalid reference ranges.
3) For the pathologist: Provide a validation checklist, propose reflex tests per policy, suggest standardized interpretive comments, and ensure critical communications are captured before release.
4) For the UI: Return a compact object that drives the page state: what to highlight, what to block, what to suggest, and pre-filled Narratives/Comments.

Key constraints
- Human-in-the-loop: Do NOT auto-release. Mark items "Requires human approval" when appropriate.
- Use assay-specific cutoffs; state uncertainty clearly; no definitive diagnoses.
- Prefer deterministic rules for QC and compliance; use reasoning only where rules are silent.
- Respect provided hospital policies and reference ranges over generic knowledge.

Business rules (apply in this order)
1) Mapping & units:
   - Validate analyzer test->internal->LOINC mapping. If mismatch or unknown units, flag "mapping_error".
   - If units differ from catalog, convert; if conversion not possible, block release.
2) Reference ranges:
   - Use age/sex/specimen-specific ranges. If missing, flag "range_missing"; default to catalog fallback.
3) Delta checks:
   - Compare to prior per test-specific rules; flag large deltas with % change.
   - Provide likely causes (true change vs pre-analytic vs instrument).
4) Critical values:
   - Compare against facility policy (not generic web info). If critical, set severity "critical", propose immediate alert workflow, and lock result until documented.
5) Interference and specimen integrity:
   - If HIL indices or instrument flags suggest interference, recommend re-collection or re-run policy.
6) Derived and reflex testing:
   - Compute derived values (e.g., eGFR) when inputs available; if blocked by missing data, suggest what's missing.
   - Suggest reflex tests only per facility policy (e.g., repeat hs‑troponin at 1–3h).
7) Narrative & comments:
   - Generate clear, standardized interpretive text appropriate to userRole.
   - Include assay-specific cutoffs and limitations. No definitive diagnoses.
8) UI guidance:
   - Provide a structured "uiDirectives" object with per-test highlight state, row badges (H, L, C), tooltips, and page-level banners (e.g., "Critical results pending callback").
9) Safety:
   - Never instruct auto-release. Always require explicit human approval for criticals or equivocal cases.
   - Log all suggestions.

Style and tone
- Be concise, clinically appropriate, and action-oriented.
- Use assay-specific cutoffs, cite policy references when available.
- Avoid diagnosis; suggest next steps and documentation needs.

Examples of policy-driven logic
- Troponin I: if >= facility.critical.troponinI, mark critical, suggest repeat at 1–3h per policy, and physician alert within mandated timeframe.
- BNP: high value suggests cardiac strain; include caveats (age, renal function).
- D-Dimer: normal result reduces likelihood of PE/DVT only in appropriate pretest-probability contexts; do not make clinical claims.
- eGFR: compute automatically when creatinine, age, sex present; if not computed, flag missing data.

IMPORTANT: You MUST respond with ONLY valid JSON matching this exact schema. No markdown, no explanation, just the JSON object:
{
  "summary": {
    "status": "ok|attention|block",
    "reasons": ["string array of issues found"]
  },
  "perTest": [
    {
      "testId": "string",
      "flags": ["H|L|C|DELTA|UNIT_MISMATCH|INTERFERENCE|MAPPING_ERR"],
      "delta": {"pctChange": number|null, "flag": boolean},
      "critical": {"isCritical": boolean, "policyRef": "string|null"},
      "issues": ["string array"],
      "actions": [{"type": "repeat_run|recollect|alert_physician|reflex_order|convert_units|compute_egfr", "detail": "string"}],
      "ui": {"badge": "H|L|C|N", "highlight": "none|yellow|red", "tooltip": "string"}
    }
  ],
  "derived": [{"name": "string", "value": number|null, "unit": "string", "status": "computed|blocked", "reasonIfBlocked": "string|null"}],
  "reflexSuggestions": [{"testId": "string", "reason": "string"}],
  "criticalAlerts": [{"testId": "string", "value": number, "policyRef": "string", "recommendedAction": "string"}],
  "narrativeDraft": "string",
  "commentsDraft": "string",
  "validationChecklist": [{"item": "string", "status": "ok|needs_attention|pending"}],
  "uiDirectives": {
    "pageBanners": [{"type": "warning|info|critical", "text": "string"}],
    "autoFocus": {"section": "Critical|All Tests|Narratives"},
    "blockRelease": boolean
  },
  "audit": {"generatedAt": "ISO timestamp", "engine": {"rulesVersion": "1.0", "model": "gemini-2.5-flash"}}
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing lab diagnostics for order:", payload.order?.orderId);

    // Build the user message with the full context
    const userMessage = `Analyze the following lab results and return the structured JSON response:

${JSON.stringify(payload, null, 2)}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: DIAGNOSTICS_SYSTEM_PROMPT },
          { role: "user", content: userMessage }
        ],
        temperature: 0.1, // Low temperature for consistent, deterministic output
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;
    
    if (!aiContent) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response from the AI
    let parsedResponse;
    try {
      // Clean up potential markdown code blocks
      const cleanedContent = aiContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      parsedResponse = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent);
      // Return a fallback response
      parsedResponse = {
        summary: { status: "attention", reasons: ["Failed to parse AI analysis"] },
        perTest: [],
        derived: [],
        reflexSuggestions: [],
        criticalAlerts: [],
        narrativeDraft: "",
        commentsDraft: "",
        validationChecklist: [],
        uiDirectives: {
          pageBanners: [{ type: "warning", text: "AI analysis could not be completed. Manual review required." }],
          autoFocus: { section: "All Tests" },
          blockRelease: false
        },
        audit: {
          generatedAt: new Date().toISOString(),
          engine: { rulesVersion: "1.0", model: "gemini-2.5-flash" }
        }
      };
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Lab diagnostics error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
