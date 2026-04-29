import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trash2, CheckCircle2, Clock, Circle, Calendar, Target, Plus } from "lucide-react";
import { toast } from "sonner";

type Status = "todo" | "in_progress" | "done";

interface Action {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: Status;
  priority: string;
  target_metric: string | null;
  deadline: string | null;
  source_advice_title: string | null;
  source_advice_snippet: string | null;
  completed_at: string | null;
  created_at: string;
}

const STORAGE_KEY = "wealthwise_actions";

const COLUMNS: { key: Status; label: string; icon: React.ReactNode; accent: string }[] = [
  { key: "todo", label: "To Do", icon: <Circle size={16} />, accent: "border-l-muted-foreground" },
  { key: "in_progress", label: "In Progress", icon: <Clock size={16} />, accent: "border-l-info" },
  { key: "done", label: "Done", icon: <CheckCircle2 size={16} />, accent: "border-l-primary" },
];

const PRIORITY_BADGE: Record<string, string> = {
  high: "bg-destructive/15 text-destructive",
  medium: "bg-info/15 text-info",
  low: "bg-muted text-muted-foreground",
};

function daysRemaining(deadline: string | null): { text: string; cls: string } {
  if (!deadline) return { text: "No deadline", cls: "text-muted-foreground" };
  const ms = new Date(deadline).getTime() - Date.now();
  const days = Math.ceil(ms / 86400000);
  if (days < 0) return { text: `${Math.abs(days)}d overdue`, cls: "text-destructive" };
  if (days === 0) return { text: "Due today", cls: "text-destructive" };
  if (days <= 7) return { text: `${days}d left`, cls: "text-info" };
  return { text: `${days}d left`, cls: "text-muted-foreground" };
}

function loadActions(): Action[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Action[]) : [];
  } catch {
    return [];
  }
}

function saveActions(actions: Action[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
  } catch (e) {
    console.error("Failed to save actions", e);
  }
}

const Actions = () => {
  const [actions, setActions] = useState<Action[]>(() => loadActions());

  // Refresh from storage in case another tab updated it.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setActions(loadActions());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const updateStatus = useCallback((id: string, status: Status) => {
    setActions((prev) => {
      const next = prev.map((a) =>
        a.id === id
          ? { ...a, status, completed_at: status === "done" ? new Date().toISOString() : null }
          : a
      );
      saveActions(next);
      return next;
    });
    if (status === "done") toast.success("Nice — one more done.");
  }, []);

  const remove = useCallback((id: string) => {
    setActions((prev) => {
      const next = prev.filter((a) => a.id !== id);
      saveActions(next);
      return next;
    });
  }, []);

  const grouped: Record<Status, Action[]> = { todo: [], in_progress: [], done: [] };
  for (const a of actions) grouped[a.status].push(a);

  const totals = { total: actions.length, done: grouped.done.length };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={16} /> Roadmap
            </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="font-heading font-bold text-lg">Action Tracker</h1>
          </div>
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {totals.done} of {totals.total} done
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {actions.length === 0 ? (
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
              <Plus size={20} className="text-muted-foreground" />
            </div>
            <h2 className="font-heading font-bold text-xl mb-2">No actions yet</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Generate your financial roadmap, then add the recommended actions to your tracker.
            </p>
            <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg gold-gradient text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
              Go to roadmap
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {COLUMNS.map((col) => (
              <section key={col.key} className="bg-card border border-border rounded-xl p-4 min-h-[300px]">
                <header className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    {col.icon}
                    <h2 className="font-heading font-semibold">{col.label}</h2>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                    {grouped[col.key].length}
                  </span>
                </header>

                <div className="space-y-3">
                  <AnimatePresence>
                    {grouped[col.key].map((a) => {
                      const dr = daysRemaining(a.deadline);
                      return (
                        <motion.article
                          key={a.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`bg-background border border-border border-l-4 ${col.accent} rounded-lg p-3 group`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-sm leading-snug">{a.title}</h3>
                            <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${PRIORITY_BADGE[a.priority] || PRIORITY_BADGE.medium}`}>
                              {a.priority}
                            </span>
                          </div>
                          {a.description && (
                            <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{a.description}</p>
                          )}
                          {a.target_metric && (
                            <div className="flex items-center gap-1.5 text-xs text-foreground mb-1">
                              <Target size={11} className="text-muted-foreground" />
                              <span className="font-medium">{a.target_metric}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-xs mb-2">
                            <Calendar size={11} className="text-muted-foreground" />
                            <span className={dr.cls}>{dr.text}</span>
                          </div>
                          {a.source_advice_title && (
                            <p className="text-[11px] text-muted-foreground italic border-t border-border pt-2 mt-2">
                              From: {a.source_advice_title}
                            </p>
                          )}

                          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border">
                            {col.key !== "todo" && (
                              <button onClick={() => updateStatus(a.id, "todo")} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                                ← To Do
                              </button>
                            )}
                            {col.key !== "in_progress" && (
                              <button onClick={() => updateStatus(a.id, "in_progress")} className="text-[11px] text-info hover:opacity-80 transition-opacity">
                                {col.key === "todo" ? "Start →" : "← In Progress"}
                              </button>
                            )}
                            {col.key !== "done" && (
                              <button onClick={() => updateStatus(a.id, "done")} className="text-[11px] text-primary font-semibold hover:opacity-80 transition-opacity">
                                Done ✓
                              </button>
                            )}
                            <button
                              onClick={() => remove(a.id)}
                              className="ml-auto text-muted-foreground/60 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                              aria-label="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </motion.article>
                      );
                    })}
                  </AnimatePresence>
                  {grouped[col.key].length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-8">Nothing here yet.</p>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Actions;
