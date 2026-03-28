import React, { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { ChatInterface } from "./components/ChatInterface";
import { ConnectionBanner } from "./components/ConnectionBanner";
import { useBackendStatus } from "./hooks/useBackendStatus";

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [externalPrompt, setExternalPrompt] = useState(null);
  const backendStatus = useBackendStatus();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        overflow: "hidden",
        position: "relative",
        flexDirection: "column",
      }}
    >
      <ConnectionBanner status={backendStatus} />

      {/* Subtle background grid */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(245,197,24,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,197,24,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flex: 1,
          minHeight: 0,
          marginTop: backendStatus === "offline" ? 41 : 0,
          transition: "margin-top 0.2s",
        }}
      >
        <Sidebar
          isLoading={isLoading}
          backendStatus={backendStatus}
          onPromptClick={(prompt) => setExternalPrompt(prompt)}
        />
        <ChatInterface
          externalPrompt={externalPrompt}
          onPromptConsumed={() => setExternalPrompt(null)}
          onLoadingChange={setIsLoading}
        />
      </div>
    </div>
  );
}
