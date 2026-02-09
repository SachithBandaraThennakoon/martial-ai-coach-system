import { useEffect, forwardRef } from "react";

const CameraView = forwardRef<HTMLVideoElement>((_, ref) => {
  useEffect(() => {
    async function setupCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      if (ref && typeof ref !== "function") {
        ref.current!.srcObject = stream;
        ref.current!.play();
      }
    }

    setupCamera();
  }, [ref]);

  return <video ref={ref} style={{ display: "none" }} playsInline />;
});

export default CameraView;
