/** Talos Direct Booking public DTOs (Phase 1) — mirror of Talos contracts. */

export type DirectBookingNotBookableReason =
  | "integration_inactive"
  | "property_not_active"
  | "unit_not_active"
  | "rate_plan_missing";

export interface DirectBookingPublicConfig {
  integrationId: string;
  environment: "test" | "live";
  bookable: boolean;
  notBookableReasons: DirectBookingNotBookableReason[];
  property: {
    name: string;
    type: "villa" | "apartment" | "hotel" | "other";
    timezone: string;
  };
  unit: {
    name: string;
    maxGuests: number;
    bedrooms: number;
    bathrooms: number;
  };
  currency: string;
  stayRules: {
    minNights: number;
    maxNights: number;
    checkInDays: number[];
    checkOutDays: number[];
    advanceMinDays: number;
    advanceMaxDays: number;
    turnoverNights: number;
  } | null;
}

export interface DirectBookingAvailability {
  available: boolean;
  checkIn: string;
  checkOut: string;
  nights: number;
  currency: string;
  reasonCodes: string[];
}

export interface DirectBookingQuote {
  checkIn: string;
  checkOut: string;
  nights: number;
  guestCount: number;
  currency: string;
  subtotal: string;
  total: string;
  lineItems: Array<{
    date: string;
    amount: string;
    currency: string;
  }>;
  quotedAt: string;
}

export interface StayRequest {
  checkIn: string;
  checkOut: string;
  guestCount: number;
}

export interface CalendarRequest {
  from: string;
  to: string;
  guestCount: number;
}

export interface DirectBookingCalendarDay {
  date: string;
  available: boolean;
  nightlyPrice: string | null;
  currency: string;
  checkInAllowed: boolean;
  checkOutAllowed: boolean;
}

export interface DirectBookingCalendar {
  currency: string;
  timezone: string;
  minNights: number;
  maxNights: number;
  maxGuests: number;
  days: DirectBookingCalendarDay[];
}

export interface TalosEnvelope<T> {
  data: T | null;
  error: { code: string; message: string } | null;
  meta?: { requestId?: string; locale?: string };
}

export type OliveBookingErrorCode =
  | "VALIDATION_ERROR"
  | "UNAVAILABLE"
  | "NOT_BOOKABLE"
  | "GUEST_LIMIT"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "ORIGIN_NOT_ALLOWED"
  | "RATE_LIMITED"
  | "NOT_FOUND"
  | "INTERNAL_ERROR"
  | "CONFIG_MISSING"
  | "UPSTREAM_ERROR";

export interface OliveBookingErrorBody {
  data: null;
  error: {
    code: OliveBookingErrorCode;
    message: string;
  };
}
