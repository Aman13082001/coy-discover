import type {
  ApiEnvelope,
  FeedResponse,
  MatchesResponse,
  SwipeAction,
  SwipeResponse,
} from "@/lib/types";

/** Error carrying the API's stable error code, so the UI can react to specific failures. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, { cache: "no-store", ...init });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "You seem to be offline.");
  }

  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await res.json()) as ApiEnvelope<T>;
  } catch {
    // fall through to the generic error below
  }

  if (res.ok && body && "data" in body) return body.data;
  const error = body && "error" in body ? body.error : null;
  throw new ApiError(res.status, error?.code ?? "UNKNOWN", error?.message ?? "Something went wrong.");
}

export const api = {
  feed: () => request<FeedResponse>("/api/feed"),
  matches: () => request<MatchesResponse>("/api/matches"),
  swipe: (profileId: string, action: SwipeAction) =>
    request<SwipeResponse>("/api/swipe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ profileId, action }),
    }),
};
