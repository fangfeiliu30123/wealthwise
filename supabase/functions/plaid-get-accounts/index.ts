import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json().catch(() => ({}))
    const deviceId = typeof body?.device_id === 'string' && body.device_id.length >= 8 ? body.device_id : null
    if (!deviceId) {
      return new Response(JSON.stringify({ error: 'device_id is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: accounts, error } = await supabase
      .from('connected_accounts')
      .select(`
        id, institution_name, institution_id, status, created_at,
        account_balances (
          id, name, type, subtype, current_balance, available_balance, currency,
          account_holdings (id, security_name, ticker, quantity, current_price, value, type),
          account_transactions (id, name, amount, category, date, merchant_name)
        )
      `)
      .eq('device_id', deviceId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Query error:', error)
      return new Response(JSON.stringify({ error: 'Failed to fetch accounts' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    let totalCash = 0
    let totalInvestments = 0
    let totalDebt = 0
    const allHoldings: any[] = []
    const allTransactions: any[] = []
    const spendingByCategory: Record<string, number> = {}
    const debtAccounts: any[] = []
    const flatAccounts: any[] = []

    for (const acct of accounts || []) {
      for (const bal of acct.account_balances || []) {
        const subtype = (bal.subtype || '').toLowerCase()
        const balance = bal.current_balance || 0

        flatAccounts.push({
          name: bal.name,
          type: bal.type,
          subtype: bal.subtype,
          current_balance: balance,
          institutionName: acct.institution_name,
        })

        if (['credit', 'loan'].includes(bal.type)) {
          const absBalance = Math.abs(balance)
          totalDebt += absBalance
          debtAccounts.push({
            name: bal.name,
            type: bal.type,
            subtype: bal.subtype,
            balance: absBalance,
            institutionName: acct.institution_name,
          })
        } else if (bal.type === 'investment' || subtype === 'hsa') {
          totalInvestments += balance
        } else {
          totalCash += balance
        }

        for (const h of bal.account_holdings || []) allHoldings.push(h)
        for (const tx of bal.account_transactions || []) {
          allTransactions.push(tx)
          if (tx.amount > 0 && tx.category) {
            spendingByCategory[tx.category] = (spendingByCategory[tx.category] || 0) + tx.amount
          }
        }
      }
    }

    return new Response(JSON.stringify({
      accounts,
      summary: {
        totalCash,
        totalBalance: totalCash + totalInvestments,
        totalInvestments,
        totalDebt,
        debtAccounts,
        accounts: flatAccounts,
        holdingsCount: allHoldings.length,
        transactionCount: allTransactions.length,
        topSpendingCategories: Object.entries(spendingByCategory)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([category, amount]) => ({ category, amount: Math.round(amount) })),
        holdings: allHoldings,
      },
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
