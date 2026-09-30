"use client";

import {
  BookingCalendar,
  type BookingCalendarSelection,
} from "@/components/booking/BookingCalendar";
import { Button } from "@/components/ui/Button";
import { whatsappBookingUrl } from "@/lib/contact";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";

type UiState =
  | "initial"
  | "loading"
  | "quote"
  | "unavailable"
  | "invalid"
  | "not_ready"
  | "error";

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

function formatMoney(amount: string, currency: string) {
  const value = Number.parseFloat(amount);
  if (Number.isNaN(value)) return `${amount} ${currency}`;
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${amount} ${currency}`;
  }
}

function formatDisplayDate(iso: string) {
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

const fieldClass =
  "w-full border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition-colors focus:border-terracotta-400 focus:ring-1 focus:ring-terracotta-400/40 [color-scheme:dark]";

const labelClass =
  "mb-2 block text-left text-[11px] font-medium uppercase tracking-[0.22em] text-white/70";

export function BookNow() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [selectionValid, setSelectionValid] = useState(false);
  const [guests, setGuests] = useState(2);
  const [config, setConfig] = useState<BookingConfig | null>(null);
  const [state, setState] = useState<UiState>("initial");
  const [message, setMessage] = useState<string | null>(null);
  const [calendarHint, setCalendarHint] = useState<string | null>(null);
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [calendarRefresh, setCalendarRefresh] = useState(0);

  const maxGuests = config?.maxGuests ?? 8;
  const bookingDisabled = state === "not_ready";
  const minNights = config?.stayRules?.minNights ?? 1;
  const maxNights = config?.stayRules?.maxNights ?? 30;

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
        setGuests((current) => Math.min(Math.max(current, 1), json.data!.maxGuests));

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

  function handleSelectionChange(selection: BookingCalendarSelection) {
    setCheckIn(selection.checkIn ?? "");
    setCheckOut(selection.checkOut ?? "");
    setSelectionValid(selection.valid);
    setQuote(null);
    setMessage(null);
    if (state === "quote" || state === "unavailable" || state === "invalid") {
      setState("initial");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuote(null);
    setMessage(null);

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
          Check live availability and pricing for Olive &amp; Raki Luxury Retreat.
          No reservation is created until you confirm a future booking step.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          onSubmit={handleSubmit}
          className="mx-auto mt-10 max-w-4xl border border-white/15 bg-sand-900/35 p-6 text-left backdrop-blur-md md:p-8"
        >
          <div className="mb-6">
            <p className={labelClass}>Select your stay</p>
            <BookingCalendar
              guestCount={guests}
              disabled={bookingDisabled || state === "loading"}
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
                setGuests((g) => Math.min(Math.max(g, 1), rules.maxGuests));
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
              disabled={bookingDisabled || state === "loading"}
              onChange={(e) => {
                setGuests(Number.parseInt(e.target.value, 10));
                setQuote(null);
                setState((s) =>
                  s === "quote" || s === "unavailable" ? "initial" : s
                );
              }}
              className={cn(fieldClass, "appearance-none")}
            >
              {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n} className="bg-sand-900 text-white">
                  {n} {n === 1 ? "guest" : "guests"}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
            <Button
              type="submit"
              variant="secondary"
              size="lg"
              disabled={
                bookingDisabled || state === "loading" || !selectionValid
              }
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

            {state === "invalid" && message && (
              <p className="text-center text-sm text-terracotta-400">{message}</p>
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
                  {quote.nights} {quote.nights === 1 ? "night" : "nights"}
                  <span className="mx-2 text-white/40">·</span>
                  {quote.guestCount}{" "}
                  {quote.guestCount === 1 ? "guest" : "guests"}
                </p>
                <p className="mt-4 text-xs leading-relaxed text-white/55">
                  Authoritative price from Talos. This is a quote only — no booking
                  has been created.
                </p>
              </div>
            )}
          </div>
        </motion.form>

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
