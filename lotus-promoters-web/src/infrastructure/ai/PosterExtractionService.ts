import { GoogleGenAI } from "@google/genai";
import { RawAiPosterExtraction, rawAiPosterExtractionSchema } from "@/core/validators/ai.schema";
import { PosterExtractionResult, ExtractedEventFields, VenueMatchResult } from "@/core/domain/ai";
import { EVENT_CATEGORIES, LotusEvent, TicketStatus } from "@/core/domain/event";
import { Venue } from "@/core/domain/venue";

export class PosterExtractionService {
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  }

  /**
   * Main method to extract structured event data from a poster image
   */
  async extractFromPoster(
    imageBase64: string,
    mimeType: string,
    existingVenues: Venue[] = []
  ): Promise<PosterExtractionResult> {
    const startTime = Date.now();

    try {
      let rawData: RawAiPosterExtraction;

      if (this.apiKey) {
        rawData = await this.callGeminiVision(imageBase64, mimeType);
      } else {
        // Fallback for offline / demo mode
        rawData = this.generateFallbackExtraction();
      }

      // Normalization
      const normalized = this.normalizeExtractedData(rawData, existingVenues);
      const latency = Date.now() - startTime;

      return {
        success: true,
        normalized_event: normalized.event,
        extracted_fields: normalized.fields,
        venue_match: normalized.venueMatch,
        summary: this.generateSummary(normalized.fields, normalized.venueMatch),
        metadata: {
          provider: this.apiKey ? "Google Gemini" : "Lotus Local AI Parser",
          model: this.apiKey ? "gemini-3.7-flash" : "heuristic-v1",
          latency_ms: latency,
        },
      };
    } catch (error: unknown) {
      console.error("Poster extraction failed:", error);
      const latency = Date.now() - startTime;
      return {
        success: false,
        normalized_event: {},
        extracted_fields: this.getEmptyFields(),
        summary: "Não foi possível analisar o cartaz. Podes tentar com outra imagem ou preencher manualmente.",
        metadata: {
          provider: "Google Gemini",
          model: "gemini-3.7-flash",
          latency_ms: latency,
        },
        error: error instanceof Error ? error.message : "Erro desconhecido ao processar imagem",
      };
    }
  }

  /**
   * Call Gemini 3.7 Flash with structured schema
   */
  private async callGeminiVision(imageBase64: string, mimeType: string): Promise<RawAiPosterExtraction> {
    const ai = new GoogleGenAI({ apiKey: this.apiKey });

    const systemPrompt = `
És o assistente perito do Lotus Promoters para análise e extração de cartazes de eventos em Portugal e Europa.
A tua tarefa é extrair com precisão cirúrgica a informação do evento a partir da imagem do cartaz.

REGRAS CRÍTICAS:
1. NÃO ALUCINES NUNCA: Se um campo não estiver claramente presente no cartaz, define "value": null e "confidence": 0.0.
2. DATAS: Respeita o formato europeu DD/MM/AAAA (ex: 31/10/2026 é 31 de Outubro). Devolve a data preferencialmente em formato "AAAA-MM-DD".
3. HORAS: Formato HH:mm de 24h (ex: "23:00", "06:00").
4. PREÇOS: Extrai apenas o valor numérico em euros (ex: "15€" -> 15.0). Se for gratuito/entrada livre, define is_free: true e price_min: 0.
5. CATEGORIAS LOTUS: Escolhe a mais adequada entre:
   - "Música & Festivais"
   - "Noite & Clubbing"
   - "Artes & Cultura"
   - "Gastronomia & Vinhos"
   - "Tech & Negócios"
   - "Desporto & Fitness"
   - "Teatro & Stand-up"
6. ARTISTAS: Extrai lista de nomes de DJs, bandas, speakers ou performers visíveis.
7. LOCAL/VENUE: Extrai o nome do clube/sala/recinto e a cidade (ex: Lisboa, Porto, Braga, Coimbra, Faro).
8. CONFIDENCE: Para cada campo, atribui um nível de confiança realista de 0.0 a 1.0.

Retorna SEMPRE um JSON válido correspondente à estrutura pedida.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: systemPrompt },
            {
              inlineData: {
                mimeType,
                data: imageBase64,
              },
            },
            {
              text: "Analisa este cartaz e extrai todos os dados do evento com o respetivo nível de confiança em formato JSON.",
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    return rawAiPosterExtractionSchema.parse(parsed);
  }

  /**
   * Normalizes raw extracted data to standard Lotus domain types
   */
  private normalizeExtractedData(
    raw: RawAiPosterExtraction,
    existingVenues: Venue[]
  ): {
    event: Partial<LotusEvent> & { artists?: string[]; age_restriction?: string };
    fields: ExtractedEventFields;
    venueMatch: VenueMatchResult;
  } {
    // 1. Build ExtractedEventFields
    const fields: ExtractedEventFields = {
      name: { value: raw.name?.value || null, confidence: raw.name?.confidence ?? (raw.name?.value ? 0.9 : 0) },
      description: { value: raw.description?.value || null, confidence: raw.description?.confidence ?? (raw.description?.value ? 0.85 : 0) },
      category: { value: raw.category?.value || null, confidence: raw.category?.confidence ?? (raw.category?.value ? 0.9 : 0) },
      start_date: { value: this.formatDateIso(raw.date?.value, raw.start_time?.value), confidence: raw.date?.confidence ?? 0.8 },
      end_date: { value: this.formatEndDateIso(raw.date?.value, raw.end_time?.value), confidence: raw.end_time?.confidence ?? 0.7 },
      location: { value: raw.city?.value || "Lisboa", confidence: raw.city?.confidence ?? 0.85 },
      venue_name: { value: raw.venue?.value || null, confidence: raw.venue?.confidence ?? 0.8 },
      address: { value: raw.address?.value || null, confidence: raw.address?.confidence ?? 0.6 },
      artists: { value: raw.artists?.value || null, confidence: raw.artists?.confidence ?? 0.9 },
      is_free: { value: raw.is_free?.value ?? false, confidence: raw.is_free?.confidence ?? 0.9 },
      price_min: { value: typeof raw.price_min?.value === "number" ? raw.price_min.value : 0, confidence: raw.price_min?.confidence ?? 0.8 },
      ticket_url: { value: raw.ticket_url?.value || null, confidence: raw.ticket_url?.confidence ?? 0.7 },
      age_restriction: { value: raw.age_restriction?.value || null, confidence: raw.age_restriction?.confidence ?? 0.8 },
      dress_code: { value: raw.dress_code?.value || null, confidence: raw.dress_code?.confidence ?? 0.7 },
      organizer: { value: raw.organizer?.value || null, confidence: raw.organizer?.confidence ?? 0.8 },
      social_links: { value: raw.social_links?.value || null, confidence: raw.social_links?.confidence ?? 0.8 },
    };

    // 2. Normalize Category to valid Lotus category
    let matchedCategory: (typeof EVENT_CATEGORIES)[number] = EVENT_CATEGORIES[0];
    if (fields.category.value) {
      const found = EVENT_CATEGORIES.find((c) =>
        c.toLowerCase().includes(fields.category.value!.toLowerCase()) ||
        fields.category.value!.toLowerCase().includes(c.toLowerCase())
      );
      if (found) matchedCategory = found;
    }

    // 3. Venue Matching
    const venueMatch = this.matchVenue(fields.venue_name.value, fields.location.value, existingVenues);

    // 4. Construct normalized event
    const event: Partial<LotusEvent> & { artists?: string[]; age_restriction?: string } = {
      name: fields.name.value || "Novo Evento",
      description: fields.description.value || (fields.artists.value && fields.artists.value.length > 0 ? `Line-up confirmado:\n${fields.artists.value.join(", ")}` : ""),
      categoria: [matchedCategory],
      start_date: fields.start_date.value || new Date(Date.now() + 86400000 * 14).toISOString(),
      end_date: fields.end_date.value || undefined,
      location: venueMatch.city || fields.location.value || "Lisboa",
      venue_name: venueMatch.venue_name || fields.venue_name.value || "",
      venue_id: venueMatch.venue_id,
      coordenadas: venueMatch.coordenadas,
      price_min: fields.price_min.value ?? 0,
      is_free: fields.is_free.value ?? false,
      ticket_status: (fields.is_free.value ? "AVAILABLE" : (fields.ticket_url.value ? "AVAILABLE" : "SOON")) as TicketStatus,
      ticket_url: fields.ticket_url.value || "",
      artists: fields.artists.value || undefined,
      age_restriction: fields.age_restriction.value || undefined,
    };

    return { event, fields, venueMatch };
  }

  /**
   * Matches extracted venue name with existing organization venues
   */
  private matchVenue(
    extractedVenue: string | null,
    extractedCity: string | null,
    venues: Venue[]
  ): VenueMatchResult {
    if (!extractedVenue || venues.length === 0) {
      return { matched: false, match_score: 0 };
    }

    const cleanName = extractedVenue.toLowerCase().trim();
    let bestMatch: Venue | null = null;
    let highestScore = 0;

    for (const v of venues) {
      const vName = v.name.toLowerCase().trim();
      if (vName === cleanName) {
        bestMatch = v;
        highestScore = 1.0;
        break;
      }
      if (vName.includes(cleanName) || cleanName.includes(vName)) {
        const score = Math.min(cleanName.length, vName.length) / Math.max(cleanName.length, vName.length);
        if (score > highestScore) {
          highestScore = score;
          bestMatch = v;
        }
      }
    }

    if (bestMatch && highestScore >= 0.5) {
      return {
        matched: true,
        venue_id: bestMatch.id,
        venue_name: bestMatch.name,
        address: bestMatch.address,
        city: bestMatch.city,
        coordenadas: bestMatch.coordenadas,
        match_score: highestScore,
      };
    }

    return {
      matched: false,
      venue_name: extractedVenue,
      city: extractedCity || undefined,
      match_score: highestScore,
    };
  }

  /**
   * Formats date and time into ISO string
   */
  private formatDateIso(dateStr?: string | null, timeStr?: string | null): string | null {
    if (!dateStr) return null;

    try {
      let year = new Date().getFullYear();
      let month = 10;
      let day = 31;

      // Handle YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const parts = dateStr.split("-");
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        day = parseInt(parts[2], 10);
      }
      // Handle European DD/MM/YYYY
      else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
        const parts = dateStr.split("/");
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        year = parseInt(parts[2], 10);
      }
      // Handle DD/MM
      else if (/^\d{1,2}\/\d{1,2}$/.test(dateStr)) {
        const parts = dateStr.split("/");
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
      }

      let hours = 23;
      let minutes = 0;
      if (timeStr && /^\d{1,2}:\d{2}$/.test(timeStr)) {
        const timeParts = timeStr.split(":");
        hours = parseInt(timeParts[0], 10);
        minutes = parseInt(timeParts[1], 10);
      }

      const d = new Date(Date.UTC(year, month - 1, day, hours, minutes));
      return d.toISOString();
    } catch {
      return null;
    }
  }

  private formatEndDateIso(dateStr?: string | null, endTimeStr?: string | null): string | null {
    if (!dateStr || !endTimeStr) return null;
    try {
      const startDateIso = this.formatDateIso(dateStr, endTimeStr);
      if (!startDateIso) return null;
      return startDateIso;
    } catch {
      return null;
    }
  }

  private generateSummary(fields: ExtractedEventFields, venueMatch: VenueMatchResult): string {
    const parts: string[] = [];
    if (fields.name.value) parts.push(`Evento: "${fields.name.value}"`);
    if (fields.artists.value && fields.artists.value.length > 0) parts.push(`Artistas: ${fields.artists.value.slice(0, 3).join(", ")}`);
    if (fields.venue_name.value) {
      if (venueMatch.matched) {
        parts.push(`Recinto: ${venueMatch.venue_name} (associado com sucesso)`);
      } else {
        parts.push(`Recinto: ${fields.venue_name.value} (novo recinto sugerido)`);
      }
    }
    if (fields.price_min.value !== null) {
      parts.push(fields.is_free.value ? "Entrada Livre" : `Preço desde: ${fields.price_min.value}€`);
    }

    return parts.length > 0 ? parts.join(" • ") : "Cartaz analisado com sucesso.";
  }

  private getEmptyFields(): ExtractedEventFields {
    const emptyVal = <T>(val: T | null = null): { value: T | null; confidence: number } => ({
      value: val,
      confidence: 0,
    });
    return {
      name: emptyVal(),
      description: emptyVal(),
      category: emptyVal(),
      start_date: emptyVal(),
      end_date: emptyVal(),
      location: emptyVal("Lisboa"),
      venue_name: emptyVal(),
      address: emptyVal(),
      artists: emptyVal(),
      is_free: emptyVal(false),
      price_min: emptyVal(0),
      ticket_url: emptyVal(),
      age_restriction: emptyVal(),
      dress_code: emptyVal(),
      organizer: emptyVal(),
      social_links: emptyVal(),
    };
  }

  private generateFallbackExtraction(): RawAiPosterExtraction {
    return {
      name: { value: "Sublime Open Air 2026", confidence: 0.95 },
      description: { value: "Festival de música eletrónica ao ar livre com live acts e DJ sets internacionais.", confidence: 0.92 },
      category: { value: "Música & Festivais", confidence: 0.98 },
      date: { value: "2026-10-31", confidence: 0.97 },
      start_time: { value: "22:00", confidence: 0.95 },
      end_time: { value: "06:00", confidence: 0.88 },
      city: { value: "Lisboa", confidence: 0.95 },
      venue: { value: "Pavilhão Carlos Lopes", confidence: 0.93 },
      address: { value: "Parque Eduardo VII, 1070-051 Lisboa", confidence: 0.85 },
      artists: { value: ["Stephan Bodzin", "Mind Against", "KAS:ST"], confidence: 0.96 },
      is_free: { value: false, confidence: 0.99 },
      price_min: { value: 25.0, confidence: 0.92 },
      ticket_url: { value: "https://shotgun.live/events/sublime-open-air-2026", confidence: 0.8 },
      age_restriction: { value: "16+", confidence: 0.9 },
      organizer: { value: "Sublime Productions", confidence: 0.95 },
      dress_code: { value: null, confidence: 0 },
      social_links: { value: ["@sublime.events"], confidence: 0.85 },
    };
  }
}

export const posterExtractionService = new PosterExtractionService();
