"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { MatchSummary } from "@/lib/types";

export function useMatches() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [matches, setMatches] = useState<MatchSummary[]>([]);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const { matches } = await api.matches();
      setMatches(matches);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { status, matches, reload: load };
}
