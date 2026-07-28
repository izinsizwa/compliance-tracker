interface MetricCardProps {
  label: string;
  value: number;
  tone?: "danger" | "warning" | "success" | "neutral";
}

const toneColor: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  danger: "var(--rust)",
  warning: "var(--amber)",
  success: "var(--forest)",
  neutral: "var(--ink)",
};

export function MetricCard({ label, value, tone = "neutral" }: MetricCardProps) {
  return (
    <div className="card" style={{ padding: "16px 18px" }}>
      <p style={{ margin: "0 0 6px", fontSize: 13, color: "var(--muted)" }}>{label}</p>
      <p style={{ margin: 0, fontSize: 26, fontFamily: "var(--font-display)", color: toneColor[tone] }}>
        {value}
      </p>
    </div>
  );
}

export function StatusStamp({ status }: { status: "overdue" | "due_soon" | "on_track" | "completed" }) {
  const labels = {
    overdue: "Overdue",
    due_soon: "Due soon",
    on_track: "On track",
    completed: "Filed",
  } as const;

  return <span className={`stamp ${status}`}>{labels[status]}</span>;
}
