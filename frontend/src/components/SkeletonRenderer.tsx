import { useRef, useEffect } from "react";
import { FRONT_KICK_TARGETS } from "../techniques/frontKick/targetPoses";

type Landmark = {
  x: number;
  y: number;
};

const MATCH_THRESHOLD = 0.05;

export default function SkeletonRenderer({
  landmarks,
  step,
}: {
  landmarks: Landmark[] | null;
  step: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!landmarks || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d")!;
    ctx.clearRect(0, 0, 640, 480);

    const target = FRONT_KICK_TARGETS[step];

    // 🟢 Draw target skeleton
    if (target) {
      Object.entries(target).forEach(([idx, pt]) => {
        ctx.beginPath();
        ctx.arc(pt.x * 640, pt.y * 480, 6, 0, Math.PI * 2);
        ctx.fillStyle = "green";
        ctx.globalAlpha = 0.6;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
    }

    // 🔴 Live skeleton
    landmarks.forEach((pt, i) => {
      let color = "red";

      if (target && target[i]) {
        const dx = pt.x - target[i].x;
        const dy = pt.y - target[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MATCH_THRESHOLD) {
          color = "blue"; // 🔵 matched
        }
      }

      ctx.beginPath();
      ctx.arc(pt.x * 640, pt.y * 480, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });
  }, [landmarks, step]);

  return <canvas ref={canvasRef} width={640} height={480} />;
}
