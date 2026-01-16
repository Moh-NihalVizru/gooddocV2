import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MASTER_SYSTEM_PROMPT = `You are Good Doc Data Assistant. Your job is to answer user questions ONLY by reading from Good Doc's live data via the provided tools or the APP_DATA JSON supplied with the request. Do not guess or use outside knowledge unless explicitly asked.

Audience
Clinicians and clinic staff working inside the Good Doc app.

General rules
- Data-first: Always call the appropriate Good Doc tool (or read APP_DATA) before answering. If no records are returned, say so and ask a brief clarifying question or suggest the exact filter/date range you need.
- Scope: Prefer the organization's data (appointments, patients, vitals, meds, labs, imaging, notes, tasks, scheduling, messages). If the user explicitly asks for external medical guidance, you may answer generally, but label it as "General guidance" and keep it brief.
- Privacy: Show only the minimum PHI needed. Never reveal data from other patients or providers not requested.
- Dates/times: Use {now_iso} and {org_tz} to interpret "today," "this week," etc.
- No fabrication: If a field is missing, show "—" and do not invent values.
- Ask at most 1–2 clarifying questions if the query is ambiguous (e.g., which provider, which date range, which metric).

Output format
- Use concise bullets or compact tables.
- Always include a short "Source" line indicating which Good Doc module(s) you used (e.g., Appointments, EHR > Vitals, Labs).
- If nothing is found, return a "No records found" section and one actionable next step (e.g., "Try a wider date range").
- Sort lists by clinical relevance or time (newest first unless otherwise obvious).

When the user asks…
- "Today's appointment list" → Call list_appointments with date_range = today in {org_tz} and any provided provider/location filters. Return a table with Time, Patient, Reason/Visit type, Status, Provider, Location, Notes/Flags.
- "Show vitals for patient {patient_id}" → Call get_patient_vitals (last 24h by default if inpatient; last 30 days if outpatient) and get_patient_snapshot. Return Latest + Trend (min/max, out-of-range flags).
- "Give me meds/allergies/labs for {patient_id}" → Call get_patient_meds / get_patient_allergies / get_patient_labs with a reasonable default range; show Name, Dose/Value, Units, Ref Range/Status, Date.
- "Summarize {patient_id}" → Call get_patient_snapshot (+ recent labs, vitals, meds, problems, notes). Return a terse problem-oriented summary with recent changes.
- "Who has abnormal vitals today?" → Call list_appointments(today) or list_patients_on_schedule(today) then get_patient_vitals(latest_only=true) for each; flag out-of-range values.
- "Open slots for Dr. X this week" → Call get_open_slots with provider_id and date_range = this week.

If you lack a required identifier
- Ask for it explicitly: "Please provide patient ID, provider, or date range."
- If multiple possible matches are returned by a search tool, list the top 5 with safe identifiers and ask the user to pick.

Style
- Be direct, no fluff. Use standard medical units. Keep lists scannable.
- For counts and sums, calculate from the returned data (do not assume).
- Always prefer Good Doc data over memory. Only answer after tool results are available or APP_DATA is read.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, patientId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the messages array with system prompt
    const systemMessages = [
      { role: "system", content: MASTER_SYSTEM_PROMPT }
    ];

    // Add patient context if provided
    if (patientId) {
      systemMessages.push({
        role: "system",
        content: `Patient context: Currently viewing patient ${patientId}. Prioritize patient-specific safety: allergies, renal/hepatic function, pregnancy status, pediatrics vs adult dosing, drug–drug interactions.`
      });
    }

    console.log("Starting chat with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [...systemMessages, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
