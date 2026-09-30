import { fetchDirectBookingCalendar } from "@/lib/talos/client";
import {
  oliveBookingError,
  oliveBookingFromUnknown,
  oliveBookingSuccess,
} from "@/lib/talos/olive-response";
import { parseCalendarRequest } from "@/lib/talos/validate";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return oliveBookingError(
        "VALIDATION_ERROR",
        "Please provide a calendar date range.",
        400
      );
    }

    const parsed = parseCalendarRequest(body);
    if (!parsed.ok) {
      return oliveBookingError("VALIDATION_ERROR", parsed.message, 400);
    }

    const calendar = await fetchDirectBookingCalendar(parsed.value);

    return oliveBookingSuccess({
      currency: calendar.currency,
      timezone: calendar.timezone,
      minNights: calendar.minNights,
      maxNights: calendar.maxNights,
      maxGuests: calendar.maxGuests,
      days: calendar.days.map((day) => ({
        date: day.date,
        available: day.available,
        nightlyPrice: day.nightlyPrice,
        currency: day.currency,
        checkInAllowed: day.checkInAllowed,
        checkOutAllowed: day.checkOutAllowed,
      })),
    });
  } catch (error) {
    return oliveBookingFromUnknown(error);
  }
}
