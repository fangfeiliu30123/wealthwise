import { useParams, Link } from "react-router-dom";
import { GLOSSARY } from "@/lib/glossary-data";
import { ArrowLeft, BookOpen, CheckCircle2, Lightbulb, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const GlossaryTerm = () => {
  const { slug } = useParams<{ slug: string }>();
  const entry = GLOSSARY.find((g) => g.slug === slug);

  if (!entry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold mb-2">Term Not Found</h1>
          <Link to="/" className="text-primary hover:underline">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const relatedEntries = (entry.relatedTerms || [])
    .map((slug) => GLOSSARY.find((g) => g.slug === slug))
    .filter(Boolean);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <h1 className="font-heading font-bold text-lg gold-text">WealthWise</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <BookOpen size={14} />
              <Link to="/glossary" className="hover:text-primary transition-colors">Financial Glossary</Link>
              <span>/</span>
              <span className="text-foreground">{entry.term}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-3">{entry.term}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">{entry.shortDef}</p>
          </div>

          {/* Explanation */}
          <section className="glass-card rounded-xl p-6 mb-6">
            <h2 className="font-heading font-semibold text-lg mb-3 flex items-center gap-2">
              <BookOpen size={18} className="text-primary" />
              How It Works
            </h2>
            <div className="text-muted-foreground leading-relaxed space-y-3">
              {entry.explanation.split("\n\n").map((para, i) => (
                <p key={i} className="whitespace-pre-line">
                  {para.split(/(\*\*[^*]+\*\*)/g).map((chunk, j) =>
                    chunk.startsWith("**") && chunk.endsWith("**") ? (
                      <strong key={j} className="text-foreground font-semibold">{chunk.slice(2, -2)}</strong>
                    ) : (
                      <span key={j}>{chunk}</span>
                    )
                  )}
                </p>
              ))}
            </div>
          </section>

          {/* Benefits */}
          <section className="glass-card rounded-xl p-6 mb-6">
            <h2 className="font-heading font-semibold text-lg mb-3 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-400" />
              Why It Matters
            </h2>
            <div className="space-y-2">
              {entry.benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                  <p className="text-muted-foreground text-sm leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Example */}
          <section className="glass-card rounded-xl p-6 mb-6 border-l-4 border-l-primary">
            <h2 className="font-heading font-semibold text-lg mb-3 flex items-center gap-2">
              <Lightbulb size={18} className="text-yellow-400" />
              Real-World Example
            </h2>
            <p className="text-muted-foreground leading-relaxed italic">{entry.example}</p>
          </section>

          {/* Related Terms */}
          {relatedEntries.length > 0 && (
            <section className="mb-8">
              <h2 className="font-heading font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
                Related Concepts
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {relatedEntries.map((related) => related && (
                  <Link
                    key={related.slug}
                    to={`/glossary/${related.slug}`}
                    className="glass-card rounded-xl p-4 hover:border-primary/50 border border-transparent transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-heading font-semibold text-sm group-hover:text-primary transition-colors">
                          {related.term}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{related.shortDef}</p>
                      </div>
                      <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary shrink-0 ml-2" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* All terms link */}
          <div className="text-center pt-4 border-t border-border">
            <Link
              to="/glossary"
              className="text-sm text-primary hover:underline"
            >
              Browse All Financial Terms →
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default GlossaryTerm;
