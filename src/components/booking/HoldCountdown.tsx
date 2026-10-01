"use client";

import { formatCountdown, remainingHoldMs } from "@/lib/booking/checkout";
import { useEffect, useState } from "react";

type HoldCountdownProps = {
  expiresAt: string;
  onExpired: () => void;
};

export function HoldCountdown({ expiresAt, onExpired }: HoldCountdownProps) {
  const [remaining, setRemaining] = useState(() => remainingHoldMs(expiresAt));

  useEffect(() => {
    setRemaining(remainingHoldMs(expiresAt));
    const id = window.setInterval(() => {
      const next = remainingHoldMs(expiresAt);
      setRemaining(next);
      if (next <= 0) {
        window.clearInterval(id);
        onExpired();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [expiresAt, onExpired]);

  if (remaining <= 0) {
    return (
      <p className="text-sm text-terracotta-400" aria-live="polite">
        Your temporary reservation has expired.
      </p>
    );
  }

  return (
    <p className="text-sm text-white/75" aria-live="polite">
      We&apos;re holding these dates for you for{" "}
      <span className="font-medium text-white tabular-nums">
        {formatCountdown(remaining)}
      </span>
    </p>
  );
}
