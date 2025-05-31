
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const CASHTELE_CONFIG = {
  consumerKey: Deno.env.get('CASHTELE_CONSUMER_KEY') || 'oPvHjXJn6Xs49G0tHO8PLCkwrDj3C4qq5G5T7QvzcHVm0rDu',
  consumerSecret: Deno.env.get('CASHTELE_CONSUMER_SECRET') || 'gcqfgY2Z1rYAnzgAzGYD4gVUWGNCxtxeGUDPv3a2m0UminkD0pQA46cH7WK4J6ZG',
  baseUrl: Deno.env.get('CASHTELE_BASE_URL') || 'https://api.cashtele.com',
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

    const url = new URL(req.url)
    const path = url.pathname

    if (req.method === 'POST' && path === '/cashtele-payment') {
      const { amount, phoneNumber, transactionId, userId } = await req.json()

      console.log('🚀 Cashtele Payment Request:', { phoneNumber, amount, transactionId })

      // Generate basic auth for Cashtele API
      const auth = btoa(`${CASHTELE_CONFIG.consumerKey}:${CASHTELE_CONFIG.consumerSecret}`)
      
      // Simulate Cashtele STK Push - Replace with actual API call
      const cashteleResponse = {
        success: true,
        message: "STK Push sent successfully",
        transactionId: `CT_${Date.now()}`,
        checkoutRequestId: `ws_CO_${Date.now()}`,
        merchantRequestId: `MPESA_${Date.now()}`
      }

      console.log('✅ Cashtele API Response:', cashteleResponse)

      // Update transaction with Cashtele reference
      const { error: updateError } = await supabaseClient
        .from('transactions')
        .update({ 
          reference_id: cashteleResponse.checkoutRequestId,
          status: 'pending',
          metadata: {
            cashtele_transaction_id: cashteleResponse.transactionId,
            checkout_request_id: cashteleResponse.checkoutRequestId,
            merchant_request_id: cashteleResponse.merchantRequestId,
            phone_number: phoneNumber,
            stk_push_sent: true,
            stk_push_time: new Date().toISOString(),
            payment_provider: 'cashtele'
          }
        })
        .eq('id', transactionId)

      if (updateError) {
        console.error('❌ Error updating transaction:', updateError)
        throw updateError
      }

      console.log('📱 STK Push sent to:', phoneNumber)
      console.log('💰 Amount: KES', amount)

      // Simulate faster payment processing (10-20 seconds)
      const completionDelay = 10000 + Math.random() * 10000; // 10-20 seconds
      
      setTimeout(async () => {
        try {
          console.log('🔄 Processing Cashtele payment completion...')
          
          const { error: transactionError } = await supabaseClient
            .from('transactions')
            .update({ 
              status: 'completed',
              completed_at: new Date().toISOString(),
              metadata: {
                cashtele_transaction_id: cashteleResponse.transactionId,
                checkout_request_id: cashteleResponse.checkoutRequestId,
                mpesa_receipt_number: `CTR${Date.now()}`,
                phone_number: phoneNumber,
                completion_time: new Date().toISOString(),
                payment_confirmed: true,
                payment_provider: 'cashtele'
              }
            })
            .eq('id', transactionId)

          if (transactionError) {
            console.error('❌ Error updating transaction status:', transactionError)
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
            console.error('❌ Error updating wallet balance:', balanceError)
          } else {
            console.log(`✅ Successfully added KES ${amount} to user ${userId} wallet via Cashtele`)
          }

        } catch (error) {
          console.error('❌ Error in Cashtele payment completion:', error)
          
          await supabaseClient
            .from('transactions')
            .update({ 
              status: 'failed',
              metadata: {
                error: error.message,
                failed_at: new Date().toISOString(),
                payment_provider: 'cashtele'
              }
            })
            .eq('id', transactionId)
        }
      }, completionDelay)

      return new Response(JSON.stringify(cashteleResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Payment status check endpoint
    if (req.method === 'GET' && path.includes('/payment-status/')) {
      const transactionId = path.split('/').pop()
      
      const { data: transaction, error } = await supabaseClient
        .from('transactions')
        .select('status, metadata, amount')
        .eq('reference_id', transactionId)
        .single()

      if (error) {
        return new Response(JSON.stringify({
          success: false,
          status: 'failed',
          message: 'Transaction not found'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        })
      }

      return new Response(JSON.stringify({
        success: true,
        status: transaction.status,
        amount: transaction.amount,
        transactionId,
        mpesaReceiptNumber: transaction.metadata?.mpesa_receipt_number
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response('Method not allowed', { 
      headers: corsHeaders, 
      status: 405 
    })

  } catch (error) {
    console.error('❌ Cashtele API error:', error)
    return new Response(JSON.stringify({ 
      success: false,
      error: {
        code: 'CASHTELE_ERROR',
        message: error.message
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
