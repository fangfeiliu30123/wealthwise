import { UserProfile, AdviceCard } from "../types";
import { isLowIncome, isHighIncome } from "./helpers";

export function generateCareerAdvice(profile: UserProfile): AdviceCard[] {
  const advice: AdviceCard[] = [];
  const { career, age, income } = profile;

  if (career === "tech") {
    advice.push({
      id: "tech-rsu",
      title: "RSU & Stock Option Tax Planning",
      description:
        "RSUs are taxed as ordinary income when they vest — not when granted. If you have $100K in RSUs vesting this year, that's $100K added to your W-2. Many tech workers are surprised by a $25K-$40K tax bill. Plan ahead: increase withholding, sell some shares at vest to cover taxes, and diversify. Concentration builds wealth, but diversification preserves it — don't hold more than 10-15% of your net worth in any single stock.",
      actionSteps: [
        "Set RSU withholding to 'supplemental' rate (22%) or higher if in a high bracket",
        "Create a systematic sell plan: sell a fixed % at each vesting date to diversify",
        "If you have ISOs, understand the AMT implications before exercising",
        "Diversify proceeds into passive index funds — 60% US S&P 500, 30% global equity, 10% bonds",
      ],
      category: "tax",
      priority: "high",
      icon: "💻",
    });
  } else if (career === "healthcare") {
    advice.push({
      id: "health-loans",
      title: "Student Loan Strategy: $200K+ Debt Playbook",
      description:
        "The average medical school graduate has $200K+ in debt. Your strategy depends on your employer: (1) Nonprofit/government → PSLF (10 years of IDR payments, remainder forgiven tax-free). (2) Private practice → Refinance to lowest rate and pay aggressively. Never put PSLF-eligible loans into private refinancing — that kills forgiveness eligibility permanently.",
      actionSteps: [
        "Determine if your employer qualifies for PSLF (nonprofit 501(c)(3) or government)",
        "If PSLF-eligible: enroll in SAVE/IDR plan, submit annual employer certification",
        "If not PSLF-eligible: compare refinancing rates at Credible.com or SoFi",
        "The math: $200K at PSLF with $500/month payments = ~$60K total vs. $200K+ full repayment",
      ],
      category: "debt",
      priority: "high",
      icon: "🎓",
    });
  } else if (career === "entrepreneur") {
    advice.push({
      id: "entre-retirement",
      title: "Solo 401(k): The Entrepreneur's Secret Weapon",
      description:
        "A Solo 401(k) lets you contribute as both employee ($23,000) AND employer (25% of net self-employment income), up to $69,000 total in 2024. Regular 401(k) fees are expensive — a Solo 401(k) at Fidelity or Schwab has zero annual fees. You can also take a loan from it — up to $50K or 50% of balance.",
      actionSteps: [
        "Open a Solo 401(k) at Fidelity or Schwab (free, no annual fees — much cheaper than employer 401k plans)",
        "Make employee contributions by December 31st",
        "Employer contributions can be made until your tax filing deadline (including extensions)",
        "Consider Roth Solo 401(k) contributions if you expect higher future income",
      ],
      category: "retirement",
      priority: "high",
      icon: "🚀",
    });
    advice.push({
      id: "entre-tax-structure",
      title: "Business Entity & Tax Structure Optimization",
      description:
        "Your entity structure directly determines your tax bill. As a sole proprietor, you pay 15.3% self-employment tax on ALL profits. With an S-Corp election, you only pay SE tax on your 'reasonable salary' — potentially saving $10,000-$30,000+/year on $150K+ in profits. Plus the 20% QBI deduction can save another $5,000-$15,000.",
      actionSteps: [
        "If net profit >$60K, model S-Corp election savings with a CPA",
        "Pay yourself a reasonable salary (typically 40-60% of net profit)",
        "Take remaining profits as S-Corp distributions (no SE tax)",
        "Claim the 20% QBI deduction — available for most service businesses under income limits",
      ],
      category: "tax",
      priority: "high",
      icon: "📋",
    });
  } else if (career === "creative") {
    advice.push({
      id: "creative-irregular",
      title: "Irregular Income: Reverse Budget System",
      description:
        "Traditional budgeting is really hard to stick with on variable income. Use reverse budgeting instead: when money comes in, automatically route 30% to taxes, 20% to investments, and live on the rest. Set it and forget it — this removes willpower from the equation. Build a larger emergency fund (6-12 months) since your income has natural gaps.",
      actionSteps: [
        "Open 3 accounts: business checking, tax savings (HYSA), emergency fund",
        "When paid: 30% → tax savings, 20% → investments (automatic), 50% → living expenses",
        "Build emergency fund to 6-12 months of essentials",
        "Make quarterly estimated tax payments (Form 1040-ES) to avoid penalties",
        "If you want to track spending, Monarch is the best budgeting app for detailed tracking",
      ],
      category: "savings",
      priority: "high",
      icon: "🎨",
    });
  } else if (career === "government") {
    advice.push({
      id: "gov-pension-tsp",
      title: "Federal Benefits: Pension + TSP + PSLF Triple Play",
      description:
        "Government employees have one of the most powerful benefit trifectas: (1) FERS pension (1% × years × high-3 salary), (2) TSP with 5% match and the lowest fees in the industry (0.043% — far below even Vanguard), (3) PSLF for student loans after 10 years. These combined can be worth $1M+ over your career.",
      actionSteps: [
        "Contribute at least 5% to TSP for the full employer match",
        "Consider Roth TSP if you expect higher retirement income",
        "Use L (Lifecycle) funds or a C/S/I mix — avoid the G Fund for long-term growth",
        "If you have student loans, certify employment annually for PSLF at PSLF.gov",
        "At 20+ years, your FERS pension alone replaces 20%+ of income",
      ],
      category: "retirement",
      priority: "high",
      icon: "🏛️",
    });
  } else if (career === "student") {
    advice.push({
      id: "student-foundation",
      title: "Build Your Financial Foundation While in School",
      description:
        "School is the perfect time to establish habits that compound for decades. Open a Roth IRA if you have any earned income. Start with $50-$100/month — building the habit matters more than the amount. Build your credit score now with a student card paid in full monthly — a 750+ score saves $50,000+ in lifetime interest.",
      actionSteps: [
        "Open a Roth IRA (requires earned income — W-2 or 1099 counts, scholarships don't)",
        "Get a student credit card (Discover It Student) and set up autopay in full",
        "Don't take more student loans than your expected first-year salary",
        "Set up automatic investing — even $50/month into VTI or a target-date fund",
        "If offered 401(k) at an internship, contribute at least to the match",
      ],
      category: "savings",
      priority: "high",
      icon: "🎓",
    });
  } else if (career === "finance") {
    advice.push({
      id: "finance-deferred-comp",
      title: "Deferred Compensation & Bonus Planning",
      description:
        "Finance professionals often have access to deferred compensation plans (457(b) or non-qualified deferred comp) to defer bonus income to lower-bracket years. Front-load savings aggressively — finance careers can be volatile with sudden layoffs. Build 12+ months of emergency savings.",
      actionSteps: [
        "Max out 401(k) AND any available 457(b) or deferred compensation plan",
        "If you receive bonuses, consider deferring to a low-income year",
        "Build 12+ months of emergency savings — finance layoffs are sudden",
        "Diversify investments outside financial sector (concentration risk)",
        "Use passive index funds for personal investments — 60% US, 30% international, 10% bonds",
      ],
      category: "retirement",
      priority: "high",
      icon: "📊",
    });
  } else if (career === "trades") {
    advice.push({
      id: "trades-retirement",
      title: "Trades: Plan for Physical Career Timeline",
      description:
        "Skilled trades have a physical shelf life — plan for career transition by 50-55. If union, your pension + annuity + 401(k) can be powerful. If non-union, you need to self-fund retirement aggressively. Lock in term life insurance NOW while you're young and healthy — rates jump dramatically after 40.",
      actionSteps: [
        "If union: understand your pension vesting and annuity contributions",
        "If non-union: open a Solo 401(k) or SEP IRA, save 15-25% of income",
        "Get term life insurance now — shop at PolicyGenius.com for competitive rates",
        "Plan for career transition by 50-55 — get certifications for supervision/inspection/teaching",
        "Disability insurance is critical — your body is your income-producing asset",
      ],
      category: "retirement",
      priority: "high",
      icon: "🔧",
    });
  } else if (career === "education") {
    // Use employer name to give specific 403(b) guidance
    const employer = profile.w2Data?.employer || profile.w2History?.[0]?.employer;
    const employerNote = employer
      ? `At ${employer}, your 403(b) plan`
      : "Your school district's 403(b) plan";

    advice.push({
      id: "education-403b-pslf",
      title: "Educator Benefits: 403(b) + 457(b) + PSLF",
      description:
        "Educators can stack 403(b) + 457(b) contributions ($46,000 total in 2024) AND qualify for PSLF. Warning: many school 403(b) plans have terrible high-fee annuity products. Insist on low-cost options — the difference between 0.1% and 1.5% fees on $500K over 20 years is over $100,000.",
      actionSteps: [
        `${employerNote} may default to high-fee annuity products. Log into your benefits portal and look for a self-directed brokerage option or a low-cost provider like Fidelity/Vanguard/TIAA (index funds only).`,
        "If your plan only offers annuities with 1%+ fees, request your employer add a low-cost provider — many states require districts to offer at least one",
        "Also contribute to 457(b) if available — unique advantage: no 10% early withdrawal penalty before 59½",
        "Submit PSLF Employment Certification Form annually at PSLF.gov",
        "Investment fees should be under 0.1% — anything above 1% is a red flag that's costing you $100K+ over your career",
      ],
      category: "retirement",
      priority: "high",
      icon: "📚",
    });
  }

  return advice;
}
