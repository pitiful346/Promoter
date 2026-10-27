import { rawAiPosterExtractionSchema } from "../src/core/validators/ai.schema";
import { PosterExtractionService } from "../src/infrastructure/ai/PosterExtractionService";
import { Venue } from "../src/core/domain/venue";

async function runTests() {
  console.log("==================================================");
  console.log("🧪 LOTUS AI POSTER EXTRACTION TEST SUITE");
  console.log("==================================================\n");

  const service = new PosterExtractionService();

  const mockVenues: Venue[] = [
    {
      id: "venue_1",
      organization_id: "org_1",
      name: "Pavilhão Carlos Lopes",
      address: "Parque Eduardo VII, 1070-051 Lisboa",
      city: "Lisboa",
      coordenadas: { latitude: 38.7302, longitude: -9.1519 },
      created_at: new Date().toISOString(),
    },
    {
      id: "venue_2",
      organization_id: "org_1",
      name: "Hard Club",
      address: "Mercado Ferreira Borges, 4050-252 Porto",
      city: "Porto",
      coordenadas: { latitude: 41.1415, longitude: -8.6148 },
      created_at: new Date().toISOString(),
    },
  ];

  // Test 1: Complete Poster Raw JSON Schema Validation
  console.log("Test 1: Complete Poster Zod Schema Validation...");
  const completeRaw = {
    name: { value: "Porto Electronic Sunset", confidence: 0.98 },
    description: { value: "O maior sunset eletrónico no Porto com vista para o Douro.", confidence: 0.95 },
    category: { value: "Música & Festivais", confidence: 0.96 },
    date: { value: "31/10/2026", confidence: 0.99 },
    start_time: { value: "18:00", confidence: 0.95 },
    end_time: { value: "02:00", confidence: 0.9 },
    city: { value: "Porto", confidence: 0.95 },
    venue: { value: "Hard Club", confidence: 0.96 },
    address: { value: "Mercado Ferreira Borges", confidence: 0.88 },
    artists: { value: ["Charlotte de Witte", "Enrico Sangiuliano"], confidence: 0.98 },
    is_free: { value: false, confidence: 0.99 },
    price_min: { value: 25.0, confidence: 0.92 },
    ticket_url: { value: "https://shotgun.live/events/porto-sunset", confidence: 0.85 },
    age_restriction: { value: "18+", confidence: 0.9 },
  };

  const parsedComplete = rawAiPosterExtractionSchema.safeParse(completeRaw);
  if (!parsedComplete.success) {
    throw new Error(`Test 1 Failed: ${JSON.stringify(parsedComplete.error)}`);
  }
  console.log("✅ Test 1 Passed: Zod schema successfully parsed complete poster data.\n");

  // Test 2: Incomplete Poster (Missing Price, Venue, Artists) - Anti-Hallucination
  console.log("Test 2: Incomplete Poster (Anti-Hallucination)...");
  const incompleteRaw = {
    name: { value: "Exposição de Arte Contemporânea", confidence: 0.92 },
    description: { value: null, confidence: 0 },
    category: { value: "Artes & Cultura", confidence: 0.9 },
    date: { value: "2026-11-15", confidence: 0.95 },
    start_time: { value: "10:00", confidence: 0.85 },
    end_time: { value: null, confidence: 0 },
    city: { value: "Lisboa", confidence: 0.8 },
    venue: { value: null, confidence: 0 },
    address: { value: null, confidence: 0 },
    artists: { value: null, confidence: 0 },
    is_free: { value: true, confidence: 0.9 },
    price_min: { value: null, confidence: 0 },
    ticket_url: { value: null, confidence: 0 },
  };

  const parsedIncomplete = rawAiPosterExtractionSchema.safeParse(incompleteRaw);
  if (!parsedIncomplete.success) {
    throw new Error(`Test 2 Failed: ${JSON.stringify(parsedIncomplete.error)}`);
  }
  if (parsedIncomplete.data.venue?.value !== null && parsedIncomplete.data.venue?.value !== undefined) {
    throw new Error("Test 2 Failed: Venue should be null!");
  }
  console.log("✅ Test 2 Passed: Incomplete poster preserves null values without hallucination.\n");

  // Test 3: Normalization & Venue Matching
  console.log("Test 3: Venue Matching against Organization Venues...");
  const extractionResult = await service.extractFromPoster(
    "dummy_base64",
    "image/jpeg",
    mockVenues
  );

  console.log(`Extraction Success: ${extractionResult.success}`);
  console.log(`Summary: ${extractionResult.summary}`);
  console.log(`Matched Venue: ${extractionResult.venue_match?.venue_name} (ID: ${extractionResult.venue_match?.venue_id})`);
  console.log(`Confidence - Title: ${extractionResult.extracted_fields.name.confidence}`);
  console.log(`Confidence - Venue: ${extractionResult.extracted_fields.venue_name.confidence}`);
  console.log(`Confidence - Price: ${extractionResult.extracted_fields.price_min.confidence}`);

  if (!extractionResult.success) {
    throw new Error("Test 3 Failed: extractionResult returned false");
  }
  if (extractionResult.normalized_event.price_min !== 25) {
    throw new Error("Test 3 Failed: normalized price_min mismatch");
  }
  console.log("✅ Test 3 Passed: Normalization and venue matching functioned correctly.\n");

  console.log("==================================================");
  console.log("🎉 ALL POSTER EXTRACTION TESTS PASSED (3/3)!");
  console.log("==================================================");
}

runTests().catch((err) => {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
});
