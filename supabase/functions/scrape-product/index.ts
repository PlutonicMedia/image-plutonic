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
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY is not configured");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { url } = await req.json();
    if (!url) throw new Error("url is required");

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log("Scraping URL:", formattedUrl);

    // Step 1: Scrape with Firecrawl
    let markdown = "";
    try {
      const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: formattedUrl,
          formats: ["markdown"],
          onlyMainContent: true,
        }),
      });

      const scrapeData = await scrapeResponse.json();
      if (!scrapeResponse.ok) {
        console.error("Firecrawl error:", scrapeData);
        if (scrapeResponse.status === 402) {
          throw new Error("Firecrawl credits exhausted. Please top up your Firecrawl plan.");
        }
        throw new Error(`Firecrawl error: ${scrapeData.error || scrapeResponse.status}`);
      }

      markdown = scrapeData.data?.markdown || scrapeData.markdown || "";
    } catch (scrapeErr) {
      console.error("Scrape step failed:", scrapeErr);
      // Return fallback neutral context instead of crashing
      return new Response(JSON.stringify({
        product_name: "Unknown Product",
        description: "Could not extract product details from URL.",
        usps: ["Quality craftsmanship", "Premium materials", "Modern design"],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!markdown) {
      // Return fallback if no content
      return new Response(JSON.stringify({
        product_name: "Unknown Product",
        description: "No content found at the provided URL.",
        usps: ["Quality craftsmanship", "Premium materials", "Modern design"],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Scraped content length:", markdown.length);

    // Step 2: Extract structured data with Gemini
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: "You are a product data extractor. Extract structured product information from website content. Be concise and factual.",
          },
          {
            role: "user",
            content: `Extract the product information from this website content:\n\n${markdown.slice(0, 8000)}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_product",
              description: "Extract product name, description, and 3 unique selling points from website content.",
              parameters: {
                type: "object",
                properties: {
                  product_name: { type: "string", description: "The product name" },
                  description: { type: "string", description: "A concise product description (1-2 sentences)" },
                  usps: {
                    type: "array",
                    items: { type: "string" },
                    description: "Exactly 3 key unique selling points / benefits",
                    minItems: 3,
                    maxItems: 3,
                  },
                },
                required: ["product_name", "description", "usps"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_product" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const text = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, text);
      // Fallback on AI failure
      return new Response(JSON.stringify({
        product_name: "Unknown Product",
        description: "AI extraction failed. Edit the details manually.",
        usps: ["Quality craftsmanship", "Premium materials", "Modern design"],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({
        product_name: "Unknown Product",
        description: "AI could not parse product data. Edit manually.",
        usps: ["Quality craftsmanship", "Premium materials", "Modern design"],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const extracted = JSON.parse(toolCall.function.arguments);
    console.log("Extracted product:", extracted.product_name);

    return new Response(JSON.stringify(extracted), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("scrape-product error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
