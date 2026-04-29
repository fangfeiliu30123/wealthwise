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
import { estimateChildcareMonthly } from "../metro-data";

/**
 * Cross-cutting advice combining multiple profile factors.
 * Sources: IRS.gov, Investor.gov, CFPB, Investopedia, NerdWallet, Bankrate, Kiplinger
 */
export function generateCrossCuttingAdvice(profile: UserProfile): AdviceCard[] {
  const advice: AdviceCard[] = [];
  const { career, age, goals, income, filingStatus, w2Data, accountData } = profile;
  const lowIncome = isLowIncome(income);
  const highIncome = isHighIncome(income);
  const incomeIdx = getIncomeIndex(income);
  const householdIncome = estimateHouseholdIncome(profile);
  const rothStatus = rothIRAEligibility(householdIncome, filingStatus);
  const freeFileOk = isFreeFileEligible(householdIncome);
  const employer = w2Data?.employer || (profile.w2History?.[0]?.employer);
  const state = w2Data?.state || (profile.w2History?.[0]?.state);
  const planInfo = analyzePlanEligibility(employer, career, state, accountData);

  // ──── ROTH CONVERSION WINDOW ────
  if ((career === "student" || (age < 30 && lowIncome)) && !goals.includes("debt-payoff")) {
    const hasTraditionalFunds = planInfo.hasTraditionalIRAOrOld401k;
    const conversionSteps: string[] = [];

    if (hasTraditionalFunds) {
      conversionSteps.push(
        "✅ We found traditional/rollover IRA holdings in your connected accounts — these are prime candidates for Roth conversion now while your income is low"
      );
    } else {
      conversionSteps.push(
        "You don't appear to have traditional IRA or old 401(k) balances in your connected accounts — if you have any at a previous employer, roll them over and convert to Roth now"
      );
    }
    conversionSteps.push(
      "Calculate taxes owed using current bracket (2026: 10% up to ~$11,925, 12% up to ~$48,475 single)",
      "Convert some or all to Roth IRA — do partial conversions to stay in a low bracket",
      "Keep cash aside to pay the tax bill (don't use IRA funds for this)",
      "Backdoor Roth IRA method: contribute to traditional IRA → immediately convert to Roth (works at any income)",
      "See Investopedia's 'Backdoor Roth IRA' guide for step-by-step instructions"
    );

    advice.push({
      id: "cross-roth-conversion-window",
      title: "Roth Conversion Window: Act While Your Income Is Low",
      description:
        "You're likely in the lowest tax bracket you'll ever be in. This creates a rare opportunity: convert traditional IRA or old 401(k) funds to a Roth IRA now. You'll pay taxes at today's low rate (possibly 10-12%) instead of your future rate (potentially 22-32%+). On a $50,000 conversion, this could save you $5,000-$10,000 in lifetime taxes.",
      actionSteps: conversionSteps,
      category: "tax",
      priority: "high",
      icon: "🔄",
    });
  }

  // ──── STUDENT LOAN + LOW INCOME → IDR ────
  if (
    (career === "student" || career === "healthcare" || career === "education") &&
    goals.includes("debt-payoff") &&
    lowIncome
  ) {
    advice.push({
      id: "cross-idr-student-loans",
      title: "Income-Driven Repayment Could Slash Your Payments",
      description:
        "With your current income, the SAVE plan could reduce your federal student loan payment to $0-$150/month. After 20-25 years, remaining balance is forgiven. If you work for a nonprofit or government employer, PSLF forgives after just 10 years.",
      actionSteps: [
        "Log into StudentAid.gov and check your loan servicer and balance",
        "Apply for the SAVE repayment plan through StudentAid.gov/idr",
        "If at a nonprofit/government employer, submit PSLF certification annually",
        "Do NOT refinance federal loans to private — you'll lose forgiveness eligibility",
        "Use the CFPB's student loan repayment tool at consumerfinance.gov for comparison",
      ],
      category: "debt",
      priority: "high",
      icon: "🎓",
    });
  }

  // ──── YOUNG + HIGH INCOME (TECH/FINANCE) → MEGA BACKDOOR ROTH ────
  if (age < 40 && highIncome && (career === "tech" || career === "finance")) {
    const actionSteps: string[] = [];

    if (planInfo.megaBackdoorEligible === "yes") {
      actionSteps.push(
        `✅ ${planInfo.employerName} supports mega backdoor Roth — log into your 401(k) portal and enable after-tax contributions immediately`
      );
      actionSteps.push(
        "Set after-tax contributions to fill the gap between your pre-tax + employer match and the $72,000 annual limit"
      );
      actionSteps.push(
        "Enable automatic in-plan Roth conversions (most plans call this 'auto-convert after-tax to Roth') to avoid taxable gains building up"
      );
    } else if (planInfo.megaBackdoorEligible === "likely") {
      actionSteps.push(
        `${planInfo.megaBackdoorNote}`
      );
      actionSteps.push(
        "Log into your 401(k) portal → look for 'After-Tax Contributions' option. If present, you're eligible."
      );
      actionSteps.push(
        "Set up after-tax contributions to fill the gap between pre-tax + match and the $72,000 limit"
      );
    } else {
      actionSteps.push(
        `${planInfo.megaBackdoorNote}`
      );
    }

    actionSteps.push(
      "Convert after-tax contributions to Roth immediately to minimize taxable gains",
      "Over 20 years at 8% returns, the extra ~$40K/year could grow to $2M+ tax-free"
    );

    advice.push({
      id: "cross-mega-backdoor-roth",
      title: planInfo.megaBackdoorEligible === "yes"
        ? `Mega Backdoor Roth: ${planInfo.employerName} Supports It — Enable Now`
        : "Mega Backdoor Roth: Shelter $40K+ Extra Per Year",
      description:
        "Your high income disqualifies you from direct Roth contributions, but many tech/finance 401(k) plans allow after-tax contributions with in-plan Roth conversions. For 2026, the total 401(k) limit is $72,000 — minus your $24,500 elective deferral and employer match, the rest can go after-tax → Roth.",
      actionSteps,
      category: "retirement",
      priority: "high",
      icon: "🚀",
    });
  }

  // ──── MARRIED + HOME-BUYING ────
  if (filingStatus === "married" && goals.includes("home-buying")) {
    advice.push({
      id: "cross-married-homebuying",
      title: "Married Home Buyers: Run the Rent vs. Buy Math",
      description:
        "Renting is often better financially than buying right now. But if buying: filing jointly lets lenders use combined income. If one spouse has poor credit (below 680), consider single-spouse mortgage application. The CFPB warns about mortgage closing scams — verify all wire transfer instructions directly with your lender before sending funds.",
      actionSteps: [
        "Run rent vs. buy analysis including ALL costs (not just mortgage vs. rent)",
        "Pull both credit reports from AnnualCreditReport.com (free)",
        "Compare combined vs. single-spouse application scenarios with a lender",
        "Each spouse can use the $10,000 first-time homebuyer IRA exception",
        "Keep total housing (PITI) under 28% of combined gross income",
        "Use CFPB's homebuyer tools at consumerfinance.gov/owning-a-home before closing",
        "⚠️ Beware wire fraud at closing — verify instructions by phone with your lender, not via email",
      ],
      category: "savings",
      priority: "high",
      icon: "🏡",
    });
  }

  // ──── HIGH INCOME + TAX OPTIMIZATION ────
  if (highIncome && goals.includes("tax-optimization")) {
    advice.push({
      id: "cross-high-income-tax",
      title: "High-Earner Tax Reduction Playbook",
      description:
        `At ${income || 'your income level'}, you're likely in the 32-37% bracket. Stack these strategies for 2026: (1) Max pre-tax 401(k) at $24,500. (2) HSA: triple tax advantage — grows tax-free, comes out tax-free for medical ($280K average lifetime healthcare cost). (3) Backdoor Roth IRA for $7,500 of tax-free growth. (4) Mega Backdoor Roth for ~$40K+ more. Combined savings: $12,000-$15,000+ annually in reduced taxes.`,
      actionSteps: [
        "Max pre-tax 401(k) ($24,500; $32,500 if 50+; $35,750 if 60-63 per SECURE 2.0)",
        "If HDHP eligible: max HSA ($4,300/$8,550 for 2026) — invest it in index funds, don't spend it",
        `Backdoor Roth IRA: $7,500 to a non-deductible Traditional IRA → convert to Roth (your income exceeds the direct Roth limit of ${filingStatus === "married" ? "$256K MFJ" : "$176K single"}, so direct contributions aren't allowed)`,
        "Mega Backdoor Roth: after-tax 401(k) contributions → Roth conversion (~$40K+ extra)",
        "529 plan for kids: tax-deductible in many states, up to $20K/year for private school",
        "Harvest tax losses in December in taxable brokerage accounts",
        "Hire a CPA — at your bracket, professional tax prep usually pays for itself many times over (skip IRS Free File — your AGI exceeds the $84K cap)",
      ],
      category: "tax",
      priority: "high",
      icon: "📋",
    });
  }

  // ──── ENTREPRENEUR + YOUNG ────
  if (career === "entrepreneur" && age < 40) {
    advice.push({
      id: "cross-young-entrepreneur",
      title: "Young Founder: Entity + Retirement Stacking",
      description:
        "An LLC taxed as an S-Corp can save 15.3% self-employment tax on profits above a reasonable salary. Combined with a Solo 401(k) ($24,500 employee + 25% employer match up to $72,000 total for 2026) at Fidelity or Schwab (zero fees vs. expensive employer 401(k) plans), you could shelter $40K-$72K/year from taxes.",
      actionSteps: [
        "If net profit exceeds $60K, evaluate S-Corp election (Form 2553)",
        "Pay a 'reasonable salary' (40-60% of net profit) and take rest as distributions",
        "Open a Solo 401(k) at Fidelity or Schwab (free) — much lower fees than typical 401(k) plans",
        "Track every business expense: home office, vehicle, equipment, software, meals (50%)",
        "Review 360financialliteracy.org for CPA-vetted business tax strategies",
      ],
      category: "tax",
      priority: "high",
      icon: "🏗️",
    });
  }

  // ──── MID-CAREER + MARRIED + WEALTH BUILDING → ASSET LOCATION ────
  if (age >= 35 && age < 55 && filingStatus === "married" && goals.includes("wealth-building")) {
    advice.push({
      id: "cross-asset-location",
      title: "Asset Location: Right Investments, Right Accounts",
      description:
        "90% of investment returns are driven by your stock vs. bond allocation — not individual picks. But WHERE you hold them matters too. Place bonds/REITs in tax-deferred accounts (401k/IRA), growth stocks in Roth (tax-free gains), and tax-efficient index funds in taxable accounts. Per Kiplinger, this can add 0.5-1% annually — $100K+ over 20 years.",
      actionSteps: [
        "List all accounts by tax treatment: tax-deferred, Roth, taxable",
        "Move bonds and REITs into 401(k)/Traditional IRA",
        "Concentrate growth stocks and aggressive funds in Roth",
        "Use passive index funds in taxable accounts — 60% US S&P 500, 30% global, 10% bonds",
        "Keep total investment fees under 0.1% — transaction fees should be $0",
        "Use Bankrate.com's investment fee calculator to see how fees erode returns over time",
      ],
      category: "investing",
      priority: "high",
      icon: "🎯",
    });
  }

  // ──── YOUNG + LOW INCOME + RETIREMENT → SAVER'S CREDIT ────
  if (age < 35 && lowIncome && goals.includes("retirement")) {
    advice.push({
      id: "cross-savers-credit",
      title: "Saver's Credit: Up to $1,000 Back for Saving",
      description:
        "Per IRS.gov, the Saver's Credit gives you a dollar-for-dollar tax credit of up to $1,000 ($2,000 married filing jointly) for contributing to a retirement account. At your income, you may qualify for the 50% rate — a $2,000 IRA contribution = $1,000 tax credit. This is free money from the government for saving.",
      actionSteps: [
        "Contribute at least $2,000 to a Roth or Traditional IRA before tax deadline",
        "Claim on Form 8880 when filing taxes",
        "2026 limits: check IRS.gov for updated AGI thresholds (2024: $23,000 single for 50% rate)",
        "Non-refundable — you need tax liability to benefit",
        "Full-time students are not eligible — but part-time students may qualify",
      ],
      category: "retirement",
      priority: "high",
      icon: "🎁",
    });
  }

  // ──── TRADES + HOMEBUYING ────
  if (career === "trades" && goals.includes("home-buying")) {
    advice.push({
      id: "cross-trades-homebuying",
      title: "Skilled Trades: Sweat Equity Home Strategy",
      description:
        "Your trade skills are a financial superpower for real estate. A fixer-upper with your own labor can add $30K-$100K+ in value. But run the full cost analysis: buying has 10-15% transaction costs round trip, 1% annual maintenance, property tax, and insurance.",
      actionSteps: [
        "Consider FHA 203(k) loans — finance purchase + renovation in one mortgage",
        "Look for below-market properties needing work you can do yourself",
        "Check VA loan eligibility if you served — 0% down, no PMI",
        "Run rent vs. buy math including all hidden costs before committing",
        "Use CFPB's homebuyer tools at consumerfinance.gov/owning-a-home",
      ],
      category: "savings",
      priority: "medium",
      icon: "🔨",
    });
  }

  // ──── HEALTHCARE + HIGH INCOME ────
  if (career === "healthcare" && highIncome) {
    advice.push({
      id: "cross-healthcare-high-income",
      title: "Physician High-Earner Tax Planning",
      description:
        "Healthcare pros face unique challenges: high income, massive debt, late career starts. (1) Don't refinance federal loans if pursuing PSLF. (2) Your employer likely offers 403(b) AND 457(b) — that's $49,000/year in tax-deferred space for 2026. (3) HSA is your best friend: triple tax benefit.",
      actionSteps: [
        "Max both 403(b) AND 457(b) if employer offers both ($49,000 total for 2026)",
        "Max HSA — invest it in index funds, don't spend it (reimburse yourself years later from receipts)",
        "Don't refinance federal student loans until PSLF is ruled out",
        "Backdoor Roth IRA since income exceeds direct contribution limits ($7,500 for 2026)",
        "If private practice: consider cash-balance pension plan ($100K+ annual deductions)",
      ],
      category: "tax",
      priority: "high",
      icon: "⚕️",
    });
  }

  // ──── STUDENT + INVESTING ────
  if (career === "student" && goals.includes("investing") && age < 30) {
    advice.push({
      id: "cross-student-investing",
      title: "Student Investor: Your 40-Year Edge",
      description:
        "Even $100/month during school gives you a massive head start. At 8% returns: $100/month from 25 grows to $350K by 65. Starting at 35? Only $175K. The Rule of 72 (Investor.gov): at 8%, your money doubles every 9 years. You can't time the market — just start automatic monthly investing now.",
      actionSteps: [
        "Open a Roth IRA at Fidelity, Schwab, or Vanguard (no minimums)",
        "Auto-invest $50-$200/month into VOO (S&P 500) or a target-date fund",
        "Roth contributions can be withdrawn anytime penalty-free — backup emergency fund",
        "You need earned income to contribute — W-2, 1099, or TA/RA stipend counts",
        "Take Khan Academy's free personal finance courses to build financial literacy",
        "Use Investor.gov's investing quizzes and calculators to test your knowledge",
      ],
      category: "investing",
      priority: "high",
      icon: "📈",
    });
  }

  // ──── 50+ AND RETIREMENT ────
  if (age >= 50 && goals.includes("retirement")) {
    advice.push({
      id: "cross-50plus-retirement-timing",
      title: "The $100K+ Social Security Decision",
      description:
        "Each year you delay Social Security past 62 (up to 70) increases your benefit by ~8%. For $2,500/month benefit at 67: claiming at 62 = $1,750/month, at 70 = $3,100/month. Over 20 years: $324,000 difference. If married, the higher earner should generally delay to 70.",
      actionSteps: [
        "Create an account at SSA.gov to see projected benefits at 62, 67, and 70",
        "If married, coordinate spousal benefits — higher earner delays to 70",
        "Catch-up contributions: extra $8,000/year for 401(k) if 50+; $11,250 if ages 60-63 (SECURE 2.0)",
        "IRA catch-up: extra $1,100/year for 50+",
        "Run a projection at FireCalc.com, Bankrate.com, or T. Rowe Price Retirement Income Calculator",
        "Plan withdrawal order: taxable first, then tax-deferred, then Roth last",
      ],
      category: "retirement",
      priority: "high",
      icon: "📊",
    });
  }

  // ──── CREATIVE + TAX ────
  if (career === "creative" && (goals.includes("tax-optimization") || incomeIdx >= 2)) {
    advice.push({
      id: "cross-creative-tax",
      title: "Creative Professional Tax Strategies",
      description:
        "Freelance income gets hit with 15.3% self-employment tax on top of income tax. But you have powerful deductions: home office ($5/sq ft, up to $1,500), equipment (Section 179), health insurance premiums (100% deductible), and the 20% QBI deduction.",
      actionSteps: [
        "Track expenses with Hurdlr or QuickBooks Self-Employed",
        "Deduct: home office, equipment, software, professional development, travel",
        "Quarterly estimated taxes (Form 1040-ES) to avoid penalties",
        "If earning $60K+ net, evaluate S-Corp election to cut SE tax",
        "Open Solo 401(k) or SEP IRA to shelter income — Fidelity/Schwab, zero fees",
        ...(freeFileOk
          ? ["Use IRS Free File at irs.gov/freefile (your AGI is under the $84K cap)"]
          : ["Skip IRS Free File — your AGI exceeds the $84K cap; use FreeTaxUSA ($0 federal) or hire a CPA who specializes in self-employed creatives"]),
      ],
      category: "tax",
      priority: "high",
      icon: "🎨",
    });
  }

  // ──── HSA ADVICE FOR ANYONE WITH HDHP POTENTIAL ────
  if (goals.includes("tax-optimization") || goals.includes("retirement")) {
    advice.push({
      id: "cross-hsa-strategy",
      title: "HSA: The Most Powerful Tax Account Nobody Uses Right",
      description:
        "The HSA is the ONLY account with triple tax benefits: tax-deductible going in, grows tax-free, comes out tax-free for medical expenses. The average American spends $280K on healthcare over their lifetime. The strategy: pay medical bills out of pocket now, invest your HSA in index funds, save receipts, and reimburse yourself years later (there's no time limit). After 65, HSA works like a traditional IRA for any expense.",
      actionSteps: [
        "You must have a High Deductible Health Plan (HDHP) to contribute",
        "2026 limits: $4,300 single / $8,550 family (check IRS.gov for final numbers)",
        "DON'T use your HSA debit card — pay medical bills out of pocket and invest the HSA",
        "Save every medical receipt — you can reimburse yourself tax-free years or decades later",
        "Invest HSA in index funds (Fidelity HSA has the best investment options)",
        "After 65, you can withdraw for any purpose (taxed like traditional IRA) or tax-free for medical",
      ],
      category: "tax",
      priority: "medium",
      icon: "🏥",
    });
  }

  // ──── KIDS PLANNING: TAX & FINANCIAL ADVICE ────
  if (profile.kidsPlanning && profile.kidsPlanning.wantsKids !== "no") {
    const kp = profile.kidsPlanning;
    const yearsUntilKids = (kp.plannedAge || 30) - age;
    const numKids = kp.numberOfKids || 1;
    const isSoon = yearsUntilKids <= 3;
    const isPlanning = yearsUntilKids > 3;

    // City-specific childcare cost estimate
    const childcare = estimateChildcareMonthly(
      profile.targetMetroId,
      profile.jobState || state,
      numKids
    );
    const numericIncome = profile.expectedIncome3yr || profile.averageHistoricalIncome || profile.w2Data?.grossIncome || 0;
    const monthlyIncome = numericIncome ? Math.round(numericIncome / 12) : 0;
    const childcarePctOfIncome = monthlyIncome ? Math.round((childcare.monthly / monthlyIncome) * 100) : 0;

    // Child Tax Credit & Dependent Care
    advice.push({
      id: "cross-kids-tax-credits",
      title: `Planning for ${numKids > 1 ? numKids + ' Children' : 'a Child'}: Tax Credits Worth $2,000-$8,000+/Year`,
      description:
        `With ${numKids} child${numKids > 1 ? 'ren' : ''} planned${isSoon ? ' soon' : ` in ~${yearsUntilKids} years`}, here's what changes tax-wise: The Child Tax Credit is $2,000/child/year (up to $4,000 proposed for 2026). The Dependent Care FSA lets you set aside $5,000 pre-tax for childcare. Combined with the Child and Dependent Care Credit (up to $2,100), you could save $${(numKids * 2000 + 5000).toLocaleString()}+/year in taxes.`,
      actionSteps: [
        `Child Tax Credit: $2,000 per child under 17 — ${numKids} kid${numKids > 1 ? 's' : ''} = $${(numKids * 2000).toLocaleString()}/year (check IRS.gov for 2026 updates)`,
        "Dependent Care FSA: set aside $5,000 pre-tax for daycare, preschool, or after-school care",
        "Child and Dependent Care Credit: up to 35% of $3,000 ($6,000 for 2+ kids) in childcare expenses",
        filingStatus === "married"
          ? "Filing jointly: both spouses must have earned income to claim dependent care benefits"
          : "Head of Household filing status: lower tax brackets and higher standard deduction than Single",
        "Earned Income Tax Credit (EITC): with kids, the credit can be worth up to $7,830 for 3+ children",
        "Use IRS.gov's Interactive Tax Assistant to check your eligibility for all child-related credits",
      ],
      category: "tax",
      priority: isSoon ? "high" : "medium",
      icon: "👶",
    });

    // ─── NEW: Rebalance budget for city-specific childcare costs ───
    advice.push({
      id: "cross-kids-childcare-rebalance",
      title: `Rebalance Your Budget: Childcare Will Cost ~$${childcare.monthly.toLocaleString()}/Month in ${childcare.locationLabel}`,
      description:
        `Center-based ${numKids > 1 ? `care for ${numKids} children` : 'infant/toddler care'} in ${childcare.locationLabel} averages ~$${childcare.monthly.toLocaleString()}/month ($${childcare.annual.toLocaleString()}/year)${childcarePctOfIncome ? ` — about ${childcarePctOfIncome}% of your current gross income` : ''}. ${isSoon ? "This hits your cash flow within months of birth." : `You have ~${yearsUntilKids} years to absorb this into your spending plan.`} Treat it like a second mortgage payment and rebalance now so it doesn't derail savings, retirement contributions, or housing decisions. Source: Care.com 2024 Cost of Care, ChildCare Aware of America.`,
      actionSteps: [
        `Budget line item: $${childcare.monthly.toLocaleString()}/month for childcare starting ~3 months after birth (most centers don't take infants under 6-12 weeks)`,
        `Pre-fund a "childcare runway" account with 3 months of costs (~$${(childcare.monthly * 3).toLocaleString()}) before the due date so you're never scrambling`,
        `Max the Dependent Care FSA at $5,000/year — saves ~$1,500-$2,000 in taxes, lowering your effective childcare cost to ~$${(childcare.annual - 1750).toLocaleString()}/year`,
        childcarePctOfIncome >= 25
          ? `Childcare will be ${childcarePctOfIncome}% of income — model nanny share, in-home daycare, or one parent reducing hours; the math often beats a full-time center`
          : `Compare options: nanny ($${Math.round(childcare.monthly * 1.5).toLocaleString()}+/mo), nanny share ($${Math.round(childcare.monthly * 0.85).toLocaleString()}/mo), in-home daycare ($${Math.round(childcare.monthly * 0.75).toLocaleString()}/mo), center ($${childcare.monthly.toLocaleString()}/mo)`,
        `Re-run housing math: a ${childcare.locationLabel} mortgage + $${childcare.monthly.toLocaleString()} childcare can mean rent-and-invest beats buying for the next 3-5 years — see the Rent vs Buy calculator`,
        `Protect retirement contributions: do NOT cut your 401(k) match to fund childcare; instead trim discretionary spending or delay a home purchase`,
        `Apply for waitlists 6-12 months before you need a spot — top-tier centers in ${childcare.locationLabel} are typically full`,
        `Check employer benefits: backup care (Bright Horizons, Care.com), childcare subsidies, on-site daycare — many large employers offer $5K-$10K/year in subsidies`,
      ],
      category: "savings",
      priority: isSoon ? "high" : "medium",
      icon: "💰",
    });

    // Financial preparation
    advice.push({
      id: "cross-kids-financial-prep",
      title: isSoon
        ? `Baby Coming Soon: Build Your Financial Safety Net Now`
        : `${yearsUntilKids}-Year Countdown: Financial Prep for Parenthood`,
      description:
        `The USDA estimates raising a child costs $233,000-$310,000 from birth to age 17 (not including college). ${isSoon ? "Start preparing now:" : "You have time to prepare:"} in ${childcare.locationLabel} childcare alone runs ~$${childcare.annual.toLocaleString()}/year per child. ${numKids > 1 ? `With ${numKids} children planned, these costs multiply.` : ''} The good news: smart planning can offset much of this through tax benefits and early savings.`,
      actionSteps: [
        isSoon
          ? `Boost emergency fund to 6 months of expenses NOW — parental leave may reduce income, and childcare adds ~$${childcare.monthly.toLocaleString()}/month`
          : `Target saving $${Math.round(childcare.monthly / 2).toLocaleString()}/month over the next ${yearsUntilKids} years so the ~$${childcare.monthly.toLocaleString()}/month childcare bill is half pre-funded by birth`,
        "Review health insurance: add maternity coverage if not included, compare family plan costs",
        "Check employer benefits: paid parental leave, childcare subsidies, adoption assistance",
        `Start a 529 plan early — even $200/month from birth grows to ~$86,000 by age 18 at 8% returns`,
        numKids > 1
          ? "For multiple children: 529 beneficiaries can be changed between siblings — one plan can serve all"
          : "529 plan funds can roll to the child's Roth IRA ($35K lifetime cap per SECURE 2.0) if unused",
        "Life insurance: get term coverage BEFORE pregnancy — premiums are lowest when young and healthy",
        "Create or update your will and name guardians — use FreeWill.com or a local estate attorney",
      ],
      category: "savings",
      priority: isSoon ? "high" : "medium",
      icon: "🍼",
    });


    // Education savings if planning
    if (isPlanning || goals.includes("education-fund")) {
      const yearsOfGrowth = (kp.plannedAge || 30) - age + 18;
      advice.push({
        id: "cross-kids-education-savings",
        title: `Start a 529 Now: ${yearsOfGrowth} Years of Tax-Free Growth`,
        description:
          `You have a unique advantage: starting a 529 plan ${yearsUntilKids > 0 ? 'before your child is even born' : 'early'}. You can open a 529 with yourself as beneficiary and change it to your child later — no penalty. At $300/month with ${yearsOfGrowth} years of growth at 8%, that's ~$${Math.round(300 * ((Math.pow(1 + 0.08/12, yearsOfGrowth * 12) - 1) / (0.08/12)) / 1000)}K for education. ${numKids > 1 ? 'You can change the beneficiary between children as needed.' : ''}`,
        actionSteps: [
          "Open a 529 plan now with yourself as beneficiary — change to your child after birth",
          "Check your state's tax deduction: many states offer $2,000-$10,000 deductions for 529 contributions",
          "Best national plans: Utah my529 (Vanguard funds, lowest fees) or Nevada 529",
          `Auto-invest $200-$500/month — even small amounts compound significantly over ${yearsOfGrowth} years`,
          "529 covers: tuition, room & board, books, computers, and up to $10K/year for K-12 private school",
          "SECURE 2.0: unused 529 funds can roll to beneficiary's Roth IRA ($35K lifetime, after 15 years)",
        ],
        category: "education",
        priority: "medium",
        icon: "🎓",
      });
    }
  }

  // ──── I-BONDS & INFLATION PROTECTION (any income, investing goals) ────
  if (goals.includes("investing") || goals.includes("emergency-fund")) {
    advice.push({
      id: "cross-ibonds-inflation",
      title: "I-Bonds & TIPS: Government-Backed Inflation Protection",
      description:
        "Series I Savings Bonds (from TreasuryDirect.gov) adjust their rate with inflation — your purchasing power is guaranteed. You can buy up to $10,000/year per person ($15K with tax refund method). These are ideal for medium-term savings (1-5 years) like a down payment fund. TIPS (Treasury Inflation-Protected Securities) offer similar protection for larger amounts in a brokerage account.",
      actionSteps: [
        "Buy I-Bonds at TreasuryDirect.gov — $10,000/year limit per SSN",
        "I-Bonds can't be redeemed in the first year; penalty of 3 months interest if redeemed before 5 years",
        "For amounts over $10K, consider TIPS ETFs like SCHP or TIP in a brokerage",
        "Good for: down payment savings, education fund, or supplement to emergency fund",
        "Interest on I-Bonds is exempt from state and local tax (per Investor.gov)",
      ],
      category: "savings",
      priority: "low",
      icon: "🏦",
    });
  }

  return advice;
}