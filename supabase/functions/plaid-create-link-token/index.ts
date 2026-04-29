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

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json().catch(() => ({}))
    const deviceId = typeof body?.device_id === 'string' && body.device_id.length >= 8 ? body.device_id : null
    if (!deviceId) {
      return jsonResponse({ error: 'device_id is required' }, 400)
    }

    const credentials = getPlaidCredentials()
    if (!credentials) {
      return jsonResponse({ error: 'Plaid credentials are misconfigured' }, 500)
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
      return jsonResponse({
        error: data.error_message || data.error_code || 'Failed to create link token',
        details: {
          plaid_error_type: data.error_type,
          plaid_error_code: data.error_code,
          plaid_display_message: data.display_message,
          plaid_request_id: data.request_id,
        },
      }, 400)
    }

    return jsonResponse({ link_token: data.link_token })
  } catch (error) {
    console.error('Error:', error)
    return jsonResponse({ error: error instanceof Error ? error.message : 'Internal server error' }, 500)
  }
})
