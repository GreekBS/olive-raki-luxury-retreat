"use client";

import {
  addDaysIso,
  addMonths,
  buildMonthGrid,
  formatCompactMoney,
  formatMonthTitle,
  startOfMonthIso,
  todayIsoLocal,
} from "@/lib/booking/dates";
import {
  canInteractWithDay,
  isDateInSelectedRange,
  isRangeEndpoint,
  validateStayRange,
  type CalendarDayFlags,
} from "@/lib/booking/selection";
import { cn } from "@/lib/utils";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

interface ApiEnvelope<T> {
  data: T | null;
  error: { code: string; message: string } | null;
}

interface CalendarPayload {
  currency: string;
  timezone: string;
  minNights: number;
  maxNights: number;
  maxGuests: number;
  days: CalendarDayFlags[];
}

export type BookingCalendarSelection = {
  checkIn: string | null;
  checkOut: string | null;
  valid: boolean;
  nights: number | null;
};

type BookingCalendarProps = {
  guestCount: number;
  disabled?: boolean;
  /** Bump to force a fresh calendar fetch (e.g. after availability conflict). */
  refreshToken?: number;
  fallbackMinNights?: number;
  fallbackMaxNights?: number;
  onSelectionChange: (selection: BookingCalendarSelection) => void;
  onHintChange?: (hint: string | null) => void;
  onRulesChange?: (rules: {
    minNights: number;
    maxNights: number;
    maxGuests: number;
    currency: string;
  }) => void;
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function subscribeMq(callback: () => void) {
  const mq = window.matchMedia("(min-width: 768px)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getDesktopSnapshot() {
  return window.matchMedia("(min-width: 768px)").matches;
}

function getServerSnapshot() {
  return false;
}

function useIsDesktop() {
  return useSyncExternalStore(subscribeMq, getDesktopSnapshot, getServerSnapshot);
}

function monthAnchorFromToday() {
  const now = new Date();
  return { year: now.getFullYear(), monthIndex: now.getMonth() };
}

export function BookingCalendar({
  guestCount,
  disabled = false,
  refreshToken = 0,
  fallbackMinNights = 1,
  fallbackMaxNights = 30,
  onSelectionChange,
  onHintChange,
  onRulesChange,
}: BookingCalendarProps) {
  const isDesktop = useIsDesktop();
  const monthsVisible = isDesktop ? 2 : 1;

  const [anchor, setAnchor] = useState(monthAnchorFromToday);
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [daysByDate, setDaysByDate] = useState<Map<string, CalendarDayFlags>>(
    () => new Map()
  );
  const [minNights, setMinNights] = useState(fallbackMinNights);
  const [maxNights, setMaxNights] = useState(fallbackMaxNights);
  const [currency, setCurrency] = useState("EUR");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);

  const fetchIdRef = useRef(0);
  const guestDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectionRef = useRef({
    checkIn: null as string | null,
    checkOut: null as string | null,
  });
  const onSelectionChangeRef = useRef(onSelectionChange);
  const onHintChangeRef = useRef(onHintChange);
  const onRulesChangeRef = useRef(onRulesChange);
  const [debouncedGuests, setDebouncedGuests] = useState(guestCount);

  onSelectionChangeRef.current = onSelectionChange;
  onHintChangeRef.current = onHintChange;
  onRulesChangeRef.current = onRulesChange;

  useEffect(() => {
    selectionRef.current = { checkIn, checkOut };
  }, [checkIn, checkOut]);

  useEffect(() => {
    if (guestDebounceRef.current) clearTimeout(guestDebounceRef.current);
    guestDebounceRef.current = setTimeout(() => {
      setDebouncedGuests(guestCount);
    }, 250);
    return () => {
      if (guestDebounceRef.current) clearTimeout(guestDebounceRef.current);
    };
  }, [guestCount]);

  // Half-open [from, to): visible months + morning after last day
  // so end-of-month check-outs remain selectable.
  const range = useMemo(() => {
    const from = startOfMonthIso(anchor.year, anchor.monthIndex);
    const afterVisible = addMonths(anchor.year, anchor.monthIndex, monthsVisible);
    const firstAfterVisible = startOfMonthIso(
      afterVisible.year,
      afterVisible.monthIndex
    );
    return { from, to: addDaysIso(firstAfterVisible, 1) };
  }, [anchor.year, anchor.monthIndex, monthsVisible]);

  function emitSelection(
    nextIn: string | null,
    nextOut: string | null,
    map: Map<string, CalendarDayFlags>,
    min: number,
    max: number
  ) {
    if (nextIn && nextOut) {
      const result = validateStayRange(nextIn, nextOut, map, min, max);
      onSelectionChangeRef.current({
        checkIn: nextIn,
        checkOut: nextOut,
        valid: result.ok,
        nights: result.ok ? result.nights : null,
      });
      if (
        !result.ok &&
        (result.reason === "too_short" ||
          result.reason === "too_long" ||
          result.reason === "unavailable_night")
      ) {
        setHint(result.message);
        onHintChangeRef.current?.(result.message);
      } else {
        setHint(null);
        onHintChangeRef.current?.(null);
      }
      return;
    }

    onSelectionChangeRef.current({
      checkIn: nextIn,
      checkOut: nextOut,
      valid: false,
      nights: null,
    });
    setHint(null);
    onHintChangeRef.current?.(null);
  }

  useEffect(() => {
    const id = ++fetchIdRef.current;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/booking/calendar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            from: range.from,
            to: range.to,
            guestCount: debouncedGuests,
          }),
          cache: "no-store",
        });
        const json = (await res.json()) as ApiEnvelope<CalendarPayload>;

        if (cancelled || id !== fetchIdRef.current) return;

        if (!res.ok || !json.data) {
          setError(
            json.error?.message ??
              "We could not load availability. Please try again shortly."
          );
          setDaysByDate(new Map());
          setLoading(false);
          return;
        }

        const map = new Map<string, CalendarDayFlags>();
        for (const day of json.data.days) {
          map.set(day.date, day);
        }

        setDaysByDate(map);
        setMinNights(json.data.minNights);
        setMaxNights(json.data.maxNights);
        setCurrency(json.data.currency);
        onRulesChangeRef.current?.({
          minNights: json.data.minNights,
          maxNights: json.data.maxNights,
          maxGuests: json.data.maxGuests,
          currency: json.data.currency,
        });
        setLoading(false);

        const current = selectionRef.current;
        emitSelection(
          current.checkIn,
          current.checkOut,
          map,
          json.data.minNights,
          json.data.maxNights
        );
      } catch {
        if (cancelled || id !== fetchIdRef.current) return;
        setError(
          "We could not load availability. Please try again shortly, or contact us on WhatsApp."
        );
        setDaysByDate(new Map());
        setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [range.from, range.to, debouncedGuests, refreshToken, reloadNonce]);

  function clearSelection() {
    setCheckIn(null);
    setCheckOut(null);
    emitSelection(null, null, daysByDate, minNights, maxNights);
  }

  function handleDayClick(date: string) {
    if (disabled || loading) return;
    const day = daysByDate.get(date);

    if (checkIn && checkOut) {
      if (day && day.checkInAllowed && day.available) {
        setCheckIn(date);
        setCheckOut(null);
        emitSelection(date, null, daysByDate, minNights, maxNights);
      } else {
        clearSelection();
      }
      return;
    }

    if (!checkIn) {
      if (!day || !day.checkInAllowed || !day.available) return;
      setCheckIn(date);
      setCheckOut(null);
      emitSelection(date, null, daysByDate, minNights, maxNights);
      return;
    }

    if (date <= checkIn) {
      if (day && day.checkInAllowed && day.available) {
        setCheckIn(date);
        setCheckOut(null);
        emitSelection(date, null, daysByDate, minNights, maxNights);
      }
      return;
    }

    const result = validateStayRange(checkIn, date, daysByDate, minNights, maxNights);
    if (!result.ok) {
      if (result.reason === "too_short" || result.reason === "too_long") {
        setHint(result.message);
        onHintChangeRef.current?.(result.message);
        return;
      }
      if (result.reason === "unavailable_night") {
        setHint(result.message);
        onHintChangeRef.current?.(result.message);
        clearSelection();
        return;
      }
      setHint(result.message);
      onHintChangeRef.current?.(result.message);
      return;
    }

    setCheckOut(date);
    emitSelection(checkIn, date, daysByDate, minNights, maxNights);
  }

  function shiftMonths(delta: number) {
    setLoading(true);
    setError(null);
    setDaysByDate(new Map());
    setAnchor((prev) => addMonths(prev.year, prev.monthIndex, delta));
  }

  const today = todayIsoLocal();
  const monthList = useMemo(() => {
    return Array.from({ length: monthsVisible }, (_, i) =>
      addMonths(anchor.year, anchor.monthIndex, i)
    );
  }, [anchor.year, anchor.monthIndex, monthsVisible]);

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => shiftMonths(-1)}
          disabled={disabled || loading}
          className="inline-flex h-10 w-10 items-center justify-center border border-white/20 bg-white/5 text-white transition-colors hover:border-terracotta-400/60 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta-400 disabled:opacity-40"
          aria-label="Previous month"
        >
          ‹
        </button>
        <p className="font-serif text-lg font-light tracking-wide text-white md:text-xl">
          {monthList.map((m) => formatMonthTitle(m.year, m.monthIndex)).join(" · ")}
        </p>
        <button
          type="button"
          onClick={() => shiftMonths(1)}
          disabled={disabled || loading}
          className="inline-flex h-10 w-10 items-center justify-center border border-white/20 bg-white/5 text-white transition-colors hover:border-terracotta-400/60 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta-400 disabled:opacity-40"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-left text-xs text-white/65">
        <p>
          {checkIn ? (
            <>
              <span className="uppercase tracking-[0.18em] text-white/50">Check-in</span>{" "}
              <span className="text-white">{checkIn}</span>
              {checkOut ? (
                <>
                  <span className="mx-2 text-white/35">→</span>
                  <span className="uppercase tracking-[0.18em] text-white/50">
                    Check-out
                  </span>{" "}
                  <span className="text-white">{checkOut}</span>
                </>
              ) : (
                <span className="ml-2 text-white/45">Select check-out</span>
              )}
            </>
          ) : (
            <span>Select your check-in date</span>
          )}
        </p>
        {(checkIn || checkOut) && (
          <button
            type="button"
            onClick={clearSelection}
            className="text-[11px] uppercase tracking-[0.18em] text-terracotta-400 transition-colors hover:text-terracotta-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta-400"
          >
            Clear dates
          </button>
        )}
      </div>

      {error ? (
        <div className="border border-white/15 bg-white/5 px-4 py-6 text-center">
          <p className="text-sm text-white/85">{error}</p>
          <button
            type="button"
            onClick={() => setReloadNonce((n) => n + 1)}
            className="mt-4 text-[11px] uppercase tracking-[0.18em] text-terracotta-400"
          >
            Try again
          </button>
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-8",
            monthsVisible === 2 ? "md:grid-cols-2" : "grid-cols-1"
          )}
          aria-busy={loading}
        >
          {monthList.map((month) => {
            const grid = buildMonthGrid(month.year, month.monthIndex);
            return (
              <div key={`${month.year}-${month.monthIndex}`}>
                <p className="mb-3 hidden text-center font-serif text-base font-light text-white/90 max-md:block">
                  {formatMonthTitle(month.year, month.monthIndex)}
                </p>
                <div className="mb-2 grid grid-cols-7 gap-px text-center text-[10px] uppercase tracking-[0.16em] text-white/45">
                  {WEEKDAYS.map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-px">
                  {grid.map((cell) => {
                    if (!cell.inMonth) {
                      return (
                        <div
                          key={`${month.year}-${month.monthIndex}-${cell.date}-pad`}
                          className="min-h-[3.25rem] md:min-h-[3.5rem]"
                          aria-hidden
                        />
                      );
                    }

                    const day = daysByDate.get(cell.date);
                    const interactive = canInteractWithDay(
                      cell.date,
                      day,
                      checkIn,
                      checkOut,
                      daysByDate,
                      minNights,
                      maxNights
                    );
                    const inRange = isDateInSelectedRange(
                      cell.date,
                      checkIn,
                      checkOut
                    );
                    const endpoint = isRangeEndpoint(cell.date, checkIn, checkOut);
                    const unavailable = day ? !day.available : !loading;
                    const priceLabel =
                      day && day.available && day.nightlyPrice
                        ? formatCompactMoney(
                            day.nightlyPrice,
                            day.currency || currency
                          )
                        : "—";

                    const ariaPrice =
                      day?.available && day.nightlyPrice
                        ? priceLabel
                        : "unavailable";

                    return (
                      <button
                        key={cell.date}
                        type="button"
                        disabled={
                          disabled ||
                          loading ||
                          (!interactive &&
                            !(checkIn && !checkOut && cell.date === checkIn))
                        }
                        onClick={() => handleDayClick(cell.date)}
                        aria-label={`${cell.date}, ${ariaPrice}`}
                        aria-pressed={endpoint !== null || inRange}
                        className={cn(
                          "relative flex min-h-[3.25rem] flex-col items-center justify-center px-0.5 py-1.5 text-center transition-colors md:min-h-[3.5rem]",
                          "focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-terracotta-400",
                          cell.date === today && "ring-1 ring-inset ring-white/25",
                          inRange && !endpoint && "bg-terracotta-500/25",
                          endpoint === "checkin" && "bg-terracotta-500/55 text-white",
                          endpoint === "checkout" && "bg-terracotta-500/55 text-white",
                          !inRange &&
                            !endpoint &&
                            interactive &&
                            "hover:bg-white/10",
                          unavailable && !endpoint && "opacity-45",
                          !interactive &&
                            !inRange &&
                            endpoint === null &&
                            "cursor-not-allowed"
                        )}
                      >
                        <span
                          className={cn(
                            "text-[13px] leading-none md:text-sm",
                            endpoint ? "font-medium text-white" : "text-white/90"
                          )}
                        >
                          {cell.dayOfMonth}
                        </span>
                        <span
                          className={cn(
                            "mt-1 text-[9px] leading-none tracking-wide md:text-[10px]",
                            unavailable || !day?.available
                              ? "text-white/40"
                              : "text-white/70",
                            endpoint && "text-white/90"
                          )}
                        >
                          {loading && !day ? "···" : priceLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(hint || loading) && (
        <p className="mt-4 text-center text-sm text-white/70" aria-live="polite">
          {loading ? "Loading availability…" : hint}
        </p>
      )}
    </div>
  );
}
