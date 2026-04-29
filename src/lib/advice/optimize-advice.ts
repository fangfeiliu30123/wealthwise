import { UserProfile, AdviceCard } from "../types";

/**
 * "Optimize" phase advice (timelineYear = 3).
 * Focused on wealth preservation, advanced tax strategies, alternative investments,
 * private wealth management, and multi-generational wealth transfer.
 *
 * These cards educate users on what to do once they've built a meaningful asset base
 * (typically $500K+ net worth or $250K+ household income).
 */
export function generateOptimizeAdvice(profile: UserProfile): AdviceCard[] {
  const advice: AdviceCard[] = [];
  const income =
    profile.expectedIncome3yr ||
    profile.averageHistoricalIncome ||
    profile.w2Data?.grossIncome ||
    0;
  const age = profile.age;
  const isHighEarner = income >= 250000;
  const isUHNW = income >= 500000;

  // ──── ADVANCED TAX STRATEGIES ────
  advice.push({
    id: "optimize-tax-loss-harvesting",
    title: "Tax-Loss Harvesting & Direct Indexing",
    description:
      "Once your taxable brokerage account exceeds ~$100K, tax-loss harvesting can save 1–2% per year in taxes by selling losers to offset gains (and up to $3,000 of ordinary income). Direct indexing services (Wealthfront, Frec, Parametric, Aperio) hold the individual stocks of an index instead of the ETF — letting them harvest losses at the stock level, which generates 2–4x more tax alpha than ETF-based harvesting. Worth it once your taxable account is $250K+.",
    actionSteps: [
      "Avoid the wash-sale rule: don't repurchase a 'substantially identical' security within 30 days",
      "Use Wealthfront or Frec for direct indexing on accounts $100K+ (Frec charges 0.10%, Wealthfront 0.25%)",
      "Harvest losses in December AND throughout the year — not just at year-end",
      "Keep a log of cost basis lots; use 'specific identification' (not FIFO) when selling",
      "Carry forward unused losses indefinitely — they offset future gains for life",
    ],
    category: "tax",
    priority: "medium",
    icon: "📉",
    timelineYear: 3,
  });

  // ──── ALTERNATIVE INVESTMENTS ────
  if (isHighEarner) {
    advice.push({
      id: "optimize-alternatives",
      title: "Alternative Investments: Private Equity, Real Estate, Private Credit",
      description:
        "Once you have $500K+ in liquid assets, allocating 10–25% to alternatives can boost risk-adjusted returns and reduce correlation to public markets. Most require accredited investor status ($200K income or $1M net worth excluding primary home). Top platforms: Moonfare and CAIS for private equity (typical $50K minimum, 10-year lockup, target 15%+ IRR), Fundrise and CrowdStreet for private real estate (lower minimums, 8–12% target returns), Yieldstreet and Percent for private credit (8–12% yields). Watch fees carefully — 2-and-20 structures eat returns.",
      actionSteps: [
        "Verify accredited status before investing (most platforms self-certify)",
        "Cap alternatives at 20–25% of investable assets — they're illiquid",
        "Diversify across vintages and managers — don't put it all in one fund-of-funds",
        "Read the PPM (Private Placement Memorandum) — focus on fees, lockup, and clawback terms",
        "Consider interval funds (e.g., Cliffwater CCLFX for private credit) for quarterly liquidity",
        "Be skeptical of any pitch promising 20%+ guaranteed — those returns don't exist without risk",
      ],
      category: "investing",
      priority: "medium",
      icon: "🏛️",
      timelineYear: 3,
    });
  }

  // ──── PRIVATE WEALTH MANAGEMENT ────
  if (isUHNW || (income >= 300000 && age >= 40)) {
    advice.push({
      id: "optimize-private-wealth",
      title: "When to Hire a Private Wealth Manager (vs. DIY)",
      description:
        "Below ~$2M investable assets, a fee-only fiduciary CFP at 0.5–1% AUM (or flat fee $5–15K/yr) is usually plenty. Above $5M, full-service private wealth — Goldman Sachs PWM, JPMorgan Private Bank, Bessemer Trust, Northern Trust, Fidelity Wealth, Vanguard PAS — earns its keep through tax planning, estate structuring, and access to institutional-share investments. AVOID: anyone selling commission-based annuities or whole life as 'investments,' wirehouses charging 1.5%+ AUM, and anyone who can't articulate their fiduciary duty in writing.",
      actionSteps: [
        "Find fee-only fiduciaries at NAPFA.org or XYPlanningNetwork.com — never commission-based",
        "Ask: 'Are you a fiduciary 100% of the time, in writing?' If they hesitate, walk away",
        "Compare costs: $5M × 1% AUM = $50K/yr. Make sure they're delivering $50K+ of value",
        "Demand a written Investment Policy Statement (IPS) before signing",
        "Verify credentials on BrokerCheck.finra.org and SEC.gov/IAPD — check disclosures",
        "Consider Vanguard PAS (0.30% AUM) or Fidelity Wealth (0.50–1.04%) as low-cost alternatives",
      ],
      category: "investing",
      priority: "medium",
      icon: "🤝",
      timelineYear: 3,
    });
  }

  // ──── ESTATE PLANNING & WEALTH TRANSFER ────
  advice.push({
    id: "optimize-estate-planning",
    title: "Estate Planning: Trusts, Gifting & The $13.61M Exemption",
    description:
      "The 2024 federal estate tax exemption is $13.61M per person ($27.22M per couple) — but it's scheduled to drop to ~$7M in 2026 unless Congress acts. If you're approaching $5M+ net worth, start planning NOW to lock in the higher exemption. Key tools: revocable living trust (avoids probate, manages incapacity), irrevocable trusts (SLATs, ILITs, GRATs) for moving assets out of your estate, annual gifting ($18K/person/year tax-free in 2024), and 529 superfunding ($90K per kid in one shot). State estate taxes kick in much lower in WA, OR, MA, NY, MN, IL — plan around your state.",
    actionSteps: [
      "Everyone needs: will, durable power of attorney, healthcare proxy, HIPAA release, beneficiary designations",
      "Net worth $2M+: add a revocable living trust to avoid probate (~3–7% of estate cost)",
      "Net worth $5M+: hire a T&E (trusts & estates) attorney — flat fee $5–25K typical",
      "Use annual gifting NOW: $18K × kids × spouses = serious wealth transfer over decades",
      "Superfund 529s for grandkids: $90K per beneficiary in one year, treated as 5-yr gift",
      "Review beneficiaries every 3 years — beneficiary designations override your will",
      "Consider domicile planning if you're in a high-estate-tax state (move pre-retirement)",
    ],
    category: "tax",
    priority: "medium",
    icon: "📜",
    timelineYear: 3,
  });

  // ──── CHARITABLE & ASSET LOCATION ────
  if (isHighEarner) {
    advice.push({
      id: "optimize-daf-charitable",
      title: "Donor-Advised Funds & Appreciated-Stock Giving",
      description:
        "If you donate $5K+/year to charity, a Donor-Advised Fund (DAF) at Fidelity Charitable, Schwab Charitable, or Vanguard Charitable lets you donate appreciated stock — getting a deduction at FAIR MARKET VALUE while skipping capital gains tax. 'Bunch' multiple years of giving into one tax year to clear the standard deduction ($29,200 MFJ). Combine with a high-income year (RSU vest, business sale, bonus) for max impact. A $50K stock donation with $40K gains saves you ~$25K in taxes vs. selling and donating cash.",
      actionSteps: [
        "Open a DAF — Fidelity Charitable has $0 minimum, Schwab is similar",
        "Donate the most-appreciated long-term holdings (held 12+ months)",
        "Bunch 3–5 years of giving into one tax year to exceed the standard deduction",
        "Time donations to high-income years (RSU vest, bonus, business exit)",
        "Grant out from the DAF over time at your own pace — no rush",
        "QCDs (Qualified Charitable Distributions) from IRA: at 70½+, donate up to $105K/yr direct from IRA",
      ],
      category: "tax",
      priority: "low",
      icon: "🎁",
      timelineYear: 3,
    });
  }

  // ──── ASSET LOCATION ────
  advice.push({
    id: "optimize-asset-location",
    title: "Asset Location: Right Investments in the Right Accounts",
    description:
      "WHERE you hold investments matters as much as WHAT you hold. Tax-inefficient assets (bonds, REITs, actively managed funds, high-turnover ETFs) belong in tax-deferred accounts (401k, traditional IRA). Tax-efficient assets (broad index ETFs like VTI/VXUS, individual stocks held long-term, municipal bonds) belong in taxable brokerage. Highest-growth assets (small-cap, emerging markets, crypto) belong in Roth — tax-free growth is most valuable on the biggest winners. Done right, this saves 0.5–1% per year over decades.",
    actionSteps: [
      "Taxable brokerage: VTI, VXUS, individual stocks, municipal bonds (if high tax bracket)",
      "Traditional 401(k)/IRA: bond funds (BND, BNDX), REITs (VNQ), actively managed funds",
      "Roth IRA/401(k): highest-growth assets (small-cap, emerging markets, individual high-conviction stocks)",
      "HSA: invest the balance in equities — it's the most tax-advantaged account in the U.S.",
      "Rebalance ACROSS accounts, not within each — minimizes taxable transactions",
    ],
    category: "investing",
    priority: "medium",
    icon: "🎯",
    timelineYear: 3,
  });

  // ──── UMBRELLA INSURANCE & ASSET PROTECTION ────
  if (income >= 200000) {
    advice.push({
      id: "optimize-umbrella-insurance",
      title: "Umbrella Liability & Asset Protection",
      description:
        "Once you've accumulated wealth, you become a litigation target. A $1–5M personal umbrella policy costs only $200–500/year and sits on top of your auto and homeowners liability — protecting against lawsuits that exceed those limits. Buy coverage equal to your net worth. Beyond insurance: max out 401(k)/IRA contributions (creditor-protected in most states), title rental properties in LLCs, consider Tenancy by the Entirety (married couples in 25 states) for asset protection on jointly held assets.",
      actionSteps: [
        "Buy umbrella coverage ≥ your net worth — quote with your existing auto/home insurer first",
        "Increase auto liability to 250/500/100 minimums (umbrella requires this)",
        "Hold rental properties in single-member LLCs — separate one per property if possible",
        "Max retirement accounts (ERISA-protected from creditors federally)",
        "Avoid joint accounts/credit with adult children — their lawsuits can reach your assets",
      ],
      category: "insurance",
      priority: "medium",
      icon: "🛡️",
      timelineYear: 3,
    });
  }

  return advice;
}
