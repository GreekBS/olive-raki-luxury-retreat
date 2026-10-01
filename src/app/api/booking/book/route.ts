import { createDirectBookingBooking } from "@/lib/talos/client";
import {
  oliveBookingError,
  oliveBookingFromUnknown,
  oliveBookingSuccess,
} from "@/lib/talos/olive-response";
import { parseBookRequest } from "@/lib/talos/validate";

export const dynamic = "force-dynamic";

function nightsBetween(checkIn: string, checkOut: string): number {
  const start = Date.UTC(
    Number(checkIn.slice(0, 4)),
    Number(checkIn.slice(5, 7)) - 1,
    Number(checkIn.slice(8, 10))
  );
  const end = Date.UTC(
    Number(checkOut.slice(0, 4)),
    Number(checkOut.slice(5, 7)) - 1,
    Number(checkOut.slice(8, 10))
  );
  return Math.round((end - start) / 86_400_000);
}

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

    const confirmationCode = booking.confirmationCode?.trim() || "";
    const email =
      booking.guest?.email ||
      booking.guestEmail ||
      parsed.value.guest.email;
    const total = booking.total || "";
    const currency = booking.currency || "EUR";
    const nights =
      typeof booking.nights === "number" && booking.nights > 0
        ? booking.nights
        : nightsBetween(booking.checkIn, booking.checkOut);

    if (!confirmationCode || !booking.checkIn || !booking.checkOut || !total) {
      return oliveBookingError(
        "UPSTREAM_ERROR",
        "We could not complete your reservation. Please try again shortly.",
        502
      );
    }

    return oliveBookingSuccess({
      confirmationCode,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights,
      guestCount: booking.guestCount,
      currency,
      total,
      guest: {
        firstName: booking.guest?.firstName || parsed.value.guest.firstName,
        lastName: booking.guest?.lastName || parsed.value.guest.lastName,
        email,
      },
    });
  } catch (error) {
    return oliveBookingFromUnknown(error);
  }
}
