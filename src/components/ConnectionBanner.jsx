import React from "react";

export function ConnectionBanner({ status }) {
  if (status === "online" || status === "checking") return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "rgba(239,68,68,0.12)",
        borderBottom: "1px solid rgba(239,68,68,0.3)",
        padding: "10px 28px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "var(--accent-red)",
          boxShadow: "0 0 8px var(--accent-red)",
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--accent-red)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        Backend offline — start the server:{" "}
        <code
          style={{
            background: "rgba(239,68,68,0.15)",
            padding: "1px 6px",
            borderRadius: 3,
            fontSize: 11,
          }}
        >
          cd backend && npm run dev
        </code>
      </span>
    </div>
  );
}
