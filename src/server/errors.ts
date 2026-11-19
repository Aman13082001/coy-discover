export type ErrorCode =
  | "VALIDATION_ERROR"
  | "SELF_SWIPE"
  | "PROFILE_NOT_FOUND"
  | "ALREADY_SWIPED"
  | "INTERNAL_ERROR";

/** An expected failure with an HTTP status and a stable, client-safe code. */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const isPrismaError = (e: unknown, code: string): boolean =>
  typeof e === "object" && e !== null && "code" in e && (e as { code: unknown }).code === code;
