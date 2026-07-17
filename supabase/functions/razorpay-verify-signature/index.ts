import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import crypto from "node:crypto";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = await req.json();

    const RAZORPAY_SECRET_KEY = Deno.env.get('RAZORPAY_SECRET_KEY');

    if (!RAZORPAY_SECRET_KEY) {
      throw new Error('Razorpay secret key is not configured');
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_SECRET_KEY)
      .update(text)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new Error('Invalid payment signature');
    }

    // Initialize Supabase admin client to bypass RLS and update booking
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update booking status
    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'paid',
        payment_status: 'held',
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      })
      .eq('id', booking_id);

    if (error) {
      throw new Error(`Database update failed: ${error.message}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
