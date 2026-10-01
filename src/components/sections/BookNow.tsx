"use client";

import {
  BookingCalendar,
  type BookingCalendarSelection,
} from "@/components/booking/BookingCalendar";
import {
  BookingCheckout,
  type CheckoutGuest,
  type CheckoutHold,
} from "@/components/booking/BookingCheckout";
import {
  BookingConfirmationView,
  type BookingConfirmation,
} from "@/components/booking/BookingConfirmation";
import { Button } from "@/components/ui/Button";
import {
  createIdempotencyKey,
  formatDisplayDate,
  formatMoney,
} from "@/lib/booking/checkout";
import { whatsappBookingUrl } from "@/lib/contact";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

type FlowStep = "select" | "checkout" | "confirmed";

type UiState =
  | "initial"
  | "loading"
  | "quote"
  | "holding"
  | "booking"
  | "unavailable"
  | "invalid"
  | "not_ready"
  | "error"
  | "hold_expired";

interface BookingConfig {
  bookable: boolean;
  maxGuests: number;
  currency: string;
  stayRules: { minNights: number; maxNights: number } | null;
}

interface QuoteResult {
  checkIn: string;
  checkOut: string;
  nights: number;
  guestCount: number;
  currency: string;
  total: string;
  subtotal: string;
}

interface ApiEnvelope<T> {
  data: T | null;
  error: { code: string; message: string } | null;
}

const fieldClass =
  "w-full border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition-colors focus:border-terracotta-400 focus:ring-1 focus:ring-terracotta-400/40 [color-scheme:dark]";

const labelClass =
  "mb-2 block text-left text-[11px] font-medium uppercase tracking-[0.22em] text-white/70";

/**
 * Refresh policy: Hold/guest checkout state is in-memory only.
 * A page refresh returns the guest to calendar selection rather than
 * attempting unsafe Hold restoration without a public Hold-get API.
 */
