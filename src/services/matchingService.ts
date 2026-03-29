import { getApprovedServices } from './browseService';
import { REQUEST_MATCH_ROUTING } from '@/types/content';
import { MATCH_WEIGHTS } from '@/types/matching';
import type { HelpRequest, ServiceListing, RequestMatchRouting } from '@/types/content';
import type { MatchResult, ScoreBreakdown } from '@/types/matching';

/**
 * Matching Service — request-to-service matching engine
 * ------------------------------------------------------
 * Eligibility filtering, scoring, ranking, and result assembly.
 * All weights and scoring logic are centralised here.
 */

// -------------------------------------------------------
// Availability scores by type
// -------------------------------------------------------
const AVAILABILITY_SCORES: Record<string, number> = {
  flexible: MATCH_WEIGHTS.availability,   // 15
  weekdays: 10,
  evenings: 8,
  weekends: 8,
};

// -------------------------------------------------------
// Public API
// -------------------------------------------------------

export type MatchOutcome =
  | { type: 'services'; results: MatchResult[] }
  | { type: 'no-matches'; location: string; category: string | null }
  | { type: 'products-placeholder' };

/**
 * Find the best service matches for a help request.
 *
 * Returns up to 3 ranked results, a no-match fallback,
 * or a product-routing placeholder.
 */
export async function findMatchesForRequest(
  request: HelpRequest,
): Promise<MatchOutcome> {
  // 1. Determine routing
  const routing = request.category
    ? REQUEST_MATCH_ROUTING[request.category]
    : null;

  // No category selected — treat as wildcard service search
  const effectiveRouting: RequestMatchRouting = routing ?? {
    target: 'services',
    categories: 'any',
  };

  // 2. Product routing — placeholder only
  if (effectiveRouting.target === 'products') {
    return { type: 'products-placeholder' };
  }

  // 3. Fetch all approved, non-expired services
  const allServices = await getApprovedServices(100);

  // 4. Eligibility filter
  const eligible = filterEligible(allServices, request, effectiveRouting);

  if (eligible.length === 0) {
    return {
      type: 'no-matches',
      location: request.location,
      category: request.category,
    };
  }

  // 5. Score each eligible service
  const scored = eligible.map((service) =>
    buildMatchResult(service, request, effectiveRouting),
  );

  // 6. Sort: total desc → createdAt desc → id asc
  scored.sort((a, b) => {
    if (b.score.total !== a.score.total) return b.score.total - a.score.total;

    const aDate = a.service.createdAt || '';
    const bDate = b.service.createdAt || '';
    if (bDate !== aDate) return bDate > aDate ? 1 : -1;

    return a.service.id < b.service.id ? -1 : 1;
  });

  // 7. Return top 3
  const top = scored.slice(0, 3);

  return { type: 'services', results: top };
}

// -------------------------------------------------------
// Eligibility filter
// -------------------------------------------------------

function filterEligible(
  services: ServiceListing[],
  request: HelpRequest,
  routing: Extract<RequestMatchRouting, { target: 'services' }>,
): ServiceListing[] {
  return services.filter((s) => {
    // Category gate
    if (
      routing.categories !== 'any' &&
      !routing.categories.includes(s.category)
    ) {
      return false;
    }

    // Location gate
    if (!s.serviceAreas.includes(request.location)) {
      return false;
    }

    return true;
  });
}

// -------------------------------------------------------
// Scoring
// -------------------------------------------------------

function scoreService(
  service: ServiceListing,
  _request: HelpRequest,
): ScoreBreakdown {
  // Category: always full score (passed eligibility filter)
  const category = MATCH_WEIGHTS.category;

  // Location: always full score (passed eligibility filter)
  const location = MATCH_WEIGHTS.location;

  // Availability: based on availability type
  const availability = AVAILABILITY_SCORES[service.availabilityType] ?? 0;

  // Freshness: linear decay over 90 days
  const freshness = computeFreshness(service.createdAt);

  // Trust: neutral default for all (author status lookup deferred)
  const trust = MATCH_WEIGHTS.trust;

  const total = category + location + availability + freshness + trust;

  return { category, location, availability, freshness, trust, total };
}

function computeFreshness(createdAt: string): number {
  if (!createdAt) return 0;

  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const daysOld = (now - created) / (1000 * 60 * 60 * 24);

  if (daysOld <= 0) return MATCH_WEIGHTS.freshness;
  if (daysOld >= 90) return 0;

  return Math.round(MATCH_WEIGHTS.freshness * (1 - daysOld / 90));
}

// -------------------------------------------------------
// Explanation builder
// -------------------------------------------------------

function buildExplanation(
  service: ServiceListing,
  score: ScoreBreakdown,
): string[] {
  const reasons: string[] = [];

  reasons.push('Matches the kind of help you requested');
  reasons.push('Serves your area');

  if (service.availabilityType === 'flexible') {
    reasons.push('Flexible availability');
  } else if (score.availability > 0) {
    reasons.push(
      `Available ${service.availabilityType}`,
    );
  }

  if (score.freshness >= MATCH_WEIGHTS.freshness * 0.7) {
    reasons.push('Recently listed');
  } else if (score.freshness >= MATCH_WEIGHTS.freshness * 0.3) {
    reasons.push('Active listing');
  }

  return reasons;
}

// -------------------------------------------------------
// Result assembly
// -------------------------------------------------------

function buildMatchResult(
  service: ServiceListing,
  request: HelpRequest,
  _routing: Extract<RequestMatchRouting, { target: 'services' }>,
): MatchResult {
  const score = scoreService(service, request);
  const explanation = buildExplanation(service, score);

  return { service, score, explanation };
}
