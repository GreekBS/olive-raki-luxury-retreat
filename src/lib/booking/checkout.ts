export function createIdempotencyKey(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 12)}`;
}

export function formatMoney(amount: string, currency: string) {
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

export function formatDisplayDate(iso: string) {
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function remainingHoldMs(expiresAt: string, nowMs = Date.now()): number {
  const expires = Date.parse(expiresAt);
  if (Number.isNaN(expires)) return 0;
  return Math.max(0, expires - nowMs);
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export const COUNTRY_OPTIONS: Array<{ code: string; label: string }> = [
  { code: "GR", label: "Greece" },
  { code: "DE", label: "Germany" },
  { code: "GB", label: "United Kingdom" },
  { code: "FR", label: "France" },
  { code: "IT", label: "Italy" },
  { code: "ES", label: "Spain" },
  { code: "NL", label: "Netherlands" },
  { code: "BE", label: "Belgium" },
  { code: "AT", label: "Austria" },
  { code: "CH", label: "Switzerland" },
  { code: "US", label: "United States" },
  { code: "CA", label: "Canada" },
  { code: "AU", label: "Australia" },
  { code: "IE", label: "Ireland" },
  { code: "PT", label: "Portugal" },
  { code: "SE", label: "Sweden" },
  { code: "NO", label: "Norway" },
  { code: "DK", label: "Denmark" },
  { code: "FI", label: "Finland" },
  { code: "PL", label: "Poland" },
  { code: "CZ", label: "Czechia" },
  { code: "RO", label: "Romania" },
  { code: "BG", label: "Bulgaria" },
  { code: "CY", label: "Cyprus" },
  { code: "MT", label: "Malta" },
  { code: "LU", label: "Luxembourg" },
  { code: "HR", label: "Croatia" },
  { code: "SI", label: "Slovenia" },
  { code: "SK", label: "Slovakia" },
  { code: "HU", label: "Hungary" },
  { code: "EE", label: "Estonia" },
  { code: "LV", label: "Latvia" },
  { code: "LT", label: "Lithuania" },
  { code: "IS", label: "Iceland" },
  { code: "NZ", label: "New Zealand" },
  { code: "AE", label: "United Arab Emirates" },
  { code: "IL", label: "Israel" },
  { code: "TR", label: "Türkiye" },
];
