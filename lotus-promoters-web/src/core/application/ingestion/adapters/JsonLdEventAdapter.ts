import { IEventIngestionAdapter } from "../EventIngestionAdapter";
import { EventSource, RawIngestedEvent, ExtractedEventDraft, EventSourceType } from "@/core/domain/ingestion";

export class JsonLdEventAdapter implements IEventIngestionAdapter {
  readonly type: EventSourceType = "STRUCTURED_WEB";
  readonly name = "Schema.org JSON-LD Event Adapter";

  /**
   * Fetches JSON-LD payload from the source URL or configuration
   */
  async fetchRawEvents(source: EventSource): Promise<RawIngestedEvent[]> {
    if (source.config?.mockJsonLd) {
      const items = Array.isArray(source.config.mockJsonLd)
        ? source.config.mockJsonLd
        : [source.config.mockJsonLd];
      return items.map((item, idx) => ({
        external_id: (item as Record<string, unknown>)["@id"] as string || `jsonld_${source.id}_${idx + 1}`,
        source_id: source.id,
        source_url: (item as Record<string, unknown>)["url"] as string || source.url,
        fetched_at: new Date().toISOString(),
        payload: item as Record<string, unknown>,
      }));
    }

    try {
      const response = await fetch(source.url, {
        headers: {
          "User-Agent": "LotusEventIngester/1.0 (+https://lotus.app/bot)",
          Accept: "application/ld+json, text/html, */*",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch JSON-LD from ${source.url}: HTTP ${response.status}`);
      }

      const htmlOrJson = await response.text();
      return this.extractJsonLdFromHtml(htmlOrJson, source);
    } catch (err: unknown) {
      console.warn(`Could not fetch live JSON-LD from ${source.url}:`, err);
      if (source.config?.fallbackPayload) {
        return source.config.fallbackPayload as RawIngestedEvent[];
      }
      throw err;
    }
  }

  private extractJsonLdFromHtml(htmlOrJson: string, source: EventSource): RawIngestedEvent[] {
    const rawEvents: RawIngestedEvent[] = [];

    // Check if body is direct JSON
    try {
      const parsed = JSON.parse(htmlOrJson);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (this.isSchemaOrgEvent(item)) {
          rawEvents.push({
            external_id: item["@id"] || item["url"] || `jsonld_${source.id}_${i + 1}`,
            source_id: source.id,
            source_url: item["url"] || source.url,
            fetched_at: new Date().toISOString(),
            payload: item,
          });
        }
      }
      if (rawEvents.length > 0) return rawEvents;
    } catch {}

    // Extract <script type="application/ld+json"> blocks
    const scriptRegex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
    let match: RegExpExecArray | null;
    let index = 1;

    while ((match = scriptRegex.exec(htmlOrJson)) !== null) {
      try {
        const jsonContent = JSON.parse(match[1].trim());
        const items = Array.isArray(jsonContent) ? jsonContent : [jsonContent];

        for (const item of items) {
          if (this.isSchemaOrgEvent(item)) {
            rawEvents.push({
              external_id: item["@id"] || item["url"] || `jsonld_${source.id}_${index++}`,
              source_id: source.id,
              source_url: item["url"] || source.url,
              fetched_at: new Date().toISOString(),
              payload: item,
            });
          }
        }
      } catch {}
    }

    return rawEvents;
  }

  private isSchemaOrgEvent(obj: unknown): boolean {
    if (!obj || typeof obj !== "object") return false;
    const type = (obj as { "@type"?: string })["@type"];
    return Boolean(type && (type === "Event" || type.endsWith("Event")));
  }

  /**
   * Parses Schema.org Event object into ExtractedEventDraft
   */
  async parseEvent(raw: RawIngestedEvent, source: EventSource): Promise<ExtractedEventDraft> {
    const p = raw.payload as Record<string, unknown>;

    const title = (p["name"] as string) || (p["headline"] as string) || "Evento Sem Título";
    const description = (p["description"] as string) || "";
    const startDate = (p["startDate"] as string) || new Date().toISOString();
    const endDate = (p["endDate"] as string) || undefined;
    const sourceUrl = (p["url"] as string) || raw.source_url;

    // Image
    let imageUrl: string | undefined;
    if (typeof p["image"] === "string") {
      imageUrl = p["image"];
    } else if (Array.isArray(p["image"]) && typeof p["image"][0] === "string") {
      imageUrl = p["image"][0];
    } else if (p["image"] && typeof p["image"] === "object") {
      imageUrl = (p["image"] as { url?: string }).url;
    }

    // Location & Venue
    let venueName: string | undefined;
    let address: string | undefined;
    let city = source.city || "Porto";
    let coordenadas: { latitude: number; longitude: number } | undefined;

    const loc = p["location"] as Record<string, unknown> | undefined;
    if (loc) {
      venueName = (loc["name"] as string) || undefined;

      const addr = loc["address"];
      if (typeof addr === "string") {
        address = addr;
      } else if (addr && typeof addr === "object") {
        const aObj = addr as Record<string, string>;
        address = aObj["streetAddress"] || aObj["name"] || "";
        if (aObj["addressLocality"]) city = aObj["addressLocality"];
      }

      const geo = loc["geo"] as Record<string, unknown> | undefined;
      if (geo && typeof geo["latitude"] === "number" && typeof geo["longitude"] === "number") {
        coordenadas = {
          latitude: geo["latitude"],
          longitude: geo["longitude"],
        };
      }
    }

    // Performers / Artists
    let artists: string[] | undefined;
    const performer = p["performer"];
    if (Array.isArray(performer)) {
      artists = performer
        .map((perf) => (typeof perf === "string" ? perf : (perf as { name?: string }).name))
        .filter((n): n is string => Boolean(n));
    } else if (performer && typeof performer === "object") {
      const pName = (performer as { name?: string }).name;
      if (pName) artists = [pName];
    }

    // Offers & Tickets
    let isFree = false;
    let priceMin: number | undefined;
    let priceMax: number | undefined;
    let ticketUrl: string | undefined;

    const offers = p["offers"];
    if (offers && typeof offers === "object") {
      const off = (Array.isArray(offers) ? offers[0] : offers) as Record<string, unknown>;
      ticketUrl = (off["url"] as string) || undefined;
      const price = off["price"];
      if (price === 0 || price === "0" || String(price).toLowerCase() === "free") {
        isFree = true;
        priceMin = 0;
      } else if (typeof price === "number") {
        priceMin = price;
      } else if (typeof price === "string") {
        const parsed = parseFloat(price.replace(/[^0-9.]/g, ""));
        if (!isNaN(parsed)) priceMin = parsed;
      }
    }

    // Organizer
    let organizerName: string | undefined;
    const organizer = p["organizer"] as Record<string, unknown> | undefined;
    if (organizer) {
      organizerName = (organizer["name"] as string) || undefined;
    }

    return {
      external_id: raw.external_id,
      title: title.trim(),
      description: description.trim(),
      start_date: startDate,
      end_date: endDate,
      venue_name: venueName,
      address,
      city,
      coordenadas,
      organizer_name: organizerName,
      artists: artists && artists.length > 0 ? artists : undefined,
      image_url: imageUrl,
      is_free: isFree,
      price_min: priceMin,
      price_max: priceMax,
      ticket_url: ticketUrl,
      source_url: sourceUrl,
      status: (p["eventStatus"] as string)?.includes("Cancelled") ? "CANCELLED" : "SCHEDULED",
    };
  }
}
