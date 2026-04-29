import { UserProfile, AdviceCard } from "../types";
import {
  isLowIncome,
  isHighIncome,
  getIncomeIndex,
  estimateHouseholdIncome,
  rothIRAEligibility,
  isFreeFileEligible,
} from "./helpers";
import { analyzePlanEligibility } from "./plan-intelligence";

export function generateGoalAdvice(profile: UserProfile): AdviceCard[] {
  const advice: AdviceCard[] = [];
  const { goals, income, age, filingStatus } = profile;
  const highIncome = isHighIncome(income);
  const householdIncome = estimateHouseholdIncome(profile);
  const rothStatus = rothIRAEligibility(householdIncome, filingStatus);
  const freeFileOk = isFreeFileEligible(householdIncome);

  if (goals.includes("emergency-fund")) {
    advice.push({
      id: "goal-emergency",
      title: "Emergency Fund: Your #1 Financial Priority",
      description:
        "Without an emergency fund, every unexpected expense becomes debt. Target 3-6 months of essential expenses in a high-yield savings account. Per the CFPB, the #1 reason Americans fall into debt is unexpected expenses. Don't hold excess cash beyond your target — cash loses purchasing power to inflation.",
      actionSteps: [
        "Calculate your monthly essential expenses and multiply by 3-6 months",
        "Open a high-yield savings account — Flourish is $5M FDIC insured and compares rates across 20+ banks",
        "Consider VMFXX (Vanguard Federal Money Market Fund) as a cash equivalent beyond your emergency reserve",
        "Set up automatic transfers on payday — treat savings like a bill",
        "Once you hit your target, redirect that auto-transfer to investments — don't let excess cash pile up",
        "Use Bankrate.com's savings calculator to set your goal and track progress",
      ],
      category: "savings",
      priority: "high",
      icon: "🛡️",
    });
  }

  if (goals.includes("debt-payoff")) {
    advice.push({
      id: "goal-debt",
      title: "Strategic Debt Elimination: The Math-Optimal Approach",
      description:
        "List every debt with its balance, interest rate, and minimum payment. Pay minimums on everything, then throw all extra money at the highest-interest debt first (avalanche method). Per NerdWallet, the average credit card APR is 20%+ — a balance transfer to a 0% intro card can save hundreds.",
      actionSteps: [
        "List all debts: creditor, balance, APR, minimum payment",
        "Apply for a 0% balance transfer card if you have credit card debt (Chase Slate, Citi Simplicity)",
        "Attack highest-APR debt first while paying minimums on others",
        "For student loans: check IDR plans if federal, refinance if private and rate >5%",
        "Once highest-rate debt is gone, roll that payment into the next one (debt avalanche)",
        "Use the CFPB's debt management tools at consumerfinance.gov for guidance",
        "Check your credit report free at AnnualCreditReport.com — errors can raise your rates",
      ],
      category: "debt",
      priority: "high",
      icon: "💳",
    });
  }

  if (goals.includes("home-buying")) {
    advice.push({
      id: "goal-home",
      title: "Rent vs. Buy: Run the Real Numbers",
      description:
        "Renting is often better financially than buying in the current market. Per the CFPB, most homebuyers underestimate the true cost of homeownership. Transaction costs are 10-15% round trip, maintenance is ~1% of home value annually, plus property tax, insurance, and opportunity cost. The CFPB also warns about mortgage closing scams targeting homebuyers with fake wire transfer instructions.",
      actionSteps: [
        "Run a rent-vs-buy calculator with ALL costs: maintenance (1%/year), insurance, property tax, opportunity cost",
        "Use CFPB's homebuyer tools at consumerfinance.gov/owning-a-home — free roadmap and checklists",
        "If buying: aim for 20% down to avoid PMI, keep total housing under 28% of gross income",
        "Consider first-time buyer programs: FHA (3.5% down), VA (0% down), state grants",
        "Don't forget closing costs: 2-5% of purchase price on top of down payment",
        "⚠️ Beware wire fraud at closing — always verify wire instructions by phone with your title company",
        "Use Bankrate.com's mortgage calculator to compare different loan scenarios",
      ],
      category: "savings",
      priority: "medium",
      icon: "🏠",
    });
  }

  if (goals.includes("investing")) {
    advice.push({
      id: "goal-invest",
      title: "Investment Blueprint: Passive Beats Active",
      description:
        "90% of your investment return is driven by your allocation between stocks and bonds — not individual stock picks. Per Kiplinger and Investopedia, passive index funds outperform 90%+ of actively managed funds over 15 years. Pay close attention to fees: transaction fees should be $0, expense ratios under 0.10%, and financial planning under 1%.",
      actionSteps: [
        "Target allocation: 60% US S&P 500 index (VOO/VFIAX), 30% global equity index (VXUS/VTIAX), 10% bonds (BND/VBTLX)",
        "Open a brokerage at Vanguard, Fidelity, or Schwab — all have $0 transaction fees",
        "Verify expense ratios are under 0.10% — Vanguard index funds are typically 0.03-0.04%",
        "Set up automatic monthly investing — you can't time the market",
        "Use Investor.gov's investment quiz to assess your risk tolerance before starting",
        "Fidelity's Learning Center (fidelity.com/learning-center) has free investing courses",
        "Never check your portfolio daily — quarterly rebalancing is sufficient",
      ],
      category: "investing",
      priority: "medium",
      icon: "📈",
    });
  }

  if (goals.includes("tax-optimization")) {
    const rothStep =
      rothStatus === "eligible"
        ? "Direct Roth IRA: $7,500/year ($8,500 if 50+) — you're under the income limit, contribute directly"
        : rothStatus === "phaseout"
        ? `Direct Roth IRA is partially phased out at your household income (~${filingStatus === "married" ? "$236K–$256K MFJ" : "$150K–$176K single"}). Use the backdoor Roth: $7,500 to a non-deductible Traditional IRA → convert to Roth`
        : `Direct Roth IRA is NOT available at your income (over ${filingStatus === "married" ? "$256K MFJ" : "$176K single"}). Use the backdoor Roth instead: $7,500 to a non-deductible Traditional IRA → convert to Roth (fully legal, takes 10 minutes)`;

    const steps = [
      "Max 401(k) to employer match — 2026 limit: $24,500 (catch-up: $8,000 if 50+; $11,250 if 60-63)",
      "If HDHP eligible: fund HSA ($4,300 single / $8,550 family for 2026) — invest it, don't spend it",
      rothStep,
      "Mega Backdoor Roth: after-tax 401(k) → Roth conversion (~$40K+ extra, total limit $72,000)",
      "529 plan: tax-deductible in many states, unused funds roll to Roth IRA ($35K lifetime cap per SECURE 2.0)",
    ];
    if (freeFileOk) {
      steps.push("Use IRS Free File (irs.gov/freefile) — completely free tax filing (AGI ≤ $84,000)");
    }

    advice.push({
      id: "goal-tax",
      title: "Tax-Advantaged Accounts: Fill Every Bucket (2026 Limits)",
      description:
        "The US tax code rewards those who use the right accounts. Fill them in this order: (1) 401(k) to employer match (free money — but watch the fees). (2) HSA if eligible (the ONLY triple-tax-advantage account). (3) Roth IRA — direct if eligible, backdoor if your income exceeds the limit. (4) Mega Backdoor Roth ($40K+ extra). (5) 529 for education savings.",
      actionSteps: steps,
      category: "tax",
      priority: "medium",
      icon: "📋",
    });
  }

  if (goals.includes("wealth-building")) {
    advice.push({
      id: "goal-wealth",
      title: "Wealth Building: Reverse Budget Your Way There",
      description:
        "Traditional budgeting is really hard to stick with. The better approach is reverse budgeting: set up automatic investing FIRST, then spend whatever's left. Save at least 20% of post-tax income for investments. As Khan Academy's personal finance course teaches: the habit of saving matters more than the amount. Concentration builds wealth, diversification preserves it.",
      actionSteps: [
        "Set up automatic investment transfers on payday BEFORE you can spend",
        "Target saving/investing at least 20% of post-tax income",
        "Don't budget every category — just automate savings and spend the rest guilt-free",
        "If you want to track spending, Monarch is the best app for detailed budgeting",
        "As income grows, increase savings rate before lifestyle — avoid lifestyle inflation",
        "Track net worth quarterly (Empower/Personal Capital) — this is the number that matters",
        "Use NerdWallet.com to compare savings accounts and brokerage fees side by side",
      ],
      category: "investing",
      priority: "medium",
      icon: "💰",
    });
  }

  if (goals.includes("education-fund")) {
    const state = profile.w2Data?.state || profile.w2History?.[0]?.state;
    const planInfo = analyzePlanEligibility(undefined, profile.career, state);
    const stateInfo = planInfo.state529Info;

    const actionSteps: string[] = [];
    if (stateInfo) {
      actionSteps.push(
        `✅ Your state (${state}): ${stateInfo.deduction}. Use the ${stateInfo.planName} to get this tax benefit.`
      );
      if (stateInfo.deduction.includes("no state deduction") || stateInfo.deduction.includes("no state income tax")) {
        actionSteps.push(
          "Since your state doesn't offer a deduction, use the best-rated plan nationally: Utah my529 (lowest fees, Vanguard funds) or Nevada 529 (Vanguard)"
        );
      }
    } else {
      actionSteps.push(
        "Upload a W-2 so we can identify your state and tell you the exact tax deduction available for 529 contributions"
      );
    }
    actionSteps.push(
      "Up to $20,000/year can be used for private K-12 tuition (not just college)",
      "Invest in age-based portfolios that automatically get more conservative",
      "Grandparents can contribute too — up to $19,000/year gift tax-free per grandparent (2026)",
      "Unused funds can roll to beneficiary's Roth IRA ($35K lifetime, after 15 years per SECURE 2.0)",
      "Use Investor.gov's 529 resources for plan comparisons"
    );

    advice.push({
      id: "goal-education-fund",
      title: stateInfo 
        ? `529 Plan: ${stateInfo.deduction.includes("no state") ? "Use Best National Plan" : `${state} Offers Tax Deduction`}`
        : "529 Plan: Tax-Free Education Savings (2026 Update)",
      description:
        "A 529 plan lets education savings grow tax-free and withdrawals are tax-free for qualified expenses. SECURE 2.0 update: unused 529 funds can be rolled into a Roth IRA (up to $35K lifetime, after 15 years), eliminating the 'what if they don't go to college' concern.",
      actionSteps,
      category: "education",
      priority: "medium",
      icon: "🎓",
    });
  }

  if (goals.includes("retirement")) {
    advice.push({
      id: "goal-retirement-roadmap",
      title: "Retirement Savings Roadmap by Age (2026 Limits)",
      description:
        `At ${age}, a common benchmark is to have ${age < 30 ? '0.5-1x' : age < 40 ? '1-3x' : age < 50 ? '3-6x' : age < 60 ? '6-8x' : '8-10x'} your annual salary saved for retirement. You can't time the market — just start monthly automatic investing and let compound growth do the work. Use the Rule of 72 (Investor.gov): divide 72 by your expected return to see how fast your money doubles.`,
      actionSteps: [
        "Calculate your 'retirement number': annual expenses × 25 (based on the 4% rule)",
        "2026 limits: 401(k) $24,500; IRA $7,500; HSA $4,300/$8,550; total 401(k) $72,000",
        "Catch-up for 50+: extra $8,000/year for 401(k); $11,250 if ages 60-63 (SECURE 2.0)",
        "Consolidate old 401(k)s — fees are expensive on legacy plans, roll into current 401(k) or IRA",
        "90% of returns are driven by stock vs. bond split — use Investor.gov's risk quiz",
        "Set up automatic monthly contributions — time in market beats timing the market",
      ],
      category: "retirement",
      priority: "high",
      icon: "🏖️",
    });
  }

  // ──── INSURANCE ADVICE ────
  if (age >= 25 && age <= 45) {
    advice.push({
      id: "goal-insurance-term",
      title: "Life Insurance: Lock In Term Coverage Now",
      description:
        "TERM life insurance is the best type — avoid whole life and universal life (they're expensive and underperform). Lock in coverage while you're young and healthy: premiums increase dramatically after 40. A healthy 30-year-old can get $1M in 30-year term coverage for $30-$50/month.",
      actionSteps: [
        "Get TERM life insurance only — not whole life, not universal life",
        "Coverage amount: 10-12x your annual income",
        "Lock in a 20-30 year term while you're young — rates skyrocket after 40",
        "Shop at PolicyGenius.com to compare quotes from multiple carriers",
        "If you're single with no dependents, you may not need life insurance yet — but disability insurance is critical",
      ],
      category: "insurance",
      priority: "medium",
      icon: "🛡️",
    });
  }

  // ──── MERGING FINANCES ────
  if (filingStatus === "married" || filingStatus === "head-of-household") {
    advice.push({
      id: "goal-merge-finances",
      title: "Merging Finances: Avoid the Bear Traps",
      description:
        "Most couples make critical mistakes when combining finances. The biggest bear traps: (1) Jumping into numbers too soon, (2) Transparency gaps, (3) Dismissing a pre-nup, (4) Commingling pre-marital assets. Per the CFPB, 1 in 5 Americans says finances are a major source of relationship stress.",
      actionSteps: [
        "Have the 'money values' conversation BEFORE merging numbers",
        "Keep individual accounts from before marriage separate (play dough principle)",
        "Open a new joint account post-marriage for shared expenses",
        "Consider a pre-nup if: large inheritance, business equity, kids from prior relationships, income disparity",
        "Be fully transparent: share credit reports, debts, and financial goals early",
        "Use MyMoney.gov's financial planning modules to align on shared goals",
      ],
      category: "savings",
      priority: "medium",
      icon: "👫",
    });
  }

  return advice;
}