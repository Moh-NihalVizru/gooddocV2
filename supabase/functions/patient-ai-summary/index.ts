import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { patientName, age, sex, allergies, conditions, chiefComplaint, vitals } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a medical AI assistant helping clinicians. Generate a concise patient summary for quick reference before a consultation. Keep it to 2-3 sentences maximum. Focus on relevant clinical context.`;

    const userPrompt = `Generate a brief clinical summary for this patient visit:
- Patient: ${patientName}, ${age} year old ${sex === 'M' ? 'male' : sex === 'F' ? 'female' : 'patient'}
- Allergies: ${allergies?.length ? allergies.join(', ') : 'None documented'}
- Active Conditions: ${conditions?.length ? conditions.join(', ') : 'None documented'}
- Chief Complaint: ${chiefComplaint || 'Not specified'}
${vitals ? `- Current Vitals: ${vitals.bp ? `BP ${vitals.bp} mmHg` : ''}${vitals.heartRate ? `, HR ${vitals.heartRate} bpm` : ''}${vitals.spo2 ? `, SpO2 ${vitals.spo2}%` : ''}${vitals.temperature ? `, Temp ${vitals.temperature}°C` : ''}` : ''}

Provide a brief summary highlighting key clinical considerations for this visit.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("patient-ai-summary error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
