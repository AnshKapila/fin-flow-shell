 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 
 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
 };
 
 interface NavData {
   scheme_code: string;
   scheme_name: string;
   nav: number;
   date: string;
   last_updated: string;
 }
 
 // Fallback NAV data for common schemes if API fails
 const FALLBACK_NAV: Record<string, number> = {
   "120503": 55.45,  // Axis Bluechip Fund Direct Plan Growth
   "122639": 75.32,  // Parag Parikh Flexi Cap Fund Direct Plan Growth
   "118989": 120.18, // Mirae Asset Large Cap Fund Direct Plan Growth
   "125497": 145.67, // SBI Small Cap Fund Direct Plan Growth
   "120837": 215.25, // HDFC Top 100 Fund Direct Plan Growth
 };
 
 serve(async (req) => {
   // Handle CORS preflight
   if (req.method === 'OPTIONS') {
     return new Response('ok', { headers: corsHeaders });
   }
 
   try {
     const url = new URL(req.url);
    let schemeCode: string | null = url.searchParams.get('scheme_code');
    let search: string | null = url.searchParams.get('search');
 
    // Also handle POST/request body for compatibility
    if (req.method === 'POST' && (!schemeCode && !search)) {
      try {
        const body = await req.json();
        if (body?.scheme_code) schemeCode = body.scheme_code;
        if (body?.search) search = body.search;
      } catch (e) {
        console.log('No JSON body or parse error:', e);
      }
    }
 
    console.log('Request params - schemeCode:', schemeCode, 'search:', search);
 
     // Search for mutual funds
     if (search) {
       try {
         const searchResponse = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(search)}`, {
           headers: { 'Accept': 'application/json' },
         });
 
         if (!searchResponse.ok) {
           throw new Error(`Search API error: ${searchResponse.status}`);
         }
 
         const searchResults = await searchResponse.json();
         
         // Filter and return top 10 results - prioritize Direct Growth plans
         const filtered = searchResults
           .filter((item: any) => 
             item.schemeName?.toLowerCase().includes('direct') && 
             item.schemeName?.toLowerCase().includes('growth')
           )
           .slice(0, 10)
           .map((item: any) => ({
             scheme_code: item.schemeCode?.toString(),
             scheme_name: item.schemeName,
           }));
 
         return new Response(
           JSON.stringify({ results: filtered, source: 'api' }),
           { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         );
       } catch (error) {
         console.error('Search failed:', error);
         return new Response(
           JSON.stringify({ results: [], source: 'fallback', error: 'Search unavailable' }),
           { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         );
       }
     }
 
     // Get NAV for specific scheme
     if (schemeCode) {
       try {
         const navResponse = await fetch(`https://api.mfapi.in/mf/${schemeCode}`, {
           headers: { 'Accept': 'application/json' },
         });
 
         if (!navResponse.ok) {
           throw new Error(`NAV API error: ${navResponse.status}`);
         }
 
         const navData = await navResponse.json();
         
         if (!navData.data || navData.data.length === 0) {
           throw new Error('No NAV data available');
         }
 
         const latestNav = navData.data[0];
         const response: NavData = {
           scheme_code: schemeCode,
           scheme_name: navData.meta?.scheme_name || 'Unknown Scheme',
           nav: parseFloat(latestNav.nav),
           date: latestNav.date,
           last_updated: new Date().toISOString(),
         };
 
         return new Response(
           JSON.stringify(response),
           { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         );
       } catch (error) {
         console.error('NAV fetch failed:', error);
         
         // Return fallback NAV if available
         const fallbackNav = FALLBACK_NAV[schemeCode];
         if (fallbackNav) {
           return new Response(
             JSON.stringify({
               scheme_code: schemeCode,
               scheme_name: 'Mutual Fund',
               nav: fallbackNav,
               date: new Date().toLocaleDateString('en-IN'),
               last_updated: new Date().toISOString(),
               source: 'fallback',
             }),
             { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
           );
         }
 
         return new Response(
           JSON.stringify({ error: 'NAV unavailable', scheme_code: schemeCode }),
           { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         );
       }
     }
 
     // Get popular funds list
     const popularFunds = [
       { scheme_code: "120503", scheme_name: "Axis Bluechip Fund Direct Plan Growth", category: "Large Cap", amc: "Axis AMC" },
       { scheme_code: "122639", scheme_name: "Parag Parikh Flexi Cap Fund Direct Plan Growth", category: "Flexi Cap", amc: "PPFAS" },
       { scheme_code: "118989", scheme_name: "Mirae Asset Large Cap Fund Direct Plan Growth", category: "Large Cap", amc: "Mirae" },
       { scheme_code: "125497", scheme_name: "SBI Small Cap Fund Direct Plan Growth", category: "Small Cap", amc: "SBI MF" },
       { scheme_code: "120837", scheme_name: "HDFC Top 100 Fund Direct Plan Growth", category: "Large Cap", amc: "HDFC AMC" },
     ];
 
     return new Response(
       JSON.stringify({ popular: popularFunds }),
       { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     );
 
   } catch (error) {
     console.error('Error in mutual-fund-nav:', error);
     return new Response(
       JSON.stringify({ error: 'Internal server error' }),
       { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     );
   }
 });