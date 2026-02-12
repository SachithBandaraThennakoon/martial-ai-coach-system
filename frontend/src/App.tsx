import { useEffect, useRef, useState } from "react";
import CoachingLayout from "./components/CoachingLayout";
import CategoryTree from "./components/CategoryTree";
import VerticalStepFlow from "./components/VerticalStepFlow";
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

  const [stepIndex, setStepIndex] =
    useState(0);
  const [repCount, setRepCount] =
    useState(0);

  useEffect(() => {
    fetch("http://localhost:8000/domains")
      .then((res) => res.json())
      .then((data) => setDomains(data));
  }, []);

  const [feedback, setFeedback] = useState("Match green targets");

  useEffect(() => {
    if (!technique) return;

    const ws = new WebSocket(
      "ws://localhost:8000/ws/pose"
    );

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.feedback) {
    setFeedback(data.feedback);
  }

  if (data.completed_rep) {
    setRepCount((r) => r + 1);
  }
};


    ws.onerror = (err) => {
      console.error("WebSocket error", err);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    socketRef.current = ws;

    return () => {
      ws.close();
    };
  }, [technique]);




  const loadTechnique = (techId: string) => {
    fetch(
      `http://localhost:8000/technique/${techId}`
    )
      .then((res) => res.json())
      .then((data) => {
        setTechnique(data);
        setStepIndex(0);
        setRepCount(0);
      });
  };

  const handleStepComplete = () => {
    if (!technique) return;

    if (stepIndex < technique.steps.length - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      setStepIndex(0);
      setRepCount((r) => r + 1);
    }
  };

  const safeSocketSend = (landmarks: any[]) => {
    const socket = socketRef.current;

    if (
      socket &&
      socket.readyState === WebSocket.OPEN
    ) {
      socket.send(
        JSON.stringify({
          landmarks,
          technique_id: technique?.id,
        })
      );
    }
  };


  if (!technique) {
    return (
      <CoachingLayout
        sidebar={
          <CategoryTree
            data={domains}
            onSelect={loadTechnique}
          />
        }
        center={<h2>Select Technique</h2>}
        progress={<div />}
      />
    );
  }

  const currentStep =
    technique.steps[stepIndex];

  return (
    <CoachingLayout
      sidebar={
        <CategoryTree
          data={domains}
          onSelect={loadTechnique}
        />
      }
      center={
        <>
          <div
            style={{
              marginBottom: 15,
              padding: 10,
              background: "#111",
              borderRadius: 8,
              fontSize: 18,
              color: "#2ecc71",
              textAlign: "center",
            }}
          >
            {feedback}
          </div>

          <PoseSimulator
            currentStep={currentStep}
            targets={technique.targets}
            onChange={safeSocketSend}
            onStepComplete={handleStepComplete}
          />
        </>
      }

      progress={
        <>
          <VerticalStepFlow
            steps={technique.steps}
            currentStep={currentStep}
          />
          <div style={{ marginTop: 20 }}>
            Reps: {repCount}
          </div>
        </>
      }
    />
  );
}
