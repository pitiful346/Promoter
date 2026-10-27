import { ExtractedEventDraft } from "@/core/domain/ingestion";
import { EVENT_CATEGORIES, LotusEvent, TicketStatus } from "@/core/domain/event";

export class EventNormalizer {
  /**
   * Normalizes an ExtractedEventDraft into a clean Partial<LotusEvent>
   */
  normalize(draft: ExtractedEventDraft, defaultOrgId = "system_ingestion"): Partial<LotusEvent> {
    const cleanTitle = this.sanitizeText(draft.title);
    const cleanDescription = this.sanitizeText(draft.description || "");
    const startDateIso = this.normalizeDateToLisbonIso(draft.start_date);
    const endDateIso = draft.end_date ? this.normalizeDateToLisbonIso(draft.end_date) : undefined;
    const category = this.normalizeCategory(draft.category, cleanTitle + " " + cleanDescription);
    const { priceMin, isFree } = this.normalizePrice(draft.price_min, draft.is_free, cleanDescription);

    let ticketStatus: TicketStatus = "AVAILABLE";
    if (draft.status === "CANCELLED") {
      ticketStatus = "CANCELLED";
    } else if (isFree) {
      ticketStatus = "AVAILABLE";
    } else if (!draft.ticket_url && (!priceMin || priceMin === 0)) {
      ticketStatus = "SOON";
    }

    return {
      name: cleanTitle,
      description: cleanDescription,
      categoria: [category],
      start_date: startDateIso,
      end_date: endDateIso,
      location: draft.city || "Porto",
      venue_name: draft.venue_name || "",
      coordenadas: draft.coordenadas,
      image: draft.image_url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
      is_free: isFree,
      price_min: priceMin,
      ticket_status: ticketStatus,
      ticket_url: this.sanitizeUrl(draft.ticket_url),
      organization_id: defaultOrgId,
      status: "DRAFT",
    };
  }

  /**
   * Parses date string ensuring Europe/Lisbon compatibility and ISO output
   */
  normalizeDateToLisbonIso(dateStr: string): string {
    if (!dateStr) return new Date().toISOString();

    try {
      const parsed = new Date(dateStr);
      if (isNaN(parsed.getTime())) {
        return new Date().toISOString();
      }
      return parsed.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  /**
   * Maps external text/genre to canonical Lotus categories
   */
  normalizeCategory(explicitCategory?: string, fullContextText = ""): (typeof EVENT_CATEGORIES)[number] {
    const textToAnalyze = `${explicitCategory || ""} ${fullContextText}`.toLowerCase();

    if (
      textToAnalyze.includes("techno") ||
      textToAnalyze.includes("club") ||
      textToAnalyze.includes("dj set") ||
      textToAnalyze.includes("house") ||
      textToAnalyze.includes("disco") ||
      textToAnalyze.includes("rave") ||
      textToAnalyze.includes("noite")
    ) {
      return "Noite & Clubbing";
    }

    if (
      textToAnalyze.includes("concerto") ||
      textToAnalyze.includes("festival") ||
      textToAnalyze.includes("música") ||
      textToAnalyze.includes("rock") ||
      textToAnalyze.includes("jazz") ||
      textToAnalyze.includes("fado") ||
      textToAnalyze.includes("indie") ||
      textToAnalyze.includes("banda")
    ) {
      return "Música & Festivais";
    }

    if (
      textToAnalyze.includes("exposição") ||
      textToAnalyze.includes("museu") ||
      textToAnalyze.includes("galeria") ||
      textToAnalyze.includes("arte") ||
      textToAnalyze.includes("cultura") ||
      textToAnalyze.includes("cinema")
    ) {
      return "Artes & Cultura";
    }

    if (
      textToAnalyze.includes("vinho") ||
      textToAnalyze.includes("degustação") ||
      textToAnalyze.includes("gastronomia") ||
      textToAnalyze.includes("jantar") ||
      textToAnalyze.includes("food") ||
      textToAnalyze.includes("chef")
    ) {
      return "Gastronomia & Vinhos";
    }

    if (
      textToAnalyze.includes("conferência") ||
      textToAnalyze.includes("workshop") ||
      textToAnalyze.includes("tech") ||
      textToAnalyze.includes("startups") ||
      textToAnalyze.includes("networking")
    ) {
      return "Tech & Negócios";
    }

    if (
      textToAnalyze.includes("teatro") ||
      textToAnalyze.includes("stand-up") ||
      textToAnalyze.includes("comédia") ||
      textToAnalyze.includes("peça")
    ) {
      return "Teatro & Stand-up";
    }

    if (
      textToAnalyze.includes("corrida") ||
      textToAnalyze.includes("yoga") ||
      textToAnalyze.includes("maratona") ||
      textToAnalyze.includes("fitness") ||
      textToAnalyze.includes("futebol")
    ) {
      return "Desporto & Fitness";
    }

    return "Música & Festivais";
  }

  /**
   * Normalizes prices and free flags
   */
  normalizePrice(
    priceMin?: number,
    isFreeExplicit?: boolean,
    contextText = ""
  ): { priceMin: number; isFree: boolean } {
    if (isFreeExplicit === true) {
      return { priceMin: 0, isFree: true };
    }

    const lower = contextText.toLowerCase();
    if (
      lower.includes("entrada livre") ||
      lower.includes("entrada gratuita") ||
      lower.includes("gratuito") ||
      lower.includes("free entry")
    ) {
      return { priceMin: 0, isFree: true };
    }

    if (typeof priceMin === "number" && priceMin > 0) {
      return { priceMin, isFree: false };
    }

    // Try extracting price from text e.g. "15€" or "15 EUR"
    const priceMatch = contextText.match(/(\d+(?:[.,]\d{1,2})?)\s*(?:€|eur|euros)/i);
    if (priceMatch) {
      const parsed = parseFloat(priceMatch[1].replace(",", "."));
      if (!isNaN(parsed) && parsed > 0) {
        return { priceMin: parsed, isFree: false };
      }
    }

    return { priceMin: 0, isFree: false };
  }

  /**
   * Strips HTML tags and excessive whitespace
   */
  sanitizeText(text: string): string {
    return text
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Sanitizes URL
   */
  sanitizeUrl(url?: string): string | undefined {
    if (!url) return undefined;
    try {
      const u = new URL(url);
      if (u.protocol === "http:" || u.protocol === "https:") {
        return u.href;
      }
    } catch {}
    return undefined;
  }
}

export const eventNormalizer = new EventNormalizer();
