export default function CoachingLayout({
  feedback,
  skeleton,
  steps,
}: {
  feedback: React.ReactNode;
  skeleton: React.ReactNode;
  steps: React.ReactNode;
}) {
  return (
    <div style={{ height: "100vh", width: "100vw", background: "#000" }}>
      {feedback}

      <div
        style={{
          display: "flex",
          height: "calc(100vh - 50px)",
        }}
      >
        {/* 75% Visual */}
        <div
          style={{
            flex: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {skeleton}
        </div>

        {/* 25% Steps */}
        <div
          style={{
            flex: 1,
            borderLeft: "1px solid #333",
            background: "#111",
          }}
        >
          {steps}
        </div>
      </div>
    </div>
  );
}
