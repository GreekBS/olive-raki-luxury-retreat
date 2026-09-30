import type { StayRequest } from "./types";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export type StayValidationError =
  | "missing_dates"
  | "invalid_date_format"
  | "checkout_not_after_checkin"
  | "invalid_guest_count"
  | "guest_count_too_high";

export function parseStayRequest(
  input: unknown,
  options?: { maxGuests?: number }
): { ok: true; value: StayRequest } | { ok: false; error: StayValidationError; message: string } {
  if (!input || typeof input !== "object") {
    return {
      ok: false,
      error: "missing_dates",
      message: "Please select check-in and check-out dates.",
    };
  }

  const body = input as Record<string, unknown>;
  const checkIn = typeof body.checkIn === "string" ? body.checkIn.trim() : "";
  const checkOut = typeof body.checkOut === "string" ? body.checkOut.trim() : "";
  const guestCountRaw = body.guestCount;

  if (!checkIn || !checkOut) {
    return {
      ok: false,
      error: "missing_dates",
      message: "Please select check-in and check-out dates.",
    };
  }

  if (!DATE_RE.test(checkIn) || !DATE_RE.test(checkOut)) {
    return {
      ok: false,
      error: "invalid_date_format",
      message: "Dates must use YYYY-MM-DD format.",
    };
  }

  if (checkOut <= checkIn) {
    return {
      ok: false,
      error: "checkout_not_after_checkin",
      message: "Check-out must be after check-in.",
    };
  }

  const guestCount =
    typeof guestCountRaw === "number"
      ? guestCountRaw
      : typeof guestCountRaw === "string"
        ? Number.parseInt(guestCountRaw, 10)
        : NaN;

  if (!Number.isInteger(guestCount) || guestCount < 1) {
    return {
      ok: false,
      error: "invalid_guest_count",
      message: "Please select at least one guest.",
    };
  }

  const maxGuests = options?.maxGuests ?? 50;
  if (guestCount > maxGuests) {
    return {
      ok: false,
      error: "guest_count_too_high",
      message: `This retreat can host up to ${maxGuests} guests.`,
    };
  }

  return {
    ok: true,
    value: { checkIn, checkOut, guestCount },
  };
}
