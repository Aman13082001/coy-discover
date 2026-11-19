import type { Profile } from "@prisma/client";
import type { PublicProfile } from "@/lib/types";

/** Columns that are safe to expose. Used in every query that returns a profile. */
export const publicProfileSelect = {
  id: true,
  name: true,
  age: true,
  photoUrl: true,
  bio: true,
  location: true,
  interests: true,
} as const;

type PublicRow = Pick<Profile, keyof typeof publicProfileSelect>;

function parseInterests(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

/** Builds the public DTO field by field, so new DB columns can never leak by accident. */
export function toPublicProfile(row: PublicRow): PublicProfile {
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    photoUrl: row.photoUrl,
    bio: row.bio,
    location: row.location,
    interests: parseInterests(row.interests),
  };
}
