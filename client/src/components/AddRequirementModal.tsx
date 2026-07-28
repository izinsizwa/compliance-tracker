import { useState, type FormEvent } from "react";
import { Modal } from "./Modal";
import * as api from "../api/endpoints";
import type { Business, Requirement, RequirementType } from "../types";
import { REQUIREMENT_TYPE_LABELS } from "../types";
import { ApiError } from "../api/client";

export function AddRequirementModal({
  businesses,
  onClose,
  onCreated,
}: {
  businesses: Business[];
  onClose: () => void;
  onCreated: (requirement: Requirement) => void;
}) {
  const [businessId, setBusinessId] = useState(businesses[0]?.id ?? "");
  const [type, setType] = useState<RequirementType>("CIPC_ANNUAL_RETURN");
  const [label, setLabel] = useState(REQUIREMENT_TYPE_LABELS.CIPC_ANNUAL_RETURN);
  const [dueDate, setDueDate] = useState("");
  const [recurrenceUnit, setRecurrenceUnit] = useState<"MONTHLY" | "YEARLY" | "ONCE">("YEARLY");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleTypeChange(next: RequirementType) {
    setType(next);
    setLabel(REQUIREMENT_TYPE_LABELS[next]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!businessId) {
      setError("Add a business first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const requirement = await api.createRequirement({ businessId, type, label, dueDate, recurrenceUnit });
      onCreated(requirement);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't add that requirement.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title="Add a deadline" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
        {error && <p role="alert" style={{ color: "var(--rust)", fontSize: 13, margin: 0 }}>{error}</p>}

        <label style={{ display: "grid", gap: 6, fontSize: 13, color: "var(--muted)" }}>
          Business
          <select required value={businessId} onChange={(e) => setBusinessId(e.target.value)}>
            {businesses.length === 0 && <option value="">Add a business first</option>}
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: 6, fontSize: 13, color: "var(--muted)" }}>
          Requirement type
          <select value={type} onChange={(e) => handleTypeChange(e.target.value as RequirementType)}>
            {Object.entries(REQUIREMENT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: 6, fontSize: 13, color: "var(--muted)" }}>
          Label
          <input required value={label} onChange={(e) => setLabel(e.target.value)} />
        </label>

        <label style={{ display: "grid", gap: 6, fontSize: 13, color: "var(--muted)" }}>
          Due date
          <input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>

        <label style={{ display: "grid", gap: 6, fontSize: 13, color: "var(--muted)" }}>
          Repeats
          <select value={recurrenceUnit} onChange={(e) => setRecurrenceUnit(e.target.value as typeof recurrenceUnit)}>
            <option value="YEARLY">Every year</option>
            <option value="MONTHLY">Every month</option>
            <option value="ONCE">Doesn't repeat</option>
          </select>
        </label>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
          <button type="button" onClick={onClose}>Cancel</button>
          <button className="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding…" : "Add deadline"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
