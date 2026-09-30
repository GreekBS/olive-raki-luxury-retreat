import { quoteDirectBookingStay } from "@/lib/talos/client";
import {
  oliveBookingError,
  oliveBookingFromUnknown,
  oliveBookingSuccess,
} from "@/lib/talos/olive-response";
import { parseStayRequest } from "@/lib/talos/validate";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return oliveBookingError(
        "VALIDATION_ERROR",
        "Please select check-in and check-out dates.",
        400
      );
    }

    const parsed = parseStayRequest(body);
    if (!parsed.ok) {
      return oliveBookingError("VALIDATION_ERROR", parsed.message, 400);
    }

    // Strict stay body only — never forward client-supplied totals or rates.
    const quote = await quoteDirectBookingStay(parsed.value);

    return oliveBookingSuccess({
      checkIn: quote.checkIn,
      checkOut: quote.checkOut,
      nights: quote.nights,
      guestCount: quote.guestCount,
      currency: quote.currency,
      subtotal: quote.subtotal,
      total: quote.total,
      quotedAt: quote.quotedAt,
    });
  } catch (error) {
    return oliveBookingFromUnknown(error);
  }
}
