import { useState, useMemo } from "react";
import { METRO_AREAS, MetroArea } from "@/lib/metro-data";
import { MapPin, Search } from "lucide-react";

interface MetroSelectorProps {
  onSelect: (metro: MetroArea) => void;
  selected?: MetroArea | null;
}

const MetroSelector = ({ onSelect, selected }: MetroSelectorProps) => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return METRO_AREAS;
    const q = search.toLowerCase();
    return METRO_AREAS.filter(
      (m) => m.name.toLowerCase().includes(q) || m.state.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search cities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
        {filtered.map((metro) => (
          <button
            key={metro.id}
            onClick={() => onSelect(metro)}
            className={`p-3 rounded-lg border-2 transition-all duration-200 text-left text-sm hover:scale-[1.02] ${
              selected?.id === metro.id
                ? "border-primary glow-gold bg-secondary"
                : "border-border bg-card hover:border-muted-foreground"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-primary shrink-0" />
              <span className="font-medium truncate">{metro.name}</span>
            </div>
            <span className="text-xs text-muted-foreground">{metro.state} · ${(metro.medianHomePrice / 1000).toFixed(0)}K</span>
          </button>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-4">No cities found</p>
      )}
    </div>
  );
};

export default MetroSelector;