export function BookNow() {
  const [step, setStep] = useState<FlowStep>("select");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [selectionValid, setSelectionValid] = useState(false);
  const [guests, setGuests] = useState(2);
  const [config, setConfig] = useState<BookingConfig | null>(null);
  const [state, setState] = useState<UiState>("initial");
  const [message, setMessage] = useState<string | null>(null);
  const [calendarHint, setCalendarHint] = useState<string | null>(null);
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [hold, setHold] = useState<CheckoutHold | null>(null);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(
    null
  );
  const [calendarRefresh, setCalendarRefresh] = useState(0);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const holdIdempotencyRef = useRef<string | null>(null);
  const bookIdempotencyRef = useRef<string | null>(null);

  const maxGuests = config?.maxGuests ?? 8;
  const bookingDisabled = state === "not_ready";
  const minNights = config?.stayRules?.minNights ?? 1;
  const maxNights = config?.stayRules?.maxNights ?? 30;
  const busy =
    state === "loading" || state === "holding" || state === "booking";

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      try {
        const res = await fetch("/api/booking/config", { cache: "no-store" });
        const json = (await res.json()) as ApiEnvelope<BookingConfig>;

        if (cancelled) return;

        if (!res.ok || !json.data) {
          setState("not_ready");
          setMessage(
            json.error?.message ??
              "Online booking is being prepared. Please contact us on WhatsApp to reserve your stay."
          );
          return;
        }

        setConfig(json.data);
        setGuests((current) =>
          Math.min(Math.max(current, 1), json.data!.maxGuests)
        );

        if (!json.data.bookable) {
          setState("not_ready");
          setMessage(
            "Online booking is not available yet. Please contact us on WhatsApp to reserve your stay."
          );
        }
      } catch {
        if (!cancelled) {
          setState("not_ready");
          setMessage(
            "Online booking is being prepared. Please contact us on WhatsApp to reserve your stay."
          );
        }
      }
    }

    void loadConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  const resetToSelect = useCallback((opts?: { refreshCalendar?: boolean }) => {
    setStep("select");
    setHold(null);
    setConfirmation(null);
    setCheckoutError(null);
    setQuote(null);
    holdIdempotencyRef.current = null;
    bookIdempotencyRef.current = null;
    setState("initial");
    setMessage(null);
    if (opts?.refreshCalendar) {
      setCalendarRefresh((n) => n + 1);
    }
  }, []);

  const handleHoldExpired = useCallback(() => {
    setHold(null);
    holdIdempotencyRef.current = null;
    bookIdempotencyRef.current = null;
    setStep("select");
    setState("hold_expired");
    setMessage(
      "Your temporary reservation expired. Please select your dates again."
    );
    setCalendarRefresh((n) => n + 1);
  }, []);

  function handleSelectionChange(selection: BookingCalendarSelection) {
    setCheckIn(selection.checkIn ?? "");
    setCheckOut(selection.checkOut ?? "");
    setSelectionValid(selection.valid);
    setQuote(null);
    setHold(null);
    setConfirmation(null);
    setCheckoutError(null);
    holdIdempotencyRef.current = null;
    bookIdempotencyRef.current = null;
    setMessage(null);
    if (
      state === "quote" ||
      state === "unavailable" ||
      state === "invalid" ||
      state === "hold_expired"
    ) {
      setState("initial");
    }
    if (step !== "select") setStep("select");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step !== "select") return;

    setQuote(null);
    setMessage(null);
    holdIdempotencyRef.current = null;
    bookIdempotencyRef.current = null;

    if (!checkIn || !checkOut || !selectionValid) {
      setState("invalid");
      setMessage(
        calendarHint ??
          (checkIn && checkOut
            ? `Minimum stay: ${minNights} nights`
            : "Please select check-in and check-out dates on the calendar.")
      );
      return;
    }

    if (!Number.isInteger(guests) || guests < 1 || guests > maxGuests) {
      setState("invalid");
      setMessage(`Please choose between 1 and ${maxGuests} guests.`);
      return;
    }

    setState("loading");
    const stay = { checkIn, checkOut, guestCount: guests };

    try {
      const availabilityRes = await fetch("/api/booking/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stay),
      });
      const availabilityJson = (await availabilityRes.json()) as ApiEnvelope<{
        available: boolean;
        nights: number;
        currency: string;
      }>;

      if (
        availabilityRes.status === 403 ||
        availabilityJson.error?.code === "NOT_BOOKABLE" ||
        availabilityJson.error?.code === "CONFIG_MISSING"
      ) {
        setState("not_ready");
        setMessage(
          availabilityJson.error?.message ??
            "Online booking is not available yet. Please contact us on WhatsApp."
        );
        return;
      }

      if (!availabilityRes.ok || !availabilityJson.data) {
        if (availabilityJson.error?.code === "UNAVAILABLE") {
          setState("unavailable");
          setMessage(
            availabilityJson.error.message ||
              "Those dates are not available. Please try different dates."
          );
          setCalendarRefresh((n) => n + 1);
          return;
        }
        if (availabilityJson.error?.code === "VALIDATION_ERROR") {
          setState("invalid");
          setMessage(availabilityJson.error.message);
          return;
        }
        setState("error");
        setMessage(
          availabilityJson.error?.message ??
            "We could not check availability right now. Please try again or contact us on WhatsApp."
        );
        return;
      }

      if (!availabilityJson.data.available) {
        setState("unavailable");
        setMessage(
          "Those dates are not available. Please try different dates, or ask us on WhatsApp."
        );
        setCalendarRefresh((n) => n + 1);
        return;
      }

      const quoteRes = await fetch("/api/booking/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stay),
      });
      const quoteJson = (await quoteRes.json()) as ApiEnvelope<QuoteResult>;

      if (
        quoteRes.status === 403 ||
        quoteJson.error?.code === "NOT_BOOKABLE" ||
        quoteJson.error?.code === "CONFIG_MISSING"
      ) {
        setState("not_ready");
        setMessage(
          quoteJson.error?.message ??
            "Online booking is not available yet. Please contact us on WhatsApp."
        );
        return;
      }

      if (!quoteRes.ok || !quoteJson.data) {
        if (quoteJson.error?.code === "UNAVAILABLE") {
          setState("unavailable");
          setMessage(
            quoteJson.error.message ||
              "Those dates are not available. Please try different dates."
          );
          setCalendarRefresh((n) => n + 1);
          return;
        }
        if (quoteJson.error?.code === "VALIDATION_ERROR") {
          setState("invalid");
          setMessage(quoteJson.error.message);
          return;
        }
        setState("error");
        setMessage(
          quoteJson.error?.message ??
            "We could not retrieve pricing right now. Please try again or contact us on WhatsApp."
        );
        return;
      }

      setQuote(quoteJson.data);
      setState("quote");
    } catch {
      setState("error");
      setMessage(
        "We could not reach the booking service. Please try again shortly, or contact us on WhatsApp."
      );
    }
  }

  async function handleContinueToBooking() {
    if (!quote || state === "holding") return;

    if (!holdIdempotencyRef.current) {
      holdIdempotencyRef.current = createIdempotencyKey("hold");
    }

    setState("holding");
    setMessage(null);
    setCheckoutError(null);

    try {
      const res = await fetch("/api/booking/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkIn: quote.checkIn,
          checkOut: quote.checkOut,
          guestCount: quote.guestCount,
          idempotencyKey: holdIdempotencyRef.current,
        }),
      });
      const json = (await res.json()) as ApiEnvelope<CheckoutHold>;

      if (!res.ok || !json.data) {
        const code = json.error?.code;
        if (code === "HOLD_CONFLICT" || code === "UNAVAILABLE") {
          setState("unavailable");
          setMessage(
            json.error?.message ??
              "Those dates are no longer available. Please choose different dates."
          );
          setQuote(null);
          holdIdempotencyRef.current = null;
          setCalendarRefresh((n) => n + 1);
          return;
        }
        if (code === "NOT_BOOKABLE" || code === "CONFIG_MISSING") {
          setState("not_ready");
          setMessage(json.error?.message ?? "Online booking is not available.");
          return;
        }
        setState("error");
        setMessage(
          json.error?.message ??
            "We could not reserve these dates temporarily. Please try again."
        );
        return;
      }

      setHold(json.data);
      bookIdempotencyRef.current = null;
      setStep("checkout");
      setState("initial");
    } catch {
      setState("error");
      setMessage(
        "We could not reach the booking service. Please try again shortly, or contact us on WhatsApp."
      );
    }
  }

  async function handleCompleteReservation(
    guest: CheckoutGuest,
    acceptedTerms: boolean
  ) {
    if (!hold || state === "booking") return;

    if (Date.parse(hold.expiresAt) <= Date.now()) {
      handleHoldExpired();
      return;
    }

    if (!bookIdempotencyRef.current) {
      bookIdempotencyRef.current = createIdempotencyKey("book");
    }

    setState("booking");
    setCheckoutError(null);

    try {
      const res = await fetch("/api/booking/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          holdId: hold.holdId,
          guest,
          acceptedTerms,
          idempotencyKey: bookIdempotencyRef.current,
        }),
      });
      const json = (await res.json()) as ApiEnvelope<{
        confirmationCode: string;
        checkIn: string;
        checkOut: string;
        nights: number;
        guestCount: number;
        currency: string;
        total: string;
        guest: { firstName: string; lastName: string; email: string };
      }>;

      if (!res.ok || !json.data) {
        const code = json.error?.code;
        if (code === "HOLD_EXPIRED") {
          handleHoldExpired();
          return;
        }
        if (code === "HOLD_CONFLICT" || code === "UNAVAILABLE") {
          setCheckoutError(null);
          setHold(null);
          setStep("select");
          setState("unavailable");
          setMessage(
            json.error?.message ??
              "Those dates are no longer available. Please choose different dates."
          );
          holdIdempotencyRef.current = null;
          bookIdempotencyRef.current = null;
          setCalendarRefresh((n) => n + 1);
          return;
        }
        if (code === "VALIDATION_ERROR") {
          setState("initial");
          setCheckoutError(json.error?.message ?? "Please check your details.");
          return;
        }
        setState("initial");
        setCheckoutError(
          json.error?.message ??
            "We could not complete your reservation. Please try again."
        );
        return;
      }

      setConfirmation({
        confirmationCode: json.data.confirmationCode,
        checkIn: json.data.checkIn,
        checkOut: json.data.checkOut,
        nights: json.data.nights,
        guestCount: json.data.guestCount,
        currency: json.data.currency,
        total: json.data.total,
        email: json.data.guest.email,
      });
      setHold(null);
      setQuote(null);
      setStep("confirmed");
      setState("initial");
      setCalendarRefresh((n) => n + 1);
    } catch {
      setState("initial");
      setCheckoutError(
        "We could not reach the booking service. Please try again shortly."
      );
    }
  }

  const stepLabel =
    step === "select"
      ? "1 · Choose your stay"
      : step === "checkout"
        ? "3 · Guest details"
        : "4 · Reservation confirmed";

  return (
    <section
      id="book"
      className="relative py-24 md:py-32 lg:py-40"
      aria-label="Book your stay"
    >
      <div className="absolute inset-0">
        <Image
          src="/images/villa-pool-night.jpg"
          alt="Villa at night with illuminated pool"
          fill
          className="object-cover"
          sizes="100vw"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-sand-900/70" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 text-center lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-terracotta-400"
        >
          Begin Your Journey
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif text-3xl font-light text-white md:text-4xl lg:text-5xl"
        >
          Ready for Your Cretan Escape?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base leading-relaxed text-white/80 md:text-lg"
        >
          Reserve Olive &amp; Raki Luxury Retreat with live availability from
          Talos. Deposit payment follows by email after your reservation is
          registered.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mt-10 max-w-4xl border border-white/15 bg-sand-900/35 p-6 text-left backdrop-blur-md md:p-8"
        >
          <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.22em] text-white/55">
            {stepLabel}
            {state === "quote" && step === "select" ? " · 2 · Review stay" : ""}
          </p>

          {step === "confirmed" && confirmation && (
            <BookingConfirmationView
              booking={confirmation}
              onBookAnother={() => resetToSelect({ refreshCalendar: true })}
            />
          )}

          {step === "checkout" && hold && (
            <BookingCheckout
              hold={hold}
              submitting={state === "booking"}
              errorMessage={checkoutError}
              onExpired={handleHoldExpired}
              onCancel={() => resetToSelect({ refreshCalendar: true })}
              onSubmit={handleCompleteReservation}
            />
          )}

          {step === "select" && (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <p className={labelClass}>Select your stay</p>
                <BookingCalendar
                  guestCount={guests}
                  disabled={bookingDisabled || busy}
                  refreshToken={calendarRefresh}
                  fallbackMinNights={minNights}
                  fallbackMaxNights={maxNights}
                  onSelectionChange={handleSelectionChange}
                  onHintChange={setCalendarHint}
                  onRulesChange={(rules) => {
                    setConfig((prev) =>
                      prev
                        ? {
                            ...prev,
                            maxGuests: rules.maxGuests,
                            currency: rules.currency,
                            stayRules: {
                              minNights: rules.minNights,
                              maxNights: rules.maxNights,
                            },
                          }
                        : prev
                    );
                    setGuests((g) =>
                      Math.min(Math.max(g, 1), rules.maxGuests)
                    );
                  }}
                />
              </div>

              <div>
                <label htmlFor="guests" className={labelClass}>
                  Guests
                </label>
                <select
                  id="guests"
                  value={guests}
                  disabled={bookingDisabled || busy}
                  onChange={(e) => {
                    setGuests(Number.parseInt(e.target.value, 10));
                    setQuote(null);
                    setState((s) =>
                      s === "quote" || s === "unavailable" ? "initial" : s
                    );
                  }}
                  className={cn(fieldClass, "appearance-none")}
                >
                  {Array.from({ length: maxGuests }, (_, i) => i + 1).map(
                    (n) => (
                      <option
                        key={n}
                        value={n}
                        className="bg-sand-900 text-white"
                      >
                        {n} {n === 1 ? "guest" : "guests"}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
                <Button
                  type="submit"
                  variant="secondary"
                  size="lg"
                  disabled={bookingDisabled || busy || !selectionValid}
                  className="w-full sm:w-auto"
                >
                  {state === "loading" ? "Checking…" : "Check Availability"}
                </Button>
              </div>

              <div className="mt-6 min-h-[4.5rem]" aria-live="polite">
                {state === "loading" && (
                  <p className="text-center text-sm text-white/75">
                    Checking live availability with Talos…
                  </p>
                )}

                {state === "holding" && (
                  <p className="text-center text-sm text-white/75">
                    Holding your dates…
                  </p>
                )}

                {(state === "invalid" || state === "hold_expired") &&
                  message && (
                    <p className="text-center text-sm text-terracotta-400">
                      {message}
                    </p>
                  )}

                {state === "unavailable" && (
                  <div className="border border-white/15 bg-white/5 px-4 py-4 text-center">
                    <p className="text-sm text-white/85">
                      {message ??
                        "Those dates are not available. Please try different dates."}
                    </p>
                  </div>
                )}

                {state === "not_ready" && (
                  <div className="border border-white/15 bg-white/5 px-4 py-4 text-center">
                    <p className="text-sm text-white/85">
                      {message ??
                        "Online booking is being prepared. Please contact us on WhatsApp to reserve your stay."}
                    </p>
                  </div>
                )}

                {state === "error" && message && (
                  <div className="border border-white/15 bg-white/5 px-4 py-4 text-center">
                    <p className="text-sm text-white/85">{message}</p>
                  </div>
                )}

                {state === "quote" && quote && (
                  <div className="border border-white/20 bg-white/10 px-5 py-5 text-center">
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-terracotta-400">
                      Stay quote
                    </p>
                    <p className="mt-3 font-serif text-2xl font-light text-white md:text-3xl">
                      {formatMoney(quote.total, quote.currency)}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-white/75">
                      {formatDisplayDate(quote.checkIn)} –{" "}
                      {formatDisplayDate(quote.checkOut)}
                      <span className="mx-2 text-white/40">·</span>
                      {quote.nights}{" "}
                      {quote.nights === 1 ? "night" : "nights"}
                      <span className="mx-2 text-white/40">·</span>
                      {quote.guestCount}{" "}
                      {quote.guestCount === 1 ? "guest" : "guests"}
                    </p>
                    <p className="mt-4 text-xs leading-relaxed text-white/55">
                      Authoritative price from Talos. Continue to temporarily
                      hold these dates and complete your reservation.
                    </p>
                    <div className="mt-6">
                      <Button
                        type="button"
                        variant="secondary"
                        size="lg"
                        disabled={busy}
                        onClick={() => void handleContinueToBooking()}
                        className="w-full sm:w-auto"
                      >
                        Continue to booking
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8"
        >
          <p className="mb-4 text-sm text-white/70">
            Έχετε κάποια ερώτηση; Επικοινωνήστε μαζί μας στο WhatsApp.
          </p>
          <Button
            href={whatsappBookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="ghost"
            size="md"
          >
            WhatsApp
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
