import { EventSource, RawIngestedEvent, ExtractedEventDraft, EventSourceType } from "@/core/domain/ingestion";

export interface IEventIngestionAdapter {
  readonly type: EventSourceType;
  readonly name: string;

  /**
   * Fetches raw events from the external source
   */
  fetchRawEvents(source: EventSource): Promise<RawIngestedEvent[]>;

  /**
   * Parses a single raw event into a standardized ExtractedEventDraft
   */
  parseEvent(raw: RawIngestedEvent, source: EventSource): Promise<ExtractedEventDraft>;
}
