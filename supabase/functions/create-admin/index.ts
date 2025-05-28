
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting admin creation process...')
    
    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing environment variables')
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Server configuration error. Missing required environment variables.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    // Check if admin already exists
    console.log('Checking for existing admin user...')
    const { data: existingUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserByEmail('kevinkisaa@gmail.com')
    
    if (existingUser?.user) {
      console.log('Admin user already exists')
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Admin user already exists',
        credentials: {
          email: 'kevinkisaa@gmail.com',
          password: 'Alfaromeo001@',
          mpesa: '0743455893'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Create new admin user
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
      return new Response(JSON.stringify({ 
        success: false,
        error: `Failed to create admin user: ${createError.message}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    if (!newUser.user) {
      console.error('No user returned from creation')
      return new Response(JSON.stringify({ 
        success: false,
        error: 'User creation failed - no user data returned'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    console.log('Admin user created successfully:', newUser.user.id)

    // Create profile for admin user
    console.log('Creating admin profile...')
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
      // Don't fail the whole process for profile errors
      console.log('Profile creation failed but user was created successfully')
    } else {
      console.log('Profile created successfully')
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
        id: newUser.user.id,
        email: newUser.user.email,
        role: 'admin'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('❌ Unexpected error in admin creation:', error)
    
    // Ensure we always return valid JSON
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return new Response(JSON.stringify({ 
      success: false,
      error: `Server error: ${errorMessage}`,
      details: 'An unexpected error occurred while creating the admin user.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
