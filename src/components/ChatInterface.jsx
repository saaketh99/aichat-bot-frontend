import React, { useState, useRef, useEffect, useCallback } from "react";
import { Message, TypingIndicator } from "./Message";

const API_URL = "/api/chat";
const EXPORT_URL = "/api/export";

const SEND_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M14 8L2 2l3 6-3 6 12-6z" fill="currentColor"/>
  </svg>
);

const CLEAR_ICON = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const EXPORT_ICON = (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M6.5 1v7M4 6l2.5 2.5L9 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1 10v1.5a.5.5 0 00.5.5h10a.5.5 0 00.5-.5V10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

function extractFilterFromContext(messages) {
  const filter = {};
  const recentText = messages
    .slice(-6)
    .map((m) => m.content.toLowerCase())
    .join(" ");

  // Status — only set if clearly mentioned
  if (/\bdelivered\b/.test(recentText) && !/not delivered|undelivered/.test(recentText)) {
    filter.orderStatus = "delivered";
  } else if (/in[\s-]transit/.test(recentText)) {
    filter.orderStatus = "in_transit_to_destination_city";
  } else if (/out[\s-]for[\s-]delivery|\bofd\b/.test(recentText)) {
    filter.orderStatus = "out_for_delivery";
  } else if (/at[\s-]hub/.test(recentText)) {
    filter.orderStatus = "at_lm_agent_hub";
  } else if (/\bcancelled\b/.test(recentText)) {
    filter.orderStatus = "cancelled";
  } else if (/picked[\s-]up/.test(recentText)) {
    filter.orderStatus = "picked_up";
  } else if (/\bpending\b|\bactive\b/.test(recentText)) {
    filter.orderStatus = { $nin: ["delivered", "cancelled"] };
  }

  // EDD today — only if explicitly mentioned
  if (/\bedd\b|estimated delivery today/.test(recentText)) {
    const now = new Date();
    filter.estimatedDeliveryDate = {
      $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString(),
      $lte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString(),
    };
  }

  // Brand
  const brandMatch = recentText.match(/\b(duroflex|wakefit|sleepwell|nilkamal|pepperfry)\b/i);
  if (brandMatch) {
    filter["start.contact.name"] = { $regex: brandMatch[1], $options: "i" };
  }

  // City — only destination
  const cityMatch = recentText.match(/\b(hyderabad|vijayawada|bangalore|bengaluru|chennai|mumbai|delhi|pune|raichur|secunderabad)\b/i);
  if (cityMatch) {
    filter["end.address.mapData.city"] = { $regex: cityMatch[1], $options: "i" };
  }

  // If nothing was extracted return empty filter — exports all orders (up to 5000)
  return filter;
}

async function downloadExcel(filter, filename) {
  const res = await fetch(EXPORT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filter, filename }),
  });

  if (!res.ok) {
    const text = await res.text();
    let msg = "Export failed";
    try { msg = JSON.parse(text).error || msg; } catch {}
    throw new Error(msg);
  }

  // Get filename from Content-Disposition header if available
  const disposition = res.headers.get("Content-Disposition") || "";
  const nameMatch = disposition.match(/filename="?([^";\n]+)"?/);
  const dlFilename = nameMatch ? nameMatch[1] : `${filename}-${new Date().toISOString().split("T")[0]}.xlsx`;

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = dlFilename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

