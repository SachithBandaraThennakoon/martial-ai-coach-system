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

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [landmarks, setLandmarks] = useState<any[] | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const currentStep: FrontKickStep =
    FRONT_KICK_STEPS[stepIndex];

  useEffect(() => {
    if (!videoRef.current) return;

    initPose(videoRef.current, (results: Results) => {
      if (results.poseLandmarks) {
        setLandmarks(results.poseLandmarks);
      }
    });
  }, []);

  return (
    <>
      <CameraView ref={videoRef} />

      <CoachingLayout
        feedback={
          <FeedbackBar message="Lift knee before extending" />
        }
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

      {/* TEMP: manual step control */}
      <button
        style={{ position: "fixed", bottom: 20, left: 20 }}
        onClick={() =>
          setStepIndex((i) => (i + 1) % FRONT_KICK_STEPS.length)
        }
      >
        Next Step
      </button>
    </>
  );
}
