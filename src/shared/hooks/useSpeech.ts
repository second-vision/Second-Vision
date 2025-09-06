// src/shared/hooks/useSpeech.ts
import { useRef } from "react";
import * as Speech from "expo-speech";

export function useSpeech(interval: number) {
  const isSpeakingRef = useRef<boolean>(false);
  const hasAnnouncedOnce = useRef<boolean>(false);
  const hasAnnouncedOnceReverse = useRef<boolean>(true);

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const processSpeakQueue = async (text: string) => {
    await Speech.speak(text, { language: "pt-BR" });
    await delay(interval * 1000);
    isSpeakingRef.current = false;
  };

  /**
   * Fala um texto. 
   * @param text Texto para falar
   * @param mode 0 = sempre fala por cima da fila e sem intervalo / 1 = respeita fila com intervalo de fala definido
   */
  const speak = async (text: string, mode: number = 0) => {
    if (mode === 1) {
      if (!isSpeakingRef.current) {
        isSpeakingRef.current = true;
        await processSpeakQueue(text);
      }
    } else if (mode === 0) {
      if (isSpeakingRef.current) {
        await Speech.speak(text, { language: "pt-BR" });
      } else {
        isSpeakingRef.current = true;
        await Speech.speak(text, { language: "pt-BR" });
        isSpeakingRef.current = false;
      }
    }
  };

  const stop = () => {
    Speech.stop();
    isSpeakingRef.current = false;
  };

  return {
    speak,
    stop,
    hasAnnouncedOnce,
    hasAnnouncedOnceReverse
  };
}
