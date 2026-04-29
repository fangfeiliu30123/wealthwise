import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { MetroArea } from "@/lib/metro-data";
import { UserProfile } from "@/lib/types";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Calculator, TrendingUp, Home, DollarSign, Info, Target } from "lucide-react";

interface RentVsBuyCalculatorProps {
  profile: UserProfile;
  metro: MetroArea;
}

function estimateAnnualIncome(incomeRange: string | undefined): number {
  if (!incomeRange) return 60000;
  if (incomeRange.includes("Under")) return 25000;
  if (incomeRange.includes("30,000 - $50,000")) return 40000;
  if (incomeRange.includes("50,000 - $75,000")) return 62500;
  if (incomeRange.includes("75,000 - $100,000")) return 87500;
  if (incomeRange.includes("100,000 - $150,000")) return 125000;
  if (incomeRange.includes("150,000 - $250,000")) return 200000;
  if (incomeRange.includes("250,000")) return 350000;
  return 60000;
}

function getMarginalTaxRate(income: number, filingStatus?: string): number {
  const brackets = filingStatus === "married"
    ? [
        { limit: 23200, rate: 0.10 },
        { limit: 94300, rate: 0.12 },
        { limit: 201050, rate: 0.22 },
        { limit: 383900, rate: 0.24 },
        { limit: 487450, rate: 0.32 },
        { limit: 731200, rate: 0.35 },
        { limit: Infinity, rate: 0.37 },
      ]
    : [
        { limit: 11600, rate: 0.10 },
        { limit: 47150, rate: 0.12 },
        { limit: 100525, rate: 0.22 },
        { limit: 191950, rate: 0.24 },
        { limit: 243725, rate: 0.32 },
        { limit: 609350, rate: 0.35 },
        { limit: Infinity, rate: 0.37 },
      ];
  for (const b of brackets) {
    if (income <= b.limit) return b.rate;
  }
  return 0.37;
}

