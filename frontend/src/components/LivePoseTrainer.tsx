import { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

type Landmark = { x: number; y: number };

type Targets = {
  [step: string]: {
    [jointIndex: string]: { x: number; y: number };
  };
};

const MAIN_POINTS = [
  11, 12, 23, 24, 25, 26, 27, 28,
];

const BONES: [number, number][] = [
  [11, 12],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28],
];

export default function LivePoseTrainer({
  currentStep,
  targets,
  onChange,
  onStepComplete,
}: {
  currentStep: string;
  targets: Targets;
  onChange: (landmarks: Landmark[]) => void;
  onStepComplete: () => void;
}) {

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [landmarks, setLandmarks] =
    useState<Landmark[]>([]);

  const [tolerance, setTolerance] =
    useState(0.05);

  const [stepLocked, setStepLocked] =
    useState(false);

  const lastSentRef = useRef(0);

  /* ---------------- MEDIAPIPE INIT ---------------- */

  useEffect(() => {
    if (!videoRef.current) return;

    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    pose.onResults((results) => {
      if (!results.poseLandmarks) return;

      const mapped = results.poseLandmarks.map(
        (lm) => ({
          x: lm.x,
          y: lm.y,
        })
      );

      setLandmarks(mapped);

      // Throttle WebSocket (10 FPS)
      const now = Date.now();
      if (now - lastSentRef.current > 100) {
        onChange(mapped);
        lastSentRef.current = now;
      }
    });

    const camera = new Camera(
      videoRef.current,
      {
        onFrame: async () => {
          await pose.send({
            image: videoRef.current!,
          });
        },
        width: 640,
        height: 480,
      }
    );

    camera.start();

    return () => {
      camera.stop();
    };
  }, []);

  /* ---------------- DRAW EFFECT ---------------- */

  useEffect(() => {
    draw();
    checkCompletion();
  }, [landmarks, currentStep]);

  /* ---------------- STEP CHECK ---------------- */

  const checkCompletion = () => {
    if (!targets || !targets[currentStep]) return;
    if (stepLocked) return;
    if (!landmarks.length) return;

    const target = targets[currentStep];

    const allMatched = Object.entries(
      target
    ).every(([idx, pt]) => {
      const i = Number(idx);
      const lm = landmarks[i];
      if (!lm) return false;

      const dx = lm.x - pt.x;
      const dy = lm.y - pt.y;

      return (
        Math.sqrt(
          dx * dx + dy * dy
        ) < tolerance
      );
    });

    if (allMatched) {
      setStepLocked(true);

      setTimeout(() => {
        onStepComplete();
      }, 700);
    }
  };

  useEffect(() => {
    setStepLocked(false);
  }, [currentStep]);

  /* ---------------- DRAW ---------------- */

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !landmarks.length) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    const target = targets?.[currentStep];

    /* ---- Draw Target Points ---- */
    if (target) {
      Object.values(target).forEach(
        (pt) => {
          ctx.beginPath();
          ctx.arc(
            pt.x * canvas.width,
            pt.y * canvas.height,
            8,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = "green";
          ctx.fill();
        }
      );
    }

    /* ---- Draw Bones ---- */
    BONES.forEach(([a, b]) => {
      const p1 = landmarks[a];
      const p2 = landmarks[b];
      if (!p1 || !p2) return;

      ctx.beginPath();
      ctx.moveTo(
        p1.x * canvas.width,
        p1.y * canvas.height
      );
      ctx.lineTo(
        p2.x * canvas.width,
        p2.y * canvas.height
      );
      ctx.strokeStyle = "white";
      ctx.stroke();
    });

    /* ---- Draw Joints ---- */
    MAIN_POINTS.forEach((i) => {
      const pt = landmarks[i];
      if (!pt) return;

      let color = "red";

      if (target && target[i]) {
        const dx =
          pt.x - target[i].x;
        const dy =
          pt.y - target[i].y;

        if (
          Math.sqrt(
            dx * dx + dy * dy
          ) < tolerance
        ) {
          color = "blue";
        }
      }

      ctx.beginPath();
      ctx.arc(
        pt.x * canvas.width,
        pt.y * canvas.height,
        6,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = color;
      ctx.fill();
    });
  };

  return (
    <div>
      {/* Hidden video */}
      <video
        ref={videoRef}
        style={{ display: "none" }}
      />

      <canvas
        ref={canvasRef}
        width={1000}
        height={500}
        style={{
          background:
            "radial-gradient(circle, #141414, #000)",
          borderRadius: 12,
          boxShadow:
            "0 0 25px rgba(46,204,113,0.3)",
        }}
      />

      <div
        style={{
          marginTop: 10,
          color: "#aaa",
          fontSize: 12,
        }}
      >
        Tolerance:
        <input
          type="range"
          min="0.02"
          max="0.15"
          step="0.01"
          value={tolerance}
          onChange={(e) =>
            setTolerance(
              Number(e.target.value)
            )
          }
        />
      </div>
    </div>
  );
}
