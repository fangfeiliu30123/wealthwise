import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";

import { UserProfile, ConnectedAccountData, AdviceCard, CAREER_OPTIONS, GOAL_OPTIONS } from "@/lib/types";
import { METRO_AREAS } from "@/lib/metro-data";
import { generateAdvice, getPriorityColor, getCategoryLabel } from "@/lib/advice-engine";
import { generatePitfalls } from "@/lib/advice/pitfalls";
import PitfallsSection from "./PitfallsSection";
import { ArrowLeft, TrendingUp, Shield, Lightbulb, Target, CheckCircle2, ChevronDown, ChevronUp, Calendar, Sparkles, Loader2, Wallet, AlertTriangle, Home, ListChecks } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import RentVsBuyCalculator from "./RentVsBuyCalculator";
import LinkedText from "./LinkedText";
import FinancialTimeline, { Milestone } from "./FinancialTimeline";
import IncomeAllocationChart from "./IncomeAllocationChart";
import { computeFunnelSummary } from "@/lib/funnel-summary";
import { supabase } from "@/integrations/supabase/client";
import { invokePlaidFunction } from "@/lib/plaid-functions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function deriveIncome(p: UserProfile): number {
  if (p.expectedIncome3yr) return p.expectedIncome3yr;
  if (p.averageHistoricalIncome) return p.averageHistoricalIncome;
  if (p.w2Data?.grossIncome) return p.w2Data.grossIncome;
  if (!p.income) return 0;
  const map: Record<string, number> = {
    "Under $30,000": 25000, "$30,000 - $50,000": 40000, "$50,000 - $75,000": 62500,
    "$75,000 - $100,000": 87500, "$100,000 - $150,000": 125000,
    "$150,000 - $250,000": 200000, "$250,000+": 300000,
  };
  return map[p.income] || 75000;
}

interface AdviceDashboardProps {
  profile: UserProfile;
  onReset: () => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  savings: <Shield size={16} />,
  investing: <TrendingUp size={16} />,
  debt: <Target size={16} />,
  retirement: <Lightbulb size={16} />,
  tax: <Lightbulb size={16} />,
  insurance: <Shield size={16} />,
  education: <Lightbulb size={16} />,
};

const YEAR_META: Record<number, { label: string; subtitle: string; accent: string }> = {
  1: { label: "Foundation", subtitle: "Do these first. These are your highest-impact moves right now.", accent: "border-primary" },
  2: { label: "Build", subtitle: "Once your foundation is set, layer these on.", accent: "border-info" },
  3: { label: "Optimize", subtitle: "Fine-tune and optimize for long-term growth.", accent: "border-muted-foreground" },
};

// Module-level in-memory cache so navigating away (e.g. to a glossary page) and back
// doesn't refetch or flash a loader. Keyed by a hash of the enriched profile.
const planMemoryCache = new Map<string, Milestone[]>();

function buildPlanKey(profile: UserProfile): string | null {
  try { return `plan:${JSON.stringify(profile)}`; } catch { return null; }
}

function readCachedPlan(key: string | null): Milestone[] | null {
  if (!key) return null;
  if (planMemoryCache.has(key)) return planMemoryCache.get(key)!;
  try {
    const raw = sessionStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.milestones) {
        planMemoryCache.set(key, parsed.milestones);
        return parsed.milestones;
      }
    }
  } catch { /* ignore */ }
  return null;
}


