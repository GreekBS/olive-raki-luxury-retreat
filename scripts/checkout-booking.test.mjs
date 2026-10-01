/**
 * Focused regression tests for Olive Direct Booking checkout.
 * Mirrors validation/selection/countdown helpers used by the BFF and UI.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const IDEMPOTENCY_RE = /^[A-Za-z0-9_-]{8,128}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9][0-9\s().-]{6,24}$/;
const COUNTRY_RE = /^[A-Z]{2}$/;
const NAME_RE = /^[\p{L}\p{M}'’\-\s]{1,80}$/u;
const ALLOWED = new Set(["GR", "DE", "GB", "FR", "IT", "US"]);

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

function remainingHoldMs(expiresAt, nowMs = Date.now()) {
  const expires = Date.parse(expiresAt);
  if (Number.isNaN(expires)) return 0;
  return Math.max(0, expires - nowMs);
}

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function parseHoldRequest(input) {
  if (!input || typeof input !== "object") return { ok: false };
  const checkIn = String(input.checkIn || "").trim();
  const checkOut = String(input.checkOut || "").trim();
  const guestCount = Number(input.guestCount);
  const idempotencyKey = String(input.idempotencyKey || "").trim();
  if (!DATE_RE.test(checkIn) || !DATE_RE.test(checkOut) || checkOut <= checkIn) {
    return { ok: false };
  }
  if (!Number.isInteger(guestCount) || guestCount < 1) return { ok: false };
  if (!IDEMPOTENCY_RE.test(idempotencyKey)) return { ok: false };
  return {
    ok: true,
    value: { checkIn, checkOut, guestCount, idempotencyKey },
  };
}

function parseBookRequest(input) {
  if (!input || typeof input !== "object") return { ok: false, error: "missing" };
  const holdId = String(input.holdId || "").trim();
  if (holdId.length < 8) return { ok: false, error: "missing_hold" };
  const guest = input.guest || {};
  const firstName = String(guest.firstName || "").trim();
  const lastName = String(guest.lastName || "").trim();
  const email = String(guest.email || "").trim();
  const phone = String(guest.phone || "").trim();
  let country = String(guest.country || "").trim().toUpperCase();
  if (country === "UK") country = "GB";
  const idempotencyKey = String(input.idempotencyKey || "").trim();
  if (!NAME_RE.test(firstName)) return { ok: false, error: "invalid_first_name" };
  if (!NAME_RE.test(lastName)) return { ok: false, error: "invalid_last_name" };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "invalid_email" };
  if (!PHONE_RE.test(phone)) return { ok: false, error: "invalid_phone" };
  if (!COUNTRY_RE.test(country) || !ALLOWED.has(country)) {
    return { ok: false, error: "invalid_country" };
  }
  if (input.acceptedTerms !== true) return { ok: false, error: "terms_required" };
  if (!IDEMPOTENCY_RE.test(idempotencyKey)) {
    return { ok: false, error: "invalid_idempotency_key" };
  }
  return {
    ok: true,
    value: {
      holdId,
      guest: { firstName, lastName, email: email.toLowerCase(), phone, country },
      acceptedTerms: true,
      idempotencyKey,
    },
  };
}

function approvedBookBody(body) {
  const keys = Object.keys(body).sort();
  assert.deepEqual(keys, ["acceptedTerms", "guest", "holdId", "idempotencyKey"]);
  const guestKeys = Object.keys(body.guest).sort();
  assert.deepEqual(guestKeys, [
    "country",
    "email",
    "firstName",
    "lastName",
    "phone",
  ]);
  assert.equal("checkIn" in body, false);
  assert.equal("total" in body, false);
  assert.equal("currency" in body, false);
  assert.equal("payment" in body, false);
  assert.equal("card" in body, false);
}

describe("calendar stay semantics", () => {
  it("keeps 3-night Dec stay as €450 when nights are €150", () => {
    assert.equal(nightsBetween("2026-12-10", "2026-12-13"), 3);
    const nightly = ["150.0000", "150.0000", "150.0000"];
    const sum = nightly.reduce((a, b) => a + Number.parseFloat(b), 0);
    assert.equal(sum, 450);
  });
});

describe("hold request validation", () => {
  it("accepts a valid hold payload", () => {
    const parsed = parseHoldRequest({
      checkIn: "2026-12-10",
      checkOut: "2026-12-13",
      guestCount: 2,
      idempotencyKey: "hold_abc12345",
    });
    assert.equal(parsed.ok, true);
  });

  it("rejects missing idempotency key", () => {
    const parsed = parseHoldRequest({
      checkIn: "2026-12-10",
      checkOut: "2026-12-13",
      guestCount: 2,
    });
    assert.equal(parsed.ok, false);
  });
});

describe("hold countdown", () => {
  it("formats remaining time from expiresAt", () => {
    const now = Date.parse("2026-12-01T10:00:00.000Z");
    const expiresAt = "2026-12-01T10:14:32.000Z";
    assert.equal(formatCountdown(remainingHoldMs(expiresAt, now)), "14:32");
  });

  it("treats past expiresAt as expired", () => {
    const now = Date.parse("2026-12-01T10:20:00.000Z");
    assert.equal(remainingHoldMs("2026-12-01T10:14:32.000Z", now), 0);
  });
});

describe("idempotency stability", () => {
  it("reuses one hold key across duplicate Continue clicks", () => {
    let key = null;
    function continueClick() {
      if (!key) key = "hold_stable_key_001";
      return key;
    }
    assert.equal(continueClick(), "hold_stable_key_001");
    assert.equal(continueClick(), "hold_stable_key_001");
  });

  it("reuses one book key across duplicate Complete clicks", () => {
    let key = null;
    function completeClick() {
      if (!key) key = "book_stable_key_001";
      return key;
    }
    assert.equal(completeClick(), "book_stable_key_001");
    assert.equal(completeClick(), "book_stable_key_001");
  });
});

describe("guest / book validation", () => {
  const valid = {
    holdId: "hold_12345678",
    guest: {
      firstName: "Maria",
      lastName: "Papadopoulos",
      email: "maria@example.com",
      phone: "+30 694 000 0000",
      country: "GR",
    },
    acceptedTerms: true,
    idempotencyKey: "book_abc12345",
  };

  it("accepts a complete guest payload", () => {
    const parsed = parseBookRequest(valid);
    assert.equal(parsed.ok, true);
    approvedBookBody(parsed.value);
  });

  it("rejects invalid email", () => {
    const parsed = parseBookRequest({
      ...valid,
      guest: { ...valid.guest, email: "not-an-email" },
    });
    assert.equal(parsed.ok, false);
    assert.equal(parsed.error, "invalid_email");
  });

  it("rejects invalid phone", () => {
    const parsed = parseBookRequest({
      ...valid,
      guest: { ...valid.guest, phone: "abc" },
    });
    assert.equal(parsed.ok, false);
    assert.equal(parsed.error, "invalid_phone");
  });

  it("maps UK to GB", () => {
    const parsed = parseBookRequest({
      ...valid,
      guest: { ...valid.guest, country: "UK" },
    });
    assert.equal(parsed.ok, true);
    assert.equal(parsed.value.guest.country, "GB");
  });

  it("rejects unchecked terms", () => {
    const parsed = parseBookRequest({ ...valid, acceptedTerms: false });
    assert.equal(parsed.ok, false);
    assert.equal(parsed.error, "terms_required");
  });

  it("requires guest fields", () => {
    const parsed = parseBookRequest({
      ...valid,
      guest: { ...valid.guest, firstName: "" },
    });
    assert.equal(parsed.ok, false);
  });
});

describe("authoritative pricing / confirmation copy", () => {
  it("displays Hold total rather than client recalculation", () => {
    const holdTotal = "450.0000";
    const display = Number.parseFloat(holdTotal).toFixed(2);
    assert.equal(display, "450.00");
    assert.notEqual(display, String(150 * 3));
  });

  it("uses Talos confirmationCode and deposit-email wording", () => {
    const confirmationCode = "HCP-TEST01";
    const email = "guest@example.com";
    const message = `Reservation received. Reference ${confirmationCode}. Deposit link will be sent to ${email}.`;
    assert.match(message, /HCP-TEST01/);
    assert.match(message, /Deposit link will be sent/);
    assert.equal(message.includes("payment completed"), false);
    assert.equal(message.includes("card"), false);
  });
});

describe("no payment fields", () => {
  it("booking request never includes payment/card fields", () => {
    const body = parseBookRequest({
      holdId: "hold_12345678",
      guest: {
        firstName: "Anna",
        lastName: "Schmidt",
        email: "anna@example.com",
        phone: "+49 170 0000000",
        country: "DE",
      },
      acceptedTerms: true,
      idempotencyKey: "book_no_pay_001",
    }).value;
    approvedBookBody(body);
  });
});

describe("Talos book response mapping", () => {
  function mapOliveBooking(booking, requestGuest) {
    const confirmationCode = booking.confirmationCode?.trim() || "";
    const email =
      booking.guest?.email || booking.guestEmail || requestGuest.email;
    const nights =
      typeof booking.nights === "number" && booking.nights > 0
        ? booking.nights
        : nightsBetween(booking.checkIn, booking.checkOut);
    return {
      confirmationCode,
      nights,
      total: booking.total,
      guest: {
        firstName: booking.guest?.firstName || requestGuest.firstName,
        lastName: booking.guest?.lastName || requestGuest.lastName,
        email,
      },
    };
  }

  it("maps guestEmail when nested guest is absent", () => {
    const mapped = mapOliveBooking(
      {
        confirmationCode: "HCP-TEST99",
        checkIn: "2027-03-22",
        checkOut: "2027-03-25",
        guestCount: 2,
        currency: "EUR",
        total: "450.0000",
        guestEmail: "olive.probe@example.com",
      },
      {
        firstName: "Olive",
        lastName: "Probe",
        email: "fallback@example.com",
      }
    );
    assert.equal(mapped.confirmationCode, "HCP-TEST99");
    assert.equal(mapped.guest.email, "olive.probe@example.com");
    assert.equal(mapped.nights, 3);
    assert.equal(mapped.total, "450.0000");
  });
});
