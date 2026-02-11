import { useRef, useEffect, useState } from "react";

type Landmark = { x: number; y: number };

export default function SkeletonRenderer({
  landmarks,
  setLandmarks,
  simulation,
}: {
  landmarks: Landmark[];
  setLandmarks: any;
  simulation?: boolean;
  step?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const width = 640;
  const height = 480;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    landmarks.forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x * width, pt.y * height, 6, 0, Math.PI * 2);
      ctx.fillStyle = "red";
      ctx.fill();
    });
  }, [landmarks]);

  const handleMouseDown = (e: any) => {
    if (!simulation) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / width;
    const my = (e.clientY - rect.top) / height;

    landmarks.forEach((pt, i) => {
      const dx = pt.x - mx;
      const dy = pt.y - my;
      if (Math.sqrt(dx * dx + dy * dy) < 0.04) {
        setDragIndex(i);
      }
    });
  };

  const handleMouseMove = (e: any) => {
    if (dragIndex === null) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / width;
    const my = (e.clientY - rect.top) / height;

    const updated = [...landmarks];
    updated[dragIndex] = { x: mx, y: my };
    setLandmarks(updated);
  };

  const handleMouseUp = () => setDragIndex(null);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ background: "#222" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  );
}