const RentVsBuyCalculator = ({ profile, metro }: RentVsBuyCalculatorProps) => {
  const annualIncome = estimateAnnualIncome(profile.income);

  const [homePrice, setHomePrice] = useState(metro.medianHomePrice);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [mortgageRate, setMortgageRate] = useState(6.8);
  const [loanTermYears, setLoanTermYears] = useState(30);
  const [monthlyRent, setMonthlyRent] = useState(metro.averageRent);
  const [annualRentIncrease, setAnnualRentIncrease] = useState(3);
  const [yearsToStay, setYearsToStay] = useState(10);
  const [investmentReturn, setInvestmentReturn] = useState(7);
  const [maintenancePct, setMaintenancePct] = useState(1);
  const [monthlyHOA, setMonthlyHOA] = useState(0);
  const [appreciationScenario, setAppreciationScenario] = useState<"low" | "normal" | "high">("normal");

  const appreciationRate = useMemo(() => {
    const base = metro.appreciationRate;
    switch (appreciationScenario) {
      case "low": return Math.max(0, base - 2);
      case "high": return base + 2;
      default: return base;
    }
  }, [metro.appreciationRate, appreciationScenario]);

  const results = useMemo(() => {
    const downPayment = homePrice * (downPaymentPct / 100);
    const loanAmount = homePrice - downPayment;
    const monthlyRate = mortgageRate / 100 / 12;
    const numPayments = loanTermYears * 12;
    const monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);

    const propertyTaxMonthly = (homePrice * metro.propertyTaxRate / 100) / 12;
    const insuranceMonthly = metro.homeInsuranceAnnual / 12;
    const maintenanceMonthly = (homePrice * maintenancePct / 100) / 12;
    const pmiMonthly = downPaymentPct < 20 ? (loanAmount * 0.005) / 12 : 0;

    const totalMonthlyBuy = monthlyMortgage + propertyTaxMonthly + insuranceMonthly + maintenanceMonthly + pmiMonthly + monthlyHOA;

    const federalMarginalRate = getMarginalTaxRate(annualIncome, profile.filingStatus);
    const effectiveTaxRate = federalMarginalRate + (metro.stateIncomeTaxRate / 100);

    // Build year-by-year projection
    const chartData = [];
    let buyerEquity = downPayment;
    let renterWealth = downPayment; // renter invests the down payment
    let remainingLoan = loanAmount;
    let currentRent = monthlyRent;
    let currentHomeValue = homePrice;
    let totalBuyCost = downPayment;
    let totalRentCost = 0;

    const monthlyInvestReturn = Math.pow(1 + investmentReturn / 100, 1 / 12) - 1;

    for (let year = 1; year <= Math.min(yearsToStay, 30); year++) {
      for (let month = 0; month < 12; month++) {
        // Buyer: pay mortgage, build equity
        const interestPayment = remainingLoan * monthlyRate;
        const principalPayment = monthlyMortgage - interestPayment;
        remainingLoan -= principalPayment;

        const taxSavings = (interestPayment + propertyTaxMonthly) * effectiveTaxRate;
        const netBuyCost = totalMonthlyBuy - taxSavings;
        totalBuyCost += netBuyCost;

        // Renter: pay rent, invest difference
        totalRentCost += currentRent;
        const monthlySavings = Math.max(0, netBuyCost - currentRent);
        // If renting is cheaper, renter invests the savings
        if (currentRent < netBuyCost) {
          renterWealth += (netBuyCost - currentRent);
        } else {
          // If buying is cheaper, buyer "saves" but we still track
        }
        renterWealth *= (1 + monthlyInvestReturn);
      }

      currentHomeValue *= (1 + appreciationRate / 100);
      currentRent *= (1 + annualRentIncrease / 100);

      buyerEquity = currentHomeValue - remainingLoan;
      // Subtract selling costs (6% realtor + 2% closing)
      const netBuyerWealth = buyerEquity - (currentHomeValue * 0.08);

      chartData.push({
        year,
        buyWealth: Math.round(netBuyerWealth),
        rentWealth: Math.round(renterWealth),
      });
    }

    const finalBuyWealth = chartData[chartData.length - 1]?.buyWealth || 0;
    const finalRentWealth = chartData[chartData.length - 1]?.rentWealth || 0;
    const advantage = finalBuyWealth - finalRentWealth;
    const breakeven = chartData.findIndex(d => d.buyWealth >= d.rentWealth) + 1;

    return {
      monthlyMortgage: Math.round(monthlyMortgage),
      totalMonthlyBuy: Math.round(totalMonthlyBuy),
      monthlyRent,
      chartData,
      finalBuyWealth,
      finalRentWealth,
      advantage,
      breakeven: breakeven > 0 ? breakeven : null,
      downPayment,
      pmiMonthly: Math.round(pmiMonthly),
      propertyTaxMonthly: Math.round(propertyTaxMonthly),
      insuranceMonthly: Math.round(insuranceMonthly),
      maintenanceMonthly: Math.round(maintenanceMonthly),
      taxSavingsMonthly: Math.round((monthlyMortgage * 0.7 + propertyTaxMonthly) * effectiveTaxRate),
    };
  }, [homePrice, downPaymentPct, mortgageRate, loanTermYears, monthlyRent, annualRentIncrease, yearsToStay, investmentReturn, maintenancePct, monthlyHOA, metro, annualIncome, profile.filingStatus, appreciationRate]);

  const buyWins = results.advantage > 0;

  const formatCurrency = (n: number) => {
    if (Math.abs(n) >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(0)}K`;
    return `$${n.toLocaleString()}`;
  };

  const SliderInput = ({ label, value, onChange, min, max, step, format, suffix }: {
    label: string; value: number; onChange: (v: number) => void;
    min: number; max: number; step: number; format?: (v: number) => string; suffix?: string;
  }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{format ? format(value) : value}{suffix || ""}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
      />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Calculator className="text-primary" size={24} />
          <h3 className="text-xl font-heading font-bold">Rent vs Buy Calculator</h3>
        </div>
        <p className="text-muted-foreground text-sm">
          Personalized for <span className="text-foreground font-medium">{metro.name}, {metro.state}</span> — 
          median home ${metro.medianHomePrice.toLocaleString()}, property tax {metro.propertyTaxRate}%, 
          {metro.stateIncomeTaxRate > 0 ? ` state income tax ${metro.stateIncomeTaxRate}%` : " no state income tax"}
        </p>
      </div>

      {/* Inputs Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-5 space-y-4">
          <h4 className="font-heading font-semibold flex items-center gap-2">
            <Home size={16} className="text-primary" /> Buying Scenario
          </h4>
          <SliderInput label="Home Price" value={homePrice} onChange={setHomePrice}
            min={100000} max={2000000} step={10000} format={(v) => `$${(v/1000).toFixed(0)}K`} />
          <SliderInput label="Down Payment" value={downPaymentPct} onChange={setDownPaymentPct}
            min={3} max={40} step={1} suffix="%" />
          <SliderInput label="Mortgage Rate" value={mortgageRate} onChange={setMortgageRate}
            min={3} max={10} step={0.1} suffix="%" />
          <SliderInput label="Loan Term" value={loanTermYears} onChange={setLoanTermYears}
            min={15} max={30} step={15} suffix=" years" />
          <SliderInput label="Maintenance" value={maintenancePct} onChange={setMaintenancePct}
            min={0.5} max={2} step={0.1} suffix="% of value" />
          <SliderInput label="Monthly HOA" value={monthlyHOA} onChange={setMonthlyHOA}
            min={0} max={1000} step={50} format={(v) => `$${v}`} />
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Home Appreciation</span>
              <span className="font-medium">{appreciationRate.toFixed(1)}%/yr</span>
            </div>
            <div className="flex gap-1.5">
              {(["low", "normal", "high"] as const).map((scenario) => {
                const rate = scenario === "low" ? Math.max(0, metro.appreciationRate - 2) : scenario === "high" ? metro.appreciationRate + 2 : metro.appreciationRate;
                return (
                  <button
                    key={scenario}
                    onClick={() => setAppreciationScenario(scenario)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
                      appreciationScenario === scenario
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {scenario === "low" ? `Bear ${rate.toFixed(1)}%` : scenario === "high" ? `Bull ${rate.toFixed(1)}%` : `Base ${rate.toFixed(1)}%`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 space-y-4">
          <h4 className="font-heading font-semibold flex items-center gap-2">
            <DollarSign size={16} className="text-primary" /> Renting Scenario
          </h4>
          <SliderInput label="Monthly Rent" value={monthlyRent} onChange={setMonthlyRent}
            min={500} max={5000} step={100} format={(v) => `$${v.toLocaleString()}`} />
          <SliderInput label="Annual Rent Increase" value={annualRentIncrease} onChange={setAnnualRentIncrease}
            min={0} max={8} step={0.5} suffix="%" />
          <SliderInput label="Investment Return (if renting)" value={investmentReturn} onChange={setInvestmentReturn}
            min={3} max={12} step={0.5} suffix="%" />
          <SliderInput label="Years You Plan to Stay" value={yearsToStay} onChange={setYearsToStay}
            min={1} max={30} step={1} suffix=" years" />
        </div>
      </div>

      {/* Monthly Cost Breakdown */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-5">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Monthly Buying Cost</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Mortgage (P&I)</span><span>${results.monthlyMortgage.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Property Tax</span><span>${results.propertyTaxMonthly.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Insurance</span><span>${results.insuranceMonthly.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Maintenance</span><span>${results.maintenanceMonthly.toLocaleString()}</span></div>
            {results.pmiMonthly > 0 && <div className="flex justify-between"><span className="text-muted-foreground">PMI</span><span>${results.pmiMonthly.toLocaleString()}</span></div>}
            {monthlyHOA > 0 && <div className="flex justify-between"><span className="text-muted-foreground">HOA</span><span>${monthlyHOA.toLocaleString()}</span></div>}
            <div className="flex justify-between text-success"><span>Tax Savings (est.)</span><span>-${results.taxSavingsMonthly.toLocaleString()}</span></div>
            <div className="border-t border-border pt-2 flex justify-between font-semibold">
              <span>Net Monthly Cost</span>
              <span>${(results.totalMonthlyBuy - results.taxSavingsMonthly).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Monthly Renting Cost</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Rent</span><span>${monthlyRent.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Renter's Insurance</span><span>~$15</span></div>
            <div className="border-t border-border pt-2 flex justify-between font-semibold">
              <span>Total Monthly Cost</span>
              <span>${(monthlyRent + 15).toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1">
              <Info size={12} className="mt-0.5 shrink-0" />
              The ${formatCurrency(results.downPayment)} down payment gets invested at {investmentReturn}% return instead
            </p>
          </div>
        </div>
      </div>

      {/* Verdict */}
      <div className={`glass-card rounded-xl p-6 border-l-4 ${buyWins ? "border-l-success" : "border-l-primary"}`}>
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp size={20} className={buyWins ? "text-success" : "text-primary"} />
          <h4 className="font-heading font-bold text-lg">
            {buyWins
              ? `Buying wins${results.breakeven ? ` after year ${results.breakeven}` : ` over ${yearsToStay} years`}`
              : `Renting wins over ${yearsToStay} years`}
          </h4>
        </div>
        <p className="text-muted-foreground text-sm mb-2">
          {buyWins
            ? `Buying builds ${formatCurrency(results.advantage)} more wealth than renting and investing the difference.`
            : `Renting and investing saves you ${formatCurrency(Math.abs(results.advantage))} compared to buying.`}
        </p>
        {results.breakeven && (
          <p className="text-sm">
            <span className="text-foreground font-medium">Breakeven point:</span>{" "}
            <span className="text-muted-foreground">Year {results.breakeven} — buying only makes sense if you stay at least this long.</span>
          </p>
        )}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Buyer Net Wealth</p>
            <p className="text-xl font-heading font-bold">{formatCurrency(results.finalBuyWealth)}</p>
            <p className="text-xs text-muted-foreground">After 8% selling costs</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Renter Net Wealth</p>
            <p className="text-xl font-heading font-bold">{formatCurrency(results.finalRentWealth)}</p>
            <p className="text-xs text-muted-foreground">Down payment + savings invested</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card rounded-xl p-5">
        <h4 className="font-heading font-semibold mb-4">Wealth Accumulation Over Time</h4>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={results.chartData}>
              <defs>
                <linearGradient id="buyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="rentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(43, 80%, 55%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(43, 80%, 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="year" tick={{ fill: "hsl(220, 15%, 55%)", fontSize: 12 }} axisLine={false} tickLine={false} label={{ value: "Year", position: "insideBottom", offset: -5, fill: "hsl(220, 15%, 55%)" }} />
              <YAxis tick={{ fill: "hsl(220, 15%, 55%)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ background: "hsl(222, 40%, 10%)", border: "1px solid hsl(222, 25%, 18%)", borderRadius: "8px", color: "hsl(40, 20%, 95%)" }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                labelFormatter={(label) => `Year ${label}`}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="buyWealth" name="Buy & Build Equity" stroke="hsl(160, 60%, 45%)" fill="url(#buyGradient)" strokeWidth={2} />
              <Area type="monotone" dataKey="rentWealth" name="Rent & Invest" stroke="hsl(43, 80%, 55%)" fill="url(#rentGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dynamic Action Plan — connected to calculator values */}
      {(() => {
        const downPayment = homePrice * (downPaymentPct / 100);
        const closingCosts = homePrice * 0.03;
        const totalNeeded = downPayment + closingCosts;
        const yearsToSave = [2, 3, 5];
        const monthlySavingsOptions = yearsToSave.map(y => ({
          years: y,
          monthly: Math.round(totalNeeded / (y * 12)),
        }));

        const annualMortgageInterest = results.monthlyMortgage * 12 * 0.85; // ~85% interest in early years
        const annualPropertyTax = results.propertyTaxMonthly * 12;
        const federalRate = getMarginalTaxRate(annualIncome, profile.filingStatus);
        const stateRate = metro.stateIncomeTaxRate / 100;
        const saltCap = 10000;
        const deductiblePropertyTax = Math.min(annualPropertyTax, saltCap);
        const totalItemizedDeduction = annualMortgageInterest + deductiblePropertyTax;
        const standardDeduction = profile.filingStatus === "married" ? 29200 : 14600;
        const excessDeduction = Math.max(0, totalItemizedDeduction - standardDeduction);
        const annualFederalSavings = Math.round(excessDeduction * federalRate);
        const annualStateSavings = stateRate > 0 ? Math.round(annualMortgageInterest * stateRate) : 0;
        const totalAnnualTaxSavings = annualFederalSavings + annualStateSavings;
        const itemizingWorthIt = totalItemizedDeduction > standardDeduction;

        const housingRatio = Math.round((results.totalMonthlyBuy / (annualIncome / 12)) * 100);

        return (
          <div className="glass-card rounded-xl p-6 border-l-4 border-l-primary space-y-5">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-primary" />
              <h4 className="font-heading font-bold text-lg">Your Buying Action Plan</h4>
            </div>
            <p className="text-muted-foreground text-sm">
              Based on a <span className="text-foreground font-medium">${homePrice.toLocaleString()}</span> home
              with <span className="text-foreground font-medium">{downPaymentPct}% down</span> — here's what you need to do.
            </p>

            {/* Down Payment Savings Target */}
            <div className="bg-secondary/40 rounded-lg p-4 space-y-3">
              <h5 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">💰 Down Payment + Closing Costs</h5>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-heading font-bold">${totalNeeded.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">({downPaymentPct}% down + ~3% closing costs)</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {monthlySavingsOptions.map(({ years, monthly }) => (
                  <div key={years} className="text-center p-2 rounded-lg bg-background/50">
                    <p className="text-lg font-heading font-bold">${monthly.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">/mo for {years} yrs</p>
                    <p className="text-[10px] text-muted-foreground">Buy at age {profile.age + years}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                💡 Park your down payment fund in a <span className="text-foreground font-medium">HYSA or T-Bills (SGOV)</span> — 
                don't invest it in stocks if you're buying within 3 years.
              </p>
            </div>

            {/* Tax Advantages */}
            <div className="bg-secondary/40 rounded-lg p-4 space-y-3">
              <h5 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">🏛️ Tax Advantages of Buying</h5>
              {itemizingWorthIt ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-heading font-bold text-success">${totalAnnualTaxSavings.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">estimated annual tax savings</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mortgage interest deduction</span>
                      <span>${Math.round(annualMortgageInterest).toLocaleString()}/yr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Property tax deduction (SALT cap: $10K)</span>
                      <span>${deductiblePropertyTax.toLocaleString()}/yr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total itemized deductions</span>
                      <span>${Math.round(totalItemizedDeduction).toLocaleString()}/yr</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground text-xs pt-1">
                      <span>vs. Standard deduction</span>
                      <span>${standardDeduction.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-medium text-success pt-1 border-t border-border/50">
                      <span>Federal savings ({(federalRate * 100).toFixed(0)}% bracket)</span>
                      <span>${annualFederalSavings.toLocaleString()}/yr</span>
                    </div>
                    {annualStateSavings > 0 && (
                      <div className="flex justify-between font-medium text-success">
                        <span>State savings ({metro.stateIncomeTaxRate}% rate)</span>
                        <span>${annualStateSavings.toLocaleString()}/yr</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-warning font-medium">⚠️ Itemizing may not beat the standard deduction</p>
                  <p className="text-xs text-muted-foreground">
                    Your estimated itemized deductions (${Math.round(totalItemizedDeduction).toLocaleString()}) are 
                    {totalItemizedDeduction < standardDeduction ? " less" : " about the same as"} the standard deduction (${standardDeduction.toLocaleString()}). 
                    The mortgage interest deduction may not save you extra taxes at this price point.
                  </p>
                </div>
              )}
              {metro.stateIncomeTaxRate === 0 && (
                <p className="text-xs text-success">
                  ✅ {metro.state} has no state income tax — you keep more of every dollar.
                </p>
              )}
            </div>

            {/* Affordability Check */}
            <div className={`bg-secondary/40 rounded-lg p-4 space-y-2 ${housingRatio > 36 ? "border border-destructive/30" : ""}`}>
              <h5 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">📊 Affordability Check</h5>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-heading font-bold ${housingRatio > 36 ? "text-destructive" : housingRatio > 28 ? "text-warning" : "text-success"}`}>
                  {housingRatio}%
                </span>
                <span className="text-xs text-muted-foreground">of gross income goes to housing</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {housingRatio <= 28
                  ? "✅ Under the 28% guideline — this is comfortably affordable."
                  : housingRatio <= 36
                  ? "⚠️ Between 28-36% — doable but tight. Consider a smaller home or larger down payment."
                  : "🚨 Over 36% — this may strain your budget. Consider a lower price point, larger down payment, or waiting to grow your income."}
              </p>
              {downPaymentPct < 20 && (
                <p className="text-xs text-warning mt-1">
                  ⚠️ Under 20% down means PMI (~${results.pmiMonthly}/mo) until you hit 20% equity. Consider saving more.
                </p>
              )}
            </div>
          </div>
        );
      })()}

      {/* Key Considerations */}
      <div className="glass-card rounded-xl p-5 border-l-4 border-l-info">
        <h4 className="font-heading font-semibold mb-2 flex items-center gap-2">
          <Info size={16} className="text-info" /> Key Considerations
        </h4>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li>• <span className="text-foreground font-medium">Transaction costs are 10-15% round-trip</span> — this calculator uses 8% selling costs</li>
          <li>• Expect to spend <span className="text-foreground font-medium">~1% of home value annually</span> on maintenance</li>
          <li>• A home is a <span className="text-foreground font-medium">highly concentrated asset</span> — "Concentration builds wealth, diversification preserves it"</li>
          <li>• Current high rates make renting <span className="text-foreground font-medium">more favorable than historical norms</span></li>
          <li>• This analysis doesn't account for the emotional value of homeownership or forced savings discipline</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default RentVsBuyCalculator;
