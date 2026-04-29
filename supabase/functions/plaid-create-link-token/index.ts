const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
}

const PLAID_BASE_URL = "https://sandbox.plaid.com"

const normalizeSecret = (value?: string | null) => {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return ''
  const lastNonEmptyLine = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).at(-1) ?? ''
  const withoutOuterQuotes = lastNonEmptyLine.replace(/^['"]|['"]$/g, '')
  const assignmentMatch = withoutOuterQuotes.match(/^(?:export\s+)?[A-Z0-9_]+=([\s\S]+)$/)
  return (assignmentMatch?.[1] ?? withoutOuterQuotes).trim().replace(/^['"]|['"]$/g, '')
}

const getPlaidCredentials = () => {
  const clientId = normalizeSecret(Deno.env.get('PLAID_CLIENT_ID'))
  const secret = normalizeSecret(Deno.env.get('PLAID_SECRET'))
  if (!clientId || !secret || /\s/.test(clientId) || /\s/.test(secret)) return null
  return { clientId, secret }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json().catch(() => ({}))
    const deviceId = typeof body?.device_id === 'string' && body.device_id.length >= 8 ? body.device_id : null
    if (!deviceId) {
      return new Response(JSON.stringify({ error: 'device_id is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

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
        user: { client_user_id: deviceId },
        client_name: 'WealthWise',
        products: ['transactions', 'investments'],
        country_codes: ['US'],
        language: 'en',
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('Plaid error:', data)
      return new Response(JSON.stringify({ error: data.error_message || 'Failed to create link token' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ link_token: data.link_token }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
