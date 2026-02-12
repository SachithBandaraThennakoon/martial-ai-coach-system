import React from "react";

export default function CoachingLayout({
  sidebar,
  center,
  progress,
}: {
  sidebar: React.ReactNode;
  center: React.ReactNode;
  progress: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#0a0a0a",
        color: "#fff",
      }}
    >
      {/* LEFT */}
      <div
        style={{
          width: "10%",
          background: "#111",
          borderRight: "1px solid #222",
          padding: 10,
          overflowY: "auto",
        }}
      >
        {sidebar}
      </div>

      {/* CENTER */}
      <div
        style={{
          width: "80%",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {center}
      </div>

      {/* RIGHT */}
      <div
        style={{
          width: "10%",
          background: "#111",
          borderLeft: "1px solid #222",
          padding: 10,
        }}
      >
        {progress}
      </div>
    </div>
  );
}
