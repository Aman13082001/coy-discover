/** Shared types used by both the API layer and the UI. */

export type SwipeAction = "LIKE" | "PASS";

/**
 * The only shape in which another person's profile ever leaves the server.
 * Deliberately contains nothing about how that person has acted toward the viewer.
 */
export interface PublicProfile {
  id: string;
  name: string;
  age: number;
  photoUrl: string;
  bio: string;
  location: string;
  interests: string[];
}

export interface MatchSummary {
  id: string;
  createdAt: string;
  profile: PublicProfile;
}

export interface FeedResponse {
  profiles: PublicProfile[];
}

export interface SwipeResponse {
  swipe: { profileId: string; action: SwipeAction };
  /** null unless this swipe completed a mutual like. Same shape either way. */
  match: MatchSummary | null;
}

export interface MatchesResponse {
  me: PublicProfile;
  matches: MatchSummary[];
}

export type ApiSuccess<T> = { data: T };
export type ApiFailure = { error: { code: string; message: string } };
export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;
