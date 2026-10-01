"use client";

import { formatDisplayDate, formatMoney } from "@/lib/booking/checkout";
import { Button } from "@/components/ui/Button";
import { whatsappBookingUrl } from "@/lib/contact";

export type BookingConfirmation = {
  confirmationCode: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestCount: number;
  currency: string;
  total: string;
  email: string;
};

type BookingConfirmationProps = {
  booking: BookingConfirmation;
  onBookAnother: () => void;
};

export function BookingConfirmationView({
  booking,
  onBookAnother,
}: BookingConfirmationProps) {
  return (
    <div className="border border-white/20 bg-white/10 px-5 py-8 text-center md:px-8">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-terracotta-400">
        Reservation received
      </p>
      <p className="mt-4 font-serif text-3xl font-light text-white md:text-4xl">
        Your stay is registered
      </p>
      <p className="mt-5 text-sm text-white/70">Booking reference</p>
      <p className="mt-2 font-serif text-2xl tracking-[0.08em] text-white">
        {booking.confirmationCode}
      </p>

      <div className="mx-auto mt-8 max-w-md space-y-3 text-sm leading-relaxed text-white/80">
        <p className="font-medium text-white">Olive &amp; Raki Luxury Retreat</p>
        <p>
          {formatDisplayDate(booking.checkIn)} –{" "}
          {formatDisplayDate(booking.checkOut)}
        </p>
        <p>
          {booking.nights} {booking.nights === 1 ? "night" : "nights"} ·{" "}
          {booking.guestCount}{" "}
          {booking.guestCount === 1 ? "guest" : "guests"}
        </p>
        <p className="font-serif text-2xl font-light text-white">
          {formatMoney(booking.total, booking.currency)}
        </p>
        <p>{booking.email}</p>
      </div>

      <p className="mx-auto mt-8 max-w-xl text-sm leading-relaxed text-white/70">
        Your reservation has been registered successfully. A deposit is required
        for your stay. We will send a secure payment link to{" "}
        <span className="text-white">{booking.email}</span>. Please use your
        booking reference in any communication regarding your reservation.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button type="button" variant="secondary" size="md" onClick={onBookAnother}>
          Check other dates
        </Button>
        <Button
          href={whatsappBookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          variant="ghost"
          size="md"
        >
          WhatsApp
        </Button>
      </div>
    </div>
  );
}
