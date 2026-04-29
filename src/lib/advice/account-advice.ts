import { UserProfile, AdviceCard, ConnectedAccountData, DebtAccount } from "../types";
import { isHighIncome, rothIRAEligibility } from "./helpers";

/**
 * Generate advice based on real connected account data (holdings, spending, balances).
 */
export function generateAccountAdvice(profile: UserProfile): AdviceCard[] {
  const advice: AdviceCard[] = [];
  const acct = profile.accountData;
  if (!acct) return advice;

  const { totalBalance, totalInvestments, totalDebt, holdings, topSpendingCategories } = acct;
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  // ──── EMERGENCY FUND CHECK ────
  // Estimate monthly spending from transaction data
  const totalMonthlySpending = topSpendingCategories.reduce((sum, c) => sum + c.amount, 0);
  const cashBalance = totalBalance - totalInvestments;
  
  if (totalMonthlySpending > 0 && cashBalance > 0) {
    const monthsCovered = cashBalance / totalMonthlySpending;
    if (monthsCovered < 3) {
      advice.push({
        id: "acct-low-emergency-fund",
        title: `Emergency Fund Gap: Only ${monthsCovered.toFixed(1)} Months of Coverage`,
        description:
          `Based on your spending of ${fmt(totalMonthlySpending)}/month and cash balance of ${fmt(cashBalance)}, you have about ${monthsCovered.toFixed(1)} months of expenses covered. You need at least 3-6 months. That means building up an additional ${fmt((3 * totalMonthlySpending) - cashBalance)} minimum.`,
        actionSteps: [
          `Target emergency fund: ${fmt(3 * totalMonthlySpending)} (3 months) to ${fmt(6 * totalMonthlySpending)} (6 months)`,
          "Move emergency funds to a high-yield savings account (Flourish, 5%+ APY)",
          "Set up automatic weekly transfers to close the gap faster",
          "Don't invest this money — it needs to be liquid and safe",
        ],
        category: "savings",
        priority: "high",
        icon: "🚨",
      });
    } else if (monthsCovered > 12) {
      advice.push({
        id: "acct-excess-cash",
        title: `Excess Cash: ${monthsCovered.toFixed(0)} Months Sitting Idle`,
        description:
          `You have ${fmt(cashBalance)} in cash — that's ${monthsCovered.toFixed(0)} months of expenses. Beyond 6 months, excess cash loses purchasing power to inflation (~3%/year). That's roughly ${fmt(cashBalance * 0.03)}/year in lost purchasing power. Consider investing the excess.`,
        actionSteps: [
          `Keep ${fmt(6 * totalMonthlySpending)} as your emergency fund in high-yield savings`,
          `Invest the remaining ${fmt(cashBalance - (6 * totalMonthlySpending))} in a diversified index fund portfolio`,
          "60% US S&P 500 (VOO), 30% international (VXUS), 10% bonds (BND)",
          "Or use VMFXX (Vanguard Money Market) as a stepping stone if you're nervous about investing",
        ],
        category: "investing",
        priority: "high",
        icon: "💸",
      });
    }
  }

  // ──── SPECIFIC DEBT PAYOFF PLAN ────
  const debtAccounts = acct.debtAccounts || [];
  if (debtAccounts.length > 0 && totalDebt > 0) {
    // Estimate interest rates by subtype
    const withEstimatedRates = debtAccounts.map((d) => ({
      ...d,
      estimatedRate: estimateInterestRate(d),
    }));
    // Sort highest rate first (avalanche)
    withEstimatedRates.sort((a, b) => b.estimatedRate - a.estimatedRate);

    const topDebt = withEstimatedRates[0];
    const actionSteps: string[] = [];

    // Build specific payoff order
    actionSteps.push(
      `🔴 Priority #1: ${topDebt.name}${topDebt.institutionName ? ` (${topDebt.institutionName})` : ""} — ${fmt(topDebt.balance)} at ~${topDebt.estimatedRate}% APR. Pay this off first.`
    );
    for (let i = 1; i < Math.min(withEstimatedRates.length, 4); i++) {
      const d = withEstimatedRates[i];
      actionSteps.push(
        `#${i + 1}: ${d.name}${d.institutionName ? ` (${d.institutionName})` : ""} — ${fmt(d.balance)} at ~${d.estimatedRate}% APR`
      );
    }

    // Add specific refinancing suggestions based on debt types
    const hasHighRateCC = withEstimatedRates.some(
      (d) => d.subtype === "credit card" && d.balance > 0
    );
    const hasStudentLoan = withEstimatedRates.some(
      (d) => d.subtype === "student" || (d.name || "").toLowerCase().includes("student")
    );
    const hasAutoLoan = withEstimatedRates.some(
      (d) => d.subtype === "auto" || (d.name || "").toLowerCase().includes("auto")
    );

    if (hasHighRateCC) {
      const ccDebt = withEstimatedRates
        .filter((d) => d.subtype === "credit card")
        .reduce((s, d) => s + d.balance, 0);
      actionSteps.push(
        `💳 ${fmt(ccDebt)} in credit card debt — apply for a 0% balance transfer card (Chase Slate Edge, Citi Simplicity: 21 months 0% APR, 3% fee). Saves ~${fmt(ccDebt * 0.20)} in annual interest.`
      );
    }
    if (hasStudentLoan) {
      actionSteps.push(
        "🎓 Student loans — check refinancing with SoFi, Earnest, or Splash Financial (rates from 4.5%). Federal loans: explore SAVE/PAYE income-driven repayment if payments are >10% of income."
      );
    }
    if (hasAutoLoan) {
      actionSteps.push(
        "🚗 Auto loan — refinance through a credit union (DCU, PenFed) or via Caribou/myAutoloan if your credit score has improved since you took the loan."
      );
    }

    // If they can't afford aggressive payments
    const cashBalance = totalBalance - totalInvestments;
    const monthlyDebtEstimate = totalDebt * 0.03; // rough min payment estimate
    if (cashBalance < monthlyDebtEstimate * 3) {
      actionSteps.push(
        `⚠️ Low cash reserves (${fmt(cashBalance)}). Before aggressive payoff: build 1-month buffer, then throw every extra dollar at the highest-rate debt.`
      );
    }

    // Calculate interest cost
    const annualInterestCost = withEstimatedRates.reduce(
      (sum, d) => sum + d.balance * (d.estimatedRate / 100),
      0
    );

    advice.push({
      id: "acct-debt-payoff-plan",
      title: `Debt Payoff Plan: ${fmt(totalDebt)} Across ${debtAccounts.length} Account${debtAccounts.length > 1 ? "s" : ""}`,
      description: `You're paying an estimated ${fmt(annualInterestCost)}/year in interest across your debts. Your highest-rate debt is "${topDebt.name}" at ~${topDebt.estimatedRate}% APR — every month you delay costs you ~${fmt(topDebt.balance * topDebt.estimatedRate / 100 / 12)} in interest on that account alone. Here's your specific payoff order:`,
      actionSteps,
      category: "debt",
      priority: "high",
      icon: "🎯",
    });
  }

  // ──── DEBT-TO-ASSET RATIO (only if no specific debt accounts) ────
  if (debtAccounts.length === 0 && totalDebt > 0 && totalBalance > 0) {
    const debtToAssetRatio = totalDebt / totalBalance;
    if (debtToAssetRatio > 0.5) {
      advice.push({
        id: "acct-high-debt-ratio",
        title: `High Debt-to-Asset Ratio: ${(debtToAssetRatio * 100).toFixed(0)}%`,
        description:
          `Your total debt of ${fmt(totalDebt)} represents ${(debtToAssetRatio * 100).toFixed(0)}% of your total assets (${fmt(totalBalance)}). Connect your specific debt accounts so we can build you a precise payoff plan with refinancing options.`,
        actionSteps: [
          "Connect all credit cards and loan accounts to get a personalized payoff order",
          "Consider a 0% balance transfer for credit card debt (Chase Slate, Citi Simplicity)",
          "Pause non-matched investment contributions and redirect to debt payoff",
        ],
        category: "debt",
        priority: "high",
        icon: "⚠️",
      });
    }
  }

  // ──── PORTFOLIO CONCENTRATION ────
  if (holdings.length > 0 && totalInvestments > 0) {
    // Check for single-stock concentration
    const sortedHoldings = [...holdings].sort((a, b) => (b.value || 0) - (a.value || 0));
    const topHolding = sortedHoldings[0];
    const topValue = topHolding?.value || 0;
    const topPct = (topValue / totalInvestments) * 100;

    if (topPct > 30 && topHolding?.ticker) {
      advice.push({
        id: "acct-concentration-risk",
        title: `Portfolio Concentration: ${topHolding.ticker} Is ${topPct.toFixed(0)}% of Your Investments`,
        description:
          `${topHolding.security_name || topHolding.ticker} makes up ${topPct.toFixed(0)}% (${fmt(topValue)}) of your ${fmt(totalInvestments)} portfolio. Concentration above 20-30% in a single position creates significant risk. If ${topHolding.ticker} drops 40%, your portfolio loses ${fmt(topValue * 0.4)}. "Concentration builds wealth, but diversification preserves it."`,
        actionSteps: [
          `Consider trimming ${topHolding.ticker} to 10-15% of portfolio (sell ${fmt(topValue - totalInvestments * 0.15)})`,
          "Reinvest into broad index funds: VOO (S&P 500), VXUS (international), BND (bonds)",
          "If these are company stock options, check vesting schedules and tax implications before selling",
          "Use tax-loss harvesting on other positions to offset capital gains from rebalancing",
          "Set up automatic rebalancing quarterly to prevent future drift",
        ],
        category: "investing",
        priority: "high",
        icon: "🎯",
      });
    }

    // Check diversification — too few holdings
    const uniqueTickers = new Set(holdings.filter(h => h.ticker).map(h => h.ticker));
    if (uniqueTickers.size < 5 && totalInvestments > 5000) {
      advice.push({
        id: "acct-low-diversification",
        title: `Under-Diversified: Only ${uniqueTickers.size} Positions in Your Portfolio`,
        description:
          `With only ${uniqueTickers.size} holdings across ${fmt(totalInvestments)}, you're taking on unnecessary risk. A single index fund like VOO holds 500 companies. Individual stock picking rarely beats the market long-term — 90% of actively managed funds underperform passive indexes over 15 years.`,
        actionSteps: [
          "Consider consolidating into 2-3 broad index funds instead of individual stocks",
          "Core portfolio: 60% VOO (US), 30% VXUS (international), 10% BND (bonds)",
          "Keep individual stock picks to <10% of total portfolio as a 'play money' allocation",
          "Expense ratios should be under 0.10% — Vanguard index funds are 0.03%",
        ],
        category: "investing",
        priority: "medium",
        icon: "📊",
      });
    }

    // Check for high-fee funds or cash-like holdings
    const cashLike = holdings.filter(h => {
      const name = (h.security_name || "").toLowerCase();
      const ticker = (h.ticker || "").toLowerCase();
      return name.includes("money market") || name.includes("settlement") || 
             name.includes("cash") || ticker === "spaxx" || ticker === "fdrxx" ||
             ticker === "swvxx" || ticker === "vmfxx";
    });
    const cashInBrokerage = cashLike.reduce((sum, h) => sum + (h.value || 0), 0);
    if (cashInBrokerage > 5000 && totalInvestments > 10000) {
      const cashPct = (cashInBrokerage / totalInvestments) * 100;
      if (cashPct > 20) {
        advice.push({
          id: "acct-cash-drag",
          title: `${cashPct.toFixed(0)}% of Your Brokerage Is Sitting in Cash`,
          description:
            `You have ${fmt(cashInBrokerage)} in money market/settlement funds inside your brokerage account. While earning ~5% currently, this underperforms equities long-term (10% avg). If you don't need this cash within 5 years, consider investing it.`,
          actionSteps: [
            "Determine if this cash is earmarked for a specific goal (home down payment, etc.)",
            "If not needed within 5 years, dollar-cost average into index funds over 3-6 months",
            "If needed within 1-3 years, a money market fund or Treasury bills are appropriate",
            "Set up automatic monthly investments to deploy idle cash systematically",
          ],
          category: "investing",
          priority: "medium",
          icon: "💤",
        });
      }
    }
  }

  // ──── SPENDING INSIGHTS ────
  if (topSpendingCategories.length > 0 && totalMonthlySpending > 0) {
    // Find the biggest spending category
    const topCategory = topSpendingCategories[0];
    const topCategoryPct = (topCategory.amount / totalMonthlySpending) * 100;

    if (topCategoryPct > 40) {
      advice.push({
        id: "acct-spending-concentration",
        title: `${topCategory.category} Is ${topCategoryPct.toFixed(0)}% of Your Spending`,
        description:
          `Your top spending category "${topCategory.category}" accounts for ${fmt(topCategory.amount)}/month — ${topCategoryPct.toFixed(0)}% of your total spending. This level of concentration in one category may indicate an opportunity to optimize or negotiate better rates.`,
        actionSteps: [
          `Review your ${topCategory.category} expenses for subscriptions or services you can downgrade`,
          "Negotiate bills annually — internet, insurance, phone plans",
          "Use cashback credit cards that reward your top spending category (e.g., 3-5% back)",
          "Set a monthly budget for this category and automate the rest to savings/investments",
        ],
        category: "savings",
        priority: "medium",
        icon: "🔍",
      });
    }

    // Check for high dining/entertainment
    const dining = topSpendingCategories.find(c => 
      c.category.toLowerCase().includes("food") || 
      c.category.toLowerCase().includes("restaurant") ||
      c.category.toLowerCase().includes("dining")
    );
    if (dining && dining.amount > 500) {
      advice.push({
        id: "acct-dining-spending",
        title: `Food & Dining: ${fmt(dining.amount)}/Month — ${fmt(dining.amount * 12)}/Year`,
        description:
          `You're spending ${fmt(dining.amount)}/month on food and dining. That's ${fmt(dining.amount * 12)} annually. If you redirected even 30% of that (${fmt(dining.amount * 0.3)}/month) to investments earning 8%, it would grow to ${fmt(dining.amount * 0.3 * 12 * 15)} over 15 years. Not saying don't enjoy food — just be intentional about the split between cooking and dining out.`,
        actionSteps: [
          "Track dining vs. grocery spending separately for one month",
          "Meal prep 2-3 days/week to cut dining costs without feeling deprived",
          "Use dining cashback cards: Amex Gold (4x restaurants), Chase Sapphire (3x dining)",
          `Redirect ${fmt(dining.amount * 0.3)}/month savings to automatic investing`,
        ],
        category: "savings",
        priority: "low",
        icon: "🍽️",
      });
    }
  }

  // ──── NET WORTH SNAPSHOT ────
  const netWorth = totalBalance - totalDebt;
  if (totalBalance > 0 || totalDebt > 0) {
    const ageTarget = profile.age < 30 ? 0.5 : profile.age < 40 ? 2 : profile.age < 50 ? 4 : 7;
    const incomeEstimate = profile.w2Data?.grossIncome || getIncomeEstimate(profile.income);
    
    if (incomeEstimate > 0) {
      const targetNetWorth = incomeEstimate * ageTarget;
      const netWorthRatio = netWorth / incomeEstimate;
      const onTrack = netWorth >= targetNetWorth;

      advice.push({
        id: "acct-net-worth-check",
        title: onTrack 
          ? `Net Worth On Track: ${fmt(netWorth)} (${netWorthRatio.toFixed(1)}x Income)` 
          : `Net Worth Gap: ${fmt(netWorth)} vs ${fmt(targetNetWorth)} Target`,
        description: onTrack
          ? `Your net worth of ${fmt(netWorth)} is ${netWorthRatio.toFixed(1)}x your income — at age ${profile.age}, the benchmark is ${ageTarget}x. You're doing well! Focus on maintaining your savings rate and optimizing tax efficiency.`
          : `At age ${profile.age}, a common benchmark is having ${ageTarget}x your income saved (${fmt(targetNetWorth)}). Your current net worth of ${fmt(netWorth)} (${netWorthRatio.toFixed(1)}x) shows a gap of ${fmt(targetNetWorth - netWorth)}. The good news: increasing your savings rate by even 5% can close this gap significantly.`,
        actionSteps: onTrack
          ? [
              "Continue current savings rate — you're ahead of most Americans",
              "Focus on tax optimization to keep more of what you earn",
              "Consider increasing investment allocation to growth assets",
              "Review asset allocation annually — ensure it matches your risk tolerance",
            ]
          : (() => {
              const gap = targetNetWorth - netWorth;
              const yearsToRetirement = Math.max(65 - profile.age, 5);
              const monthlyGapContribution = gap / (yearsToRetirement * 12);
              const totalDebt = acct.totalDebt || 0;
              const hasHighRateDebt = (acct.debtAccounts || []).some(
                (d) => estimateInterestRate(d) > 10
              );
              // Optimal savings rate: base 15%, adjust up if behind, down if heavy debt
              const baseSavingsRate = 0.15;
              const gapAdjustment = netWorthRatio < ageTarget * 0.5 ? 0.10 : netWorthRatio < ageTarget * 0.75 ? 0.05 : 0;
              const debtAdjustment = hasHighRateDebt ? -0.05 : 0;
              const optimalRate = Math.min(Math.max(baseSavingsRate + gapAdjustment + debtAdjustment, 0.10), 0.35);
              const monthlySavingsTarget = (incomeEstimate * optimalRate) / 12;
              const annual401kMax = profile.age >= 50 ? 30500 : 23500;
              const monthlyIRAMax = profile.age >= 50 ? 583 : 541;

              const steps: string[] = [
                `Close the ${fmt(gap)} gap by saving ${(optimalRate * 100).toFixed(0)}% of gross income (${fmt(monthlySavingsTarget)}/month)`,
                `Automate 401(k) contribution: target ${fmt(Math.min(monthlySavingsTarget * 0.7, annual401kMax / 12))}/month (${Math.min(Math.round(optimalRate * 70), Math.round(annual401kMax / incomeEstimate * 100))}% of pay). At minimum, max the employer match — that's free money.`,
                (() => {
                  const status = rothIRAEligibility(incomeEstimate, profile.filingStatus);
                  if (status === "ineligible") {
                    return `Direct Roth IRA isn't available at your income — use the backdoor Roth (${fmt(monthlyIRAMax)}/month to a non-deductible Traditional IRA, then convert to Roth)`;
                  }
                  if (status === "phaseout") {
                    return `Direct Roth IRA is partially phased out at your income — safest path is the backdoor Roth (${fmt(monthlyIRAMax)}/month to a Traditional IRA → convert to Roth)`;
                  }
                  return `Open/max a Roth IRA: contribute ${fmt(monthlyIRAMax)}/month (${fmt(monthlyIRAMax * 12)}/year limit)`;
                })(),
              ];

              if (hasHighRateDebt) {
                steps.push(
                  `Split extra cash: 50% to high-rate debt payoff, 50% to investments until debt is cleared, then shift to ${(optimalRate * 100 + 5).toFixed(0)}% savings rate`
                );
              } else {
                steps.push(
                  `At ${fmt(monthlySavingsTarget)}/month earning ~8% avg return, you'd accumulate ~${fmt(monthlySavingsTarget * 12 * yearsToRetirement * 1.5)} in ${yearsToRetirement} years (compounded)`
                );
              }

              steps.push("Track net worth monthly — Empower (Personal Capital) is free");
              return steps;
            })(),
        category: "investing",
        priority: onTrack ? "low" : "high",
        icon: onTrack ? "✅" : "📈",
      });
    }
  }

  return advice;
}

