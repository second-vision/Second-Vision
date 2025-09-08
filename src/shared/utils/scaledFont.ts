// src/shared/utils/scaledFont.ts
import { useSettings } from "@/src/shared/context/SettingsContext";

export const useScaledFont = () => {
  const { fontSize } = useSettings();

  /**
   * Calcula tamanho escalado mantendo a proporcionalidade
   * @param baseSize tamanho base do texto (ex: 14, 16, 18)
   */
  const scale = (baseSize: number) => {
    const defaultBase = 16; // tamanho padrão do fontSize
    return Math.round((baseSize / defaultBase) * fontSize);
  };

  return { scale };
};
