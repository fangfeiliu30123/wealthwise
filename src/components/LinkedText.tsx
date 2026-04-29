import React from "react";
import { Link } from "react-router-dom";
import { getTermMatcher } from "@/lib/glossary-data";

interface LinkedTextProps {
  text: string;
}

/**
 * Renders text with financial terms automatically linked to glossary pages.
 * Each term is only linked once per text block to avoid visual clutter.
 */
const LinkedText: React.FC<LinkedTextProps> = ({ text }) => {
  const matchers = getTermMatcher();
  const linkedSlugs = new Set<string>();
  
  // Find all matches with positions
  const matches: { start: number; end: number; phrase: string; slug: string }[] = [];
  
  for (const { phrase, slug } of matchers) {
    if (linkedSlugs.has(slug)) continue;
    
    // Find first occurrence
    const idx = text.indexOf(phrase);
    if (idx === -1) continue;
    
    // Check this position isn't already covered by a longer match
    const overlaps = matches.some(
      (m) => idx >= m.start && idx < m.end || (idx + phrase.length > m.start && idx + phrase.length <= m.end)
    );
    if (overlaps) continue;
    
    matches.push({ start: idx, end: idx + phrase.length, phrase, slug });
    linkedSlugs.add(slug);
  }
  
  if (matches.length === 0) {
    return <>{text}</>;
  }
  
  // Sort matches by position
  matches.sort((a, b) => a.start - b.start);
  
  // Build segments
  const segments: React.ReactNode[] = [];
  let lastEnd = 0;
  
  for (const match of matches) {
    if (match.start > lastEnd) {
      segments.push(text.slice(lastEnd, match.start));
    }
    segments.push(
      <Link
        key={match.start}
        to={`/glossary/${match.slug}`}
        className="underline decoration-dotted decoration-primary/50 underline-offset-2 hover:decoration-primary hover:text-primary transition-colors"
      >
        {match.phrase}
      </Link>
    );
    lastEnd = match.end;
  }
  
  if (lastEnd < text.length) {
    segments.push(text.slice(lastEnd));
  }
  
  return <>{segments}</>;
};

export default LinkedText;
