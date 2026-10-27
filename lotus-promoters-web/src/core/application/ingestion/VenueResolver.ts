import { Venue } from "@/core/domain/venue";
import { VenueResolutionResult } from "@/core/domain/ingestion";

export class VenueResolver {
  /**
   * Resolves an extracted venue against existing Lotus venues
   */
  resolve(
    extractedVenueName?: string,
    extractedAddress?: string,
    extractedCity?: string,
    extractedCoords?: { latitude: number; longitude: number },
    existingVenues: Venue[] = []
  ): VenueResolutionResult {
    if (!extractedVenueName || existingVenues.length === 0) {
      return {
        resolved: false,
        venue_name: extractedVenueName,
        address: extractedAddress,
        city: extractedCity || "Porto",
        coordenadas: extractedCoords,
        match_score: 0.0,
        is_candidate: Boolean(extractedVenueName),
      };
    }

    const cleanInput = this.cleanString(extractedVenueName);
    let bestMatch: Venue | null = null;
    let highestScore = 0.0;

    for (const v of existingVenues) {
      const cleanVenueName = this.cleanString(v.name);

      // 1. Exact match
      if (cleanInput === cleanVenueName) {
        bestMatch = v;
        highestScore = 1.0;
        break;
      }

      // 2. Substring match
      if (cleanVenueName.includes(cleanInput) || cleanInput.includes(cleanVenueName)) {
        const score = Math.min(cleanInput.length, cleanVenueName.length) / Math.max(cleanInput.length, cleanVenueName.length);
        if (score > highestScore) {
          highestScore = score;
          bestMatch = v;
        }
      }

      // 3. Address match if coordinates or street match
      if (extractedAddress && v.address) {
        const cleanAddrA = this.cleanString(extractedAddress);
        const cleanAddrB = this.cleanString(v.address);
        if (cleanAddrA.includes(cleanAddrB) || cleanAddrB.includes(cleanAddrA)) {
          const addrScore = 0.8;
          if (addrScore > highestScore) {
            highestScore = addrScore;
            bestMatch = v;
          }
        }
      }
    }

    if (bestMatch && highestScore >= 0.7) {
      return {
        resolved: true,
        venue_id: bestMatch.id,
        venue_name: bestMatch.name,
        address: bestMatch.address,
        city: bestMatch.city,
        coordenadas: bestMatch.coordenadas || extractedCoords,
        match_score: highestScore,
        is_candidate: false,
      };
    }

    return {
      resolved: false,
      venue_name: extractedVenueName,
      address: extractedAddress,
      city: extractedCity || "Porto",
      coordenadas: extractedCoords,
      match_score: highestScore,
      is_candidate: true,
    };
  }

  private cleanString(str: string): string {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
}

export const venueResolver = new VenueResolver();
