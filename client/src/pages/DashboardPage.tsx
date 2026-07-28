import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import * as api from "../api/endpoints";
import type { Business, DashboardSummary, Requirement, RequirementStatus } from "../types";
import { REQUIREMENT_TYPE_LABELS } from "../types";
import { MetricCard, StatusStamp } from "../components/MetricCard";
import { AddBusinessModal } from "../components/AddBusinessModal";
import { AddRequirementModal } from "../components/AddRequirementModal";

function daysLabel(dueDate: string): string {
  const ms = new Date(dueDate).getTime() - Date.now();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
  if (days === 0) return "Due today";
  return `In ${days} day${days === 1 ? "" : "s"}`;
}

export function DashboardPage() {
  const { user, signOut } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [statusFilter, setStatusFilter] = useState<RequirementStatus | "">("");
  const [search, setSearch] = useState("");
  const [showAddBusiness, setShowAddBusiness] = useState(false);
  const [showAddRequirement, setShowAddRequirement] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [nudgingId, setNudgingId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    const [summaryData, businessData, requirementData] = await Promise.all([
      api.fetchSummary(),
      api.fetchBusinesses(),
      api.fetchRequirements({ status: statusFilter, search }),
    ]);
    setSummary(summaryData);
    setBusinesses(businessData);
    setRequirements(requirementData);
    setIsLoading(false);
  }, [statusFilter, search]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleNudge(id: string) {
    setNudgingId(id);
    try {
      await api.sendNudge(id);
      await loadAll();
    } finally {
      setNudgingId(null);
    }
  }

  async function handleComplete(id: string) {
    await api.completeRequirement(id);
    await loadAll();
  }

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 24px 60px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <p className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--forest)", margin: "0 0 4px" }}>
            Compliance Tracker
          </p>
          <h1 style={{ fontSize: 22 }}>Deadlines overview</h1>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--muted)" }}>{user?.name}</p>
          <button onClick={signOut}>Sign out</button>
        </div>
      </header>

      {summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 24 }}>
          <MetricCard label="Overdue" value={summary.overdue} tone="danger" />
          <MetricCard label="Due in 14 days" value={summary.due_soon} tone="warning" />
          <MetricCard label="On track" value={summary.on_track} tone="success" />
          <MetricCard label="Nudges sent" value={summary.nudgesSent} />
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as RequirementStatus | "")}>
            <option value="">All statuses</option>
            <option value="overdue">Overdue</option>
            <option value="due_soon">Due soon</option>
            <option value="on_track">On track</option>
            <option value="completed">Filed</option>
          </select>
          <input
            placeholder="Search business name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: 220 }}
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowAddBusiness(true)}>Add business</button>
          <button className="primary" onClick={() => setShowAddRequirement(true)} disabled={businesses.length === 0}>
            Add deadline
          </button>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1.6fr 1.1fr 1fr 1.4fr",
            padding: "10px 20px",
            fontSize: 12,
            color: "var(--muted)",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <span>Business</span>
          <span>Requirement</span>
          <span>Due</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {isLoading && <p style={{ padding: 20, color: "var(--muted)" }}>Loading…</p>}

        {!isLoading && requirements.length === 0 && (
          <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--muted)" }}>
            <p style={{ margin: "0 0 10px" }}>No deadlines match yet.</p>
            <p style={{ margin: 0, fontSize: 13 }}>
              {businesses.length === 0
                ? "Add a business, then add its first filing deadline."
                : "Add a deadline for one of your businesses to see it here."}
            </p>
          </div>
        )}

        {requirements.map((r) => (
          <div
            key={r.id}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1.6fr 1.1fr 1fr 1.4fr",
              alignItems: "center",
              padding: "13px 20px",
              borderBottom: "1px solid var(--line)",
              fontSize: 14,
            }}
          >
            <span style={{ fontWeight: 500 }}>{r.business.name}</span>
            <span style={{ color: "var(--muted)" }}>{REQUIREMENT_TYPE_LABELS[r.type]}</span>
            <span className="mono" style={{ fontSize: 13, color: "var(--muted)" }}>
              {r.status === "completed" ? "Filed" : daysLabel(r.dueDate)}
            </span>
            <span><StatusStamp status={r.status} /></span>
            <span style={{ display: "flex", gap: 6 }}>
              {r.status !== "completed" && (
                <>
                  <button style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => handleNudge(r.id)} disabled={nudgingId === r.id}>
                    {nudgingId === r.id ? "Sending…" : "Nudge"}
                  </button>
                  <button style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => handleComplete(r.id)}>
                    Mark filed
                  </button>
                </>
              )}
            </span>
          </div>
        ))}
      </div>

      {showAddBusiness && (
        <AddBusinessModal
          onClose={() => setShowAddBusiness(false)}
          onCreated={() => loadAll()}
        />
      )}

      {showAddRequirement && (
        <AddRequirementModal
          businesses={businesses}
          onClose={() => setShowAddRequirement(false)}
          onCreated={() => loadAll()}
        />
      )}
    </div>
  );
}
