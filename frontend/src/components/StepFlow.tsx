export default function StepFlow({
  steps,
  currentStep,
}: {
  steps?: string[];
  currentStep?: string;
}) {
  if (!steps || steps.length === 0) {
    return <div>No steps available</div>;
  }

  return (
    <div style={{ padding: 12 }}>
      {steps.map((step) => (
        <div
          key={step}
          style={{
            padding: 6,
            marginBottom: 4,
            background:
              step === currentStep
                ? "#2ecc71"
                : "#333",
            color: "#fff",
          }}
        >
          {step}
        </div>
      ))}
    </div>
  );
}