const AdviceDashboard = ({ profile, onReset }: AdviceDashboardProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [accountRefreshKey, setAccountRefreshKey] = useState(0);
  const [accountData, setAccountData] = useState<ConnectedAccountData | null>(null);
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set([1]));
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const toggleCard = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  // Initialize from cache synchronously to avoid any loader flash on remount.
  const initialKey = useMemo(() => buildPlanKey(profile), []); // eslint-disable-line react-hooks/exhaustive-deps
  const initialCached = useMemo(() => readCachedPlan(initialKey), [initialKey]);
  const [milestones, setMilestones] = useState<Milestone[] | null>(initialCached);
  const [milestonesLoading, setMilestonesLoading] = useState(!initialCached);
  const [milestonesError, setMilestonesError] = useState(false);
  const [milestonesErrorMessage, setMilestonesErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>(() => {
    try { return sessionStorage.getItem("advice:activeTab") || "gameplan"; } catch { return "gameplan"; }
  });
  useEffect(() => {
    try { sessionStorage.setItem("advice:activeTab", activeTab); } catch { /* ignore */ }
  }, [activeTab]);
  const [savingActions, setSavingActions] = useState(false);
  const navigate = useNavigate();

  const toggleYear = (year: number) => {
    setExpandedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchAccountData = useCallback(async () => {
    try {
      const { getDeviceId } = await import("@/lib/device-id");
      const data = await invokePlaidFunction<{ summary?: ConnectedAccountData }>("plaid-get-accounts", {
        device_id: getDeviceId(),
      });
      if (data?.summary) {
        setAccountData(data.summary);
      }
    } catch (e) {
      console.error("Failed to fetch account data for advice:", e);
    }
  }, []);

  useEffect(() => {
    fetchAccountData();
  }, [fetchAccountData, accountRefreshKey]);

  // Consolidate Plaid (accountData) with user-entered manualNetWorth.
  // Rule: manual entries win on conflict — they reflect what the user verified.
  const enrichedProfile: UserProfile = useMemo(() => {
    const manual = profile.manualNetWorth || {};
    const plaid = accountData;

    const manualLiquid = manual.liquidSavings;
    const manualInvestTotal =
      (manual.retirementAccounts || 0) +
      (manual.brokerageInvestments || 0) +
      (manual.hsa || 0) +
      (manual.privateInvestments || 0);
    const manualDebtTotal =
      (manual.studentLoans || 0) +
      (manual.carLoans || 0) +
      (manual.creditCardDebt || 0) +
      (manual.mortgageBalance || 0) +
      (manual.businessGuarantee || 0) +
      (manual.otherLiabilities || 0);

    const hasManualInvest = manualInvestTotal > 0;
    const hasManualDebt = Object.keys(manual).some((k) =>
      ["studentLoans", "carLoans", "creditCardDebt", "mortgageBalance", "businessGuarantee", "otherLiabilities"].includes(k)
    );

    const mergedAccountData = plaid || hasManualInvest || hasManualDebt || manualLiquid !== undefined
      ? {
          totalBalance: manualLiquid !== undefined ? manualLiquid : (plaid?.totalBalance || 0),
          totalInvestments: hasManualInvest ? manualInvestTotal : (plaid?.totalInvestments || 0),
          totalDebt: hasManualDebt ? manualDebtTotal : (plaid?.totalDebt || 0),
          debtAccounts: plaid?.debtAccounts || [],
          holdings: plaid?.holdings || [],
          topSpendingCategories: plaid?.topSpendingCategories || [],
          holdingsCount: plaid?.holdingsCount || 0,
          transactionCount: plaid?.transactionCount || 0,
        }
      : undefined;

    return mergedAccountData ? { ...profile, accountData: mergedAccountData } : profile;
  }, [profile, accountData]);

  // Generate AI personalized timeline (aligned with funnel) — uses merged profile.
  // Cached in module memory + sessionStorage so navigating away and back is instant.
  const planCacheKey = useMemo(() => buildPlanKey(enrichedProfile), [enrichedProfile]);

  useEffect(() => {
    let cancelled = false;

    const cached = readCachedPlan(planCacheKey);
    if (cached) {
      setMilestones(cached);
      setMilestonesLoading(false);
      setMilestonesError(false);
      return;
    }

    const fetchPlan = async () => {
      setMilestonesLoading(true);
      setMilestonesError(false);
      setMilestonesErrorMessage(null);
      try {
        const metro = enrichedProfile.targetMetroId
          ? METRO_AREAS.find((m) => m.id === enrichedProfile.targetMetroId) || null
          : null;
        const funnelSummary = computeFunnelSummary(enrichedProfile, metro);
        const { data, error } = await supabase.functions.invoke<{ milestones?: Milestone[] }>(
          "generate-financial-plan",
          { body: { profile: enrichedProfile, funnelSummary } }
        );
        if (error) throw error;
        if (cancelled) return;
        if (data?.milestones) {
          setMilestones(data.milestones);
          if (planCacheKey) {
            planMemoryCache.set(planCacheKey, data.milestones);
            try { sessionStorage.setItem(planCacheKey, JSON.stringify({ milestones: data.milestones })); } catch { /* ignore quota */ }
          }
        }
      } catch (e: any) {
        console.error("Failed to generate AI timeline:", e);
        if (!cancelled) {
          const message = e?.message || "Unable to generate your personalized timeline right now.";
          setMilestonesError(true);
          setMilestonesErrorMessage(message);
          toast.error(message);
        }
      } finally {
        if (!cancelled) setMilestonesLoading(false);
      }
    };
    fetchPlan();
    return () => { cancelled = true; };
  }, [enrichedProfile, navigate, planCacheKey]);

  const advice = generateAdvice(enrichedProfile);
  const pitfalls = generatePitfalls(enrichedProfile);
  const careerLabel = CAREER_OPTIONS.find((c) => c.value === profile.career)?.label;
  const goalLabels = profile.goals.map(
    (g, i) => ({ label: GOAL_OPTIONS.find((o) => o.value === g)?.label, rank: i + 1 })
  );

  const selectedMetro = profile.targetMetroId
    ? METRO_AREAS.find((m) => m.id === profile.targetMetroId) || null
    : null;

  // Group by timeline year
  const yearGroups = new Map<number, AdviceCard[]>();
  for (const card of advice) {
    const y = card.timelineYear || 3;
    if (!yearGroups.has(y)) yearGroups.set(y, []);
    yearGroups.get(y)!.push(card);
  }
  const sortedYears = Array.from(yearGroups.keys()).sort((a, b) => a - b);

  const renderCard = (card: AdviceCard, i: number) => {
    const isOpen = expandedCards.has(card.id);
    const summary = card.description.split(/(?<=[.!?])\s+/)[0] || card.description;
    const topSteps = (card.actionSteps || []).slice(0, 2);
    const restSteps = (card.actionSteps || []).slice(2);
    const hasMore = card.description.length > summary.length || restSteps.length > 0;

    return (
      <motion.div
        key={card.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.06 }}
        className={`glass-card rounded-xl p-5 border-l-4 ${getPriorityColor(card.priority)}`}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">{card.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-1.5 mb-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground flex items-center gap-1">
                {categoryIcons[card.category]}
                {getCategoryLabel(card.category)}
              </span>
              {card.categories?.map((cat) => (
                <span
                  key={cat}
                  className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1"
                >
                  {categoryIcons[cat]}
                  {getCategoryLabel(cat)}
                </span>
              ))}
            </div>
            <h4 className="font-heading font-semibold text-lg mb-2">{card.title}</h4>
            <p className="text-muted-foreground text-sm leading-relaxed mb-3">
              <LinkedText text={summary} />
            </p>
            {topSteps.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-border/50">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary/80">
                  Top {topSteps.length === 1 ? "Priority" : "Priorities"}
                </span>
                {topSteps.map((step, j) => (
                  <div key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 size={14} className="text-primary/60 mt-0.5 shrink-0" />
                    <span><LinkedText text={step} /></span>
                  </div>
                ))}
              </div>
            )}
            {hasMore && (
              <>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="overflow-hidden mt-3 pt-3 border-t border-border/50 space-y-3"
                  >
                    {card.description.length > summary.length && (
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        <LinkedText text={card.description.slice(summary.length).trim()} />
                      </p>
                    )}
                    {restSteps.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          More Action Steps
                        </span>
                        {restSteps.map((step, j) => (
                          <div key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 size={14} className="text-primary/40 mt-0.5 shrink-0" />
                            <span><LinkedText text={step} /></span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
                <button
                  onClick={() => toggleCard(card.id)}
                  className="mt-3 text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                >
                  {isOpen ? <>Show less <ChevronUp size={14} /></> : <>Show details <ChevronDown size={14} /></>}
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const handleSaveToTracker = async () => {
    setSavingActions(true);
    try {
      const adviceForExtraction = advice.map((c) => ({
        id: c.id, title: c.title, description: c.description,
        actionSteps: c.actionSteps, category: c.category, priority: c.priority,
      }));
      const { data, error } = await supabase.functions.invoke("extract-actions", {
        body: { advice: adviceForExtraction },
      });
      if (error) throw error;
      const extracted = (data?.actions || []) as Array<{
        title: string; description: string; category: string; priority: string;
        target_metric: string; deadline_days: number;
        source_advice_id: string | null; source_advice_title: string | null; source_advice_snippet: string | null;
      }>;
      if (extracted.length === 0) {
        toast.error("No actions could be extracted. Try again.");
        return;
      }

      // Store actions locally — no sign-in required.
      const now = new Date().toISOString();
      const rows = extracted.map((a, idx) => ({
        id: `${Date.now()}-${idx}`,
        title: a.title,
        description: a.description,
        category: a.category,
        status: "todo" as const,
        priority: a.priority,
        target_metric: a.target_metric,
        deadline: new Date(Date.now() + a.deadline_days * 86400000).toISOString().slice(0, 10),
        source_advice_id: a.source_advice_id,
        source_advice_title: a.source_advice_title,
        source_advice_snippet: a.source_advice_snippet,
        completed_at: null as string | null,
        created_at: now,
      }));
      try {
        const existingRaw = localStorage.getItem("wealthwise_actions");
        const existing = existingRaw ? JSON.parse(existingRaw) : [];
        localStorage.setItem("wealthwise_actions", JSON.stringify([...rows, ...existing]));
      } catch (storageErr) {
        console.error("localStorage write failed", storageErr);
      }
      toast.success(`Saved ${rows.length} actions to your tracker`);
      navigate("/actions");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Couldn't save actions");
    } finally {
      setSavingActions(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
            Start Over
          </button>
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-bold text-lg gold-text">WealthWise</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Profile Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-6 mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-1">
            Your Financial Roadmap
          </h2>
          {(() => {
            const isMarried = profile.filingStatus === "married";
            const spouseCareerLabel = profile.spouse?.career
              ? CAREER_OPTIONS.find((c) => c.value === profile.spouse!.career)?.label
              : null;
            const spouseIncome = profile.spouse?.income ?? 0;
            const userIncome =
              profile.expectedIncome3yr ||
              profile.averageHistoricalIncome ||
              profile.w2Data?.grossIncome ||
              0;
            const householdIncome = userIncome + spouseIncome;

            if (isMarried) {
              return (
                <>
                  <p className="text-muted-foreground">
                    Tailored for a <span className="text-foreground font-medium">{profile.age}-year-old</span>{" "}
                    <span className="text-foreground font-medium">{careerLabel}</span>
                    {userIncome > 0 && (
                      <> earning <span className="text-foreground font-medium">${userIncome.toLocaleString()}</span></>
                    )}
                    , filing jointly with a {spouseCareerLabel ? <><span className="text-foreground font-medium">{spouseCareerLabel}</span> spouse</> : <>spouse</>}
                    {spouseIncome > 0
                      ? <> who earns <span className="text-foreground font-medium">${spouseIncome.toLocaleString()}</span></>
                      : <> with no current earned income</>}
                    .
                  </p>
                  {householdIncome > 0 && (
                    <p className="text-muted-foreground mt-1">
                      Combined household income:{" "}
                      <span className="text-foreground font-semibold gold-text">
                        ${householdIncome.toLocaleString()}
                      </span>
                      . All recommendations below — tax brackets, contribution limits, savings targets — are calibrated for your <span className="text-foreground font-medium">household</span>, not just you.
                    </p>
                  )}
                </>
              );
            }

            return (
              <p className="text-muted-foreground">
                Tailored for a <span className="text-foreground font-medium">{profile.age}-year-old</span>{" "}
                whose current or near-future occupation is{" "}
                <span className="text-foreground font-medium">{careerLabel}</span>
                {profile.averageHistoricalIncome && (
                  <>, who in the past three years has made an average income of{" "}
                  <span className="text-foreground font-medium">
                    ${profile.averageHistoricalIncome.toLocaleString()}
                  </span></>
                )}
                {!profile.averageHistoricalIncome && profile.expectedIncome3yr && (
                  <>, expecting to earn{" "}
                  <span className="text-foreground font-medium">
                    ${profile.expectedIncome3yr.toLocaleString()}
                  </span>{" "}
                  per year over the next 3 years</>
                )}
              </p>
            );
          })()}
          <p className="text-muted-foreground text-sm mt-1">
            {advice.length} recommendations organized into {sortedYears.length} phases
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {goalLabels.map(({ label, rank }) => (
              <span
                key={rank}
                className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium flex items-center gap-1.5"
              >
                <span className="w-4 h-4 rounded-full gold-gradient text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                  {rank}
                </span>
                {label}
              </span>
            ))}
          </div>
          {profile.w2History && profile.w2History.length > 0 && (
            <p className="text-xs text-muted-foreground mt-3">
              📄 W-2 data from {profile.w2History.length} year{profile.w2History.length > 1 ? "s" : ""}{" "}
              {profile.w2History[0]?.employer && <>({profile.w2History[0].employer})</>} applied
            </p>
          )}
          {!profile.w2History && profile.w2Data?.employer && (
            <p className="text-xs text-muted-foreground mt-3">
              📄 W-2 data from <span className="text-foreground">{profile.w2Data.employer}</span> applied
            </p>
          )}
        </motion.div>

        {/* Tabbed sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  Explore your plan
                </span>
                <span className="h-px w-10 bg-primary/40" />
                <span className="text-xs text-muted-foreground">
                  {profile.goals.includes("home-buying") && selectedMetro ? "5" : "4"} sections — click each one
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground hidden md:inline-flex items-center gap-1">
                <ChevronDown size={12} className="rotate-[-90deg]" />
                Don't stop at Game Plan
              </span>
            </div>
            <TabsList className="w-full grid grid-cols-2 md:grid-cols-5 h-auto bg-card border-2 border-border p-1.5 gap-1.5 rounded-xl shadow-lg">
              <TabsTrigger
                value="gameplan"
                className="tab-accent-gold flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 rounded-lg font-heading font-semibold text-sm transition-all data-[state=inactive]:hover:bg-secondary"
              >
                <Sparkles size={16} />
                <span>Game Plan</span>
              </TabsTrigger>
              <TabsTrigger
                value="income"
                className="tab-accent-emerald flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 rounded-lg font-heading font-semibold text-sm transition-all data-[state=inactive]:hover:bg-secondary"
              >
                <TrendingUp size={16} />
                <span className="hidden sm:inline">Where Income Goes</span>
                <span className="sm:hidden">Income</span>
              </TabsTrigger>
              <TabsTrigger
                value="roadmap"
                className="tab-accent-blue flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 rounded-lg font-heading font-semibold text-sm transition-all data-[state=inactive]:hover:bg-secondary"
              >
                <Calendar size={16} />
                <span>Roadmap</span>
              </TabsTrigger>
              <TabsTrigger
                value="pitfalls"
                className="tab-accent-rose flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 rounded-lg font-heading font-semibold text-sm transition-all data-[state=inactive]:hover:bg-secondary"
              >
                <AlertTriangle size={16} />
                <span>Pitfalls</span>
              </TabsTrigger>
              {profile.goals.includes("home-buying") && selectedMetro && (
                <TabsTrigger
                  value="rentbuy"
                  className="tab-accent-violet flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 rounded-lg font-heading font-semibold text-sm transition-all data-[state=inactive]:hover:bg-secondary"
                >
                  <Home size={16} />
                  <span>Rent vs Buy</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {/* Game Plan tab */}
          <TabsContent value="gameplan" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl p-6 border border-primary/20"
            >
              <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-primary" />
                  <h3 className="font-heading font-bold text-lg">Your Personalized Game Plan</h3>
                </div>
                <button
                  onClick={handleSaveToTracker}
                  disabled={savingActions || advice.length === 0}
                  className="flex items-center gap-2 text-sm sm:text-base font-bold gold-gradient text-primary-foreground px-4 sm:px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-primary/30 ring-2 ring-primary/40"
                >
                  {savingActions ? <Loader2 size={16} className="animate-spin" /> : <ListChecks size={16} />}
                  {savingActions ? "Extracting…" : "Track my actions →"}
                </button>
              </div>

              {milestonesLoading && (
                <div className="flex items-center gap-3 text-muted-foreground py-8 justify-center">
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-sm">Building your personalized timeline...</span>
                </div>
              )}

              {milestonesError && !milestonesLoading && (
                <div className="text-muted-foreground text-sm py-4 text-center space-y-2">
                  <p>{milestonesErrorMessage || "Unable to generate your personalized timeline right now."}</p>
                  <p>The detailed recommendations in the Roadmap tab still have you covered.</p>
                </div>
              )}

              {milestones && !milestonesLoading && (
                <FinancialTimeline milestones={milestones} currentAge={profile.age} />
              )}
            </motion.div>
          </TabsContent>

          {/* Income tab */}
          <TabsContent value="income" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl p-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp size={18} className="text-primary" />
                <h3 className="font-heading font-bold text-lg">Where Your Income Goes</h3>
              </div>
              <IncomeAllocationChart profile={enrichedProfile} metro={selectedMetro} />
            </motion.div>
          </TabsContent>

          {/* Roadmap tab */}
          <TabsContent value="roadmap" className="mt-0">
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary mb-6 flex items-center gap-2">
                <Calendar size={14} />
                Your Financial Roadmap
              </h3>

              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

                <div className="space-y-6">
                  {sortedYears.map((year) => {
                    const meta = YEAR_META[year] || YEAR_META[3];
                    const cards = yearGroups.get(year)!;
                    const isExpanded = expandedYears.has(year);

                    return (
                      <div key={year} className="relative">
                        <div className="hidden md:flex absolute left-3 top-4 w-5 h-5 rounded-full gold-gradient items-center justify-center z-10">
                          <span className="text-[10px] font-bold text-primary-foreground">{year}</span>
                        </div>

                        <div className="md:ml-14">
                          <button
                            onClick={() => toggleYear(year)}
                            className={`w-full text-left glass-card rounded-xl p-4 border-l-4 ${meta.accent} hover:bg-secondary/50 transition-colors`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-heading font-bold text-lg">{meta.label}</h4>
                                <p className="text-muted-foreground text-sm">{meta.subtitle}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                                  {cards.length} item{cards.length !== 1 ? "s" : ""}
                                </span>
                                {isExpanded ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
                              </div>
                            </div>
                          </button>

                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="grid gap-4 md:grid-cols-2 mt-4"
                            >
                              {cards.map((card, i) => renderCard(card, i))}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </TabsContent>

          {/* Pitfalls tab */}
          <TabsContent value="pitfalls" className="mt-0">
            <PitfallsSection pitfalls={pitfalls} />
          </TabsContent>

          {/* Rent vs Buy tab */}
          {profile.goals.includes("home-buying") && selectedMetro && (
            <TabsContent value="rentbuy" className="mt-0">
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full gold-gradient inline-block" />
                  Rent vs Buy Analysis — {selectedMetro.name}, {selectedMetro.state}
                </h3>
                <RentVsBuyCalculator profile={profile} metro={selectedMetro} />
              </section>
            </TabsContent>
          )}
        </Tabs>


        {/* Disclaimer */}
        <div className="text-center text-xs text-muted-foreground py-8 border-t border-border">
          <p>⚠️ This is educational content only and does not constitute financial advice.</p>
          <p className="mt-1">Consult a certified financial advisor for personalized guidance.</p>
        </div>
      </main>
    </div>
  );
};

export default AdviceDashboard;
