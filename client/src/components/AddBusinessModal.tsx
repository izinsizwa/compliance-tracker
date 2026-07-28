import { useState, type FormEvent } from "react";
import { Modal } from "./Modal";
import * as api from "../api/endpoints";
import type { Business } from "../types";
import { ApiError } from "../api/client";

export function AddBusinessModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (business: Business) => void;
}) {
  const [name, setName] = useState("");
  const [registration, setRegistration] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const business = await api.createBusiness({ name, registration, contactEmail });
      onCreated(business);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't add that business.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title="Add a business" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
        {error && <p role="alert" style={{ color: "var(--rust)", fontSize: 13, margin: 0 }}>{error}</p>}
        <label style={{ display: "grid", gap: 6, fontSize: 13, color: "var(--muted)" }}>
          Business name
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Khaya Landscaping" />
        </label>
        <label style={{ display: "grid", gap: 6, fontSize: 13, color: "var(--muted)" }}>
          Registration number (optional)
          <input value={registration} onChange={(e) => setRegistration(e.target.value)} placeholder="2019/123456/07" />
        </label>
        <label style={{ display: "grid", gap: 6, fontSize: 13, color: "var(--muted)" }}>
          Contact email (optional)
          <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        </label>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
          <button type="button" onClick={onClose}>Cancel</button>
          <button className="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding…" : "Add business"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
