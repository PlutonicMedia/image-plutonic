import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { messages, aspectRatio, adCopyContext, draftMode } = await req.json();

    const systemPrompt = `Generate a photorealistic ad asset. 1:1 product shape is mandatory. No conversational filler. No text or watermarks. Aspect ratio: ${aspectRatio || "1:1"}.${draftMode ? " Output at lower resolution for quick draft preview." : ""}`;

    // Step 1: Generate image
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error("No image in response:", JSON.stringify(data).slice(0, 500));
      throw new Error("No image was generated. Try a different prompt.");
    }

    // Step 2: Generate ad copy concurrently if context provided
    let adCopy = null;
    if (adCopyContext) {
      try {
        const copyResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              {
                role: "system",
                content: "You are an expert ad copywriter. Write punchy, conversion-focused ad copy. Be concise.",
              },
              {
                role: "user",
                content: `Write ad copy for this product:\nName: ${adCopyContext.product_name}\nDescription: ${adCopyContext.description}\nUSPs: ${adCopyContext.usps?.join(', ')}`,
              },
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "generate_ad_copy",
                  description: "Generate hook, body, and CTA for an ad",
                  parameters: {
                    type: "object",
                    properties: {
                      hook: { type: "string", description: "Attention-grabbing headline (max 10 words)" },
                      body: { type: "string", description: "Persuasive body text (1-2 sentences)" },
                      cta: { type: "string", description: "Call-to-action text (2-5 words)" },
                    },
                    required: ["hook", "body", "cta"],
                    additionalProperties: false,
                  },
                },
              },
            ],
            tool_choice: { type: "function", function: { name: "generate_ad_copy" } },
          }),
        });

        if (copyResponse.ok) {
          const copyData = await copyResponse.json();
          const toolCall = copyData.choices?.[0]?.message?.tool_calls?.[0];
          if (toolCall?.function?.arguments) {
            adCopy = JSON.parse(toolCall.function.arguments);
          }
        }
      } catch (e) {
        console.error("Ad copy generation failed (non-blocking):", e);
      }
    }

    return new Response(JSON.stringify({ imageUrl, adCopy }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("generate-creative error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
