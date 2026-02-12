export default function VerticalStepFlow({
  steps,
  currentStep,
}: {
  steps: string[];
  currentStep: string;
}) {
  return (
    <div>
      {steps.map((step) => {
        const active =
          step === currentStep;

        return (
          <div
            key={step}
            style={{
              padding: 8,
              marginBottom: 8,
              borderRadius: 6,
              textAlign: "center",
              background: active
                ? "#2ecc71"
                : "#1a1a1a",
              color: active
                ? "#000"
                : "#888",
              fontSize: 11,
              transition: "0.3s",
            }}
          >
            {step}
          </div>
        );
      })}
    </div>
  );
}
