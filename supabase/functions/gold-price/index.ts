import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fallback gold price (approximate current market price in INR per gram for 24K)
const FALLBACK_GOLD_PRICE = 7800;

interface GoldPriceResponse {
  price_per_gram_24k: number;
  price_per_gram_22k: number;
  last_updated: string;
  is_fallback: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Try to fetch from a free gold price source
    // Using metals-api alternative or direct scraping fallback
    let goldPrice24K = FALLBACK_GOLD_PRICE;
    let isFallback = true;
    
    try {
      // Try GoldAPI.io free tier (if available)
      const goldApiKey = Deno.env.get("GOLD_API_KEY");
      
      if (goldApiKey) {
        const response = await fetch("https://www.goldapi.io/api/XAU/INR", {
          headers: {
            "x-access-token": goldApiKey,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          // GoldAPI returns price per troy ounce, convert to grams
          // 1 troy ounce = 31.1035 grams
          if (data.price) {
            goldPrice24K = data.price / 31.1035;
            isFallback = false;
          }
        }
      }
      
      // If no API key or failed, try alternative free source
      if (isFallback) {
        // Use MetalpriceAPI (has a free tier)
        const metalPriceResponse = await fetch(
          "https://api.metalpriceapi.com/v1/latest?api_key=demo&base=XAU&currencies=INR"
        );
        
        if (metalPriceResponse.ok) {
          const metalData = await metalPriceResponse.json();
          if (metalData.success && metalData.rates?.INR) {
            // Price is per ounce, need to convert
            goldPrice24K = metalData.rates.INR / 31.1035;
            isFallback = false;
          }
        }
      }
    } catch (apiError) {
      console.log("API fetch failed, using fallback:", apiError);
      // Continue with fallback price
    }

    // Calculate 22K price (22/24 of 24K price)
    const goldPrice22K = goldPrice24K * (22 / 24);

    const responseData: GoldPriceResponse = {
      price_per_gram_24k: Math.round(goldPrice24K * 100) / 100,
      price_per_gram_22k: Math.round(goldPrice22K * 100) / 100,
      last_updated: new Date().toISOString(),
      is_fallback: isFallback,
    };

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching gold price:", error);
    
    // Return fallback on any error
    const fallbackResponse: GoldPriceResponse = {
      price_per_gram_24k: FALLBACK_GOLD_PRICE,
      price_per_gram_22k: FALLBACK_GOLD_PRICE * (22 / 24),
      last_updated: new Date().toISOString(),
      is_fallback: true,
    };
    
    return new Response(JSON.stringify(fallbackResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
