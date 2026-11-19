import type { Metadata } from "next";
import { DiscoverScreen } from "@/components/discover/DiscoverScreen";
import { getCurrentUserId } from "@/server/config";
import { getProfile } from "@/server/services/profile";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Discover · Coy" };

export default async function DiscoverPage() {
  // The viewer's own public profile, used for the "It's a match!" photo pair.
  const me = await getProfile(getCurrentUserId());
  return <DiscoverScreen me={me} />;
}
