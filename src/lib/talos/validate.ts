import type { CalendarRequest, StayRequest } from "./types";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Max half-open calendar window Olive will request from Talos (≈3 months). */
export const CALENDAR_MAX_SPAN_DAYS = 93;

export type StayValidationError =
  | "missing_dates"
  | "invalid_date_format"
  | "checkout_not_after_checkin"
  | "invalid_guest_count"
  | "guest_count_too_high";

export type CalendarValidationError =
  | "missing_range"
  | "invalid_date_format"
  | "invalid_range"
  | "range_too_large"
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

function parseGuestCount(
  guestCountRaw: unknown
): { ok: true; value: number } | { ok: false; message: string } {
  const guestCount =
    typeof guestCountRaw === "number"
      ? guestCountRaw
      : typeof guestCountRaw === "string"
        ? Number.parseInt(guestCountRaw, 10)
        : NaN;

  if (!Number.isInteger(guestCount) || guestCount < 1) {
    return { ok: false, message: "Please select at least one guest." };
  }

  return { ok: true, value: guestCount };
}

function daysBetweenUtc(from: string, to: string): number {
  const start = Date.UTC(
    Number(from.slice(0, 4)),
    Number(from.slice(5, 7)) - 1,
    Number(from.slice(8, 10))
  );
  const end = Date.UTC(
    Number(to.slice(0, 4)),
    Number(to.slice(5, 7)) - 1,
    Number(to.slice(8, 10))
  );
  return Math.round((end - start) / 86_400_000);
}

export function parseCalendarRequest(
  input: unknown,
  options?: { maxGuests?: number }
):
  | { ok: true; value: CalendarRequest }
  | { ok: false; error: CalendarValidationError; message: string } {
  if (!input || typeof input !== "object") {
    return {
      ok: false,
      error: "missing_range",
      message: "Please provide a calendar date range.",
    };
  }

  const body = input as Record<string, unknown>;
  const from = typeof body.from === "string" ? body.from.trim() : "";
  const to = typeof body.to === "string" ? body.to.trim() : "";

  if (!from || !to) {
    return {
      ok: false,
      error: "missing_range",
      message: "Please provide a calendar date range.",
    };
  }

  if (!DATE_RE.test(from) || !DATE_RE.test(to)) {
    return {
      ok: false,
      error: "invalid_date_format",
      message: "Dates must use YYYY-MM-DD format.",
    };
  }

  if (to <= from) {
    return {
      ok: false,
      error: "invalid_range",
      message: "Calendar end date must be after the start date.",
    };
  }

  const span = daysBetweenUtc(from, to);
  if (span > CALENDAR_MAX_SPAN_DAYS) {
    return {
      ok: false,
      error: "range_too_large",
      message: "Please request a shorter calendar range.",
    };
  }

  const guests = parseGuestCount(body.guestCount);
  if (!guests.ok) {
    return {
      ok: false,
      error: "invalid_guest_count",
      message: guests.message,
    };
  }

  const maxGuests = options?.maxGuests ?? 50;
  if (guests.value > maxGuests) {
    return {
      ok: false,
      error: "guest_count_too_high",
      message: `This retreat can host up to ${maxGuests} guests.`,
    };
  }

  return {
    ok: true,
    value: { from, to, guestCount: guests.value },
  };
}
