import { EventSource } from "../src/core/domain/ingestion";
import { Venue } from "../src/core/domain/venue";
import { Organization } from "../src/core/domain/organization";
import { LotusEvent } from "../src/core/domain/event";
import { IcalFeedAdapter } from "../src/core/application/ingestion/adapters/IcalFeedAdapter";
import { JsonLdEventAdapter } from "../src/core/application/ingestion/adapters/JsonLdEventAdapter";
import { eventIngestionPipeline } from "../src/core/application/ingestion/EventIngestionPipeline";

async function runTests() {
  console.log("===============================================================");
  console.log("🧪 LOTUS AUTOMATED EVENT INGESTION TEST SUITE (PORTO & GAIA)");
  console.log("===============================================================\n");

  const mockVenues: Venue[] = [
    {
      id: "venue_hard_club",
      organization_id: "org_hardclub",
      name: "Hard Club",
      address: "Mercado Ferreira Borges, 4050-252 Porto",
      city: "Porto",
      coordenadas: { latitude: 41.1415, longitude: -8.6148 },
      created_at: new Date().toISOString(),
    },
    {
      id: "venue_casa_musica",
      organization_id: "org_casadamusica",
      name: "Casa da Música",
      address: "Avenida da Boavista 604-610, 4149-071 Porto",
      city: "Porto",
      coordenadas: { latitude: 41.1588, longitude: -8.6307 },
      created_at: new Date().toISOString(),
    },
    {
      id: "venue_coliseu_porto",
      organization_id: "org_coliseu",
      name: "Coliseu Porto Ageas",
      address: "Rua de Passos Manuel 137, 4000-385 Porto",
      city: "Porto",
      coordenadas: { latitude: 41.1469, longitude: -8.6053 },
      created_at: new Date().toISOString(),
    },
  ];

  const mockOrgs: Organization[] = [
    {
      id: "org_hardclub",
      name: "Hard Club Porto",
      slug: "hard-club-porto",
      city: "Porto",
      country: "Portugal",
      categories: ["Música & Festivais", "Noite & Clubbing"],
      is_verified: true,
      followers_count: 1420,
      public_profile_enabled: true,
      created_by: "user_owner",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  // -------------------------------------------------------------
  // Test 1: iCal Feed Ingestion & Venue Resolution
  // -------------------------------------------------------------
  console.log("▶️ TEST 1: Ingesting iCal Feed from Porto Cultural Source...");
  const mockIcalText = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Porto Cultura//Events Calendar//PT
BEGIN:VEVENT
UID:porto_event_001
DTSTART:20261031T230000Z
DTEND:20261101T060000Z
SUMMARY:Porto Electronic Sessions 2026
DESCRIPTION:Uma noite de música eletrónica no coração do Porto. Entrada 15 euros com consumo obrigatório.
LOCATION:Hard Club, Mercado Ferreira Borges, Porto
CATEGORIES:Música Eletrónica, Clubbing
URL:https://hardclubporto.com/events/electronic-sessions
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:porto_event_002
DTSTART:20261115T210000Z
SUMMARY:Concerto de Outono na Boavista
DESCRIPTION:Entrada Livre no foyer principal da Casa da Música.
LOCATION:Casa da Música, Porto
CATEGORIES:Música Clássica e Jazz
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  const icalSource: EventSource = {
    id: "source_porto_ical",
    name: "Agenda Cultural Porto (iCal)",
    type: "ICAL",
    domain: "cultura.porto.pt",
    url: "https://cultura.porto.pt/events.ics",
    ingestion_method: "cron",
    status: "ACTIVE",
    priority: 80,
    trust_level: 0.9,
    city: "Porto",
    config: { mockIcalText },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const icalAdapter = new IcalFeedAdapter();
  const { run: run1, processedEvents: batch1 } = await eventIngestionPipeline.runSource(
    icalSource,
    icalAdapter,
    [],
    [],
    mockVenues,
    mockOrgs
  );

  console.log(`Discovered: ${run1.discovered_count}, New: ${run1.new_count}, Errors: ${run1.error_count}`);
  if (run1.discovered_count !== 2 || run1.new_count !== 2) {
    throw new Error(`Test 1 Failed: Expected 2 new events, got ${run1.new_count}`);
  }

  const ev1 = batch1.find((e) => e.external_id === "porto_event_001")!;
  console.log(`Event 1: "${ev1.normalized_event.name}"`);
  console.log(`Resolved Venue: ${ev1.venue_resolution?.venue_name} (ID: ${ev1.venue_resolution?.venue_id})`);
  console.log(`Category: ${ev1.normalized_event.categoria?.[0]}`);
  console.log(`Price: ${ev1.normalized_event.price_min}€ (Free: ${ev1.normalized_event.is_free})`);
  console.log(`Confidence Score: ${ev1.confidence_score}`);

  if (ev1.venue_resolution?.venue_id !== "venue_hard_club") {
    throw new Error("Test 1 Failed: Venue Hard Club was not resolved!");
  }
  if (ev1.normalized_event.categoria?.[0] !== "Noite & Clubbing") {
    throw new Error(`Test 1 Failed: Expected category 'Noite & Clubbing', got ${ev1.normalized_event.categoria?.[0]}`);
  }
  if (ev1.status !== "NEEDS_REVIEW") {
    throw new Error("Test 1 Failed: Expected initial status NEEDS_REVIEW");
  }
  console.log("✅ TEST 1 PASSED: iCal Feed successfully parsed, normalized, and resolved.\n");

  // -------------------------------------------------------------
  // Test 2: Idempotency (Re-running same source without changes)
  // -------------------------------------------------------------
  console.log("▶️ TEST 2: Idempotency (Re-running unchanged source)...");
  const { run: run2 } = await eventIngestionPipeline.runSource(
    icalSource,
    icalAdapter,
    batch1, // existing imported
    [],
    mockVenues,
    mockOrgs
  );

  console.log(`Discovered: ${run2.discovered_count}, New: ${run2.new_count}, Updated: ${run2.updated_count}`);
  if (run2.new_count !== 0) {
    throw new Error(`Test 2 Failed: Re-run should create 0 new events, created ${run2.new_count}`);
  }
  console.log("✅ TEST 2 PASSED: Pipeline is strictly idempotent.\n");

  // -------------------------------------------------------------
  // Test 3: Updating Event Data (e.g. Schedule Change & Cancellation)
  // -------------------------------------------------------------
  console.log("▶️ TEST 3: Detecting Event Update & Cancellation...");
  const updatedIcalText = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:porto_event_001
DTSTART:20261031T233000Z
SUMMARY:Porto Electronic Sessions 2026 (Horário Atualizado)
DESCRIPTION:Horário ajustado para as 23:30. Entrada 15 euros.
LOCATION:Hard Club, Porto
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:porto_event_002
DTSTART:20261115T210000Z
SUMMARY:Concerto de Outono na Boavista
DESCRIPTION:Cancelado devido a obras.
LOCATION:Casa da Música, Porto
STATUS:CANCELLED
END:VEVENT
END:VCALENDAR`;

  const updatedSource = { ...icalSource, config: { mockIcalText: updatedIcalText } };
  const { processedEvents: batch3 } = await eventIngestionPipeline.runSource(
    updatedSource,
    icalAdapter,
    batch1,
    [],
    mockVenues,
    mockOrgs
  );

  const updatedEv1 = batch3.find((e) => e.external_id === "porto_event_001")!;
  const cancelledEv2 = batch3.find((e) => e.external_id === "porto_event_002")!;

  console.log(`Event 1 Title: ${updatedEv1.normalized_event.name}`);
  console.log(`Event 1 Conflicts detected: ${JSON.stringify(updatedEv1.conflicting_fields)}`);
  console.log(`Event 2 Status: ${cancelledEv2.status}`);

  if (!updatedEv1.conflicting_fields?.["start_date"]) {
    throw new Error("Test 3 Failed: start_date conflict was not recorded");
  }
  if (cancelledEv2.status !== "CANCELLED") {
    throw new Error(`Test 3 Failed: Expected status CANCELLED, got ${cancelledEv2.status}`);
  }
  console.log("✅ TEST 3 PASSED: Event updates and cancellations correctly tracked.\n");

  // -------------------------------------------------------------
  // Test 4: JSON-LD Extraction & Cross-Source Deduplication
  // -------------------------------------------------------------
  console.log("▶️ TEST 4: Schema.org JSON-LD & Cross-Source Deduplication...");
  const mockJsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    "@id": "jsonld_ticketline_999",
    "name": "Porto Electronic Sessions 2026",
    "description": "Bilhetes para Porto Electronic Sessions no Hard Club Porto.",
    "startDate": "2026-10-31T23:00:00Z",
    "endDate": "2026-11-01T06:00:00Z",
    "url": "https://ticketline.sapo.pt/evento/porto-electronic-sessions",
    "location": {
      "@type": "Place",
      "name": "Hard Club",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Porto",
        "streetAddress": "Mercado Ferreira Borges"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 41.1415,
        "longitude": -8.6148
      }
    },
    "performer": [
      { "@type": "Person", "name": "DJ Vibe" },
      { "@type": "Person", "name": "Underground Sound of Lisbon" }
    ],
    "offers": {
      "@type": "Offer",
      "price": 15.0,
      "priceCurrency": "EUR",
      "url": "https://ticketline.sapo.pt/evento/porto-electronic-sessions"
    }
  };

  const jsonLdSource: EventSource = {
    id: "source_ticketline_porto",
    name: "Ticketline Porto Events (JSON-LD)",
    type: "STRUCTURED_WEB",
    domain: "ticketline.sapo.pt",
    url: "https://ticketline.sapo.pt",
    ingestion_method: "json_ld",
    status: "ACTIVE",
    priority: 60,
    trust_level: 0.8,
    city: "Porto",
    config: { mockJsonLd },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const jsonLdAdapter = new JsonLdEventAdapter();
  const { processedEvents: batch4 } = await eventIngestionPipeline.runSource(
    jsonLdSource,
    jsonLdAdapter,
    [],
    batch1.map((b) => ({ id: b.id, ...b.normalized_event } as unknown as LotusEvent)),
    mockVenues,
    mockOrgs
  );

  const duplicateEvent = batch4.find((e) => e.external_id === "jsonld_ticketline_999")!;
  console.log(`Deduplication Result: is_duplicate = ${duplicateEvent.deduplication?.is_duplicate}`);
  console.log(`Similarity Score: ${duplicateEvent.deduplication?.similarity_score}`);
  console.log(`Duplicate of ID: ${duplicateEvent.deduplication?.duplicate_of_id}`);
  console.log(`Status: ${duplicateEvent.status}`);

  if (!duplicateEvent.deduplication?.is_duplicate || duplicateEvent.status !== "DUPLICATE") {
    throw new Error("Test 4 Failed: Cross-source duplicate was not flagged as DUPLICATE!");
  }
  console.log("✅ TEST 4 PASSED: Cross-source duplicate detected and prevented from polluting the catalog.\n");

  console.log("===============================================================");
  console.log("🎉 ALL INGESTION PIPELINE TESTS PASSED (4/4)!");
  console.log("===============================================================");
}

runTests().catch((err) => {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
});
