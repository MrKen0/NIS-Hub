import type { ServiceListing } from './content';

/**
 * Matching Types — used by the request matching engine
 * -----------------------------------------------------
 * Defines the shape of match results, score breakdowns,
 * and the centralised weight configuration.
 */

// -------------------------------------------------------
// Weights — single source of truth for scoring
// -------------------------------------------------------
export const MATCH_WEIGHTS = {
  category: 30,
  location: 30,
  availability: 15,
  freshness: 15,
  trust: 10,
} as const;

// -------------------------------------------------------
// Score breakdown per match result
// -------------------------------------------------------
export interface ScoreBreakdown {
  category: number;
  location: number;
  availability: number;
  freshness: number;
  trust: number;
  total: number;
}

// -------------------------------------------------------
// A single match result returned by the matching engine
// -------------------------------------------------------
export interface MatchResult {
  service: ServiceListing;
  score: ScoreBreakdown;
  explanation: string[];
}
