import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Public endpoint — no sign-in required. The uploaded W-2 is parsed and
    // returned to the client; we never persist it server-side.
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { fileBase64, mimeType, fileName } = await req.json();

    if (!fileBase64 || !mimeType) {
      return new Response(
        JSON.stringify({ error: "fileBase64 and mimeType are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For PDFs, we'll send as text description; for images, send as image
    const isImage = mimeType.startsWith("image/");

    const systemPrompt = `You are an income document parser. The document may be a W-2, a tax return (Form 1040), or a pay stub. Extract the following fields and return ONLY a JSON object (use null for any field you cannot determine):
{
  "grossIncome": number (annual gross wages — W-2 Box 1, 1040 line 1a, or pay stub YTD gross × annualization factor if not full year),
  "federalTaxWithheld": number (W-2 Box 2, 1040 federal tax withheld, or pay stub YTD federal withholding),
  "socialSecurityWages": number (W-2 Box 3 or pay stub equivalent),
  "medicareWages": number (W-2 Box 5 or pay stub equivalent),
  "stateTaxWithheld": number (W-2 Box 17, 1040 state tax, or pay stub YTD state withholding),
  "state": string (two-letter state code if visible),
  "employer": string (employer name),
  "year": number (tax year of the document)
}
For pay stubs, annualize YTD figures based on the pay period end date (e.g. YTD gross at end of June × 2). Do not include any explanation, markdown, or extra text. Just the JSON object.`;

    const messages: any[] = [
      { role: "system", content: systemPrompt },
    ];

    if (isImage) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: "Extract income data from this document (W-2, tax return, or pay stub):" },
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${fileBase64}` },
          },
        ],
      });
    } else {
      // For PDF, send as base64 in text since vision models handle it
      messages.push({
        role: "user",
        content: [
          { type: "text", text: "Extract income data from this document (W-2, tax return, or pay stub):" },
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${fileBase64}` },
          },
        ],
      });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error(`AI processing failed [${aiResponse.status}]`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Parse the JSON from the response
    let extracted;
    try {
      // Try to extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extracted = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in AI response");
      }
    } catch (parseErr) {
      console.error("Failed to parse AI response:", content);
      return new Response(
        JSON.stringify({ error: "Could not extract data from the document. Please try a clearer image." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ extracted }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("parse-w2 error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
