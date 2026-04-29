import { Link } from "react-router-dom";
import { GLOSSARY } from "@/lib/glossary-data";
import { ArrowLeft, BookOpen, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const Glossary = () => {
  const [search, setSearch] = useState("");

  const filtered = GLOSSARY.filter(
    (entry) =>
      entry.term.toLowerCase().includes(search.toLowerCase()) ||
      entry.shortDef.toLowerCase().includes(search.toLowerCase())
  );

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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <div className="flex items-center gap-2 text-primary mb-2">
              <BookOpen size={20} />
              <span className="text-sm font-semibold uppercase tracking-wider">Financial Glossary</span>
            </div>
            <h1 className="text-3xl font-heading font-bold mb-2">
              Financial Terms Explained
            </h1>
            <p className="text-muted-foreground">
              Plain-English explanations with real-world examples for every financial concept in your plan.
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search terms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Terms Grid */}
          <div className="grid gap-3">
            {filtered.map((entry, i) => (
              <motion.div
                key={entry.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  to={`/glossary/${entry.slug}`}
                  className="glass-card rounded-xl p-4 block hover:border-primary/50 border border-transparent transition-colors group"
                >
                  <h3 className="font-heading font-semibold group-hover:text-primary transition-colors">
                    {entry.term}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{entry.shortDef}</p>
                </Link>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No terms match "{search}"</p>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Glossary;
