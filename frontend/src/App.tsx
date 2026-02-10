import { useRef, useState, useEffect } from "react";
import CameraView from "./components/CameraView";
import SkeletonRenderer from "./components/SkeletonRenderer";
import CoachingLayout from "./components/CoachingLayout";
import FeedbackBar from "./components/FeedbackBar";
import StepFlow from "./components/StepFlow";
import { initPose } from "./pose/usePoseDetection";
import {
  FRONT_KICK_STEPS,
  type FrontKickStep,
} from "./techniques/frontKick/steps";
import type { Results } from "@mediapipe/pose";

/* ---------- smoothing ---------- */
const SMOOTHING = 0.7;
let lastLandmarks: any[] | null = null;

function smoothLandmarks(newLm: any[]) {
  if (!lastLandmarks) {
    lastLandmarks = newLm;
    return newLm;
  }

  const smoothed = newLm.map((pt, i) => ({
    x: SMOOTHING * lastLandmarks![i].x + (1 - SMOOTHING) * pt.x,
    y: SMOOTHING * lastLandmarks![i].y + (1 - SMOOTHING) * pt.y,
  }));

  lastLandmarks = smoothed;
  return smoothed;
}
/* -------------------------------- */

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const [landmarks, setLandmarks] = useState<any[] | null>(null);
  const [currentStep, setCurrentStep] =
    useState<FrontKickStep>("STANCE");
  const [feedback, setFeedback] = useState(
    "Stand relaxed prepare to move"
  );

  /* ---------- MediaPipe ---------- */
  useEffect(() => {
    if (!videoRef.current) return;

    initPose(videoRef.current, (results: Results) => {
      if (results.poseLandmarks) {
        const smooth = smoothLandmarks(results.poseLandmarks);
        setLandmarks(smooth);

        // send pose to backend
        socketRef.current?.send(
          JSON.stringify({ landmarks: smooth })
        );
      }
    });
  }, []);
  /* ------------------------------- */

  /* ---------- WebSocket ---------- */
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/pose");
    socketRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.step) setCurrentStep(data.step);
      if (data.feedback) setFeedback(data.feedback);
    };

    return () => ws.close();
  }, []);
  /* ------------------------------- */

  return (
    <>
      <CameraView ref={videoRef} />

      <CoachingLayout
        feedback={<FeedbackBar message={feedback} />}
        skeleton={
          <SkeletonRenderer
            landmarks={landmarks}
            step={currentStep}
          />
        }
        steps={
          <StepFlow
            steps={FRONT_KICK_STEPS}
            currentStep={currentStep}
          />
        }
      />
    </>
  );
}
