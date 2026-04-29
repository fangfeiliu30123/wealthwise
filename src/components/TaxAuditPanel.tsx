import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, FileText } from "lucide-react";
import { TaxAudit } from "@/lib/tax-calc";
import LinkedText from "./LinkedText";

interface TaxAuditPanelProps {
  audit: TaxAudit;
  jobState?: string;
}

const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;
const pct = (n: number, digits = 2) => `${(n * 100).toFixed(digits)}%`;

const TaxAuditPanel = ({ audit, jobState }: TaxAuditPanelProps) => {
  const [open, setOpen] = useState(false);
  const { gross, preTax, fedTaxableBase, stateTaxableBase, ficaBase, federal, state, fica, totalTax, netAfterTax, combinedMarginalRate, combinedEffectiveRate } = audit;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22 }}
      className="glass-card rounded-xl mb-8 border border-primary/20 overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-6 hover:bg-secondary/10 transition-colors text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-primary" />
          <h3 className="font-heading font-bold text-lg">Tax Calculation Audit</h3>
          <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            Show your work
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Tax</div>
            <div className="font-mono font-bold text-foreground">{fmt(totalTax)} <span className="text-muted-foreground text-xs">({pct(combinedEffectiveRate, 1)})</span></div>
          </div>
          <ChevronDown size={20} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-5">
              {/* Top-line summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <SummaryCell label="Gross Wages" value={fmt(gross)} />
                <SummaryCell label="Federal Taxable" value={fmt(federal.taxableIncome)} sub={`after $${federal.standardDeduction.toLocaleString()} std ded`} />
                <SummaryCell label="State Taxable" value={fmt(stateTaxableBase)} sub={state.state !== "—" ? state.state : "no state"} />
                <SummaryCell label="FICA Wages" value={fmt(ficaBase)} sub="HSA-exempt" />
              </div>

              {/* Pre-tax adjustments */}
              <Section title="Step 1 · Pre-Tax Adjustments (reduce taxable wages)">
                <Row label="Gross income" value={fmt(gross)} />
                {preTax.planned401k > 0 && (
                  <Row
                    label={<LinkedText text={`− Traditional 401(k) contribution`} />}
                    value={`−${fmt(preTax.planned401k)}`}
                    sub={`Pre-tax for federal & state. Still subject to FICA. (IRS 2024 limit: ${fmt(preTax.max401k)})`}
                  />
                )}
                {preTax.plannedHsa > 0 && (
                  <Row
                    label={<LinkedText text={`− HSA contribution (Section 125 cafeteria)`} />}
                    value={`−${fmt(preTax.plannedHsa)}`}
                    sub={`Pre-tax for federal, state, AND FICA. (2024 self-only limit: ${fmt(preTax.hsaMax)})`}
                  />
                )}
                <Divider />
                <Row label="= Federal taxable wages (before std deduction)" value={fmt(fedTaxableBase)} bold />
                <Row label="= State taxable wages (most states conform)" value={fmt(stateTaxableBase)} bold />
                <Row label="= FICA wages (only HSA reduces this)" value={fmt(ficaBase)} bold />
              </Section>

              {/* Federal */}
              <Section title={`Step 2 · Federal Income Tax · Filing as ${federal.filingStatusLabel}`}>
                <Row label="Federal taxable wages" value={fmt(fedTaxableBase)} />
                <Row label={`− Standard deduction (${federal.filingStatusLabel} 2024)`} value={`−${fmt(federal.standardDeduction)}`} />
                <Row label="= Taxable income" value={fmt(federal.taxableIncome)} bold />
                <div className="mt-2 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1">Bracket-by-bracket</div>
                  {federal.brackets.map((b, i) => (
                    <BracketRow
                      key={i}
                      from={b.sliceFrom}
                      to={b.upTo === Infinity ? null : b.upTo}
                      rate={b.rate}
                      slice={b.sliceAmount}
                      tax={b.taxOnSlice}
                    />
                  ))}
                </div>
                <Divider />
                <Row label="Federal tax owed" value={fmt(federal.totalTax)} bold highlight />
                <Row label="Effective federal rate (vs gross)" value={pct(federal.effectiveRate, 2)} muted />
                <Row label="Marginal federal rate" value={pct(federal.marginalRate, 0)} muted />
              </Section>

              {/* State */}
              <Section title={`Step 3 · State Income Tax · ${state.state}`}>
                {state.type === "none" && (
                  <p className="text-sm text-muted-foreground">{state.state} has no state income tax.</p>
                )}
                {state.type === "default" && (
                  <>
                    <p className="text-xs text-muted-foreground italic">No state selected — using 5% generic estimate.</p>
                    <Row label={`${fmt(state.taxableIncome)} × 5%`} value={fmt(state.totalTax)} bold highlight />
                  </>
                )}
                {state.type === "flat" && (
                  <>
                    <Row label={`${state.state} flat rate`} value={pct(state.flatRate ?? 0, 2)} />
                    <Row label={`${fmt(state.taxableIncome)} × ${pct(state.flatRate ?? 0, 2)}`} value={fmt(state.totalTax)} bold highlight />
                  </>
                )}
                {state.type === "progressive" && state.brackets && (
                  <>
                    <Row label="State taxable wages" value={fmt(state.taxableIncome)} />
                    <div className="mt-2 space-y-1">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1">Bracket-by-bracket</div>
                      {state.brackets.map((b, i) => (
                        <BracketRow
                          key={i}
                          from={b.sliceFrom}
                          to={b.upTo === Infinity ? null : b.upTo}
                          rate={b.rate}
                          slice={b.sliceAmount}
                          tax={b.taxOnSlice}
                        />
                      ))}
                    </div>
                    <Divider />
                    <Row label={`${state.state} tax owed`} value={fmt(state.totalTax)} bold highlight />
                    <Row label="Effective state rate (vs gross)" value={pct(state.effectiveRate, 2)} muted />
                  </>
                )}
              </Section>

              {/* FICA */}
              <Section title="Step 4 · FICA (Social Security + Medicare)">
                <Row
                  label="Social Security: 6.2% on first $168,600"
                  value={`${fmt(fica.socialSecurityWages)} × 6.2% = ${fmt(fica.socialSecurityTax)}`}
                />
                <Row
                  label="Medicare: 1.45% on all FICA wages"
                  value={`${fmt(fica.ficaWages)} × 1.45% = ${fmt(fica.medicareTax)}`}
                />
                {fica.additionalMedicareTax > 0 && (
                  <Row
                    label="Additional Medicare: 0.9% on wages > $200K"
                    value={`${fmt(ficaBase - 200000)} × 0.9% = ${fmt(fica.additionalMedicareTax)}`}
                  />
                )}
                <Divider />
                <Row label="Total FICA" value={fmt(fica.totalFica)} bold highlight />
              </Section>

              {/* Final */}
              <Section title="Step 5 · Final Reconciliation">
                <Row label="Federal tax" value={`−${fmt(federal.totalTax)}`} />
                <Row label={`State tax (${state.state})`} value={`−${fmt(state.totalTax)}`} />
                <Row label="FICA" value={`−${fmt(fica.totalFica)}`} />
                <Divider />
                <Row label="Total tax burden" value={fmt(totalTax)} bold highlight />
                <Row label="Combined effective rate (vs gross)" value={pct(combinedEffectiveRate, 2)} muted />
                <Row label="Combined marginal rate (next dollar)" value={pct(combinedMarginalRate, 2)} muted />
                <Divider />
                <Row label="Take-home before pre-tax savings" value={fmt(netAfterTax)} bold />
                <Row label="− 401(k) (saved, not spent)" value={`−${fmt(preTax.planned401k)}`} muted />
                <Row label="− HSA (saved, not spent)" value={`−${fmt(preTax.plannedHsa)}`} muted />
                <Divider />
                <Row label="Net cash for housing, savings, lifestyle" value={fmt(netAfterTax - preTax.planned401k - preTax.plannedHsa)} bold highlight />
              </Section>

              {/* Assumptions / disclaimers */}
              <Section title="Assumptions & Notes">
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-5">
                  <li>2024 IRS brackets and standard deduction. No itemized deductions, no above-the-line adjustments beyond 401(k)/HSA.</li>
                  <li>No tax credits modeled (e.g., Child Tax Credit, Saver's Credit, EV credit, dependent care). Add these and your bill can drop further.</li>
                  <li>State tax assumes federal AGI conformity (true for most states; NJ does NOT exempt 401(k) at the state level — adjust if relevant).</li>
                  <li>FICA assumes single-employer W-2 wages (no SS overpayment refund modeling).</li>
                  <li>Local taxes (NYC, Yonkers, OH/PA municipal) are NOT included.</li>
                  <li>NIIT (3.8% on investment income over $200K/$250K) and AMT are NOT modeled — wage income only.</li>
                  <li>Roth IRA is funded with AFTER-tax dollars and does NOT reduce taxable income.</li>
                </ul>
              </Section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const SummaryCell = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
  <div className="rounded-lg bg-secondary/30 border border-border/40 p-3">
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    <div className="font-mono font-bold text-sm text-foreground mt-0.5">{value}</div>
    {sub && <div className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</div>}
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-lg border border-border/40 bg-secondary/10 p-4">
    <h4 className="font-heading font-semibold text-sm text-primary mb-3">{title}</h4>
    <div className="space-y-1">{children}</div>
  </div>
);

