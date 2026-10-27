import { ExtractedEventDraft, DeduplicationResult, ImportedEvent } from "@/core/domain/ingestion";
import { LotusEvent } from "@/core/domain/event";

export class EventDeduplicationService {
  /**
   * Compares incoming extracted event against candidate existing events
   */
  evaluate(
    incoming: ExtractedEventDraft,
    candidates: Array<ImportedEvent | LotusEvent>
  ): DeduplicationResult {
    let highestSimilarity = 0.0;
    let duplicateOfId: string | undefined;
    const potentialMatches: Array<{
      id: string;
      title: string;
      start_date: string;
      venue_name?: string;
      similarity: number;
    }> = [];

    const incomingTitle = this.normalizeText(incoming.title);
    const incomingDate = new Date(incoming.start_date).getTime();
    const incomingVenue = this.normalizeText(incoming.venue_name || "");

    for (const cand of candidates) {
      const candTitle = this.normalizeText(
        "normalized_event" in cand
          ? (cand.normalized_event.name || cand.extracted_data?.title || "")
          : (cand.name || "")
      );
      const candDateStr =
        "normalized_event" in cand
          ? (cand.normalized_event.start_date || cand.extracted_data?.start_date || "")
          : (cand.start_date || "");
      const candDate = new Date(candDateStr).getTime();
      const candVenue = this.normalizeText(
        "normalized_event" in cand
          ? (cand.normalized_event.venue_name || cand.extracted_data?.venue_name || "")
          : (cand.venue_name || "")
      );

      // Fast check: if dates differ by more than 24 hours, skip heavy comparison
      const hoursDiff = Math.abs(incomingDate - candDate) / (1000 * 60 * 60);
      if (hoursDiff > 24) continue;

      // 1. Title Similarity (0.0 to 1.0)
      const titleSim = this.computeStringSimilarity(incomingTitle, candTitle);

      // 2. Date Proximity Score (0.0 to 1.0)
      let dateScore = 0.0;
      if (hoursDiff <= 1.0) {
        dateScore = 1.0;
      } else if (hoursDiff <= 4.0) {
        dateScore = 0.8;
      } else if (hoursDiff <= 12.0) {
        dateScore = 0.5;
      }

      // 3. Venue Similarity Score
      let venueScore = 0.0;
      if (incomingVenue && candVenue) {
        if (incomingVenue === candVenue) {
          venueScore = 1.0;
        } else if (incomingVenue.includes(candVenue) || candVenue.includes(incomingVenue)) {
          venueScore = 0.8;
        } else {
          venueScore = this.computeStringSimilarity(incomingVenue, candVenue);
        }
      } else {
        venueScore = 0.5; // neutral when missing
      }

      // Weighted multi-signal score: Title (45%), Date (35%), Venue (20%)
      const totalScore = titleSim * 0.45 + dateScore * 0.35 + venueScore * 0.20;

      if (totalScore > 0.6) {
        potentialMatches.push({
          id: cand.id,
          title: "normalized_event" in cand ? (cand.normalized_event.name || "") : (cand.name || ""),
          start_date: candDateStr,
          venue_name: "normalized_event" in cand ? cand.normalized_event.venue_name : cand.venue_name,
          similarity: parseFloat(totalScore.toFixed(2)),
        });
      }

      if (totalScore >= highestScoreThreshold && totalScore >= highestSimilarity) {
        highestSimilarity = totalScore;
        duplicateOfId = cand.id;
      }
    }

    const roundedSimilarity = parseFloat(highestSimilarity.toFixed(2));
    const isDuplicate = roundedSimilarity >= 0.85;

    return {
      is_duplicate: isDuplicate,
      similarity_score: roundedSimilarity,
      duplicate_of_id: isDuplicate ? duplicateOfId : undefined,
      potential_matches: potentialMatches.sort((a, b) => b.similarity - a.similarity),
    };
  }

  private normalizeText(str: string): string {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  private computeStringSimilarity(s1: string, s2: string): number {
    if (s1 === s2) return 1.0;
    if (!s1 || !s2) return 0.0;

    const words1 = new Set(s1.split(" ").filter((w) => w.length > 2));
    const words2 = new Set(s2.split(" ").filter((w) => w.length > 2));

    if (words1.size === 0 || words2.size === 0) return 0.0;

    let intersection = 0;
    for (const w of words1) {
      if (words2.has(w)) intersection++;
    }

    const union = new Set([...words1, ...words2]).size;
    return union > 0 ? intersection / union : 0.0;
  }
}

const highestScoreThreshold = 0.6;
export const eventDeduplicationService = new EventDeduplicationService();
