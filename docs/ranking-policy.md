# Ranking Policy

## Goals
- surface relevant and trusted community content quickly
- prevent spam and stale posts from dominating
- support moderator signals and member reputation

## Ranking factors
1. recency (timestamp)
2. proximity (location relevance to Stevenage)
3. author trust score (verified profile, role weight)
4. engagement (comments, upvotes, RSVPs)
5. content state (approved, flagged, reviewed)

## Policy rules
- new posts default to low rank until verified or validated.
- flagged items are auto-lowered and require moderator review.
- moderators can pin/unpin and adjust rank.
- poor quality or repeated violations triggers probation scoring and lower visibility.

## Implementation note
Use a Firestore collection `rankings/` with precomputed score documents updated by cloud functions.
