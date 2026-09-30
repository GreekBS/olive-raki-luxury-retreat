import { nightsBetween, occupiedNights } from "./dates";

export type CalendarDayFlags = {
  date: string;
  available: boolean;
  nightlyPrice: string | null;
  currency: string;
  checkInAllowed: boolean;
  checkOutAllowed: boolean;
};

export type RangeValidation =
  | { ok: true; nights: number }
  | {
      ok: false;
      reason: "too_short" | "too_long" | "unavailable_night" | "bad_checkin" | "bad_checkout" | "incomplete";
      message: string;
    };

export function validateStayRange(
  checkIn: string | null,
  checkOut: string | null,
  daysByDate: Map<string, CalendarDayFlags>,
  minNights: number,
  maxNights: number
): RangeValidation {
  if (!checkIn || !checkOut) {
    return { ok: false, reason: "incomplete", message: "Select check-in and check-out." };
  }

  const arrival = daysByDate.get(checkIn);
  if (!arrival || !arrival.checkInAllowed) {
    return {
      ok: false,
      reason: "bad_checkin",
      message: "That arrival date is not available.",
    };
  }

  const departure = daysByDate.get(checkOut);
  if (!departure || !departure.checkOutAllowed) {
    return {
      ok: false,
      reason: "bad_checkout",
      message: "That departure date is not available.",
    };
  }

  const nights = nightsBetween(checkIn, checkOut);
  if (nights < minNights) {
    return {
      ok: false,
      reason: "too_short",
      message: `Minimum stay: ${minNights} nights`,
    };
  }
  if (nights > maxNights) {
    return {
      ok: false,
      reason: "too_long",
      message: `Maximum stay: ${maxNights} nights`,
    };
  }

  for (const night of occupiedNights(checkIn, checkOut)) {
    const cell = daysByDate.get(night);
    if (!cell || !cell.available) {
      return {
        ok: false,
        reason: "unavailable_night",
        message: "Those dates are not available. Please try different dates.",
      };
    }
  }

  return { ok: true, nights };
}

export function isDateInSelectedRange(
  date: string,
  checkIn: string | null,
  checkOut: string | null
): boolean {
  if (!checkIn) return false;
  if (!checkOut) return date === checkIn;
  return date >= checkIn && date < checkOut;
}

export function isRangeEndpoint(
  date: string,
  checkIn: string | null,
  checkOut: string | null
): "checkin" | "checkout" | null {
  if (checkIn && date === checkIn) return "checkin";
  if (checkOut && date === checkOut) return "checkout";
  return null;
}

/**
 * Whether a date can be chosen as the next click given current selection.
 * Pure UI affordance — Talos flags remain authoritative.
 *
 * When selecting checkout, dates that are too short/long remain clickable
 * so the UI can surface a min/max stay hint — validateStayRange rejects them.
 */
export function canInteractWithDay(
  date: string,
  day: CalendarDayFlags | undefined,
  checkIn: string | null,
  checkOut: string | null,
  daysByDate: Map<string, CalendarDayFlags>,
  minNights: number,
  maxNights: number
): boolean {
  if (!day) return false;

  // Selecting check-in (or resetting after a complete range)
  if (!checkIn || (checkIn && checkOut)) {
    return day.checkInAllowed && day.available;
  }

  // Selecting check-out after check-in
  if (date <= checkIn) return false;
  if (!day.checkOutAllowed) return false;

  const nights = nightsBetween(checkIn, date);
  if (nights < 1) return false;

  // Always require occupied nights to be available; length checked on click.
  for (const night of occupiedNights(checkIn, date)) {
    const cell = daysByDate.get(night);
    if (!cell || !cell.available) return false;
  }

  // Allow clicking over-long candidates so we can show max-stay hint.
  void maxNights;
  void minNights;
  return true;
}
