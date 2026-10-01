import "server-only";

import type {
  BookRequest,
  CalendarRequest,
  DirectBookingAvailability,
  DirectBookingBooking,
  DirectBookingCalendar,
  DirectBookingHold,
  DirectBookingPublicConfig,
  DirectBookingQuote,
  HoldRequest,
  StayRequest,
  TalosEnvelope,
} from "./types";

export class TalosDirectBookingError extends Error {
  readonly status: number;
  readonly code: string;
  readonly upstreamMessage: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "TalosDirectBookingError";
    this.status = status;
    this.code = code;
    this.upstreamMessage = message;
  }
}

function getConfig() {
  const apiUrl = process.env.TALOS_DIRECT_BOOKING_API_URL?.replace(/\/$/, "");
  const apiKey = process.env.TALOS_DIRECT_BOOKING_KEY;
  const origin =
    process.env.TALOS_DIRECT_BOOKING_ORIGIN?.trim() ||
    "https://oliveandraki.gr";

  if (!apiUrl || !apiKey) {
    throw new TalosDirectBookingError(
      503,
      "CONFIG_MISSING",
      "Direct Booking is not configured"
    );
  }

  if (!/^dbk_(test|live)_[A-Za-z0-9]{16,64}$/.test(apiKey)) {
    throw new TalosDirectBookingError(
      503,
      "CONFIG_MISSING",
      "Direct Booking is not configured"
    );
  }

  return { apiUrl, apiKey, origin };
}

async function talosFetch<T>(
  path: string,
  init?: { method?: string; body?: unknown }
): Promise<T> {
  const { apiUrl, apiKey, origin } = getConfig();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
    Origin: origin,
  };

  if (init?.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      method: init?.method ?? "GET",
      headers,
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new TalosDirectBookingError(
      502,
      "UPSTREAM_ERROR",
      "Unable to reach booking service"
    );
  }

  let envelope: TalosEnvelope<T> | null = null;
  try {
    envelope = (await response.json()) as TalosEnvelope<T>;
  } catch {
    throw new TalosDirectBookingError(
      502,
      "UPSTREAM_ERROR",
      "Invalid response from booking service"
    );
  }

  if (!response.ok || envelope.error || envelope.data === null) {
    const code = envelope.error?.code ?? "UPSTREAM_ERROR";
    const message = envelope.error?.message ?? "Booking service error";
    throw new TalosDirectBookingError(response.status, code, message);
  }

  return envelope.data;
}

export async function fetchDirectBookingConfig(): Promise<DirectBookingPublicConfig> {
  return talosFetch<DirectBookingPublicConfig>("/api/direct-booking/v1/config");
}

export async function checkDirectBookingAvailability(
  stay: StayRequest
): Promise<DirectBookingAvailability> {
  return talosFetch<DirectBookingAvailability>(
    "/api/direct-booking/v1/availability",
    { method: "POST", body: stay }
  );
}

export async function quoteDirectBookingStay(
  stay: StayRequest
): Promise<DirectBookingQuote> {
  return talosFetch<DirectBookingQuote>("/api/direct-booking/v1/quote", {
    method: "POST",
    body: stay,
  });
}

export async function fetchDirectBookingCalendar(
  request: CalendarRequest
): Promise<DirectBookingCalendar> {
  return talosFetch<DirectBookingCalendar>("/api/direct-booking/v1/calendar", {
    method: "POST",
    body: request,
  });
}

export async function createDirectBookingHold(
  request: HoldRequest
): Promise<DirectBookingHold> {
  return talosFetch<DirectBookingHold>("/api/direct-booking/v1/hold", {
    method: "POST",
    body: {
      checkIn: request.checkIn,
      checkOut: request.checkOut,
      guestCount: request.guestCount,
      idempotencyKey: request.idempotencyKey,
    },
  });
}

export async function createDirectBookingBooking(
  request: BookRequest
): Promise<DirectBookingBooking> {
  return talosFetch<DirectBookingBooking>("/api/direct-booking/v1/book", {
    method: "POST",
    body: {
      holdId: request.holdId,
      guest: {
        firstName: request.guest.firstName,
        lastName: request.guest.lastName,
        email: request.guest.email,
        phone: request.guest.phone,
        country: request.guest.country,
      },
      acceptedTerms: request.acceptedTerms,
      idempotencyKey: request.idempotencyKey,
    },
  });
}
