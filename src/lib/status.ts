import { formatYmd, startOfTodayUtcApprox } from "./dates";

export const STATUS_LABEL: Record<string, string> = {
  issued: "გამოცემული",
  paid: "გადახდილი",
  void: "გაუქმებული",
  overdue: "ვადაგადაცილებული",
};

export function displayStatus(status: string, dueAt?: Date | null): string {
  if (status === "issued" && dueAt && dueAt < startOfTodayUtcApprox()) {
    return "overdue";
  }
  return status;
}

export function statusLabel(status: string, dueAt?: Date | null): string {
  const key = displayStatus(status, dueAt);
  return STATUS_LABEL[key] ?? status;
}
