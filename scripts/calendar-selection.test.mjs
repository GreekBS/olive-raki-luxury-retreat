/**
 * Focused regression tests for Olive calendar selection + BFF validation.
 * Mirrors src/lib/booking/* and src/lib/talos/validate calendar rules.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const CALENDAR_MAX_SPAN_DAYS = 93;

function addDaysIso(iso, days) {
  const y = Number(iso.slice(0, 4));
  const m = Number(iso.slice(5, 7)) - 1;
  const d = Number(iso.slice(8, 10));
  const date = new Date(Date.UTC(y, m, d + days));
  const yy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function nightsBetween(checkIn, checkOut) {
  const a = Date.UTC(
    Number(checkIn.slice(0, 4)),
    Number(checkIn.slice(5, 7)) - 1,
    Number(checkIn.slice(8, 10))
  );
  const b = Date.UTC(
    Number(checkOut.slice(0, 4)),
    Number(checkOut.slice(5, 7)) - 1,
    Number(checkOut.slice(8, 10))
  );
  return Math.round((b - a) / 86_400_000);
}

function occupiedNights(checkIn, checkOut) {
  const nights = nightsBetween(checkIn, checkOut);
  const result = [];
  for (let i = 0; i < nights; i += 1) result.push(addDaysIso(checkIn, i));
  return result;
}

function validateStayRange(checkIn, checkOut, daysByDate, minNights, maxNights) {
  if (!checkIn || !checkOut) {
    return { ok: false, reason: "incomplete" };
  }
  const arrival = daysByDate.get(checkIn);
  if (!arrival || !arrival.checkInAllowed) {
    return { ok: false, reason: "bad_checkin" };
  }
  const departure = daysByDate.get(checkOut);
  if (!departure || !departure.checkOutAllowed) {
    return { ok: false, reason: "bad_checkout" };
  }
  const nights = nightsBetween(checkIn, checkOut);
  if (nights < minNights) {
    return { ok: false, reason: "too_short", message: `Minimum stay: ${minNights} nights` };
  }
  if (nights > maxNights) {
    return { ok: false, reason: "too_long", message: `Maximum stay: ${maxNights} nights` };
  }
  for (const night of occupiedNights(checkIn, checkOut)) {
    const cell = daysByDate.get(night);
    if (!cell || !cell.available) {
      return { ok: false, reason: "unavailable_night" };
    }
  }
  return { ok: true, nights };
}

function parseCalendarRequest(input) {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "missing_range" };
  }
  const from = typeof input.from === "string" ? input.from.trim() : "";
  const to = typeof input.to === "string" ? input.to.trim() : "";
  if (!from || !to) return { ok: false, error: "missing_range" };
  if (!DATE_RE.test(from) || !DATE_RE.test(to)) {
    return { ok: false, error: "invalid_date_format" };
  }
  if (to <= from) return { ok: false, error: "invalid_range" };
  const span = nightsBetween(from, to);
  if (span > CALENDAR_MAX_SPAN_DAYS) return { ok: false, error: "range_too_large" };
  const guestCount =
    typeof input.guestCount === "number"
      ? input.guestCount
      : Number.parseInt(String(input.guestCount), 10);
  if (!Number.isInteger(guestCount) || guestCount < 1) {
    return { ok: false, error: "invalid_guest_count" };
  }
  return { ok: true, value: { from, to, guestCount } };
}

function day(date, overrides = {}) {
  return {
    date,
    available: true,
    nightlyPrice: "150.00",
    currency: "EUR",
    checkInAllowed: true,
    checkOutAllowed: true,
    ...overrides,
  };
}

function mapOf(...days) {
  return new Map(days.map((d) => [d.date, d]));
}

describe("occupied nights semantics", () => {
  it("counts half-open [checkIn, checkOut)", () => {
    assert.equal(nightsBetween("2026-12-10", "2026-12-13"), 3);
    assert.deepEqual(occupiedNights("2026-12-10", "2026-12-13"), [
      "2026-12-10",
      "2026-12-11",
      "2026-12-12",
    ]);
  });
});

describe("validateStayRange", () => {
  const days = mapOf(
    day("2026-12-10"),
    day("2026-12-11"),
    day("2026-12-12"),
    day("2026-12-13"),
    day("2026-12-14")
  );

  it("accepts a 3-night stay with minNights=3", () => {
    const result = validateStayRange("2026-12-10", "2026-12-13", days, 3, 30);
    assert.equal(result.ok, true);
    assert.equal(result.nights, 3);
  });

  it("rejects 2 nights when minNights=3", () => {
    const result = validateStayRange("2026-12-10", "2026-12-12", days, 3, 30);
    assert.equal(result.ok, false);
    assert.equal(result.reason, "too_short");
    assert.match(result.message, /Minimum stay: 3/);
  });

  it("rejects ranges that cross an unavailable night", () => {
    const blocked = mapOf(
      day("2026-12-10"),
      day("2026-12-11", { available: false, nightlyPrice: null }),
      day("2026-12-12"),
      day("2026-12-13")
    );
    const result = validateStayRange("2026-12-10", "2026-12-13", blocked, 3, 30);
    assert.equal(result.ok, false);
    assert.equal(result.reason, "unavailable_night");
  });

  it("allows checkout morning that is not an available occupancy night", () => {
    const checkoutOnly = mapOf(
      day("2026-12-10"),
      day("2026-12-11"),
      day("2026-12-12"),
      day("2026-12-13", {
        available: false,
        nightlyPrice: null,
        checkInAllowed: false,
        checkOutAllowed: true,
      })
    );
    const result = validateStayRange("2026-12-10", "2026-12-13", checkoutOnly, 3, 30);
    assert.equal(result.ok, true);
  });
});

describe("parseCalendarRequest", () => {
  it("accepts a valid batch window", () => {
    const parsed = parseCalendarRequest({
      from: "2026-12-01",
      to: "2027-02-02",
      guestCount: 2,
    });
    assert.equal(parsed.ok, true);
  });

  it("rejects inverted ranges", () => {
    const parsed = parseCalendarRequest({
      from: "2026-12-10",
      to: "2026-12-10",
      guestCount: 2,
    });
    assert.equal(parsed.ok, false);
  });

  it("rejects oversized ranges", () => {
    const parsed = parseCalendarRequest({
      from: "2026-01-01",
      to: "2026-12-31",
      guestCount: 2,
    });
    assert.equal(parsed.ok, false);
    assert.equal(parsed.error, "range_too_large");
  });
});
