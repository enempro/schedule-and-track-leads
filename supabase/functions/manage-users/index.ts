import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

interface RequestBody {
  action: 'create' | 'update' | 'delete'
  email?: string
  password?: string
  role?: 'super' | 'standard'
  userId?: string
  userData?: {
    email?: string
    password?: string
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify API key
    const apiKey = req.headers.get('x-api-key')
    const expectedKey = Deno.env.get('MANAGE_USERS_SECRET')
    
    if (!apiKey || apiKey !== expectedKey) {
      console.error('Unauthorized: Invalid or missing API key')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body: RequestBody = await req.json()
    const { action, email, password, role, userId, userData } = body

    console.log('Processing action:', action)

    switch (action) {
      case 'create': {
        if (!email || !password || !role) {
          return new Response(
            JSON.stringify({ error: 'Email, password, and role are required' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        // Create user
        const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        })

        if (createError) {
          console.error('Error creating user:', createError)
          return new Response(
            JSON.stringify({ error: createError.message }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        // Assign role
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: user.user.id,
            role: role,
          })

        if (roleError) {
          console.error('Error assigning role:', roleError)
          // Rollback: delete the user
          await supabaseAdmin.auth.admin.deleteUser(user.user.id)
          return new Response(
            JSON.stringify({ error: 'Failed to assign role' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        console.log('User created successfully:', user.user.id)
        return new Response(
          JSON.stringify({ 
            success: true, 
            user: {
              id: user.user.id,
              email: user.user.email,
              role: role,
            }
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      case 'update': {
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'userId is required' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        // Update user data if provided
        if (userData) {
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            userData
          )

          if (updateError) {
            console.error('Error updating user:', updateError)
            return new Response(
              JSON.stringify({ error: updateError.message }),
              { 
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            )
          }
        }

        // Update role if provided
        if (role) {
          // Delete existing roles
          const { error: deleteRoleError } = await supabaseAdmin
            .from('user_roles')
            .delete()
            .eq('user_id', userId)

          if (deleteRoleError) {
            console.error('Error deleting old roles:', deleteRoleError)
          }

          // Insert new role
          const { error: roleError } = await supabaseAdmin
            .from('user_roles')
            .insert({
              user_id: userId,
              role: role,
            })

          if (roleError) {
            console.error('Error updating role:', roleError)
            return new Response(
              JSON.stringify({ error: 'Failed to update role' }),
              { 
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            )
          }
        }

        console.log('User updated successfully:', userId)
        return new Response(
          JSON.stringify({ success: true, userId }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      case 'delete': {
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'userId is required' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        // Delete user (roles will cascade delete due to FK constraint if added)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

        if (deleteError) {
          console.error('Error deleting user:', deleteError)
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        console.log('User deleted successfully:', userId)
        return new Response(
          JSON.stringify({ success: true, userId }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Must be create, update, or delete' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
    }
  } catch (error) {
    console.error('Error in manage-users function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
