"use client";

import {
  COUNTRY_OPTIONS,
  formatDisplayDate,
  formatMoney,
} from "@/lib/booking/checkout";
import { HoldCountdown } from "@/components/booking/HoldCountdown";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { FormEvent, useState } from "react";

export type CheckoutHold = {
  holdId: string;
  expiresAt: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestCount: number;
  currency: string;
  total: string;
  subtotal?: string;
};

export type CheckoutGuest = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
};

type BookingCheckoutProps = {
  hold: CheckoutHold;
  submitting: boolean;
  errorMessage: string | null;
  onExpired: () => void;
  onCancel: () => void;
  onSubmit: (guest: CheckoutGuest, acceptedTerms: boolean) => void;
};

const fieldClass =
  "w-full border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition-colors focus:border-terracotta-400 focus:ring-1 focus:ring-terracotta-400/40";

const labelClass =
  "mb-2 block text-left text-[11px] font-medium uppercase tracking-[0.22em] text-white/70";

export function BookingCheckout({
  hold,
  submitting,
  errorMessage,
  onExpired,
  onCancel,
  onSubmit,
}: BookingCheckoutProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("GR");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setLocalError("Please enter your first and last name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setLocalError("Please enter a valid email address.");
      return;
    }
    if (!phone.trim()) {
      setLocalError("Please enter a valid phone number including country code.");
      return;
    }
    if (!country) {
      setLocalError("Please select your country.");
      return;
    }
    if (!acceptedTerms) {
      setLocalError("Please agree to the booking terms and cancellation policy.");
      return;
    }
    if (remainingExpired(hold.expiresAt)) {
      onExpired();
      return;
    }

    onSubmit(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        country,
      },
      true
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <p className={labelClass}>Guest details</p>
          <p className="text-sm leading-relaxed text-white/70">
            Complete your details to register your reservation. A deposit payment
            link will follow by email.
          </p>
        </div>

        <HoldCountdown expiresAt={hold.expiresAt} onExpired={onExpired} />

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="guest-first-name" className={labelClass}>
              First name
            </label>
            <input
              id="guest-first-name"
              name="firstName"
              autoComplete="given-name"
              required
              disabled={submitting}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="guest-last-name" className={labelClass}>
              Last name
            </label>
            <input
              id="guest-last-name"
              name="lastName"
              autoComplete="family-name"
              required
              disabled={submitting}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="guest-email" className={labelClass}>
            Email
          </label>
          <input
            id="guest-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={submitting}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="guest-phone" className={labelClass}>
            Phone
          </label>
          <input
            id="guest-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            disabled={submitting}
            placeholder="+30 …"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="guest-country" className={labelClass}>
            Country
          </label>
          <select
            id="guest-country"
            name="country"
            required
            disabled={submitting}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className={cn(fieldClass, "appearance-none")}
          >
            {COUNTRY_OPTIONS.map((option) => (
              <option
                key={option.code}
                value={option.code}
                className="bg-sand-900 text-white"
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-start gap-3 text-sm leading-relaxed text-white/80">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 accent-terracotta-500"
            checked={acceptedTerms}
            disabled={submitting}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
          />
          <span>
            I agree to the booking terms and cancellation policy.
          </span>
        </label>

        <p className="text-sm leading-relaxed text-white/70">
          Your reservation will be registered with the total shown. A deposit is
          required for your stay. After completing your reservation, we will send
          a secure payment link to the email address you provide.
        </p>

        {(localError || errorMessage) && (
          <p className="text-sm text-terracotta-400" aria-live="polite">
            {localError || errorMessage}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            type="submit"
            variant="secondary"
            size="lg"
            disabled={submitting}
            className="w-full sm:w-auto"
          >
            {submitting ? "Completing…" : "Complete reservation"}
          </Button>
          <button
            type="button"
            disabled={submitting}
            onClick={onCancel}
            className="text-[11px] uppercase tracking-[0.18em] text-white/55 transition-colors hover:text-white"
          >
            Choose different dates
          </button>
        </div>
      </form>

      <aside className="border border-white/15 bg-white/5 px-5 py-6 text-left">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-terracotta-400">
          Booking summary
        </p>
        <p className="mt-3 font-serif text-2xl font-light text-white">
          Olive &amp; Raki Luxury Retreat
        </p>
        <dl className="mt-6 space-y-3 text-sm text-white/75">
          <div className="flex justify-between gap-4">
            <dt>Check-in</dt>
            <dd className="text-white">{formatDisplayDate(hold.checkIn)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Check-out</dt>
            <dd className="text-white">{formatDisplayDate(hold.checkOut)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Stay</dt>
            <dd className="text-white">
              {hold.nights} {hold.nights === 1 ? "night" : "nights"} ·{" "}
              {hold.guestCount} {hold.guestCount === 1 ? "guest" : "guests"}
            </dd>
          </div>
        </dl>
        <div className="mt-6 border-t border-white/15 pt-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">
            Total stay
          </p>
          <p className="mt-2 font-serif text-3xl font-light text-white">
            {formatMoney(hold.total, hold.currency)}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-white/50">
            Authoritative total from Talos. No payment is taken on this page.
          </p>
        </div>
      </aside>
    </div>
  );
}

function remainingExpired(expiresAt: string) {
  const expires = Date.parse(expiresAt);
  return Number.isNaN(expires) || expires <= Date.now();
}
