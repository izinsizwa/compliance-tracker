import type { ReactNode } from "react";

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(28, 35, 31, 0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: "100%", maxWidth: 440, padding: "22px 24px", background: "var(--paper-raised)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 id="modal-title" style={{ fontSize: 18 }}>{title}</h2>
          <button aria-label="Close" onClick={onClose} style={{ padding: "4px 8px" }}>
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
