import { format as dateFnsFormat, formatDistanceToNow } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const DEFAULT_TIMEZONE = "Asia/Karachi";

// --- Date/Time ---

export function formatDate(
  date: Date | string | number,
  options?: { timezone?: string; formatStr?: string },
): string {
  const tz = options?.timezone ?? DEFAULT_TIMEZONE;
  const fmt = options?.formatStr ?? "dd/MM/yyyy";
  const zonedDate = toZonedTime(new Date(date), tz);
  return dateFnsFormat(zonedDate, fmt);
}

export function formatTime(
  date: Date | string | number,
  options?: { timezone?: string; formatStr?: string },
): string {
  const tz = options?.timezone ?? DEFAULT_TIMEZONE;
  const fmt = options?.formatStr ?? "hh:mm a";
  const zonedDate = toZonedTime(new Date(date), tz);
  return dateFnsFormat(zonedDate, fmt);
}

export function formatDateTime(
  date: Date | string | number,
  options?: { timezone?: string },
): string {
  return `${formatDate(date, options)} ${formatTime(date, options)}`;
}

/** Relative time for inbox (e.g. "5 min ago", "2 hours ago") */
export function formatRelativeTime(date: Date | string | number): string {
  const zonedDate = toZonedTime(new Date(date), DEFAULT_TIMEZONE);
  return formatDistanceToNow(zonedDate, { addSuffix: true });
}

// --- Phone ---

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  let normalized: string;
  if (digits.startsWith("92") && digits.length >= 12) {
    normalized = digits;
  } else if (digits.startsWith("0") && digits.length === 11) {
    normalized = "92" + digits.slice(1);
  } else if (digits.length === 10 && digits.startsWith("3")) {
    normalized = "92" + digits;
  } else {
    return phone;
  }

  const cc = normalized.slice(0, 2);
  const area = normalized.slice(2, 5);
  const number = normalized.slice(5);
  return `+${cc} ${area} ${number}`;
}

// --- Currency ---

export function formatPKR(amount: number): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const [whole, decimal] = abs.toFixed(2).split(".");
  const lastThree = whole.slice(-3);
  const remaining = whole.slice(0, -3);
  const grouped = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  const formatted = remaining ? `${grouped},${lastThree}` : lastThree;
  return `${isNegative ? "-" : ""}PKR ${formatted}.${decimal}`;
}
