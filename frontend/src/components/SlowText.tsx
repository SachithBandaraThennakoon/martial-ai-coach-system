import { useEffect, useState } from "react";

export default function SlowText({
  text,
}: {
  text: string;
}) {
  const [display, setDisplay] =
    useState("");

  useEffect(() => {
    let i = 0;
    setDisplay("");

    const interval = setInterval(() => {
      setDisplay((prev) =>
        prev + text.charAt(i)
      );
      i++;
      if (i >= text.length)
        clearInterval(interval);
    }, 40); // speed control

    return () => clearInterval(interval);
  }, [text]);

  return <>{display}</>;
}
