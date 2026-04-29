import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Pitfall } from "@/lib/advice/pitfalls";
import LinkedText from "./LinkedText";

interface Props {
  pitfalls: Pitfall[];
}

const SEVERITY_STYLES: Record<Pitfall["severity"], { border: string; chip: string; label: string }> = {
  high: { border: "border-l-destructive", chip: "bg-destructive/15 text-destructive border-destructive/30", label: "High risk" },
  medium: { border: "border-l-warning", chip: "bg-warning/15 text-warning border-warning/30", label: "Watch out" },
  low: { border: "border-l-muted-foreground", chip: "bg-secondary text-muted-foreground border-border", label: "Easy to overlook" },
};

const PitfallsSection = ({ pitfalls }: Props) => {
  const [open, setOpen] = useState<Set<string>>(new Set());

  if (pitfalls.length === 0) return null;

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <section className="mb-10">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
        <AlertTriangle size={14} />
        Common Pitfalls For Your Profile
      </h3>
      <p className="text-sm text-muted-foreground mb-5">
        Mistakes that people in your situation tend to make — flagged early so you can sidestep them.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        {pitfalls.map((p, i) => {
          const isOpen = open.has(p.id);
          const styles = SEVERITY_STYLES[p.severity] || SEVERITY_STYLES.low;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card rounded-xl p-4 border-l-4 ${styles.border}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{p.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${styles.chip}`}>
                      {styles.label}
                    </span>
                  </div>
                  <h4 className="font-heading font-semibold text-base leading-snug mb-1.5">{p.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <LinkedText text={p.description} />
                  </p>

                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="overflow-hidden mt-3 pt-3 border-t border-border/50 space-y-3"
                    >
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                          Why it applies to you
                        </span>
                        <p className="text-sm text-foreground/90 leading-relaxed">
                          <LinkedText text={p.whyYou} />
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary/80 block mb-1">
                          How to avoid it
                        </span>
                        <p className="text-sm text-foreground/90 leading-relaxed">
                          <LinkedText text={p.fix} />
                        </p>
                      </div>
                    </motion.div>
                  )}

                  <button
                    onClick={() => toggle(p.id)}
                    className="mt-3 text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                  >
                    {isOpen ? <>Show less <ChevronUp size={14} /></> : <>How to avoid it <ChevronDown size={14} /></>}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default PitfallsSection;
