import { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

type Landmark = { x: number; y: number };

type Targets = {
  [step: string]: {
    [jointIndex: string]: { x: number; y: number };
  };
};

/* ---------------- BODY BONES ---------------- */

/* ================= BODY SKELETON ================= */

const BODY_BONES: [number, number][] = [

  /* ---- Face ---- */
  [0, 1], [1, 2], [2, 3], [3, 7],
  [0, 4], [4, 5], [5, 6], [6, 8],

  /* ---- Shoulders ---- */
  [11, 12],

  /* ---- Arms ---- */
  [11, 13], [13, 15],   // Left arm
  [12, 14], [14, 16],   // Right arm

  /* ---- Torso ---- */
  [11, 23],
  [12, 24],
  [23, 24],

  /* ---- Legs ---- */
  [23, 25], [25, 27],   // Left leg
  [24, 26], [26, 28],   // Right leg

  /* ---- Feet ---- */
  [27, 29], [29, 31],   // Left foot
  [28, 30], [30, 32],   // Right foot
];

/* ---------------- SIMPLE HAND CONNECTIONS ---------------- */
/* Only draw main finger chains (not all 21) */

/* ================= HAND SKELETON ================= */

const SIMPLE_HAND_BONES: [number, number][] = [

  /* ---- Palm spine ---- */
  [0, 5], [5, 9], [9, 13], [13, 17],

  /* ---- Thumb ---- */
  [0, 1], [1, 2], [2, 3], [3, 4],

  /* ---- Index ---- */
  [5, 6], [6, 7], [7, 8],

  /* ---- Middle ---- */
  [9, 10], [10, 11], [11, 12],

  /* ---- Ring ---- */
  [13, 14], [14, 15], [15, 16],

  /* ---- Pinky ---- */
  [17, 18], [18, 19], [19, 20],
];

/* -------------------------------------------------------- */

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

  const [bodyLandmarks, setBodyLandmarks] = useState<Landmark[]>([]);
  const [leftHand, setLeftHand] = useState<Landmark[] | null>(null);
  const [rightHand, setRightHand] = useState<Landmark[] | null>(null);

  const [tolerance, setTolerance] = useState(0.05);
  const [stepLocked, setStepLocked] = useState(false);

  const lastSendRef = useRef(0);

  /* ------------------------------------------------ */
  /* MEDIAPIPE INIT (FIXED ASYNC ISSUE)              */
  /* ------------------------------------------------ */

  useEffect(() => {
    if (!videoRef.current) return;

    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
    });

    pose.onResults((results) => {
      if (!results.poseLandmarks) return;

      const mapped = results.poseLandmarks.map(lm => ({
        x: lm.x,
        y: lm.y,
      }));

      setBodyLandmarks(mapped);

      const now = Date.now();
      if (now - lastSendRef.current > 100) {
        onChange(mapped);
        lastSendRef.current = now;
      }
    });

    hands.onResults((results) => {
      if (results.multiHandLandmarks) {
        setLeftHand(results.multiHandLandmarks[0] || null);
        setRightHand(results.multiHandLandmarks[1] || null);
      }
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await pose.send({ image: videoRef.current! });
        await hands.send({ image: videoRef.current! });
      },
      width: 960,
      height: 540,
    });

    camera.start();

    return () => {
      camera.stop();
    };
  }, []);

  /* ------------------------------------------------ */
  /* DRAW                                             */
  /* ------------------------------------------------ */

  useEffect(() => {
    draw();
    checkCompletion();
  }, [bodyLandmarks, leftHand, rightHand, currentStep]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !bodyLandmarks.length) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* ----- Draw Target Points ----- */
    const target = targets?.[currentStep];
    if (target) {
      Object.values(target).forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 10, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(46,204,113,0.7)";
        ctx.fill();
      });
    }

    /* ----- Draw Body Bones ----- */
    BODY_BONES.forEach(([a, b]) => {
      const p1 = bodyLandmarks[a];
      const p2 = bodyLandmarks[b];
      if (!p1 || !p2) return;

      ctx.beginPath();
      ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
      ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
      ctx.strokeStyle = "#00f7ff";
      ctx.lineWidth = 3;
      ctx.stroke();
    });

    /* ----- Draw Body Joints ----- */
    bodyLandmarks.forEach(pt => {
      ctx.beginPath();
      ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    });

    /* ----- Draw Hands (Simplified) ----- */
    const drawHand = (hand: Landmark[] | null) => {
      if (!hand) return;

      SIMPLE_HAND_BONES.forEach(([a, b]) => {
        const p1 = hand[a];
        const p2 = hand[b];
        if (!p1 || !p2) return;

        ctx.beginPath();
        ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
        ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
        ctx.strokeStyle = "#ffcc00";
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    };

    drawHand(leftHand);
    drawHand(rightHand);
  };

  /* ------------------------------------------------ */
  /* STEP COMPLETION                                 */
  /* ------------------------------------------------ */

  const checkCompletion = () => {
    if (!targets?.[currentStep]) return;
    if (!bodyLandmarks.length || stepLocked) return;

    const target = targets[currentStep];

    const matched = Object.entries(target).every(([idx, pt]) => {
      const lm = bodyLandmarks[Number(idx)];
      if (!lm) return false;

      const dx = lm.x - pt.x;
      const dy = lm.y - pt.y;
      return Math.sqrt(dx * dx + dy * dy) < tolerance;
    });

    if (matched) {
      setStepLocked(true);
      setTimeout(() => {
        onStepComplete();
      }, 700);
    }
  };

  useEffect(() => {
    setStepLocked(false);
  }, [currentStep]);

  /* ------------------------------------------------ */

  return (
    <div>
      <video ref={videoRef} style={{ display: "none" }} />

      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        style={{
          background: "radial-gradient(circle, #0f0f0f, #000)",
          borderRadius: 16,
          boxShadow: "0 0 40px rgba(0,255,255,0.3)",
        }}
      />

      <div style={{ marginTop: 10, color: "#aaa" }}>
        Tolerance:
        <input
          type="range"
          min="0.02"
          max="0.15"
          step="0.01"
          value={tolerance}
          onChange={(e) => setTolerance(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
