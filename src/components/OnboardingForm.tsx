import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserProfile, CAREER_OPTIONS, GOAL_OPTIONS, FILING_STATUS_OPTIONS, US_STATES, Career, FinancialGoal, FilingStatus, KidsPlanning, SpouseProfile, ManualNetWorth } from "@/lib/types";
import { METRO_AREAS, MetroArea } from "@/lib/metro-data";
import { ChevronRight, ChevronLeft, Sparkles, DollarSign, MapPin } from "lucide-react";
import MetroSelector from "./MetroSelector";
import NetWorthStep from "./NetWorthStep";

interface OnboardingFormProps {
  onComplete: (profile: UserProfile) => void;
}

const OnboardingForm = ({ onComplete }: OnboardingFormProps) => {
  const [step, setStep] = useState(0);
  const [career, setCareer] = useState<Career | null>(null);
  const [age, setAge] = useState<number>(30);
  const [expectedIncome, setExpectedIncome] = useState<string>("");
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [filingStatus, setFilingStatus] = useState<FilingStatus | null>(null);
  
  const [selectedMetro, setSelectedMetro] = useState<MetroArea | null>(null);
  const [kidsPlanning, setKidsPlanning] = useState<KidsPlanning>({ wantsKids: "no" });
  const [kidsAge, setKidsAge] = useState<number>(30);
  const [kidsCount, setKidsCount] = useState<number>(1);
  const [jobState, setJobState] = useState<string>("");
  const [stateSearch, setStateSearch] = useState<string>("");
  const [spouseIncome, setSpouseIncome] = useState<string>("");
  const [spouseCareer, setSpouseCareer] = useState<Career | null>(null);
  const [manualNetWorth, setManualNetWorth] = useState<ManualNetWorth>({});

  const toggleGoal = (goal: FinancialGoal) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const advance = () => {
    setStep((s) => Math.min(s + 1, getSteps().length - 1));
  };

  const showMetroStep = goals.includes("home-buying");

  const getSteps = () => {
    const baseSteps = [
      { id: "career", title: "What is your current occupation?", subtitle: "Or the occupation you want to switch into — this helps us tailor advice to your industry." },
      { id: "age", title: "How old are you?", subtitle: "Your age determines the best strategies for your financial timeline." },
      { id: "job-location", title: "Where is your job located?", subtitle: "State taxes vary dramatically — from 0% in Texas/Florida to 13.3% in California. This shapes your take-home pay and tax strategy." },
      { id: "expected-income", title: "What's your expected income for the next 3 years?", subtitle: "Enter your anticipated annual income — this calibrates our forward-looking advice." },
      { id: "kids", title: "Are you planning to have children?", subtitle: "This helps us factor in childcare costs, tax credits, and education savings strategies." },
      { id: "networth", title: "What's your financial snapshot?", subtitle: "Connect Plaid to auto-fill your balances, or enter your assets and liabilities manually. Both work — fields can be combined or skipped." },
      { id: "goals", title: "What are your financial goals?", subtitle: "Tap in order of priority — first selection = top priority. Tap again to remove." },
      { id: "filing", title: "What's your tax filing status?", subtitle: "This affects contribution limits, tax brackets, and strategy recommendations." },
    ];

    if (filingStatus === "married") {
      baseSteps.push({ id: "spouse", title: "Tell us about your spouse", subtitle: "Filing jointly means we plan as a household. Their income and career shape your combined tax bracket, contribution limits, and savings strategy." });
    }

    if (showMetroStep) {
      baseSteps.push({ id: "metro", title: "Where do you want to buy?", subtitle: "We'll compare local home prices, taxes, and rent to build your rent vs buy analysis." });
    }

    return baseSteps;
  };

  const steps = getSteps();
  const totalSteps = steps.length;
  const clampedStep = Math.min(step, totalSteps - 1);
  const currentStepId = steps[clampedStep]?.id;

  const canProceed = () => {
    switch (currentStepId) {
      case "career": return career !== null;
      case "age": return age >= 16 && age <= 100;
      case "job-location": return jobState !== "";
      case "expected-income": return expectedIncome !== "" && Number(expectedIncome.replace(/,/g, "")) > 0;
      case "kids": return kidsPlanning.wantsKids !== null;
      case "w2": return true; // optional
      case "networth": return true; // optional — fully skippable
      case "goals": return goals.length > 0;
      case "filing": return filingStatus !== null;
      case "spouse": return spouseIncome !== "" && Number(spouseIncome.replace(/,/g, "")) >= 0;
      case "metro": return true; // optional
      default: return false;
    }
  };

  const getIncomeRange = (amount: number) => {
    if (amount < 30000) return "Under $30,000";
    if (amount < 50000) return "$30,000 - $50,000";
    if (amount < 75000) return "$50,000 - $75,000";
    if (amount < 100000) return "$75,000 - $100,000";
    if (amount < 150000) return "$100,000 - $150,000";
    if (amount < 250000) return "$150,000 - $250,000";
    return "$250,000+";
  };

  const buildProfile = (): UserProfile => {
    const expectedNum = Number(expectedIncome.replace(/,/g, ""));
    const incomeForRange = expectedNum;

    return {
      career: career!,
      age,
      goals,
      income: incomeForRange ? getIncomeRange(incomeForRange) : undefined,
      expectedIncome3yr: expectedNum || undefined,
      filingStatus: filingStatus || undefined,
      jobState: jobState || undefined,
      targetMetroId: selectedMetro?.id,
      kidsPlanning: kidsPlanning.wantsKids !== "no" ? {
        ...kidsPlanning,
        plannedAge: kidsAge,
        numberOfKids: kidsCount,
      } : undefined,
      spouse: filingStatus === "married" && spouseIncome !== "" ? {
        income: Number(spouseIncome.replace(/,/g, "")) || undefined,
        career: spouseCareer || undefined,
      } : undefined,
      manualNetWorth: Object.keys(manualNetWorth).length > 0 ? manualNetWorth : undefined,
    };
  };

  const handleSubmit = () => {
    if (career && goals.length > 0) {
      onComplete(buildProfile());
    }
  };

  const formatIncomeInput = (value: string) => {
    const digits = value.replace(/[^0-9]/g, "");
    if (!digits) return "";
    return Number(digits).toLocaleString();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="flex gap-2 mb-12">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                i <= clampedStep ? "gold-gradient" : "bg-secondary"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={clampedStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">
              {steps[clampedStep]?.title}
            </h1>
            <p className="text-muted-foreground mb-8 text-lg">
              {steps[clampedStep]?.subtitle}
            </p>

            {/* Step: Career */}
            {currentStepId === "career" && (
              <div className="grid grid-cols-3 gap-3">
                {CAREER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => { setCareer(option.value); setTimeout(advance, 150); }}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left hover:scale-[1.02] ${
                      career === option.value
                        ? "border-primary glow-gold bg-secondary"
                        : "border-border bg-card hover:border-muted-foreground"
                    }`}
                  >
                    <span className="text-2xl block mb-2">{option.icon}</span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Step: Age */}
            {currentStepId === "age" && (
              <div className="space-y-4 max-w-xs mx-auto">
                <div className="flex items-baseline justify-center gap-3">
                  <input
                    type="number"
                    min={16}
                    max={100}
                    value={age === 0 ? "" : age}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "") { setAge(0); return; }
                      const n = parseInt(v, 10);
                      if (!isNaN(n)) setAge(n);
                    }}
                    placeholder="--"
                    className="w-32 text-center text-6xl font-heading font-bold gold-text bg-transparent border-b-2 border-primary/40 focus:border-primary focus:outline-none"
                  />
                  <span className="text-xl text-muted-foreground">years old</span>
                </div>
                <p className="text-sm text-muted-foreground text-center">Enter your current age (16–100)</p>
              </div>
            )}

            {/* Step: Job Location */}
            {currentStepId === "job-location" && (
              <div className="space-y-4">
                <div className="relative">
                  <MapPin size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={stateSearch}
                    onChange={(e) => setStateSearch(e.target.value)}
                    placeholder="Search states..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border-2 border-border focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 max-h-[340px] overflow-y-auto pr-1">
                  {US_STATES
                    .filter((s) => !stateSearch || s.label.toLowerCase().includes(stateSearch.toLowerCase()) || s.value.toLowerCase().includes(stateSearch.toLowerCase()))
                    .map((state) => (
                      <button
                        key={state.value}
                        onClick={() => { setJobState(state.value); setStateSearch(""); setTimeout(advance, 150); }}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 text-left text-sm hover:scale-[1.02] ${
                          jobState === state.value
                            ? "border-primary glow-gold bg-secondary"
                            : "border-border bg-card hover:border-muted-foreground"
                        }`}
                      >
                        <span className="font-bold">{state.value}</span>
                        <span className="text-muted-foreground ml-1 text-xs">{state.label}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Step: Expected Income */}
            {currentStepId === "expected-income" && (
              <div className="space-y-6">
                <div className="relative">
                  <DollarSign size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={expectedIncome}
                    onChange={(e) => setExpectedIncome(formatIncomeInput(e.target.value))}
                    placeholder="e.g. 120,000"
                    className="w-full pl-12 pr-4 py-4 text-2xl font-heading font-bold rounded-xl bg-card border-2 border-border focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Enter your expected average annual income over the next 3 years
                </p>
              </div>
            )}

            {/* Step: Kids Planning */}
            {currentStepId === "kids" && (
              <div className="space-y-8">
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { value: "yes" as const, label: "Yes, planning to", icon: "👶" },
                    { value: "maybe" as const, label: "Maybe / Unsure", icon: "🤔" },
                    { value: "no" as const, label: "No", icon: "🚫" },
                  ]).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setKidsPlanning({ ...kidsPlanning, wantsKids: option.value });
                        if (option.value === "no") setTimeout(advance, 150);
                      }}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-center hover:scale-[1.02] ${
                        kidsPlanning.wantsKids === option.value
                          ? "border-primary glow-gold bg-secondary"
                          : "border-border bg-card hover:border-muted-foreground"
                      }`}
                    >
                      <span className="text-2xl block mb-2">{option.icon}</span>
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>

                {(kidsPlanning.wantsKids === "yes" || kidsPlanning.wantsKids === "maybe") && (
                  <div className="space-y-6 mt-6">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">At what age do you plan to have your first child?</label>
                      <div className="text-center mb-2">
                        <span className="text-4xl font-heading font-bold gold-text">{kidsAge}</span>
                      </div>
                      <input
                        type="range"
                        min={Math.max(age, 18)}
                        max="50"
                        value={kidsAge}
                        onChange={(e) => setKidsAge(Number(e.target.value))}
                        className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{Math.max(age, 18)}</span>
                        <span>50</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">How many children are you planning?</label>
                      <div className="flex gap-3 justify-center">
                        {[1, 2, 3, 4].map((n) => (
                          <button
                            key={n}
                            onClick={() => setKidsCount(n)}
                            className={`w-14 h-14 rounded-lg border-2 text-lg font-bold transition-all duration-200 hover:scale-105 ${
                              kidsCount === n
                                ? "border-primary glow-gold bg-secondary"
                                : "border-border bg-card hover:border-muted-foreground"
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step: Net worth (assets & liabilities) */}
            {currentStepId === "networth" && (
              <NetWorthStep value={manualNetWorth} onChange={setManualNetWorth} />
            )}

            {/* Step: Goals */}
            {currentStepId === "goals" && (
              <div className="grid grid-cols-2 gap-3">
                {GOAL_OPTIONS.map((option) => {
                  const rank = goals.indexOf(option.value);
                  const isSelected = rank !== -1;
                  return (
                    <button
                      key={option.value}
                      onClick={() => toggleGoal(option.value)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left hover:scale-[1.02] relative ${
                        isSelected
                          ? "border-primary glow-gold bg-secondary"
                          : "border-border bg-card hover:border-muted-foreground"
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-2 right-2 w-6 h-6 rounded-full gold-gradient text-primary-foreground text-xs font-bold flex items-center justify-center">
                          {rank + 1}
                        </span>
                      )}
                      <span className="text-2xl block mb-2">{option.icon}</span>
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step: Filing Status */}
            {currentStepId === "filing" && (
              <div className="space-y-3">
                {FILING_STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFilingStatus(option.value);
                      // If user picks "married", we need a spouse step next — never auto-submit here.
                      const willAddSpouseStep = option.value === "married";
                      if (!willAddSpouseStep && step >= totalSteps - 1) {
                        setTimeout(() => { if (career && goals.length > 0) onComplete(buildProfile()); }, 150);
                      } else {
                        setTimeout(advance, 150);
                      }
                    }}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left hover:scale-[1.01] flex items-center gap-4 ${
                      filingStatus === option.value
                        ? "border-primary glow-gold bg-secondary"
                        : "border-border bg-card hover:border-muted-foreground"
                    }`}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <span className="font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Step: Spouse (only if MFJ) */}
            {currentStepId === "spouse" && (
              <div className="space-y-6">
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs text-foreground/80 leading-relaxed">
                  <span className="font-semibold text-primary">Why we ask:</span> When you file jointly, the IRS taxes your combined household income. Your spouse's earnings change your tax bracket, retirement contribution limits (each of you can max a 401(k) and IRA), and our recommended savings split. From here on, all numbers are <span className="font-semibold">household</span> figures.
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/85 mb-2">
                    Spouse's annual gross income
                  </label>
                  <div className="relative">
                    <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={spouseIncome}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, "");
                        setSpouseIncome(raw ? Number(raw).toLocaleString() : "");
                      }}
                      placeholder="e.g. 95,000"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-border bg-card focus:border-primary focus:outline-none transition-colors text-foreground"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    Enter 0 if your spouse doesn't earn income (e.g. stay-at-home parent, in school).
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/85 mb-2">
                    Spouse's occupation <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CAREER_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSpouseCareer(spouseCareer === option.value ? null : option.value)}
                        className={`p-3 rounded-lg border-2 text-left transition-all flex items-center gap-2 ${
                          spouseCareer === option.value
                            ? "border-primary bg-secondary"
                            : "border-border bg-card hover:border-muted-foreground"
                        }`}
                      >
                        <span className="text-lg">{option.icon}</span>
                        <span className="text-xs font-medium truncate">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step: Metro Selection */}
            {currentStepId === "metro" && (
              <MetroSelector
                onSelect={(m) => {
                  setSelectedMetro(m);
                  setTimeout(() => { if (career && goals.length > 0) onComplete({ ...buildProfile(), targetMetroId: m?.id }); }, 200);
                }}
                selected={selectedMetro}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-10">
          <button
            onClick={() => setStep((s) => s - 1)}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg text-muted-foreground hover:text-foreground transition-colors ${
              clampedStep === 0 ? "invisible" : ""
            }`}
          >
            <ChevronLeft size={18} />
            Back
          </button>
          {(() => {
            // Steps that auto-advance on click — no Continue button needed
            const autoAdvanceSteps = ["career", "job-location", "filing", "metro", "w2"];
            if (autoAdvanceSteps.includes(currentStepId || "")) return null;
            // Kids step auto-advances only when user picks "no"
            if (currentStepId === "kids" && kidsPlanning.wantsKids === "no") return null;
            return step < totalSteps - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-3 rounded-lg gold-gradient text-primary-foreground font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                Continue
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-3 rounded-lg gold-gradient text-primary-foreground font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                <Sparkles size={18} />
                Get My Advice
              </button>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default OnboardingForm;