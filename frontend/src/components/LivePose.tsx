import { useEffect, useRef } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

type Props = {
  onChange: (landmarks: any[]) => void;
};

export default function LivePose({ onChange }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      const ctx =
        canvasRef.current!.getContext("2d")!;
      ctx.clearRect(
        0,
        0,
        canvasRef.current!.width,
        canvasRef.current!.height
      );

      if (results.poseLandmarks) {
        drawSkeleton(
          ctx,
          results.poseLandmarks
        );
        onChange(results.poseLandmarks);
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

  const drawSkeleton = (
    ctx: CanvasRenderingContext2D,
    landmarks: any[]
  ) => {
    landmarks.forEach((lm) => {
      ctx.beginPath();
      ctx.arc(
        lm.x * 640,
        lm.y * 480,
        5,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = "red";
      ctx.fill();
    });
  };

  return (
    <>
      <video
        ref={videoRef}
        style={{ display: "none" }}
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{
          borderRadius: 8,
          background: "#000",
        }}
      />
    </>
  );
}
