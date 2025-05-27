
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

    // Check if admin already exists
    const { data: existingAdmin } = await supabaseAdmin.auth.admin.listUsers()
    const adminExists = existingAdmin.users.some(user => user.email === 'kevinmuli047@gmail.com')

    if (adminExists) {
      return new Response(
        JSON.stringify({ message: 'Admin user already exists' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Create admin user
    const { data: adminUser, error: adminError } = await supabaseAdmin.auth.admin.createUser({
      email: 'kevinmuli047@gmail.com',
      password: 'Alfaromeo001@',
      email_confirm: true,
      user_metadata: {
        full_name: 'Kevin Muli',
        role: 'admin'
      }
    })

    if (adminError) {
      throw adminError
    }

    // Update profile to admin role
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        role: 'admin',
        full_name: 'Kevin Muli'
      })
      .eq('id', adminUser.user.id)

    if (profileError) {
      throw profileError
    }

    return new Response(
      JSON.stringify({ 
        message: 'Admin user created successfully',
        user_id: adminUser.user.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error creating admin:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
