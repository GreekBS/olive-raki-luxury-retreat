import { checkDirectBookingAvailability } from "@/lib/talos/client";
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

    const availability = await checkDirectBookingAvailability(parsed.value);

    return oliveBookingSuccess({
      available: availability.available,
      checkIn: availability.checkIn,
      checkOut: availability.checkOut,
      nights: availability.nights,
      currency: availability.currency,
      reasonCodes: availability.reasonCodes,
    });
  } catch (error) {
    return oliveBookingFromUnknown(error);
  }
}
