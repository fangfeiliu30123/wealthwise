import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4"

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
    const publicToken = body?.public_token
    const deviceId = typeof body?.device_id === 'string' && body.device_id.length >= 8 ? body.device_id : null

    if (!deviceId) {
      return new Response(JSON.stringify({ error: 'device_id is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    if (!publicToken || typeof publicToken !== 'string') {
      return new Response(JSON.stringify({ error: 'public_token is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const credentials = getPlaidCredentials()
    if (!credentials) {
      return new Response(JSON.stringify({ error: 'Plaid credentials are misconfigured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const exchangeRes = await fetch(`${PLAID_BASE_URL}/item/public_token/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: credentials.clientId, secret: credentials.secret, public_token: publicToken }),
    })
    const exchangeData = await exchangeRes.json()
    if (!exchangeRes.ok) {
      return new Response(JSON.stringify({ error: exchangeData.error_message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { access_token, item_id } = exchangeData

    const itemRes = await fetch(`${PLAID_BASE_URL}/item/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: credentials.clientId, secret: credentials.secret, access_token }),
    })
    const itemData = await itemRes.json()

    let institutionName = 'Unknown Institution'
    let institutionId = ''
    if (itemData.item?.institution_id) {
      institutionId = itemData.item.institution_id
      const instRes = await fetch(`${PLAID_BASE_URL}/institutions/get_by_id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: credentials.clientId, secret: credentials.secret, institution_id: institutionId, country_codes: ['US'] }),
      })
      const instData = await instRes.json()
      institutionName = instData.institution?.name || institutionName
    }

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: connAccount, error: insertError } = await serviceClient
      .from('connected_accounts')
      .insert({
        device_id: deviceId,
        user_id: null,
        plaid_item_id: item_id,
        plaid_access_token: access_token,
        institution_name: institutionName,
        institution_id: institutionId,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return new Response(JSON.stringify({ error: 'Failed to save account' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const accountsRes = await fetch(`${PLAID_BASE_URL}/accounts/balance/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: credentials.clientId, secret: credentials.secret, access_token }),
    })
    const accountsData = await accountsRes.json()

    if (accountsData.accounts) {
      for (const acct of accountsData.accounts) {
        const { data: balanceRow } = await serviceClient
          .from('account_balances')
          .insert({
            connected_account_id: connAccount.id,
            plaid_account_id: acct.account_id,
            name: acct.name || acct.official_name || 'Account',
            type: acct.type,
            subtype: acct.subtype,
            current_balance: acct.balances?.current,
            available_balance: acct.balances?.available,
            currency: acct.balances?.iso_currency_code || 'USD',
          })
          .select()
          .single()

        if (acct.type === 'investment' && balanceRow) {
          try {
            const holdingsRes = await fetch(`${PLAID_BASE_URL}/investments/holdings/get`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ client_id: credentials.clientId, secret: credentials.secret, access_token }),
            })
            const holdingsData = await holdingsRes.json()

            if (holdingsData.holdings) {
              const securities = (holdingsData.securities || []) as Array<{
                security_id: string; name?: string | null; ticker_symbol?: string | null; type?: string | null
              }>
              const secMap = new Map(securities.map((s) => [s.security_id, s]))

              for (const h of holdingsData.holdings) {
                if (h.account_id !== acct.account_id) continue
                const sec = secMap.get(h.security_id)
                await serviceClient.from('account_holdings').insert({
                  account_balance_id: balanceRow.id,
                  security_name: sec?.name || 'Unknown',
                  ticker: sec?.ticker_symbol || null,
                  quantity: h.quantity,
                  current_price: h.institution_price,
                  value: h.institution_value,
                  type: sec?.type || 'unknown',
                })
              }
            }
          } catch (e) {
            console.error('Holdings fetch error:', e)
          }
        }

        if (balanceRow) {
          try {
            const now = new Date()
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            const txRes = await fetch(`${PLAID_BASE_URL}/transactions/get`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                client_id: credentials.clientId,
                secret: credentials.secret,
                access_token,
                start_date: thirtyDaysAgo.toISOString().split('T')[0],
                end_date: now.toISOString().split('T')[0],
                options: { account_ids: [acct.account_id], count: 100 },
              }),
            })
            const txData = await txRes.json()

            if (txData.transactions) {
              for (const tx of txData.transactions) {
                await serviceClient.from('account_transactions').insert({
                  account_balance_id: balanceRow.id,
                  plaid_transaction_id: tx.transaction_id,
                  name: tx.name,
                  amount: tx.amount,
                  category: tx.category?.[0] || null,
                  date: tx.date,
                  merchant_name: tx.merchant_name,
                })
              }
            }
          } catch (e) {
            console.error('Transactions fetch error:', e)
          }
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      institution: institutionName,
      account_id: connAccount.id,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
