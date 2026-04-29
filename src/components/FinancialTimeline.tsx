import { motion } from "framer-motion";
import LinkedText from "./LinkedText";

export type Horizon = "near" | "mid" | "long" | "legacy";

export interface Milestone {
  age: number;
  label: string;
  detail: string;
  rationale?: string;
  icon: string;
  category: string;
  horizon?: Horizon;
}

const categoryColors: Record<string, string> = {
  retirement: "from-amber-500/20 to-amber-600/5 border-amber-500/40",
  savings: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/40",
  investing: "from-blue-500/20 to-blue-600/5 border-blue-500/40",
  tax: "from-violet-500/20 to-violet-600/5 border-violet-500/40",
  insurance: "from-rose-500/20 to-rose-600/5 border-rose-500/40",
  debt: "from-red-500/20 to-red-600/5 border-red-500/40",
  education: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/40",
  housing: "from-orange-500/20 to-orange-600/5 border-orange-500/40",
};

const categoryDotColors: Record<string, string> = {
  retirement: "bg-amber-500",
  savings: "bg-emerald-500",
  investing: "bg-blue-500",
  tax: "bg-violet-500",
  insurance: "bg-rose-500",
  debt: "bg-red-500",
  education: "bg-cyan-500",
  housing: "bg-orange-500",
};

const HORIZON_META: Record<Horizon, { title: string; subtitle: string; emoji: string }> = {
  near: {
    title: "Near-term game plan",
    subtitle: "Next 0–5 years · what to do now and this year",
    emoji: "🎯",
  },
  mid: {
    title: "5–10 year game plan",
    subtitle: "Setting up the systems that compound through your 30s/40s",
    emoji: "🚀",
  },
  long: {
    title: "10–20 year game plan",
    subtitle: "Wealth-building plays that need a long runway",
    emoji: "📈",
  },
  legacy: {
    title: "20+ year & legacy game plan",
    subtitle: "Retirement, estate, and generational wealth",
    emoji: "🏛️",
  },
};

const HORIZON_ORDER: Horizon[] = ["near", "mid", "long", "legacy"];

interface FinancialTimelineProps {
  milestones: Milestone[];
  currentAge: number;
}

const inferHorizon = (yearsFromNow: number): Horizon => {
  if (yearsFromNow < 5) return "near";
  if (yearsFromNow < 10) return "mid";
  if (yearsFromNow < 20) return "long";
  return "legacy";
};

const FinancialTimeline = ({ milestones, currentAge }: FinancialTimelineProps) => {
  // Group milestones by horizon (fall back to inferring from age if missing).
  const grouped = HORIZON_ORDER.reduce<Record<Horizon, Milestone[]>>(
    (acc, h) => {
      acc[h] = [];
      return acc;
    },
    { near: [], mid: [], long: [], legacy: [] }
  );

  [...milestones]
    .sort((a, b) => a.age - b.age)
    .forEach((m) => {
      const h = m.horizon || inferHorizon(m.age - currentAge);
      grouped[h].push(m);
    });

  return (
    <div className="space-y-10">
      {HORIZON_ORDER.map((h) => {
        const items = grouped[h];
        if (items.length === 0) return null;
        const meta = HORIZON_META[h];

        return (
          <div key={h}>
            {/* Horizon header */}
            <div className="mb-4 pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <span className="text-xl">{meta.emoji}</span>
                <h3 className="font-heading font-bold text-lg gold-text">{meta.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{meta.subtitle}</p>
            </div>

            {/* Milestones in this horizon */}
            <div className="space-y-0 relative">
              <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary/60 via-primary/30 to-transparent" />

              {items.map((m, i) => {
                const isNow = m.age === currentAge;
                const yearsFromNow = m.age - currentAge;
                const colors = categoryColors[m.category] || categoryColors.savings;
                const dotColor = categoryDotColors[m.category] || "bg-primary";

                return (
                  <motion.div
                    key={`${h}-${i}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="relative pl-14 pb-5 last:pb-0"
                  >
                    <div
                      className={`absolute left-3 top-1 w-5 h-5 rounded-full border-2 border-background ${dotColor} flex items-center justify-center z-10 shadow-lg`}
                    >
                      {isNow && <div className="w-2 h-2 rounded-full bg-background" />}
                    </div>

                    <div className="absolute left-[-4px] top-6 text-[10px] font-mono text-muted-foreground w-12 text-center">
                      {isNow ? "NOW" : yearsFromNow > 0 ? `+${yearsFromNow}yr` : `${yearsFromNow}yr`}
                    </div>

                    <div
                      className={`rounded-lg border bg-gradient-to-r ${colors} p-4 hover:scale-[1.01] transition-transform`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-heading font-bold text-sm gold-text">Age {m.age}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-background/50 text-muted-foreground capitalize">
                              {m.category}
                            </span>
                          </div>
                          <h4 className="font-heading font-semibold text-base mt-1"><LinkedText text={m.label} /></h4>
                          <p className="text-muted-foreground text-xs leading-relaxed mt-0.5"><LinkedText text={m.detail} /></p>
                          {m.rationale && (
                            <p className="text-[11px] leading-relaxed mt-2 pt-2 border-t border-border/40 text-foreground/80">
                              <span className="font-semibold text-primary">Why now:</span> <LinkedText text={m.rationale} />
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FinancialTimeline;
