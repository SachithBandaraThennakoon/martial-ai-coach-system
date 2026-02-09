import type { FrontKickStep } from "../techniques/frontKick/steps";

export default function StepFlow({
  steps,
  currentStep,
}: {
  steps: FrontKickStep[];
  currentStep: FrontKickStep;
}) {
  return (
    <div
      style={{
        padding: "16px",
        color: "#fff",
      }}
    >
      <h3 style={{ marginBottom: "12px" }}>Front Kick</h3>

      {steps.map((step) => {
        const isActive = step === currentStep;
        const isDone =
          steps.indexOf(step) < steps.indexOf(currentStep);

        return (
          <div
            key={step}
            style={{
              padding: "10px",
              marginBottom: "8px",
              borderRadius: "6px",
              background: isActive
                ? "#2ecc71"
                : isDone
                ? "#555"
                : "#222",
              color: isActive ? "#000" : "#fff",
              fontWeight: isActive ? "bold" : "normal",
            }}
          >
            {isDone ? "✔ " : ""} {step}
          </div>
        );
      })}
    </div>
  );
}
