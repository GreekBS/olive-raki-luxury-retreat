import {
  fetchDirectBookingConfig,
} from "@/lib/talos/client";
import {
  oliveBookingFromUnknown,
  oliveBookingSuccess,
} from "@/lib/talos/olive-response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await fetchDirectBookingConfig();

    return oliveBookingSuccess({
      bookable: config.bookable,
      notBookableReasons: config.notBookableReasons,
      propertyName: config.property.name,
      currency: config.currency,
      maxGuests: config.unit.maxGuests,
      stayRules: config.stayRules
        ? {
            minNights: config.stayRules.minNights,
            maxNights: config.stayRules.maxNights,
          }
        : null,
      timezone: config.property.timezone,
    });
  } catch (error) {
    return oliveBookingFromUnknown(error);
  }
}
