
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
      const { phoneNumber, amount, transactionId, userId } = await req.json()

      console.log('M-Pesa STK Push request:', { phoneNumber, amount, transactionId, userId })

      // For demo purposes, simulate M-Pesa STK Push
      // In production, this would integrate with Safaricom M-Pesa API
      const mockSTKResponse = {
        MerchantRequestID: `MPESA_${Date.now()}`,
        CheckoutRequestID: `ws_CO_${Date.now()}`,
        ResponseCode: "0",
        ResponseDescription: "Success. Request accepted for processing",
        CustomerMessage: "Success. Request accepted for processing"
      }

      // Update the transaction with M-Pesa reference
      await supabaseClient
        .from('transactions')
        .update({ 
          reference_id: mockSTKResponse.CheckoutRequestID,
          status: 'pending',
          metadata: {
            mpesa_request_id: mockSTKResponse.MerchantRequestID,
            checkout_request_id: mockSTKResponse.CheckoutRequestID
          }
        })
        .eq('id', transactionId)

      console.log('Updated transaction with STK Push details')

      // Simulate successful payment after 10 seconds (user enters PIN)
      setTimeout(async () => {
        try {
          console.log('Processing simulated payment completion...')
          
          // Update transaction to completed
          const { error: transactionError } = await supabaseClient
            .from('transactions')
            .update({ 
              status: 'completed',
              completed_at: new Date().toISOString(),
              metadata: {
                mpesa_request_id: mockSTKResponse.MerchantRequestID,
                checkout_request_id: mockSTKResponse.CheckoutRequestID,
                mpesa_receipt_number: `MPR${Date.now()}`,
                phone_number: phoneNumber
              }
            })
            .eq('id', transactionId)

          if (transactionError) {
            console.error('Error updating transaction:', transactionError)
            return
          }

          // Update user wallet balance
          const { error: balanceError } = await supabaseClient
            .from('profiles')
            .update({
              wallet_balance: supabaseClient.raw(`wallet_balance + ${amount}`)
            })
            .eq('id', userId)

          if (balanceError) {
            console.error('Error updating wallet balance:', balanceError)
          } else {
            console.log(`Successfully added ${amount} to user ${userId} wallet`)
          }

        } catch (error) {
          console.error('Error in payment completion simulation:', error)
        }
      }, 10000) // 10 seconds delay to simulate PIN entry

      return new Response(JSON.stringify(mockSTKResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response('Method not allowed', { 
      headers: corsHeaders, 
      status: 405 
    })

  } catch (error) {
    console.error('M-Pesa STK Push error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
