import { displayStatus, statusLabel } from "@/lib/status";

export function StatusBadge({
  status,
  dueAt,
}: {
  status: string;
  dueAt?: Date | null;
}) {
  const key = displayStatus(status, dueAt);
  return <span className={`badge ${key}`}>{statusLabel(status, dueAt)}</span>;
}
