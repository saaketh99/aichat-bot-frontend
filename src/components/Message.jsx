import React from "react";
import ReactMarkdown from "react-markdown";

const BOT_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="4" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <circle cx="5.5" cy="8" r="1" fill="currentColor"/>
    <circle cx="10.5" cy="8" r="1" fill="currentColor"/>
    <path d="M6 11h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M8 1v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const USER_ICON = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M2 12.5c0-2.485 2.239-4.5 5-4.5s5 2.015 5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function Message({ msg }) {
  const isUser = msg.role === "user";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        gap: "12px",
        alignItems: "flex-start",
        animation: "fadeInUp 0.25s ease-out",
        padding: "4px 0",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "var(--radius)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isUser
            ? "rgba(59,130,246,0.15)"
            : "rgba(245,197,24,0.12)",
          border: isUser
            ? "1px solid rgba(59,130,246,0.3)"
            : "1px solid rgba(245,197,24,0.25)",
          color: isUser ? "var(--accent-blue)" : "var(--accent-yellow)",
          marginTop: 2,
        }}
      >
        {isUser ? USER_ICON : BOT_ICON}
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: "75%", minWidth: 0 }}>
        {/* Label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 5,
            flexDirection: isUser ? "row-reverse" : "row",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: isUser ? "var(--accent-blue)" : "var(--accent-yellow)",
            }}
          >
            {isUser ? "YOU" : "LOGISYNC AI"}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-muted)",
            }}
          >
            {formatTime(msg.timestamp)}
          </span>
          {msg.queryType && !isUser && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                padding: "2px 6px",
                borderRadius: 3,
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.2)",
                color: "var(--accent-green)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {msg.queryType}
            </span>
          )}
        </div>

        {/* Content */}
        <div
          style={{
            background: isUser ? "var(--bg-elevated)" : "var(--bg-surface)",
            border: `1px solid ${isUser ? "var(--border-bright)" : "var(--border)"}`,
            borderRadius: isUser
              ? "var(--radius-lg) var(--radius) var(--radius-lg) var(--radius-lg)"
              : "var(--radius) var(--radius-lg) var(--radius-lg) var(--radius-lg)",
            padding: "12px 16px",
            boxShadow: isUser ? "none" : "var(--shadow-card)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Yellow left accent for AI messages */}
          {!isUser && (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 2,
                background:
                  "linear-gradient(180deg, var(--accent-yellow) 0%, transparent 100%)",
              }}
            />
          )}

          {isUser ? (
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: "var(--text-primary)",
              }}
            >
              {msg.content}
            </p>
          ) : (
            <div className="markdown-body">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "var(--radius)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(245,197,24,0.12)",
          border: "1px solid rgba(245,197,24,0.25)",
          color: "var(--accent-yellow)",
        }}
      >
        {BOT_ICON}
      </div>
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius) var(--radius-lg) var(--radius-lg) var(--radius-lg)",
          padding: "14px 20px",
          display: "flex",
          gap: 6,
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--accent-yellow)",
              animation: `pulse-dot 1.4s ease-in-out ${i * 0.16}s infinite`,
            }}
          />
        ))}
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--text-muted)",
            marginLeft: 8,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Querying database...
        </span>
      </div>
    </div>
  );
}
