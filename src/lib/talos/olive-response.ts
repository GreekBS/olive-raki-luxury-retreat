import { NextResponse } from "next/server";
import { TalosDirectBookingError } from "@/lib/talos/client";
import type { OliveBookingErrorCode } from "@/lib/talos/types";

const FRIENDLY: Record<string, { code: OliveBookingErrorCode; message: string; status: number }> = {
  CONFIG_MISSING: {
    code: "CONFIG_MISSING",
    message: "Online booking is being prepared. Please contact us on WhatsApp in the meantime.",
    status: 503,
  },
  NOT_BOOKABLE: {
    code: "NOT_BOOKABLE",
    message: "Online booking is not available yet. Please contact us on WhatsApp to reserve your stay.",
    status: 403,
  },
  FORBIDDEN: {
    code: "NOT_BOOKABLE",
    message: "Online booking is not available yet. Please contact us on WhatsApp to reserve your stay.",
    status: 403,
  },
  UNAUTHORIZED: {
    code: "NOT_BOOKABLE",
    message: "Online booking is not available yet. Please contact us on WhatsApp to reserve your stay.",
    status: 403,
  },
  ORIGIN_NOT_ALLOWED: {
    code: "NOT_BOOKABLE",
    message: "Online booking is not available from this site yet. Please contact us on WhatsApp.",
    status: 403,
  },
  UNAVAILABLE: {
    code: "UNAVAILABLE",
    message: "Those dates are not available. Please try different dates.",
    status: 400,
  },
  GUEST_LIMIT: {
    code: "GUEST_LIMIT",
    message: "That guest count is not available for this retreat.",
    status: 400,
  },
  VALIDATION_ERROR: {
    code: "VALIDATION_ERROR",
    message: "Please check your dates and guest count.",
    status: 400,
  },
  RATE_LIMITED: {
    code: "RATE_LIMITED",
    message: "Too many requests. Please wait a moment and try again.",
    status: 429,
  },
  NOT_FOUND: {
    code: "NOT_BOOKABLE",
    message: "Online booking is not available yet. Please contact us on WhatsApp to reserve your stay.",
    status: 404,
  },
  UPSTREAM_ERROR: {
    code: "UPSTREAM_ERROR",
    message: "We could not reach the booking service. Please try again shortly, or contact us on WhatsApp.",
    status: 502,
  },
  INTERNAL_ERROR: {
    code: "INTERNAL_ERROR",
    message: "Something went wrong. Please try again shortly, or contact us on WhatsApp.",
    status: 500,
  },
};

function mapTalosCode(code: string, message: string) {
  const lower = message.toLowerCase();
  if (code === "VALIDATION_ERROR" && lower.includes("not available")) {
    return FRIENDLY.UNAVAILABLE;
  }
  if (
    code === "VALIDATION_ERROR" &&
    (lower.includes("direct booking not available") || lower.includes("pricing is not configured"))
  ) {
    return FRIENDLY.NOT_BOOKABLE;
  }
  if (code === "VALIDATION_ERROR" && lower.includes("guest")) {
    return FRIENDLY.GUEST_LIMIT;
  }
  return FRIENDLY[code] ?? {
    code: "UPSTREAM_ERROR" as OliveBookingErrorCode,
    message: FRIENDLY.UPSTREAM_ERROR.message,
    status: 502,
  };
}

export function oliveBookingSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data, error: null }, { status });
}

export function oliveBookingError(
  code: OliveBookingErrorCode,
  message: string,
  status: number
) {
  return NextResponse.json(
    {
      data: null,
      error: { code, message },
    },
    { status }
  );
}

export function oliveBookingFromUnknown(error: unknown) {
  if (error instanceof TalosDirectBookingError) {
    const mapped = mapTalosCode(error.code, error.upstreamMessage);
    return oliveBookingError(mapped.code, mapped.message, mapped.status);
  }

  return oliveBookingError(
    "INTERNAL_ERROR",
    FRIENDLY.INTERNAL_ERROR.message,
    500
  );
}
