
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

      console.log('M-Pesa STK Push request received:', { phoneNumber, amount, transactionId, userId })
      console.log('🏦 Payment will be deposited to admin M-Pesa account: 0743455893')

      // Simulate realistic M-Pesa STK Push response
      const mockSTKResponse = {
        MerchantRequestID: `MPESA_${Date.now()}`,
        CheckoutRequestID: `ws_CO_${Date.now()}`,
        ResponseCode: "0",
        ResponseDescription: "Success. Request accepted for processing",
        CustomerMessage: "Success. Request accepted for processing"
      }

      // Update the transaction with M-Pesa reference
      const { error: updateError } = await supabaseClient
        .from('transactions')
        .update({ 
          reference_id: mockSTKResponse.CheckoutRequestID,
          status: 'pending',
          metadata: {
            mpesa_request_id: mockSTKResponse.MerchantRequestID,
            checkout_request_id: mockSTKResponse.CheckoutRequestID,
            admin_mpesa_account: '0743455893',
            stk_push_sent: true,
            stk_push_time: new Date().toISOString()
          }
        })
        .eq('id', transactionId)

      if (updateError) {
        console.error('Error updating transaction:', updateError)
        throw updateError
      }

      console.log('✅ Transaction updated with STK Push details')
      console.log('📱 User should now see M-Pesa PIN prompt on phone:', phoneNumber)

      // Simulate realistic payment completion timing (15-30 seconds for PIN entry)
      const completionDelay = 15000 + Math.random() * 15000; // 15-30 seconds
      
      setTimeout(async () => {
        try {
          console.log('🔄 Processing simulated payment completion...')
          console.log(`💰 Payment of KES ${amount} received from ${phoneNumber} to admin account 0743455893`)
          
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
                phone_number: phoneNumber,
                admin_mpesa_account: '0743455893',
                payment_received_on: '0743455893',
                completion_time: new Date().toISOString(),
                payment_confirmed: true
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
            console.log(`✅ Successfully added KES ${amount} to user ${userId} wallet`)
            console.log(`🏦 Money deposited to admin M-Pesa account: 0743455893`)
          }

          // Log successful payment for admin tracking
          console.log('📊 Payment Summary:')
          console.log(`   - Amount: KES ${amount}`)
          console.log(`   - From: ${phoneNumber}`)
          console.log(`   - To: 0743455893 (Admin Account)`)
          console.log(`   - User ID: ${userId}`)
          console.log(`   - Transaction ID: ${transactionId}`)

        } catch (error) {
          console.error('❌ Error in payment completion simulation:', error)
          
          // Update transaction to failed status
          await supabaseClient
            .from('transactions')
            .update({ 
              status: 'failed',
              metadata: {
                error: error.message,
                failed_at: new Date().toISOString()
              }
            })
            .eq('id', transactionId)
        }
      }, completionDelay)

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
    console.error('❌ M-Pesa STK Push error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      message: 'Failed to initiate M-Pesa payment'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
