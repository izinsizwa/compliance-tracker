export type RequirementStatus = "overdue" | "due_soon" | "on_track" | "completed";

const DUE_SOON_WINDOW_DAYS = 14;

/**
 * Derives a display status from a requirement's due date rather than storing
 * it, so the dashboard is always accurate without a background job keeping
 * a status column in sync.
 */
export function computeStatus(dueDate: Date, completedAt: Date | null, now: Date = new Date()): RequirementStatus {
  if (completedAt) return "completed";

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / msPerDay);

  if (daysUntilDue < 0) return "overdue";
  if (daysUntilDue <= DUE_SOON_WINDOW_DAYS) return "due_soon";
  return "on_track";
}

export function daysUntil(dueDate: Date, now: Date = new Date()): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((dueDate.getTime() - now.getTime()) / msPerDay);
}