export function ChatInterface({ externalPrompt, onPromptConsumed, onLoadingChange }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content:
        "**Welcome to LogiSync AI** — your logistics intelligence agent.\n\nI have direct access to your shipment database and can help you:\n- 📊 Analyze order statuses and delivery performance\n- 🔍 Track specific orders or batches\n- 💰 Review cost breakdowns and revenue metrics\n- 🚚 Monitor transit pipelines and bottlenecks\n\nWhat would you like to know about your operations today?",
      timestamp: Date.now(),
      queryType: null,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const isLoadingRef = useRef(false); // ref to prevent double-send in StrictMode

  const setLoading = useCallback((val) => {
    setIsLoading(val);
    isLoadingRef.current = val;
    onLoadingChange?.(val);
  }, [onLoadingChange]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle external prompt from sidebar — guarded against StrictMode double-fire
  const lastExternalPromptRef = useRef(null);
  useEffect(() => {
    if (externalPrompt && externalPrompt !== lastExternalPromptRef.current) {
      lastExternalPromptRef.current = externalPrompt;
      onPromptConsumed?.();
      sendMessage(externalPrompt);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalPrompt]);

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = (text || input).trim();
      if (!trimmed || isLoadingRef.current) return;

      const userMsg = {
        id: Date.now(),
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
      };

      let capturedHistory = [];

      setMessages((prev) => {
        capturedHistory = prev.slice(1).map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        }));
        return [...prev, userMsg];
      });

      setInput("");
      setLoading(true);

      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, history: capturedHistory }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        setMessages((p) => [
          ...p,
          {
            id: Date.now() + 1,
            role: "assistant",
            content: data.response,
            timestamp: Date.now(),
            queryType: data.dataFetched ? data.queryType : null,
          },
        ]);
      } catch (err) {
        setMessages((p) => [
          ...p,
          {
            id: Date.now() + 1,
            role: "assistant",
            content: `⚠️ **Error**: ${err.message}\n\nPlease ensure the backend is running on port 3001.`,
            timestamp: Date.now(),
            queryType: "error",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, setLoading]
  );

  const handleExport = async () => {
    if (isExporting || isLoading) return;
    setIsExporting(true);
    try {
      const filter = extractFilterFromContext(messages);
      await downloadExcel(filter, "logisync-export");
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "assistant",
          content: `⚠️ **Export failed**: ${err.message}`,
          timestamp: Date.now(),
          queryType: "error",
        },
      ]);
    } finally {
      setIsExporting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages((prev) => [prev[0]]);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100%", background: "var(--bg-base)" }}>
      {/* Header */}
      <div style={{ padding: "16px 28px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-surface)", flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
            Operations Console
          </h1>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>
            {messages.length - 1} messages · MongoDB Live
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {/* Export Excel */}
          <button
            onClick={handleExport}
            disabled={isExporting || isLoading}
            title="Export current context to Excel"
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              color: isExporting ? "var(--accent-green)" : "var(--text-muted)",
              cursor: isExporting || isLoading ? "not-allowed" : "pointer",
              padding: "7px 12px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontFamily: "var(--font-display)",
              transition: "all 0.15s",
              opacity: isLoading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isExporting && !isLoading) {
                e.currentTarget.style.borderColor = "var(--accent-green)";
                e.currentTarget.style.color = "var(--accent-green)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isExporting) {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-muted)";
              }
            }}
          >
            {EXPORT_ICON}
            <span>{isExporting ? "Exporting..." : "Export Excel"}</span>
          </button>

          {/* Clear */}
          <button
            onClick={clearChat}
            title="Clear conversation"
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "7px 12px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-red)";
              e.currentTarget.style.color = "var(--accent-red)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            {CLEAR_ICON}
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.map((msg) => (
          <Message key={msg.id} msg={msg} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "16px 28px 20px", borderTop: "1px solid var(--border)", background: "var(--bg-surface)", flexShrink: 0 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          ↵ Send · Shift+↵ New line
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div style={{
            flex: 1, background: "var(--bg-input)",
            border: `1px solid ${inputFocused ? "rgba(245,197,24,0.45)" : "var(--border-bright)"}`,
            borderRadius: "var(--radius-lg)", padding: "12px 16px",
            transition: "border-color 0.15s", position: "relative",
            boxShadow: inputFocused ? "0 0 0 3px rgba(245,197,24,0.06)" : "none",
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Ask about orders, delivery performance, costs, routes..."
              disabled={isLoading}
              rows={1}
              style={{
                width: "100%", background: "transparent", border: "none", outline: "none",
                resize: "none", fontFamily: "var(--font-display)", fontSize: 14,
                color: "var(--text-primary)", lineHeight: 1.6, overflowY: "auto", maxHeight: 120,
              }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
            />
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            style={{
              width: 44, height: 44, borderRadius: "var(--radius-lg)",
              background: input.trim() && !isLoading ? "var(--accent-yellow)" : "var(--bg-elevated)",
              border: `1px solid ${input.trim() && !isLoading ? "var(--accent-yellow)" : "var(--border)"}`,
              color: input.trim() && !isLoading ? "#0a0c0f" : "var(--text-muted)",
              cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "all 0.15s",
              transform: input.trim() && !isLoading ? "scale(1)" : "scale(0.97)",
            }}
          >
            {SEND_ICON}
          </button>
        </div>
      </div>
    </div>
  );
}
