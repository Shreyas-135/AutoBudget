import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = type === 'wellness'
      ? "You are a supportive wellness coach helping users with financial stress and well-being. Provide empathetic, actionable advice."
      : "You are a financial assistant helping users manage their budget and finances. Provide clear, practical financial advice.";

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
      }),
    });

    const data = await response.json();
    let aiResponse = data.choices?.[0]?.message?.content || "No response received.";

    // 🧹 Enhanced Markdown cleaner and line formatter
    aiResponse = aiResponse
      .replace(/\*\*\s*/g, '')                            // remove all bold markers
      .replace(/(\*\s*)+/g, '\n• ')                       // turn * bullet chains into new lines with dot bullets
      .replace(/\n{2,}/g, '\n')                           // collapse multiple newlines
      .replace(/([.?!])\s*(?=•)/g, '$1\n')                // ensure each bullet starts on a new line
      .replace(/\s{2,}/g, ' ')                            // collapse extra spaces
      .replace(/^\s*•/gm, match => '\n' + match.trim())   // ensure bullets start on new lines
      .trim();

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
