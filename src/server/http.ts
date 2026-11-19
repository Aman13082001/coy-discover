import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/server/errors";
import type { ApiFailure, ApiSuccess } from "@/lib/types";

const NO_STORE = { "Cache-Control": "no-store" };

export function ok<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccess<T>>({ data }, { status, headers: NO_STORE });
}

export function fail(status: number, code: string, message: string) {
  return NextResponse.json<ApiFailure>({ error: { code, message } }, { status, headers: NO_STORE });
}

/** Central error mapping: expected errors keep their status; anything else becomes a generic 500. */
export function handleError(e: unknown) {
  if (e instanceof AppError) return fail(e.status, e.code, e.message);
  if (e instanceof ZodError) {
    const message = e.issues.map((i) => i.message).join("; ") || "Invalid request.";
    return fail(400, "VALIDATION_ERROR", message);
  }
  console.error("[api] unexpected error", e);
  return fail(500, "INTERNAL_ERROR", "Something went wrong. Please try again.");
}

/** Wraps a route handler with the shared error mapping. */
export function route<A extends unknown[]>(handler: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (e) {
      return handleError(e);
    }
  };
}
