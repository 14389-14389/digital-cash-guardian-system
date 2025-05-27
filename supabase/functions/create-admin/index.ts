
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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if admin user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail('kevinkisaa@gmail.com')
    
    if (existingUser?.user) {
      // Update existing user to admin role
      await supabaseAdmin
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', existingUser.user.id)
      
      return new Response(JSON.stringify({ 
        message: 'Admin user already exists and role updated',
        user: existingUser.user 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Create admin user
    const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
      email: 'kevinkisaa@gmail.com',
      password: 'Alfaromeo001@',
      email_confirm: true,
      user_metadata: {
        full_name: 'Kevin Kisaa',
        role: 'admin'
      }
    })

    if (error) throw error

    // Update profile to admin
    if (newUser.user) {
      await supabaseAdmin
        .from('profiles')
        .update({ 
          role: 'admin',
          full_name: 'Kevin Kisaa'
        })
        .eq('id', newUser.user.id)
    }

    console.log('Admin user created successfully: kevinkisaa@gmail.com')
    console.log('M-Pesa account configured: 0743455893')

    return new Response(JSON.stringify({ 
      message: 'Admin user created successfully',
      user: newUser.user,
      mpesa_account: '0743455893'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error creating admin user:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
