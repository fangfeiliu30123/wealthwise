import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
}

const PLAID_BASE_URL = "https://sandbox.plaid.com"

const normalizeSecret = (value?: string | null) => {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return ''

  const lastNonEmptyLine = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .at(-1) ?? ''

  const withoutOuterQuotes = lastNonEmptyLine.replace(/^['"]|['"]$/g, '')
  const assignmentMatch = withoutOuterQuotes.match(/^(?:export\s+)?[A-Z0-9_]+=([\s\S]+)$/)
  return (assignmentMatch?.[1] ?? withoutOuterQuotes).trim().replace(/^['"]|['"]$/g, '')
}

const getPlaidCredentials = () => {
  const rawClientId = Deno.env.get('PLAID_CLIENT_ID')
  const rawSecret = Deno.env.get('PLAID_SECRET')
  const clientId = normalizeSecret(rawClientId)
  const secret = normalizeSecret(rawSecret)

  const clientIdHasWhitespace = /\s/.test(clientId)
  const secretHasWhitespace = /\s/.test(secret)
  const clientIdLooksLikeAssignment = /^(?:export\s+)?[A-Z0-9_]+=/.test(rawClientId?.trim() ?? '')
  const secretLooksLikeAssignment = /^(?:export\s+)?[A-Z0-9_]+=/.test(rawSecret?.trim() ?? '')

  if (!clientId || !secret || clientIdHasWhitespace || secretHasWhitespace) {
    console.error('Plaid credentials misconfigured', {
      hasClientId: Boolean(clientId),
      hasSecret: Boolean(secret),
      clientIdLength: clientId.length,
      secretLength: secret.length,
      clientIdHasWhitespace,
      secretHasWhitespace,
      clientIdLooksLikeAssignment,
      secretLooksLikeAssignment,
    })
    return null
  }

  return { clientId, secret }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const userId = user.id
    const credentials = getPlaidCredentials()

    if (!credentials) {
      return new Response(JSON.stringify({ error: 'Plaid credentials are misconfigured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const response = await fetch(`${PLAID_BASE_URL}/link/token/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: credentials.clientId,
        secret: credentials.secret,
        user: { client_user_id: userId },
        client_name: 'WealthWise',
        products: ['transactions', 'investments'],
        country_codes: ['US'],
        language: 'en',
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Plaid error:', data)
      const errorMessage = data?.error_message?.includes('client_id')
        ? 'Plaid credentials are misconfigured. Save only the raw PLAID_CLIENT_ID value, not an env assignment like PLAID_CLIENT_ID=...'
        : data.error_message || 'Failed to create link token'
      return new Response(JSON.stringify({ error: errorMessage }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ link_token: data.link_token }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})