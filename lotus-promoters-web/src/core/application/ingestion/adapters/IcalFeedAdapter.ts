import { IEventIngestionAdapter } from "../EventIngestionAdapter";
import { EventSource, RawIngestedEvent, ExtractedEventDraft, EventSourceType } from "@/core/domain/ingestion";

export class IcalFeedAdapter implements IEventIngestionAdapter {
  readonly type: EventSourceType = "ICAL";
  readonly name = "iCalendar Feed Adapter";

  /**
   * Fetches iCal feed text from the source URL or uses injected payload
   */
  async fetchRawEvents(source: EventSource): Promise<RawIngestedEvent[]> {
    let icalText = "";

    // If source config contains mock or local payload, use it
    if (source.config?.mockIcalText) {
      icalText = source.config.mockIcalText as string;
    } else {
      try {
        const response = await fetch(source.url, {
          headers: {
            "User-Agent": "LotusEventIngester/1.0 (+https://lotus.app/bot)",
            Accept: "text/calendar, text/plain, */*",
          },
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch iCal feed from ${source.url}: HTTP ${response.status}`);
        }
        icalText = await response.text();
      } catch (err: unknown) {
        console.warn(`Could not fetch live iCal feed ${source.url}, falling back if available:`, err);
        if (source.config?.fallbackPayload) {
          return source.config.fallbackPayload as RawIngestedEvent[];
        }
        throw err;
      }
    }

    return this.parseIcalRaw(icalText, source);
  }

  /**
   * Splits iCal into individual VEVENT blocks
   */
  private parseIcalRaw(icalText: string, source: EventSource): RawIngestedEvent[] {
    const rawEvents: RawIngestedEvent[] = [];
    const eventBlocks = icalText.split(/BEGIN:VEVENT/i).slice(1);

    for (let i = 0; i < eventBlocks.length; i++) {
      const block = eventBlocks[i].split(/END:VEVENT/i)[0];
      const parsedFields: Record<string, string> = {};

      const lines = block.split(/\r?\n/);
      let currentKey = "";
      let currentValue = "";

      for (const line of lines) {
        if (line.startsWith(" ") || line.startsWith("\t")) {
          // Unfolding continuous lines (RFC 5545)
          currentValue += line.substring(1);
        } else {
          if (currentKey) {
            parsedFields[currentKey] = currentValue.trim();
          }
          const colonIndex = line.indexOf(":");
          if (colonIndex > 0) {
            currentKey = line.substring(0, colonIndex).split(";")[0].toUpperCase();
            currentValue = line.substring(colonIndex + 1);
          }
        }
      }
      if (currentKey) {
        parsedFields[currentKey] = currentValue.trim();
      }

      const uid = parsedFields["UID"] || `ical_${source.id}_${i + 1}`;
      rawEvents.push({
        external_id: uid,
        source_id: source.id,
        source_url: parsedFields["URL"] || source.url,
        fetched_at: new Date().toISOString(),
        payload: parsedFields,
      });
    }

    return rawEvents;
  }

  /**
   * Parses a single raw iCal event into an ExtractedEventDraft
   */
  async parseEvent(raw: RawIngestedEvent, source: EventSource): Promise<ExtractedEventDraft> {
    const payload = raw.payload as Record<string, string>;

    const title = this.unescapeIcalText(payload["SUMMARY"] || "Evento Sem Título");
    const description = this.unescapeIcalText(payload["DESCRIPTION"] || "");
    const locationRaw = this.unescapeIcalText(payload["LOCATION"] || "");
    const url = payload["URL"] || raw.source_url;
    const statusRaw = (payload["STATUS"] || "").toUpperCase();

    // Parse Dates
    const startDate = this.parseIcalDate(payload["DTSTART"]);
    const endDate = payload["DTEND"] ? this.parseIcalDate(payload["DTEND"]) : undefined;

    // Parse Venue & City from Location string
    let venueName = locationRaw;
    let city = source.city || "Porto";
    let address = "";

    if (locationRaw.includes(",")) {
      const parts = locationRaw.split(",").map((s) => s.trim());
      venueName = parts[0];
      address = parts.slice(1).join(", ");
      if (parts.some((p) => p.toLowerCase().includes("gaia"))) {
        city = "Vila Nova de Gaia";
      } else if (parts.some((p) => p.toLowerCase().includes("porto"))) {
        city = "Porto";
      }
    }

    // Parse Category
    const category = payload["CATEGORIES"] || undefined;

    // Parse Status
    let status: "SCHEDULED" | "CANCELLED" | "POSTPONED" = "SCHEDULED";
    if (statusRaw.includes("CANCEL")) {
      status = "CANCELLED";
    }

    return {
      external_id: raw.external_id,
      title,
      description,
      category,
      start_date: startDate,
      end_date: endDate,
      venue_name: venueName || undefined,
      address: address || undefined,
      city,
      source_url: url,
      image_url: payload["ATTACH"] || payload["IMAGE"] || undefined,
      status,
      is_free: description.toLowerCase().includes("gratuito") || description.toLowerCase().includes("entrada livre"),
    };
  }

  private parseIcalDate(dateStr?: string): string {
    if (!dateStr) return new Date().toISOString();

    // Remove timezone prefix if present e.g. "TZID=Europe/Lisbon:20261031T220000"
    const cleanDate = dateStr.includes(":") ? dateStr.split(":").pop()! : dateStr;

    // Format: YYYYMMDDTHHmmssZ or YYYYMMDDTHHmmss or YYYYMMDD
    if (/^\d{8}T\d{6}/.test(cleanDate)) {
      const year = parseInt(cleanDate.substring(0, 4), 10);
      const month = parseInt(cleanDate.substring(4, 6), 10) - 1;
      const day = parseInt(cleanDate.substring(6, 8), 10);
      const hour = parseInt(cleanDate.substring(9, 11), 10);
      const min = parseInt(cleanDate.substring(11, 13), 10);
      const sec = parseInt(cleanDate.substring(13, 15), 10);
      return new Date(Date.UTC(year, month, day, hour, min, sec)).toISOString();
    } else if (/^\d{8}$/.test(cleanDate)) {
      const year = parseInt(cleanDate.substring(0, 4), 10);
      const month = parseInt(cleanDate.substring(4, 6), 10) - 1;
      const day = parseInt(cleanDate.substring(6, 8), 10);
      return new Date(Date.UTC(year, month, day, 20, 0, 0)).toISOString();
    }

    try {
      const d = new Date(dateStr);
      return !isNaN(d.getTime()) ? d.toISOString() : new Date().toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  private unescapeIcalText(text: string): string {
    return text
      .replace(/\\n/g, "\n")
      .replace(/\\,/g, ",")
      .replace(/\\;/g, ";")
      .replace(/\\\\/g, "\\")
      .trim();
  }
}
