import { apiFetch } from "./client";
import type { Business, DashboardSummary, Requirement, RequirementType, User } from "../types";

export function login(email: string, password: string) {
  return apiFetch<{ token: string; user: User }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(name: string, email: string, password: string) {
  return apiFetch<{ token: string; user: User }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export function fetchBusinesses() {
  return apiFetch<Business[]>("/businesses");
}

export function createBusiness(input: { name: string; registration?: string; contactEmail?: string; contactPhone?: string }) {
  return apiFetch<Business>("/businesses", { method: "POST", body: JSON.stringify(input) });
}

export function fetchRequirements(filters: { status?: string; type?: string; search?: string } = {}) {
  const params = new URLSearchParams(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
  ).toString();
  return apiFetch<Requirement[]>(`/requirements${params ? `?${params}` : ""}`);
}

export function createRequirement(input: {
  businessId: string;
  type: RequirementType;
  label: string;
  dueDate: string;
  recurrenceUnit: "MONTHLY" | "YEARLY" | "ONCE";
}) {
  return apiFetch<Requirement>("/requirements", { method: "POST", body: JSON.stringify(input) });
}

export function completeRequirement(id: string) {
  return apiFetch<Requirement>(`/requirements/${id}/complete`, { method: "POST" });
}

export function sendNudge(id: string, channel: "EMAIL" | "WHATSAPP" = "EMAIL") {
  return apiFetch(`/requirements/${id}/nudge`, { method: "POST", body: JSON.stringify({ channel }) });
}

export function fetchSummary() {
  return apiFetch<DashboardSummary>("/dashboard/summary");
}
