export type RequirementType =
  | "CIPC_ANNUAL_RETURN"
  | "BEE_CERTIFICATE"
  | "UIF_DECLARATION"
  | "COIDA_RETURN"
  | "POPIA_REVIEW"
  | "OTHER";

export type RequirementStatus = "overdue" | "due_soon" | "on_track" | "completed";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Business {
  id: string;
  name: string;
  registration?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  _count?: { requirements: number };
}

export interface Requirement {
  id: string;
  businessId: string;
  business: Business;
  type: RequirementType;
  label: string;
  dueDate: string;
  recurrenceUnit: "MONTHLY" | "YEARLY" | "ONCE";
  recurrenceEvery: number;
  completedAt: string | null;
  status: RequirementStatus;
  nudges: { id: string; channel: "EMAIL" | "WHATSAPP"; sentAt: string }[];
}

export interface DashboardSummary {
  businessCount: number;
  nudgesSent: number;
  overdue: number;
  due_soon: number;
  on_track: number;
  completed: number;
}

export const REQUIREMENT_TYPE_LABELS: Record<RequirementType, string> = {
  CIPC_ANNUAL_RETURN: "CIPC annual return",
  BEE_CERTIFICATE: "BEE certificate renewal",
  UIF_DECLARATION: "UIF declaration",
  COIDA_RETURN: "COIDA return",
  POPIA_REVIEW: "POPIA policy review",
  OTHER: "Other requirement",
};
