import { useEffect } from "react";

export default function useVoiceFeedback(
  text: string
) {
  useEffect(() => {
    if (!text) return;

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.rate = 0.9; // slower
    utterance.pitch = 0.9; // calmer
    utterance.volume = 1;

    const voices =
      speechSynthesis.getVoices();

    const calmVoice = voices.find((v) =>
      v.name.toLowerCase().includes("male")
    );

    if (calmVoice)
      utterance.voice = calmVoice;

    speechSynthesis.speak(utterance);
  }, [text]);
}
