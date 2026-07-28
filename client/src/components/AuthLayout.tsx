import type { ReactNode } from "react";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100%",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <p
            className="mono"
            style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--forest)", margin: "0 0 10px" }}
          >
            Compliance Tracker
          </p>
          <h1 style={{ fontSize: 26, marginBottom: 8 }}>{title}</h1>
          <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>{subtitle}</p>
        </div>
        <div className="card" style={{ padding: "26px 26px 22px" }}>{children}</div>
      </div>
    </div>
  );
}
