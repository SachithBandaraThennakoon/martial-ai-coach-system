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
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#000",
        color: "#fff",
      }}
    >
      <div style={{ flex: 3 }}>
        {feedback}
        {skeleton}
      </div>

      <div style={{ flex: 1, background: "#111" }}>
        {steps}
      </div>
    </div>
  );
}
