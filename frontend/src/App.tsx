import { useEffect, useRef, useState } from "react";
import CategorySelector from "./components/CategorySelector";
import CoachingLayout from "./components/CoachingLayout";
import FeedbackBar from "./components/FeedbackBar";
import StepFlow from "./components/StepFlow";
import PoseSimulator from "./components/PoseSimulator";

type Technique = {
  id: string;
  name: string;
  steps: string[];
  targets: any;
};

export default function App() {
  const socketRef = useRef<WebSocket | null>(null);

  const [domains, setDomains] = useState<any[]>([]);
  const [technique, setTechnique] =
    useState<Technique | null>(null);

  const [stepIndex, setStepIndex] = useState(0);
  const [feedback, setFeedback] =
    useState("Select a technique");
  const [repCount, setRepCount] = useState(0);

  /* ---------------- LOAD DOMAIN TREE ---------------- */

  useEffect(() => {
    fetch("http://localhost:8000/domains")
      .then((res) => res.json())
      .then((data) => setDomains(data))
      .catch(() =>
        setFeedback("Failed to load categories")
      );
  }, []);

  /* ---------------- LOAD TECHNIQUE ---------------- */

  const loadTechnique = (techId: string) => {
    fetch(`http://localhost:8000/technique/${techId}`)
      .then((res) => res.json())
      .then((data) => {
        setTechnique(data);
        setStepIndex(0);
        setRepCount(0);
        setFeedback("Match green targets");
      })
      .catch(() =>
        setFeedback("Failed to load technique")
      );
  };

  /* ---------------- WEBSOCKET ---------------- */

  useEffect(() => {
    if (!technique) return;

    const ws = new WebSocket("ws://localhost:8000/ws/pose");

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    ws.onerror = (err) => {
      console.error("WebSocket error", err);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.step && technique.steps) {
        const index =
          technique.steps.indexOf(data.step);
        if (index !== -1) setStepIndex(index);
      }

      if (data.feedback) {
        setFeedback(data.feedback);
      }

      if (data.completed_rep) {
        setRepCount((r) => r + 1);
      }
    };

    socketRef.current = ws;

    return () => {
      ws.close();
    };
  }, [technique]);

  /* ---------------- CATEGORY VIEW ---------------- */

  if (!technique) {
    return (
      <div
        style={{
          background: "#000",
          color: "#fff",
          minHeight: "100vh",
          padding: 20,
        }}
      >
        <h2>Select Training Path</h2>

        <CategorySelector
          tree={domains}
          onSelectTechnique={loadTechnique}
        />

        <div style={{ marginTop: 20 }}>
          {feedback}
        </div>
      </div>
    );
  }

  /* ---------------- SAFE GUARDS ---------------- */

  if (!technique.steps || technique.steps.length === 0) {
    return (
      <div style={{ padding: 20 }}>
        Technique has no steps defined.
      </div>
    );
  }

  const currentStep =
    technique.steps[stepIndex] ?? "";

  const progress =
    ((stepIndex + 1) / technique.steps.length) *
    100;

  /* ---------------- COACHING VIEW ---------------- */

  return (
    <CoachingLayout
      feedback={
        <>
          <FeedbackBar message={feedback} />
          <div style={{ height: 6, background: "#222" }}>
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#2ecc71",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </>
      }
      skeleton={
        <PoseSimulator
          currentStep={currentStep}
          targets={technique.targets}
          onChange={(landmarks) => {
            const socket = socketRef.current;

            if (socket &&
              socket.readyState === WebSocket.OPEN) {
              socket.send(
                JSON.stringify({
                  landmarks,
                  technique_id: technique.id,
                })
              );
            }
          } } onStepComplete={function (): void {
            throw new Error("Function not implemented.");
          } }        />
      }
      steps={
        <div>
          <StepFlow
            steps={technique.steps}
            currentStep={currentStep}
          />
          <div style={{ padding: 12 }}>
            Repetitions: {repCount}
          </div>
        </div>
      }
    />
  );
}
