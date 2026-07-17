import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { amount, currency = 'INR', receipt } = await req.json();

    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
    const RAZORPAY_SECRET_KEY = Deno.env.get('RAZORPAY_SECRET_KEY');

    if (!RAZORPAY_KEY_ID || !RAZORPAY_SECRET_KEY) {
      throw new Error('Razorpay keys are not configured in edge function environment');
    }

    // Convert amount to paise (integer)
    const amountInPaise = Math.round(amount * 100);

    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_SECRET_KEY}`);

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Razorpay Error:', data);
      throw new Error(data.error?.description || 'Failed to create Razorpay order');
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
