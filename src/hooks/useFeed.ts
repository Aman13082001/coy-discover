"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { PublicProfile } from "@/lib/types";

export type FeedStatus = "loading" | "ready" | "error";

export function useFeed() {
  const [status, setStatus] = useState<FeedStatus>("loading");
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const { profiles } = await api.feed();
      setProfiles(profiles);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { status, profiles, setProfiles, reload: load };
}
