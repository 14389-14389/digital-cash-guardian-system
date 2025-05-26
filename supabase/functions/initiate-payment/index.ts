
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    if (req.method === 'POST') {
      const { amount, phone_number, user_id, transaction_id } = await req.json()

      // For demo purposes, we'll simulate a successful payment
      // In production, this would integrate with actual Pesapal API
      const mockPesapalResponse = {
        order_tracking_id: `PSP_${Date.now()}`,
        merchant_reference: transaction_id,
        redirect_url: `https://pesapal.com/payment?ref=${transaction_id}`,
        status: 'PENDING'
      }

      // Update the transaction with Pesapal reference
      await supabaseClient
        .from('transactions')
        .update({ 
          reference_id: mockPesapalResponse.order_tracking_id,
          status: 'pending'
        })
        .eq('id', transaction_id)

      // Simulate payment completion after 5 seconds (for demo)
      setTimeout(async () => {
        await supabaseClient
          .from('transactions')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', transaction_id)
      }, 5000)

      return new Response(JSON.stringify(mockPesapalResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response('Method not allowed', { 
      headers: corsHeaders, 
      status: 405 
    })

  } catch (error) {
    console.error('Payment initiation error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
