import { createDirectBookingHold } from "@/lib/talos/client";
import {
  oliveBookingError,
  oliveBookingFromUnknown,
  oliveBookingSuccess,
} from "@/lib/talos/olive-response";
import { parseHoldRequest } from "@/lib/talos/validate";

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

    const parsed = parseHoldRequest(body);
    if (!parsed.ok) {
      return oliveBookingError("VALIDATION_ERROR", parsed.message, 400);
    }

    const hold = await createDirectBookingHold(parsed.value);

    // Tolerate minor public-DTO nesting differences without inventing prices.
    const total =
      hold.total ||
      (hold as { quote?: { total?: string } }).quote?.total ||
      "";
    const subtotal =
      hold.subtotal ||
      (hold as { quote?: { subtotal?: string } }).quote?.subtotal ||
      total;
    const currency =
      hold.currency ||
      (hold as { quote?: { currency?: string } }).quote?.currency ||
      "";

    if (!hold.holdId || !hold.expiresAt || !total || !currency) {
      return oliveBookingError(
        "UPSTREAM_ERROR",
        "We could not reserve these dates temporarily. Please try again.",
        502
      );
    }

    return oliveBookingSuccess({
      holdId: hold.holdId,
      expiresAt: hold.expiresAt,
      checkIn: hold.checkIn,
      checkOut: hold.checkOut,
      nights: hold.nights,
      guestCount: hold.guestCount,
      currency,
      subtotal,
      total,
    });
  } catch (error) {
    return oliveBookingFromUnknown(error);
  }
}
