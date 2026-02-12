import { useEffect, useRef, useState } from "react";

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
  /* ---------------- HOOKS ---------------- */

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [landmarks, setLandmarks] =
    useState<Landmark[]>(createDefaultPose());

  const [dragIndex, setDragIndex] =
    useState<number | null>(null);

  const [tolerance, setTolerance] =
    useState(0.05);

  const [stepLocked, setStepLocked] =
    useState(false);

  /* ---------------- DRAW EFFECT ---------------- */

  useEffect(() => {
    draw();
    onChange(landmarks);
    checkCompletion();
  }, [landmarks, currentStep]);

  /* ---------------- STEP CHECK ---------------- */

  const checkCompletion = () => {
    if (!targets || !targets[currentStep]) return;
    if (stepLocked) return;

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

    if (allMatched && !stepLocked) {
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

    /* ---- Draw Target Points ---- */
    if (target) {
      Object.values(target).forEach(
        (pt) => {
          ctx.beginPath();
          ctx.arc(
            pt.x *
              canvas.width,
            pt.y *
              canvas.height,
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

    /* ---- Draw Joints ---- */
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
    e: React.MouseEvent
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
    e: React.MouseEvent
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

  /* ---------------- RENDER ---------------- */

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{
          background:
            "radial-gradient(circle, #141414, #000)",
          borderRadius: 12,
          boxShadow:
            "0 0 25px rgba(46,204,113,0.3)",
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
              Number(
                e.target.value
              )
            )
          }
        />
      </div>
    </div>
  );
}
