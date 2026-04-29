// Extract structured, trackable actions from advice cards using Lovable AI.
// Returns an array of { title, description, category, priority, target_metric, deadline_days }.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AdviceInput {
  id: string;
  title: string;
  description: string;
  actionSteps?: string[];
  category: string;
  priority: "high" | "medium" | "low";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Public endpoint — no sign-in required.
    const { advice } = (await req.json()) as { advice: AdviceInput[] };
    if (!Array.isArray(advice) || advice.length === 0) {
      return new Response(JSON.stringify({ error: "advice array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Compact context for the model
    const context = advice
      .slice(0, 25) // safety cap
      .map((a, i) => {
        const steps = a.actionSteps?.length ? `\nSteps: ${a.actionSteps.join(" | ")}` : "";
        return `[${i}] id=${a.id} priority=${a.priority} category=${a.category}\nTitle: ${a.title}\nDescription: ${a.description}${steps}`;
      })
      .join("\n\n");

    const systemPrompt = `You convert personal-finance advice cards into discrete, trackable actions.
For each advice card, extract 1-3 concrete actions a user can put on a Kanban board.
Each action MUST be:
- Specific and verb-led (e.g. "Open Fidelity HSA and contribute $4,150" not "Save more")
- Measurable (include a target_metric like "$4,150 contributed" or "3 months expenses saved")
- Time-bound (deadline_days from today; high priority 30, medium 90, low 180 — adjust based on urgency)
Pick the closest category from: savings, investing, debt, retirement, tax, insurance, education, other.
Use source_advice_index to point back to the card index given.`;

    const userPrompt = `Extract actions from these advice cards:\n\n${context}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "emit_actions",
              description: "Emit the structured list of actions extracted from advice cards.",
              parameters: {
                type: "object",
                properties: {
                  actions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        source_advice_index: { type: "integer" },
                        title: { type: "string" },
                        description: { type: "string" },
                        category: {
                          type: "string",
                          enum: ["savings", "investing", "debt", "retirement", "tax", "insurance", "education", "other"],
                        },
                        priority: { type: "string", enum: ["high", "medium", "low"] },
                        target_metric: { type: "string" },
                        deadline_days: { type: "integer" },
                      },
                      required: ["source_advice_index", "title", "description", "category", "priority", "target_metric", "deadline_days"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["actions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "emit_actions" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ actions: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const parsed = JSON.parse(toolCall.function.arguments);
    const rawActions = (parsed.actions || []) as Array<{
      source_advice_index: number;
      title: string;
      description: string;
      category: string;
      priority: "high" | "medium" | "low";
      target_metric: string;
      deadline_days: number;
    }>;

    // Enrich with source advice references
    const enriched = rawActions.map((a) => {
      const source = advice[a.source_advice_index];
      return {
        title: a.title,
        description: a.description,
        category: a.category,
        priority: a.priority,
        target_metric: a.target_metric,
        deadline_days: a.deadline_days,
        source_advice_id: source?.id || null,
        source_advice_title: source?.title || null,
        source_advice_snippet: source?.description?.slice(0, 240) || null,
      };
    });

    return new Response(JSON.stringify({ actions: enriched }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-actions error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
