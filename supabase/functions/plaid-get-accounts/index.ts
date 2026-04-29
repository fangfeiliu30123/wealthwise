const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4"

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

    // Fetch connected accounts with their balances, holdings, and transactions
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
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Query error:', error)
      return new Response(JSON.stringify({ error: 'Failed to fetch accounts' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Compute summary stats. Goal: every connected account is assigned to
    // exactly ONE bucket so that
    //   totalCash + totalInvestments + totalDebt === sum(all account balances)
    //
    // Bucket rules:
    //   - Investments: type=investment (any subtype: 401k, IRA, brokerage, …)
    //                  + HSA accounts (Plaid sometimes returns HSA as type=depository)
    //   - Debt:        type=credit or type=loan (stored as positive owed amount)
    //   - Cash:        everything else — all depository (checking, savings, CD,
    //                  money market, cash management, prepaid, paypal, …) plus
    //                  any uncategorized account types so nothing is dropped.
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
          // depository (non-HSA), cash, brokerage-misc, "other" — bucket as cash
          totalCash += balance
        }

        for (const h of bal.account_holdings || []) {
          allHoldings.push(h)
        }
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
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
