export default function AgentDebugPanel({
  analysis,
  safety,
  difficulty,
  fatigue,
}: any) {
  return (
    <div
      style={{
        marginTop: 20,
        fontSize: 11,
        background: "#111",
        padding: 10,
        borderRadius: 6,
        color: "#aaa"
      }}
    >
      <div><b>Score:</b> {analysis?.quality_score}</div>
      <div><b>Violations:</b> {analysis?.violations?.join(", ")}</div>
      <div><b>Safe:</b> {safety?.safe ? "Yes" : "No"}</div>
      <div><b>Difficulty:</b> {difficulty}</div>
      <div>
        <b>Fatigue:</b> {fatigue?.fatigued ? "Detected" : "None"}
      </div>
      <div>
        <b>Trend:</b> {fatigue?.trend}
      </div>
    </div>
  );
}
