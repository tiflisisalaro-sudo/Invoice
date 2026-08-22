const TZ = "Asia/Tbilisi";

export function formatYmd(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function todayYmd(): string {
  return formatYmd(new Date());
}

/** Parse YYYY-MM-DD as a calendar day (noon UTC to avoid TZ shift). */
export function parseYmd(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1, 12, 0, 0));
}

export function startOfTodayUtcApprox(): Date {
  return parseYmd(todayYmd());
}
