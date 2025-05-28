
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

    // First, try to delete any existing admin user to start fresh
    try {
      const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail('kevinkisaa@gmail.com')
      if (existingUser?.user) {
        console.log('Deleting existing admin user...')
        await supabaseAdmin.auth.admin.deleteUser(existingUser.user.id)
      }
    } catch (error) {
      console.log('No existing user to delete or error deleting:', error)
    }

    // Create new admin user with correct credentials
    console.log('Creating new admin user...')
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: 'kevinkisaa@gmail.com',
      password: 'Alfaromeo001@',
      email_confirm: true,
      user_metadata: {
        full_name: 'Kevin Kisaa',
        phone: '0743455893',
        role: 'admin'
      }
    })

    if (createError) {
      console.error('Error creating user:', createError)
      throw createError
    }

    console.log('Admin user created successfully:', newUser.user?.id)

    // Create or update profile for admin user
    if (newUser.user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({ 
          id: newUser.user.id,
          full_name: 'Kevin Kisaa',
          phone: '0743455893',
          role: 'admin',
          wallet_balance: 0
        }, {
          onConflict: 'id'
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        throw profileError
      }

      console.log('Profile created/updated successfully')
    }

    console.log('✅ Admin setup complete!')
    console.log('📧 Email: kevinkisaa@gmail.com')
    console.log('🔑 Password: Alfaromeo001@')
    console.log('📱 M-Pesa: 0743455893')

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Admin user created successfully',
      credentials: {
        email: 'kevinkisaa@gmail.com',
        password: 'Alfaromeo001@',
        mpesa: '0743455893'
      },
      user: {
        id: newUser.user?.id,
        email: newUser.user?.email,
        role: 'admin'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('❌ Error in admin creation:', error)
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      details: 'Failed to create admin user. Please check logs for more details.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
