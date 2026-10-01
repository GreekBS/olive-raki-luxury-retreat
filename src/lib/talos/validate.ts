import type { BookRequest, CalendarRequest, HoldRequest, StayRequest } from "./types";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const IDEMPOTENCY_RE = /^[A-Za-z0-9_-]{8,128}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9][0-9\s().-]{6,24}$/;
const COUNTRY_RE = /^[A-Z]{2}$/;
const NAME_RE = /^[\p{L}\p{M}'’\-\s]{1,80}$/u;

/** Max half-open calendar window Olive will request from Talos (≈3 months). */
export const CALENDAR_MAX_SPAN_DAYS = 93;

export const ALLOWED_COUNTRY_CODES = [
  "GR",
  "DE",
  "GB",
  "FR",
  "IT",
  "ES",
  "NL",
  "BE",
  "AT",
  "CH",
  "US",
  "CA",
  "AU",
  "IE",
  "PT",
  "SE",
  "NO",
  "DK",
  "FI",
  "PL",
  "CZ",
  "RO",
  "BG",
  "CY",
  "MT",
  "LU",
  "HR",
  "SI",
  "SK",
  "HU",
  "EE",
  "LV",
  "LT",
  "IS",
  "NZ",
  "AE",
  "IL",
  "TR",
] as const;

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

export type HoldValidationError =
  | StayValidationError
  | "missing_idempotency_key"
  | "invalid_idempotency_key";

export type BookValidationError =
  | "missing_hold"
  | "invalid_hold_id"
  | "missing_guest"
  | "invalid_first_name"
  | "invalid_last_name"
  | "invalid_email"
  | "invalid_phone"
  | "invalid_country"
  | "terms_required"
  | "missing_idempotency_key"
  | "invalid_idempotency_key";

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

function parseIdempotencyKey(
  raw: unknown
):
  | { ok: true; value: string }
  | {
      ok: false;
      error: "missing_idempotency_key" | "invalid_idempotency_key";
      message: string;
    } {
  const key = typeof raw === "string" ? raw.trim() : "";
  if (!key) {
    return {
      ok: false,
      error: "missing_idempotency_key",
      message: "Please try again.",
    };
  }
  if (!IDEMPOTENCY_RE.test(key)) {
    return {
      ok: false,
      error: "invalid_idempotency_key",
      message: "Please try again.",
    };
  }
  return { ok: true, value: key };
}

export function parseStayRequest(
  input: unknown,
  options?: { maxGuests?: number }
):
  | { ok: true; value: StayRequest }
  | { ok: false; error: StayValidationError; message: string } {
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
    value: { checkIn, checkOut, guestCount: guests.value },
  };
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

export function parseHoldRequest(
  input: unknown,
  options?: { maxGuests?: number }
):
  | { ok: true; value: HoldRequest }
  | { ok: false; error: HoldValidationError; message: string } {
  const stay = parseStayRequest(input, options);
  if (!stay.ok) return stay;

  const body = input as Record<string, unknown>;
  const idem = parseIdempotencyKey(body.idempotencyKey);
  if (!idem.ok) return idem;

  return {
    ok: true,
    value: {
      ...stay.value,
      idempotencyKey: idem.value,
    },
  };
}

export function parseBookRequest(
  input: unknown
):
  | { ok: true; value: BookRequest }
  | { ok: false; error: BookValidationError; message: string } {
  if (!input || typeof input !== "object") {
    return {
      ok: false,
      error: "missing_guest",
      message: "Please complete your guest details.",
    };
  }

  const body = input as Record<string, unknown>;
  const holdId = typeof body.holdId === "string" ? body.holdId.trim() : "";
  if (!holdId) {
    return {
      ok: false,
      error: "missing_hold",
      message:
        "Your temporary reservation has expired. Please select your dates again.",
    };
  }
  if (holdId.length < 8 || holdId.length > 128) {
    return {
      ok: false,
      error: "invalid_hold_id",
      message:
        "Your temporary reservation is no longer valid. Please select your dates again.",
    };
  }

  const guestRaw = body.guest;
  if (!guestRaw || typeof guestRaw !== "object") {
    return {
      ok: false,
      error: "missing_guest",
      message: "Please complete your guest details.",
    };
  }

  const guest = guestRaw as Record<string, unknown>;
  const firstName =
    typeof guest.firstName === "string" ? guest.firstName.trim() : "";
  const lastName =
    typeof guest.lastName === "string" ? guest.lastName.trim() : "";
  const email = typeof guest.email === "string" ? guest.email.trim() : "";
  const phone = typeof guest.phone === "string" ? guest.phone.trim() : "";
  const countryRaw =
    typeof guest.country === "string" ? guest.country.trim().toUpperCase() : "";

  if (!NAME_RE.test(firstName)) {
    return {
      ok: false,
      error: "invalid_first_name",
      message: "Please enter a valid first name.",
    };
  }
  if (!NAME_RE.test(lastName)) {
    return {
      ok: false,
      error: "invalid_last_name",
      message: "Please enter a valid last name.",
    };
  }
  if (!EMAIL_RE.test(email) || email.length > 160) {
    return {
      ok: false,
      error: "invalid_email",
      message: "Please enter a valid email address.",
    };
  }
  if (!PHONE_RE.test(phone)) {
    return {
      ok: false,
      error: "invalid_phone",
      message: "Please enter a valid phone number including country code.",
    };
  }

  const country = countryRaw === "UK" ? "GB" : countryRaw;
  if (
    !COUNTRY_RE.test(country) ||
    !(ALLOWED_COUNTRY_CODES as readonly string[]).includes(country)
  ) {
    return {
      ok: false,
      error: "invalid_country",
      message: "Please select your country.",
    };
  }

  if (body.acceptedTerms !== true) {
    return {
      ok: false,
      error: "terms_required",
      message: "Please agree to the booking terms and cancellation policy.",
    };
  }

  const idem = parseIdempotencyKey(body.idempotencyKey);
  if (!idem.ok) return idem;

  return {
    ok: true,
    value: {
      holdId,
      guest: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone,
        country,
      },
      acceptedTerms: true,
      idempotencyKey: idem.value,
    },
  };
}
