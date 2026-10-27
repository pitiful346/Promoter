import { Organization } from "@/core/domain/organization";
import { OrganizerResolutionResult } from "@/core/domain/ingestion";

export class OrganizerResolver {
  /**
   * Resolves raw organizer string against verified Lotus organizations
   */
  resolve(
    rawOrganizerName?: string,
    existingOrganizations: Organization[] = []
  ): OrganizerResolutionResult {
    if (!rawOrganizerName || existingOrganizations.length === 0) {
      return {
        resolved: false,
        organizer_text: rawOrganizerName,
        match_score: 0.0,
      };
    }

    const cleanInput = this.cleanString(rawOrganizerName);
    let bestOrg: Organization | null = null;
    let highestScore = 0.0;

    for (const org of existingOrganizations) {
      const cleanOrgName = this.cleanString(org.name);

      // Exact match
      if (cleanInput === cleanOrgName) {
        bestOrg = org;
        highestScore = 1.0;
        break;
      }

      // Strong containment
      if (cleanOrgName.includes(cleanInput) || cleanInput.includes(cleanOrgName)) {
        const score = Math.min(cleanInput.length, cleanOrgName.length) / Math.max(cleanInput.length, cleanOrgName.length);
        if (score > 0.8 && score > highestScore) {
          highestScore = score;
          bestOrg = org;
        }
      }
    }

    // Only associate organization automatically if match is very confident (>= 0.85)
    if (bestOrg && highestScore >= 0.85) {
      return {
        resolved: true,
        organization_id: bestOrg.id,
        organizer_text: bestOrg.name,
        match_score: highestScore,
      };
    }

    return {
      resolved: false,
      organizer_text: rawOrganizerName,
      match_score: highestScore,
    };
  }

  private cleanString(str: string): string {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
}

export const organizerResolver = new OrganizerResolver();
