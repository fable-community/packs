import { locale } from "~/utils/i18n";

export function getRelativeTimeString(date: Date): string {
  const timeMs = typeof date === "number" ? date : date.getTime();

  const deltaSeconds = Math.round((timeMs - Date.now()) / 1000);

  // Special case for "few seconds" work around hydration error
  if (Math.abs(deltaSeconds) < 60) {
    return deltaSeconds <= 0 ? "few seconds ago" : "in a few seconds";
  }

  const cutoffs = [
    60,
    3600,
    86400,
    86400 * 7,
    86400 * 30,
    86400 * 365,
    Infinity,
  ];

  const units: Intl.RelativeTimeFormatUnit[] = [
    "second",
    "minute",
    "hour",
    "day",
    "week",
    "month",
    "year",
  ];

  const unitIndex = cutoffs.findIndex(
    (cutoff) => cutoff > Math.abs(deltaSeconds)
  );

  const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;

  const rtf = new Intl.RelativeTimeFormat(
    locale || navigator?.language || "en",
    { numeric: "auto" }
  );

  return rtf.format(Math.floor(deltaSeconds / divisor), units[unitIndex]);
}
