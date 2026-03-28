import React from "react";

const SUGGESTED_PROMPTS = [
  { icon: "📦", label: "Order summary", query: "Give me an overview of all orders — total count, statuses, and revenue" },
  { icon: "🚚", label: "In-transit orders", query: "Show me all orders currently in transit" },
  { icon: "✅", label: "Delivered today", query: "How many orders were delivered recently?" },
  { icon: "⚠️", label: "Delayed orders", query: "Are there any orders with multiple out-for-delivery attempts?" },
  { icon: "💰", label: "Revenue breakdown", query: "What is the total revenue and average shipping cost?" },
  { icon: "🏙️", label: "Hyderabad orders", query: "Show me all orders going to Hyderabad" },
];

export function Sidebar({ onPromptClick, isLoading }) {
  return (
    <aside
      style={{
        width: 260,
        flexShrink: 0,
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "0 20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "var(--accent-yellow)",
              borderRadius: "var(--radius)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 14L9 4l6 10H3z" fill="#0a0c0f"/>
              <circle cx="9" cy="11" r="1.5" fill="#0a0c0f"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
              LogiSync
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              AI Operations
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div
          style={{
            marginTop: 16,
            padding: "8px 12px",
            background: "rgba(34,197,94,0.07)",
            border: "1px solid rgba(34,197,94,0.18)",
            borderRadius: "var(--radius)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: isLoading ? "var(--accent-yellow)" : "var(--accent-green)",
              boxShadow: isLoading
                ? "0 0 6px var(--accent-yellow)"
                : "0 0 6px var(--accent-green)",
              flexShrink: 0,
              transition: "all 0.3s",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: isLoading ? "var(--accent-yellow)" : "var(--accent-green)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {isLoading ? "Processing..." : "Agent Online"}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--border)", margin: "0 20px 20px" }} />

      {/* Quick Prompts */}
      <div style={{ padding: "0 16px", flex: 1, overflowY: "auto" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom: 10,
            paddingLeft: 4,
          }}
        >
          Quick Queries
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {SUGGESTED_PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => onPromptClick(p.query)}
              disabled={isLoading}
              style={{
                background: "transparent",
                border: "1px solid transparent",
                borderRadius: "var(--radius)",
                padding: "9px 10px",
                cursor: isLoading ? "not-allowed" : "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 10,
                transition: "all 0.15s",
                opacity: isLoading ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = "var(--accent-yellow-dim)";
                  e.currentTarget.style.borderColor = "rgba(245,197,24,0.2)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "transparent";
              }}
            >
              <span style={{ fontSize: 14, flexShrink: 0 }}>{p.icon}</span>
              <span style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.3 }}>
                {p.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "16px 20px 0",
          borderTop: "1px solid var(--border)",
          marginTop: 16,
        }}
      >
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", lineHeight: 1.6 }}>
          <div>MODEL: DeepSeek-V3</div>
          <div>DB: MongoDB Atlas</div>
          <div style={{ color: "var(--accent-green)", marginTop: 2 }}>
            ⚡ Sensitive data protected
          </div>
        </div>
      </div>
    </aside>
  );
}
