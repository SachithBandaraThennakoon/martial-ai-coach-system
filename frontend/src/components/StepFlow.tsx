export default function StepFlow({
  steps,
  currentStep,
}: {
  steps: string[];
  currentStep: string;
}) {
  return (
    <div>
      {steps.map((step, index) => {
        const isActive = step === currentStep;

        return (
          <div
            key={step}
            style={{
              padding: 10,
              marginBottom: 6,
              borderRadius: 8,
              background: isActive
                ? "linear-gradient(90deg, #2ecc71, #27ae60)"
                : "#1a1a1a",
              color: isActive ? "#000" : "#aaa",
              transition: "0.3s",
              fontWeight: isActive ? 600 : 400,
            }}
          >
            {index + 1}. {step}
          </div>
        );
      })}
    </div>
  );
}
