import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Public endpoint — no sign-in required. The Game Plan is generated from
    // the onboarding info the user already provided in this session.
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { profile, funnelSummary } = await req.json();
    if (!profile) {
      return new Response(
        JSON.stringify({ error: "profile is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a top-tier personal financial advisor. Given a client profile, produce a JSON array of 8-12 milestone objects organized into FOUR time horizons. Each milestone is a key financial action tied to a specific age or year, plus a short rationale for WHY this action fits its horizon.

Return ONLY a JSON array (no markdown, no explanation) with this shape:
[
  {
    "age": 27,
    "label": "Max out 401(k) match",
    "detail": "$24,500/yr limit — your employer matches 4%, that's free $9,800/yr",
    "rationale": "Near-term: free match is the highest guaranteed ROI you'll ever see — capture it before any other optimization.",
    "icon": "💰",
    "category": "retirement",
    "horizon": "near"
  }
]

Rules:
- "age" = the client's age when they should do this. Start from their current age.
- "label" = 3-8 word action headline
- "detail" = one sentence with specific dollar amounts, account names, or tax savings. Keep under 120 chars.
- "rationale" = one sentence (≤140 chars) explaining WHY this action is the best fit FOR THIS TIME HORIZON. Tie it to compounding, liquidity needs, life stage, tax timing, or risk capacity at that age.
- "icon" = one emoji that fits
- "category" = one of: "retirement", "savings", "investing", "tax", "insurance", "debt", "education", "housing"
- "horizon" = one of: "near" (0–5 yrs from current age), "mid" (5–10 yrs), "long" (10–20 yrs), "legacy" (20+ yrs)

HORIZON COVERAGE — REQUIRED:
You MUST produce AT LEAST ONE milestone in EACH of the four horizons (near, mid, long, legacy). Aim for roughly:
- 3–4 NEAR-term (0–5 yrs): tactical actions for this year and the next few — emergency fund, max match, debt payoff, down payment savings, opening accounts. These should be concrete and immediately actionable.
- 2–3 MID-term (5–10 yrs): goals that benefit from a half-decade runway — buying a first/second home, paying off student loans, hitting a specific net-worth target, switching from accumulation to optimization (e.g. Backdoor Roth setup, mega-backdoor, HSA-as-stealth-IRA), starting a 529.
- 2–3 LONG-term (10–20 yrs): wealth-building plays that require a long runway to compound — coast-FI checkpoints, kids' college fully funded, mortgage payoff decisions, taxable brokerage growth, asset-location optimization, starting to think about insurance laddering and umbrella coverage.
- 1–2 LEGACY (20+ yrs / retirement and beyond): retirement readiness, Roth conversion ladder, estate planning, long-term care insurance window (best 55–65), Social Security claiming strategy, generational wealth transfer, charitable strategies (DAF, QCDs).

Order chronologically by age across the whole list (so the timeline flows naturally), but make sure all four horizons are represented.

WHY THIS HORIZON: For each milestone, the "rationale" must explain why THIS action belongs in THIS horizon — not earlier, not later. Examples:
- Near-term emergency fund: "Liquidity comes before everything else — you can't compound or take risk without a cash floor first."
- Mid-term Backdoor Roth: "By 5–10 yrs your income will likely exceed Roth limits; setting the pipeline up now buys 30+ yrs of tax-free growth."
- Long-term mortgage decision: "10–20 yr horizon is when paying down a 6.8% mortgage starts to rival expected stock returns on a risk-adjusted basis."
- Legacy Roth conversion ladder: "Best executed in low-income years between retirement and RMDs (age 73) — the 'tax window' lasts ~10 yrs."

CRITICAL BUDGET CONSTRAINT:
- The total of ALL contributions, savings, and investments you recommend MUST NOT exceed the client's gross income minus taxes and FICA.
- Before recommending amounts, mentally calculate: Gross Income → subtract federal tax (~22-32% effective) → subtract state tax → subtract FICA (7.65%) → that's the MAXIMUM available for all savings + living expenses combined.
- If maxing 401(k) ($23,500) + HSA ($4,300) + Roth IRA ($7,000) + other savings already exceeds ~40-50% of take-home pay, scale back or phase contributions across years. Don't tell someone earning $75K to save $50K/year.
- Always sanity-check: total annual contributions recommended at any single age should leave enough for rent/food/essentials (at least 50% of take-home).

- CRITICAL: If job state is provided, factor in state income tax rates. For no-income-tax states (TX, FL, WA, NV, WY, SD, AK, NH, TN), note the tax advantage. For high-tax states (CA 13.3%, NY 10.9%, NJ 10.75%), suggest state-specific strategies like 529 deductions, property tax SALT caps, or Roth conversions.
- CRITICAL: For emergency fund calculations, use the client's ACTUAL monthly spending if provided. If not provided, estimate monthly essential expenses as ~50% of gross monthly income (not 100%). A $150K earner spends roughly $5-6K/month on essentials, NOT $10K+.
- If they plan kids, include childcare/education milestones at the right ages
- If they want to buy a home, include a down payment milestone with specific savings target based on the metro's median home price. Factor in mortgage, property tax, insurance, and maintenance when calculating affordability.
- HOUSING SCENARIO: If a target metro is provided, calculate both the renting cost (metro avg rent) and buying cost (mortgage+tax+insurance+maintenance for a 20% down, 30yr fixed at ~6.8%). Compare which is better for their income level and goals. Reference this in milestones — e.g. "At $X/mo rent vs $Y/mo buying, renting + investing the difference wins over Z years" or "Buying builds equity — target $X down payment by age Y."
- Maximum 12 milestones. Quality over quantity.

CRITICAL — ALIGN WITH THE INCOME FUNNEL:
The user sees a "Where Your Income Goes" funnel that already allocates their gross income across taxes, housing, retirement, HSA, Roth, emergency fund, and home down payment with SPECIFIC dollar amounts. Your milestones MUST reference and reinforce these EXACT amounts — do not invent different numbers.
- If the funnel allocates $X to Emergency Fund, your "build emergency fund" milestone should say "save $X/yr (~$X/mo)" using THAT number.
- If the funnel allocates $Y to 401(k), your retirement milestone should reference $Y/yr — not a different figure.
- If the funnel shows $0 for a category (e.g. no home down payment), DO NOT recommend that action as a current milestone.
- The funnel summary will be provided in the user message under "FUNNEL ALLOCATIONS." Treat it as ground truth for current-year amounts.

CRITICAL — USE THE SAME PRODUCTS AND RETURN ASSUMPTIONS AS THE FUNNEL:
The "Where Your Income Goes" funnel recommends specific real-world investment vehicles with explicit return targets. Your milestone "detail" fields MUST use the same products and return assumptions so the user sees one consistent story across the whole dashboard. Use this product/return cheat sheet:

- **Emergency fund / cash (any horizon)**: park in a HYSA (Marcus, Ally, Wealthfront Cash, Flourish) at ~4.5% APY, or VMFXX (~5.0% SEC yield, mostly state-tax-exempt — best for CA/NY/NJ/HI residents).
- **Home down payment, ≤2yr horizon**: 100% safe — HYSA (~4.5%) or T-Bills via TreasuryDirect / VMFXX (~5.0%). Never stocks.
- **Home down payment, 3–4yr horizon**: 70% T-Bills / VMFXX (~5%) + 30% short-duration bonds (BSV, ~4.5%). Blended ~4.7%.
- **Home down payment, 5+yr horizon**: 50% HYSA/T-Bills + 30% BSV + 20% VTI. Blended ~5.5%.
- **Retirement / 401(k) / Roth IRA / Traditional IRA / HSA (long-term, 10+yr)**: 80% VTI (US total market) + 20% VXUS (international). Target ~7% real return / ~10% nominal. State the return assumption explicitly.
- **Taxable brokerage (long-term)**: same 80/20 VTI/VXUS. For high earners (32%+ federal bracket) hold VTEB (muni bond ETF, ~3.5% federal-tax-free) instead of taxable bonds.
- **HSA invested portion**: same VTI/VXUS allocation, ~7% real return — emphasize triple-tax-advantage compounding.
- **529 plans**: age-based target-date portfolio (Vanguard 529 or state plan) — typically ~7% expected return, glides to bonds as the kid nears 18.

When you write a milestone "detail," NAME the product (e.g. "Park in VMFXX (~5% APY, state-tax-free)" or "Invest 80/20 VTI/VXUS — ~7% real return") and STATE the return assumption. Do not say generic things like "save in a high-yield account" or "invest in the stock market."

ADVICE QUALITY RULES (apply to every milestone):
- Ground every recommendation in the profile + funnel data provided. Never invent numbers that contradict the funnel or the user-verified balance sheet.
- Personalize explicitly to THIS user's numbers: reference their actual age, gross income, filing status, job state, target metro, AND specific balance-sheet line items (e.g. "Your $32K credit card balance at ~22% APR is costing you $7K/yr — kill it before any Roth contribution" or "Your $180K retirement balance at age 32 puts you at 1.4× income — on track; now layer in HSA/Backdoor Roth").
- For quantitative milestones, show the key math or ratio inline in "detail" (e.g. "$23.5K ÷ $250K gross = 9.4% deferral" or "$1.2M target ÷ 25 = $48K/yr withdrawal at 4% rule" or "$120K student loans ÷ $180K income = 0.67× — refi to <5% if possible").
- BALANCE-SHEET-AWARE SEQUENCING (mandatory order of operations when these conditions exist):
    1. High-APR debt (credit cards, >8% personal loans) → pay off FIRST in near-term, before any non-matched investing.
    2. Emergency fund <3 months essentials → build to 3-6 months in HYSA/VMFXX in near-term.
    3. 401(k) up to employer match → always near-term (free money).
    4. Then HSA → Backdoor Roth → max 401(k) → taxable brokerage, in that order, scaled to discretionary capacity.
    5. If user already has strong assets in one bucket, REBALANCE the recommendation toward gaps (e.g. lots of 401(k) but no taxable → push taxable; lots of cash but no investments → push deployment).
- Flag 1–2 behavioral pitfalls common to this user's situation (e.g. for high earners: lifestyle creep, over-concentration in employer RSUs, neglecting estate planning; for early-career: under-saving, paying off low-rate debt before investing; for those with home equity: HELOC misuse, refi timing). Surface these as their own milestone(s) and label clearly as a pitfall to avoid.
- End with — or include — at least one milestone at the user's CURRENT age that is a concrete next action they can take this week (e.g. "Open Fidelity Roth IRA today and fund $583/mo auto-transfer").
- If a milestone genuinely requires a licensed professional (estate planning, complex trusts, tax shelters, business-entity structuring, concentrated-stock unwinding, insurance underwriting), say so explicitly in the detail (e.g. "Work with a CFP/estate attorney — DIY is not appropriate here because…") and explain WHY in plain language.
- Eligibility-aware: if the user is over Roth IRA / IRS Free File / Saver's Credit thresholds, do NOT recommend those products — recommend the correct alternative (Backdoor Roth, Mega Backdoor Roth, paid tax software, etc.) and briefly note why the standard option is unavailable at their income.`;

    const profileSummary = buildProfileSummary(profile, funnelSummary);

    const tool = {
      type: "function",
      function: {
        name: "emit_milestones",
        description: "Emit the financial timeline milestones",
        parameters: {
          type: "object",
          properties: {
            milestones: {
              type: "array",
              minItems: 8,
              maxItems: 12,
              items: {
                type: "object",
                properties: {
                  age: { type: "number" },
                  label: { type: "string" },
                  detail: { type: "string" },
                  rationale: { type: "string" },
                  icon: { type: "string" },
                  category: {
                    type: "string",
                    enum: ["retirement", "savings", "investing", "tax", "insurance", "debt", "education", "housing"],
                  },
                  horizon: {
                    type: "string",
                    enum: ["near", "mid", "long", "legacy"],
                  },
                },
                required: ["age", "label", "detail", "rationale", "icon", "category", "horizon"],
                additionalProperties: false,
              },
            },
          },
          required: ["milestones"],
          additionalProperties: false,
        },
      },
    };

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: profileSummary },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "emit_milestones" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error(`AI processing failed [${aiResponse.status}]`);
    }

    const aiData = await aiResponse.json();
    const message = aiData.choices?.[0]?.message;
    const toolCall = message?.tool_calls?.[0];
    const argsRaw = toolCall?.function?.arguments;

    let milestones;
    try {
      if (argsRaw) {
        const parsed = typeof argsRaw === "string" ? JSON.parse(argsRaw) : argsRaw;
        milestones = parsed.milestones;
      } else {
        // fallback: parse content
        milestones = extractJsonArray(message?.content || "");
      }
      if (!Array.isArray(milestones) || milestones.length === 0) {
        throw new Error("Empty milestones");
      }
    } catch (parseErr) {
      console.error("Failed to parse AI response:", JSON.stringify(aiData).slice(0, 2000));
      return new Response(
        JSON.stringify({ error: "Failed to parse plan" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ milestones }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("generate-financial-plan error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function extractJsonArray(raw: string): unknown {
  // Strip markdown code fences
  let s = raw.replace(/```json\s*/gi, "").replace(/```/g, "").trim();

  // Find array bounds
  const start = s.indexOf("[");
  const end = s.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON array found");
  }
  s = s.substring(start, end + 1);

  try {
    return JSON.parse(s);
  } catch {
    // Fix common issues: unescaped newlines/tabs inside string values, trailing commas
    const fixed = s
      .replace(/,\s*([\]}])/g, "$1")
      .replace(/"((?:[^"\\]|\\.)*)"/gs, (_m, inner) => {
        const cleaned = inner
          .replace(/\r/g, "")
          .replace(/\n/g, " ")
          .replace(/\t/g, " ")
          .replace(/\s+/g, " ");
        return `"${cleaned}"`;
      });
    return JSON.parse(fixed);
  }
}

