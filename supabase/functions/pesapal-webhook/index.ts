
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'POST') {
      const webhookData = await req.json()
      
      console.log('Received Pesapal webhook:', webhookData)

      // Log webhook for debugging
      await supabaseClient
        .from('payment_webhooks')
        .insert({
          provider: 'pesapal',
          event_type: webhookData.Type || 'payment_update',
          reference_id: webhookData.OrderTrackingId,
          payload: webhookData,
        })

      // Update transaction based on webhook
      if (webhookData.OrderTrackingId && webhookData.PaymentStatus) {
        const status = webhookData.PaymentStatus === 'COMPLETED' ? 'completed' : 
                      webhookData.PaymentStatus === 'FAILED' ? 'failed' : 'pending'

        await supabaseClient
          .from('transactions')
          .update({ 
            status,
            completed_at: status === 'completed' ? new Date().toISOString() : null,
            metadata: webhookData
          })
          .eq('reference_id', webhookData.OrderTrackingId)

        console.log(`Updated transaction ${webhookData.OrderTrackingId} to ${status}`)
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response('Method not allowed', { 
      headers: corsHeaders, 
      status: 405 
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
