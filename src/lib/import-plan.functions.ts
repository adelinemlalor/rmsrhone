import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface ImportedPlan {
  day_date: string | null;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  title: string;
  description: string | null;
  location_name: string | null;
  city: string | null;
  category: string;
  cost_estimated: number | null;
  confirmation_number: string | null;
}

interface Input {
  text: string;
  pdfBase64: string | null;
  filename: string | null;
  tripStart: string | null;
  tripEnd: string | null;
}

const CATS = [
  "Flight", "Hotel", "Restaurant", "Activity", "Tour", "Hiking", "Beach", "Diving", "Nightlife",
  "Transportation", "Train", "Bus", "Ferry", "Rental Car", "Meeting", "Event", "Shopping",
  "Free Time", "General Plan", "Note",
];

const nstr = { type: ["string", "null"] };
const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["plans"],
  properties: {
    plans: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "day_date", "start_time", "end_time", "duration_minutes", "title", "description",
          "location_name", "city", "category", "cost_estimated", "confirmation_number",
        ],
        properties: {
          day_date: { ...nstr, description: "YYYY-MM-DD" },
          start_time: { ...nstr, description: "24h HH:MM" },
          end_time: { ...nstr, description: "24h HH:MM" },
          duration_minutes: { type: ["integer", "null"] },
          title: { type: "string" },
          description: nstr,
          location_name: nstr,
          city: nstr,
          category: { type: "string", enum: CATS },
          cost_estimated: { type: ["number", "null"] },
          confirmation_number: nstr,
        },
      },
    },
  },
};

export const parseTripPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Input) => {
    const text = String(d?.text ?? "").slice(0, 60000);
    const pdf = d?.pdfBase64 ? String(d.pdfBase64) : null;
    if (!text.trim() && !pdf) throw new Error("Add some notes or a document first.");
    if (pdf && pdf.length > 14_000_000) throw new Error("That PDF is too large (max ~10 MB).");
    return {
      text,
      pdfBase64: pdf,
      filename: d?.filename ? String(d.filename).slice(0, 200) : "plan.pdf",
      tripStart: d?.tripStart ?? null,
      tripEnd: d?.tripEnd ?? null,
    };
  })
  .handler(async ({ data }): Promise<{ plans: ImportedPlan[]; error: string | null }> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { plans: [], error: "AI is not configured." };

    const today = new Date().toISOString().slice(0, 10);
    const instructions = `You turn travel notes into itinerary plans. Today is ${today}.
Trip dates: ${data.tripStart ?? "unknown"} to ${data.tripEnd ?? "unknown"}.
Rules:
- One plan per distinct activity, flight, hotel stay, meal, transfer, etc. Keep the source's wording for details in "description".
- Resolve dates to real calendar dates. If the notes say "Day 1", "Day 2", map Day 1 to the trip start date. If a weekday and date conflict, trust the numeric date. If no year is given, use the trip's year, else the next upcoming occurrence.
- If no date can be determined, day_date is null.
- Times in 24h HH:MM. If only a length is known, set duration_minutes.
- Costs as plain numbers only when stated.
- Never invent details not in the source.`;

    const content: Record<string, unknown>[] = [];
    if (data.pdfBase64) {
      content.push({
        type: "input_file",
        filename: data.filename,
        file_data: `data:application/pdf;base64,${data.pdfBase64}`,
      });
    }
    content.push({ type: "input_text", text: data.text.trim() || "Extract the itinerary from the attached document." });

    let res: Response;
    try {
      res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": key,
          "X-Lovable-AIG-SDK": "fetch",
        },
        body: JSON.stringify({
          model: "openai/gpt-6-astra",
          instructions,
          input: [{ role: "user", content }],
          stream: true,
          store: false,
          reasoning: { effort: "low", summary: "auto" },
          include: ["reasoning.encrypted_content"],
          text: { format: { type: "json_schema", name: "itinerary", strict: true, schema: SCHEMA } },
        }),
      });
    } catch (e) {
      console.error("import fetch failed", e);
      return { plans: [], error: "Couldn't reach the AI service. Try again in a moment." };
    }

    if (!res.ok || !res.body) {
      const body = await res.text().catch(() => "");
      console.error("import AI error", res.status, body.slice(0, 500));
      if (res.status === 429) return { plans: [], error: "Too many requests — wait a minute and try again." };
      if (res.status === 402) return { plans: [], error: "AI credits are used up. Add credits to keep importing." };
      return { plans: [], error: `The AI couldn't read that (error ${res.status}).` };
    }

    // Consume the SSE stream and collect the output text.
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    let out = "";
    let failed: string | null = null;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let idx;
      while ((idx = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload) as { type?: string; delta?: string; response?: { error?: { message?: string } } };
          if (ev.type === "response.output_text.delta" && ev.delta) out += ev.delta;
          if (ev.type === "response.failed" || ev.type === "error")
            failed = ev.response?.error?.message ?? "The AI request failed.";
        } catch {
          /* ignore partial lines */
        }
      }
    }
    if (failed) return { plans: [], error: failed };
    if (!out.trim()) return { plans: [], error: "The AI returned nothing for this document." };

    try {
      const parsed = JSON.parse(out) as { plans: ImportedPlan[] };
      return { plans: parsed.plans.filter((p) => p.title?.trim()), error: null };
    } catch {
      return { plans: [], error: "Couldn't understand the AI's answer. Try again." };
    }
  });