function buildProfileSummary(profile: any, funnelSummary?: any): string {
  const parts: string[] = [];

  parts.push(`Client profile:`);
  parts.push(`- Age: ${profile.age}`);
  parts.push(`- Career: ${profile.career}`);

  if (profile.expectedIncome3yr) {
    parts.push(`- Expected annual income (next 3 years): $${Number(profile.expectedIncome3yr).toLocaleString()}`);
  }
  if (profile.averageHistoricalIncome) {
    parts.push(`- Average historical income (from W-2s): $${Number(profile.averageHistoricalIncome).toLocaleString()}`);
  }
  if (profile.income) {
    parts.push(`- Income range: ${profile.income}`);
  }
  if (profile.filingStatus) {
    parts.push(`- Filing status: ${profile.filingStatus}`);
  }
  if (profile.filingStatus === "married" && profile.spouse) {
    const sp = profile.spouse;
    parts.push(`- Spouse income: $${Number(sp.income ?? 0).toLocaleString()}/yr${sp.career ? ` (career: ${sp.career})` : ""}`);
    parts.push(`  - CRITICAL: This is a MARRIED HOUSEHOLD filing jointly. Frame ALL milestones in HOUSEHOLD terms ("you and your spouse", "your household"), NOT individually.`);
    parts.push(`  - Each spouse can max their own 401(k) ($23K each = $46K combined) and IRA ($7K each = $14K combined).`);
    parts.push(`  - HSA family limit is $8,300 (vs $4,150 self-only).`);
    parts.push(`  - Tax brackets are MFJ — wider than single. Factor combined income into bracket placement.`);
    if ((sp.income ?? 0) === 0) {
      parts.push(`  - Spouse has $0 income → recommend a Spousal IRA so the working spouse funds an IRA for the non-working spouse.`);
    }
  }
  if (profile.jobState) {
    parts.push(`- Job location (state): ${profile.jobState}`);
    parts.push(`  - IMPORTANT: Factor in this state's income tax rate, any state-specific deductions, and compare to no-income-tax states. Mention specific state tax implications in relevant milestones.`);
  }

  if (profile.goals && profile.goals.length > 0) {
    parts.push(`- Financial goals (in priority order):`);
    profile.goals.forEach((g: string, i: number) => {
      parts.push(`  ${i + 1}. ${g}`);
    });
  }

  if (profile.kidsPlanning) {
    parts.push(`- Kids planning: wants kids = ${profile.kidsPlanning.wantsKids}`);
    if (profile.kidsPlanning.plannedAge) {
      parts.push(`  - Planned age for first child: ${profile.kidsPlanning.plannedAge}`);
    }
    if (profile.kidsPlanning.numberOfKids) {
      parts.push(`  - Number of kids planned: ${profile.kidsPlanning.numberOfKids}`);
    }
  }

  if (profile.targetMetroId) {
    parts.push(`- Target metro area: ${profile.targetMetroId}`);
    parts.push(`  - IMPORTANT: Factor in this metro's median home price, average rent, property tax rate, and appreciation rate when advising on housing. Compare monthly rent vs monthly ownership cost (mortgage + property tax + insurance + maintenance) and recommend the smarter path for their income and timeline.`);
  }

  if (profile.w2Data) {
    const w = profile.w2Data;
    if (w.employer) parts.push(`- Current/recent employer: ${w.employer}`);
    if (w.state) parts.push(`- State: ${w.state}`);
    if (w.grossIncome) parts.push(`- Most recent W-2 gross income: $${Number(w.grossIncome).toLocaleString()}`);
    if (w.federalTaxWithheld) parts.push(`- Federal tax withheld: $${Number(w.federalTaxWithheld).toLocaleString()}`);
  }

  // Manual net-worth entries (user-verified — these override Plaid on conflict)
  if (profile.manualNetWorth) {
    const m = profile.manualNetWorth;
    const assetEntries: [string, number | undefined][] = [
      ["Liquid savings (checking/MM)", m.liquidSavings],
      ["Retirement (401k/IRA)", m.retirementAccounts],
      ["HSA balance", m.hsa],
      ["Brokerage / taxable", m.brokerageInvestments],
      ["Home equity", m.homeEquity],
      ["Private equity / VC / angel", m.privateInvestments],
      ["Other assets", m.otherAssets],
    ];
    const liabEntries: [string, number | undefined][] = [
      ["Student loans", m.studentLoans],
      ["Car / auto loans", m.carLoans],
      ["Credit card debt (revolving)", m.creditCardDebt],
      ["Mortgage balance", m.mortgageBalance],
      ["Personal guarantee on business debt", m.businessGuarantee],
      ["Other liabilities", m.otherLiabilities],
    ];
    const totalAssets = assetEntries.reduce((s, [, v]) => s + (v || 0), 0);
    const totalLiab = liabEntries.reduce((s, [, v]) => s + (v || 0), 0);
    if (totalAssets > 0 || totalLiab > 0) {
      parts.push(`- USER-VERIFIED BALANCE SHEET (manual entries — these are ground truth, override any conflicting Plaid number):`);
      parts.push(`  Assets:`);
      for (const [k, v] of assetEntries) if (v && v > 0) parts.push(`    • ${k}: $${Number(v).toLocaleString()}`);
      parts.push(`  Liabilities:`);
      for (const [k, v] of liabEntries) if (v && v > 0) parts.push(`    • ${k}: $${Number(v).toLocaleString()}`);
      parts.push(`  → Total assets: $${totalAssets.toLocaleString()} | Total liabilities: $${totalLiab.toLocaleString()} | Net worth: $${(totalAssets - totalLiab).toLocaleString()}`);
      parts.push(`  CRITICAL: Tailor every milestone to this balance sheet.`);
      parts.push(`    - If credit card debt > 0, the FIRST near-term milestone MUST be paying it off (15-25% APR beats any investment return).`);
      parts.push(`    - If liquid savings < 3 months of essential spending, near-term milestone is building emergency fund — use HYSA/VMFXX.`);
      parts.push(`    - If retirement balance is low for their age (<1× income by 30, <3× by 40, <6× by 50), front-load contributions in near/mid horizon.`);
      parts.push(`    - If retirement balance is already strong (>3× income), shift mid/long horizon toward tax diversification (Roth conversions, taxable brokerage, HSA-as-stealth-IRA).`);
      parts.push(`    - If home equity > 0, do NOT recommend "save for down payment" — instead: refi/recast decisions, HELOC strategy, or 2nd-home/investment property.`);
      parts.push(`    - If student loans > 0, address payoff strategy (SAVE plan, PSLF eligibility, refi if rate >6%) in near or mid horizon.`);
      parts.push(`    - If private investments > 0, flag concentration risk and illiquidity in a pitfall milestone.`);
      parts.push(`    - If business guarantee > 0, recommend umbrella insurance and entity-shielding review with attorney.`);
    }
  }

  if (profile.accountData) {
    const a = profile.accountData;
    parts.push(`- Consolidated account totals (manual + Plaid merged, manual wins on conflict):`);
    if (a.totalBalance) parts.push(`  - Total cash/checking balance: $${Number(a.totalBalance).toLocaleString()}`);
    if (a.totalInvestments) parts.push(`  - Total investments: $${Number(a.totalInvestments).toLocaleString()}`);
    if (a.totalDebt) parts.push(`  - Total debt: $${Number(a.totalDebt).toLocaleString()}`);
    if (a.topSpendingCategories && a.topSpendingCategories.length > 0) {
      const monthlySpend = a.topSpendingCategories.reduce((s: number, c: any) => s + (c.amount || 0), 0);
      parts.push(`  - Actual monthly spending (from Plaid transactions): $${Math.round(monthlySpend).toLocaleString()}`);
      parts.push(`  - USE THIS for emergency fund calc: 3 months = $${Math.round(monthlySpend * 3).toLocaleString()}, 6 months = $${Math.round(monthlySpend * 6).toLocaleString()}`);
      const top3 = a.topSpendingCategories.slice(0, 3).map((c: any) => `${c.category} $${Math.round(c.amount).toLocaleString()}/mo`).join(", ");
      parts.push(`  - Top spending categories: ${top3} — flag any that look excessive given income.`);
    }
  }

  if (funnelSummary && Array.isArray(funnelSummary.buckets)) {
    parts.push(``);
    parts.push(`FUNNEL ALLOCATIONS (ground truth — milestone amounts MUST match these):`);
    parts.push(`- Gross income: $${Number(funnelSummary.gross).toLocaleString()}/yr`);
    for (const b of funnelSummary.buckets) {
      parts.push(`- ${b.label}: $${Number(b.annual).toLocaleString()}/yr ($${Number(b.monthly).toLocaleString()}/mo)`);
    }
    parts.push(`- Discretionary (take-home after all allocations): $${Number(funnelSummary.takeHomeAnnual).toLocaleString()}/yr ($${Number(funnelSummary.takeHomeMonthly).toLocaleString()}/mo)`);
    parts.push(`Use these numbers verbatim in your milestone "detail" fields. Do not invent different dollar amounts for these categories.`);
  }

  return parts.join("\n");
}
