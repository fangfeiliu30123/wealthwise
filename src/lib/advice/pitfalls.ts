import { UserProfile } from "../types";

export interface Pitfall {
  id: string;
  icon: string;
  title: string;
  description: string;
  /** Why this profile in particular is at risk */
  whyYou: string;
  /** Concrete fix / what to do instead */
  fix: string;
  severity: "high" | "medium" | "low";
}

function deriveIncome(p: UserProfile): number {
  if (p.expectedIncome3yr) return p.expectedIncome3yr;
  if (p.averageHistoricalIncome) return p.averageHistoricalIncome;
  if (p.w2Data?.grossIncome) return p.w2Data.grossIncome;
  const map: Record<string, number> = {
    "Under $30,000": 25000, "$30,000 - $50,000": 40000, "$50,000 - $75,000": 62500,
    "$75,000 - $100,000": 87500, "$100,000 - $150,000": 125000,
    "$150,000 - $250,000": 200000, "$250,000+": 300000,
  };
  return p.income ? map[p.income] || 75000 : 0;
}

export function generatePitfalls(profile: UserProfile): Pitfall[] {
  const out: Pitfall[] = [];
  const income = deriveIncome(profile);
  const householdIncome = income + (profile.spouse?.income || 0);
  const age = profile.age;
  const goals = new Set(profile.goals);
  const isMarried = profile.filingStatus === "married";
  const debtTotal = profile.accountData?.totalDebt || 0;
  const cash = profile.accountData?.totalBalance || 0;
  const investments = profile.accountData?.totalInvestments || 0;
  const hasCC = (profile.accountData?.debtAccounts || []).some(
    (d) => d.type === "credit" || (d.subtype || "").toLowerCase().includes("credit")
  );

  // === Universal high-impact pitfalls ===

  // 1. Lifestyle creep — relevant to high earners and growing incomes
  if (householdIncome >= 100000) {
    out.push({
      id: "lifestyle-creep",
      icon: "📈",
      title: "Lifestyle creep eating raises before you save them",
      description:
        "When income rises, spending tends to silently rise with it — bigger apartment, nicer car, more dining out — leaving the savings rate flat.",
      whyYou: `At ~$${Math.round(householdIncome / 1000)}k household income, every 5% raise is $${Math.round(householdIncome * 0.05).toLocaleString()}/yr. If it disappears into lifestyle, you stay just as far from financial independence.`,
      fix: "Automate it away: every raise, immediately bump 401(k) deferral by half the raise % BEFORE the new paycheck hits checking. You never see the money, you never miss it.",
      severity: "high",
    });
  }

  // 2. Emergency fund / cash drag
  if (cash > 0 && householdIncome > 0) {
    const monthsCash = cash / (householdIncome / 12);
    if (monthsCash > 12 && investments < cash) {
      out.push({
        id: "cash-drag",
        icon: "💸",
        title: "Hoarding cash beyond 6 months is a hidden tax",
        description:
          "Holding 12+ months of expenses in checking/savings feels safe but loses ~3% per year to inflation. Over a decade, that's a 26% real-dollar haircut.",
        whyYou: `You have ~${monthsCash.toFixed(1)} months of expenses in cash but only $${investments.toLocaleString()} invested. Roughly $${Math.max(0, Math.round(cash - (householdIncome / 2))).toLocaleString()} is sitting idle.`,
        fix: "Keep 3–6 months in a HYSA (Marcus, Ally, Wealthfront). Move the excess into a taxable brokerage in VTI/VXUS — even a boring 60/40 beats inflation.",
        severity: "high",
      });
    } else if (monthsCash < 1 && householdIncome > 0) {
      out.push({
        id: "no-emergency",
        icon: "🚨",
        title: "One bad month away from credit card debt",
        description:
          "Without a cash buffer, any surprise — car repair, medical bill, layoff — gets financed at 20%+ APR, which can take years to undo.",
        whyYou: `Your liquid cash covers under 1 month of expenses. A single $5k surprise would force borrowing.`,
        fix: "Before any investing, park $1,000 in a HYSA this week, then build to 3 months of essential expenses before optimizing anything else.",
        severity: "high",
      });
    }
  }

  // 3. Credit card debt while investing
  if (hasCC && debtTotal > 1000 && investments > debtTotal) {
    out.push({
      id: "investing-while-cc-debt",
      icon: "🔥",
      title: "Investing while carrying credit card debt",
      description:
        "Stocks return ~7% real long-term. Credit cards charge 22%+. Investing while revolving CC debt is borrowing at 22% to chase a 7% return — guaranteed loser.",
      whyYou: `You have ~$${debtTotal.toLocaleString()} in credit/loan debt while holding $${investments.toLocaleString()} in investments.`,
      fix: "Capture the 401(k) match (free money), then aggressively pay off CC debt before adding more to taxable brokerage. Consider a 0% balance transfer card.",
      severity: "high",
    });
  }

  // === Age-stage pitfalls ===

  if (age < 30) {
    out.push({
      id: "skip-roth-young",
      icon: "🌱",
      title: "Choosing Traditional 401(k) over Roth in your low-tax years",
      description:
        "Your 20s are likely your lowest-earning, lowest-tax-rate decade. Paying tax now at 12–22% to lock in tax-free growth forever is one of the best deals in the tax code.",
      whyYou: `At ${age}, your tax bracket is almost certainly lower today than when you'll withdraw in your 60s. Decades of tax-free compounding is the upside you'll never get back.`,
      fix: "Default to Roth 401(k) and Roth IRA contributions until you hit the 24%+ bracket. Then re-evaluate.",
      severity: "high",
    });
  }

  if (age >= 30 && age < 45) {
    out.push({
      id: "no-disability",
      icon: "🦺",
      title: "No own-occupation disability insurance",
      description:
        "In your peak earning years, your future income is your single largest asset. A disability is 3–4x more likely than death before age 65, yet most people only buy life insurance.",
      whyYou: `At ${age}, you likely have 20–30+ years of earning power ahead — losing it would dwarf any other financial setback.`,
      fix: "Get an own-occupation, non-cancelable individual disability policy through Guardian, Principal, or Mass Mutual. Group coverage at work is usually inadequate.",
      severity: "medium",
    });
  }

  if (age >= 50) {
    out.push({
      id: "ignore-catchup",
      icon: "🎯",
      title: "Ignoring catch-up contributions",
      description:
        "After 50, you can put an extra $7,500 into your 401(k) and $1,000 into your IRA every year — totally tax-advantaged, totally optional, and almost always worth it.",
      whyYou: `You're ${age} and in the catch-up window. Skipping it leaves $8,500/yr of tax-advantaged space on the table.`,
      fix: "Increase 401(k) deferral immediately to capture the catch-up. If cash flow allows, also fund the extra IRA contribution.",
      severity: "high",
    });
  }

  // === Goal-driven pitfalls ===

  if (goals.has("home-buying")) {
    out.push({
      id: "house-poor",
      icon: "🏚️",
      title: "Becoming house-poor by stretching for the dream home",
      description:
        "Lenders will approve you for a payment that wrecks every other goal. Once your housing costs (PITI + HOA) exceed ~28% of gross, retirement savings, vacations, and emergency funds all suffer.",
      whyYou: `Buying a home is a top goal. At $${Math.round(householdIncome / 1000)}k income, a "safe" max all-in housing cost is about $${Math.round((householdIncome * 0.28) / 12).toLocaleString()}/month — banks will offer you much more.`,
      fix: "Set your own ceiling at 28% of gross income BEFORE shopping. Stress-test with a 7% mortgage rate even if you get a lower one. Don't forget property tax, insurance, and 1%/yr maintenance.",
      severity: "high",
    });
  }

  if (goals.has("retirement") && householdIncome >= 150000) {
    out.push({
      id: "miss-backdoor",
      icon: "🚪",
      title: "Missing the backdoor Roth because you 'make too much'",
      description:
        "Above the Roth IRA income limit ($165k single / $246k MFJ in 2025), direct Roth contributions are blocked — but the backdoor (non-deductible Traditional → convert to Roth) is fully legal and takes 10 minutes.",
      whyYou: `At your income, direct Roth IRA contributions are phased out, but you almost certainly qualify for the backdoor.`,
      fix: "Open a Traditional IRA, contribute $7,000 (post-tax), convert to Roth the next day. Watch the pro-rata rule — roll any pre-tax IRA balances into your 401(k) first.",
      severity: "medium",
    });
  }

  if (goals.has("education-fund")) {
    out.push({
      id: "529-before-retirement",
      icon: "🎓",
      title: "Funding kids' college before your own retirement",
      description:
        "Your kids can borrow for school; you cannot borrow for retirement. Over-funding a 529 while under-funding your 401(k) is the most common emotional money mistake parents make.",
      whyYou: "Education is one of your goals. The natural urge is to prioritize it — but financially, retirement comes first.",
      fix: "Max your 401(k) match and Roth IRA first. Then fund the 529 with whatever's left. Consider a state with a tax deduction (NY, IL, IN are generous).",
      severity: "medium",
    });
  }

  // === Career pitfalls ===

  if (profile.career === "tech") {
    out.push({
      id: "rsu-concentration",
      icon: "🎰",
      title: "Letting RSUs / company stock concentrate to >10% of net worth",
      description:
        "Tech employees often end up with 30–70% of net worth in their employer's stock. If the company struggles (Meta 2022, Peloton, Wayfair), your job AND portfolio crash together.",
      whyYou: "Tech compensation is heavy in equity. Vested RSUs feel like 'free money' and rarely get sold on schedule.",
      fix: "Sell RSUs the day they vest (no tax penalty — already taxed as income) and reinvest into a diversified index fund. Cap any single stock at 10% of net worth.",
      severity: "high",
    });
  }

  if (profile.career === "entrepreneur") {
    out.push({
      id: "no-solo-401k",
      icon: "🏢",
      title: "Using a SEP-IRA when a Solo 401(k) would shelter more",
      description:
        "Solo 401(k)s allow both employee deferrals ($23,500) AND employer contributions, plus Roth and after-tax options. SEP-IRAs only allow employer-side contributions and block backdoor Roth.",
      whyYou: "As a self-employed individual, the default advice is often a SEP — but a Solo 401(k) usually shelters more and preserves tax flexibility.",
      fix: "Open a Solo 401(k) at Fidelity or Schwab (free, no maintenance fees). Roll any existing SEP balances in to clear the way for backdoor Roth.",
      severity: "medium",
    });
  }

  if (profile.career === "government" || profile.career === "education") {
    out.push({
      id: "pension-overconfidence",
      icon: "📜",
      title: "Counting on the pension to cover everything",
      description:
        "Public pensions are often less inflation-protected than people assume, may have reduced survivor benefits, and rarely cover healthcare gaps before Medicare.",
      whyYou: `As a ${profile.career === "government" ? "government" : "education"} worker, the pension is a real benefit — but it's a floor, not a complete plan.`,
      fix: "Fund a 457(b) or 403(b) on top of the pension. Contributions reduce taxes today and provide flexibility the pension can't.",
      severity: "medium",
    });
  }

  // === Married / household pitfalls ===

  if (isMarried) {
    out.push({
      id: "spouse-disengaged",
      icon: "🤝",
      title: "One spouse handles all the money",
      description:
        "When only one partner knows passwords, accounts, and the plan, a death, divorce, or even a long illness becomes a financial crisis on top of an emotional one.",
      whyYou: "You're filing jointly — both of you should be able to step in and manage the household finances tomorrow if needed.",
      fix: "Schedule a 30-minute 'money date' once a quarter. Share a password manager (1Password, Bitwarden) and keep a one-page document listing every account, advisor, and policy.",
      severity: "medium",
    });
  }

  // === Tax pitfalls ===

  if (goals.has("tax-optimization") || householdIncome >= 200000) {
    out.push({
      id: "ignore-asset-location",
      icon: "🗺️",
      title: "Ignoring asset location across account types",
      description:
        "Holding bonds in your taxable account and stocks in your Roth is backwards — it can cost 0.5–1% of return per year. Tax-inefficient assets (bonds, REITs) belong in tax-deferred accounts.",
      whyYou: `At your income level, every percentage point of after-tax return compounds significantly over 20+ years.`,
      fix: "Put bonds and REITs in 401(k)/IRA. Put broad index funds (VTI, VXUS) in taxable. Put your highest-growth bets (small cap, emerging markets) in Roth.",
      severity: "low",
    });
  }

  // Sort: high severity first
  const rank = { high: 3, medium: 2, low: 1 };
  out.sort((a, b) => rank[b.severity] - rank[a.severity]);

  // Cap at 6 to keep section digestible
  return out.slice(0, 6);
}
