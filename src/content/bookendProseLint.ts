/** Bookend prose maintenance lint — duplicate detection across slide pools. */

export type BookendProseSource = {
  id: string;
  texts: string[];
};

const SENTENCE_SPLIT = /(?<=[.!?])\s+/;

/** Normalize for comparison: lowercase, collapse whitespace, strip quotes. */
function normalizeSentence(s: string): string {
  return s
    .replace(/^["']|["']$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Extract sentences with at least minWords words. */
export function extractSentences(text: string, minWords = 8): string[] {
  return text
    .split(SENTENCE_SPLIT)
    .map(normalizeSentence)
    .filter((s) => s.split(/\s+/).filter(Boolean).length >= minWords);
}

/** Fail when the same normalized sentence appears in two or more sources. */
export function findDuplicateSentences(sources: BookendProseSource[], minWords = 8): string[] {
  const bySentence = new Map<string, string[]>();

  for (const source of sources) {
    const seenInSource = new Set<string>();
    for (const text of source.texts) {
      for (const sentence of extractSentences(text, minWords)) {
        if (seenInSource.has(sentence)) continue;
        seenInSource.add(sentence);
        const ids = bySentence.get(sentence) ?? [];
        if (!ids.includes(source.id)) ids.push(source.id);
        bySentence.set(sentence, ids);
      }
    }
  }

  const violations: string[] = [];
  for (const [sentence, ids] of bySentence) {
    if (ids.length < 2) continue;
    const preview = sentence.length > 72 ? `${sentence.slice(0, 69)}…` : sentence;
    violations.push(`duplicate (${ids.join(" + ")}): "${preview}"`);
  }
  return violations.sort();
}
