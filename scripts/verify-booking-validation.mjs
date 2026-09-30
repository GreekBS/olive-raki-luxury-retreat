import assert from "node:assert/strict";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseStayRequest(input, options = {}) {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "missing_dates" };
  }
  const checkIn = typeof input.checkIn === "string" ? input.checkIn.trim() : "";
  const checkOut = typeof input.checkOut === "string" ? input.checkOut.trim() : "";
  if (!checkIn || !checkOut) return { ok: false, error: "missing_dates" };
  if (!DATE_RE.test(checkIn) || !DATE_RE.test(checkOut)) {
    return { ok: false, error: "invalid_date_format" };
  }
  if (checkOut <= checkIn) return { ok: false, error: "checkout_not_after_checkin" };
  const guestCount =
    typeof input.guestCount === "number"
      ? input.guestCount
      : Number.parseInt(String(input.guestCount), 10);
  if (!Number.isInteger(guestCount) || guestCount < 1) {
    return { ok: false, error: "invalid_guest_count" };
  }
  const maxGuests = options.maxGuests ?? 50;
  if (guestCount > maxGuests) return { ok: false, error: "guest_count_too_high" };
  return { ok: true, value: { checkIn, checkOut, guestCount } };
}

assert.equal(parseStayRequest({}).ok, false);
assert.equal(
  parseStayRequest({ checkIn: "2026-12-05", checkOut: "2026-12-01", guestCount: 2 }).error,
  "checkout_not_after_checkin"
);
assert.equal(
  parseStayRequest({ checkIn: "2026-12-01", checkOut: "2026-12-05", guestCount: 0 }).ok,
  false
);
assert.equal(
  parseStayRequest(
    { checkIn: "2026-12-01", checkOut: "2026-12-05", guestCount: 12 },
    { maxGuests: 4 }
  ).error,
  "guest_count_too_high"
);
assert.deepEqual(
  parseStayRequest({ checkIn: "2026-12-01", checkOut: "2026-12-05", guestCount: 2 }).value,
  { checkIn: "2026-12-01", checkOut: "2026-12-05", guestCount: 2 }
);

console.log("verify-booking-validation: passed");
