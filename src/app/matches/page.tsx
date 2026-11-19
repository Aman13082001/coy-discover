import type { Metadata } from "next";
import { MatchesScreen } from "@/components/matches/MatchesScreen";

export const metadata: Metadata = { title: "Matches · Coy" };

export default function MatchesPage() {
  return <MatchesScreen />;
}
