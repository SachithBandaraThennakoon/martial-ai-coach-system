import { useEffect, useRef, useState } from "react";

type Landmark = { x: number; y: number };

type Targets = {
  [step: string]: {
    [jointIndex: string]: { x: number; y: number };
  };
};

const MAIN_POINTS = [
  11, 12, 23, 24, 25, 26, 27, 28
];

const BONES: [number, number][] = [
  [11, 12],
  [23, 24],
  [11, 23],
  [12, 24],
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28],
];

function createDefaultPose(): Landmark[] {
  const pose = Array.from({ length: 33 }, () => ({
    x: 0.5,
    y: 0.5,
  }));

  pose[23] = { x: 0.45, y: 0.7 };
  pose[24] = { x: 0.55, y: 0.7 };
  pose[25] = { x: 0.45, y: 0.85 };
  pose[26] = { x: 0.55, y: 0.85 };
  pose[11] = { x: 0.45, y: 0.5 };
  pose[12] = { x: 0.55, y: 0.5 };

  return pose;
}

function calculateKneeAngle(pose: Landmark[]) {
  const hip = pose[24];
  const knee = pose[26];
  const ankle = pose[28];

  const a = Math.atan2(
    hip.y - knee.y,
    hip.x - knee.x
  );
  const b = Math.atan2(
    ankle.y - knee.y,
    ankle.x - knee.x
  );

  let angle =
    Math.abs((a - b) * (180 / Math.PI));
  if (angle > 180) angle = 360 - angle;

  return Math.round(angle);
}

export default function PoseSimulator({
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [landmarks, setLandmarks] =
    useState<Landmark[]>(createDefaultPose());

  const [dragIndex, setDragIndex] =
    useState<number | null>(null);

  const [tolerance, setTolerance] =
    useState(0.05);

  const [autoPlay, setAutoPlay] =
    useState(false);

  const [repCount, setRepCount] =
    useState(0);

  const [stepLocked, setStepLocked] =
    useState(false);

  /* ---------------- AUTO ANIMATION ---------------- */

  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      const target =
        targets?.[currentStep];

      if (!target) return;

      const updated = [...landmarks];

      Object.entries(target).forEach(
        ([idx, pt]) => {
          const i = Number(idx);
          updated[i] = {
            x: pt.x,
            y: pt.y,
          };
        }
      );

      setLandmarks(updated);
    }, 800);

    return () => clearInterval(interval);
  }, [autoPlay, currentStep]);

  /* ---------------- DRAW LOOP ---------------- */

  useEffect(() => {
    draw();
    onChange(landmarks);
    checkCompletion();
  }, [landmarks, currentStep, tolerance]);

  const checkCompletion = () => {
    const target =
      targets?.[currentStep];
    if (!target || stepLocked) return;

    const allMatched =
      Object.entries(target).every(
        ([idx, pt]) => {
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
        }
      );

    if (allMatched) {
      setStepLocked(true);

      setTimeout(() => {
        onStepComplete();
        setStepLocked(false);
      }, 400);
    }
  };

  const draw = () => {
    const canvas =
      canvasRef.current;
    if (!canvas) return;

    const ctx =
      canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    const target =
      targets?.[currentStep];

    /* ---- Draw Target ---- */
    if (target) {
      Object.entries(target).forEach(
        ([_, pt]) => {
          ctx.beginPath();
          ctx.arc(
            pt.x * canvas.width,
            pt.y * canvas.height,
            8,
            0,
            Math.PI * 2
          );
          ctx.fillStyle =
            "green";
          ctx.fill();
        }
      );
    }

    /* ---- Draw Bones ---- */
    BONES.forEach(([a, b]) => {
      const p1 =
        landmarks[a];
      const p2 =
        landmarks[b];

      if (!p1 || !p2) return;

      ctx.beginPath();
      ctx.moveTo(
        p1.x *
          canvas.width,
        p1.y *
          canvas.height
      );
      ctx.lineTo(
        p2.x *
          canvas.width,
        p2.y *
          canvas.height
      );
      ctx.strokeStyle =
        "white";
      ctx.stroke();
    });

    /* ---- Draw Points ---- */
    MAIN_POINTS.forEach((i) => {
      const pt =
        landmarks[i];
      if (!pt) return;

      let color = "red";

      if (
        target &&
        target[i]
      ) {
        const dx =
          pt.x -
          target[i].x;
        const dy =
          pt.y -
          target[i].y;

        if (
          Math.sqrt(
            dx * dx +
              dy * dy
          ) < tolerance
        ) {
          color = "blue";
        }
      }

      ctx.beginPath();
      ctx.arc(
        pt.x *
          canvas.width,
        pt.y *
          canvas.height,
        6,
        0,
        Math.PI * 2
      );
      ctx.fillStyle =
        color;
      ctx.fill();
    });
  };

  /* ---------------- MOUSE CONTROL ---------------- */

  const handleMouseDown = (
    e: any
  ) => {
    const rect =
      canvasRef.current!.getBoundingClientRect();

    const mx =
      (e.clientX -
        rect.left) /
      rect.width;
    const my =
      (e.clientY -
        rect.top) /
      rect.height;

    MAIN_POINTS.forEach(
      (i) => {
        const pt =
          landmarks[i];
        if (!pt) return;

        if (
          Math.hypot(
            pt.x - mx,
            pt.y - my
          ) < 0.03
        ) {
          setDragIndex(i);
        }
      }
    );
  };

  const handleMouseMove = (
    e: any
  ) => {
    if (dragIndex === null)
      return;

    const rect =
      canvasRef.current!.getBoundingClientRect();

    const mx =
      (e.clientX -
        rect.left) /
      rect.width;
    const my =
      (e.clientY -
        rect.top) /
      rect.height;

    const updated =
      [...landmarks];
    updated[dragIndex] = {
      x: mx,
      y: my,
    };

    setLandmarks(updated);
  };

  const handleMouseUp = () =>
    setDragIndex(null);

  const kneeAngle =
    calculateKneeAngle(
      landmarks
    );

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={1200}
        height={720}
        style={{
          background: "#111",
        }}
        onMouseDown={
          handleMouseDown
        }
        onMouseMove={
          handleMouseMove
        }
        onMouseUp={
          handleMouseUp
        }
      />

      {/* Debug Panel */}
      <div
        style={{
          color: "#aaa",
          marginTop: 8,
        }}
      >
        Knee Angle:{" "}
        {kneeAngle}°
        <br />
        Tolerance:
        <input
          type="range"
          min="0.02"
          max="0.15"
          step="0.01"
          value={tolerance}
          onChange={(e) =>
            setTolerance(
              Number(
                e.target.value
              )
            )
          }
        />
        <br />
        <button
          onClick={() =>
            setAutoPlay(
              !autoPlay
            )
          }
        >
          {autoPlay
            ? "Stop Auto"
            : "Auto Play"}
        </button>
        <br />
        Reps: {repCount}
      </div>
    </div>
  );
}