function getIncomeEstimate(income?: string): number {
  if (!income) return 0;
  const map: Record<string, number> = {
    "Under $30,000": 25000,
    "$30,000 - $50,000": 40000,
    "$50,000 - $75,000": 62500,
    "$75,000 - $100,000": 87500,
    "$100,000 - $150,000": 125000,
    "$150,000 - $250,000": 200000,
    "$250,000+": 300000,
  };
  return map[income] || 0;
}

/**
 * Estimate interest rate based on account subtype.
 * Plaid doesn't provide interest rates directly, so we use typical market rates.
 */
function estimateInterestRate(debt: DebtAccount): number {
  const subtype = (debt.subtype || "").toLowerCase();
  const name = (debt.name || "").toLowerCase();

  if (subtype === "credit card" || name.includes("credit card")) return 24.5;
  if (subtype === "personal" || name.includes("personal loan")) return 11.5;
  if (subtype === "auto" || name.includes("auto") || name.includes("car")) return 7.0;
  if (subtype === "student" || name.includes("student")) return 5.5;
  if (subtype === "mortgage" || name.includes("mortgage")) return 7.0;
  if (subtype === "home equity" || name.includes("heloc") || name.includes("home equity")) return 8.5;
  if (subtype === "line of credit" || name.includes("line of credit")) return 12.0;
  if (subtype === "medical" || name.includes("medical")) return 0; // often 0% but varies
  // Default for unknown loan types
  return 10.0;
}