const Row = ({ label, value, sub, bold, highlight, muted }: {
  label: React.ReactNode; value: React.ReactNode; sub?: string; bold?: boolean; highlight?: boolean; muted?: boolean;
}) => (
  <div className={`flex items-start justify-between gap-3 py-1 ${highlight ? "bg-primary/5 px-2 rounded -mx-1" : ""}`}>
    <div className="min-w-0 flex-1">
      <div className={`text-xs ${muted ? "text-muted-foreground/70" : "text-foreground/85"} ${bold ? "font-semibold" : ""}`}>
        {label}
      </div>
      {sub && <div className="text-[10px] text-muted-foreground/60 mt-0.5">{sub}</div>}
    </div>
    <div className={`text-xs font-mono shrink-0 ${muted ? "text-muted-foreground/70" : "text-foreground"} ${bold ? "font-bold" : ""} ${highlight ? "text-primary" : ""}`}>
      {value}
    </div>
  </div>
);

const Divider = () => <div className="h-px bg-border/40 my-1.5" />;

const BracketRow = ({ from, to, rate, slice, tax }: { from: number; to: number | null; rate: number; slice: number; tax: number }) => (
  <div className="flex items-center justify-between text-[11px] font-mono py-0.5 border-b border-border/20 last:border-0">
    <div className="text-muted-foreground">
      ${from.toLocaleString()}–{to === null ? "∞" : `$${to.toLocaleString()}`} <span className="text-foreground/70">@ {(rate * 100).toFixed(rate < 0.05 ? 2 : 0)}%</span>
    </div>
    <div className="text-foreground/85">
      ${Math.round(slice).toLocaleString()} → <span className="font-semibold text-foreground">${Math.round(tax).toLocaleString()}</span>
    </div>
  </div>
);

export default TaxAuditPanel;
