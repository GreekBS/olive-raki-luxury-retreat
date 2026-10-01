import { createDirectBookingBooking } from "@/lib/talos/client";
import {
  oliveBookingError,
  oliveBookingFromUnknown,
  oliveBookingSuccess,
} from "@/lib/talos/olive-response";
import { parseBookRequest } from "@/lib/talos/validate";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return oliveBookingError(
        "VALIDATION_ERROR",
        "Please complete your guest details.",
        400
      );
    }

    const parsed = parseBookRequest(body);
    if (!parsed.ok) {
      return oliveBookingError("VALIDATION_ERROR", parsed.message, 400);
    }

    // Strict body only — stay/pricing derived by Talos from holdId.
    const booking = await createDirectBookingBooking(parsed.value);

    return oliveBookingSuccess({
      confirmationCode: booking.confirmationCode,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights: booking.nights,
      guestCount: booking.guestCount,
      currency: booking.currency,
      total: booking.total,
      guest: {
        firstName: booking.guest.firstName,
        lastName: booking.guest.lastName,
        email: booking.guest.email,
      },
    });
  } catch (error) {
    return oliveBookingFromUnknown(error);
  }
}
