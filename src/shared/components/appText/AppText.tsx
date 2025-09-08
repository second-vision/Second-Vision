// src/shared/components/appText/AppText.tsx
import React from "react";
import { Text, TextProps } from "react-native";
import { useScaledFont } from "@/src/shared/utils/scaledFont";

interface AppTextProps extends TextProps {
  baseSize?: number; // tamanho base do texto
}

export const AppText: React.FC<AppTextProps> = ({
  baseSize = 16,
  style,
  children,
  ...props
}) => {
  const { scale } = useScaledFont();
  return (
    <Text style={[{ fontSize: scale(baseSize) }, style]} {...props}>
      {children}
    </Text>
  );
};
